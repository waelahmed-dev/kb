const router = require('express').Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// Bring In Models
let User = require('../models/user');
let Article = require('../models/article');

// Register Route
router.get('/register', (req, res) => {
    res.render('register');
});

// Register New User Post Request
router.post('/register', (req, res) => {
    req.checkBody('name').notEmpty().withMessage('Name is required').not().isInt().withMessage('Write your name not your phone number');
    req.checkBody('email').isEmail().withMessage('Invalid email').emailExists(req.body.email).withMessage('This email is already taken');
    req.checkBody('username').notEmpty().withMessage('Username is required').not().isInt().withMessage('Username can\'t be only numbers').noSpaces(req.body.username).withMessage('Username can\'t conatin spaces').usernameExists(req.body.username).withMessage('This username is already taken');
    req.checkBody('password', 'Password must has at least 6 characters').isLength({min: 6});
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

    // Get Errors
    let errors = req.validationErrors();

    if(errors){
        res.render('register', {
            errors: errors,
            name: req.body.name,
            email: req.body.email,
            username: req.body.username
        });
    } else {
        let newUser = User(req.body);
        bcrypt.genSalt(10, (err, salt) => {
            if (err) throw err;
            bcrypt.hash(newUser.password, salt, (err, hash) => {
                if (err) throw err;
                newUser.password = hash;
                newUser.save((err) => {
                    if (err) throw err;
                    req.flash('success', 'You\'ve Registered Successfully!');
                    res.redirect('/user/login')
                });
            });
        });
    }
});

// Login Route
router.get('/login', (req, res) => {
    res.render('login');
});

// Login Process
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/user/login',
        failureFlash: 'Invalid email or password',
        successFlash: 'Logged In Successfully.'
    })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'Logged Out Successfully');
    res.redirect('/user/login');
});

// Auth With Google+
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

router.get('/google/redirect',
passport.authenticate('google', {failureRedirect: '/user/login'}), (req, res) => {
    res.redirect('/');
 });

// Auth With Facebook
router.get('/facebook', passport.authenticate('facebook', {scope: ['email', 'public_profile', 'user_photos']}));

router.get('/facebook/redirect',
passport.authenticate('facebook', {failureRedirect: '/user/login'}), (req, res) => {
    res.redirect('/');
 });

 // Profile Route
 router.get('/:username', ensureAuthenticated, (req, res) => {
    let query = {author: req.user.id}
    Article.find(query, (err, articles) => {
        res.render('profile', {
            articles: articles
        });
    });
 });

// Access Control
function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next()
    } else {
        req.flash('danger', 'You must login to show this page');
        res.redirect('/user/login');
    }
}

module.exports = router