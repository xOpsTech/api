
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var shortid = require('shortid');

mongoose.connect('mongodb://' + '127.0.0.1' + ':' + '27017' + '/' + 'xops');

var serviceSchema = mongoose.Schema({
    serviceId: String,
    service: String,
    url: String,
    apiKey: String,
    active: Boolean
});
var tenantSchema = mongoose.Schema({
    _id: String,
    id: { type: String, unique: true },
    tenant: { type: String, required: true },
    address: String,
    phone: String,
    services: [serviceSchema]
});

tenantSchema.pre('save', function (next) {
    if (!this.id) {
        this.id = shortid.generate();
    }
    this._id = this.id;
    next();
});


// create the model for tenant and expose it to our app
var Tenant = mongoose.model('Tenant', tenantSchema);
module.exports = Tenant;

