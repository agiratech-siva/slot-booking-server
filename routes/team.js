const express = require("express");
const router = express.Router();
const teamController = require("../controllers/team")

router.get("/getteamrequests/:id", teamController.getTeamRequests);

router.post("/teamacceptnotification/:employeeId/:teamNotificationId/:status/:teamname", teamController.teamAcceptRejectNotification);

router.post("/sendJoinTeamNotification/:id/:senderId/:teamName", teamController.sendJoinTeamNotification);

module.exports = router;




