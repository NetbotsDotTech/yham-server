import { S3Client, ListObjectsCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path, { dirname } from 'path';
import archiver from 'archiver';
import { fileURLToPath } from 'url';
import moment from 'moment'; // Use moment for date formatting

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const execAsync = promisify(exec);

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Helper function to get the next available backup folder
const getNextBackupFolder = (baseDir) => {
  let backupNumber = 1;
  let folderName;
  do {
    folderName = `backup${backupNumber}-${moment().format('DD-MMM-YYYY')}`;
    backupNumber++;
  } while (fs.existsSync(path.join(baseDir, folderName)));
  return folderName;
};

export const exportBackup = async (req, res) => {
  try {
    console.log('exportBackup API triggered');

    // Define the path to the `backup` folder under `src`
    const baseDir = path.join(__dirname, '../..', 'backup');
console.log("baseDir",baseDir)
    // Ensure the `backup` folder exists
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }

    // Find the next available sequential backup folder in the `backup` directory
    const backupFolderName = getNextBackupFolder(baseDir);
    const tempDir = path.join(baseDir, backupFolderName);

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
      console.log('Temporary directory created.');
    }

    console.log('Step 1 complete - Created temporary directory');

    // Step 2: Export MongoDB data
    const mongoDumpCommand = `mongodump --uri="mongodb://localhost:27017" --out="${tempDir}/backup"`;
    console.log('Executing mongodump...');

    try {
      const { stdout, stderr } = await execAsync(mongoDumpCommand);
      console.log('mongodump stdout:', stdout);
      console.log('mongodump stderr:', stderr);
      console.log('Step 2 complete - Exported MongoDB data');
    } catch (err) {
      console.error('Error during mongodump execution:', err);
      return res.status(500).send('Error executing MongoDB dump.');
    }

    // Step 3: Retrieve media files from S3
    const listParams = { Bucket: 'yousuf-hussain-abadi-muesum' };
    console.log('Fetching media files from S3...');
    const data = await s3.send(new ListObjectsCommand(listParams));
    const mediaFiles = data.Contents.map((item) => item.Key);
    console.log('Media files retrieved:', mediaFiles);

    // Step 4: Initialize ZIP archive
    const zipFilePath = path.join(tempDir, 'backup.zip');
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver('zip', { zlib: { level: 6 } });

    archive.pipe(output);

    // Step 5: Add MongoDB dump to ZIP
    const mongoBackupDir = path.join(tempDir, 'backup');
    archive.directory(mongoBackupDir, 'mongodb_backup');
    console.log('Step 5 complete - Added MongoDB dump to ZIP');

    // Step 6: Add media files from S3 to ZIP concurrently
    const s3Promises = mediaFiles.map(async (file) => {
      const getObjectParams = { Bucket: 'yousuf-hussain-abadi-muesum', Key: file };
      const fileStream = await s3.send(new GetObjectCommand(getObjectParams));
      archive.append(fileStream.Body, { name: `media_files/${file}` });
    });

    await Promise.all(s3Promises);
    console.log('Step 6 complete - Added media files to ZIP');

    output.on('finish', async () => {
      console.log('Step 7 complete - Finalized ZIP file');

      res.download(zipFilePath, `${backupFolderName}.zip`, (err) => {
        if (err) {
          console.error('Download error:', err);
          return res.status(500).send('Error downloading backup.');
        }
        console.log('Backup download initiated successfully.');
      });
    });

    archive.finalize();
  } catch (error) {
    console.error('Error exporting backup:', error);
    res.status(500).send('Error exporting backup.');
  }
};



// Import Backup Function
export const importBackup = async (req, res) => {
    console.log("importBackup API triggered");

    const { file } = req; // assuming you're using multer for file upload
    if (!file || file.mimetype !== 'application/zip') {
        return res.status(400).send('Please upload a valid ZIP file.');
    }

    console.log('Step 1 complete - Uploaded file');
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
    }

    console.log('Step 2 complete - Created temporary directory');

    // Unzip the uploaded file
    try {
        await fs.createReadStream(file.path)
            .pipe(unzipper.Extract({ path: tempDir }))
            .promise();
        
        console.log('Step 3 complete - Unzipped file');

        // Delete or clean MongoDB database before restoring the new data
        const dropDBCommand = `mongo ${process.env.MONGODB_URI} --eval "db.dropDatabase()"`;
        console.log("Dropping existing MongoDB database...");
        await execAsync(dropDBCommand);
        console.log('Step 4 complete - Dropped existing MongoDB database');

        // Restore MongoDB data from backup
        const mongoBackupPath = path.join(tempDir, 'mongodb_backup');
        const mongoRestoreCommand = `mongorestore --uri="${process.env.MONGODB_URI}" "${mongoBackupPath}"`;
        console.log("Restoring MongoDB data...");
        await execAsync(mongoRestoreCommand);
        console.log('Step 5 complete - Restored MongoDB data');

        // Delete existing files in the S3 bucket before uploading new ones
        console.log("Fetching existing media files from S3...");
        const listParams = { Bucket: 'yousuf-hussain-abadi-muesum' };
        const existingFiles = await s3.send(new ListObjectsCommand(listParams));

        if (existingFiles.Contents.length > 0) {
            console.log("Deleting existing media files from S3...");
            for (const file of existingFiles.Contents) {
                const deleteParams = {
                    Bucket: 'yousuf-hussain-abadi-muesum',
                    Key: file.Key,
                };
                await s3.send(new DeleteObjectCommand(deleteParams));
            }
            console.log("Step 6 complete - Deleted existing S3 media files");
        }

        // Upload new media files from the backup to S3
        const mediaFilesDir = path.join(tempDir, 'media_files');
        if (fs.existsSync(mediaFilesDir)) {
            console.log("Uploading new media files to S3...");
            const mediaFiles = fs.readdirSync(mediaFilesDir);
            for (const file of mediaFiles) {
                const filePath = path.join(mediaFilesDir, file);
                const uploadParams = {
                    Bucket: 'yousuf-hussain-abadi-muesum',
                    Key: file, // Adjust based on your S3 folder structure if needed
                    Body: fs.createReadStream(filePath),
                };
                await s3.send(new PutObjectCommand(uploadParams));
            }
            console.log("Step 7 complete - Uploaded new media files to S3");
        } else {
            console.log('No media files directory found in the backup.');
        }

        // Cleanup temporary files
        fs.rmSync(tempDir, { recursive: true, force: true });
        fs.unlinkSync(file.path); // Remove the uploaded ZIP file
        console.log('Step 8 complete - Cleaned up temporary files');

        res.send('Backup imported successfully.');
    } catch (error) {
        console.error('Error importing backup:', error);
        res.status(500).send('Error importing backup.');
        
        // Cleanup on error
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }
    }
};
