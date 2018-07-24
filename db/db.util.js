var MongoClient = require( 'mongodb' ).MongoClient;
var DBURL = "mongodb://172.16.250.123:27017/marcador";
var DB_IA = "mongodb://172.16.250.123:27017/cadastro";

var _db;
var _dbIA;

const connectDB = (callback, url) => {
    try {
        MongoClient.connect(url, (err, db) => {
            console.log("CONECTED TO " + url);
            if(url == DB_IA) _dbIA =db;
            if(url == DBURL) _db =db;
            return callback(err)
        })
    } catch (e) {
        throw e
    }
}

const getDB = () => _db

const getDBIa = () => _dbIA

const disconnectDB = () => _db.close()

const getUrl = ()=> DBURL

const getUrlIA = () =>  DB_IA;

module.exports = { connectDB, getDB, disconnectDB , getUrl, getUrlIA, getDBIa}
