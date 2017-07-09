var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
    host: 'http://104.196.60.89:9200',
    log: 'info'
});

module.exports = client;