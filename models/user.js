
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt');

var userSchema = mongoose.Schema({

        username     : String,
        email        : String,
        firstname    : String,
        lastname     : String,
        password     : String,
        login_method : String,
        personalization : {
        timezone : String,
        theme : String,
        dashboard : Array
        }

});

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

