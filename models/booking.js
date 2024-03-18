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
        type: Number,
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
            "status": Boolean
        },
        required: true
    },

    receiver2: {
        type: {
            "employee-id": String,
            "name": String,
            "status": Boolean
        },
        required: true
    },

    receiver3: {
        type: {
            "employee-id": String,
            "name": String,
            "status": Boolean
        },
        required: true
    }


})


module.exports = mongoose.model("Booking", bookingSchema);
