var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
    host: 'http://104.198.245.7:9200',
    log: 'info'
});

module.exports = client;