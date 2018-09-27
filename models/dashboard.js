var mongoose = require('mongoose');
var randomstring = require("randomstring");

mongoose.connect('mongodb://' + '127.0.0.1' + ':' + '27017' + '/' + 'xops');

var dashboardSchema = mongoose.Schema({
    id: { type: String, unique: true },
    active: Boolean,
    tenantId: String,
    topic: String,
    link: 
    [{
        name :String,
        href : String
    }],
});


dashboardSchema.pre('save',function (next) {
        this.id = randomstring.generate(9).toLowerCase();
    next();
});

var Dashboard= mongoose.model('Dashboard', dashboardSchema);
module.exports = Dashboard;