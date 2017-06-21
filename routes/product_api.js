var esDriver = require('../esDriver.js');

exports.getPrograms = function (req, res) {
    console.log('program api');
    esDriver.allPrograms(function (resultJson) {
        res.json(resultJson.hits.hits);
    });
};