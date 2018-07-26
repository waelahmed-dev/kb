const router = require('express').Router();
const multer = require('multer');
const cloudinary = require('cloudinary');
const moment = require('moment');
//const GoogleUser = require('../models/user-google');

let upload = multer({ dest: '../public/assets/'});

cloudinary.config({ 
    cloud_name: 'waelahmed', 
    api_key: '112626178312326', 
    api_secret: 'K769rxbVM2MNJOPNz-GPqU2lGXY'
}); 

// Article Model
let Article = require('../models/article');

// User Model
let User = require('../models/user');

// Add Article Route
router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('add_articles', {
        title: 'Add Article'
    });
});

// Get Single Article
router.get('/:title', (req, res) => {
    Article.findOne({ title: req.params.title}, (err, article) => {
        User.findById(article.author, (err, user) => {
            if (err) throw err;
            let author = user.name;
            res.render('article', {
                article: article,
                author: author
            });
        })
    });
});

// Add Article Post Request
router.post('/add', upload.single('image'), (req, res) => {
    let uploadedImage = typeof req.file !== "undefined" ? req.file.originalname : '';

    req.checkBody('title', 'Article title is required').notEmpty().isString().isLength({max: 55}).withMessage('Article title can\'t be more than 55 character');
    //req.checkBody('author', 'Article author is required').notEmpty().isString();
    req.checkBody('body', 'Article body must has at least 200 characters').isLength({min: 200});
    req.checkBody('image', 'You must upload the article photo').isImage(uploadedImage);

    let info = req.body

    // Get Errors
    let errors = req.validationErrors();
    if(errors) {
        res.render('add_articles', {
            title: 'Add Articles',
            errors: errors,
            articleTitle: info.title,
            articleBody: info.body
        });
    } else {
        req.body.author = req.user.id
        cloudinary.v2.uploader.upload(req.file.path,
            {
                eager: {width: 380, height: 350, gravity: "auto", background: "auto", crop: "fill_pad"}
            },
            function(error, result){
            req.body.image = result.eager[0].url
            let date = () => {
                return moment().format('LLL')
            }
            req.body.created_at = date()
            Article(req.body).save((err) => {
                if (err) throw err;
                req.flash('success', 'Article Added Successfully');
                res.redirect('/');
            });
        });
    }
});

// Get Edit Route
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
    Article.findById(req.params.id, (err, article) => {
        if (err) console.log(err)
        if(article.author != req.user._id){
            req.flash('danger', 'Not Authorized');
            res.redirect('/');
            return false
        }
        res.render('edit_article', {
            title: 'Edit Article',
            article: article
        });
    });
});

// Edit Article Post Request
router.post('/edit/:id', upload.single('image'), (req, res) => {
    let restLogo = typeof req.file !== "undefined" ? req.file.originalname : '';

    req.checkBody('title', 'Article title is required').notEmpty().isString().isLength({max: 55}).withMessage('Article title can\'t be more than 55 character');
    //req.checkBody('author', 'Article author is required').notEmpty().isString();
    req.checkBody('body', 'Article body must has at least 200 characters').isLength({min: 200});
    req.checkBody('image', 'You must upload the article photo').isImage(restLogo);

    // Get Errors
    let errors = req.validationErrors();

    const query = {_id: req.params.id}

    req.body.author = req.user._id
    if(errors) {
        Article.findById(req.params.id, (err, article) => {
            res.render('edit_article', {
                title: 'Edit Article',
                errors: errors,
                article: article
            });
        });
    } else {
        cloudinary.v2.uploader.upload(req.file.path,
            {
                eager: {width: 380, height: 350, gravity: "auto", background: "auto", crop: "fill_pad"}
            },
             function(error, result){
            req.body.image = result.eager[0].url
            Article.update(query, req.body, (err) => {
                if (err) throw err;
                req.flash('success', 'Article Edited Successfully');
                res.redirect('/');
            });
        });
    }
});

// Article Delete Request
router.delete('/:id', (req, res) => {
    Article.findByIdAndRemove(req.params.id, (err) => {
        if (err) throw err;
        res.send('Success');
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
