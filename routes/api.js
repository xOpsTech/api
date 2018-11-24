var http = require('http');
var db = require('./DBConnection');
var assert = require('assert');
var fs = require('fs');
var busboy = require('connect-busboy');
var mongodb = require('mongodb');
var mongoose = require('mongoose');
var esDriver = require('../esDriver.js');
//require express library
var express = require('express');
var client = require('../config/connection.js');
const YAML = require('json-to-pretty-yaml');
//require the express router
var router = express.Router();
//require multer for the file uploads
var multer = require('multer');

var dateTime = require('node-datetime');
// set the directory for the uploads to the uploaded to

//define the type of upload multer would be doing and pass in its destination, in our case, its a single file with the name photo

var Tenant = require('../models/tenant.js');
var Chart = require('../models/chart.js');
var Dashboard = require('../models/dashboard.js');

exports.addchart = function (req, res) {
    var tenantJson = req.body;
    db_instance = db.getConnection()
    db_instance.collection('charts').save(
        tenantJson
        , function (err, remongo_responses) {
            if (err) {
                return res.status(404).json({
                    message: JSON.stringify(err),
                    error: true
                });
            }
            // db_instance.close();
            return res.status(200).json({
                message: "record is updated successfully",
                error: false
            })
        });
};


exports.getcharts = function (req, res) {
    var tenant = req.params.tenantId;
    var query = { tenant: tenant };
    db_instance = db.getConnection()
    db_instance.collection('charts').find(query).toArray(function (err, result) {
        return res.json(result)

    });
};


exports.getChartById = function (req, res) {
    var chid = req.params.chid;
    var query = { chid: chid };
    db_instance = db.getConnection()
    db_instance.collection('charts').find(query).toArray(function (err, result) {
        return res.json(result)
    });
};

exports.updateChartById = function (req, res) {
    var chid = req.params.chid;
    var charJson = req.body;
    console.log("charJson " + charJson)
    console.log("chid " + chid);

    db_instance = db.getConnection()
    db_instance.collection('charts').updateOne(
        { chid: chid },
        { $set: charJson }
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

exports.deleteChartById = function (req, res) {
    var chid = req.params.chid;
    var myquery = { chid: chid };
    db_instance = db.getConnection()
    db_instance.collection('charts').remove(
        myquery
        , function (err, remongo_responses) {
            if (err) {
                console.log(err);
                return res.status(404).json({
                    message: JSON.stringify(err),
                    error: true
                });
            }
            console.log("1 record deleted");
            // db_instance.close();
            return res.status(200).json({
                message: "record is deleted successfully",
                error: false
            })
        });
};



var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (req.body.type == "banner") {
            cb(null, 'public/assets/img/banners/')
        }
        if (req.body.type == "logo") {
            cb(null, 'public/assets/img/logo/')
        }
    },
    filename: function (req, file, cb) {

        console.log(req.body)
        if (req.body.type == "banner") {
           
            cb(null, req.body.id + '_banner.png');
        }
        if (req.body.type == "logo") {
            cb(null, req.body.id + '_logo.png');
        }
    }
})

