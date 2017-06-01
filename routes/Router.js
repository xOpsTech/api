var express = require('express');
var api = require("./api");

var router = require('express').Router();
router.route('/user').get(api.getUser);

router.use(function(req, res) {
    res.status('404').send("resource not found").end();
});

module.exports = router;
