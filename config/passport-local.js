// config/passport.js
// load all the things we need

var db = require('./../routes/DBConnection');
var dbCon  = db.getConnection();
var LocalStrategy   = require('passport-local').Strategy;
var bcrypt   = require('bcrypt');
var User = require('../models/user');
// expose this function to our app using module.exports

module.exports = function(passport) {
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        db.getConnection().collection('users').findOne({"id":id}, function(err, user) {

            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport_local.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'id',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, id, password, done) {



		// find a user whose email is the same as the forms email
		// we are checking to see if the user trying to login already exists
              var dbCon  = db.getConnection();
  

             	dbCon.collection('users').findOne({ 'id' :  id }, function(err, user) {

            // if there are any errors, return the error
            if (err)
                return done(err);

            // check to see if theres already a user with that email
            if (user) {
                 console.log("User Already taken");
                 return done(null, false, req.flash('signupMessage', 'That Username is already taken.'));
               
            } else {

				// if there is no user with that email
                // create the user
         
                var newUser  = new User();
                var dbCon  = db.getConnection();
                newUser.id  = id;
                newUser.email = req.body.email;

                newUser.picture = 'http://www.freeiconspng.com/uploads/am-a-19-year-old-multimedia-artist-student-from-manila--21.png';
                newUser.name = req.body.firstname+ " " +req.body.lastname ;

                newUser.personalization.timezone =  req.body.timezone;
                newUser.personalization.theme =  'Theme1';
                newUser.login_method =  'localusr';
                newUser.password = newUser.generateHash(password); 
                // use the generateHash function in our user model

				// save the user
                 dbCon.collection('users').save(newUser,function(err) {
                    if (err)
                        throw err;
                    return done(null, newUser);
                });
            }

        });

    }));

      passport_local.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'id',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, id, password, done) { // callback with email and password from our form

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
      
      var dbCon  = db.getConnection();
                var usr  = new User();

             	dbCon.collection('users').findOne({ 'id' :  id }, function(err, user) {

                    
            // if there are any errors, return the error before anything else
            if (err)
            {
               
                return done(err);
            }

            // if no user is found, return the message
            if (!user)
            {
                return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
            }
            // if the user is found but the password is wrong
            if (!bcrypt.compareSync(password,user.password))
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata
            if (user) 
            {
                return done(null, user);
            }
            // all is well, return successful user
            return done(null, user);
        });

    }));

};

