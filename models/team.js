const mongoose = require("mongoose");
const User = require("./user");

const teamSchema = mongoose.Schema({
    
    name: String,
    
    members: {
        type: [String],
        ref: User
    },

},{timeStamps: true});


module.exports = mongoose.model("Team", teamSchema);