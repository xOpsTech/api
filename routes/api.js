var http = require('http');
var db = require('./DBConnection');
var assert = require('assert');
var fs = require('fs');
var busboy = require('connect-busboy');
var mongodb = require('mongodb');
var esDriver = require('../esDriver.js');

exports.uploadFiles = function (req, res) {
    appLog.info("File uploaded by " + req.user.name);
    var fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename) {
        filename = (new Date().getTime()).toString() + filename;
        console.log("Uploading: " + filename);
        fstream = fs.createWriteStream('public/assets/img/profile/' + filename);
        file.pipe(fstream);
        fstream.on('close', function () {
            res.send({
                "path": 'public/assets/img/profile/' + filename
            });
        });
    });
}

exports.getUser = function (req, res) {
    var email = (req.user.email).toLowerCase();
    var adminList = config.admin;
    if (adminList.indexOf(email) > -1) {
        req.user.admin = true;
    }
    res.send(req.user);
}

exports.saveUser = function (req, res) {
    var userJson = req.body;
    db_instance = db.getConnection()
    db_instance.collection('users').save(userJson, function (err, mongo_response) {
        if (err) {
            console.log(err);
            return res.status(404).json({
                message: JSON.stringify(err),
                error: true
            });
        }
        console.log("1 record inserted");
        // db_instance.close();
        return res.status(201).json({
            message: "record is saved successfully",
            error: false
        })
    });
}

exports.updateUser = function (req, res) {
    var userId = req.params.userId;
    var userJson = req.body;
    db_instance = db.getConnection()
    console.log(userId)
    db_instance.collection('users').updateOne(
        { email: userId },
        { $set: userJson }
        , function (err, remongo_responses) {
            if (err) {
                console.log(err);
                return res.status(404).json({
                    message: JSON.stringify(err),
                    error: true
                });
            }
            console.log("1 record updated");
            // db_instance.close();
            return res.status(200).json({
                message: "record is updated successfully",
                error: false
            })
        })
}

exports.getAllWidgets = function (req, res) {
    db_instance = db.getConnection()
    db_instance.collection("widgets").find({}).toArray(function (err, remongo_responses) {
        if (err) {
            console.log(err);
            return res.status(404).json({
                message: JSON.stringify(err),
                error: true
            });
        }
        return res.status(200).json({
            message: remongo_responses,
            error: false
        })

    });
}

exports.getDbUser = function (req, res) {
    var userId = req.params.userId;
    db_instance = db.getConnection()

    var query = { email: userId };

    db_instance.collection("users").find(query).toArray(function (err, remongo_responses) {
        if (err) {
            console.log(err);
            return res.status(404).json({
                message: JSON.stringify(err),
                error: true
            });
        }
        // console.log(remongo_responses);
        return res.status(200).json({
            message: remongo_responses,
            error: false
        })

    });
}

exports.getServiceHealth = function (req, res) {
    esDriver.readServiceHealth(function (resultJson) {
        var bucketList = resultJson.aggregations.metricTypes.buckets;
        var finalResult = {
            data: { "services": [] },
            error: false
        }
        bucketList.map(function (serviceResult) {
            var tags = serviceResult.top_tag_hits.hits.hits[0]._source;
            finalResult.data.services.push({
                "service": tags.source,
                "status": tags.sourceStatus
            });
        });

        return res.status(200).json(finalResult);
    });
}