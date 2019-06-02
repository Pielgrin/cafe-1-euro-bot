const processMessage = require('../services/processMessage');
const processPostback = require('../services/processPostBack');

module.exports = (req, res) => {
    const webhook_events = req.body.entry[0];

    /*if(req.body.object === 'page') {
        req.body.entry.forEach(entry => {
            entry.messaging.forEach(event => {
                if(event.message && event.message.text) {
                    processMessage(event);
                }
            })
        })
        res.status(200).end();
    }*/
    let text, title, payload;

    /*if(webhook_events.standby) {
        webhook_events.standby.forEach(event => {
            const psid = event.sender.id;
            const message = event.message;

            if(message && message.quick)
        })
    }*/
    if(webhook_events.messaging){
        webhook_events.messaging.forEach(event => {
            const psid = event.sender.id,
            message = event.message,
            postback = event.postback;

            console.log(JSON.stringify(event))
            if(event.pass_thread_control) {
                text = "L'opérateur a décidé de mettre fin à la conversation. Votre assistant personnel prend donc le relais ! :)"
                quick_replies = [{
                    content_type: 'text',
                    title: 'Pass to Inbox',
                    payload: 'pass_to_inbox'
                }]   

                sendQuickReply(psid, text, quick_replies);
            }
            else if (postback) {
                processPostback(event);
            }
            else if (message && !message.is_echo) {
                if(message.text){
                    processMessage(event, false);
                }
                else if(message.attachments[0].type == "location"){
                    processMessage(event, true);
                    //processLocation(event, true);
                }
                else {
                    console.log("WTTTTTTTFFFFFF ???")
                }
            }
        })
    }
    res.sendStatus(200);
}