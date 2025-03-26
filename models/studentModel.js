import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Student = sequelize.define('Student', {
    student_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    name: { type: DataTypes.STRING, allowNull: false },
    roll_number: { type: DataTypes.STRING, allowNull: false, unique: true },
    mobile_number: { type: DataTypes.STRING },
    emergency_contact: { type: DataTypes.STRING },
    medical_condition: { type: DataTypes.TEXT },
}, { timestamps: false });

export default Student;
