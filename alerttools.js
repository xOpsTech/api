const fs = require('fs');
const YAML = require('json-to-pretty-yaml');

json = {
    "es_host": "localhost",
    "es_port": 9200,
    'name':'Example any rule',
    'type': "any",
    'num_events': 1,
    "timeframe": {"seconds":4},
    "index": "test_alert_"+dsdfd,
    "filter":[ {"term":{"my_data.username":"keminda"}}],
    "alert":["pagerduty"],
    "pagerduty_service_key":"R010AU9GQ0VOQPKGBBGQSST4011L17SH",
    "pagerduty_client_name":"xView" 
 }
  const data = YAML.stringify(json);
  fs.writeFile('/Users/kemindasamaraweera/elastalert/example_rules/test.yaml', data, (err) => {
    if (err) throw err;
})



