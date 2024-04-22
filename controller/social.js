
'use strict';
const db = require("../models");
const dbr = {};
dbr.sequelize = db.sequelize1;

const Op = db.Sequelize.Op;
var async = require("async");
const QueryTypes = require("sequelize");
var SaveError = db.save_error;
var GlobalService = require('../services/globalService');
var EmailService = require('../services/emailNew');


const { IgApiClient } = require('instagram-private-api');
const axios = require('axios')



exports.addUserSMO = async function (req, res) {
    var requestData = req.body;
    await FUNCTIONS.DATA_WRITE(req);
    //console.log(requestData);
    
    if (requestData == undefined) {
        res.status(400);
        res.json({
        replyMsg: LANGTEXT.REQUIRED_DATA,
        replyCode: 'error',
        });
    } else {
        if(requestData.acc_type === '1'){
            const appId = 'YOUR_APP_ID';
            const appSecret = 'YOUR_APP_SECRET';
            const redirectUri = 'YOUR_REDIRECT_URI';
            const code = 'CODE_RECEIVED_FROM_FACEBOOK';

            axios.get(`https://graph.facebook.com/v13.0/oauth/access_token?client_id=${appId}&redirect_uri=${redirectUri}&client_secret=${appSecret}&code=${code}`)
            .then((response) => {
                const userAccessToken = response.data.access_token;
                console.log(userAccessToken);

                const pageId = req.body.pageId;

                axios.get(`https://graph.facebook.com/${pageId}?fields=access_token&access_token=${userAccessToken}`)
                .then((response) => {
                    const pageAccessToken = response.data.access_token;

                    // const pageAccessToken = 'EAAPp4TFQKyUBO0ZBMj0YScDyFZCzInjHAqn8ZBs4PJUQ8yS95f9zHheSKfSb3GH3qiLKlka5yQ4skpgsYOloXzyuaZAN0RkJxVfLRLXft3jZAS1scojAvujcZAAheXsrDEJIkiLA3YkJYpUXn6rGWS9jLdbbohXXKt7mt7vFTnYvJdtF7pjTNxIXEYmqLVV2rKaX28rzWtpCgy5TadHAKZAnBQZD';

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

                        UserSMOSettings.create(requestData)
                        .then(data => {
                            console.log(data)
                            res.status(201);
                            res.json({ replyMsg: 'Data successfully inserted!', replyCode: 'success', data: data });
                        })
                        .catch(err => {
                            res.status(400);
                            res.json({ replyCode: 'error', replyMsg: errorITem });

                        });
                    })
                    .catch(function (error) {
                        console.log(error.message);
                        res.send({replyCode: 'error', replyMsg: error.message });
                    });

                    // res.status(200).json({pageAccessToken: pageAccessToken});
                })
                .catch((error) => {
                    console.log(error.message);
                    res.status(500).json({error: error.message});
                });
            })
            .catch((error) => {
                res.status(400);
                res.json({ replyCode: 'error', replyMsg: errorITem });
            });
        } else if (requestData.acc_type === '2') {
            const ig = new IgApiClient();
            ig.state.generateDevice(process.env.IG_USERNAME);
            await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);
        
            try {
                const imageBuffer = await get({
                    url: 'https://assets.vogue.in/photos/5ce41ea8b803113d138f5cd2/2:3/w_1600,c_limit/Jaipur-Travel-Shopping-Restaurants.jpg',
                    encoding: null, 
                });
            
                const response = await ig.publish.photo({
                    file: imageBuffer,
                    caption: 'Princess Diya Kumari of Jaipur have two sons and a daughter. ',
                });
    
                UserSMOSettings.create(requestData)
                .then(data => {
                    console.log(data)
                    res.status(201);
                    res.json({ replyMsg: 'Data successfully inserted!', replyCode: 'success', data: data });
                })
                .catch(err => {
                    res.status(400);
                    res.json({ replyCode: 'error', replyMsg: errorITem });
    
                });
            } catch (error) {
                
            }
        }
    }
}


exports.deletePost = async function (req, res) {
    var requestData = req.body;
    await FUNCTIONS.DATA_WRITE(req);
    //console.log(requestData);
    
    if (requestData == undefined) {
        res.status(400);
        res.json({
        replyMsg: LANGTEXT.REQUIRED_DATA,
        replyCode: 'error',
        });
    } else {
        if(requestData.acc_type === '1'){
            const page_post_id = requestData.page_post_id;
            
            axios.delete(`https://graph.facebook.com/v19.0/${page_post_id}`)
            .then((response) => {
                if(response.success){
                    UserSMOSettings.deleteOne(requestData.page_post_id)
                    .then(data => {
                        console.log(data)
                        res.status(201);
                        res.json({ replyMsg: 'Data successfully inserted!', replyCode: 'success', data: data });
                    })
                    .catch(err => {

                        console.log("Error===", err);

                        var errorMessage = err.errors;
                        var errorITem = [];
                        errorMessage.forEach((item) => {
                        console.log('ID: ' + item.message);
                        errorITem.push({ "field": item.path, "message": item.message });
                        });
                        res.status(400);
                        res.json({ replyCode: 'error', replyMsg: errorITem });

                    });
                }
            })
            .catch((error) => {
                res.status(400);
                res.json({ replyCode: 'error', replyMsg: errorITem });
            });
        } else if (requestData.acc_type === '2') {
            try {
                const ig = new IgApiClient();
                ig.state.generateDevice(requestData.username);
                await ig.simulate.preLoginFlow();
                const loggedInUser = await ig.account.login(requestData.username, requestData.password);
                const media = await ig.media.getById(requestData.postId);
                await ig.media.delete({ mediaId: media.pk });
                console.log('Post deleted successfully.');
    
                UserSMOSettings.deleteOne(requestData.postId)
                .then(data => {
                    console.log(data)
                    res.status(201);
                    res.json({ replyMsg: 'Data successfully inserted!', replyCode: 'success', data: data });
                })
                .catch(err => {
                    res.status(400);
                    res.json({ replyCode: 'error', replyMsg: error.message });
                });
            } catch (error) {
                res.status(400);
                    res.json({ replyCode: 'error', replyMsg: error.message });
            }
        }
    }
}

