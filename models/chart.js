var mongoose = require('mongoose');

mongoose.connect('mongodb://' + '127.0.0.1' + ':' + '27017' + '/' + 'xops');

var ChartSchema =  mongoose.Schema({

tenant :String,
chartType:String,
chartTitle:String,
xAxis:[],
yAxisName:String,
xAxisName:String,
series: [],
});


var Chart = mongoose.model("Chart",ChartSchema);


module.exports = Chart;

