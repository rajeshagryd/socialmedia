const dotenv = require('dotenv')
dotenv.config({
    path: './.env',
})


const app = require('./app.js');
const port = process.env.PORT || 3000


const axios = require('axios');

const PAGE_ACCESS_TOKEN = 'EAAPp4TFQKyUBO4oQoWwbpR2TfAc3H7E0XpNkJktG5nNES2o0kg90LiasBSE7DHY5n9UDLMjFpQkvb8DgEqYj2raDYnw4qMJegeLFZCcJuE8CNQQhy0TMglKCER0exua2h952RcZA8R5eowrTB2XgVYUFf1QNNZAgOee0QfoizYVZBArzG2HQiYX6mZAdRvJZBU2qlOtON2Fm0vy8TE';
const PAGE_ID = "303635619493795";
const API_VERSION = 'v19.0'; // Facebook Graph API version

async function postToFacebookPage(message) {
    try {
        const response = await axios.post(
            `https://graph.facebook.com/${API_VERSION}/${PAGE_ID}/photos`,
            {
                message: message,
                access_token: PAGE_ACCESS_TOKEN,
                url: "https://www.copahost.com/blog/wp-content/uploads/2019/07/imgsize2.png"
            }
        );

        console.log('Post successful:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error posting to Facebook:', error.response.data.error);
        throw error;
    }
}
// Example usage
const message = 'Hello, Facebook World! ram';
// postToFacebookPage(message)
    // .then(() => console.log('Message posted to Facebook page!'))
    // .catch(error => console.error('Failed to post to Facebook:', error));


//============Instagram API=========

async function instagramPost(message) {
    const access_token = "EAAPp4TFQKyUBO01bCoznYhbUdSBmLWjnopNCyeKdzNSCKXZCedSrqPdr6el3uKQ5fHKXoiVLbBYeO2QxUAPJKJWZAeNMU6uy6RZCGwZAIkvjZAHZCFZBrBoy8hlYPXMqEuHsqeP2Cvdj5eoBBuZApg2tc0ziaIZAC9Txx2MvkZBhTLSDV7ezkDCV1XE2B9j9EIIGnpHoO0CSTT"
    const ig_user_id = "17841403285826638"
    try {
        const response = await axios.post(
            `https://graph.facebook.com/${API_VERSION}/${ig_user_id}/media`,
            {
                caption: message,
                access_token: PAGE_ACCESS_TOKEN,
                image_url: "https://www.copahost.com/blog/wp-content/uploads/2019/07/imgsize2.png"
            }
        );

        console.log('Instagram Post successful:', response.data);
        if (response.data.id) {
            const response_two = await axios.post(
                `https://graph.facebook.com/${API_VERSION}/${ig_user_id}/media_publish`,
                {
                    creation_id: response.data.id,
                    access_token: PAGE_ACCESS_TOKEN,
                }
            );
            console.log(response_two);
            return response_two.data;
        } else {
            return "not post on instgram";
        }
    } catch (error) {
        console.error('Error posting to Facebook:', error.response.data.error);
        throw error;
    }
}

const instaMessage = 'Hello, Facebook World! ram';
instagramPost(instaMessage)
.then(() => console.log('Message posted to Facebook page!'))
.catch(error => console.error('Failed to post to Facebook:', error));



app.listen(port, () => {
    console.log(`App listening on port ${port}`)    
})