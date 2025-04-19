import express from 'express';
import {
    bookAppointment,
    cancelAppointment,
    rescheduleAppointment,
    getAppointments,
    getTodaysAppointments
} from '../controllers/appointmentController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const appointmentRoutes = express.Router();
appointmentRoutes.post('/book', authMiddleware, bookAppointment);

appointmentRoutes.put('/cancel/:id', authMiddleware, cancelAppointment);

appointmentRoutes.put('/reschedule/:id', authMiddleware, rescheduleAppointment);

appointmentRoutes.get('/', authMiddleware, getAppointments);

appointmentRoutes.get('/getTodaysAppointments', getTodaysAppointments)

export default appointmentRoutes;
