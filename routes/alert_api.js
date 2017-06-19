var esDriver = require('../esDriver.js');

const severity_mapping = {
    3: "warning",
    4: "critical"
}

exports.getMetrics = function (req, res) {
    console.log('result api');
    esDriver.medianMetric(function (resultJson) {
        res.json(resultJson.hits.hits);
    });
};

exports.getAlerts = function (req, res) {
    console.log('alerts api');
    esDriver.allAlerts(function (resultJson) {
        res.json(resultJson.hits.hits);
    });
};

exports.getAlertStats = function (req, res) {
    esDriver.alertStats(function (resultJson) {
        var bucketList = resultJson.aggregations.severity.buckets;

        var finalResult = {
            data: { "severity_stats": [] },
            error: false
        }

        bucketList.map(function (severityResult) {
            finalResult.data.severity_stats.push({
                "severity": severity_mapping[severityResult.key],
                "count": severityResult.doc_count
            });
        });

        return res.status(200).json(finalResult);

    });
};

exports.saveAlerts = function (req, res) {
    console.log('save alerts api');
    var alertObj = req.body;
    esDriver.saveAlerts(alertObj);
    res.json({ status: "success" });
};

exports.updateAlerts = function (req, res) {
    console.log('update alerts api');
    var alertObj = { doc: req.body };
    esDriver.updateAlerts(alertObj);
    res.json({ status: "success" });
};
