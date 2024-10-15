import Media from '../models/mediaModel.js';

const storeMediaController = async (req, res) => {
  try {
    const { fileType, caption, description } = req.body;
    const fileUrls = req.fileUrls; 
    
    // Log to debug the issue
    console.log('File URLs:', fileUrls);

    // Ensure fileType matches the keys in fileUrls
    if (!fileUrls || !fileUrls[fileType]) {
      return res.status(400).json({ error: 'Invalid fileType or no files uploaded.' });
    }

    const newMedia = new Media({
      fileType,
      caption,
      description,
      files: fileUrls[fileType].map(url => ({ url })), 
    });

    await newMedia.save();

    res.status(201).json({
      statusCode: 201,
      message: 'Media files successfully stored.',
      media: newMedia,
    });
  } catch (error) {
    console.error('Error saving media:', error);
    res.status(500).json({ error: 'Failed to store media files.' });
  }
};


export default storeMediaController