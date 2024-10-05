import mongoose from 'mongoose';

const timeTableSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], // Days of the week
  },
  openingTime: {
    type: String,
    required: true, // e.g. '09:00'
  },
  closingTime: {
    type: String,
    required: true, // e.g. '17:00'
  },
  note: {
    type: String,
    default: '', // Optional field for emergency closures or special notes
  }
}, { timestamps: true });

const TimeTable = mongoose.model('TimeTable', timeTableSchema);
export default TimeTable;
