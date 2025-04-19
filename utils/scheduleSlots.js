import { Op } from "sequelize";
import { Slot } from "../config/db.js";
import cron from "node-cron";

/**
 * Generate 30-min slots between 9 AM - 5 PM for a specific date
 */
const generateSlots = (date) => {
  const startTime = 9;
  const endTime = 17;
  const duration = 30;
  let slots = [];

  for (let hour = startTime; hour < endTime; hour++) {
    for (let min = 0; min < 60; min += duration) {
      const startHour = hour.toString().padStart(2, "0");
      const startMin = min.toString().padStart(2, "0");

      const endMinutes = min + duration;
      const endHour = (hour + Math.floor(endMinutes / 60))
        .toString()
        .padStart(2, "0");
      const endMin = (endMinutes % 60).toString().padStart(2, "0");

      const start_time = `${startHour}:${startMin}:00`;
      const end_time = `${endHour}:${endMin}:00`;

      slots.push({
        start_time,
        end_time,
        duration,
        date,
        status: "available",
      });
    }
  }

  return slots;
};

/**
 * Insert slots for next 30 days (only if table is empty)
 */
export const insertSlotsForNextMonth = async () => {
  const existingCount = await Slot.count();

  if (existingCount > 0) {
    console.log("Slots already exist. Skipping initial insertion.");
    return;
  }

  console.log("Inserting slots for next 30 days...");
  const today = new Date();
  const slots = [];

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const formattedDate = date.toISOString().split("T")[0];

    const daySlots = generateSlots(formattedDate);
    console.log(`Generated ${daySlots.length} slots for ${formattedDate}`);
    slots.push(...daySlots);
  }

  await Slot.bulkCreate(slots);
  console.log("Finished inserting slots.");
};

/**
 * Cron job: Run every midnight
 * - Delete expired slots (before today)
 * - Insert new slots for (today + 30)
 */
cron.schedule("0 0 * * *", async () => {
  try {
    console.log("Running daily slot maintenance...");

    const today = new Date().toISOString().split("T")[0];

    // Delete past slots
    const deleted = await Slot.destroy({
      where: {
        date: {
          [Op.lt]: today,
        },
      },
    });
    console.log(`Deleted ${deleted} old slots.`);

    // Insert one new day (today + 30)
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + 30);
    const formattedDate = newDate.toISOString().split("T")[0];

    const newSlots = generateSlots(formattedDate);
    await Slot.bulkCreate(newSlots, {
      ignoreDuplicates: true,
    });
    console.log(`Inserted ${newSlots.length} slots for ${formattedDate}`);
  } catch (error) {
    console.error("Error in cron job:", error.message);
  }
});
