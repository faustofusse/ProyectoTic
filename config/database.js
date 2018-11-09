var mongoose = require('mongoose');

//var url = "mongodb+srv://fausto-fusse:1234@tarscluster-djpnf.gcp.mongodb.net/tars";
var url = "mongodb://localhost:27017/tars";

mongoose.connect(url, {useNewUrlParser:true}, function(err){
    if(err) throw err;
    console.log('Connected to MongoDB....');
});