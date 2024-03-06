const express = require("express");
const User = require("./util/database");
const app = express();
const mongoose = require("mongoose");
const {getAccessToken} = require("./notifications/sendnotification")
const cors = require("cors");
const uuid = require('uuid');
const getDb = require("./util/redisdatabase");

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
  console.log(userslist, typeof userslist);

  res.status(200).send({message: "successful", userslist: userslist});
})

app.get("/teamacceptnotification/:id/:status", async (req,res,next) => {
  console.log("inside team accept notifications");
  const {id,status} = req.params;
  if(status == "true"){
    await getDb().set(id,"true");
  }else{
    await getDb().del(id);
  }
  console.log(id,status);
  res.status(200).send({message: "successful"});
})

app.get("/sendJoinTeamNotification/:id", async(req,res,next) => {
  const id = req.params.id;
  const user = await User.findOne({employeeId: id});
  const registeredTokens = user.registeredToken;
  console.log(registeredTokens);
  const bearertoken = await getAccessToken();
  console.log(bearertoken);

  function generateNotificationRequestId() {
    const timestamp = new Date().getTime();
    const uniqueId = uuid.v4();
    const notificationRequestId = `${timestamp}_${uniqueId}`;
    return notificationRequestId;
  }
  const notificationRequestId = generateNotificationRequestId();
  await getDb().SETEX(notificationRequestId, 100, "false");
  registeredTokens.map(async (token) => {
    console.log("token", token);
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
                    "notification": {
                        "title": "team invitation",
                        "body": "accept the request friend"
                    },
                    "data" : {
                      "notificationRequestId": notificationRequestId
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
    "mongodb+srv://agirasiva:mYJlwoA7hfqkd12F@cluster0.evyud5n.mongodb.net/slotbooking?retryWrites=true&w=majority"
  )
  .then(() => {
    app.listen(process.env.PORT);
    console.log("db connected successfully");
  });
