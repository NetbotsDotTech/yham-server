// routes/bookRoutes.js
import express from 'express';
import { exportBackup, importBackup } from '../controllers/backupController.js';
import multer from 'multer';
const router = express.Router();

const upload = multer({ dest: 'Backup/' });

router.get('/export', exportBackup);
router.post('/import', upload.single('file'), importBackup);


export default router;
