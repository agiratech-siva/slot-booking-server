const mongoose = require("mongoose");


const bookingSchema = mongoose.Schema({


    bookingId: {
        type: String,
        required: true
    },

    Date: {
        type: String,
        required: true
    },

    hour: {
        type: Number,
        required: true
    },

    time: {
        type: String,
        required: true,
    },

    Initiator: {
        type: {
            "employee-id": String,
            "name": String
        }
    },

    otherteammember : {
        type: {
            "employee-id": String,
            "name": String,
            "status": String
        },
        required: true
    },

    opponent1: {
        type: {
            "employee-id": String,
            "name": String,
            "status": String
        },
        required: true
    },

    opponent2: {
        type: {
            "employee-id": String,
            "name": String,
            "status": String
        },
        required: true
    },

    myteamname : String,
    opponentteamname: String


},{timestamps: true});


module.exports = mongoose.model("Booking", bookingSchema);
