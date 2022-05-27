var mongoose = require('mongoose');

var schema = mongoose.Schema;

var challengeSchema = new schema({
    challid: Number,
    file: String,
    filename: String,
    name: String,
    description: String,
    flag: String,
    points: Number,
    category: String,
    solved: {type: Boolean, default:false}
});
var challenges= mongoose.model('challenge', challengeSchema);

module.exports = challenges;