const mongoose = require("mongoose");

const slotSchema = mongoose.Schema({
    Date: String,
    "10": {
        type: [{
            time: String,
            status: String,
            bookingId: {
                type: String,
            }
        }], 
    },

    "11": {
        type: [{
            time: String,
            status: String,
            bookingId: {
                type: String,
            }
        }], 
    },

    "12": {
        type: [{
            time: String,
            status: String,
            bookingId: {
                type: String,
            }
        }], 
    },

    "13": {
        type: [{
            time: String,
            status: String,
            bookingId: {
                type: String,
            }
        }], 
    },

    "14": {
        type: [{
            time: String,
            status: String,
            bookingId: {
                type: String,
            }
        }], 
    },

    "15": {
        type: [{
            time: String,
            status: String,
            bookingId: {
                type: String,
            }
        }], 
    },

    "16": {
        type: [{
            time: String,
            status: String,
            bookingId: {
                type: String,
            }
        }], 
    },

    "17": {
        type: [{
            time: String,
            status: String,
            bookingId: {
                type: String,
            }
        }], 
    },

    "18": {
        type: [{
            time: String,
            status: String,
            bookingId: {
                type: String,
            }
        }], 
    },

    "19": {
        type: [{
            time: String,
            status: String,
            bookingId: {
                type: String,
            }
        }], 
    },
    "20": {
        type: [{
            time: String,
            status: String,
            bookingId: {
                type: String,
            }
        }], 
    },
    "21": {
        type: [{
            time: String,
            status: String,
            bookingId: {
                type: String,
            }
        }], 
    },
    "22": {
        type: [{
            time: String,
            status: String,
            bookingId: {
                type: String,
            }
        }], 
    }



});

module.exports = mongoose.model("Slot", slotSchema);


