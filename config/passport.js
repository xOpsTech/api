/**
 * New node file
 */
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var db = require('./../routes/DBConnection');

// load up the user model

// load the auth variables
var configAuth = require('./auth');
var dbCon  = db.getConnection();
module.exports = function(passport) {
	
    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
    	db.getConnection().collection('users').findOne({"id":id}, function(err, user) {
            done(err, user);
        });
    });
    
    // code for login (use('local-login', new LocalStategy))
    // code for signup (use('local-signup', new LocalStategy))
    // code for facebook (use('facebook', new FacebookStrategy))
    // code for twitter (use('twitter', new TwitterStrategy))

    // =========================================================================
    // GOOGLE ==================================================================
    // =========================================================================
    passport.use(new GoogleStrategy({

        clientID        : configAuth.googleAuth.clientID,
        clientSecret    : configAuth.googleAuth.clientSecret,
        callbackURL     : configAuth.googleAuth.callbackURL,

    },
    function(token, refreshToken, profile, done) {
        // make the code asynchronous
        // User.findOne won't fire until we have all our data back from Google
        process.nextTick(function() {
        	var dbCon  = db.getConnection();
            console.log(token);
            console.log("have");
            console.log(refreshToken);
            console.log("have2");
            // try to find the user based on their google id
        	dbCon.collection('users').findOne({ 'id' : profile.id }, function(err, user) {    
                if (err)
                    return done(err);

                if (user) {

                    // if a user is found, log them in
                    return done(null, user);
               // } else if(profile._json.domain === 'xops.com'){
		} else {
                    // if the user isnt in our database, create a new user
                	var newUser = {};
                	var dbCon  = db.getConnection();

                    // set all of the relevant information
                    newUser.id    = profile.id;
                    newUser.token = token;
                    newUser.name  = profile.displayName;
                    newUser.picture = profile.photos[0].value;
                    newUser.email = profile.emails[0].value; // pull the first email

                    // save the user
                    dbCon.collection('users').save(newUser,function(err) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }
             
            });
        });

    }));

};
