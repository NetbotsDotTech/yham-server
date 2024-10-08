import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';
import dotenv from 'dotenv';
dotenv.config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION, // Optional, set if needed

  },
});

const generateFileName = (prefix, artifactName, originalName) => {
  const timestamp = Date.now();
  const formattedName = `${artifactName.replace(/\s+/g, '_').toLowerCase()}_${timestamp}-${originalName}`;
  return `${prefix}/${formattedName}`;
};


const uploadImages = multer({
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET_NAME,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const artifactName = req.body.name || 'artifact';
      const fileName = generateFileName('images', artifactName, file.originalname);
      cb(null, fileName);
    },
  }),
}).array('images', 3); 

const uploadAudio = multer({
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET_NAME,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const artifactName = req.body.name || 'artifact';
      const fileName = generateFileName('audio', artifactName, file.originalname);
      cb(null, fileName);
    },
  }),
}).single('audio'); 

const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET_NAME,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const artifactName = req.body.name || 'artifact';
      const prefix = file.fieldname === 'images' ? 'images' : 'audio';
      const fileName = generateFileName(prefix, artifactName, file.originalname);
      cb(null, fileName);
    },
  }),
}).fields([
  { name: 'audio', maxCount: 1 },

  { name: 'images', maxCount: 3 }
]);


 const uploadPdf = async (pdfBuffer, fileName) => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `qrCodes/${fileName}`,
    Body: pdfBuffer,
    ContentType: 'application/pdf',
   
  };

  try {
    await s3.send(new PutObjectCommand(params));
    return `https://${params.Bucket}.s3.amazonaws.com/${params.Key}`;
  } catch (error) {
    console.error('Error uploading PDF:', error);
    throw new Error('Failed to upload PDF');
  }
};

export { uploadImages, uploadAudio , upload, uploadPdf};
