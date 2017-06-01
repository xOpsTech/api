var express = require('express');
//var api = require("./api");

var router = require('express').Router();
/*
router.route('/loc').post(api.getLocation);
router.route('/loc/save').post(api.saveLocation);
router.route('/loc/update').post(api.updateLocation);
router.route('/loc/upload').post(api.uploadFiles);
router.route('/loc/remove').post(api.deleteLocation);
router.route('/loc/edit').post(api.editLocation);

router.route('/user').get(api.getUser);
*/
router.use(function(req, res) {
    res.status('404').send("resource not found").end();
});

module.exports = router;
