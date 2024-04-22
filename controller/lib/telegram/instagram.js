const express = require('express')
const router = express.Router()
const { IgApiClient } = require('instagram-private-api');



router.post('/instagram', async (req, res) => {
    try {
        const ig = new IgApiClient();
        ig.state.generateDevice(process.env.IG_USERNAME);
        await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);
    
        const imageBuffer = await get({
            url: 'https://assets.vogue.in/photos/5ce41ea8b803113d138f5cd2/2:3/w_1600,c_limit/Jaipur-Travel-Shopping-Restaurants.jpg',
            encoding: null, 
        });
    
        const response = await ig.publish.photo({
            file: imageBuffer,
            caption: 'Princess Diya Kumari of Jaipur have two sons and a daughter. H. H. Maharaja Sawai Padmanabh Singh is the elder son of Princess Diya Kumari. H. H. Maharaja Lakshraj Prakash, the younger son of Princess Diya Kumari, has succeeded his maternal grandfather H.H. Maharaja Rajendra Prakash of Sirmour.',
        });
        // console.log(response)
        res.send({status: 200, res: response})
    } catch (error) {
        console.log("error: ", error)
    }
})


module.exports = router
