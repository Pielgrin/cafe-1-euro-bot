const request = require('request');
const keys = require('../config/keys')

module.exports = (recipientId, text) => {
    return new Promise((resolve, reject) => {
        request({
            url: "https://graph.facebook.com/v2.6/me/messages",
            qs: {
                access_token: keys.FACEBOOK_ACCESS_TOKEN
            },
            method: "POST",
            json: {
                recipient: {id: recipientId},
                message: { text },
            }
        }, (error, response, body) => {
            if (error) {
                console.log("Error sending message: " + response.error);
                reject(response.error);
            } else {
                resolve(body);
            }
        });
    })
}