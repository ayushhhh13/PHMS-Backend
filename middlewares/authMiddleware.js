import jwt from "jsonwebtoken";
import { Student, Appointment, Slot } from "../config/db.js";
const authMiddleware = async (req, res, next) => {
  // Admin Block
  const { role, operation } = req.headers;

  if (role === "admin") {
    const appointmentId = req.params.id;
    const appointment = await Appointment.findOne({
      where: { id: appointmentId },
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    if (operation === "cancel") {
      // Update Appointment Status
      await appointment.update({ status: "canceled" });
      await Slot.update(
        { status: "available" },
        { where: { id: appointment.slot_id } }
      );
      return res
        .status(200)
        .json({ message: "Appointment cancelled by admin." });
    } else if (operation === "completed") {
      await appointment.update({ status: "completed" });
      await Slot.update(
        { status: "available" },
        { where: { id: appointment.slot_id } }
      );
      return res
        .status(200)
        .json({ message: "Appointment completed by admin." });
    }
  }

  // Student Block
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await Student.findByPk(decoded.id);
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export default authMiddleware;
