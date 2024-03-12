const express = require("express");
const app = express();
const userRoutes = require("./routes/users");
const teamRoutes = require("./routes/team");
const slotRoutes = require("./routes/slot");
const mongoose = require("mongoose");
const cors = require("cors");
const { config } = require("dotenv");
config();

const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

app.use("/users", userRoutes);
app.use("/teams", teamRoutes);
app.use("/slots", slotRoutes);

app.use((req, res, next) => {
  res.status(404).send({ message: "page not found" });
});

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    app.listen(port);
    console.log("db connected successfully");
  })
  .catch((err) => {
    console.log("issue in connecting db connection", err);
  });

