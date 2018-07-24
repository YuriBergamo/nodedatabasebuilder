var XLSX = require('xlsx');
var workbook = XLSX.readFile('/home/yuribergamo/Downloads/Windows/Novas Implementações/Itaú/Procon/entidade_intermediadoras_novas_28032018.xlsx');

var db = require("./db/db");

function percorrePlanilhas() {
    console.log("PERCORRE PLANILHAS");
    for(var i =0; i<workbook.SheetNames.length; i++){
        var sheet_name = workbook.SheetNames[i];
        var listaRegistros = null;
        if(sheet_name == "Entidade Intermediadora"){
            console.log(sheet_name);
            listaRegistros = geraEntidadeIntermediadora(sheet_name);
            db.gravaComboArquivo(listaRegistros);
            break;
        }
    }
}

function geraSegmentoOrigemTipo(planilha) {

    var worksheet = workbook.Sheets[planilha];

    var numeroLinha = 2;
    var mapRetorno = {
        listaSegmento:[],
        listaOrigem:[],
        listaTipoPasta:[]
    };

    var ultimoSegmento = {};
    var ultimoOrigem = {};

    while (numeroLinha != 0){
        var cell_segmento = worksheet['A'+numeroLinha];
        var cell_origem = worksheet['B'+numeroLinha];
        var cell_tipoPasta = worksheet['C'+numeroLinha];

        if(cell_segmento == undefined || cell_segmento.v == undefined){
            numeroLinha =0;
        }else{
            var segmentoObjeto = {
                descricao:cell_segmento.v,
                tipo:"COMBO_ASYNC",
                entidade:"Segmento de negocio",
                carteira:"Seguradora"
            };
            if(segmentoObjeto.descricao != ultimoSegmento.descricao){
                mapRetorno.listaSegmento.push(segmentoObjeto);
                ultimoSegmento = segmentoObjeto;
            }
            var origemObjeto = {
                descricao:cell_origem.v,
                tipo:"COMBO_ASYNC",
                entidade:"Origem",
                carteira:"Seguradora",
                pai:segmentoObjeto
            };
            if(origemObjeto.descricao != ultimoOrigem.descricao){
                mapRetorno.listaOrigem.push(origemObjeto);
                ultimoOrigem = origemObjeto;
            }
            var tipoPastaObject = {
                descricao:cell_tipoPasta.v,
                tipo:"COMBO_ASYNC",
                entidade:"Tipo de pasta",
                carteira:"Seguradora",
                pai:origemObjeto
            };
            mapRetorno.listaTipoPasta.push(tipoPastaObject);

            numeroLinha++;
        }
    }
    console.log(mapRetorno);
    return mapRetorno;
}

function geraRegistrosGenericos(planilha) {
    var worksheet = workbook.Sheets[planilha];

    var numeroLinha = 2;
    var listaRetorno =[];
    while (numeroLinha != 0){
        var address_of_cell = 'A'+numeroLinha;
        var desired_cell = worksheet[address_of_cell];
        var valorCell = (desired_cell ? desired_cell.v : undefined);
        if(!valorCell){
            numeroLinha =0;
        }else{
            var obj = {
                descricao:valorCell
            };
            listaRetorno.push(obj);
            numeroLinha++;
        }
    }
    return listaRetorno;
}



function geraEntidadeIntermediadora(planilha) {
    var worksheet = workbook.Sheets[planilha];
    var numeroLinha = 2;
    var listaRetorno =[];
    var columns = ["A", "B", "C", "D"];
    var countEBI =0;
    var countUBB =0;

    while (numeroLinha != 0){
        var obj = {
            tipo:"COMBO_ASYNC",
            entidade:"Entidade Intermediadora",
            carteira:"PROCON_EBI",
            estado:"",
            descricao:"",
            idExterno:"",
            _class : "br.com.finchsolucoes.itau.data.infraestrutura.domain.CombosArquivoDomain"
        };
        var estado = worksheet[columns[0]+numeroLinha] ? worksheet[columns[0]+numeroLinha].v : undefined;
        var descricao = worksheet[columns[1]+numeroLinha] ? worksheet[columns[1]+numeroLinha].v : undefined;
        var idExternoUBB = worksheet[columns[2]+numeroLinha] ? worksheet[columns[2]+numeroLinha].v : undefined;
        var idExternoEBI = worksheet[columns[3]+numeroLinha] ? worksheet[columns[3]+numeroLinha].v : undefined;

        if(!estado){
            numeroLinha = 0;
        }else{
            obj.estado = estado;
            obj.descricao = descricao;
            if(idExternoEBI && idExternoUBB){
                //gera dois registros um para cada tipo
                var newObj = {
                    tipo:"COMBO_ASYNC",
                    entidade:"Entidade Intermediadora",
                    carteira:"PROCON_EBI",
                    estado:estado,
                    descricao:descricao,
                    idExterno:idExternoEBI,
                    _class : "br.com.finchsolucoes.itau.data.infraestrutura.domain.CombosArquivoDomain"
                };
                listaRetorno.push(newObj);
                countEBI++;

                obj.idExterno = idExternoUBB;
                obj.carteira = "PROCON_UBB";
                countUBB++;
                listaRetorno.push(obj);

            }else if(idExternoEBI){
                obj.idExterno = idExternoEBI;
                obj.carteira = "PROCON_EBI";
                listaRetorno.push(obj);
                countEBI++;
            }else if(idExternoUBB){
                obj.idExterno = idExternoUBB;
                obj.carteira = "PROCON_UBB";
                listaRetorno.push(obj);
                countUBB++;
            }

            numeroLinha++;
        }
    }
    console.log(JSON.stringify(listaRetorno));
    console.log(listaRetorno.length);
    console.log(countEBI);
    console.log(countUBB);
    return listaRetorno;
}


