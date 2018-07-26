const mongoose = require('mongoose');

let googleUserSchema = mongoose.Schema({
    name: String,
    email: String,
    googleId: String,
    picture: String
});

let GoogleUser = module.exports = mongoose.model('GoogleUser', googleUserSchema);