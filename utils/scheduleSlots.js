import { Op } from 'sequelize';
import {Slot} from '../config/db.js';
import cron from 'node-cron';

/**
 * Function to generate time slots for a given date.
 */
const generateSlots = (date) => {
    const startTime = 9; // 9:00 AM
    const endTime = 17; // 5:00 PM
    const duration = 30; // 30-minute slots
    let slots = [];

    for (let hour = startTime; hour < endTime; hour++) {
        for (let min = 0; min < 60; min += duration) {
            let start_time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:00`;
            let end_time = `${hour.toString().padStart(2, '0')}:${(min + duration).toString().padStart(2, '0')}:00`;
            
            slots.push({
                start_time,
                end_time,
                duration,
                date,
                status: 'available'
            });
        }
    }
    return slots;
};

/**
 * Function to insert slots for the next 30 days.
 */
export const insertSlotsForNextMonth = async () => {
    console.log('Generating slots for the next 30 days...');
    
    const today = new Date();
    const slots = [];

    for (let i = 0; i < 30; i++) {
        let date = new Date();
        date.setDate(today.getDate() + i);
        let formattedDate = date.toISOString().split('T')[0];

        slots.push(...generateSlots(formattedDate));
    }

    await Slot.bulkCreate(slots, { ignoreDuplicates: true });
    console.log('Slots for the next 30 days inserted.');
};

/**
 * Cron job: Runs every night at midnight
 * - Removes expired slots (past date)
 * - Adds new slots for the 30th day from today
 */
cron.schedule('0 0 * * *', async () => {
    console.log('Running daily slot maintenance...');

    // Remove past slots
    const today = new Date().toISOString().split('T')[0];
    await Slot.destroy({ where: { date: { [Op.lt]: today } } });
    console.log('Past slots removed.');

    // Insert new slots for the 30th future day
    let newDate = new Date();
    newDate.setDate(newDate.getDate() + 30);
    let formattedNewDate = newDate.toISOString().split('T')[0];

    const newSlots = generateSlots(formattedNewDate);
    await Slot.bulkCreate(newSlots);
    console.log(`New slots added for: ${formattedNewDate}`);
});

