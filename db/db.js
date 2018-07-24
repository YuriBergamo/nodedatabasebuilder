
var dbUtil = require('./db.util');

var mongoose = require('mongoose');
mongoose.connect(dbUtil.getUrl());

var MongoClient = require('mongodb').MongoClient;

var Schema = mongoose.Schema;
var schemaPadrao = new Schema({}, { strict: false });
var schemaCombosArquivo = new Schema({
    'tipo':String,
    'entidade':String,
    'carteira':String,
    'descricao':String,
    'idExterno':String,
    'estado':String,
    '_class':String
},{collection:'combosArquivo'}, { strict: false });

var dataUtil = require("../util/date.util");

var marcador;


function gravaComboArquivo(listaDados) {
    var CombosArquivo = mongoose.model("CombosArquivo", schemaCombosArquivo);
    for(var i =0; i<listaDados.length; i++){
        var itemNovo = new CombosArquivo( listaDados[i]);
        itemNovo.save(function(error){
            if(error){
                console.log("ERRO REGISTRO " + itemNovo + " - " + error);
            }else{
                console.log("OK REGISTRO " + itemNovo);
            }
        });
    }
    console.log(" REGISTROS  GERADOS NA COLLECTION ");
}

function gravaNoBanco(collectionName, listaDados) {
    var CollectionNova = mongoose.model(collectionName, schemaPadrao);
    console.log("colection", collectionName);
    var numeroRegistrosGerados = 0;
    for(var i =0; i<listaDados.length; i++){
        var itemNovo = new CollectionNova( listaDados[i]);
        itemNovo.save().then();
        numeroRegistrosGerados++;
    }
    console.log(numeroRegistrosGerados + " REGISTROS  GERADOS NA COLLECTION " + collectionName + " COM SUCESSO!");
}


function geraRelatorio(){
    MongoClient.connect('mongodb://192.168.11.16:27017/marcador', function(err, db) {
        if(err) { return console.dir(err); }
        var collection = db.collection('filapeticao');
        // console.log(collection);
        var files = [];

        collection.find({
            data:{$gte:new Date("2017-08-01"), $lte:new Date("2017-11-28")},
            status:{$in:["ANEXO_MANUAL_FINALIZADO", "FINALIZADO", "ERRO_ROBO", "ERRO_MERGE", "NAO_ENCONTRADO"]}
        },{'amostra':1, 'status':1, 'data':1},function(err, filaPeticao) {
            if(err){
                console.log(err);
                return null;
            }
            filaPeticao.forEach(function (fila) {
                db.collection('relatorio').findOne({numeroProtocolo:fila.amostra.numeroProtocolo, tipo:"CADASTRO"}, function (error, relatorio) {
                    if(error){
                        console.log("BOSTA" + error);
                        return null;
                    }
                    if(relatorio){
                        if(relatorio.carteira){
                            console.log(fila.amostra.numeroProtocolo + " * " + dataUtil.formatDate(relatorio.dataInicial) + " * " + relatorio.carteira);
                        }else{
                            console.log(fila.amostra.numeroProtocolo + " * " + dataUtil.formatDate(relatorio.dataInicial));
                        }

                    }else{
                        console.log(fila.amostra.numeroProtocolo + " * " + dataUtil.formatDate(fila.data));
                    }

                });
            });
        });
    });
}


function gravaCnjNoBanco(collectionName, listaDados) {
    var CollectionNova = mongoose.model(collectionName, schemaPadrao);

    for(var i =0; i<listaDados.length; i++){
        var cnj = listaDados[i];
        console.log("CNJ:" + cnj + " DA COLLECTION: " + collectionName);
        var itemNovo = new CollectionNova(
            {
                processamentoDomain: [],
                status:"AGUARDANDO",
                ano:0,
                numeroProcesso:0,
                ultimoNumeroGerado:0,
                numeroComarca:0,
                tipoTribunal:0,
                tribunal:0,
                cnj:cnj,
                publico:false,
                digital:false
            }
        );
        itemNovo.save().then();
    }
}


