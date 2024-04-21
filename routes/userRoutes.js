const passport = require("passport");

const express = require('express')
const router = express.Router()


router.get('/', (req, res) => res.render('pages/index.ejs'))

router.get('/profile', isLoggedIn, (req, res) => {
    res.render('pages/profile.ejs')
    user: req.user
})

router.get('/error', isLoggedIn, (req, res) => {
    res.render('pages/error.ejs')
})

router.get('/auth/facebook', passport.authenticate('facebook',{
    scope: ['id', 'displayName', 'photos', 'email', 'managed_pages']
}));


router.get('/auth/facebook/callback',
    passport.authenticate('facebook', { 
        successRedirect: '/profile',
        failureRedirect: '/error' 
    }),
    function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
})

router.get('/logout', (req, res) => {
    req.logout();
    req.redirect('/')
})

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/')
}

module.exports = router