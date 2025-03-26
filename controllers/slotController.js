import asyncHandler from '../middlewares/asyncHandler.js';
import Slot from '../models/slotModel.js';

export const getAvailableSlots = asyncHandler(async (req, res) => {
    const slots = await Slot.findAll({ where: { status: 'available' } });
    res.json(slots);
});
