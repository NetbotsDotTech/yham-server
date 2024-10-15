import express from 'express';

import {handleMediaUpload} from '../utils/multer.js';
import storeMediaController from '../controllers/uploadMediaController.js';
const router = express.Router();

router.post('/upload', handleMediaUpload,  storeMediaController)



export default router;
