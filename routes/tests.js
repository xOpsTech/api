var esDriver = require('../esDriver.js');
var express = require('express');
var router = express.Router();

router.get('/result', function (req, res) {
    esDriver.medianMetric(function (resultJson) {
        res.json(resultJson);
    });
});


// export this router to use in app.js
module.exports = router;