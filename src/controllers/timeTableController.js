import asyncHandler from 'express-async-handler';
import TimeTable from '../models/timeTableModel.js';

// @desc Get all timetable entries
// @route GET /api/timetable
// @access Public
export const getAllTimeTables = asyncHandler(async (req, res) => {
  const timeTables = await TimeTable.find({});
  res.status(200).json(timeTables);
});

// @desc Get timetable entry for a specific day
// @route GET /api/timetable/:day
// @access Public
export const getTimeTableForDay = asyncHandler(async (req, res) => {
  const { day } = req.params;
  const timeTableEntry = await TimeTable.findOne({ day });

  if (!timeTableEntry) {
    return res.status(404).json({ message: 'TimeTable entry not found for the specified day' });
  }

  res.status(200).json(timeTableEntry);
});

// @desc Create or update timetable entry for a specific day
// @route POST /api/timetable
// @access Private (Admin)
export const createOrUpdateTimeTableForDay = asyncHandler(async (req, res) => {
  const { day, openingTime, closingTime, note } = req.body;

  if (!day || !openingTime || !closingTime) {
    return res.status(400).json({ message: 'You must provide a day, opening time, and closing time' });
  }

  const existingEntry = await TimeTable.findOne({ day });

  if (existingEntry) {
    // Update the existing entry
    existingEntry.openingTime = openingTime;
    existingEntry.closingTime = closingTime;
    existingEntry.note = note;
    const updatedEntry = await existingEntry.save();
    res.status(200).json({ message: 'TimeTable entry updated successfully', entry: updatedEntry });
  } else {
    // Create a new entry
    const newEntry = await TimeTable.create({ day, openingTime, closingTime, note });
    res.status(201).json({ message: 'TimeTable entry created successfully', entry: newEntry });
  }
});

// @desc Delete timetable entry for a specific day
// @route DELETE /api/timetable/:day
// @access Private (Admin)
export const deleteTimeTableForDay = asyncHandler(async (req, res) => {
  const { day } = req.params;
  const result = await TimeTable.deleteOne({ day });

  if (result.deletedCount === 0) {
    return res.status(404).json({ message: 'TimeTable entry not found for the specified day' });
  }

  res.status(204).send('TimeTable entry deleted successfully');
});









// import asyncHandler from 'express-async-handler';
// import TimeTable from '../models/timeTableModel.js';

// // @desc Get timetable for the whole week
// // @route GET /api/timetable
// // @access Public
// export const getWeekTimeTable = asyncHandler(async (req, res) => {
//   const timeTable = await TimeTable.find({});
//   res.status(200).json(timeTable);
// });

// // @desc Create timetable for the whole week
// // @route POST /api/timetable
// // @access Private (Admin)
// export const createWeekTimeTable = asyncHandler(async (req, res) => {
//   const { weekEntries } = req.body; // Array of timetable entries for the week

//   if (!weekEntries || !Array.isArray(weekEntries) || weekEntries.length !== 7) {
//     return res.status(400).json({ message: 'You must provide exactly 7 entries for the week' });
//   }

//   // Validate each entry
//   const invalidEntries = weekEntries.filter(entry => !entry.day || !entry.openingTime || !entry.closingTime);
//   if (invalidEntries.length > 0) {
//     return res.status(400).json({ message: 'Each entry must include a day, opening time, and closing time' });
//   }

//   // Clear existing entries and create new entries
//   await TimeTable.deleteMany(); // Remove existing entries
//   const createdEntries = await TimeTable.insertMany(weekEntries); // Insert the new ones

//   res.status(201).json({message:"You have successfully created the timetable", createdEntries});
// });

// // @desc Update timetable for the whole week
// // @route PUT /api/timetable
// // @access Private (Admin)
// export const updateWeekTimeTable = asyncHandler(async (req, res) => {
//   const { weekEntries } = req.body; // Array of timetable entries for the week

//   if (!weekEntries || !Array.isArray(weekEntries) || weekEntries.length !== 7) {
//     return res.status(400).json({ message: 'You must provide exactly 7 entries for the week' });
//   }

//   // Validate each entry
//   const invalidEntries = weekEntries.filter(entry => !entry.day || !entry.openingTime || !entry.closingTime);
//   if (invalidEntries.length > 0) {
//     return res.status(400).json({ message: 'Each entry must include a day, opening time, and closing time' });
//   }

//   // Update each entry or create if it doesn't exist
//   const updatedEntries = await Promise.all(
//     weekEntries.map(async (entry) => {
//       const { day, openingTime, closingTime, note } = entry;
//       const existingEntry = await TimeTable.findOne({ day });

//       if (existingEntry) {
//         // Update the existing entry
//         existingEntry.openingTime = openingTime;
//         existingEntry.closingTime = closingTime;
//         existingEntry.note = note;
//         return existingEntry.save();
//       } else {
//         // Create a new entry
//         return TimeTable.create({ day, openingTime, closingTime, note });
//       }
//     })
//   );

//   res.status(200).json({message:"You have successfully updated the timetable", updatedEntries});
// });

// // @desc Delete all timetable entries (reset timetable)
// // @route DELETE /api/timetable
// // @access Private (Admin)
// export const deleteWeekTimeTable = asyncHandler(async (req, res) => {
//   await TimeTable.deleteMany(); // Remove all entries
//   res.status(204).send("You have successfully deleted all timetable entries");
// });
