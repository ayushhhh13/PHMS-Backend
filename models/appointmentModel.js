import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import Student from './studentModel.js';
import Slot from './slotModel.js';

const Appointment = sequelize.define('Appointment', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    student_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Student, key: 'id' }},
    slot_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Slot, key: 'id' }},
    status: { type: DataTypes.ENUM('pending', 'completed', 'canceled', 'rescheduled'), defaultValue: 'pending' },
    date: { type: DataTypes.DATEONLY, allowNull: false },
}, { timestamps: true });

Student.hasMany(Appointment, { foreignKey: 'student_id' });
Slot.hasOne(Appointment, { foreignKey: 'slot_id' });

export default Appointment;
