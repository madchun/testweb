require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { google } = require('googleapis');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const { getLocalIPAddress } = require('./get-ip');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/generated', express.static(path.join(__dirname, '../generated')));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        try {
            await fs.mkdir(uploadDir, { recursive: true });
        } catch (error) {
            console.error('Error creating upload directory:', error);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

// Initialize Google Drive API
let driveClient = null;
async function initializeDrive() {
    try {
        const auth = new google.auth.GoogleAuth({
            credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}'),
            scopes: ['https://www.googleapis.com/auth/drive.file']
        });
        driveClient = google.drive({ version: 'v3', auth });
        console.log('✅ Google Drive initialized');
    } catch (error) {
        console.error('⚠️  Google Drive initialization failed:', error.message);
    }
}

initializeDrive();

// Helper function to convert image to base64
async function imageToBase64(filePath) {
    const imageBuffer = await fs.readFile(filePath);
    return imageBuffer.toString('base64');
}

// Helper function to generate pilot image using Google AI
async function generatePilotImage(imagePath) {
    try {
        // Read and process the image
        const imageBuffer = await fs.readFile(imagePath);
        const base64Image = imageBuffer.toString('base64');

        // Using Gemini Pro Vision for image understanding and generation prompt
        const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

        const prompt = `Analyze this student's face carefully and create a detailed description for generating a professional pilot portrait.

The portrait should show the person wearing a professional pilot uniform with:
- A crisp white pilot shirt with epaulettes (shoulder stripes)
- A black pilot tie
- Gold pilot wings badge on the chest
- Captain stripes on the shoulders
- Professional aviation headset (optional)
- Confident, professional expression
- Studio-quality lighting
- Blurred cockpit or aviation background
- Photorealistic quality

Maintain the person's facial features, skin tone, age, and gender accurately. The style should be a professional aviation portrait photograph, suitable for an airline pilot ID or promotional material.

Please provide a detailed description that can be used for AI image generation.`;

        const imageParts = [
            {
                inlineData: {
                    data: base64Image,
                    mimeType: 'image/jpeg'
                }
            }
        ];

        const result = await model.generateContent([prompt, ...imageParts]);
        const response = await result.response;
        const description = response.text();

        console.log('Generated description for pilot image:', description);

        // NOTE: Google Gemini API doesn't directly generate images yet
        // You would need to use a separate image generation API like:
        // - Imagen API (when available)
        // - Stable Diffusion API
        // - Midjourney API
        // - DALL-E API

        // For now, we'll create a placeholder implementation
        // In production, integrate with an actual image generation service

        return await createPilotImagePlaceholder(imagePath, description);

    } catch (error) {
        console.error('Error generating pilot image:', error);
        throw error;
    }
}

// Placeholder function - Replace with actual image generation API
async function createPilotImagePlaceholder(originalImagePath, description) {
    try {
        // This is a placeholder that adds text overlay
        // In production, replace with actual AI image generation

        const outputPath = path.join(
            __dirname,
            '../generated',
            `pilot-${uuidv4()}.jpg`
        );

        // Ensure generated directory exists
        await fs.mkdir(path.join(__dirname, '../generated'), { recursive: true });

        // For now, copy and process the original image with a border/overlay
        // This is just a placeholder - you should integrate with actual AI image generation
        await sharp(originalImagePath)
            .resize(800, 1000, {
                fit: 'cover',
                position: 'center'
            })
            .jpeg({ quality: 90 })
            .toFile(outputPath);

        return outputPath;

    } catch (error) {
        console.error('Error creating placeholder image:', error);
        throw error;
    }
}

// Helper function to upload to Google Drive
async function uploadToDrive(filePath, fileName) {
    if (!driveClient) {
        throw new Error('Google Drive not initialized. Please check your service account credentials.');
    }

    try {
        const fileMetadata = {
            name: fileName,
            parents: [process.env.GOOGLE_DRIVE_FOLDER_ID || 'root']
        };

        const media = {
            mimeType: 'image/jpeg',
            body: require('fs').createReadStream(filePath)
        };

        const response = await driveClient.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id, webViewLink, webContentLink'
        });

        // Make the file publicly accessible
        await driveClient.permissions.create({
            fileId: response.data.id,
            requestBody: {
                role: 'reader',
                type: 'anyone'
            }
        });

        // Get the direct download link
        const file = await driveClient.files.get({
            fileId: response.data.id,
            fields: 'webContentLink, webViewLink'
        });

        return {
            fileId: response.data.id,
            webViewLink: file.data.webViewLink,
            downloadLink: `https://drive.google.com/uc?export=download&id=${response.data.id}`
        };
    } catch (error) {
        console.error('Error uploading to Google Drive:', error);
        throw error;
    }
}

// API endpoint to generate pilot photo
app.post('/api/generate-pilot', upload.single('image'), async (req, res) => {
    let uploadedFilePath = null;
    let generatedFilePath = null;

    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file uploaded' });
        }

        uploadedFilePath = req.file.path;
        console.log('📸 Image uploaded:', uploadedFilePath);

        // Step 1: Generate pilot image using AI
        console.log('🎨 Generating pilot image with AI...');
        generatedFilePath = await generatePilotImage(uploadedFilePath);
        console.log('✅ Pilot image generated:', generatedFilePath);

        // Step 2: Upload to Google Drive
        console.log('☁️  Uploading to Google Drive...');
        const driveResult = await uploadToDrive(
            generatedFilePath,
            `pilot-photo-${Date.now()}.jpg`
        );
        console.log('✅ Uploaded to Google Drive:', driveResult.fileId);

        // Step 3: Return results
        const localImageUrl = `/generated/${path.basename(generatedFilePath)}`;

        res.json({
            success: true,
            message: 'Pilot photo generated successfully',
            imageUrl: localImageUrl,
            driveUrl: driveResult.downloadLink,
            driveViewLink: driveResult.webViewLink,
            fileId: driveResult.fileId
        });

        // Cleanup uploaded file after a delay
        setTimeout(async () => {
            try {
                await fs.unlink(uploadedFilePath);
                console.log('🗑️  Cleaned up uploaded file');
            } catch (error) {
                console.error('Error cleaning up uploaded file:', error);
            }
        }, 5000);

    } catch (error) {
        console.error('❌ Error processing request:', error);

        // Cleanup on error
        if (uploadedFilePath) {
            try {
                await fs.unlink(uploadedFilePath);
            } catch (e) {
                console.error('Error cleaning up:', e);
            }
        }

        res.status(500).json({
            error: 'Failed to generate pilot photo',
            details: error.message
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
            googleAI: !!process.env.GOOGLE_AI_API_KEY,
            googleDrive: !!driveClient
        }
    });
});

// Start server
app.listen(PORT, () => {
    const localIP = getLocalIPAddress();
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║     ✈️  Student Pilot Photo Generator Server              ║
║                                                            ║
║     🌐 Local:   http://localhost:${PORT}                  ║
║     📱 Network: http://${localIP}:${PORT}                    ║
║                                                            ║
║     Open the Network URL on your iPad!                    ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝

Status:
  ${process.env.GOOGLE_AI_API_KEY ? '✅' : '⚠️ '} Google AI API ${process.env.GOOGLE_AI_API_KEY ? 'configured' : 'NOT configured'}
  ${driveClient ? '✅' : '⚠️ '} Google Drive ${driveClient ? 'configured' : 'NOT configured'}

Ready to generate pilot photos! 🚀
`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    process.exit(0);
});
