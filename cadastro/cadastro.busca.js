var db = require("../db/db");
var ObjectId = require('mongodb').ObjectID;


function getIdByCarteiraNome(carteiraNome, dataBase) {
    if(carteiraNome){
        return db.findOneQueryDatabase("carteira", {"carteira":carteiraNome}, {}, {}, dataBase);
    }
}


function getValoresPorIdCarteira(carteiraId, dataBase) {
    if(carteiraId){
        return db.findOneQueryDatabase("carteiraxcampos", {"carteira.$id":ObjectId(carteiraId)}, {}, {}, dataBase);
    }
}

function getValoresByCarteira(carteiraNome, dataBase) {
    return new Promise((resolve, reject) => {
        getIdByCarteiraNome(carteiraNome, dataBase).then((carteira) => {
            //achou a carteira do cadastro
            //procurar as entidades e verificar os valores
            getValoresPorIdCarteira(carteira._id, dataBase).then((campos) => {
                //campos das entidades
                if (campos) {
                    resolve(campos.valores);
                }
            });
        })
    })
}



module.exports = {
    'getValoresByCarteira':function (carteiraNome, dataBase) {
        return getValoresByCarteira(carteiraNome, dataBase);
    }
}
