var http = require('http');
var db = require('./DBConnection');
var assert = require('assert');
var fs = require('fs');
var busboy = require('connect-busboy');
var mongodb = require('mongodb');

exports.uploadFiles = function(req, res) {
    appLog.info("File uploaded by " + req.user.name);
    var fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function(fieldname, file, filename) {
        filename = (new Date().getTime()).toString() + filename;
        console.log("Uploading: " + filename);
        fstream = fs.createWriteStream('public/assets/img/profile/' + filename);
        file.pipe(fstream);
        fstream.on('close', function() {
            res.send({
                "path": 'public/assets/img/profile/' + filename
            });
        });
    });
}

exports.getUser = function(req, res) {
    var email = (req.user.email).toLowerCase();
    var adminList = config.admin;
    if (adminList.indexOf(email) > -1) {
        req.user.admin = true;
    }
    res.send(req.user);
}
