const keys = require('../config/keys')
const controlUser = require('../services/controlUser');
const sendAction = require('../templates/sendAction');
const sendMessage = require('../templates/sendMessage');
const sendGenericMessage = require('../templates/sendGenericMessage');
const controlCafe = require('../services/controlCafe');
const messageHelper = require('../helpers/messageHelper');
const Cafe = require('../models/Cafe');


const sendCafesCarousel = (senderId, cafes, userCoordinates) => {
    var elements = []
    cafes.forEach(function (cafe) {
        let zoom = 15;
        let size = "500x300";
        let maptype = "roadmap";
        let address = cafe.fields.nom_du_cafe + " " + cafe.fields.adresse + " " + "Paris" + " " + cafe.fields.arrondissement
        let markers = "color:red%7C" + cafe.geometry.coordinates[1] + "," + cafe.geometry.coordinates[0];
        let image = "https://maps.googleapis.com/maps/api/staticmap?zoom=" + zoom + "&size=" + size + "&maptype=" + maptype + "&markers=" + markers + "&key=" + keys.API_GOOGLE_MAP_STATIC_VIEW

        let localisation = userCoordinates.lat + "," + userCoordinates.long
        let url = "https://www.google.com/maps?saddr=" + localisation + "&daddr=" + address + "&mode=walking"

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
        sendAction(senderId);
        sendMessage(senderId, message).then(() => 
            messageHelper.askLocation(senderId, "N'hésite pas si tu as de nouveau besoin de moi ! :)")
        )
    });
}

module.exports = async (event, useCurrentLocation) => {

    const senderId = event.sender.id;
    //let userCoordinates = event.message.attachments[0].payload.coordinates;
    let userCoordinates;
    if (useCurrentLocation) {
        console.log("j'ai bien reçu ta position");
        userCoordinates = event.message.attachments[0].payload.coordinates;
        controlUser.insertOrUpdateLastLocation(senderId, userCoordinates);
        console.log(userCoordinates);
    }
    else {
        userCoordinates = await controlUser.getUserPreviousLocation(senderId);
        console.log(userCoordinates);
    }

    Cafe.find({
        geometry: {
            $nearSphere: {
                $geometry: {
                    type: "Point",
                    coordinates: [userCoordinates.long, userCoordinates.lat]
                },
                $maxDistance: 10000
            }
        }
    }).limit(5).exec(function (err, items) {
        if (err) callback(err);
        //console.log(JSON.stringify(items))
        sendCafesCarousel(senderId, items, userCoordinates);
    })

   /* let cafes = await controlCafe.getFiveClosestCafes([userCoordinates.long, userCoordinates.lat]);
    console.log(cafes)
    sendCafesCarousel(senderId, cafes, userCoordinates);*/

}