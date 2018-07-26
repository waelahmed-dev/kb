const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const expressValidator = require('express-validator');
const check = require('express-validator/check');
const passport = require('passport')
const config = require('./config/database');
const path = require('path');
const socket = require('socket.io');

// Init App
const app = express();

// Connect To Database
mongoose.connect(config.database);
let db = mongoose.connection;

// Check Connection
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Check for errors
db.on('error', (err) => {
    console.log(err)
});

// Bring In Models
let Article = require('./models/article');
let User = require('./models/user');

// Set View Engine
app.set('views', './views');
app.set('view engine', 'pug');

// Set Body Parser Middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Use Static Folder
app.use(express.static('public'));

// Express Session Middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}));

// Express Messages Middleware
app.use(require('connect-flash')());
app.use((req, res, next) => {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express Validator Middleware
app.use(expressValidator({
    customValidators: {
        isImage: (value, filename) => {
            var extension = (path.extname(filename)).toLowerCase();
            switch (extension) {
                case '.jpg':
                    return '.jpg';
                case '.jpeg':
                    return '.jpeg';
                case  '.png':
                    return '.png';
                case '.gif':
                    return '.gif';
                default:
                    return false;
            }
        },
        noSpaces: (value, string) => {
            if (string.includes(' ')) {
                return false
            } else {
                return true
            }
        },
        emailExists: (value, email) => {
            if (email.length !== 0) {
                return User.findOne({email: email}).then((err, userEmail) => {
                    if (userEmail.email == email){
                        return false
                    }
                });
            } else {
                return true
            }
        },
        usernameExists: (value, username) => {
            if (username.length !== 0) {
                return User.findOne({username: username}).then((err, userName) => {
                    if (userName.username == username){
                        return false
                    }
                });
            } else {
                return true
            }
        }
    }
}));

// Passport Config
require('./config/passport')(passport)
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());
app.get('*', (req, res, next) => {
    res.locals.user = req.user;
    next();
});

// Home Route
app.get('/', (req, res) => {
    Article.find({}).limit(6).sort({created_at: -1}).then((articles, err) => {
        res.render('index', {
            title: 'Articles',
            articles: articles
        });
    });
});

let article = require('./routes/articles'),
    user = require('./routes/users');
app.use('/article', article);
app.use('/user', user);

// Start Server
var port = process.env.PORT || 3000
let server = app.listen(port, () => {
    console.log('Server is listening to port 3000...')
});

const skips = {};

let io = socket(server)
io.on('connection', (socket) => {
    skips[socket.id] = 6;

    socket.on('loadData', (data) => {
        Article.find({}).limit(6).sort({created_at: -1}).skip(skips[socket.id]).then((items, err) => {
            socket.emit("loadData", items);
            
            if (items.length > 0) {
                skips[socket.id] += 6;
            }
        }); 
    });
});
