const express = require("express");
const router = express.Router();

const slotController = require("../controllers/slot");

router.get("/refreshSlotForTheDay", slotController.addSlotDataForTheDay );

router.get("/getSlotDataForDifferentTime", slotController.getSlotDataForDifferentTime);

router.post("/addSlotDataForTheDay", slotController.addSlotDataForTheDay);

module.exports = router;