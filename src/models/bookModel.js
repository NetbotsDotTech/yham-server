// models/bookModel.js
import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
  },
  category: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
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

const Book = mongoose.model('Book', bookSchema);

export default Book;
