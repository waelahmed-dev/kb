const mongoose = require('mongoose');
const moment = require('moment');

let articleSchema = mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    author:{
        type: String,
        required: true
    },
    body:{
        type: String,
        required: true
    },
    image:{
        type: String,
        required: true
    },
    created_at: {
        type: String,
    }
});

let Article = module.exports = mongoose.model('Article', articleSchema);