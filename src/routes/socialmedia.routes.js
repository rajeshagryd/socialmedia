const express = require('express')
const router = express.Router()


const socialMedia =  require("../controllers/socialmedia.controllers.js");



router.route('/instant_post').post(socialMedia.instantPostOnSocialMedia)
// router.route('/extend_token').post(socialMedia.extendToken)


module.exports = router