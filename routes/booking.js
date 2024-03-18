const express = require("express");

const router = express.Router();

const bookingController = require("../controllers/booking");

router.post("/",  bookingController.addBookingData);

module.exports = router;