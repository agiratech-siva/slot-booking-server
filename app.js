const express = require("express");
const User = require("./models/user");
const Team = require("./models/team");
const app = express();
const mongoose = require("mongoose");
const {getAccessToken,sendTeamAcceptRejectNotification} = require("./notifications/sendnotification")
const cors = require("cors");
const uuid = require('uuid');
const port = process.env.PORT || 8000;
const {config} = require("dotenv");
config();

app.use(cors());
app.use(express.json());

app.get("/", (req,res,next) => {
    res.status(200).send({message: "welcome to my server"});
})

app.get("/listusersforteam/:id", async (req,res,next) => {
  const id = req.params.id;
  const membersId = await User.findOne({employeeId: id}, {teamusersId: true, _id: false});
  const userslist = await User.find({
    $and: [
      {employeeId: { $nin: membersId.teamusersId }},
      {employeeId: {
        $ne: id
      }}
    ]
  });
 

  res.status(200).send({message: "successful", userslist: userslist});
})

app.get("/teamacceptnotification/:employeeId/:teamNotificationId/:status/:teamname", async (req,res,next) => {
  const {employeeId,teamNotificationId,status,teamname} = req.params;
  const user = await User.findOne({employeeId: employeeId});

  if(status == "true"){
    let requiredData;
    console.log(user.teamRequests.length);
    user.teamRequests = user.teamRequests.filter((obj) => {
      if(obj.teamNotificationId == teamNotificationId){
        requiredData = obj;
        return false
      }
      return true;
    })
    console.log(user.teamRequests.length);
    if(!requiredData){
      return res.status(200).send({message: "successful"});
    }
    const senderId = requiredData.senderDetails.employee_Id;
    user.teamusersId.push(senderId);
    const senderUser = await User.findOne({employeeId: senderId});
    senderUser.teamusersId.push(employeeId);
    await Team.create({
      name: teamname,
      members: [user._id, senderUser._id]
    })
    await user.save();
    await senderUser.save();
    senderUser.registeredToken.map(registeredToken => {
      sendTeamAcceptRejectNotification(registeredToken,'accepted',teamname);
    })
    


  }else{
    user.teamRequests = user.teamRequests.filter((obj) => {
      if(obj.teamNotificationId == teamNotificationId){
        return false
      }
      return true;
    })
    await user.save();
  }
  
  res.status(200).send({message: "successful"});
})


app.get("/getteamrequests/:id", async (req,res,next) => {
  const id = req.params.id;
  console.log("inthefield");
  try{
    const data = await User.aggregate([
      {
          $match: { employeeId: id } 
      },
      {
          $unwind: "$teamRequests"
     },
      {
          $lookup: {
              from: "users", 
              localField: "teamRequests.senderDetails.employee_Id",
              foreignField: "employeeId",
              as: "senderDetails" 
          }
      },
      {
          $unwind: "$senderDetails" 
      },
      {
          $group: {
              _id: "$_id", 
            
              teamRequests: { 
                  $push: { 
                      $mergeObjects: [
                          "$teamRequests",
                          { 
                              senderDetails: { 
                                  fullname: "$senderDetails.fullname",
                                  mail: "$senderDetails.mail"
                              }
                          }
                      ]
                  } 
              }
          }
      },
      {
          $project: {
              _id: 0, 
              name: 1,
              teamRequests: 1
          }
      }
  ]);
  
  console.log(data);

    res.status(200).send({message: "successful", data: data});
  }catch (err){
    console.log(err);
    res.status(500).send({message: "server error"});
  }
  
  
})

app.get("/sendJoinTeamNotification/:id/:senderId/:teamName", async(req,res,next) => {
  const id = req.params.id;
  const senderId = req.params.senderId;
  const teamName = req.params.teamName;
  const user = await User.findOne({employeeId: id});
  console.log(user);
  const senderusername = await User.findOne({employeeId: senderId},{fullname: true, _id: false});
  console.log(id,senderId);
  console.log("senderusername",senderusername);
  const registeredTokens = user.registeredToken;
  const bearertoken = await getAccessToken();
  function generateNotificationRequestId() {
    const timestamp = new Date().getTime();
    const uniqueId = uuid.v4();
    const notificationRequestId = `teamnotification_${timestamp}_${uniqueId}`;
    return notificationRequestId;
  }
  const notificationRequestId = generateNotificationRequestId();
  const generate = {
    teamNotificationId: notificationRequestId,
    teamName: teamName,
        senderDetails : {
            employee_Id: senderId
        }
  }
  user.teamRequests.push(generate);
  await user.save();

  registeredTokens.map(async (token) => {
    
    try {
        console.log("token fetch started");
        const response = await fetch("https://fcm.googleapis.com/v1/projects/slot-booking-e099d/messages:send", {
            method: "post",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${bearertoken}`
            },
            body: JSON.stringify({
                "message": {
                    "token": `${token}`,
                    "data" : {
                      "title": `team invitation from ${senderusername.fullname}}`,
                      "body": `team name: ${teamName} `,
                      "teamName" : `${teamName}`,
                      "notificationRequestId": notificationRequestId,
                      "receiverId": id
                    },
                    "webpush": {
                        "fcm_options": {
                            "link": "http://localhost:7000/"
                        }
                    }
                }
            })
        });
        console.log("token fetch result");
        const result = await response.json();
        console.log("result", result);
    } catch (err) {
      console.log("requested entity not found");
      console.log(err);
    }
});

  res.status(200).send({message: "successful"});
})

app.post("/addRegistrationToken/:id", async (req,res,next) => {
  const id = req.params.id;
  const {token} = req.body;
  const response = await User.findOne({employeeId: id});
    console.log("response", response);
    const present = response.registeredToken.find((tok) => {
        return tok === token;
    });

    if(!present){
        response.registeredToken.push(token);
        await response.save();
        return res.status(200).send({message: "updated suucessfully"});
    }
    res.status(200).send({message:" already present"});
})


app.post("/users", async (req, res, next) => {
  const { name, mailId, phone, employeeId } = req.body;
  try {
    const user = await User.findOne({ employeeId: employeeId });
    if (!user) {
      await User.create({
        mail: mailId,
        fullname: name,
        phoneNumber: phone,
        employeeId: employeeId,
      });
    }
    res.status(200).send({ message: "inserted details successful" });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "something went wrong" });
  }
});

app.get("/getUserdetails/:id", async (req, res, next) => {
  const id = req.params.id;
  try {
    const userdetails = await User.findOne({ employeeId: id });
    res
      .status(200)
      .send({
        message: "successful",
        fullname: userdetails.fullname,
        phoneNumber: userdetails.phoneNumber,
        employeeId: userdetails.employeeId,
        mail: userdetails.mail,
      });
  } catch (err) {
    console.log(err);
    res.status(500).send({message: "server error"});
  }
});

app.use((req,res,next) => {
    res.status(404).send({message: "page not found"});
});


mongoose
  .connect(
    process.env.MONGO_URL
  )
  .then(() => {
    app.listen(port);
    console.log("db connected successfully");
  });
