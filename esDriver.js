var client = require('./config/connection.js');

var _index_data = function (_index, _type, _id, message) {
  client.index({
    index: _index,
    type: _type,
    id: _id,
    body: message
  }, function (error, response) {
    console.log(error || response);
  });
};

var _update_data = function (_index, _type, _id, message) {
  client.update({
    index: _index,
    type: _type,
    id: _id,
    body: message
  }, function (error, response) {
    console.log(error || response);
  });
};

var _read_data = function (_index, _type, query, callback) {
  client.search({
    index: _index,
    type: _type,
    body: query
  }).then(function (resp) {
    callback(resp);
  }, function (err) {
    console.trace(err.message);
    callback(err);
  });
};


module.exports = {
  addProject: function (projectObj) {
    var userId = projectObj.userId;
    _index_data('user', 'project', userId, projectObj);
  },
  medianMetric: function (callback) {
    console.log('reading median metrics');
    var query = { query: { range: { storedTimestamp: { gte: "now-1h" } } }, size: 100 };
    _read_data('wpt', 'median_metrics', query, callback);

  },
  allAlerts: function (callback) {
    console.log('reading alerts');
    var query = { query: { match_all: {} }, size: 100 };
    _read_data('live_alert_index', 'alert', query, callback);

  },
  saveAlerts: function (alertObj) {
    console.log('save alerts');
    var alertId = alertObj.eventId;
    console.log(alertId);
    _index_data('live_alert_index', 'alert', alertId, alertObj);

  },
  updateAlerts: function (alertObj) {
    console.log('update alerts');
    var alertId = alertObj.doc.eventId;
    console.log(alertId);
    _update_data('live_alert_index', 'alert', alertId, alertObj);

  },
  readServiceHealth: function (callback) {
    var query = { "size": 0, "aggs": { "metricTypes": { "terms": { "field": "source.keyword" }, "aggs": { "top_tag_hits": { "top_hits": { "sort": [{ "timestamp": { "order": "desc" } }], "_source": { "include": ["source", "sourceStatus"] }, "size": 1 } } } } } };
    _read_data('scholastic', 'metrics', query, callback);
  },
  alertStats: function (callback) {
    var query = { "aggs": { "severity": { "terms": { "field": "severity" } } }, "size": 0 };
    _read_data('live_alert_index', 'alert', query, callback);

  },
  allPrograms: function (callback) {
    console.log('reading alerts');
    var query = { query: { match_all: {} }, size: 1 };
    _read_data('program_data', 'program', query, callback);

  },
  alertTrend: function (days, callback) {
    var query = { "query": { "range": { "raisedTimestamp": { "gte": "now-7d/d", "lte": "now/d" } } }, "aggs": { "severity": { "terms": { "field": "severity" }, "aggs": { "alerts": { "date_histogram": { "field": "raisedTimestamp", "interval": "day", "format": "yyyy-MM-dd", "min_doc_count": 0, "extended_bounds": { "min": "now-7d/d", "max": "now/d" } } } } } }, "size": 0 };
    var replacedValue = "now-%sd/d".replace("%s", days);
    query.query.range.raisedTimestamp.gte = replacedValue;
    query.aggs.severity.aggs.alerts.date_histogram.extended_bounds.min = replacedValue;
    _read_data('live_alert_index', 'alert', query, callback);

  }
}