import express from 'express';
import { getAvailableSlots, addSlot } from '../controllers/slotController.js';

const slotRoutes = express.Router();

slotRoutes.get('/', getAvailableSlots);

slotRoutes.post('/', addSlot);

export default slotRoutes;
