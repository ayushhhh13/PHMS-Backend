import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import Student from './studentModel.js';
import Slot from './slotModel.js';

const Appointment = sequelize.define('Appointment', {
    appointment_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    student_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Student, key: 'student_id' } },
    slot_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Slot, key: 'slot_id' } },
    status: { type: DataTypes.ENUM('pending', 'completed', 'canceled', 'rescheduled'), defaultValue: 'pending' }
}, { timestamps: false });

export default Appointment;
