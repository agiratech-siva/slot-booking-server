const Slot = require("../models/slot");
const uuid = require("uuid");
const Booking = require("../models/booking");
const User = require("../models/user");
// const getDb = require("../util/redisdatabase");

exports.addBookingData = async ( req,res,next) => {

    const date = new Date();

    const dateString = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();

    const {hour,minutes,initiator,otherteammember,opponent1, opponent2, myteamname, opponentteamname} = req.body;
    console.log(hour, typeof hour, minutes, typeof minutes);
    let timerId;
    console.log(initiator,otherteammember,opponent1,opponent2, myteamname, opponentteamname);

    try{

        const available = await Slot.findOne({Date: dateString}, {[hour] : {$elemMatch: {
            time: minutes
        }}});

        console.log(available);
        if(!available){
            return res.status(404).send({message: "no such slot found"});
        }
        
       
        if(available[hour][0].status == "pending"){
            return res.status(409).send({message: "slot is already blocked for booking, check after 2 minutes, it may get released "});
        }

        else if (available[hour][0].status == "booked"){
            return res.status(404).send({message: "slot is booked"});
        }
        
        function generateNotificationRequestId() {
            const uniqueId = uuid.v4();
            const notificationRequestId = `bookingId_${uniqueId}`;
            return notificationRequestId;
        }

        const bookingId = generateNotificationRequestId();

        const response = await Booking.create({
            
            bookingId: bookingId,

            Date: dateString,

            hour: hour,

            time: minutes,

            Initiator: {
                "employee-id": initiator.employeeId,
                "name": initiator.name,
                "status": "false"
            },
            otherteammember: {
                "employee-id": otherteammember.employeeId,
                "name": otherteammember.name,
                "status": "false"
            },
            opponent1: {
                "employee-id": opponent1.employeeId,
                "name": opponent1.name,
                "status": "false"
            },
            opponent2: {
                "employee-id": opponent2.employeeId,
                "name": opponent2.name,
                "status": "false"
            },

            myteamname: myteamname,
            opponentteamname: opponentteamname
        })
        available[hour][0].status = "pending";
        // await getDb().setEx(bookingId, 120, "true");
        await available.save();

        const otherTeamMemberuser = await User.findOne({employeeId: otherteammember.employeeId});
        const opponentUsers = await User.find({ 
            $or: [
              { employeeId: opponent1.employeeId },
              { employeeId: opponent2.employeeId }
            ]
          });     
        console.log(opponentUsers);

        otherTeamMemberuser.bookingRequests.push({objectId: response._id,bookingId: bookingId,time: Date.now(),isValid: true});
        opponentUsers.forEach(async (opponentUser) => {
          opponentUser.bookingRequests.push({
            objectId: response._id,
            bookingId: bookingId,
            time: Date.now(),
            isValid: true,
          });

          await opponentUser.save(); 
        });
        await otherTeamMemberuser.save();

        function updateSlotStatus(hour,minutes) {
            
    
            timerId = setTimeout(async () => {
                try {
                    const available = await Slot.findOne({ Date: dateString }, { [hour]: { $elemMatch: { time: minutes } } });
                    if (available[hour][0].status === "pending") {
                        available[hour][0].status = "available";
                        await available.save();
                        clearUpdateSlotStatusTimer();
                    }
                } catch (err) {
                    console.log(err);
                }
            }, 120000);
          
              
              
            } 
        updateSlotStatus(hour,minutes);
        function clearUpdateSlotStatusTimer() {
            clearTimeout(timerId);
        }
       
        res.status(200).send({message: "booking details added successfully"});

    }catch(err){
        console.log(err);
        res.status(500).send({message: "internal server error"});
    }
}

exports.getBookingRequests = async (req,res,next) => {

    const employeeId = req.params.id;

    try{
        const request = await User.findOne({
            employeeId: employeeId
        }).populate({
            path: 'bookingRequests.objectId'
        });

        if(!request){
            res.status(404).send({message: "data not found"});
        }
        console.log(request.bookingRequests);

        const validBookingRequests = request.bookingRequests.filter((request) => {
            if(Date.now() - request.time < 110000 && request.isValid == true){
                return true;
            }
            return false;
        })

        
        res.status(200).send({response : validBookingRequests});

    }catch(err){
        console.log(err);
        res.status(500).send({error: "internal server error"});
    }
}

exports.bookingAcceptReject = async(req,res,next) => {

    const {role,status,bookingId,employeeId} = req.body;

    if(!role && !status && !bookingId){
        res.status(400).send({message: "required details not found"});
    }
    try{
        const response = await Booking.findOneAndUpdate({bookingId: bookingId}, {$set: {[role + '.status']: status }});
        const result = await User.findOne({employeeId: employeeId},{bookingRequests: {$elemMatch : {bookingId: bookingId}}});
        result.bookingRequests[0].isValid = false;
        
        await result.save();

        res.status(200).send({message: "booking status updated", response: response});
    }catch(err){
        console.log(err);
        res.status(500).send({message: "internal server error"});
    }
}