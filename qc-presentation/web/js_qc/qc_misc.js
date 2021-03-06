//Ajusta a largura do Body
function ajustaBodyW(pixels){   
    pixels = parseInt(pixels);
    var bodyAtual = $('body').css('width');        
    bodyAtual = parseInt(bodyAtual.substring(0,(bodyAtual.length - 2)));
    bodyAtual = bodyAtual + pixels;
    $('body').css('width', bodyAtual);
}


//Ajusta o a altura do Body
function ajustaBodyH(pixels){   
    pixels = parseInt(pixels);
    var bodyAtual = $('body').css('height');        
    bodyAtual = parseInt(bodyAtual.substring(0,(bodyAtual.length - 2)));
    bodyAtual = bodyAtual + pixels;
    $('body').css('height', bodyAtual);
}

//Parser da DIV de Texto que recebe a URN como nome, por padrão
function parse_divURN (urn) {
    var pontos = urn.replace (/:/g, "_");
    var pontov = pontos.replace (/;/g, "_");
    var traco = pontov.replace (/-/g, "_");
    var ponto =  traco.replace (/\./, "_");
    var arroba =  ponto.replace (/@/g, "_");
    var novaURN = arroba;				
    return novaURN;
}

//abre Janela Modal - Comentários
function showJanelaComenario(idpai){
   // alert(idpai);   
   
   $("#dialog-comentario").dialog({
            resizable: false,
            modal: true,
            width: 1000,
            height: 650});
        
        console.log('Abre janela');
    
} 








//Abre Janela Modal - Criação de URNs para os textos
function formModalOpen(urn, isEdit, onCloseCallback){
    
    $('#formLegislacao')[0].reset();
    
    var urnAntiga = urn;
    
    $("#modalForm").dialog({
        resizable: false, 
        modal:true, 
        draggable:false, 
        width: '70%', 
        height:600, 
        title:'Montagem da URN do Texto',
        open: function(event, ui) {
          
            if (textoAtualModal) {
                $("#Categorias").val(textoAtualModal.categorias);
                $("#Categorias").change();
                $("#Localidades").val(textoAtualModal.localidades);
                $("#Localidades").change();
                $("#Autoridades").val(textoAtualModal.autoridades);
                $("#Autoridades").change();
                $("#AutoridadesFilhas").val(textoAtualModal.autoridadesFilhas);
                $("#AutoridadesFilhas").change();
                $("#comissaoespecial").val(textoAtualModal.comissaoespecial);
                $("#comissaoespecial").change();
                $("#TiposDocumento").val(textoAtualModal.tiposDocumento);
                $("#TiposDocumento").change();
                $("#numero").val(textoAtualModal.numero);
                $("#numero").change();
                $("#dataAssinatura").val(textoAtualModal.dataAssinatura);
                $("#dataAssinatura").change();
                $("#ComponenteDocumento").val(textoAtualModal.componenteDocumento);
                $("#ComponenteDocumento").change();
                
                $("#numeroComponente").val(textoAtualModal.numeroComponente);
                $("#anoComponente").val(textoAtualModal.anoComponente);
                $("#SiglaColegiado").val(textoAtualModal.siglaColegiado);
                $("#versao").val(textoAtualModal.versao);
                $("#versao").change();
                $("#dataVigente").val(textoAtualModal.dataVigente);
                
                $("#Evento").val(textoAtualModal.evento);
                $("#Evento").change();
                $("#dataEvento").val(textoAtualModal.dataEvento);
            }
        },
        close: function(event, ui) {           
          
            if (onCloseCallback) {
                onCloseCallback();
            }
            
            if(textoAtualModal){
                
                //Só adiciona um novo texto se não existir uma URN igual
                if($("#"+textoAtualModal.urnIdDIV).length == 0){
                    
                    var urnIdDIVAntiga = parse_divURN(urnAntiga);

                    //Modifica o ID do Texto originário
                    if (isEdit) {
                        $("#" + urnIdDIVAntiga).attr("id", textoAtualModal.urnIdDIV);
                        atualizaIdConexoes(urnIdDIVAntiga, textoAtualModal.urnIdDIV);
                        atualizaIdCorrelacao(quadro.id, urnAntiga, textoAtualModal.urn);
                        
                    } else {
                        $("#URNTEXTONOVO").attr("id", textoAtualModal.urnIdDIV); 
                    }
                    
                    $("#"+ textoAtualModal.urnIdDIV).attr({urn: textoAtualModal.urn});
                    
                    //Adiciona os Endpoints do Plumb na criação do novo texto
                    addEndpoints(textoAtualModal.urnIdDIV, [[1, 0.2, 1, 0.5],[0, 0.2, 1, 0.5]]);
                    
                    //Seta urn ao atributo URN da DIV
                    $("#"+textoAtualModal.urnIdDIV).attr("urn", textoAtualModal.urn); 

                    //Modifica o título do novo texto
                    $("#"+textoAtualModal.urnIdDIV + " h2").html(textoAtualModal.titulo);
                    
                    //Modifica o link do lexml
                    $("#"+textoAtualModal.urnIdDIV + " .linkLexml").attr("href",
                        "http://www.lexml.gov.br/urn/" + textoAtualModal.urn);
                    
                } else if (!isEdit) {
                    $("#URNTEXTONOVO").remove();                    
                    showAlertDialog("Não foi possível adicionar o Texto. Já existe um texto com esta URN.");
                }
                
            }
            
            
              
        }
    });
}

