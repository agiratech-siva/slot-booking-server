const mongoose = require("mongoose");
const User = require("./user");

const teamSchema = mongoose.Schema({
    
    name: String,
    
    members: {
        type: [{
            ObjectId: {
                type: mongoose.Schema.ObjectId,
                ref: User
            },
            employeeId: String,
            
        }],
    },

},{timeStamps: true});


module.exports = mongoose.model("Team", teamSchema);