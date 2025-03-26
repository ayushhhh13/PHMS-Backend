import sequelize from '../config/db.js';
import Student from './studentModel.js';
import Slot from './slotModel.js';
import Appointment from './appointmentModel.js';

// Defining Relationships
Student.hasMany(Appointment, { foreignKey: 'student_id' });
Slot.hasOne(Appointment, { foreignKey: 'slot_id' });

Appointment.belongsTo(Student, { foreignKey: 'student_id' });
Appointment.belongsTo(Slot, { foreignKey: 'slot_id' });

// Syncing all models
const syncDatabase = async () => {
    try {
        await sequelize.sync();
        console.log(' Database synced successfully.');
    } catch (error) {
        console.error('Error syncing database:', error);
    }
};

export { sequelize, syncDatabase, Student, Slot, Appointment };
