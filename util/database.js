const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    name: {
        type: String,
    },

    employeeId: {
        type: String
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
    }

},{timeStamps: true});


module.exports = mongoose.model("User",userSchema);