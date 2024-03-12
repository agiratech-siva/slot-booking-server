const express = require("express");
const router = express.Router();

const usersController = require("../controllers/users");

router.get("/listusersforteam/:id", usersController.listUsersForTeam);

router.post("/addusertothedb", usersController.addUserToTheDb);

router.post("/addRegistrationToken/:id", usersController.addRegistrationToken);

router.get("/getUserdetails/:id", usersController.getMyDetails);

module.exports = router;
