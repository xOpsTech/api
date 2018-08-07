exports.getApplicationDetails = function (req, res) {
    var Application = {
        "Applications": [
        {
        "name": "Application 01",
        "strength": 1,
        "color": "green"
        },
      
        {
        "name": "Application 02",
        "strength": 2,
        "color": "red"
        },
        {
        "name": "Application 03",
        "strength": 3,
        "color": "green"
        }]
    }
return res.json(Application);
}

exports.getStorageDetails = function (req, res) {
    var Storage = {
        "Storages": [
        {
        "name": "Storage 01",
        "strength": 1,
        "color": "green"
        },
      
        {
        "name": "Storage 02",
        "strength": 2,
        "color": "red"
        },
        {
        "name": "Storage 03",
        "strength": 3,
        "color": "green"
        },
        {
        "name": "Storage 01",
        "strength": 1,
        "color": "green"
        },
          
        {
        "name": "Storage 02",
        "strength": 2,
        "color": "red"
        },
        {
        "name": "Storage 03",
        "strength": 3,
        "color": "green"
        }]
    }
return res.json(Storage);
}

exports.getDatabaseDetails = function (req, res) {
    var Database = {
        "Databases": [
        {
        "name": "Database 01",
        "strength": 1,
        "color": "green"
        },
      
        {
        "name": "Database 02",
        "strength": 2,
        "color": "amber"
        },
        {
        "name": "Database 02",
        "strength": 2,
        "color": "green"
        },
        {
        "name": "Database 03",
        "strength": 3,
        "color": "red"
        },
        {
        "name": "Database 01",
        "strength": 1,
        "color": "green"
        },
          
        {
        "name": "Database 02",
        "strength": 2,
        "color": "green"
        },
        {
        "name": "Database 02",
        "strength": 2,
        "color": "red"
        },
        {
        "name": "Database 03",
        "strength": 3,
        "color": "green"
        }]
    }
return res.json(Database);
}


exports.getServerDetails = function (req, res) {
    var result = {
        "Servers": [
            {
                "name": "Server 01",
                "strength": 1,
                "color": "green"
            },

            {
                "name": "Server 02",
                "strength": 2,
                "color": "red"
            },
            {
                "name": "Server 03",
                "strength": 3,
                "color": "green"
            },
            {
                "name": "Server 03",
                "strength": 3,
                "color": "green"
            },
            {
                "name": "Server 03",
                "strength": 3,
                "color": "green"
            },
            {
                "name": "Server 03",
                "strength": 3,
                "color": "green"
            },
            {
                "name": "Server 03",
                "strength": 3,
                "color": "green"
            },
            {
                "name": "Server 03",
                "strength": 3,
                "color": "green"

            },
            {
                "name": "Server 03",
                "strength": 3,
                "color": "green"

            },
            {
                "name": "Server 03",
                "strength": 3,
                "color": "amber"

            },
            {
                "name": "Server 03",
                "strength": 3,
                "color": "green"

            },
            {
                "name": "Server 03",
                "strength": 3,
                "color": "green"

            },
            {
                "name": "Server 03",
                "strength": 3,
                "color": "green"

            },
            {
                "name": "Server 03",
                "strength": 3,
                "color": "green"

            },
            {
                "name": "Server 03",
                "strength": 3,
                "color": "green"

            },
            {
                "name": "Server 03",
                "strength": 3,
                "color": "green"

            },
            {
                "name": "Server 03",
                "strength": 3,
                "color": "amber"

            },
            {
                "name": "Server 03",
                "strength": 3,
                "color": "green"

            },
            {
                "name": "Server 03",
                "strength": 3,
                "color": "green"

            },
            {
                "name": "Server 03",
                "strength": 3,
                "color": "green"

            },
            {
                "name": "Server 03",
                "strength": 3,
                "color": "green"

            },
            {
                "name": "Server 03",
                "strength": 3,
                "color": "green"

            },
            {
                "name": "Server 03",
                "strength": 3,
                "color": "green"

            },
            {
                "name": "Server 03",
                "strength": 3,
                "color": "amber"

            },
            {
                "name": "Server 03",
                "strength": 3,
                "color": "green"

            }
            ,
            {
                "name": "Server 03",
                "strength": 3,
                "color": "green"

            }
            ,
            {
                "name": "Server 03",
                "strength": 3,
                "color": "green"

            }
            ,
            {
                "name": "Server 03",
                "strength": 3,
                "color": "amber"

            }
            ,
            {
                "name": "Server 03",
                "strength": 3,
                "color": "green"

            }
            ,
            {
                "name": "Server 03",
                "strength": 3,
                "color": "green"

            }
            ,
            {
                "name": "Server 03",
                "strength": 3,
                "color": "red"

            }
            ,
            {
                "name": "Server 03",
                "strength": 3,
                "color": "green"

            }
            ,
            {
                "name": "Server 03",
                "strength": 3,
                "color": "green"

            }
            ,
            {
                "name": "Server 03",
                "strength": 3,
                "color": "green"

            }
            ,
            {
                "name": "Server 03",
                "strength": 3,
                "color": "amber"

            }

        ]
    }
    return res.json(result);
};

exports.getCloudDetails = function (req, res) {
    var result = {
        "Clouds": [
            {
                "name": "Cloud 01",
                "strength": 1,
                "color": "green"
            },

            {
                "name": "Cloud 02",
                "strength": 2,
                "color": "red"
            },
            {
                "name": "Cloud 03",
                "strength": 3,
                "color": "green"
            },
            {
                "name": "Cloud 03",
                "strength": 3,
                "color": "green"
            },
            {
                "name": "Cloud 03",
                "strength": 3,
                "color": "green"
            },
            {
                "name": "Cloud 03",
                "strength": 3,
                "color": "green"
            },
            {
                "name": "Cloud 03",
                "strength": 3,
                "color": "green"
            },
            {
                "name": "Cloud 03",
                "strength": 3,
                "color": "green"

            }
        ]
    }
    return res.json(result);
};

