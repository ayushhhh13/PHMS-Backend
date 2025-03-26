import asyncHandler from '../middlewares/asyncHandler.js';
import Appointment from '../models/appointmentModel.js';
import Slot from '../models/slotModel.js';

export const bookAppointment = asyncHandler(async (req, res) => {
    const { student_id, slot_id } = req.body;
    
    const slot = await Slot.findOne({ where: { slot_id, status: 'available' } });
    if (!slot) throw new Error('Slot not available');

    await slot.update({ status: 'booked' });
    const appointment = await Appointment.create({ student_id, slot_id, status: 'pending' });

    res.status(201).json(appointment);
});
