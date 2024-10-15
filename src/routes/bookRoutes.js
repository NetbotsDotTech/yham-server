// routes/bookRoutes.js
import express from 'express';
import {
  createBookController,
  getAllBooksController,
  getBookByIdController,
  updateBookController,
  deleteBookController,
} from '../controllers/bookController.js';
import { handleBookUpload } from '../utils/multer.js';

const router = express.Router();

// Create a new book
router.post('/', handleBookUpload, createBookController);

// Get all books
router.get('/', getAllBooksController);

// Get a book by ID
router.get('/:id', getBookByIdController);

// Update a book by ID
// router.put('/books/:id', handleBookUpload, updateBookController);

// Delete a book by ID
router.delete('/:id', deleteBookController);

export default router;
