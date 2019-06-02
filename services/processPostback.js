const keys = require('../config/keys');
const request = require('request');
const sendAction = require('../templates/sendAction');
const sendMessage = require('../templates/sendMessage');
const messageHelper = require('../helpers/messageHelper');
const controlUser = require('./controlUser');

/*const sendPassThread = (senderId) => {
    return new Promise(() => {
        request({
            url: "https://graph.facebook.com/v2.6/me/pass_thread_control",
            qs: { access_token: keys.FACEBOOK_ACCESS_TOKEN },
            method: 'POST',
            json: {
                recipient: { id: senderId },
                target_app_id: keys.MESSAGE_APP_ID,
            },
        },
            (err, res, body) => {
                if (err || body.error) {
                    console.log("UNABLE TO SEND PASS THREAD REQUEST", err || body.error);
                } else {
                    console.log("PASSED THREAD TO MESSAGE DASHBOARD BOT");
                    request({
                        url: 'https://graph.facebook.com/v2.6/me/messages',
                        qs: { access_token: keys.FACEBOOK_ACCESS_TOKEN },
                        method: 'POST',
                        json: {
                            recipient: { id: senderId },
                            message: {
                                text: "Vous voulez dire quelque chose à mes collègues humains ? On essayera de vous apporter de l'aide le plus rapidement possible. Je vous écoute...",
                            },
                        }
                    });
                }
            })
    })
}*/

const sendGetStartedProcess = async (senderId) => {
    request({
        url: "https://graph.facebook.com/v2.6/" + senderId,
        qs: {
            access_token: keys.FACEBOOK_ACCESS_TOKEN,
            fields: "first_name"
        },
        method: "GET"
    }, function (error, response, body) {
        let greeting = '';
        if (error) {
            console.error("Error getting user name : " + error);
        } else {
            let bodyObject = JSON.parse(body);
            console.log(bodyObject);
            name = bodyObject.first_name;
            greeting = "Salut " + name + " ! J'espère que tu vas bien ! :) ";
        }
        let message = greeting + "J'ai pour mission de t'aider à trouver les cafés à 1€ les plus proches de toi. Seule ta localisation 📍me permettra de t'aider dans cette quête."
        sendAction(senderId);
        sendMessage(senderId, message).then(() => {
            sendAction(senderId)
            messageHelper.askReport(senderId).then(() => {
                sendAction(senderId)
                messageHelper.askLocation(senderId)
            });
        })
    })
}

module.exports = (event) => {
    const senderId = event.sender.id;
    const payload = event.postback.payload;

    switch (payload) {
        case 'GET_STARTED_PAYLOAD':
            controlUser.insertOrUpdateUser(senderId);
            sendGetStartedProcess(senderId);
            break;

        case 'RESTART':
                messageHelper.askLocation(senderId, "Ravi de te revoir")
            break;

        /*case 'HANDOVER_PAYLOAD':
            sendPassThread(senderId);
            break;
        */  

        case 'BUG_REPORT':
            controlUser.setUserIsReportingABug(senderId, true);
            sendAction(senderId);
            sendMessage(senderId, "Je t'écoute, dis moi tout ...")
            break;
        default:
            console.log("PAYLOAD FAILED");
    }
}