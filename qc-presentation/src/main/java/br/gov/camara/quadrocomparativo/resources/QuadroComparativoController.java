package br.gov.camara.quadrocomparativo.resources;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.util.Enumeration;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;
import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Marshaller;
import javax.xml.bind.Unmarshaller;

import util.clone.DeepCopy;
import br.gov.camara.quadrocomparativo.model.Coluna;
import br.gov.camara.quadrocomparativo.model.QuadroComparativo;
import br.gov.camara.quadrocomparativo.model.Texto;

public class QuadroComparativoController {
		
	private static final Logger log = Logger.getLogger(QuadroComparativoController.class.getName());
	
	static QuadroComparativo getQuadroComparativo(HttpServletRequest request, String id){
    	QuadroComparativo quadro = SessionController.get(request, id, QuadroComparativo.class);
    	    	    	
    	if (quadro == null){    		
    		File f = new File(QuadroComparativo.getFileName(id));
    		
    		if (f.exists()) {
    			quadro = getQuadroComparativo(f);
            }
    		
    		SessionController.save(request, id, quadro);
    	} 
    	
    	if(quadro == null) {
    		Enumeration<String> e = request.getAttributeNames();
    		StringBuilder sb = new StringBuilder();
    		while(e.hasMoreElements()) {
    			sb.append(", " + e.nextElement());
    		}
    	}
        
    	return quadro;
    }
    
    static QuadroComparativo getQuadroComparativo(File file) {
        
        try {
            
            JAXBContext jc = JAXBContext.newInstance(QuadroComparativo.class);
            Unmarshaller u = jc.createUnmarshaller();
                
            return (QuadroComparativo) u.unmarshal(file);
        } catch (JAXBException ex) {
        	log.log(Level.SEVERE, null, ex);
        }
        
        return null;
    } 

    static QuadroComparativo createQuadroComparativo(HttpServletRequest request) {
        Coluna col = new Coluna(null, "Nova Coluna");
        QuadroComparativo quadro = new QuadroComparativo();
        quadro.setTitulo("Novo quadro");
        quadro.addColuna(col);
        
        SessionController.save(request, quadro.getId(), quadro);
        
        return quadro;
    }
    
    static QuadroComparativo cloneWithoutArticulacoes(QuadroComparativo qc){
    	
    	//clonning
    	//Transformer t = new Transformer();
        //QuadroComparativo novoQC = t.transform(qc, new QuadroComparativo(), "allDocumentos", "fileName");
    	QuadroComparativo novoQC = (QuadroComparativo)DeepCopy.copy(qc);
    	
        if (novoQC.getColunas() != null) {
            for (Coluna col : novoQC.getColunas()) {

                if (col.getTextos() != null) {
                    for (Texto tex : col.getTextos()) {
                        
                        if (tex.getDocumento() != null) {
                            tex.setDocumentoParseado(true);
                        }else{
                            tex.setDocumentoParseado(false);
                        }
                        tex.setArticulacao(null);
                        tex.setArticulacaoXML(null);
                        tex.setDocumento(null);
                    }
                }
            }
        }
        
    	return novoQC;
    }
    
    static boolean deleteQuadroComparativo(HttpServletRequest request, String qcId){
    	File file = new File(QuadroComparativo.getFileName(qcId));
        if (file.delete()){
        	
        	SessionController.delete(request, qcId, QuadroComparativo.class);
        	
        	return true;
        }
        return false;
    }
    
    static boolean saveQuadroComparativo(HttpServletRequest request, QuadroComparativo qc){
    	return saveQuadroComparativo(request, qc, true);
    }
    
    static boolean saveQuadroComparativo(HttpServletRequest request, QuadroComparativo qc, boolean restauraArticulacoes){
    	QuadroComparativo qcAtual = getQuadroComparativo(request, qc.getId());
    	
    	boolean ok = true;
    	if (restauraArticulacoes){
    		ok = restauraArticulacoes(qc, qcAtual);    		
    	}
    	
    	if (ok){
    		SessionController.save(request, qc.getId(), qc);
    		
    		return saveQuadroToFile(qc);
    	}
    	
    	return false;
    }
    
    private static boolean restauraArticulacoes(QuadroComparativo quadro, QuadroComparativo qcAtual){
        // recupera articulacoes salvas anteriormente
        if (qcAtual != null) {
            
            if (quadro.getColunas() != null) {
                for (Coluna col : quadro.getColunas()) {

                    if (col.getTextos() != null) {
                        for (Texto tex : col.getTextos()) {
                            
                            if (tex.getArticulacao() == null || tex.getDocumento() == null) {
                            
                                Texto texAtual = qcAtual.getTexto(tex.getUrn());

                                if (texAtual != null) {
                                    tex.setArticulacao(texAtual.getArticulacao());
                                    tex.setDocumento(texAtual.getDocumento());
                                }
                            }
                        }
                    }
                }
            }
        }
        
        return true;
    }

    private static boolean  saveQuadroToFile(QuadroComparativo quadro){
        try {
            
            new File(quadro.getFileName()).delete();
            
            JAXBContext context = JAXBContext.newInstance(
                    QuadroComparativo.class);
            Marshaller m = context.createMarshaller();
            m.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, true);
            m.marshal(quadro, new FileOutputStream(quadro.getFileName()));
            
            return true;
            
        } catch (FileNotFoundException ex) {
            log.log(Level.SEVERE, null, ex);
        } catch (JAXBException ex) {
            log.log(Level.SEVERE, null, ex);
        }
        
        return false;
    }
    
	
}