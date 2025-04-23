import { Sequelize } from "sequelize";
import { DataTypes } from "sequelize";
import dotenv from "dotenv";
import { insertSlotsForNextMonth } from "../utils/scheduleSlots.js";

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT, // Don't forget to set this in .env
    dialect: "mysql",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // This disables strict SSL cert verification (often required for managed DBs)
      },
    },
  }
);


const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("MySQL Connected...");
    await syncDatabase();  
    await insertSlotsForNextMonth();
  } catch (error) {
    console.error("MySQL Connection Failed:", error.message);
    process.exit(1);
  }
};


const Slot = sequelize.define(
  'Slot',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    start_time: { type: DataTypes.TIME, allowNull: false },
    end_time: { type: DataTypes.TIME, allowNull: false },
    duration: { type: DataTypes.INTEGER, allowNull: false },
    status: {
      type: DataTypes.ENUM("available", "booked"),
      defaultValue: "available",
    },
    date: { type: DataTypes.DATEONLY, allowNull: false },
  },
  { timestamps: true }
);

const Student = sequelize.define(
  "Student",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    roll_number: { type: DataTypes.STRING, allowNull: false },
    mobile: { type: DataTypes.STRING, allowNull: false },
    emergency_contact: { type: DataTypes.STRING },
    medical_condition: { type: DataTypes.STRING },
  },
  { timestamps: true }
);

const Appointment = sequelize.define('Appointment', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  student_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Student, key: 'id' }},
  slot_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Slot, key: 'id' }},
  status: { type: DataTypes.ENUM('pending', 'completed', 'canceled', 'rescheduled'), defaultValue: 'pending' },
  date: { type: DataTypes.DATEONLY, allowNull: false },
}, { timestamps: true });


Student.hasMany(Appointment, { foreignKey: "student_id" });
Slot.hasOne(Appointment, { foreignKey: "slot_id" });

Appointment.belongsTo(Student, { foreignKey: "student_id" });
Appointment.belongsTo(Slot, { foreignKey: "slot_id" });

const syncDatabase = async () => {
  try {
    await sequelize.sync();
    console.log(" Database synced successfully.");
  } catch (error) {
    console.error("Error syncing database:", error);
  }
};

export {syncDatabase, sequelize, connectDB , Appointment, Slot, Student};
