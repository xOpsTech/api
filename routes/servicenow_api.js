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
            var incidentNumber = httpResponse.result.number;
            cb(null, incidentNumber);
        }

    });
};

