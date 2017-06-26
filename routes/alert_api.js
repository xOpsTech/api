var esDriver = require('../esDriver.js');
var servicenow = require('./servicenow_api');

const severity_mapping = {
    1: "info",
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
            severity_stats: { "warning": 0, "critical": 0, "info": 0 },
            error: false
        }

        bucketList.map(function (severityResult) {
            var severity = severityResult.key;
            var count = severityResult.doc_count;
            if (severity === 1) {
                finalResult.severity_stats.info = count
            } else if (severity === 3) {
                finalResult.severity_stats.warning = count
            } else if (severity == 4) {
                finalResult.severity_stats.critical = count
            }
        });

        return res.status(200).json(finalResult);

    });
};

exports.getAlertTrend = function (req, res) {
    var days = req.query.days;
    esDriver.alertTrend(days, function (resultJson) {
        var bucketList = resultJson.aggregations.severity.buckets;

        var finalResult = {
            alert_trend: { "warning": [], "critical": [] },
            error: false
        }

        bucketList.map(function (severityResult) {
            var severity = severityResult.key;
            var count_aggs = severityResult.alerts.buckets;
            if (severity === 3) {
                finalResult.alert_trend.warning = count_aggs
            } else if (severity == 4) {
                finalResult.alert_trend.critical = count_aggs
            }
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

exports.createIncident = function (req, res) {
    // var alertId = req.body.doc.eventId;
    var alertObj = req.body;
    var incidentObj = { short_description: 'xops-test' }
    var incidnetResult = servicenow.createIncident(incidentObj, function (err, incidentNumber) {
        if (err) {
            return res.status(500).json({
                error: JSON.stringify(err),
                status: 500
            });
        };

        alertObj['incidentNumber'] = incidentNumber;

        var alertToUpdate = { doc: alertObj };
        esDriver.updateAlerts(alertToUpdate);
        return res.status(200).json({
            data: alertObj,
            error: false
        });
    });
};
