const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    facebook_id: String,
    first_name: String,
    last_name: String,
    created_on: { type: Date, default: Date.now },
    last_message: { type: Date, default: Date.now },
    locale: String,
    timezone: Number,
    is_reporting_a_bug: { type: Boolean, default: false}
});

module.exports = mongoose.model('users', userSchema);