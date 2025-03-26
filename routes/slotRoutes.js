import express from 'express';
import { getAvailableSlots, addSlot } from '../controllers/slotController.js';

const router = express.Router();

router.get('/', getAvailableSlots);

router.post('/', addSlot);

export default router;
