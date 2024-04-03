const Slot = require("../models/slot");
const uuid = require("uuid");

exports.getSlotDataForDifferentTime = async(req,res,next) => {

    const time = req.query.time;
    const date = new Date();
    const dateString = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    console.log(hours,minutes,date,time);
    const hrs = {};

    for(let i=10; i<=22; i++){

        if(i >= hours ){
            hrs[i] = 1;
        }
    }

    hrs["_id"] = 0;
    console.log(hrs);
    try{
        if(time && hours <=22 ){
            
            const response = await Slot.findOne({Date: dateString}, {[time]: true});
            return res.status(200).send({response: response});
        }

        else if(hours <= 22){

            const response = await Slot.find({Date: dateString}, hrs);
            console.log(typeof response, response.length);

            if(response.length == 0){
                return res.status(404).send({message: "date not found"});
            }
            
            const [result] = response
            const slotsAvailable = result[hours];
            console.log("result",result, slotsAvailable);
            const filteredslot = slotsAvailable.filter((slot) => {

                if(slot["time"] > minutes){
                    return true;
                }

                return false;
            } );

            console.log(filteredslot);

    
            result[hours] = filteredslot;
            console.log(result, result[hours]);

            return res.status(200).send({response: result});
        }
        
        res.status(404).send({message: "end of the today session, comeback tomorrow for booking"});
        
        
    }
    catch(err){
        console.log(err);
        res.status(500).send({message: "internal server errror"});
    }

}

exports.addSlotDataForTheDay = async (req,res,next) => {

    const date = new Date();
    const dateString = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();

    const objArray = [];
    let x= {}
    
    for(let i=0; i<60; i = i+ 15){
        x.time = i.toString().padStart(2,"0");
        x.status = "available";
        x.bookingId = "";
        objArray.push(x);
        x = {};
    }

    try{
        const response = await Slot.create({
            Date: dateString,
            10: objArray,
            11: objArray,
            12: objArray,
            13: objArray,
            14: objArray,
            15: objArray,
            16: objArray,
            17: objArray,
            18: objArray,
            19: objArray,
            20: objArray,
            21: objArray,
            22: objArray
        })

        res.status(200).send({message: "slot creation successful", slotData: response});

    }catch(err){
        res.status(500).send({message: "internal server error"});
    }

}


exports.selectSlot = async (req,res,next) => {
    const {hour,time} = req.body;

    const date = new Date();
    const dateString = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();

    try{

        const response = await Slot.findOne({Date: dateString}, {[hour]: {$elemMatch: {time: time}}});
        console.log(response[hour][0].status);

        response[hour][0].status = "pending";
        await response.save();
        res.status(200).send({message: "ur booking is blocked, tell your teammates to accept the booking request", bookingId: bookingId});

    }catch(err){
        console.log(err);
        res.status(500).send({message: "internal server error"});
    }
    }