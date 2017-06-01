var esDriver = require('../esDriver.js');
var express = require('express');
var router = express.Router();

router.get('/results', function (req, res) {
	console.log('result api');
    esDriver.medianMetric(function (resultJson) {
        res.json(resultJson);
    });
});

router.get('/alerts', function (req, res) {
	console.log('alerts api');
    esDriver.allAlerts(function (resultJson) {
        res.json(resultJson);
    });
});

router.post('/alerts', function (req, res) {
	console.log('save alerts api');
	var alertObj = req.body;	
    esDriver.saveAlerts(alertObj);
	res.json({status: "success"});
});

router.put('/alerts', function (req, res) {
	console.log('update alerts api');
	var alertObj = {doc: req.body};	
    esDriver.updateAlerts(alertObj);
	res.json({status: "success"});
});


// export this router to use in app.js
module.exports = router;