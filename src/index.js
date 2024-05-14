const dotenv = require('dotenv')
dotenv.config({
    path: './.env',
})


const app = require('./app.js');
const port = process.env.PORT || 3000


const axios = require('axios');

const PAGE_ACCESS_TOKEN = 'EAAPp4TFQKyUBOZCqps2L6sxZCC5EXZASooZB13ZAzxRZCiDc4O8hxVeQyIrw8ykxZAZBvZAVhgqW9LNb6KpJKRFVqoNnLBZA19SY7C1rw4E0GdAaJOi598vTCMlUD4ZBGMmYR5Nfqae9K6Alc0spKN4CS7ZAVtvcH7mgk3N7W8pwWwbxHW2BALRzfHA9mJDufpkX8bZCe5zRjXfcS';
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
    const access_token = "EAAGulyXa9wEBO3QLwJUd0Okcyqy6a8QrTGVIAlLVOQvnhsCfZCmdZBjOYYLlDPIlnnMAPB5wjfd0O3CnyBd34bQvb4S7UE5HlpPMc8NkKd2W9ZBgaXGTjXAA8r6dV0ZAFFkhfdS5oyoKl7A7ZAECGpNWNlmVyQxYy4e1LyGM5B1zZCaDHP6gw0QPyYnkUhvax6R5LDddN1"
    const ig_user_id = "17841403285826638"
    try {
        const response = await axios.post(
            `https://graph.facebook.com/${API_VERSION}/${ig_user_id}/media`,
            {
                caption: message,
                access_token: access_token,
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