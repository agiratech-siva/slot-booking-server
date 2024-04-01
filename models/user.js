const mongoose = require("mongoose");
const Booking = require("./booking");

const userSchema = mongoose.Schema({
    name: {
        type: String,
    },

    employeeId: {
        type: String
    },

    maxSlots: {
        type: Number,
    },

    registeredToken: [String],

    fullname: {
        type: String,
    },

    phoneNumber : {
        type: String
    },

    mail: {
        type: String
    },

    teamusersId: [String],

    teamRequests : [{
        teamNotificationId: String,
        teamName: String,
        senderDetails : {
            employee_Id: String,
            fullname: String,
            mail : String
        }
    }],

    bookingRequests :  [{
        objectId: {
            type: mongoose.Schema.ObjectId,
            ref: Booking,
        },
        bookingId: String,
        time: Number,
        isValid: Boolean
    }],

},{timestamps: true});


module.exports = mongoose.model("User",userSchema);