function findQuery(collectionName, filter, fields) {
    return new Promise((resolve, reject) => {
        console.log("FIND " + collectionName + " - " + JSON.stringify(filter) + " - " + JSON.stringify(fields));
        try {
            dbUtil.getDB().collection(collectionName).find(filter, fields).toArray((errBusca, amostras) => {
                if (errBusca) {
                    console.log("busca " + collectionName + "  com erro", errBusca);
                    reject(errBusca);
                }
                resolve(amostras);
            })
        } catch (e) {
            console.log("DEU RUIM NO FIND QUERY", e);
        }
    });
}

function findQueryByDatabase(collectionName, filter, fields, db) {
    return new Promise((resolve, reject) => {
        console.log("FIND " + collectionName + " - " + JSON.stringify(filter) + " - " + JSON.stringify(fields));
        try {
            db.collection(collectionName).find(filter, fields).toArray((errBusca, amostras) => {
                if (errBusca) {
                    console.log("busca " + collectionName + "  com erro", errBusca);
                    reject(errBusca);
                }
                resolve(amostras);
            })
        } catch (e) {
            console.log("DEU RUIM NO FIND QUERY", e);
        }
    });
}


const findOneQuery = (collectionName, filter, fields, sort) => {
    console.log("FIND " + collectionName + " - " + JSON.stringify(filter));
    return new Promise((resolve, reject) => {
        dbUtil.getDB().collection(collectionName).find(filter, fields).limit(1).sort(sort).toArray((errBusca, retorno) => {
            if (errBusca) {
                console.log("busca " + collectionName + "  com erro", errBusca);
            }
            if(retorno && retorno.length > 0) {
                resolve(retorno[0]);
            }
        });
    });
}

const findOneQueryDatabase = (collectionName, filter, fields, sort, db) => {
    console.log("FIND " + collectionName + " - " + JSON.stringify(filter));
    return new Promise((resolve, reject) => {
        db.collection(collectionName).find(filter, fields).limit(1).sort(sort).toArray((errBusca, retorno) => {
            if (errBusca) {
                console.log("busca " + collectionName + "  com erro", errBusca);
            }
            if(retorno && retorno.length > 0) {
                resolve(retorno[0]);
            }
        });
    });
}

const saveInCollection = (item, collectionName) =>{
    console.log("SAVE" + collectionName + " - " + item.numeroProtocolo);
    dbUtil.getDBIa().collection(collectionName).insert(item, function (errBusca, retorno) {
        if(errBusca){
            console.log("insert " + collectionName + "  com erro", errBusca);
        }else{
            console.log("insert " + collectionName + "  com sucesso!");
        }
    })
}

const saveInCollectionByDatabase = (item, collectionName, db) =>{
    console.log("SAVE" + collectionName + " - " + item.numeroProtocolo);
    db.collection(collectionName).insert(item, function (errBusca, retorno) {
        if(errBusca){
            console.log("insert " + collectionName + "  com erro", errBusca);
        }else{
            console.log("insert " + collectionName + "  com sucesso!");
        }
    })
}

module.exports = {
    "gravaComboArquivo":function (listaDados) {
        return gravaComboArquivo(listaDados);
    },
    "gravaNoBanco": function gravaNoBanco(collectionName, listaDados)  {
        return gravaNoBanco(collectionName, listaDados);
    },
    "geraRelatorio": function geraRelatorio() {
        return geraRelatorio();
    },
    "gravaCnjNoBanco":function gravaCnjNoBanco(collectionName, listaDados) {
        return gravaCnjNoBanco(collectionName, listaDados);
    },
    "findQuery": function (collectionName, filter, fields) {
        return findQuery(collectionName, filter, fields);
    },
    "findQueryByDatabase": function (collectionName, filter, fields, db) {
        return findQueryByDatabase(collectionName, filter, fields, db);
    },
    "findOneQuery": function (collectionName, filter, fields, sort) {
        return findOneQuery(collectionName, filter, fields, sort);
    },
    "findOneQueryDatabase": function (collectionName, filter, fields, sort, db) {
        return findOneQueryDatabase(collectionName, filter, fields, sort, db);
    },
    "saveInCollection": function (item, collectionName) {
        return saveInCollection(item, collectionName);
    },
    "saveInCollectionByDatabase": function (item, collectionName, db) {
        return saveInCollectionByDatabase(item, collectionName, db);
    }
};
