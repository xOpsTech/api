var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
    host: 'http://104.196.52.12:9200',
    log: 'info'
});

module.exports = client;