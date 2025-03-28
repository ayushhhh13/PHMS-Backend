import asyncHandler from '../middlewares/asyncHandler.js';
import {Slot, Appointment} from '../config/db.js';

// Book an appointment
export const bookAppointment = asyncHandler(async (req, res) => {
    const { slot_id, date } = req.body;
    const student_id = req.user.id; // Retrieved from JWT token

    const slot = await Slot.findByPk(slot_id);
    if (!slot || slot.status === 'booked') {
        return res.status(400).json({ message: 'Slot not available' });
    }

    // Create Appointment
    const appointment = await Appointment.create({ student_id, slot_id, date });
    
    // Update Slot Status
    await slot.update({ status: 'booked' });

    res.status(201).json({ message: 'Appointment booked successfully', appointment });
});

// Cancel an appointment
export const cancelAppointment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const student_id = req.user.id;

    const appointment = await Appointment.findOne({ where: { id, student_id } });
    if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
    }

// Update Appointment Status
    await appointment.update({ status: 'canceled' });

// Free the Slot
    await Slot.update({ status: 'available' }, { where: { id: appointment.slot_id } });

    res.json({ message: 'Appointment canceled successfully' });
});

//  Reschedule an appointment
export const rescheduleAppointment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { new_slot_id, new_date } = req.body;
    const student_id = req.user.id;

    const appointment = await Appointment.findOne({ where: { id, student_id } });
    if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
    }

    const newSlot = await Slot.findByPk(new_slot_id);
    if (!newSlot || newSlot.status === 'booked') {
        return res.status(400).json({ message: 'New slot is not available' });
    }

    // Free old slot & book new slot
    await Slot.update({ status: 'available' }, { where: { id: appointment.slot_id } });
    await newSlot.update({ status: 'booked' });

    // Update appointment
    await appointment.update({ slot_id: new_slot_id, date: new_date, status: 'rescheduled' });

    res.json({ message: 'Appointment rescheduled successfully' });
});

// Get all appointments for a student
export const getAppointments = asyncHandler(async (req, res) => {
    const student_id = req.user.id;
    const appointments = await Appointment.findAll({ where: { student_id } });

    res.json(appointments);
});