function atualizaIdConexoes(urnAntiga, urnNova) {
    
    $.each(quadro.conexoes, function (index, conn) {
        //alert(conexao.sourceId + " === " + conn.sourceId);
        //alert(conexao.targetId + " === " + conn.targetId);

        if (conn.sourceId == urnAntiga) {
            conn.sourceId = urnNova;
        }
            
        if (conn.targetId == urnAntiga) {
            conn.targetId = urnNova;
        }
    });
    
    saveQuadro();
}

function atualizaIdCorrelacao(qcId, urnAntiga, urnNova, callback) {
    
    //substitui ; por __ porque tudo o que está após o caracter ; desaparece 
    while(urnAntiga.match(";")) {
        urnAntiga = urnAntiga.replace(";", "__");
    }
    
    $.ajax({
        url: '/api/correlacao/updateid/' + qcId + '/' + urnAntiga,
        type: 'POST',
        data: urnNova,
        dataType: "html",
        contentType: "application/json; charset=utf-8"
        
    }).done(function() {
        
    }).fail(function(){
        //alert("Bad thing happend! " + res.statusText);
    }).always(function() {
        if (callback) {
            callback();
        }
    });
}

function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '='
        + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g,'%20')) || null;
}

function saveQuadro() {
    $.ajax({
        url: '/api/qc/',
        type:'POST',
        data: JSON.stringify(quadro),
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        success:function(res){
            alert("it works!");
        },
        error:function(res){
        //alert("Bad thing happend! " + res.statusText);
        }
    });
}

function getTextoByURN(quadro, urn) {
    
    var texto;
    
    $.each(quadro.colunas, function (ic, col) {
                   
        if (col.textos) {

            $.each(col.textos, function (it, txt) {

                if (txt.urn == urn) {
                    texto = txt;
                }
            });

        }
    });
    
    return texto;
}

function replaceTexto(quadro, urn, texto) {
    
    $.each(quadro.colunas, function (ic, col) {
                   
        if (col.textos) {

            $.each(col.textos, function (it, txt) {

                if (txt.urn == urn) {
                    
                    col.textos[it] = texto;
                }
            });

        }
    });
    
}

function removeFromArray(arr) {
    var what, a = arguments, L = a.length, ax;
    while (L > 1 && arr.length) {
        what = a[--L];
        while ((ax= arr.indexOf(what)) !== -1) {
            arr.splice(ax, 1);
        }
    }
    return arr;
}

//Padrão
function showConfirmDialog(text, okCallback, params) {
    $("#confirm-text").html(text);
    $("#dialog-confirm").dialog({
        resizable: false,
        modal: true,
        width: 400, 
        buttons: {
            "OK": function() {
                $( this ).dialog( "close" );
                
                if (okCallback) {
                    
                    okCallback(params);
                }
                
            },
            "Cancelar": function() {
                $( this ).dialog( "close" );
            }
        }
    });
}

