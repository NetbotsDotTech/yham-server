import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  artifactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Artifact', required: true },
  name: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'published', 'blocked', 'promoted'],
    default: 'pending',
  },
  createdAt: { type: Date, default: Date.now },
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;
