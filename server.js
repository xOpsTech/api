var express = require('express'),
    favicon = require('serve-favicon'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    cookieParser = require('cookie-parser'),
    errorhandler = require('errorhandler'),
    routes = require('./routes'),
    passport = require('passport'),
    user = require('./routes/user'),
    http = require('http'),
    dbCon = require('./routes/DBConnection'),
    path = require('path'),
    log4js = require('log4js'),
    busboy = require('connect-busboy'),
    session = require('client-sessions'),
    db = require('./routes/DBConnection'),
    apiroute = require('./routes/Router'),
    userApi = require('./routes/project.js'),
    testApi = require('./routes/tests.js');

//configuring passport
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
global.dbConnection = db.getConnection();
// all environments
app.set('port', process.env.PORT || 4200);
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(favicon(__dirname + '/public/assets/img/favicon.ico'));
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({
    extended: false
});

app.use(cookieParser());
app.use(session({
    cookieName: 'session',
    secret: 'nkjn;&*((&^$%#&^(*',
    duration: 4 * 60 * 60 * 1000,
    activeDuration: 4 * 60 * 60 * 1000,
    httpOnly: true,
    secure: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(busboy());

app.use(express.static(path.join(__dirname, '/public')));
app.use('/bower_components', express.static(__dirname + '/bower_components'));

app.use('/project', userApi);
app.use('/test', testApi);

app.use('/api/', isLoggedIn, apiroute);
app.get('/', isLoggedIn, routes.index);
//app.get('/', routes.index);
app.get('/login', routes.login);

app.get('/alert', routes.index);
app.get('/dashboard', routes.index);
app.get('/incident', routes.index);
app.get('/settings', routes.index);

app.get('/notallowed',endSession ,routes.notallowed);
app.get('/users', user.list);
app.get('/logout', function(req, res) {
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
http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});
app.get('/previous_route/:requestedurl', function(req,res){
    var url = req.params.requestedurl;
    var originalUrl = url.replace("login", "");
    req.session.previousUrl = originalUrl;
    res.send("done");
});
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()) {
        req.session.access_token = req.user.token;
        if (req.session.previousUrl !== undefined) {
            var url = req.session.previousUrl;
            req.session.previousUrl = undefined;
            res.redirect(url);
        } else {
            return next();
        }

    } else {
        res.redirect('/login');
    }
    // if they aren't redirect them to the home page
    //
}

function authenticate(req, res, next) {
    //googleAuth.googleModule(req);
    console.log("authenticating");
    if (!req.user) {
        res.redirect('/login');
    } else {
        next();
    }
}

function endSession( req, res, next) {
	res.clearCookie('passport');
	next();
}
