const { handleMessage } = require("./lib/telegram/Telegram");



async function handler(req, method) {
    const { dody } = req;
    if (body) {
        const messageObj = body.message;
        await handleMessage(messageObj)
    }
    return;
}


module.exports = { handler };