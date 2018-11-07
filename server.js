// add this to the VERY top of the first file loaded in your app
var opbeat = require('opbeat').start({
    appId: '76df634138',
    organizationId: 'e3fec2012b8a419b92f0296a608021df',
    secretToken: '5ad1e8c24a99a4960cfcbc6c12864f6332236bff'
})
//put 'dev' or 'prod'
process.NODE_ENV = 'dev';


var express = require('express'),
    favicon = require('serve-favicon'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    cookieParser = require('cookie-parser'),
    errorhandler = require('errorhandler'),
    routes = require('./routes'),
    passport = require('passport'),

    api = require("./routes/api");
http = require('http'),
    dbCon = require('./routes/DBConnection'),
    path = require('path'),
    log4js = require('log4js'),
    busboy = require('connect-busboy'),
    session = require('client-sessions'),
    db = require('./routes/DBConnection'),
    apiroute = require('./routes/Router'),
    cors = require('cors'),
    User = require('./models/user');
Tenant = require('./models/tenant');  // get our mongoose model
bcrypt = require('bcrypt');
jwt = require('jsonwebtoken');

;
var mongoose = require('mongoose');

var flash = require('connect-flash');

require('./config/passport-local')(passport);
require('./config/passport')(passport);


//configuring log4js
log4js.configure('./config/log4js.json');

//setting loggers
global.config = require('./config/config.json');
global.appLog = require('log4js').getLogger("app");
global.saveLog = require('log4js').getLogger("save");
global.editLog = require('log4js').getLogger("edit");
global.deleteLog = require('log4js').getLogger("delete");
global.searchLog = require('log4js').getLogger("search");

var app = express();
app.use(cors());
global.dbConnection = db.getConnection();
// all environments
app.set('port', process.env.PORT || 4200);
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);

app.use(favicon(__dirname + '/public/favicon.ico'));
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({
    extended: false
});


app.use(cookieParser());
app.use(passport.initialize());

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(busboy());
app.use(flash());
app.use(express.static(path.join(__dirname, '/public')));
app.use('/bower_components', express.static(__dirname + '/bower_components'));

app.use('/api/', verifyToken, apiroute);
app.set('superSecret', 'xopssupersecretkeythatnobodyshouldknow');

// Add the Opbeat middleware after your regular middleware
app.use(opbeat.middleware.express())

// app.get('/', routes.index);
// app.set('view engine', 'ejs');
// app.get('/signup', function (req, res) {

//     app.set('view engine', 'ejs');
//     res.render('signup.ejs', { message: req.flash('signupMessage') });
// });

// app.post('/signup', passport.authenticate('local-signup', {
//     successRedirect: '/login', // redirect to the secure profile section
//     failureRedirect: '/signup',// redirect back to the signup page if there is an error
//     failureFlash: true // allow flash messages

// }));

app.post('/login', function (req, res) {
    User.findOne({
        id: req.body.id
    }, function (err, user) {
        if (!user) {
            res.json({ success: false, message: 'Authentication failed. User not found.' });
        }

        else if (user) {
            Tenant.findOne({
                id: user.tenantId
            }, function (err, tenant) {
                // check if password matches
                if (!bcrypt.compareSync(req.body.password, user.password)) {
                    res.json({ success: false, message: 'Authentication failed. Wrong password.' });
                } else {
                    var payload = {
                        user: user,
                        tenant: tenant
                    }
                    var token = jwt.sign(payload, app.get('superSecret'), {
                        expiresIn: 86400 // expires in 24 hours
                    });
                    res.json({
                        success: true,
                        message: 'Enjoy your token!',
                        token: token
                    });
                    console.log(token)
                }

            })
        }
    })
        });

// app.use(function (req, res, next) {
//     console.log(req.headers['token']);

// });

//app.get('/notallowed', endSession, routes.notallowed);

//pp.get('/user', api.getDbUser);

app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});
global.req_path = "/";
app.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));
app.get('/auth/google/callback', passport.authenticate('google', {
    successRedirect: req_path,
    failureRedirect: '/notallowed'
}));
global.db = dbCon.getConnection();
http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
app.get('/previous_route/:requestedurl', function (req, res) {
    var url = req.params.requestedurl;
    var originalUrl = url.replace("login", "");
    req.session.previousUrl = originalUrl;
    res.send("done");
});

// function endSession(req, res, next) {
//     res.clearCookie('passport');
//     next();
// }

//Verify the Token
function verifyToken(req, res, next) {//Get auth header value


    if (process.NODE_ENV == "dev") {
        return next()
    }
    else {
        var token = req.header.token || req.param('token') || req.headers['token'];
        // decode token
        if (token) {
            // verifies secret and checks exp
            jwt.verify(token, app.get('superSecret'), function (err, decoded) {
                if (err) {
                    return res.json({ success: false, message: 'Failed to authenticate token.' });
                } else {
                    // if everything is good, save to request for use in other routes
                    req.decoded = decoded;
                    next();
                }
            });
        } else {
            // if there is no token
            // return an error
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        }
    }
}