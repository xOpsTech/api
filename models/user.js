// import { Model } from 'mongoose';

var mongoose = require('mongoose');
var bcrypt   = require('bcrypt');

var userSchema = mongoose.Schema({

        id     : String,
        email        : String,
        name         : String,
        picture      : String,
		banner       : String,
        firstname    : String,
        lastname     : String,
        password     : String,
        login_method : String,
        userType: {
            name : String,
            management : Boolean,
            develop : Boolean,
            userTypeManager : Boolean,
            profileManager : Boolean,
            userManager : Boolean,
            inputSourceManager : Boolean
        },
        tenantId : String,
        personalization : {
        timezone : String,
        theme : String,
        dashboard : Array
        }

});

// var userTypeSchema = mongoose.Schema({


//     name : String,
//     management : boolean,
//     develop : boolean,
//     userTypeManager : boolean,
//     profileManager : boolean,
//     userManager : boolean,
//     inputSourceManager : boolean

// });

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(pw) {
    return bcrypt.hashSync(pw, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(pw) {
  
    return bcrypt.compareSync(pw, this.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);

