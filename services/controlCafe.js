const Cafe = require('../models/User');

const getFiveClosestCafes = async (userCoordinates) => {
    try {
        let cafes = await Cafe.find({
            geometry: {
                $nearSphere: {
                    $geometry: {
                        type: "Point",
                        coordinates: userCoordinates
                    },
                    $maxDistance: 10000
                }
            }
        }).limit(5);
        console.log(cafes)
        return cafes;
    } catch (err) {
        return err
    }
}

module.exports = {
    getFiveClosestCafes
}