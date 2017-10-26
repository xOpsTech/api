var async = require('async');
var request = require('request');

const priority_mapping = {
    1: 'P1',
    2: 'P2',
    3: 'P3',
    4: 'P4',
    5: 'P5',
}

const active_status_mapping = {
    true: "open",
    false: "closed"
}

function timeToMiilis(hours, minutes, seconds) {
    return hours * 3600000 + minutes * 60000 + seconds * 1000;
}

function strTimeToMillis(strTime) {
    var timeParts = strTime.split(" ")[1].split(":");
    return timeToMiilis(timeParts[0], timeParts[1], timeParts[2]);
}

// https://stackoverflow.com/questions/27190447/pass-json-to-http-post-request
function httpRequest(data, callback) {
    if (typeof data.httpMethod === 'undefined') {
        var httpMethod = 'GET';
        var url = data
        var jsonValue = true;
        var user = 'xops.user'
        var password = 'Summer2017'
    } else if (data.httpMethod === 'POST') {
        var httpMethod = data.httpMethod;
        var url = data.url;
        var jsonValue = data.body;
        var user = 'admin'
        var password = 'RootAdmin1!'
    }

    const options = {
        url: url,
        method: httpMethod,
        auth: {
            user: user,
            pass: password
        },
        json: jsonValue
    };
    request(options,
        function (err, res, body) {
            callback(err, body);
        }
    );
};

function getStatJson(snResultSet, mapping, key) {
    var snResultSet = snResultSet;
    var mapping = mapping;
    var key = key;

    var total = 0;
    var statJson = {};
    statJson[key] = {};

    var resultList = snResultSet.result;

    if (typeof resultList === 'undefined' || resultList.length < 0) {
        return statJson;
    }
    snResultSet.result.map(function (snResult) {
        var count = parseInt(snResult.stats.count);
        var value = snResult.groupby_fields[0].value;
        statJson[key][mapping[value]] = count;
        total += count;
    });
    statJson[key]['total'] = total;
    return statJson;
};

function gatherP1Numers(snResultSet, key) {
    var snResultSet = snResultSet;
    var key = key;

    var total = 0;
    var statJson = {};
    statJson[key] = [];

    var resultList = snResultSet.result;

    if (typeof resultList === 'undefined' || resultList.length < 0) {
        return statJson;
    }
    snResultSet.result.map(function (snResult) {
        var incidentNumber = snResult.number;
        statJson[key].push(incidentNumber);
    });
    statJson['total'] = statJson[key].length;
    return statJson;
};

function getSlaStats(slaResultSet, key) {
    var slaResultSet = slaResultSet;
    var key = key;

    var missedSlaCount = 0;
    var aboutToMissSlaCount = 0;
    var statJson = {};
    statJson[key] = {};

    var resultList = slaResultSet.result;

    if (typeof resultList === 'undefined' || resultList.length < 0) {
        return statJson;
    }

    slaResultSet.result.map(function (slaResult) {
        var hasBreached = slaResult.has_breached;
        var stage = slaResult.stage;
        if (stage !== "cancelled") {
            if (hasBreached === "true") {
                missedSlaCount += 1;
            } else {
                var startTime = new Date(slaResult.start_time);
                var plannedEndTime = new Date(slaResult.planned_end_time);
                var duration = slaResult.duration;
                const slaThreshold = 0.75;

                var durationInMillis = strTimeToMillis(duration);

                var totalMIllis = plannedEndTime.getTime() - startTime.getTime();
                var elapsedTimeRatio = parseFloat(durationInMillis / totalMIllis).toFixed(2);

                if (elapsedTimeRatio >= slaThreshold) {
                    aboutToMissSlaCount += 1;
                }
            }
        }

    });
    statJson[key]['missedSlaCount'] = missedSlaCount;
    statJson[key]['aboutToMissSlaCount'] = aboutToMissSlaCount;
    return statJson;
};

function convertValuesToPercentages(dictToConver) {
    var dictOfValues = dictToConver.aggs_by_priority;
    const total = dictOfValues.total;
    for (var prop in dictOfValues) {
        if (!dictOfValues.hasOwnProperty(prop) || prop === 'total') {
            continue;
        }
        dictOfValues[prop] = parseFloat((dictOfValues[prop] / parseFloat(total)).toFixed(2));
    }
}

