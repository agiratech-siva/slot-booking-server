const mongoose = require("mongoose");

const slotSchmea = mongoose.Schema({
    Date: String,
    "10": {
        type: [{
            time: Number,
            status: String,
        }], 
    },

    "11": {
        type: [{
            time: Number,
            status: String,
        }], 
    },

    "12": {
        type: [{
            time: Number,
            status: String,
        }], 
    },

    "13": {
        type: [{
            time: Number,
            status: String,
        }], 
    },

    "14": {
        type: [{
            time: Number,
            status: String,
        }], 
    },

    "15": {
        type: [{
            time: Number,
            status: String,
        }], 
    },

    "16": {
        type: [{
            time: Number,
            status: String,
        }], 
    },

    "17": {
        type: [{
            time: Number,
            status: String,
        }], 
    },

    "18": {
        type: [{
            time: Number,
            status: String,
        }], 
    }


});

module.exports = mongoose.model("Slot", slotSchmea);