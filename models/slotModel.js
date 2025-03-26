import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Slot = sequelize.define('Slot', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    start_time: { type: DataTypes.TIME, allowNull: false },
    end_time: { type: DataTypes.TIME, allowNull: false },
    duration: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.ENUM('available', 'booked'), defaultValue: 'available' },
    date: { type: DataTypes.DATEONLY, allowNull: false },
}, { timestamps: true });

export default Slot;