function geraOrgaoTratador(planilha) {
    var worksheet = workbook.Sheets[planilha];
    var numeroLinha = 2;
    var listaRetorno =[];
    var columns = ["A", "B"];
    while (numeroLinha != 0){
        var obj = {
            descricao:"",
            idExterno:""
        };
        columns.forEach(function (item) {
            var address_of_cell = item+numeroLinha;
            var desired_cell = worksheet[address_of_cell];
            var valorCell = (desired_cell ? desired_cell.v : undefined);
            if(!valorCell){
                numeroLinha =0;
            }else{
                if(item == "A"){
                    obj.descricao = valorCell;
                }else if(item == "B"){
                    obj.idExterno = valorCell;
                }
            }
        });

        if(numeroLinha != 0){
            listaRetorno.push(obj);
            numeroLinha++;
        }
    }
    return listaRetorno;
}

function retornaListaComarca(sheet_name){
    var worksheet = workbook.Sheets[sheet_name];
    console.log("RETORNA LISTA COMARCA");

    var numeroLinha = 2;
    var listaRetorno =[];
    var listaColunas = [
        {index:"A",  nome:"tipoJustica"},
        {index:"B",  nome:"codigoEstado"},
        {index:"C",  nome:"codigo"},
        {index:"D",  nome:"descricao"},
        {index:"E",  nome:"tipo"},
        {index:"F",  nome:"codigoEstruturado"},
        {index:"G",  nome:"comarcaComplementar"},
        {index:"H",  nome:"observacao"}
    ];

    while (numeroLinha != 0){
        var itemComarca = {
            codigo:null,
            tipoJustica:null,
            codigoEstado:null,
            descricao:null,
            tipo:null,
            codigoEstruturado:null,
            comarcaComplementar:null,
            observacao:null
        };

        for(var indexColuna=0; indexColuna < listaColunas.length; indexColuna++){
            var coluna = listaColunas[indexColuna];
            var indexCell = coluna.index+numeroLinha;
            var cellDesejada = worksheet[indexCell];
            if(cellDesejada){
                for(var objectKey in itemComarca){
                    if(objectKey === coluna.nome){
                        itemComarca[objectKey] = cellDesejada.v;
                        break;
                    }
                }
            }else{
                if(indexColuna === 0){
                    numeroLinha = 0;
                }
            }
        }
        if(numeroLinha != 0){
            console.log("LINHA ", numeroLinha);
            numeroLinha++;
        }

        if(itemComarca.tipo !== "COMARCA"){
            itemComarca.descricao = itemComarca.comarcaComplementar;
        }

        listaRetorno.push(itemComarca);
    }
    return listaRetorno;
}


function retornaListaCnjPorPlanilha(sheet_name) {
    var worksheet = workbook.Sheets[sheet_name];

    var numeroLinha = 1;
    var listaRetorno =[];

    while (numeroLinha != 0){
        var address_of_cell = 'A'+numeroLinha;

        /* Find desired cell */
        var desired_cell = worksheet[address_of_cell];
        /* Get the value */
        var valorCell = (desired_cell ? desired_cell.v : undefined);
        if(!valorCell){
            numeroLinha =0;
        }else{
            var obj = {
                descricao:valorCell
            };
            listaRetorno.push(obj);
            numeroLinha++;
        }
    }
    return listaRetorno;
}

function retornaListaProcon(sheet_name){
    var worksheet = workbook.Sheets[sheet_name];
    console.log("RETORNA LISTA PROCON");

    var numeroLinha = 2;
    var listaRetorno =[];
    var listaColunas = [
        {index:"A",  nome:"estado"},
        {index:"B",  nome:"cidade"}
    ];

    while (numeroLinha != 0){
        var itemProcon = {
            estado:null,
            cidade:null
        };
        for(var indexColuna=0; indexColuna < listaColunas.length; indexColuna++){
            var coluna = listaColunas[indexColuna];
            var indexCell = coluna.index+numeroLinha;
            var cellDesejada = worksheet[indexCell];
            if(cellDesejada){
                for(var objectKey in itemProcon){
                    if(objectKey === coluna.nome){
                        itemProcon[objectKey] = cellDesejada.v;
                        break;
                    }
                }
            }else{
                if(indexColuna === 0){
                    numeroLinha = 0;
                }
            }
        }
        if(numeroLinha != 0){
            console.log("LINHA ", numeroLinha);
            numeroLinha++;
        }
        listaRetorno.push(itemProcon);
    }
    return listaRetorno;
}


module.exports ={
    "percorrePlanilhas": function () {
        return percorrePlanilhas();
    },
    "geraSegmentoOrigemTipo":function(planilha){
        return geraSegmentoOrigemTipo(planilha);
    },
    "geraRegistrosGenericos": function (planilha) {
        return geraRegistrosGenericos(planilha)
    },
    "geraOrgaoTratador": function (planilha) {
        return geraOrgaoTratador(planilha);
    }
}