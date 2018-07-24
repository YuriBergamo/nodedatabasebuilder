/**
 * Created by Yuri Bergamo on 25/03/2017.
 */


var dataset = require("./dataset/dataset");
var dbUtil = require("./db/db.util");
var dbAccess = require("./db/db");

var cadastro = require("./cadastro/cadastro.busca");
var geraArquivo = require("./cadastro/cadastro");
var dbCadastro = null;
var dbDistribuicao = null;

function init() {
    dbUtil.connectDB(function (err) {
        if(err) {
            console.log("DEU RUIM")
        }
        dbDistribuicao = dbUtil.getDB();
    }, dbUtil.getUrl());

    dbUtil.connectDB(function (err) {
        if(err) {
            console.log("DEU RUIM")
        }
        dbCadastro = dbUtil.getDBIa();
    }, dbUtil.getUrlIA());
}

init();


setTimeout(function () {
    if(dbCadastro){
        console.log("TESTE")
        cadastro.getValoresByCarteira("CREDICARD", dbCadastro).then((valores) =>{
            let combosArquivo = geraArquivo.geraEmpresaOrgaoCredicard(valores["Empresa Órgão"]);
            combosArquivo.forEach((combo)=>{
                dbAccess.saveInCollectionByDatabase(combo, "combosArquivo", dbDistribuicao);
            })
        });
    }
}, 3000);

