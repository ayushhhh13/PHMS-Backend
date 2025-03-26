import express from 'express';
import {
    bookAppointment,
    cancelAppointment,
    rescheduleAppointment,
    getAppointments,
} from '../controllers/appointmentController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();
router.post('/book', authMiddleware, bookAppointment);

router.put('/cancel/:id', authMiddleware, cancelAppointment);

router.put('/reschedule/:id', authMiddleware, rescheduleAppointment);

router.get('/', authMiddleware, getAppointments);

export default router;
