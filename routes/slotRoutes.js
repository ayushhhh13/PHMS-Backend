import express from 'express';
import { bookSlot, getAvailableSlots } from '../controllers/slotController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const slotRoutes = express.Router();

slotRoutes.get('/get', authMiddleware,getAvailableSlots);
slotRoutes.post('/book', authMiddleware,bookSlot);


export default slotRoutes;
