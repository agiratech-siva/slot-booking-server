
const { Server } = require("socket.io");
const Booking = require("../models/booking");
const Slot = require("../models/slot");
const User = require("../models/user");
const bookingpipeline = [

    {
        $match: {
            $or: [
                { "operationType": "update" }
            ]
        }
    }
]

function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
    }
  });

  io.on("connection", (socket) => {
    console.log("A user connected");
    console.log(socket.id);

    Booking.watch(bookingpipeline).on('change',async data => {
      console.log(data);
      const id = data.documentKey._id;
      
      try{
        const response = await Booking.findOne({_id: id});
      
        if(response.otherteammember.status == "accepted" && response.opponent1.status == "accepted" && response.opponent2.status == "accepted"){

              const members = await User.find({$or: [
                  {employeeId : response.otherteammember["employee-id"]},
                  {employeeId : response.opponent1["employee-id"]},
                  {employeeId : response.opponent2["employee-id"]},
                  {employeeId : response.Initiator["employee-id"]},
              ]
                });

              console.log(members);

              if(members[0].maxSlots != 0 && members[1].maxSlots !=0  && members[2].maxSlots != 0 && members[3].maxSlots !=0){
                members.forEach(async (member) => {
                  member.maxSlots = member.maxSlots - 1;
                  await member.save();
                });
              }

              else if (members[0].maxSlots == 0){
                return socket.emit(`booking-status-${socket.id}`, {response: `${members[0].fullname} today quota is over`, isBooked: false});
              }

              else if (members[1].maxSlots == 0){
                return socket.emit(`booking-status-${socket.id}`, {response: `${members[1].fullname} today quota is over`, isBooked: false});
              }

              else if (members[2].maxSlots == 0){
                return socket.emit(`booking-status-${socket.id}`, {response: `${members[2].fullname} today quota is over`, isBooked: false});
              }

              else if (members[3].maxSlots == 0){
                return socket.emit(`booking-status-${socket.id}`, {response: `${members[3].fullname} today quota is over`, isBooked: false});
              }

              
              const filter = { Date: response.Date };
              const update = {
                  $set: {
                      [`${response.hour}.$[elem].status`]: "booked",
                      [`${response.hour}.$[elem].bookingId`]: response.bookingId 
                  }
              };
              const options = {
                  arrayFilters: [{ "elem.time": response.time }],
                  new: true 
              };

              const updatedSlot = await Slot.findOneAndUpdate(filter, update, options);

             
              return socket.emit(`booking-status-${socket.id}`, {response: updatedSlot, isBooked: true});
        }
        else if(response.otherteammember.status == "declined" || response.opponent1.status == "declined" || response.opponent2.status == "declined"){
              const data = await Slot.findOne({Date: response.Date}, {[response.hour] : {$elemMatch: {
                time: response.time
              }}});

              
              data[response.hour][0].status = "available";
              await data.save();
              
              return socket.emit(`booking-status-${socket.id}`,{response: response, isBooked: false});
        }
        socket.emit(`booking-status-${socket.id}`, {response: response});
      }catch(err){
        console.log(err);
        
      }
      
      
    });

    
  });

  return io;
};

module.exports = setupSocket;
