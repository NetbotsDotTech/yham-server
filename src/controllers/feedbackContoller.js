import asyncHandler from 'express-async-handler';
import Feedback from '../models/feedback.js';

// Create Feedback
export const addFeedbacks = asyncHandler(async (req, res) => {
  const { artifactId, name, rating, comment, status  } = req.body;

  try {
    const newFeedback = new Feedback({
      artifactId,
      name,
      rating,
      comment,
      status
    });

    await newFeedback.save();
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Read Feedbacks
export const getArtifactWiseFeedbacks = asyncHandler(async (req, res) => {
  const { artifactId } = req.params;

  try {
    const feedbacks = await Feedback.find({ artifactId, status: 'published' }).sort({ createdAt: -1 });
    console.log(feedbacks);
    if (feedbacks.length === 0) {
      return res.status(404).json({ message: 'No published feedback found for this artifact.' });
    }

    res.status(200).json({message: 'Feedbacks fetched successfully', feedbacks});
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update Feedback Status
export const updateFeedback = asyncHandler(async (req, res) => {
  const { feedbackId } = req.params;
  const { status } = req.body;

  try {
    const feedback = await Feedback.findById(feedbackId);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    feedback.status = status;
    await feedback.save();
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(200).json({ message: 'Feedback status updated successfully' });
  } catch (error) {
    console.error('Error updating feedback status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get Feedbacks
export const getFeedbacks = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(200).json(feedbacks);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
