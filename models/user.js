const mongoose = require('mongoose');

let userSchema = mongoose.Schema({
    name: String,
    email: String,
    username: String,
    password: String,
    google: {},
    facebook: {}
});

let User = module.exports = mongoose.model('User', userSchema);