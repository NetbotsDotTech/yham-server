import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
  fileType: {
    type: String,
    required: true,
    enum: ['image', 'audio', 'video', 'pdf'], // Only these file types allowed
  },
  caption: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  files: [{
    url: {
      type: String,
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],
});

const Media = mongoose.model('Media', mediaSchema);

export default Media;
