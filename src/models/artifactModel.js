import mongoose from 'mongoose';

const artifactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  itemNo: { type: String, required: true, unique: true },
  serialNo: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  madeOf: { type: String, required: true },
  particulars: {
    width: { type: Number },
    depth: { type: Number },
    circumference: { type: Number },
    diameters: { type: Number },
    weight: { type: Number },
  },
  age: { type: String },
  shelfNo: { type: String, required: true },
  hallNo: { type: String, required: true },
  audio: { type: String },
  images: [{ type: String, required: true }],
  qrCode: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  viewCount: { type: Number, default: 0 }, // To track the number of views
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Artifact = mongoose.model('Artifact', artifactSchema);

export default Artifact;
