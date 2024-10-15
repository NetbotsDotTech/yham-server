
// controllers/bookController.js
import Book from '../models/bookModel.js';

// Create a new book
const createBookController = async (req, res) => {
  try {
    const { title, author, category,year , description } = req.body;
    const fileInfo = {
      url: req.file.location, // Get the URL from the middleware
      uploadedAt: Date.now(), // You can also use `new Date()` if you prefer
    };
    

    const newBook = new Book({
      title,
      author,
      category,
      year, // Include year from the request body
      files: [fileInfo], // Store the file info in the files array
    });
console.log("newBook", newBook)
    await newBook.save();

    res.status(201).json({
      statusCode: 201,
      message: 'Book successfully created.',
      book: newBook,
    });
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({ error: 'Failed to create book.' });
  }
};

// Get a list of all books
const getAllBooksController = async (req, res) => {
  try {
    const books = await Book.find();

    res.status(200).json({
      statusCode: 200,
      message: 'Books retrieved successfully.',
      books,
    });
  } catch (error) {
    console.error('Error retrieving books:', error);
    res.status(500).json({ error: 'Failed to retrieve books.' });
  }
};

// Get a single book by ID
const getBookByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({ error: 'Book not found.' });
    }

    res.status(200).json({
      statusCode: 200,
      message: 'Book retrieved successfully.',
      book,
    });
  } catch (error) {
    console.error('Error retrieving book:', error);
    res.status(500).json({ error: 'Failed to retrieve book.' });
  }
};

// Update a book by ID
const updateBookController = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    if (req.fileUrl) {
      updatedData.pdfUrl = req.fileUrl; // Update the PDF URL if a new file is uploaded
    }

    const updatedBook = await Book.findByIdAndUpdate(id, updatedData, { new: true });

    if (!updatedBook) {
      return res.status(404).json({ error: 'Book not found.' });
    }

    res.status(200).json({
      statusCode: 200,
      message: 'Book updated successfully.',
      book: updatedBook,
    });
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ error: 'Failed to update book.' });
  }
};

// Delete a book by ID
const deleteBookController = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBook = await Book.findByIdAndDelete(id);

    if (!deletedBook) {
      return res.status(404).json({ error: 'Book not found.' });
    }

    res.status(200).json({
      statusCode: 200,
      message: 'Book deleted successfully.',
      book: deletedBook,
    });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ error: 'Failed to delete book.' });
  }
};

export {
  createBookController,
  getAllBooksController,
  getBookByIdController,
  updateBookController,
  deleteBookController,
};
