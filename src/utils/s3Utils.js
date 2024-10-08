import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';
import { promisify } from 'util';
import QRCode from 'qrcode';
// import dotenv from 'dotenv';


// dotenv.config();

// Initialize AWS S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  // credentials: {
  //   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  //   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  // },
});


const randomBytes = promisify(crypto.randomBytes);

export const uploadFileToS3 = async (file, artifactName, folder) => {
  const fileName = `${artifactName}/${folder}/${Date.now()}-${file.originalname}`;
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
    // ACL: 'public-read',
  };
  const command = new PutObjectCommand(params);
  await s3.send(command);
  return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
};

export const generateQRCode = async (data) => {
  const formattedData = `
  Artifact Name: ${data.name}
  Item No: ${data.itemNo}
  Serial No: ${data.serialNo}
  Description: ${data.description}
  
  For a more detailed version, please visit our website:
  https://yousufhussainabadimuseum.pk/ and scan the QR code on the website.
  `;
  const qrCodeImage = await QRCode.toDataURL(JSON.stringify(data));
  const buffer = Buffer.from(qrCodeImage.split(',')[1], 'base64');
  const fileName = `qrcodes/${Date.now()}.png`;
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName,
    Body: buffer,
    ContentType: 'image/png',
    // ACL: 'public-read',
  };
  const command = new PutObjectCommand(params);
  await s3.send(command);
  return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
};

export const deleteFileFromS3 = async (fileUrl) => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileUrl,
  };
  const command = new DeleteObjectCommand(params);

  await s3.send(command);
};
