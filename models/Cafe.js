const mongoose = require('mongoose');
const { Schema } = mongoose;

const cafeSchema = new Schema({
    datasetid: String,
    recordid: String,
    fields: {
        arrondissement: Number,
        adresse: String,
        prix_salle: String,
        geoloc: [Number],
        nom_du_cafe: String,
        prix_terasse: String,
        date: String,
        prix_comptoir: String
    },
    geometry: {
        type: {type: String},
        coordinates: [Number],
    },
    record_timestamp: String
});

module.exports = mongoose.model('cafes', cafeSchema);