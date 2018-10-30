

var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var shortid = require('shortid');
var randomstring = require("randomstring");

mongoose.connect('mongodb://' + '127.0.0.1' + ':' + '27017' + '/' + 'xops');

var alertTool = mongoose.Schema({
    _id: String,
    tenantid: { type: String, required: true, unique: true },
    email: {
     emailaddress:String,
     smtpserver:String
    },
    pagerduty: {
        pagerdutyservicekey:String,
        pagerdutyclientname:String,
        pagerdutyincidentkey:String,
        inckeyargs1:String,
        inckeyargs2:String,
    }
});


var AlertTool = mongoose.model('AlertTool', alertTool);
module.exports = AlertTool;