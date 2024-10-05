import express from 'express';
import { 
  addFeedbacks,
  getArtifactWiseFeedbacks,
  updateFeedback,
  getFeedbacks

} from '../controllers/feedbackContoller.js';

const router = express.Router();

router.post('/', addFeedbacks);
router.get('/', getFeedbacks);
router.get('/:artifactId', getArtifactWiseFeedbacks);
router.patch('/feedbacks/:artifactId/:status', updateFeedback);

export default router;
