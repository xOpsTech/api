var express = require('express');
var api = require("./api");
var alertApi = require("./alert_api");
var servicenow = require("./servicenow_api")

var router = require('express').Router();
router.route('/user').get(api.getUser);
router.route('/user').post(api.saveUser);
router.route('/user/:userId').put(api.updateUser);
router.route('/user/:userId').get(api.getDbUser);
router.route('/widget').get(api.getAllWidgets);

router.route('/scholastic/services-health').get(api.getServiceHealth);
// router.route('/user/:userId').get(api.getUser);

router.route('/metrics/wpt').get(alertApi.getMetrics);
router.route('/alerts').get(alertApi.getAlerts);
router.route('/alerts').post(alertApi.saveAlerts);
router.route('/alerts').put(alertApi.updateAlerts);

router.route('/incidents').get(servicenow.getIncidents);
router.route('/incidents').post(servicenow.createIncident);

router.use(function(req, res) {
    res.status('404').send("resource not found").end();
});

module.exports = router;
