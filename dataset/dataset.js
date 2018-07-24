var fs = require('fs');
var db = require('../db/db');
var ObjectId = require('mongodb').ObjectID;

// ["201800000164016","201800000169719", "201800000169710", "201800000169681"]
const getAllAmostras = ()=> {
    return db.findQuery("amostra", {
        "_id":{
            $gt:new ObjectId("5955beb00000000000000000"),
            $lt:new ObjectId("5a4844a00000000000000000")
        }
    }, {"numeroProtocolo":1, "amostra.textoOriginal":1});
}

const getRelatorioByNumeroProtocoloSistema = numeroProtocolo => {
    console.log("BUSCANDO RELATORIO - " + numeroProtocolo);
    return db.findOneQuery("relatorio",
        {
            "numeroProtocolo":numeroProtocolo,
            "statusCode":200,
            "sistema":{$nin:["DropZone - Automático",
                "DropZone - Cadastro",
                "DropZone - Inicial",
                "DropZone - Reclassificado"]}
        },
        {"area":1, "grupo":1, "baixa":1, "carteira":1,"dataFinal":1},
        {"dataFinal":-1}
    );
}
// const getLastRelatorioFinalizado = relatorios =>{
//     return relatorios
//         .sort((r1, r2) => r1.dataFinal - r2.dataFinal)
//         .reverse()
//         .find((element, index, array)=>{
//             return element;
//         });
// }

const checkClassificacao = relatorio =>{
    if(relatorio.carteira) return {"tipo":"CARTEIRA", "descricao":relatorio.carteira};

    if(relatorio.grupo) return {"tipo":"GRUPO", "descricao":relatorio.grupo};

    if(relatorio.area) return {"tipo":"AREA", "descricao":relatorio.area};

    if(relatorio.baixa) return {"tipo":"BAIXA", "descricao":relatorio.baixa};
}

const mapToDataSetObject = amostra =>{
    return getRelatorioByNumeroProtocoloSistema(amostra.numeroProtocolo).then((relatorios) => {
            var relatorioDB = {
                "texto":amostra.amostra.textoOriginal,
                "numeroProtocolo":amostra.numeroProtocolo,
                "classificacao":checkClassificacao(relatorios)
            };
            if(relatorioDB.classificacao != null)
                db.saveInCollection(relatorioDB, "dataset_classificacao").then();
        });
}

const constructNewDataSetByDataBase = ()=> {
    return getAllAmostras().then((amostras) => {
            return amostras.map(mapToDataSetObject);
        });
}

module.exports = {
    "constructNewDataSetByDataBase":function () {
        return constructNewDataSetByDataBase();
    }
};