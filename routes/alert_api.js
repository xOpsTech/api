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
    var tenantId = req.params.tenantId;
    console.log('alerts api');
    esDriver.allAlerts(tenantId, function (resultJson) {
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
    var hours = req.query.hours;
    esDriver.alertTrend(hours, function (resultJson) {
        // var finalResult = {
        //     alert_trend: { "warning": [], "critical": [] },
        //     error: false
        // }
        var finalResult = {
            alert_trend: { "datasets": [{ "data": [], "label": "Warning", "fill": false, "borderColor": "#ffa726" }, { "data": [], "label": "Critical", "fill": false, "borderColor": "#ef5350" }], "labels": [] },
            error: false
        }

        var alertLabels = [];
        var warningKeys = [];
        var criticalKeys = [];

        try {
            var bucketList = resultJson.aggregations.severity.buckets;
            bucketList.map(function (severityResult) {

                var severity = severityResult.key;
                var severityBuckets = severityResult.alerts.buckets;
                if (severity === 3) {
                    severityBuckets.map(function (severityJson) {
                        finalResult.alert_trend.datasets[0].data.push(severityJson.doc_count);
                        warningKeys.push(severityJson.key_as_string);
                    });

                } else if (severity == 4) {
                    severityBuckets.map(function (severityJson) {
                        finalResult.alert_trend.datasets[1].data.push(severityJson.doc_count);
                        criticalKeys.push(severityJson.key_as_string);
                    });
                }
            });

            if (bucketList.length > 0) {
                if (warningKeys.length >= criticalKeys.length) {
                    alertLabels = warningKeys;
                } else {
                    alertLabels = criticalKeys;
                }
                finalResult.alert_trend.labels = alertLabels;
            }

            return res.status(200).json(finalResult);
        } catch (err) {
            finalResult.error = true;
            return res.status(500).json(finalResult);
        }

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
        alertObj['status'] = 'Incident';

        var alertToUpdate = { doc: alertObj };
        esDriver.updateAlerts(alertToUpdate);
        return res.status(200).json({
            data: alertObj,
            error: false
        });
    });
};

exports.count = function (req, res) {
    var reqObj = req.body;
    esDriver.alertCount(reqObj, function (err, esResponse) {
        if (err) {
            return res.status(500).json({
                error: err,
                status: 500
            });
        };

        return res.status(200).json({
            data: {"count": esResponse.count},
            error: false
        });
    })

};
