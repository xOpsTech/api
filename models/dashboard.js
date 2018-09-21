var mongoose = require('mongoose');
var randomstring = require("randomstring");

var dashboardSchema = mongoose.Schema({
    id: { type: String, unique: true },
    active:boolean,
    tenantId: String,
    topic: String,
    link: 
    {
        name :String,
        href : String
    },
});


dashboardSchema.pre('save', function (next) {
        this.id = randomstring.generate(9).toLowerCase();
    next();
});

module.exports = mongoose.model('Dashboard', dashboardSchema);
