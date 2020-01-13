const mongoose = require('mongoose');

let personSchma = new mongoose.Schema({
    name:String,
    age:Number
})

module.exports = mongoose.model('Person',personSchma)