var mongoose = require('mongoose');

mongoose.connect('mongodb://' + '127.0.0.1' + ':' + '27017' + '/' + 'xops');

var ChartSchema =  mongoose.Schema({
chid:String,
tenant :String,
chartType:String,
chartTitle:String,
xAxis:[],
yAxisName:String,
series: [],
datasource: String
});

var Chart = mongoose.model("Chart",ChartSchema);

module.exports = Chart;

