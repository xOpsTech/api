var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
    host: 'http://35.196.242.246:9200/',
    log: 'info'
});

module.exports = client;