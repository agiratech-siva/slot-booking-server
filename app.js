const express = require("express");
const User = require("./util/database");
const app = express();
const mongoose = require("mongoose");

const cors = require("cors");

app.use(cors());
app.use(express.json());

app.get("/", (req,res,next) => {
    res.status(200).send({message: "welcome to my server"});
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
    app.listen(8000);
    console.log("db connected successfully");
  });
