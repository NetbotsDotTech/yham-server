import express from 'express';
import { generateQrCodePdf } from '../controllers/qrCodesController.js';

const router = express.Router();




router.get('/', generateQrCodePdf);


export default router;
