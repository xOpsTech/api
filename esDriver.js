var client = require('./config/connection.js');
var dateformat = require('dateformat');

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


var _update_data_doc = function (_index, _type, _id, message) {
  client.update({
    index: _index,
    type: _type,
    id: _id,
    body:  {
      // put the partial document under the `doc` key
      doc: message
  }
}, function (error, response) {
    console.log(error || response);
  });
};

var _read_data = function (_index, _type, query, callback) {
  client.search({
    index: _index,
    type: _type,
    ignoreUnavailable: true,
    size: 100,
    body: query
  }).then(function (resp) {
    callback(resp);
  }, function (err) {
    console.trace(err.message);
    callback(err);
  });
};

var _count = function (_index, _type, query, callback) {
  client.count({
    index: _index,
    type: _type,
    body: query
  }).then(function (resp) {
    callback(null, resp);
  }, function (err) {
    console.trace(err.message);
    callback(err);
  });
};

module.exports = {
  addElast:function (dataJson) {
    var tenantId = dataJson.tenantId;
    _index_data('live_alert_index'+tenantId, 'alert', tenantId, projectObj);
  },
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
  myAlerts: function (assignedToId, callback) {
    console.log('reading my alerts');
    var query = `{"query": {"term": {"assignedToId":"${assignedToId}"}}, "size": 100}`;
    _read_data('live_alert_index', 'alert', query, callback);
  },
  allTenantAlerts: function (tenantId, callback) {
    console.log('reading alerts');
    var query = { query: { match_all: {} }, size: 100 };
    _read_data('live_alert_index_' + tenantId, 'alert', query, callback);

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
  alertStats: function (tenantId,callback) {
    var query = { "aggs": { "severity": { "terms": { "field": "severity" } } }, "size": 0 };

    _read_data('live_alert_index_'+tenantId, 'alert', query, callback);

  },
  allPrograms: function (callback) {
    console.log('reading alerts');
    var query = { query: { match_all: {} }, size: 1 };
    _read_data('program_data', 'program', query, callback);

  },
  alertTrend: function (hours,tenantId,callback) {
    var query = { "query": { "range": { "raisedTimestamp": { "gte": "now-6h", "lte": "now" } } }, "aggs": { "severity": { "terms": { "field": "severity" }, "aggs": { "alerts": { "date_histogram": { "field": "raisedTimestamp", "interval": "hour", "format": "h:mma", "min_doc_count": 0, "extended_bounds": { "min": "now-6h", "max": "now" } } } } } }, "size": 0 };
    var replacedValue = "now-%sh".replace("%s", hours);
    query.query.range.raisedTimestamp.gte = replacedValue;
    query.aggs.severity.aggs.alerts.date_histogram.extended_bounds.min = replacedValue;
    _read_data('live_alert_index_'+tenantId, 'alert', query, callback);

  },
  alertCount: function (reqObj, callback) {
    var by_field = reqObj.by.field;
    var by_value = reqObj.by.value;
    var what_field = reqObj.what.field;
    var what_value = reqObj.what.value;
    // var query = {"by":{"field":by_field,"value":by_value},"what":{"field":what_field,"value":what_value}};
    var query = `{"query":{"bool":{"must":[{"term":{"${by_field}":{"value":"${by_value}"}}},{"term":{"${what_field}":{"value":"${what_value}"}}}]}}}`;
    _count('live_alert_index', 'alert', query, callback);
  },
  healthConfigs: function (tenantId, callback) {
    var query = { query: { match_all: {} }, _source: ["id"], size: 100 };
    _read_data(['perf-indicators-' + tenantId, 'item-indicators-' + tenantId],'configs' , query, callback);

  },
  addItemIndicators: function (tenantId, itemObj) {
    _index_data('item-indicators-' + tenantId, 'configs', itemObj.id, itemObj);
  },
  updateItem: function (tenantId, itemObj) {
      var id  = itemObj.id;
    
      console.log(id)
      _update_data_doc('item-indicators-' + tenantId, 'configs',id,itemObj);
  },

  getItemStatus: function (tenantId, callback) {
    var query = { query: { match_all: {} }, size: 100 };
    _read_data('item-status-' + tenantId, 'metrics', query, callback);
  },
  getMetricTerms: function (tenantId, callback) {
    var query = {"size":0,"aggs":{"types":{"terms":{"field":"_type","size":10},"aggs":{"metric_terms":{"terms":{"field":"id.keyword","size":10}}}}}};
    _read_data('metrics-' + tenantId, null, query, callback);
  },
  newrelicMapData: function (tenantId, callback) {
    var query = {"size":0,"aggs":{"location":{"terms":{"field":"locationLabel.keyword","size":10},"aggs":{"app":{"terms":{"field":"monitorName.keyword","size":10},"aggs":{"top":{"top_hits":{"sort":[{"timestamp":{"order":"desc"}}],"_source":{"includes":["locationCoordinates","monitorName","duration","locationLabel"]},"size":1}}}}}}}};
    _read_data('metrics-' + tenantId, 'newrelic-synthetics', query, callback);
  },
  getItemIndicator: function (tenantId, itemId, callback) {
    var query = `{"query":{"term":{"_id":"${itemId}"}}}`
    _read_data('item-indicators-' + tenantId, 'configs', query, callback);
  },
  getLatestMetricValue: function (tenantId, metricId, callback) {
    var query = `{"query":{"bool":{"must":[{"term":{"monitorId.keyword":{"value":"${metricId}"}}},{"range":{"timestamp":{"gte":"now-94d"}}}]}},"sort":[{"timestamp":{"order":"desc"}}],"_source":["duration"],"size":1}`
    _read_data('metrics-' + tenantId, null, query, callback);
  },
  getPerformaceIndicators: function (tenantId, callback) {
    var query =  {
     "size": 0,
      "aggs": {
       "brands_field1": {
    "terms": {
     "field": "monitorId.keyword",
      "size": 15
      },
      "aggs": {
       "my_field_top_hits1": {
      "top_hits": {
      "size": 1
       }
      }
       }
      }
     }
      };
  // _read_data("item-indicators-" + tenantId, ['newrelic-synthetics','configs'], query, callback);
    _read_data("metrics-" + tenantId, ['newrelic-synthetics','configs'], query, callback);
  },
  getItems: function (tenantId, callback) {
    var query = { query: { match_all: {} }, size: 1 };
    
    _read_data("item-indicators-" + tenantId, ['newrelic-synthetics','configs'], query, callback)
  },
  getHealth: function (tenantId, callback) {
    var query = `{"aggs":{"metricTypes":{"terms":{"field":"id.keyword"},"aggs":{"top_tag_hits":{"top_hits":{"sort":[{"timestamp":{"order":"desc"}}],"_source":{"include":[]},"size":1}}}}},"size":0}`
    var date = new Date();
    var today = dateformat(date, "yyyy-mm-dd")

    date.setDate(date.getDate() - 1);
    var yesterday = dateformat(date, "yyyy-mm-dd")
    var index_array = ['health-' + tenantId + '-' + today, 'health-' + tenantId + '-' + yesterday]
    _read_data(index_array, 'health', query, callback);
  }
}