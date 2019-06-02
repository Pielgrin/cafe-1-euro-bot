const sendQuickReplies = require('../templates/sendQuickReplies');
const sendButtonMessage = require('../templates/sendButtonMessage');
const controlUser = require('../services/controlUser');



const askLocation = async (senderId, text = "Quelle est ta localisation ?") => {
    // text = "Quelle est ta localisation ?"
    //text = typeof(text !== undefined ? text : "Quelle est ta localisation ?")
     quick_replies = [
         {
             content_type: "location",
         }
     ]
 
     let previousLocation = await controlUser.getUserPreviousLocation(senderId);
     if(JSON.stringify(previousLocation) != "{}"){
         quick_replies.unshift({
             content_type: "text",
             title: "↩️",
             payload: "USE_LAST_LOCATION"
         })
     }
 
     return sendQuickReplies(senderId, text, quick_replies);
 }

 const askReport = (senderId) => {
    text = "Ce bot est actuellement en phase de test. Il est probable qu'un bug puisse se produire ou même si tu rencontres un problème avec un des cafés, n'hésite pas à nous le signaler via le bouton ci-dessous. Une option dans le menu est aussi disponible pour signaler un problème."
    buttons = [{
        type: "postback",
        title: "Signaler un problème",
        payload: "BUG_REPORT"
    }]

    return sendButtonMessage(senderId, text, buttons);
}

module.exports = {
    askLocation,
    askReport
}