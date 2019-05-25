const keys = require('../config/keys');
const request = require('request');
const sendAction = require('../templates/sendAction');
const sendMessage = require('../templates/sendMessage');
const sendQuickReplies = require('../templates/sendQuickReplies');

const user = (senderId, callback) => {
    request({
        url: 'https://graph.facebook.com/' + senderId,
        qs: { fields: 'first_name, last_name, profile_pic', access_token: keys.FACEBOOK_ACCESS_TOKEN },
        method: 'GET'
    }, (error, response, body) => {
        console.log(body)
        if (!error && response.statusCode === 200) {
            console.log('Message sent succesfully');
        }
        else {
            console.error('Error: ' + error);
        }
        callback(body);
    })
}

/*const askToSpeakToTeam = (senderId) => {
    return new Promise((resolve, reject) => {
        request({
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: { access_token: keys.FACEBOOK_ACCESS_TOKEN },
            method: 'POST',
            json: {
                recipient: { id: senderId },
                message: {
                    attachment: {
                        type: "template",
                        payload: {
                            template_type: "button",
                            text: "Si vous souhaitez contacter mon équipe humaine, je peux leur transmettre un message. Cette fonctionnalité est également disponible depuis le menu",
                            buttons: [
                                {
                                    type: "postback",
                                    title: "Contacter l'équipe",
                                    payload: "HANDOVER_PAYLOAD"
                                }
                            ]
                        }
                    }
                },
            }
        }, function (error, response, body) {
            if (error) {
                console.log("Error sending message: " + response.error);
                reject(response.error);
            } else {
                resolve(body);
            }
        })
    })
}*/

const askLocation = (senderId) => {
    text = "Quelle est ta localisation ?"
    quick_replies = [{
        content_type: 'location'
    }]   

    sendQuickReplies(senderId, text, quick_replies);
}

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
            askLocation(senderId)
        })
    })
}

module.exports = (event) => {
    const senderId = event.sender.id;
    const payload = event.postback.payload;

    switch (payload) {
        case 'GET_STARTED_PAYLOAD':
           /* console.log(JSON.stringify(user(senderId, () => { })));
            console.log(senderId);*/

            sendGetStartedProcess(senderId);
            break;

        /*case 'HANDOVER_PAYLOAD':
            sendPassThread(senderId);
            break;
        */
        default:
            console.log("PAYLOAD FAILED");
    }
}

