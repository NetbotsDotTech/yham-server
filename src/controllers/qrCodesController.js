import { PDFDocument, rgb } from 'pdf-lib';
import QRCode from 'qrcode';
import asyncHandler from 'express-async-handler';
import Artifact from '../models/artifactModel.js'; // Assuming you still need this to fetch artifacts
import stream from 'stream';

export const generateQrCodePdf = asyncHandler(async (req, res) => {
  try {
    console.log('Step 1: Finding all artifacts');

    const { shelfNo, hallNo, itemNo } = req.query;

    let query = {};
    if (shelfNo) query.shelfNo = shelfNo;
    if (hallNo) query.hallNo = hallNo;
    if (itemNo) query.itemNo = itemNo;

    const artifacts = await Artifact.find(query);

    if (artifacts.length === 0) {
      return res.status(404).send('No artifacts found.');
    }

    console.log('Step 2: Generating QR Codes and streaming PDF');
    console.log('Generating QR Code PDF for', artifacts.length, 'artifacts');

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([595.28, 841.89]); // A4 page size in points

    const itemsPerRow = 4;
    const qrCodeSize = 100;
    const margin = 60;
    const spacing = 20;
    const itemNoMargin = 10; // Space between QR code and item number

    let x = margin;
    let y = page.getHeight() - margin - qrCodeSize; // Start from top

    for (let [index, artifact] of artifacts.entries()) {
      if (index % itemsPerRow === 0 && index !== 0) {
        x = margin;
        y -= qrCodeSize + spacing + itemNoMargin; // Add space for item number and QR code
      }

      if (y < margin) {
        page = pdfDoc.addPage([595.28, 841.89]);
        y = page.getHeight() - margin - qrCodeSize;
      }

      const qrImageDataURL = await QRCode.toDataURL(artifact.qrCode);
      const qrImage = await pdfDoc.embedPng(qrImageDataURL);

      // Draw QR code
      page.drawImage(qrImage, {
        x,
        y,
        width: qrCodeSize,
        height: qrCodeSize,
      });

      // Draw item number below the QR code
      page.drawText(artifact.itemNo || '', {
        x: x + (qrCodeSize / 2) - ((artifact.itemNo || '').length * 3), // Center text under QR code
        y: y - itemNoMargin, // Position item number below QR code
        size: 12,
        color: rgb(0, 0, 0),
      });

      x += qrCodeSize + spacing;
    }

    // Create a PassThrough stream to write the PDF
    const pdfStream = new stream.PassThrough();

    // Set headers for PDF download
    const artifactName = `QRCodeCollection_AllRecords_${Date.now()}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${artifactName}`);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Stream PDF to client
    pdfStream.pipe(res);

    const pdfBytes = await pdfDoc.save();
    pdfStream.end(Buffer.from(pdfBytes));

    console.log('PDF generation complete and sent to client.');

  } catch (error) {
    console.error('Error generating QR Code PDF:', error);
    res.status(500).send('Server error');
  }
});
