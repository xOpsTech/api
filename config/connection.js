var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
    host: 'http://35.196.179.182:9200/',
    log: 'info'
});

module.exports = client;