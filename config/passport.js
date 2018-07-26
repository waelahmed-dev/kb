const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
//const GoogleUser = require('../models/user-google');
const config = require('./database');
const bcrypt = require('bcryptjs');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

module.exports = (passport) => {
    // Local Strategy
    passport.use(new LocalStrategy({usernameField: 'email'},(email, password, done) => {
        let query = {email: email}
        User.findOne(query, (err, user) => {
            if (err) throw err;
            if (!user) {
                return done(null, false, {message: 'Wrong email or password'});
            }

            // Match Password
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (isMatch) {
                    return done(null, user)
                } else {
                    return done(null, false, {message: 'Wrong email or password'})
                }
            });
        });
    }));

    // Google Strategy
    passport.use(new GoogleStrategy({
        clientID: '830970651569-fk428rtgvc844u2b2vp63l6tvs4p1ch8.apps.googleusercontent.com',
        clientSecret: '1-4noow6c8g8c75x0P6yTEGe',
        callbackURL: "http://localhost:3000/user/google/redirect"
        },
        (accessToken, refreshToken, profile, done) => {
            User.findOne({'google.googleId': profile.id}, (err, currentUser) => {
                if (currentUser) {
                    return done(null, currentUser);
                } else {
                    // Get Username From Email
                    let email = profile.emails[0].value,
                        charIndex = email.indexOf('@'),
                        username = email.substr(0, charIndex);
                    new User({
                        username: username,
                        name: profile.displayName,
                        google: {
                            email: profile.emails[0].value,
                            googlePicture: profile._json.image.url,
                            googleId: profile.id,
                        }
                    }).save().then((newUser) => {
                        return done(null, newUser)
                    });
                }
            });
        }
    ));

    // Facebook Strategy
    passport.use(new FacebookStrategy({
        clientID: '988739534623376',
        clientSecret: 'c1ca37634624ef7d5dc358e424c4fc6f',
        callbackURL: "http://localhost:3000/user/facebook/redirect",
        profileFields: ['id', 'email', 'gender', 'picture', 'displayName']
        },
        (accessToken, refreshToken, profile, done) => {
            User.findOne({"facebook.facebookId": profile.id}).then((currentUser) => {
                if (currentUser) {
                    return done(null, currentUser);
                } else {
                    // Get Username From Email
                    let email = profile.emails[0].value,
                        charIndex = email.indexOf('@'),
                        username = email.substr(0, charIndex);
                    new User({
                        username: username,
                        name: profile.displayName,
                        facebook: {
                            email: profile.emails[0].value,
                            fbPicture: 'http://graph.facebook.com/' + profile.id + '/picture'+'?width=200&height=200&access_token='+accessToken,
                            facebookId: profile.id,
                        }
                    }).save().then((newUser) => {
                        return done(null, newUser)
                    });
                }
            });
        }
    ));
    
    // User Serialize & Deserialize
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user)  
        });
    });
}