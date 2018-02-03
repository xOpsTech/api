var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
    host: 'http://elastic.xops.it:9200/',
    log: 'info'
});

module.exports = client;