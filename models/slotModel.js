import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Slot = sequelize.define('Slot', {
    slot_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    start_time: { type: DataTypes.TIME, allowNull: false },
    end_time: { type: DataTypes.TIME, allowNull: false },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    status: { type: DataTypes.ENUM('available', 'booked'), defaultValue: 'available' }
}, { timestamps: false });

export default Slot;
