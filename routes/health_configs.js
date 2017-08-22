var esDriver = require('../esDriver.js');

exports.getHealthConfigs = function (req, res) {
    var tenantId = req.params.tenantId;
    esDriver.healthConfigs(tenantId, function (resultJson) {
        var esResult = resultJson.hits.hits;
        var result = { result : []};

        if (esResult) {
            esResult.map(function(val){
                result.result.push(val._source.id);
            })
        }
        res.json(result);
    });
};

exports.saveItemIndicators = function (req, res) {
    var tenantId = req.params.tenantId;
    var itemObj = req.body;
    esDriver.addItemIndicators(tenantId, itemObj);
    res.json({ status: "success" });
};

exports.getItemStatus = function (req, res) {
    var tenantId = req.params.tenantId;
    esDriver.getItemStatus(tenantId, function (resultJson) {
        res.json(resultJson.hits.hits);
    });
};