require('dotenv').config()
const express = require("express");
const FacebookStrategy = require('passport-facebook').Strategy;
const request = require('request');
const app = express();
const passport = require('passport');
const session = require('express-session')

const userRoutes = require('./routes/userRoutes');
const { handler } = require('./controller');
app.set('view engine', 'ejs')

const port = process.env.PORT || 3000

app.use(session({
    secret: 'SECRET',
    resave: false,
    saveUninitialized: true
}))

app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser(function(user, cb){
    cb(null, user)
})
passport.deserializeUser(function(obj,cb){
    cb(null, obj);
});


app.get( '/facebookPost', (req, res) => {
    passport.use(new FacebookStrategy({
        clientID: '1101578334382885',
        clientSecret: '7624727adb17a6e8319fc331b31c2d59',
        callbackURL: "https://example.com/auth/facebook/callback",
        profileFields: ['id', 'displayName', 'photos', 'email', 'managed_pages']
    },
    function(accessToken, refreshToken, profile, done) {
        console.log("here")
        // Use accessToken to get user's pages
        const pages = profile._json.managed_pages.data;

        // Use the first page ID to get the pageAccessToken
        const pageId = pages[0].id;
        const pageAccessTokenUrl = `https://graph.facebook.com/v12.0/${pageId}?fields=access_token&access_token=${accessToken}`;

        // Make a request to get the pageAccessToken
        request(pageAccessTokenUrl, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            const pageAccessToken = JSON.parse(body).access_token;

            // Use the pageAccessToken as needed
            console.log(pageAccessToken);
        }
        });

        // Return the user profile
        return done(null, profile);
    }
    ));
});

app.use('/user', userRoutes)

app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
})

app.post('/postToFacebook', async (req, res) => {
    const message = req.body.message;
    const PAGE_ACCESS_TOKEN = 'YOUR_PAGE_ACCESS_TOKEN';
    try {
      const response = await axios.post(`https://graph.facebook.com/v12.0/me/feed?access_token=${PAGE_ACCESS_TOKEN}`, {
        message: message
      });
  
      res.send({ success: true, postId: response.data.id });
    } catch (error) {
      res.send({ success: false, error: error.message });
    }
});

// ======= TELEGRAM =======

app.post('*', async (req, res) => {
    console.log(req.body)
    res.send({message: "hello Post"})
})

app.get('*', async (req, res) => {
    console.log(req.body)
    res.send(await handler(req))
})


// const botToken = process.env.BOT_TOKEN;
// var TelegramBot = require('node-telegram-bot-api'),
//     token = botToken,
//     bot;

// if ('production' === process.env.NODE_ENV) {
//   token = botToken;
// } else if ('development' === process.env.NODE_ENV) {
//   token = "123456789";
// }

// console.log("Telegram Bot Token is ", token);

// bot = new TelegramBot(token, {polling: true});

// function sendMessage(chatId, text){
//     var options = {
//         method: 'POST',
//         host: 'api.telegram.org',
//         path: `/bot${token}/sendMessage?chat_id=${chatId}&text="${encodeURIComponent(text)}"`
//     };

//     https.request(options, function(res) {
//         console.log(`STATUS: ${res.statusCode}`);
//     }).end();
// };

// bot.on('message', (msg) => {
//     // Extract the chat ID from the message object
//     const chatId = msg.chat.id;
    
//     // Check if the message starts with /start and reply with a greeting message
//     if (msg.text === '/start') {
//         return sendMessage(chatId, `Hello! I am your personal assistant. How can I help you today?`);
//     }

//     let userText = msg.text.toLowerCase().replace(/^\/|\s+$/g, '');

//     if (!userText || !userText.length) {
//       return;
//     }

//     if (userText == 'help'){
//         return sendMessage(chatId, `Here are some commands that you can use:\n\
//                                 \n\
//                                 /start - Start chatting.\n\
//                                 help - Show this list of commands.`);
//     } else {
//         fs.readFile('data.json', 'utf8', function (err, data) {
//             if (err) throw err;
            
//             var jsonData = JSON.parse(data);
//             var response = '';
//             console.log(jsonData)
//             for (var i in jsonData) {
//               if (i.toLowerCase() == userText){
//                 response += `${i}: ${jsonData}`;
//               } 
//             }

//             if (response != '') {
//               sendMessage(chatId, response);
//             } else {
//               sendMessage(chatId, "Sorry, I don't understand what you mean.");
//             }
//         });
//     }
// });

// // Send a text message to the specified chat id
// function sendMessage(id, text) {
//     bot.sendMessage(id, text).then((msg) => {
//         console.log(`Message sent: ${text}`);
//     }).catch((error) => {
//         console.log(`Error sending message: ${error}`);
//     })
// };



app.listen(port, () => {
    console.log(`App listening on port ${port}`)    
})