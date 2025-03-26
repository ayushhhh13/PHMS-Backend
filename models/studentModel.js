import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Student = sequelize.define('Student', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    roll_number: { type: DataTypes.STRING, allowNull: false },
    mobile: { type: DataTypes.STRING, allowNull: false },
    emergency_contact: { type: DataTypes.STRING },
    medical_condition: { type: DataTypes.STRING },
}, { timestamps: true });

export default Student;
