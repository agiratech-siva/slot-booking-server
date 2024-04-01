const express = require("express");

const router = express.Router();

const bookingController = require("../controllers/booking");

router.post("/",  bookingController.addBookingData);
router.get("/getbookingrequests/:id", bookingController.getBookingRequests);
router.post("/bookingacceptreject", bookingController.bookingAcceptReject);

module.exports = router;