import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import studentRoutes from './routes/studentRoutes.js';
import slotRoutes from './routes/slotRoutes.js';
dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.use('/api/users', studentRoutes);
app.use('/api/slot', slotRoutes);

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
