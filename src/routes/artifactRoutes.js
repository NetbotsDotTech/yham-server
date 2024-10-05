import express from 'express';
import {
  createArtifact,
  getArtifacts,
  getArtifactById,
  updateArtifact,
  deleteArtifact, 
  getArtifactByItemNo, 
  getArtifactStatistics
} from '../controllers/artifactController.js';
import { generateQrCodePdf } from '../controllers/qrCodesController.js';
import { upload } from '../utils/multer.js';

const router = express.Router();

// Multer upload fields configuration
router.post('/' , upload,  createArtifact);
router.get('/', getArtifacts);
router.get('/:id', getArtifactById);
router.get('/item-wise/:id', getArtifactByItemNo);
router.put('/:id', updateArtifact);
router.delete('/:id', deleteArtifact);

//Dashbaord Statistics
router.get('/data', getArtifactStatistics);


router.get('/all-qrcodes', generateQrCodePdf);




export default router;
