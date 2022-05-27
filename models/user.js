var mongoose = require('mongoose');
const bcrypt = require('bcrypt')

var schema = mongoose.Schema;

var userSchema = new schema({
    name: String, 
    surname: String,
    user_home: String,
    score:  {type: Number, default:0} , 
    country: String,
    
    username: {
        type: String,
        required: true,
        unique: true
    },
    
    password: {
        type: String,
        required: true
    },
    
});



var user= mongoose.model('user', userSchema);



module.exports=user;