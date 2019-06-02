const keys = require('../config/keys');
const request = require('request');
const User = require('../models/User');

const setUserIsReportingABug = (senderId, isUserReportingABug) => {
    var user = { is_reporting_a_bug: isUserReportingABug }
    User.findOneAndUpdate(
        { facebook_id: senderId },
        user,
        { new: true, runValidators: true },
        function (err, user) {
            if (err) console.log(err)
        }
    )
}

const getUserIsReportingABug = async (senderId) => {
    try {
        let user = await User.findOne({ facebook_id: senderId }).exec();
        console.log(user)
        return user.is_reporting_a_bug;
    } catch (err) {
        return err
    }
}

const insertOrUpdateUser = (senderId) => {
    request({
        url: "https://graph.facebook.com/v2.6/" + senderId,
        qs: {
            access_token: keys.FACEBOOK_ACCESS_TOKEN,
            fields: "first_name,last_name,locale,timezone"
        },
        method: "GET"
    }, function (error, response, body) {
        if (error) {
            console.error("Error getting user name : " + error);
        } else {
            let bodyObject = JSON.parse(body);
            console.log(bodyObject);
            first_name = bodyObject.first_name;
            last_name = bodyObject.last_name;
            locale = bodyObject.locale;
            timezone = bodyObject.timezone;
            //profile_pic = bodyObject.first_name;
            var user = { facebook_id: senderId, first_name: first_name, last_name: last_name, locale: locale, timezone: timezone, last_message: Date.now(), is_reporting_a_bug: false }
            User.findOneAndUpdate(
                { facebook_id: senderId },
                user,
                { upsert: true, new: true, runValidators: true },
                function (err, user) {
                    if (err) console.log(err)
                }
            )
        }
    });
}

const insertOrUpdateLastLocation = (senderId, location) => {
    var user = { last_location: location }
    User.findOneAndUpdate(
        { facebook_id: senderId },
        user,
        { new: true, runValidators: true },
        function (err, user) {
            if (err) console.log(err)
        }
    )
}

const getUserPreviousLocation = async (senderId) => {
    try {
        let user = await User.findOne({ facebook_id: senderId }).exec();
        console.log(user)
        return user.last_location;
    } catch (err) {
        return err
    }
}

module.exports = {
    setUserIsReportingABug,
    getUserIsReportingABug,
    insertOrUpdateUser,
    insertOrUpdateLastLocation,
    getUserPreviousLocation
}