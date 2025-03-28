import asyncHandler from "../middlewares/asyncHandler.js";
import { Slot } from "../config/db.js";

// Get available slots
export const getAvailableSlots = asyncHandler(async (req, res) => {
  const slots = await Slot.findAll({ where: { status: "available" } });
  res.json(slots);
});

export const bookSlot = asyncHandler(async (req, res) => {
  const { date, startTime, endTime } = req.body;
  const slot = await Slot.findOne({
    where: { date: date, start_time: startTime, end_time: endTime, status: 'available' },
  });
  if (!slot) {
    return res.status(404).json({ message: "Slot not available" });
  }

  slot.status = "booked";
  await slot.save();
  res.json(slot.id);
});
