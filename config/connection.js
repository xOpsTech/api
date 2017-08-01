var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
    host: 'http://104.196.189.117:9200/',
    log: 'info'
});

module.exports = client;