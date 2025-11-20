// coba Bonus Points A (Booking & Check-in/Check-out System)
const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const bookingController = require("../controllers/bookingController");

// user books a slot, becomes RESERVED
router.post("/:slotId", auth, bookingController.bookSlot);

// user check-in, becomes OCCUPIED
router.put("/:bookingId/checkin", auth, bookingController.checkIn);

// user check-out, becomes AVAILABLE
router.put("/:bookingId/checkout", auth, bookingController.checkOut);

module.exports = router;
