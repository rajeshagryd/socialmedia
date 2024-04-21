const { axiosInstance } = require("./axios");

function sendMessage(messageObj, messageText) {
    return axiosInstance.get('sendMessage', {
        chat_id: messageObj.chat.id,
        text: messageText
    })
}

function handleMessage(messageObj) {
    const messageText = messageObj.text || "";
    if (messageText.charAt(0) === '/') {
        const command = messageText.substr(1);
        switch (command) {
            case 'start':
                return sendMessage(messageObj, 'Hello! I am your personal assistant. How can I help you today?')        
            default:
                return sendMessage(messageObj, `Sorry, I don't understand what you mean.`)
        }
    } else{
        return sendMessage(messageObj, messageText);
    }

}


module.exports = {handleMessage}