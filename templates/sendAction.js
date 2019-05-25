const request = require('request');
const keys = require('../config/keys')

module.exports = (recipientId) => {
    request({
        url: "https://graph.facebook.com/v2.6/me/messages",
        qs: {
            access_token: keys.FACEBOOK_ACCESS_TOKEN
        },
        method: "POST",
        json: {
            recipient: {id: recipientId},
            "sender_action":"typing_on"
        }
    }, function(error, response, body) {
        if (error) {
            console.log("Error sending message: " + response.error);
        }
    });
}