const Slot = require("../models/slot");

exports.addSlotDataForTheDay = async (req,res,next) => {

    const date = new Date();
    const dateString = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();

    const objArray = [];
    let x= {}
    
    for(let i=0; i<60; i = i+ 15){
        x.time = i;
        x.status = "available";
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
            18: objArray
        })

        res.status(200).send({message: "slot creation successful", slotData: response});

    }catch(err){
        res.status(500).send({message: "internal server error"});
    }

}


exports.getSlotDataForDifferentTime = async(req,res,next) => {

    const time = req.query.time;
    const date = new Date();
    const dateString = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    const hrs = {};

    for(let i=10; i<=18; i++){

        if(i >= hours ){
            hrs[i] = 1;
        }
    }
    
    try{
        if(time && hours <=18 ){
            
            const response = await Slot.findOne({Date: dateString}, {[time]: true});
            return res.status(200).send({response: response});
        }

        else if(hours <= 18){

            const response = await Slot.find({Date: dateString}, hrs);
            if(response.length == 0){
                return res.status(404).send({message: "date not found"});
            }
            const [result] = response
            const slotsAvailable = result[hours];

            const filteredslot = slotsAvailable.filter((slot) => {

                if(slot["time"] > minutes){
                    return true;
                }

                return false;
            } );

    
            result[hours] = filteredslot;
            return res.status(200).send({response: result});
        }
        


        res.status(200).send({message: "end of the today session, comeback tomorrow for booking"});
        
        
    }
    catch(err){
        console.log(err);
        res.status(500).send({message: "internal server errror"});
    }

}

