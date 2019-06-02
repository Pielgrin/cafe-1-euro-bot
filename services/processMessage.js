const keys = require('../config/keys')
const apiAiClient = require('apiai')(keys.API_AI_TOKEN);
const sendAction = require('../templates/sendAction');
const sendMessage = require('../templates/sendMessage');
const messageHelper = require('../helpers/messageHelper');
const sendEmail = require('../templates/sendEmail');
const nodemailer = require('nodemailer');
const controlUser = require('../services/controlUser'); 
const processLocation = require('../services/processLocation');



const sendSmallTalkMessage = (senderId, message) => {
    const apiaiSession = apiAiClient.textRequest(message, { sessionId: 'pielgrin_bot' });

    apiaiSession.on('response', (response) => {
        const result = response.result.fulfillment.speech;
        sendAction(senderId);
        sendMessage(senderId, result)
    });

    apiaiSession.on('error', error => console.log(error));
    apiaiSession.end();
}


module.exports = async (event, hasLocation) => {
    const senderId = event.sender.id;
    const message = event.message.text;
    var _isUserReportingABug = await controlUser.getUserIsReportingABug(senderId);
    console.log(JSON.stringify(event.message))

    if((hasLocation || message == "↩️") && !_isUserReportingABug){
        processLocation(event, hasLocation ? true : false)
    }

    else if (_isUserReportingABug) {
        var transporter = nodemailer.createTransport({
            host: "ssl0.ovh.net",
            port: 465,
            secure: true,
            auth: {
                user: 'contact@pierrepellegrin.com',
                pass: keys.MAIL_PASSWORD
            }
        });

        var mailOptions = {
            from: 'contact@pierrepellegrin.com',
            to: 'pierre.pellegrin@viacesi.fr',
            subject: 'BUG REPORT - 1€ le café - Chatbot',
            text: message
        }
        controlUser.setUserIsReportingABug(senderId, false)
        sendEmail(transporter, mailOptions);
        sendAction(senderId);
        sendMessage(senderId, "C'est noté, merci beaucoup pour ton signalement ! :)")
            .then(() => {messageHelper.askLocation(senderId, "N'hésite pas si tu as de nouveau besoin de moi ! :)")})
    }

    else {
        sendSmallTalkMessage(senderId, message)
    }
}