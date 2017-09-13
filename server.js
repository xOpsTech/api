// add this to the VERY top of the first file loaded in your app
var opbeat = require('opbeat').start({
  appId: '76df634138',
  organizationId: 'e3fec2012b8a419b92f0296a608021df',
  secretToken: '5ad1e8c24a99a4960cfcbc6c12864f6332236bff'
})

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
    cors = require('cors')
    // userApi = require('./routes/project.js'),
    // testApi = require('./routes/tests.js')
    ;
var mongoose = require('mongoose');

var flash    = require('connect-flash');

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
app.use(flash());
app.use(express.static(path.join(__dirname, '/public')));
app.use('/bower_components', express.static(__dirname + '/bower_components'));

app.use('/api/', isLoggedIn, apiroute);
app.use('/api/', apiroute);

// Add the Opbeat middleware after your regular middleware
app.use(opbeat.middleware.express())

app.get('/', isLoggedIn, routes.index);
app.set('view engine', 'ejs');
  app.get('/signup', function(req, res) {

app.set('view engine', 'ejs');
    res.render('signup.ejs', { message: req.flash('signupMessage') });
});
app.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/login', // redirect to the secure profile section
    failureRedirect : '/signup',// redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages

}));
app.get('/login', function(req, res) {
    // render the page and pass in any flash data if it exists
    res.render('login.ejs', { message: req.flash('loginMessage') });
});
app.post('/login', passport.authenticate('local-login', {
    successRedirect : '/', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));

/*app.get('/alert', isLoggedIn, routes.index);
app.get('/dashboard', isLoggedIn, routes.index);
app.get('/incident', isLoggedIn, routes.index);
app.get('/settings', isLoggedIn, routes.index);
app.get('/map', isLoggedIn, routes.index);
app.get('/rssfeed', isLoggedIn, routes.index);
*/

app.get('/notallowed',endSession ,routes.notallowed);
app.get('/users', isLoggedIn, user.list);
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
    if (process.env.NODE_ENV === 'dev') {
        return next();
    }

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
}

function endSession( req, res, next) {
	res.clearCookie('passport');
	next();
}