var upload = multer({ storage: storage }).single('photo');
exports.uploadFiles = function (req, res) {

    var filename = '';
    upload(req, res, function (err) {
        if (err) {
            // An error occurred when uploading
            console.log(err);
            return res.status(422).send("an Error occured")
        }

        // No error occured.
        filename = req.file.filename;
        return res.send(filename);
    });
}
exports.getUser = function (req, res) {

    var email = '';
    if (req.decoded['user']) {
        email = (req.decoded['user']).toLowerCase();
    }
 

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

// edit userType
exports.updateUserType = function (req, res) {
    var userJson = {
        userType: {}
    }
    userJson["userType"] = req.body.userType

    var name = req.params.name;

    db_instance = db.getConnection()
    db_instance.collection('users').updateOne(
        { id: name },
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
// end



exports.saveUser = function (req, res) {
    var userJson = req.body;
    userJson.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8), null);
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

// save UserType
exports.saveUserType = function (req, res) {
    var userTypeJson = req.body;
    db_instance = db.getConnection();
    db_instance.collection('userType').save(userTypeJson, function (err, mongo_response) {
        if (err) {
            console.log(err);
            return res.status(404).json({
                message: JSON.stringify(err),
                error: true
            })
        }
        console.log("User Type has been added");
        return res.status(201).json({
            message: "record is saved successfully",
            error: false
        })
    })
};
// end


exports.getTenantDetailsByTenantID = function (req, res) {
    var tenantId = req.params.tenantId;
    db_instance = db.getConnection();
    var query = { id: tenantId };

    db_instance.collection("tenants").find(query).toArray(function (err, remongo_responses) {
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

exports.getUserByTenantId = function (req, res) {
    var tenantId = req.params.tenantId;//fjuc6xf
    db_instance = db.getConnection()
    db_instance.collection("users").find({ tenantId: tenantId }).toArray(function (err, remongo_responses) {
        if (err) {
            return res.status(404).json({
                message: JSON.stringify(err),
                error: true
            });
        }

        var userObj = [];
        remongo_responses.map(function (user) {
            userObj.push({ id: user.id, email: user.id, name: user.name, password: user.password, tenantId: user.tenantId, userType: user.userType });
        })
        return res.status(200).json({
            data: userObj,
            error: false
        })
    });
}


exports.getdatasources = function (req, res) {
    var dataSources = {

        "DataSources": {
            "Tools": {

                "Zabbix":

                {
                    "Items":
                    {
                        "MercuryApp":
                        {
                            "Metrics": {
                                "CPU": {
                                    "Data1": ['dne03prod1', 'dne03prod2', 'dne03prod3', 'dne03prod4', 'dne03prod5'],
                                    "Data2": { "Series1": [50, 70, 31, 92, 10] }
                                },
                                "Memory": {
                                    "Data1": ['dne03prod1', 'dne03prod2', 'dne03prod3', 'dne03prod4', 'dne03prod5'],
                                    "Data2": { "Series1": [50, 70, 31, 92, 10] }
                                },
                                "Connections": {
                                    "Data1": ['dne03prod1', 'dne03prod2', 'dne03prod3', 'dne03prod4', 'dne03prod5'],
                                    "Data2": { "Series1": [100, 23, 43, 54, 10] }
                                }
                            }
                        },
                        "CelestialApp":
                        {
                            "Metrics": {
                                "CPU": {
                                    "Data1": ['b3erprod1', 'b3erprod2', 'b3erprod3', 'b3erprod4', 'b3erprod5'],
                                    "Data2": { "Series1": [50, 70, 31, 92, 10] }
                                },
                                "Memory": {
                                    "Data1": ['b3erprod1', 'b3erprod2', 'b3er3prod3', 'b3erprod4', 'b3erprod5'],
                                    "Data2": { "Series1": [50, 70, 31, 92, 10] }
                                },
                                "Connections": {
                                    "Data1": ['b3erprod1', 'b3erprod2', 'b3erprod3', 'b3erprod4', 'b3erprod5'],
                                    "Data2": { "Series1": [100, 23, 43, 54, 10] }
                                }
                            }
                        },


                    }
                },
                "NetCrunch":

                {
                    "Items":
                    {
                        "MercuryApp":
                        {
                            "Metrics": {
                                "CPU": {
                                    "Data1": ['dne03prod1', 'dne03prod2', 'dne03prod3', 'dne03prod4', 'dne03prod5'],
                                    "Data2": { "Series1": [50, 70, 31, 92, 10] }
                                },
                                "Memory": {
                                    "Data1": ['dne03prod1', 'dne03prod2', 'dne03prod3', 'dne03prod4', 'dne03prod5'],
                                    "Data2": { "Series1": [50, 70, 31, 92, 10] }
                                },
                                "Connections": {
                                    "Data1": ['dne03prod1', 'dne03prod2', 'dne03prod3', 'dne03prod4', 'dne03prod5'],
                                    "Data2": { "Series1": [100, 23, 43, 54, 10] }
                                }
                            }
                        },
                        "CelestialApp":
                        {
                            "Metrics": {
                                "CPU": {
                                    "Data1": ['b3erprod1', 'b3erprod2', 'b3erprod3', 'b3erprod4', 'b3erprod5'],
                                    "Data2": { "Series1": [50, 70, 31, 92, 10] }
                                },
                                "Memory": {
                                    "Data1": ['b3erprod1', 'b3erprod2', 'b3er3prod3', 'b3erprod4', 'b3erprod5'],
                                    "Data2": { "Series1": [50, 70, 31, 92, 10] }
                                },
                                "Connections": {
                                    "Data1": ['b3erprod1', 'b3erprod2', 'b3erprod3', 'b3erprod4', 'b3erprod5'],
                                    "Data2": { "Series1": [100, 23, 43, 54, 10] }
                                }
                            }
                        },

                    },
                }
            }
        }

    }
    return res.json(dataSources)
}




exports.getUserTypeByTenantId = function (req, res) {
    var tenantId = req.params.tenantId;//fjuc6xf
    db_instance = db.getConnection()
    db_instance.collection("userType").find({ tenantId: tenantId }).toArray(function (err, remongo_responses) {
        if (err) {
            console.log(err);
            return res.status(404).json({
                message: JSON.stringify(err),
                error: true
            });
        }
        var userTypeObject = [];
        remongo_responses.map(function (userTypeJson) {
            userTypeObject.push({ name: userTypeJson.name, management: userTypeJson.management, develop: userTypeJson.develop, userTypeManager: userTypeJson.userTypeManager, profileManager: userTypeJson.profileManager, userManager: userTypeJson.userManager, inputSourceManager: userTypeJson.inputSourceManager, tenantId: userTypeJson.tenantId });
        })
        return res.status(200).json({
            data: userTypeObject,
            error: false
        })
    });
}

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

exports.deleteAlertingTool = function (req, res) {
    var tenantId = req.params.tenantId;
    var alertTool = req.body.tool;

    if (alertTool == "pagerduty") {
        db_instance = db.getConnection()
        db_instance.collection('tenants').updateOne({ _id: tenantId }, { $unset: { "pagerduty": "" } }
            , function (err, remongo_responses) {
                if (err) {
                    console.log(err);
                    return res.status(404).json({
                        message: JSON.stringify(err),
                        error: true
                    });
                }
                const util = require('util');
                const exec = util.promisify(require('child_process').exec);

                async function ls() {
                    const { stdout, stderr } = await exec('rm -rf ./elastalert/example_rules/pagerduty_rule-' + tenantId + '.yaml');
                }
                ls();

                // db_instance.close();
                return res.status(200).json({
                    message: "record is updated successfully",
                    error: false
                })
            })
    }
    else {
        db_instance = db.getConnection()
        db_instance.collection('tenants').updateOne({ _id: tenantId }, { $unset: { "email": "" } }
            , function (err, remongo_responses) {
                if (err) {
                    console.log(err);
                    return res.status(404).json({
                        message: JSON.stringify(err),
                        error: true
                    });
                }
                const util = require('util');
                const exec = util.promisify(require('child_process').exec);

                async function ls() {
                    const { stdout, stderr } = await exec('rm -rf ./elastalert/example_rules/email_rule-' + tenantId + '.yaml');
                }
                ls();

                // db_instance.close();
                return res.status(200).json({
                    message: "record is updated successfully",
                    error: false
                })
            })
    }

}


exports.updateDashboard = function (req, res) {
    var tenantId = req.params.tenantId;
    var tenantJson = req.body;
    db_instance = db.getConnection()
    db_instance.collection('dashboards').updateOne(
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

exports.elastAlertPagerDuty = function (req, res) {
    var tenantId = req.params.tenantId;
    var tenantJson = req.body;


    client.indices.create({
        index: 'test_alert_' + tenantId
    }, function (err, resp, status) {
        if (err) {
            console.log(err);
        }
        else {
            console.log("create", resp);
        }
    });
    console.log(tenantJson)
    pagerDutyServiceJson = {
        "es_host": "localhost",
        "es_port": 9200,
        "name": "Example rule testPagerduty",
        "type": "any",
        "index": "live_alert_index_" + tenantId,
        "num_events": 1,
        "timeframe": {
            "seconds": 4
        },
        "query": {
            "query_string": {
                "query": "severity: 1 OR severity: 2"
            }
        },
        "alert": [
            "pagerduty"
        ],
        "alert_subject": "{0}",
        "alert_subject_args": [
            "message",

        ],
        "pagerduty_v2_payload_severity": "Warning",
        "pagerduty_v2_payload_source": "Xview Alerts",
        "pagerduty_v2_payload_component": "Xview",
        "pagerduty_service_key": tenantJson.pagerduty.pagerdutyservicekey,
        "pagerduty_client_name": tenantJson.pagerduty.pagerdutyclientname,
        "pagerduty_incident_key": "alert_subject {0}, {1}",
        "pagerduty_incident_key_args": [
            "locationCode",
            "severity"
        ]
    }



    const data = YAML.stringify(pagerDutyServiceJson);

    fs.writeFile('./elastalert/example_rules/pagerduty_rule-' + tenantId + '.yaml', data, (err) => {
        if (err) throw err;
        else {
            const util = require('util');
            const exec = util.promisify(require('child_process').exec);

            async function ls() {
                const { stdout, stderr } = await exec('python -m elastalert.elastalert --verbose  --config ./elastalert/config.yaml');
            }
            ls();
            return res.status(200).json({
                message: "email Inserted",
                error: false
            });
        }
    })

}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

exports.elastAlertEmail = function (req, res) {
    var tenantId = req.params.tenantId;
    var tenantJson = req.body;


    EmailServiceJson = {
        "es_host": "localhost",
        "es_port": 9200,
        'name': 'Example Alerting Rule ',
        'type': "any",
        'num_events': 1,
        "timeframe": { "seconds": 4 },
        "index": 'live_alert_index_' + tenantId,
        "query": {
            "query_string": {
                "query": "severity: 1 OR severity: 2"
            }
        },
        "alert": ["email"],
        "email": [tenantJson.email.emailaddress],
        'smtp_host': tenantJson.email.smtpserver,
        "smtp_port": 465,
        "smtp_ssl": true,
        "from_addr": 'xopsalertingservice@gmail.com',
        "smtp_auth_file": '../smtp_auth_file.yaml',
        "alert_subject": "{0}",
        "alert_subject_args": [
            "message",

        ],
        "alert_text": "Comment : {0} \nTrigger : {1} \nmonitoredCIName : {2}  \nLocation : {3} \nSeverity : {4}",
        "alert_text_type": "alert_text_only",
        "alert_text_args": [
            "comments",
            "trigger",
            "monitoredCIName",
            "locationCode",
            "severity"
        ]
    }

    const data = YAML.stringify(EmailServiceJson);


    fs.writeFile('./elastalert/example_rules/email_rule-' + tenantId + '.yaml', data, (err) => {
        if (err) throw err;
        else {
            const util = require('util');
            const exec = util.promisify(require('child_process').exec);

            async function ls() {
                const { stdout, stderr } = await exec('python -m elastalert.elastalert --verbose  --config ./elastalert/config.yaml');
            }
            ls();
            return res.status(200).json({
                message: "email Inserted",
                error: false
            });
        }
    })

}

exports.getDashboard = function (req, res) {
    var tenantId = req.params.tenantId;
    db_instance = db.getConnection();
    var query = { tenantId: tenantId };
    console.log(query);
    db_instance.collection("dashboards").find(query).toArray(function (err, remongo_responses) {
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
exports.getDashboardByPermission = function (req, res) {
    //var tenantId = req.params.tenantId;
    var permissions = req.body
    db_instance = db.getConnection();
    var query = { "permission": { $in: permissions } };
    console.log(query);
    db_instance.collection("dashboards").find(query).toArray(function (err, remongo_responses) {
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

exports.deleteDashboardById = function (req, res) {
    var dashid = req.params.id;
    console.log(dashid)
    query = { id: dashid }
    db_instance = db.getConnection()
    db_instance.collection("dashboards").remove(query, function (err, mongoResponse) {
        if (err) {
            console.log(err);
            return res.status(404).json({
                message: JSON.stringify(err),
                error: true
            });
        }
        else {
            console.log(err);
            return res.status(200).json({
                message: "record deleted successfully",
                error: false
            });
        }
    })


}


exports.getDashboardDetailsByTopic = function (req, res) {
    var id = "";
    if (req.params.id != null || req.params.id != "undefined") {
        this.id = req.params.id;
    }

    db_instance = db.getConnection();

    var query2 = { 'id': this.id };
    console.log(query2);
    db_instance.collection("dashboards").find(query2).toArray(function (err, remongo_responses) {
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

exports.updateDashboardById = function (req, res) {
    var chid = req.params.id;
    var charJson = req.body;

    db_instance = db.getConnection()
    db_instance.collection('dashboards').updateOne(
        { id: id },
        { $set: charJson }
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

exports.getUserById = function (req, res) {
    var userId = req.params.userId;
    db_instance = db.getConnection();
    var query = { id: userId };
    console.log(userId)
    db_instance.collection("users").find(query).toArray(function (err, remongo_responses) {
        console.log(remongo_responses)
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

exports.checkuser = function (req, res) {
    var userId = req.params.userId;
    db_instance = db.getConnection();
    var query = { id: userId };
    console.log(query);
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
    var tenantId = req.params.tenantId;
    var query = { tenantId: tenantId };
    db_instance.collection("users").find(query).toArray(function (err, remongo_responses) {
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
        });

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

exports.saveDashboard = function (req, res) {
    var dashboardJson = req.body;
    var newDashboard = Dashboard(dashboardJson);
    console.log(newDashboard)

    newDashboard.save(function (err, newDashboard) {
        if (err) {
            console.log(err);
            return res.status(404).json({
                message: JSON.stringify(err),
                error: true
            })
        }
        console.log("Dashboard has been added");
        return res.status(201).json({
            message: "record is saved successfully",
            error: false
        })
    })
};

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