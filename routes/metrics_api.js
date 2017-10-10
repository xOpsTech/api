var esDriver = require('../esDriver.js');

exports.getNewrelicMapData = function (req, res) {
    var tenantId = req.params.tenantId;

    esDriver.newrelicMapData(tenantId, function (resultJson) {

        var finalResult = {
            newrelicMapData: [],
            error: false
        }

        try {
            var locationBucketList = resultJson.aggregations.location.buckets;
            locationBucketList.map(function (locationBucket) {

                var mapItem = { "locationLabel": "", "apps": [] };
                mapItem.locationLabel = locationBucket.key;

                var appBucketList = locationBucket.app.buckets;
                appBucketList.map(function (appbucket) {
                    var appbucketSource = appbucket.top.hits.hits[0]._source;
                    var locationCoordinatesArray = null;
                    if (typeof appbucketSource.locationCoordinates !== 'undefined') {
                        locationCoordinatesArray = appbucketSource.locationCoordinates.split(",");
                        appbucketSource.latitude = locationCoordinatesArray[0];
                        appbucketSource.longitude = locationCoordinatesArray[1];
                        delete appbucketSource.locationCoordinates;

                        mapItem.apps.push(appbucketSource);
                    } 

                });

                finalResult.newrelicMapData.push(mapItem);
            });


            return res.status(200).json(finalResult);
        } catch (err) {
            console.log(err);
            finalResult.error = true;
            return res.status(500).json(finalResult);
        }

    });
};