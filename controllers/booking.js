const Slot = require("../models/slot");
const Booking = require("../models/booking");
const uuid = require("uuid");

const bookingpipeline = [

    {
        $match: {
            $or: [
                {"otherteammember.status": true},
                {"receiver2.status": true},
                {"receiver3.status": true},
                { "operationType": "update" }
            ]
        }
    }
]


Booking.watch(bookingpipeline).on('change', data => console.log(data));


exports.addBookingData = async ( req,res,next) => {

    const date = new Date();

    const dateString = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();

    const {hour,minutes,initiator,otherteammember,opponent1, opponent2} = req.body;
    
    console.log(initiator,otherteammember,opponent1,opponent2);

    try{

        const available = await Slot.findOne({Date: dateString}, {[hour] : {$elemMatch: {
            time: minutes
        }}});

        
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
                "status": false
            },
            otherteammember: {
                "employee-id": otherteammember.employeeId,
                "name": otherteammember.name,
                "status": false
            },
            receiver2: {
                "employee-id": opponent1.employeeId,
                "name": opponent1.name,
                "status": false
            },
            receiver3: {
                "employee-id": opponent2.employeeId,
                "name": opponent2.name,
                "status": false
            }
        })
        available[hour][0].status = "pending";

        await available.save();

        res.status(200).send({message: "booking details added successfully"});

    }catch(err){
        console.log(err);
        res.status(500).send({message: "internal server error"});
    }
}