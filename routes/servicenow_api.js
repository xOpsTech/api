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

function httpRequest(data, callback) {
    if (typeof data.httpMethod === 'undefined') {
        var httpMethod = 'GET';
        var url = data
    } else {
        var httpMethod = data.httpMethod;
        var url = data.url;
    }

    const options = {
        url: url,
        method: httpMethod,
        auth: {
            user: 'admin',
            pass: 'RootAdmin1!'
        },
        json: true
    };
    request(options,
        function (err, res, body) {
            callback(err, body);
        }
    ).end();
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
        'https://dev33740.service-now.com/api/now/stats/incident?sysparm_query=sys_created_onONLast%20{duration}%20minutes%40javascript%3Ags.minutesAgoStart({duration})%40javascript%3Ags.minutesAgoEnd(0)&sysparm_count=true&sysparm_sum_fields=&sysparm_group_by=active&sysparm_display_value=all'
            .replace(/{duration}/ig, duration),
        'https://dev33740.service-now.com/api/now/stats/incident?sysparm_query=sys_created_onONLast%20{duration}%20minutes%40javascript%3Ags.minutesAgoStart({duration})%40javascript%3Ags.minutesAgoEnd(0)&sysparm_count=true&sysparm_sum_fields=&sysparm_group_by=priority&sysparm_display_value=all'
            .replace(/{duration}/ig, duration),
        'https://dev33740.service-now.com/api/now/table/incident?sysparm_query=severity%3D1%5Esys_created_onONLast%20{duration}%20minutes%40javascript%3Ags.minutesAgoStart({duration})%40javascript%3Ags.minutesAgoEnd(0)&sysparm_fields=number&sysparm_limit=1000'
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

        // console.log('-----------------------------\n', JSON.stringify(finalResponse));
        return res.status(200).json({
            data: finalResponse,
            error: false
        });
    })
};

exports.createIncident = function (req, res) {
    var incidentObj = req.body;
    var url = 'https://dev33740.service-now.com/api/now/table/incident'

    var data = { url: url, httpMethod: 'POST' }
    httpRequest(data, function (err, httpResponse) {
        if (err) {
            return res.status(500).json({
                error: JSON.stringify(err),
                status: 500
            });
        }
        var result = { number: httpResponse.result.number };
        return res.status(201).json({
            data: result,
            status: 201
        });
    });
};



