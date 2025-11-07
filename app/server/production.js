// Production-ready server configuration
// Use this for deployment instead of index.js

require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { google } = require('googleapis');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const { getLocalIPAddress } = require('./get-ip');

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Security Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
            imgSrc: ["'self'", "data:", "blob:"],
            connectSrc: ["'self'"]
        }
    },
    crossOriginEmbedderPolicy: false
}));

// Compression
app.use(compression());

// CORS - Configure based on your domain
const corsOptions = {
    origin: isProduction
        ? [process.env.ALLOWED_ORIGIN || 'https://yourdomain.com']
        : '*',
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Strict rate limiting for image generation endpoint
const generateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // Max 5 generations per minute per IP
    message: 'Too many image generation requests. Please wait a moment.'
});

// Body parser with limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Static files
app.use(express.static(path.join(__dirname, '../public')));
app.use('/generated', express.static(path.join(__dirname, '../generated')));

// Request logging in production
if (isProduction) {
    app.use((req, res, next) => {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}`);
        next();
    });
}

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
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 1 // Only one file per request
    },
    fileFilter: (req, file, cb) => {
        // Only allow image files
        const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only image files (JPEG, PNG, WebP) are allowed'));
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

// Helper function to generate pilot image using Google AI
async function generatePilotImage(imagePath) {
    try {
        const imageBuffer = await fs.readFile(imagePath);
        const base64Image = imageBuffer.toString('base64');

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

        console.log('Generated description for pilot image');

        // Create placeholder image (replace with actual AI generation)
        return await createPilotImagePlaceholder(imagePath, description);

    } catch (error) {
        console.error('Error generating pilot image:', error);
        throw new Error('Failed to generate pilot image: ' + error.message);
    }
}

// Placeholder function - Replace with actual image generation API
async function createPilotImagePlaceholder(originalImagePath, description) {
    try {
        const outputPath = path.join(
            __dirname,
            '../generated',
            `pilot-${uuidv4()}.jpg`
        );

        await fs.mkdir(path.join(__dirname, '../generated'), { recursive: true });

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
        throw new Error('Failed to create image: ' + error.message);
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
        throw new Error('Failed to upload to Google Drive: ' + error.message);
    }
}

// API endpoint to generate pilot photo
app.post('/api/generate-pilot', generateLimiter, upload.single('image'), async (req, res) => {
    let uploadedFilePath = null;
    let generatedFilePath = null;

    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file uploaded' });
        }

        uploadedFilePath = req.file.path;
        console.log('📸 Image uploaded:', path.basename(uploadedFilePath));

        // Step 1: Generate pilot image using AI
        console.log('🎨 Generating pilot image with AI...');
        generatedFilePath = await generatePilotImage(uploadedFilePath);
        console.log('✅ Pilot image generated');

        // Step 2: Upload to Google Drive
        console.log('☁️  Uploading to Google Drive...');
        const driveResult = await uploadToDrive(
            generatedFilePath,
            `pilot-photo-${Date.now()}.jpg`
        );
        console.log('✅ Uploaded to Google Drive');

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
            details: isProduction ? 'Internal server error' : error.message
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        services: {
            googleAI: !!process.env.GOOGLE_AI_API_KEY,
            googleDrive: !!driveClient
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);

    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
        }
        return res.status(400).json({ error: 'File upload error: ' + err.message });
    }

    res.status(500).json({
        error: isProduction ? 'Internal server error' : err.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Start server
const server = app.listen(PORT, () => {
    const localIP = getLocalIPAddress();
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║     ✈️  Student Pilot Photo Generator Server              ║
║     ${isProduction ? '🔒 PRODUCTION MODE' : '🔧 DEVELOPMENT MODE'}                                    ║
║                                                            ║
║     🌐 Local:   http://localhost:${PORT}                  ║
║     📱 Network: http://${localIP}:${PORT}                    ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝

Status:
  ${process.env.GOOGLE_AI_API_KEY ? '✅' : '⚠️ '} Google AI API ${process.env.GOOGLE_AI_API_KEY ? 'configured' : 'NOT configured'}
  ${driveClient ? '✅' : '⚠️ '} Google Drive ${driveClient ? 'configured' : 'NOT configured'}
  ${isProduction ? '✅' : '⚠️ '} Security headers ${isProduction ? 'enabled' : 'disabled'}
  ${isProduction ? '✅' : '⚠️ '} Rate limiting ${isProduction ? 'enabled' : 'disabled'}

Ready to generate pilot photos! 🚀
`);
});

// Graceful shutdown
const shutdown = async () => {
    console.log('\n🛑 Shutting down gracefully...');

    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
        console.error('⚠️  Forced shutdown');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    shutdown();
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = app;
