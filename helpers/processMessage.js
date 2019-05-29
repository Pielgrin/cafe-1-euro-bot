const keys = require('../config/keys')
const apiAiClient = require('apiai')(keys.API_AI_TOKEN);
const sendMessage = require('../templates/sendMessage');
const sendGenericMessage = require('../templates/sendGenericMessage');
const sendAction = require('../templates/sendGenericMessage');
const mongoose = require('mongoose');
const Cafe = require('../models/Cafe')

const sendSmallTalkMessage = (senderId, message) => {
    const apiaiSession = apiAiClient.textRequest(message, {sessionId: 'pielgrin_bot'});

    apiaiSession.on('response', (response) => {
        const result = response.result.fulfillment.speech;

        sendMessage(senderId, result)
    });

    apiaiSession.on('error', error => console.log(error));
    apiaiSession.end();
}

const sendCafesCarousel = (senderId, cafes, userCoordinates) => {  
    var elements = []
    cafes.forEach(function(cafe) {
        let zoom = 15;
        let size = "500x300";
        let maptype = "roadmap";
        let address = cafe.fields.nom_du_cafe + " " + cafe.fields.adresse + " " + "Paris" + " " + cafe.fields.arrondissement
        let markers = "color:red%7C" + cafe.geometry.coordinates[1] + "," + cafe.geometry.coordinates[0];
        let image = "https://maps.googleapis.com/maps/api/staticmap?zoom="+zoom+"&size="+size+"&maptype="+maptype+"&markers="+markers+"&key="+keys.API_GOOGLE_MAP_STATIC_VIEW

        let localisation = userCoordinates.lat + "," + userCoordinates.long
        let url = "https://www.google.com/maps?saddr="+localisation+"&daddr="+address+"&mode=walking"
        
        element = {
            title: cafe.fields.nom_du_cafe,
            image_url: image,
            buttons: [
                {
                    type: "web_url",
                    url: url,
                    title: "📍"
                }
            ]
        }

        elements.push(element)
    })

    sendAction(senderId);
    sendGenericMessage(senderId, elements).then(() => {
        elements.length != 0 ? message = "Voici ce que j'ai trouvé 👍" : message = "Je n'ai rien trouvé près de ta localisation :/"
        sendMessage(senderId, message)
    });
}


module.exports = (event, hasAttachment) => {
    const senderId = event.sender.id;
    const message = event.message.text;
    
    console.log(JSON.stringify(event.message))

    if(hasAttachment){
        console.log("j'ai bien reçu ta position")
        
        let userCoordinates = event.message.attachments[0].payload.coordinates;
        console.log(userCoordinates)
       
        Cafe.find({
            geometry: {
                $nearSphere: {
                    $geometry: {
                        type: "Point",
                        coordinates: [ userCoordinates.long, userCoordinates.lat ]
                    },
                    $maxDistance: 10000
                }
            }
        }).limit(5).exec(function(err, items) {
            if(err) callback(err);
            //console.log(JSON.stringify(items))
            sendCafesCarousel(senderId, items, userCoordinates);
        })
    }

    else {
        sendSmallTalkMessage(senderId, message)
    }
}