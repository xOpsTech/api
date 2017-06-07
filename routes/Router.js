var express = require('express');
var api = require("./api");

var router = require('express').Router();
router.route('/user').get(api.getUser);
router.route('/user').post(api.saveUser);
router.route('/user/:userId').put(api.updateUser);

router.route('/widget').get(api.getAllWidgets);
// router.route('/user/:userId').get(api.getUser);

router.use(function(req, res) {
    res.status('404').send("resource not found").end();
});

module.exports = router;
