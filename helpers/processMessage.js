const keys = require('../config/keys')
const apiAiClient = require('apiai')(keys.API_AI_TOKEN);
const request = require('request');
const sendMessage = require('../templates/sendMessage');
const sendGenericMessage = require('../templates/sendGenericMessage');
const sendAction = require('../templates/sendGenericMessage');


const sendSmallTalkMessage = () => {
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
        let message = "Voici ce que j'ai trouvé 👍"
        
        sendMessage(senderId, message)
    });

    /*new Promise(() => {
        request({
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: { access_token: keys.FACEBOOK_ACCESS_TOKEN },
            method: 'POST',
            json: {
                recipient: { id: senderId },
                message: {
                    attachment:{
                        type: "template",
                        payload: {
                            template_type: "generic",
                            elements: elements
                        }
                    }
                },
            }
        }, function(error, response, body) {
            console.log(error)
    
            if (!error && response.statusCode == 200) {
                let message = "Voici ce que j'ai trouvé 👍"
    
                sendMessage(senderId, message)
              }
        })
    })*/
}


module.exports = (event) => {
    const senderId = event.sender.id;
    const message = event.message.text;
    const userCoordinates = event.message.attachments[0].payload.coordinates;

    console.log(JSON.stringify(event.message.attachments[0].payload.coordinates))

    if(userCoordinates){
        console.log("j'ai bien reçu ta position")
        console.log(userCoordinates)

        var MongoClient = require('mongodb').MongoClient;
        var mongoose = require('mongoose'),
            Schema = mongoose.Schema

        var mongoDB = keys.mongoURI;
        mongoose.connect(mongoDB, { useNewUrlParser: true});

        var db = mongoose.connection;
        db.on('error', console.error.bind(console, 'MongoDB connection error:'));

        db.once('open', function(){
            db.collection("cafes").find({
                geometry: {
                    $nearSphere: {
                        $geometry: {
                            type: "Point",
                            coordinates: [ userCoordinates.long, userCoordinates.lat ]
                        },
                        $maxDistance: 10000
                    }
                }
            }).limit(5).toArray(function(err, items) {
                if(err) callback(err);
                sendCafesCarousel(senderId, items, userCoordinates);
            })
        })
    }

    else {
        sendSmallTalkMessage(senderId, message)
    }
}