import asyncHandler from 'express-async-handler';
import Artifact from '../models/artifactModel.js';
import Log from '../models/logs.js';
import { generateQRCode, deleteFileFromS3, uploadFileToS3 } from '../utils/s3Utils.js';
import { upload } from '../utils/multer.js';

// Create Artifact
export const createArtifact = asyncHandler(async (req, res) => {
  console.log("Create Artifact API Triggered");

  try {
    const { name, itemNo, serialNo, description, madeOf, particulars, age, shelfNo, hallNo } = req.body;

    // Check if an artifact with the same item number already exists
    const artifactExists = await Artifact.findOne({ itemNo });
    if (artifactExists) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Artifact with this item number already exists',
      });
    }

    // Generate QR code
    const qrCodeUrl = await generateQRCode({ name, itemNo, serialNo, description });
    console.log("Step 1: QR Code generated", qrCodeUrl);

    // Get image URLs from the files uploaded via the upload middleware
    const imageUrls = req.files['images'] ? req.files['images'].map(file => file.location) : [];
    console.log("Step 2: Images uploaded to S3", imageUrls);

    // Get audio URL from the file uploaded via the upload middleware
    let audioUrl = '';
    if (req.files['audio'] && req.files['audio'][0] && req.files['audio'][0].location) {
      audioUrl = req.files['audio'][0].location;
      console.log("Step 3: Audio uploaded to S3", audioUrl);
    }

    // Create the artifact document
    const artifact = new Artifact({
      name,
      itemNo,
      serialNo,
      description,
      madeOf,
      particulars,
      age,
      shelfNo,
      hallNo,
      audio: audioUrl,
      images: imageUrls,
      qrCode: qrCodeUrl,
    });

    // Save the artifact to the database
    const createdArtifact = await artifact.save();
    console.log("Step 4: Artifact saved to DB", createdArtifact);

    // Respond with the created artifact
    res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Artifact created successfully',
      data: createdArtifact,
    });
  } catch (error) {
    console.error('Error creating artifact:', error);
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'An error occurred while creating the artifact',
      error: error.message,
    });
  }
});

// Get all Artifacts
export const getArtifacts = asyncHandler(async (req, res) => {
  try {
    const artifacts = await Artifact.find({});
    // res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    // res.header('Access-Control-Allow-Credentials', 'true');
    // res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    // res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Artifacts retrieved successfully',
      data: artifacts,
    });
  } catch (error) {
    console.error('Error fetching artifacts:', error);
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'An error occurred while fetching the artifacts',
      error: error.message,
    });
  }
});


export const getArtifactByItemNo = asyncHandler(async (req, res) => {
  const { id } = req.params; // Extract itemNo from the request parameters

  try {
    // Find the artifact by itemNo
    const artifact = await Artifact.findOne({ itemNo: id });

    if (!artifact) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Artifact not found',
      });
    }


    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Artifact retrieved successfully',
      data: artifact,
    });
  } catch (error) {
    console.error('Error fetching artifact:', error);
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'An error occurred while fetching the artifact',
      error: error.message,
    });
  }
});

// Get Artifact by ID
export const getArtifactById = asyncHandler(async (req, res) => {
  try {
    const artifact = await Artifact.findById(req.params.id);
    if (!artifact) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Artifact not found',
      });
    }
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Artifact retrieved successfully',
      data: artifact,
    });
  } catch (error) {
    console.error('Error fetching artifact by ID:', error);
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'An error occurred while fetching the artifact',
      error: error.message,
    });
  }
});

// Update Artifact

export const updateArtifact = asyncHandler(async (req, res) => {
  try {
    // Find the artifact by ID
    const artifact = await Artifact.findById(req.params.id);
    if (!artifact) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Artifact not found',
      });
    }

    // Check if the itemNo is unique if it's being updated
    if (req.body.itemNo && req.body.itemNo !== artifact.itemNo) {
      const artifactExists = await Artifact.findOne({ itemNo: req.body.itemNo });
      if (artifactExists) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: 'Artifact with this item number already exists',
        });
      }
    }

    // Prepare the update object
    const updateData = {
      name: req.body.name ?? artifact.name,
      itemNo: req.body.itemNo ?? artifact.itemNo,
      serialNo: req.body.serialNo ?? artifact.serialNo,
      description: req.body.description ?? artifact.description,
      madeOf: req.body.madeOf ?? artifact.madeOf,
      age: req.body.age ?? artifact.age,
      shelfNo: req.body.shelfNo ?? artifact.shelfNo,
      hallNo: req.body.hallNo ?? artifact.hallNo,
      particulars: {
        width: req.body.particulars?.width ?? artifact.particulars?.width,
        depth: req.body.particulars?.depth ?? artifact.particulars?.depth,
        circumference: req.body.particulars?.circumference ?? artifact.particulars?.circumference,
        diameters: req.body.particulars?.diameters ?? artifact.particulars?.diameters,
        weight: req.body.particulars?.weight ?? artifact.particulars?.weight,
      },
      images: artifact.images, // Default to existing images
      audio: artifact.audio,   // Default to existing audio
    };

    // Handle new image uploads
    if (req.files?.images) {
      updateData.images = await Promise.all(req.files.images.map(file => uploadFileToS3(file).then(uploaded => uploaded.Location)));
      await Promise.all(artifact.images.map(url => deleteFileFromS3(url)));
    }

    // Handle new audio upload
    if (req.files?.audio && req.files.audio[0]) {
      updateData.audio = await uploadFileToS3(req.files.audio[0]).then(uploaded => uploaded.Location);
      if (artifact.audio) {
        await deleteFileFromS3(artifact.audio);
      }
    }

    // Handle QR Code
    updateData.qrCode = req.body.itemNo || req.body.name || req.body.description
      ? await generateQRCode({ itemNo: req.body.itemNo, name: req.body.name, description: req.body.description })
      : artifact.qrCode;

    // Update the artifact with new data
    const updatedArtifact = await Artifact.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

    if (!updatedArtifact) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Artifact not found',
      });
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Artifact updated successfully',
      data: updatedArtifact,
    });
  } catch (error) {
    console.error('Error updating artifact:', error);
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'An error occurred while updating the artifact',
      error: error.message,
    });
  }
});



