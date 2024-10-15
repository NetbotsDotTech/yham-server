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





// Function to generate file name
const FileName = (folder, originalName) => {
  const timestamp = Date.now();
  const formattedName = `${folder}_${timestamp}-${originalName}`;
  return `media/${folder}/${formattedName}`;
};

// Function to determine the folder based on MIME type
const getFolderByFileType = (fileType) => {
  if (fileType.startsWith('image')) return 'images';
  if (fileType.startsWith('audio')) return 'audio';
  if (fileType.startsWith('video')) return 'videos';
  if (fileType === 'application/pdf') return 'pdfs';
  return 'others'; // For unsupported file types
};

const uploadMedia = multer({
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET_NAME,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const folder = getFolderByFileType(file.mimetype); 
      const fileName = FileName(folder, file.originalname); 
      cb(null, fileName);
    },
  }),
  limits: { fileSize: 50 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    const validTypes = [
      'image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/bmp', 'image/tiff', 'image/svg+xml', 'image/heic', 
      'audio/mpeg', 'audio/wav', 'audio/aac', 'audio/mp4',
      'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska',
      'application/pdf',
    ];
    
    const isValidType = validTypes.includes(file.mimetype);

    if (isValidType) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type! Only images, audio, videos, and PDFs are allowed.'));
    }
  },
}).fields([
  { name: 'image', maxCount: 50 },   // Singular field names
  { name: 'audio', maxCount: 10 },
  { name: 'video', maxCount: 5 },
  { name: 'pdf', maxCount: 5 },
]);


// Middleware for handling media uploads
const handleMediaUpload = (req, res, next) => {
  uploadMedia(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    // Files successfully uploaded
    const uploadedFiles = req.files;
    const fileUrls = {};

    // Collect URLs for each file type
    Object.keys(uploadedFiles).forEach((key) => {
      fileUrls[key] = uploadedFiles[key].map((file) => file.location);
    });

    // Pass file URLs to the next middleware or response
    req.fileUrls = fileUrls;
    next();
  });
};



const generateBookFileName = (title, author, category) => {
  const timestamp = Date.now();
  const formattedName = `${title.replace(/\s+/g, '_').toLowerCase()}_${author.replace(/\s+/g, '_').toLowerCase()}_${category.replace(/\s+/g, '_').toLowerCase()}_${timestamp}.pdf`;
  return `books/${formattedName}`; // Store in 'books' folder
};

// Configure multer to use S3 for uploading the book PDF
const uploadBook = multer({
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET_NAME,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const { title, author, category } = req.body;
      const fileName = generateBookFileName(title, author, category);
      cb(null, fileName);
    },
  }),
  limits: { fileSize: 50 * 1024 * 1024 }, // Limit size to 50MB
  fileFilter: (req, file, cb) => {
    // Allow PDF and image files
    const allowedMimetypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (allowedMimetypes.includes(file.mimetype)) {
      cb(null, true); // Accept file
    } else {
      cb(new Error('Only PDF and image files (JPEG, PNG) are allowed!')); // Reject file
    }
  },
}).single('file'); // Change to 'file' to match frontend

// Middleware for handling book uploads
const handleBookUpload = (req, res, next) => {
  uploadBook(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    // File successfully uploaded
    req.fileUrl = req.file.location; // Store the file URL in the request object
   console.log("req.fileUrl",req.fileUrl)
    next();
  });
};


export { uploadImages, uploadAudio , upload, uploadPdf ,handleBookUpload ,  handleMediaUpload};
