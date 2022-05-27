var mongoose = require('mongoose');

mongoose.Promise=require('bluebird');

mongoose.connect('mongodb://localhost:27017/MonaCtf',{useNewUrlParser: true} ,(err) => {
    if(err){
        console.log('connection error');
    }else{
        console.log('connection successful');
    }});


