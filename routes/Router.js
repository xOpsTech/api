var express = require('express');
var api = require("./api");
var alertApi = require("./alert_api");
var metricsApi = require("./metrics_api");
var programApi = require("./product_api");
var servicenow = require("./servicenow_api")
var healthConfigs = require("./health_configs");
var techConfigs = require("./tech");

var router = require('express').Router();

//GET METHODS

router.route('/user').get(api.getUser);
router.route('/user/_list').get(api.getUserList);
router.route('/user/:userId').get(api.getDbUser);
router.route('/users/:tenantId').get(api.getUserByTenantId);
router.route('/getsources').get(api.getdatasources);
router.route('/gettenant/:tenant').get(api.getTenantIDbytenant); 
router.route('/userType/:tenantId').get(api.getUserTypeByTenantId)
router.route('/tenant/:userId').get(api.getTenantByUserId); 
router.route('/checkuser/:userId').get(api.checkuser);
  
router.route('/widget').get(api.getAllWidgets);


router.route('/user').post(api.saveUser);
router.route('/userType').post(api.saveUserType);
router.route('/tenant').post(api.saveTenant);   

router.route('/chart').post(api.addchart); 
router.route('/chart/:tenantId').get(api.getcharts); 


router.route('/tenant/:tenantId').put(api.updateTenant);  
router.route('/user/:userId').put(api.updateUser);
router.route('userType/:name').put(api.updateUserType);

router.route('/upload').post(api.uploadFiles);

router.route('/scholastic/services-health').get(api.getServiceHealth);
// router.route('/user/:userId').get(api.getUser);

router.route('/metrics/wpt').get(alertApi.getMetrics);
router.route('/alerts/:tenantId').get(alertApi.getTenantAlerts);

router.route('/alerts/stats/:tenantId').get(alertApi.getAlertStats);
router.route('/alerts/:tenantId/trend').get(alertApi.getAlertTrend);

router.route('/alerts/:tenantId').get(alertApi.getAlerts);
router.route('/alerts/trend').get(alertApi.getAlertTrend);
router.route('/alerts/:tenantId').get(alertApi.getAlerts);
router.route('/alerts/myalerts').get(alertApi.myAlerts);

router.route('/alerts').post(alertApi.saveAlerts);
router.route('/alerts').put(alertApi.updateAlerts);
router.route('/alerts/_count').post(alertApi.count);

router.route('/programs').get(programApi.getPrograms);

router.route('/incidents').get(servicenow.getIncidents);
router.route('/incidents/:tenantId').get(servicenow.getTenantIncidents);
router.route('/incidents/stats').get(servicenow.getIncidentStats);
// router.route('/incidents').post(servicenow.createIncident);
router.route('/incidents/_create').post(alertApi.createIncident);

router.route('/health_configs/metric_terms/:tenantId').get(healthConfigs.getMetricTerms);
router.route('/health_configs/perf_indicators/:tenantId').get(healthConfigs.getHealthConfigs);
router.route('/health_configs/item_status/:tenantId').get(healthConfigs.getItemStatus);

router.route('/health_configs/configs/:tenantId').get(healthConfigs.getItemAndPerf);
router.route('/health_configs/item_indicators/:tenantId').post(healthConfigs.saveItemIndicators);

router.route('/health/:tenantId').get(healthConfigs.getHealth);

router.route('/newrelic/map/:tenantId').get(metricsApi.getNewrelicMapData);

//servers and clouds
router.route('/tech/servers/').get(techConfigs.getServerDetails);
router.route('/tech/clouds/').get(techConfigs.getCloudDetails);
router.route('/tech/applications/').get(techConfigs.getApplicationDetails);
router.route('/tech/databases/').get(techConfigs.getDatabaseDetails);
router.route('/tech/storage/').get(techConfigs.getStorageDetails);

router.use(function (req, res) {
    res.status('404').send("resource not found").end();
});

module.exports = router;
