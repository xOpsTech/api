var http = require('http');
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;

var MongoConnection = function() {};

module.exports = MongoConnection;

MongoConnection.getConnection = function() {
    if (typeof MongoConnection.connection === 'undefined') {
        MongoConnection.InitDb();
    }
    return MongoConnection.connection;

};


MongoConnection.InitDb = function() {
    console.log("init db");
    MongoClient.connect('mongodb://' + 'localhost' + ':' + '27017' + '/' + 'xops', function(err, db) {
        if (err) {
            console.log(err);
        } else {
            MongoConnection.connection = db;
        }
    });
};
