const express = require("express");
const router = express.Router();
const teamController = require("../controllers/team")

router.get("/getteamrequests/:id", teamController.getTeamRequests);

router.get("/getMyTeams/:id", teamController.getMyTeams);

router.get("/getOpponentTeams/:member1/:member2", teamController.getOpponentTeams);

router.post("/teamacceptnotification/:employeeId/:teamNotificationId/:status/:teamname", teamController.teamAcceptRejectNotification);

router.post("/sendJoinTeamNotification/:id/:senderId/:teamName", teamController.sendJoinTeamNotification);

module.exports = router;




