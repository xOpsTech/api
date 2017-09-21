var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
    host: 'http://35.196.113.225:9200',
    log: 'info'
});

module.exports = client;