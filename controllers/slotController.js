import asyncHandler from '../middlewares/asyncHandler.js';
import Slot from '../models/slotModel.js';

// Get available slots
export const getAvailableSlots = asyncHandler(async (req, res) => {
    const slots = await Slot.findAll({ where: { status: 'available' } });
    res.json(slots);
});

// Add a new slot
export const addSlot = asyncHandler(async (req, res) => {
    const { start_time, end_time, duration, date } = req.body;

    const slot = await Slot.create({ start_time, end_time, duration, date, status: 'available' });
    res.status(201).json({ message: 'Slot added successfully', slot });
});
