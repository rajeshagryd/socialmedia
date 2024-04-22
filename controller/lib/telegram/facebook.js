const express = require('express')
const router = express.Router()

router.post('/generateUserAccessToken', (req, res) => {
    const appId = 'YOUR_APP_ID';
    const appSecret = 'YOUR_APP_SECRET';
    const redirectUri = 'YOUR_REDIRECT_URI';
    const code = 'CODE_RECEIVED_FROM_FACEBOOK';

    axios.get(`https://graph.facebook.com/v13.0/oauth/access_token?client_id=${appId}&redirect_uri=${redirectUri}&client_secret=${appSecret}&code=${code}`)
    .then((response) => {
        const userAccessToken = response.data.access_token;
        console.log(userAccessToken);
    })
    .catch((error) => {
        console.error(error);
    });
});

router.post('/generatePageAccessToken', (req, res) => {
    const userAccessToken = req.body.userAccessToken;
    const pageId = req.body.pageId;

    axios.get(`https://graph.facebook.com/${pageId}?fields=access_token&access_token=${userAccessToken}`)
    .then((response) => {
        const pageAccessToken = response.data.access_token;
        res.status(200).json({pageAccessToken: pageAccessToken});
    })
    .catch((error) => {
        console.log(error.message);
        res.status(500).json({error: error.message});
    });
});

router.post('/postOnFacebookTimeline', (req, res) => {
    console.log(req.body)
    const pageAccessToken = 'EAAPp4TFQKyUBO0ZBMj0YScDyFZCzInjHAqn8ZBs4PJUQ8yS95f9zHheSKfSb3GH3qiLKlka5yQ4skpgsYOloXzyuaZAN0RkJxVfLRLXft3jZAS1scojAvujcZAAheXsrDEJIkiLA3YkJYpUXn6rGWS9jLdbbohXXKt7mt7vFTnYvJdtF7pjTNxIXEYmqLVV2rKaX28rzWtpCgy5TadHAKZAnBQZD';

    let mediaObj = {
        access_token: pageAccessToken
    }

    let media = ''
    if(req.body.videoUrl){
        media = 'videos'
        mediaObj.file_url = req.body.videoUrl
        if(req.body.caption) {
            mediaObj.description = req.body.caption
        }
    } else if(req.body.image){
        media = 'photos'
        mediaObj.url = req.body.image
        if(req.body.caption) {
            mediaObj.caption = req.body.caption
        }
    } else {
        media = 'feed'
        if(req.body.caption) {
            mediaObj.message = req.body.caption
        }
    }

    console.log(mediaObj, media)

    axios.post(`https://graph.facebook.com/v19.0/246095668596270/${media}`, mediaObj)
    .then(function (response) {
        console.log("response: ", response.data);
        res.send({status: 201, response: response.data});
    })
    .catch(function (error) {
        console.log(error.message);
        res.send({status: 500, error: error});
    });

})

module.exports = router
