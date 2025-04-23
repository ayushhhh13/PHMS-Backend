import asyncHandler from "../middlewares/asyncHandler.js";
import { Slot, Appointment, Student } from "../config/db.js";
import { DATE } from "sequelize";

// Book an appointment
export const bookAppointment = asyncHandler(async (req, res) => {
  const { slot_id, date } = req.body;
  const student_id = req.user.id; // Retrieved from JWT token

  const slot = await Slot.findByPk(slot_id);
  if (!slot) {
    return res.status(400).json({ message: "Slot not available" });
  }

  // Create Appointment
  const appointment = await Appointment.create({ student_id, slot_id, date });

  // Update Slot Status
  await slot.update({ status: "booked" });

  res
    .status(201)
    .json({ message: "Appointment booked successfully", appointment });
});

// Cancel an appointment
export const cancelAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const student_id = req.user.id;

  const appointment = await Appointment.findOne({ where: { id, student_id } });
  if (!appointment) {
    return res.status(404).json({ message: "Appointment not found" });
  }

  // Update Appointment Status
  await appointment.update({ status: "canceled" });

  // Free the Slot
  await Slot.update(
    { status: "available" },
    { where: { id: appointment.slot_id } }
  );

  res.json({ message: "Appointment canceled successfully" });
});

//  Reschedule an appointment
export const rescheduleAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { new_slot_id, new_date } = req.body;
  const student_id = req.user.id;

  const appointment = await Appointment.findOne({ where: { id, student_id } });
  if (!appointment) {
    return res.status(404).json({ message: "Appointment not found" });
  }

  const newSlot = await Slot.findByPk(new_slot_id);
  if (!newSlot) {
    return res.status(400).json({ message: "New slot is not available" });
  }

  // Free old slot & book new slot
  await Slot.update(
    { status: "available" },
    { where: { id: appointment.slot_id } }
  );
  await newSlot.update({ status: "booked" });

  // Update appointment
  await appointment.update({
    slot_id: new_slot_id,
    date: new_date,
    status: "rescheduled",
  });

  res.json({ message: "Appointment rescheduled successfully" });
});

// Get all appointments for a student
export const getAppointments = asyncHandler(async (req, res) => {
  const student_id = req.user.id;
  const appointments = await Appointment.findAll({
    where: { student_id },
    include: [
      {
        model: Slot,
        attributes: ["start_time", "end_time"],
      },
    ],
  });

  res.json(appointments);
});

export const getTodaysAppointments = asyncHandler(async (req, res) => {
  try {
    const today = new Date();
    const IST_offset = 5.5 * 60; // IST is UTC +5:30 (5.5 hours)
    
    // Adjust to IST time zone
    const IST_date = new Date(today.getTime() + (IST_offset - today.getTimezoneOffset()) * 60000);
    
    // Format it to 'YYYY-MM-DD'
    const formattedDate = IST_date.toISOString().split('T')[0];
    
  
    const appointments = await Appointment.findAll({
      where: {
        date: formattedDate,
        status: ["pending", "rescheduled"],
      },
      include: [
        {
          model: Slot,
          attributes: ["start_time", "end_time"],
        },
        {
          model: Student,
          attributes: ["name", "email", "mobile"],
        },
      ],
      raw: false,
    });

    const formattedData = appointments.map((appointment) => ({
      id: appointment.id,
      student_id: appointment.student_id,
      slot_id: appointment.slot_id,
      date: appointment.date,
      status: appointment.status,
      slot: appointment.Slot
        ? {
            start_time: appointment.Slot.start_time,
            end_time: appointment.Slot.end_time,
          }
        : undefined,
      student: appointment.Student
        ? {
            name: appointment.Student.name,
            email: appointment.Student.email,
            mobile: appointment.Student.mobile,
          }
        : undefined,
    }));

    res.status(200).json(formattedData);
  } catch (e) {
    res.status(400).json({ message: "Error fetching appointments", error: e });
  }
});
