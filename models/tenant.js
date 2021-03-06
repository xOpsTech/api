
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var shortid = require('shortid');
var randomstring = require("randomstring");

mongoose.connect('mongodb://' + '127.0.0.1' + ':' + '27017' + '/' + 'xops');

var serviceSchema = mongoose.Schema({
    serviceId: String,
    service: String,
    url: String,
    apiKey: String,
    username: String,
    password: String,
    service_started: Boolean,
    active: Boolean
});
var tenantSchema = mongoose.Schema({
    _id: String,
    id: { type: String, unique: true },
    tenant: { type: String, required: true ,unique: true},
    address: String,
    phone: String,
    banner: String,
    logo:String,
    healthitems:Array,
    services: [mongoose.Schema.Types.Mixed],
    alertingtools: [mongoose.Schema.Types.Mixed],
});

tenantSchema.pre('save', function (next) {
    if (!this.id) {
        this.id = randomstring.generate(7).toLowerCase();
    }
    this._id = this.id;
    next();
});

// create the model for tenant and expose it to our app
var Tenant = mongoose.model('Tenant', tenantSchema);
module.exports = Tenant;

