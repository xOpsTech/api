var esDriver = require('../esDriver.js');

exports.getHealthConfigs = function (req, res) {
    var tenantId = req.params.tenantId;
    esDriver.healthConfigs(tenantId, function (resultJson) {
        var esResult = resultJson.hits.hits;
        var result = { result: [] };

        if (esResult) {
            esResult.map(function (val) {
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

exports.getMetricTerms = function (req, res) {
    var tenantId = req.params.tenantId;
    esDriver.getMetricTerms(tenantId, function (resultJson) {
        var bucketList = resultJson.aggregations.types.buckets;

        var finalResult = {
            metrics: [],
            error: false
        }

        try {
            bucketList.map(function (metricTypeBucket) {
                var metric = { terms: [] };
                metric.name = metricTypeBucket.key;
                metric.terms = [];

                var metricTermBucketList = metricTypeBucket.metric_terms.buckets;

                metricTermBucketList.map(function (metricTermBucket) {
                    metric.terms.push(metricTermBucket.key);
                });
                finalResult.metrics.push(metric);

            });
            return res.status(200).json(finalResult);
        } catch (err) {
            console.log(err);
            finalResult.error = true;
            return res.status(500).json(finalResult);
        }
    });
};


exports.getPerformaceIndicators = function (req, res) {
    var tenantId = req.params.tenantId;
    esDriver.getPerformaceIndicators(tenantId, function (resultJson) {
        var hitsArray = resultJson.aggregations.brands_field1.buckets;

        var finalResult = {
            result: {
                "perfs": []
            },
            error: false
        }
        try {
            hitsArray.map(function (hit) {
            var configId = hit.my_field_top_hits1.hits.hits[0]._source.monitorName +"-"+hit.my_field_top_hits1.hits.hits[0]._source.locationLabel;
            finalResult.result.perfs.push(configId);
            });
            return res.status(200).json(finalResult);
        }
         
       catch (err) {
            console.log(err);
            finalResult.error = true;
            return res.status(500).json(finalResult);
        }

  
});
}

exports.getItems = function (req, res) {

    var tenantId = req.params.tenantId;
    esDriver.getItems(tenantId, function (resultJson) {
    var hitsArray = resultJson.hits.hits;

    var finalResult = {
        result: {
            "items": []
        },
        error: false
    }

    try {
        hitsArray.map(function (val) {
           
            finalResult.result.items.push(val._source.id);
        });
        return res.status(200).json(finalResult);
    } catch (err) {
        console.log(err);
        finalResult.error = true;
        return res.status(500).json(finalResult);
    }

});


}
exports.getHealth = function (req, res) {
    var tenantId = req.params.tenantId;
    esDriver.getHealth(tenantId, function (resultJson) {
        var total = resultJson.hits.total;

        var finalResult = {
            metrics: [],
            error: false
        }

        try {
            if (total != 0) {
                var bucketList = resultJson.aggregations.metricTypes.buckets;
                bucketList.map(function (metricTypeBucket) {
                    var metric = { terms: [] };
                    metric.name = metricTypeBucket.key;
                    metric.terms = [];

                    var metricTermBucket = metricTypeBucket.top_tag_hits.hits.hits[0]._source;
                    finalResult.metrics.push(metricTermBucket);

                });
            }

            return res.status(200).json(finalResult);
        } catch (err) {
            console.log(err);
            finalResult.error = true;
            return res.status(500).json(finalResult);
        }
    });
};