exports.getIncidents = function (req, res) {
    var duration = req.query.duration;
    var urls = [
        'https://scholasticdev.service-now.com/api/now/stats/incident?sysparm_query=sys_created_onONLast%20{duration}%20minutes%40javascript%3Ags.minutesAgoStart({duration})%40javascript%3Ags.minutesAgoEnd(0)&sysparm_count=true&sysparm_sum_fields=&sysparm_group_by=active&sysparm_display_value=all'
            .replace(/{duration}/ig, duration),
        'https://scholasticdev.service-now.com/api/now/stats/incident?sysparm_query=sys_created_onONLast%20{duration}%20minutes%40javascript%3Ags.minutesAgoStart({duration})%40javascript%3Ags.minutesAgoEnd(0)&sysparm_count=true&sysparm_sum_fields=&sysparm_group_by=priority&sysparm_display_value=all'
            .replace(/{duration}/ig, duration),
        'https://scholasticdev.service-now.com/api/now/table/incident?sysparm_query=priority%3D1%5Esys_created_onONLast%20{duration}%20minutes%40javascript%3Ags.minutesAgoStart({duration})%40javascript%3Ags.minutesAgoEnd(0)&sysparm_fields=number&sysparm_limit=1000'
            .replace(/{duration}/ig, duration),
        'https://scholasticdev.service-now.com/api/now/table/task_sla?sysparm_query=priority%3D1%5Esys_created_onONLast%20{duration}%20minutes%40javascript%3Ags.minutesAgoStart({duration})%40javascript%3Ags.minutesAgoEnd(0)'
            .replace(/{duration}/ig, duration)
    ]
    async.map(urls, httpRequest, function (err, responseArray) {
        if (err) {
            return res.status(500).json({
                data: [],
                error: err
            });
        }
        // console.log('-----------------------------');
        var finalResponse = {};
        finalResponse = []

        var aggs_by_active = getStatJson(responseArray[0], active_status_mapping, 'aggs_by_active')
        finalResponse.push(aggs_by_active);

        var aggs_by_priority = getStatJson(responseArray[1], priority_mapping, 'aggs_by_priority')
        convertValuesToPercentages(aggs_by_priority);
        finalResponse.push(aggs_by_priority);

        var p1_incidents = gatherP1Numers(responseArray[2], 'p1_incidents')
        finalResponse.push(p1_incidents);

        var sla_stats = getSlaStats(responseArray[3], 'sla_stats')
        finalResponse.push(sla_stats);

        // console.log('-----------------------------\n', JSON.stringify(finalResponse));
        return res.status(200).json({
            data: finalResponse,
            error: false
        });
    })
};

exports.getTenantIncidents = function (req, res) {
    var tenantId = req.params.tenantId;
    finalResponse = {"data":[{"aggs_by_active":{"closed":4,"open":10,"total":14}},{"aggs_by_priority":{"P1":0.05,"P2":0.04,"P3":0.01,"P4":0.01,"P5":0.89,"total":14}},{"p1_incidents":["INC1011","INC1022"],"total":2},{"sla_stats":{"missedSlaCount":15,"aboutToMissSlaCount":0}}],"error":false};

    // if (tenantId === 'hkpxasc8b') {
    //     finalResponse = {"data":[{"aggs_by_active":{"closed":9,"open":103,"total":112}},{"aggs_by_priority":{"P1":0.05,"P2":0.04,"P3":0.01,"P4":0.01,"P5":0.89,"total":112}},{"p1_incidents":["INC0558073","INC0558074","INC0558075","INC0558076","INC0558085","INC0558157"],"total":6},{"sla_stats":{"missedSlaCount":155,"aboutToMissSlaCount":0}}],"error":false};
    // } else if (tenantId === 'bjxa6sc8w'){
    //     finalResponse = {"data":[{"aggs_by_active":{"closed":4,"open":10,"total":14}},{"aggs_by_priority":{"P1":0.05,"P2":0.04,"P3":0.01,"P4":0.01,"P5":0.89,"total":14}},{"p1_incidents":["INC1011","INC1022"],"total":2},{"sla_stats":{"missedSlaCount":15,"aboutToMissSlaCount":0}}],"error":false};
    // }

    return res.status(200).json({
            data: finalResponse,
            error: false
        });

};

// exports.createIncident = function (req, res) {
//     var incidentObj = req.body;
//     var url = 'https://dev33740.service-now.com/api/now/table/incident'

//     var data = { url: url, httpMethod: 'POST' }
//     httpRequest(data, function (err, httpResponse) {
//         if (err) {
//             return res.status(500).json({
//                 error: JSON.stringify(err),
//                 status: 500
//             });
//         }
//         var result = { number: httpResponse.result.number };
//         return res.status(201).json({
//             data: result,
//             status: 201
//         });
//     });
// };

exports.createIncident = function (incidentObj, cb) {
    var url = 'https://dev33740.service-now.com/api/now/table/incident'

    var data = { url: url, httpMethod: 'POST', body: incidentObj }
    httpRequest(data, function (err, httpResponse) {
        if (err) {
            cb(err);
        } else {
            try {
                var incidentNumber = httpResponse.result.number;
                cb(null, incidentNumber);
            } catch (err) {
                cb('servicenow error');
            }


        }

    });
};

exports.getIncidentStats = function (req, res) {
    var duration = req.query.duration;

    if (duration === "44640") {
        var finalResponse = {
            open_p1: [1, 2, 3, 4, 5, 6, 8, 12, 3, 4, 6, 7],
            open: [8, 6, 5, 2, 3, 3, 1, 1, 2, 3, 4, 5],
            closed: [3, 2, 5, 7, 8, 8, 1, 8, 6, 5, 2, 3],
            about_to_miss_sla: [11, 6, 5, 4, 5, 6, 8, 8, 6, 5, 2, 3],
            missed_sla: [10, 6, 5, 4, 5, 6, 1, 8, 6, 5, 2, 3]
        };
    } else if (duration === "10080") {
        var finalResponse = {
            open_p1: [1, 2, 3, 4],
            open: [8, 6, 5, 2],
            closed: [3, 2, 5, 7],
            about_to_miss_sla: [11, 6, 5, 4],
            missed_sla: [10, 6, 5, 4]
        };
    } else {
        var finalResponse = {
            open_p1: [1, 2, 3, 4, 5, 6, 8],
            open: [8, 6, 5, 2, 3, 3, 1],
            closed: [3, 2, 5, 7, 8, 8, 1],
            about_to_miss_sla: [11, 6, 5, 4, 5, 6, 8],
            missed_sla: [10, 6, 5, 4, 5, 6, 1]
        };
    }


    return res.status(200).json({
            data: finalResponse,
            error: false
        });
}