// Delete Artifact
export const deleteArtifact = asyncHandler(async (req, res) => {
  try {
    const artifact = await Artifact.findById(req.params.id);

    if (!artifact) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Artifact not found',
      });
    }

    // Delete associated files from S3
    await Promise.all([
      ...artifact.images.map((imageUrl) => deleteFileFromS3(imageUrl)),
      artifact.audio && deleteFileFromS3(artifact.audio),
      artifact.qrCode && deleteFileFromS3(artifact.qrCode),
    ]);

    // Remove the artifact from the database
    await Artifact.deleteOne({ _id: req.params.id });
    res.status(204).json({
      success: true,
      statusCode: 204,
      message: 'Artifact removed successfully',
      data: null,
    });
  } catch (error) {
    console.error(`Error deleting artifact: ${error.message}`);
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Failed to delete artifact',
      error: error.message,
    });
  }
});




// New controller function to calculate totals
// New controller function to calculate totals
export const getArtifactStatistics = asyncHandler(async (req, res) => {
 try {
  
  console.log("Get Artifact Statistics API Triggered");
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Artifact statistics retrieved successfully',
  });
  
 } catch (error) {
  console.error('Error fetching artifact statistics:', error);
  res.status(500).json({
    success: false,
    statusCode: 500,
    message: 'An error occurred while fetching the artifact statistics',
    error: error.message,
  })
 }
});



// const artifacts = await Artifact.find({});
//   const totalArtifacts = artifacts.length;
//   const totalImages = artifacts.reduce((acc, artifact) => acc + artifact.images.length, 0);
//   const totalAudio = artifacts.reduce((acc, artifact) => acc + (artifact.audio ? 1 : 0), 0);
//   const totalQRCodes = artifacts.reduce((acc, artifact) => acc + (artifact.qrCode ? 1 : 0), 0);

//   res.status(200).json({
//     success: true,
//     statusCode: 200,
//     message: 'Artifact statistics retrieved successfully',
//     data: {
//       totalArtifacts,
//       totalImages,
//       totalAudio,
//       totalQRCodes,
//     },
//   });

// try {
//   const totalArtifacts = await Artifact.countDocuments();
//   const activeArtifacts = await Artifact.countDocuments({ status: 'active' });
//   const inactiveArtifacts = await Artifact.countDocuments({ status: 'inactive' });

//   const mostViewedArtifacts = await Artifact.find().sort({ viewCount: -1 }).limit(10); // Top 10 most viewed

//   // Calculate repeat customer rate (month-wise)
//   const currentMonth = new Date().getMonth();
//   const currentYear = new Date().getFullYear();

//   // Get logs for the current month
//   const logs = await Log.find({
//     timestamp: {
//       $gte: new Date(currentYear, currentMonth, 1),
//       $lt: new Date(currentYear, currentMonth + 1, 1),
//     },
//   });

//   // Get unique customers who have visited this month
//   const uniqueCustomers = new Set();
//   const repeatCustomers = new Set();

//   logs.forEach(log => {
//     if (log.customerId) {
//       uniqueCustomers.add(log.customerId); // Add unique customers
//     }
//     if (log.action === 'GET' && log.userId) {
//       repeatCustomers.add(log.userId); // Add repeat customers based on action
//     }
//   });

//   const repeatCustomerRate = (repeatCustomers.size / uniqueCustomers.size) * 100 || 0; // Calculate rate

//   res.status(200).json({
//     success: true,
//     statusCode: 200,
//     message: 'Artifact statistics retrieved successfully',
//     data: {
//       totalArtifacts,
//       activeArtifacts,
//       inactiveArtifacts,
//       mostViewedArtifacts,
//       repeatCustomerRate: repeatCustomerRate.toFixed(2) + '%', // Format to percentage

//     },
//   });


// } catch (error) {
//   console.error('Error fetching artifact statistics:', error);
//   res.status(500).json({
//     success: false,
//     statusCode: 500,
//     message: 'An error occurred while fetching artifact statistics',
//     error: error.message,
//     requestDetails: {
//       url: req.originalUrl,
//       method: req.method,
//       body: req.body,
//     },
//   });
// }