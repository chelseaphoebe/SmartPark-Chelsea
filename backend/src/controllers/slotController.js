const ParkingSlot = require('../models/ParkingSlot');
const ParkingLot = require('../models/ParkingLot');

exports.getSlotsByLot = async (req, res) => {
  try {
    const { lotId } = req.params;
    const lot = await ParkingLot.findById(lotId);
    if (!lot) return res.status(404).json({ error: 'Lot not found' });
    const slots = await ParkingSlot.find({ lot: lotId }).sort('code');
    res.json(slots);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.bookSlot = async (req, res) => {
  try {
    const { slotId } = req.params;
    const slot = await ParkingSlot.findById(slotId);
    if (!slot) return res.status(404).json({ error: 'Slot not found' });
    if (slot.status !== 'AVAILABLE') {
      return res.status(400).json({ error: 'Slot is not available' });
    }
    const updatedSlot = await ParkingSlot.findByIdAndUpdate(slotId, { status: 'OCCUPIED' }, { new: true });
    if (req.app.get('io')) {
      req.app.get('io').emit('slot-updated', {
        slotId: updatedSlot._id,
        lotId: updatedSlot.lot,
        status: updatedSlot.status
      });
    }
    res.json(updatedSlot);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateSlotStatus = async (req, res) => {
  try {
    const { slotId } = req.params;
    const { status } = req.body;
    if (!['AVAILABLE','OCCUPIED','RESERVED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const slot = await ParkingSlot.findByIdAndUpdate(slotId, { status }, { new: true });
    if (!slot) return res.status(404).json({ error: 'Slot not found' });
    if (req.app.get('io')) {
      req.app.get('io').emit('slot-updated', {
        slotId: slot._id,
        lotId: slot.lot,
        status: slot.status
      });
    }
    res.json(slot);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.clearSlot = async (req, res) => {
  try {
    const { slotId } = req.params;
    const slot = await ParkingSlot.findById(slotId);
    if (!slot) return res.status(404).json({ error: 'Slot not found' });
    
    const updatedSlot = await ParkingSlot.findByIdAndUpdate(slotId, { status: 'AVAILABLE' }, { new: true });
    
    if (req.app.get('io')) {
      req.app.get('io').emit('slot-updated', {
        slotId: updatedSlot._id,
        lotId: updatedSlot.lot,
        status: 'AVAILABLE'
      });
    }
    
    res.json(updatedSlot);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createSlotsForLot = async (req, res) => {
  try {
    const { lotId } = req.params;
    const { slots } = req.body;
    if (!Array.isArray(slots) || slots.length === 0) return res.status(400).json({ error: 'Slots array required' });

    const lot = await ParkingLot.findById(lotId);
    if (!lot) return res.status(404).json({ error: 'Lot not found' });

    const created = await ParkingSlot.insertMany(slots.map(s => ({ lot: lotId, code: s.code, status: s.status || 'AVAILABLE' })));
    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
