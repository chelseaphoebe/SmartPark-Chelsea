const mongoose = require('mongoose');

const parkingSlotSchema = new mongoose.Schema(
  {
    lot: { type: mongoose.Schema.Types.ObjectId, ref: "ParkingLot" },
    code: String,
    status: { type: String, default: "AVAILABLE" },

  },
  { timestamps: true }
);


module.exports = mongoose.model('ParkingSlot', parkingSlotSchema);
