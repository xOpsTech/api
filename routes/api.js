var http = require('http');
var db = require('./DBConnection');
var assert = require('assert');
var fs = require('fs');
var busboy = require('connect-busboy');
var mongodb = require('mongodb');
var esDriver = require('../esDriver.js');

var Tenant = require('../models/tenant.js');

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

    var email = '';
    if (req.decoded['user']) {
        email = (req.decoded['user']).toLowerCase();
    }
    // } else {
    //     email = (req.user.id).toLowerCase();
    // }

    var adminList = config.admin;
    if (adminList.indexOf(email) > -1) {

        req.user.admin = true;
    }

    res.send(req.decoded['user']);
    // console.log(res);
}

exports.getTenantIDbytenant = function (req, res) {
    var tenant = req.params.tenant;
    db_instance = db.getConnection()

    var query = { tenant: tenant };

    db_instance.collection("tenants").find(query).toArray(function (err, result) {
        var finalResult = {
            tenantId: "",
            error: false
        }
        try {
            if (typeof result[0] !== 'undefined') {
               finalResult.tenantId = result[0]["id"]
            }
            return res.status(200).json({
                tenantId: finalResult.tenantId,
                error: false
            })

        } catch (err) {
            console.log(err);
            finalResult.error = true;
            return res.status(500).json(finalResult);
        }
           
        });
    }

    exports.updateUser = function (req, res) {
        var id = req.params.userId;
        var userJson = req.body;
        db_instance = db.getConnection()
        db_instance.collection('users').updateOne(
            { id: id },
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
            });
    };


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



exports.getUserByTenantId = function(req,res){
    var tenantId = req.params.tenantId;//fjuc6xf
    db_instance = db.getConnection()
    db_instance.collection("users").find({tenantId:tenantId}).toArray(function (err, remongo_responses) {
        if (err) {
            console.log(err);
            return res.status(404).json({
                message: JSON.stringify(err),
                error: true
            });
        }

        var userObj = [];
        remongo_responses.map(function (user) {
            userObj.push({ id: user.id, email: user.email, name: user.name ,password:user.password,tenantId:user.tenantId});
        })
        return res.status(200).json({
            data: userObj,
            error: false
        })

    });

}

// exports.updateUser = function (req, res) {
//     var userId = req.params.userId;
//     var userJson = req.body;
//     db_instance = db.getConnection()
//     console.log(userId)
//     db_instance.collection('users').updateOne(
//         { email: userId },
//         { $set: userJson }
//         , function (err, remongo_responses) {
//             if (err) {
//                 console.log(err);
//                 return res.status(404).json({
//                     message: JSON.stringify(err),
//                     error: true
//                 });
//             }
//             console.log("1 record updated");
//             // db_instance.close();
//             return res.status(200).json({
//                 message: "record is updated successfully",
//                 error: false
//             })
//         })
// }

exports.updateTenant = function (req, res) {
    var tenantId = req.params.tenantId;
    var tenantJson = req.body;
    db_instance = db.getConnection()
    db_instance.collection('tenants').updateOne(
        { id: tenantId },
        { $set: tenantJson }
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
    var userId = req.decoded['user'];
    // console.log(userId);
    db_instance = db.getConnection()

    var query = { id: userId };

    db_instance.collection("users").find(query).toArray(function (err, remongo_responses) {
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
        });

    });
}

exports.getUserList = function (req, res) {
    db_instance = db.getConnection()
    db_instance.collection("users").find({}).toArray(function (err, remongo_responses) {
        if (err) {
            console.log(err);
            return res.status(404).json({
                message: JSON.stringify(err),
                error: true
            });
        }

        var userObj = [];
        remongo_responses.map(function (user) {
            userObj.push({ id: user.id, email: user.email, name: user.name });
        })
        return res.status(200).json({
            data: userObj,
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

exports.saveTenant = function (req, res) {
    var tenantJson = req.body;
    var newTenant = Tenant(tenantJson);
    newTenant.save(function (err, newTenant) {
        if (err) {
            console.log(err);
            return res.status(404).json({
                result: {
                    message: err
                },
                error: true
            });
        }
        // db_instance.close();
        return res.status(201).json({
            result: {
                tenantId: newTenant.id
            },
            error: false
        })
    });
}

exports.getTenantByUserId = function (req, res) {
    var userId = req.params.userId;
    db_instance = db.getConnection()

    var query = { id: userId };

    db_instance.collection("users").findOne(query, function (err, remongo_responses) {
        if (err || !remongo_responses) {
            console.log(err);
            return res.status(404).json({
                result: {
                    message: err
                },
                error: true
            });
        }

        var tenantId = remongo_responses.tenantId;

        Tenant.findOne({ id: tenantId }, function (err, tenant) {
            if (err) {
                console.log(err);
                return res.status(404).json({
                    result: {
                        message: err
                    },
                    error: true
                });
            }

            // console.log(remongo_responses);
            return res.status(200).json({
                result: {
                    tenant
                },
                error: false
            })

        })


    });




}