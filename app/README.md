# ✈️ Student Pilot Photo Generator

An AI-powered web application that transforms student photos into professional pilot portraits using Google's Gemini AI. Photos are automatically stored in Google Drive with QR code generation for easy downloading on iPad devices.

## 🌟 Features

- 📸 **iPad-Optimized Interface** - Native camera support and touch-friendly UI
- 🤖 **AI-Powered Generation** - Uses Google Gemini AI to create pilot portraits
- ☁️ **Google Drive Storage** - Automatic cloud storage of generated photos
- 📱 **QR Code Download** - Instant QR codes for easy mobile downloads
- 🎨 **Professional Quality** - Generates studio-quality pilot portraits with uniforms

## 🖼️ How It Works

1. **Capture/Upload** - Take a photo or upload an image of a student
2. **AI Processing** - Google AI analyzes the face and generates a pilot portrait
3. **Cloud Storage** - Generated image is automatically saved to Google Drive
4. **Share** - QR code is displayed for instant download on any device

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js (v16 or higher)
- npm or yarn package manager
- Google Cloud account
- Google AI API access (Gemini)

## 🚀 Quick Start

### 1. Clone and Install

```bash
cd app
npm install
```

### 2. Set Up Google AI API

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create or select a project
3. Generate an API key
4. Copy the API key for later use

### 3. Set Up Google Drive API

#### Create a Service Account:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Google Drive API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Drive API"
   - Click "Enable"

4. Create Service Account:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Fill in the details and create

5. Generate Key:
   - Click on the created service account
   - Go to "Keys" tab
   - Click "Add Key" > "Create New Key"
   - Choose JSON format
   - Download the JSON file

6. Share Drive Folder:
   - Create a folder in Google Drive for storing photos
   - Share the folder with the service account email (found in the JSON file)
   - Give it "Editor" permissions
   - Copy the folder ID from the URL

### 4. Configure Environment Variables

Create a `.env` file in the app directory:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
PORT=3000

# Google AI API Key
GOOGLE_AI_API_KEY=your_actual_api_key_here

# Google Service Account JSON (paste the entire JSON content)
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"..."}

# Google Drive Folder ID (optional)
GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here
```

### 5. Start the Server

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

The server will start on `http://localhost:3000`

## 📱 Using on iPad

### Connect to Local Network:

1. Find your computer's IP address:
   - **Mac**: System Preferences > Network
   - **Windows**: `ipconfig` in Command Prompt
   - **Linux**: `ifconfig` or `ip addr`

2. On your iPad, open Safari and navigate to:
   ```
   http://YOUR_COMPUTER_IP:3000
   ```
   Example: `http://192.168.1.100:3000`

3. For best experience, add to home screen:
   - Tap the Share button
   - Select "Add to Home Screen"
   - The app will work like a native app

### Using the App:

1. **Take Photo**: Tap the camera button to use iPad camera
2. **Or Upload**: Tap the upload area to select from photos
3. **Generate**: Click "Generate Pilot Photo" button
4. **Download**: Scan the QR code or use the download link
5. **Repeat**: Click "Generate Another Photo" for next student

## 🔧 Configuration Options

### Customize the AI Prompt

Edit `/server/index.js` and modify the prompt in the `generatePilotImage` function to customize the pilot portrait style:

```javascript
const prompt = `Your custom prompt here...`;
```

### Adjust Image Quality

In `/server/index.js`, modify the Sharp processing settings:

```javascript
.jpeg({ quality: 90 }) // Change quality (1-100)
.resize(800, 1000)     // Change dimensions
```

### Change Upload Limits

Modify multer configuration in `/server/index.js`:

```javascript
limits: { fileSize: 10 * 1024 * 1024 } // 10MB
```

## 🏗️ Project Structure

```
app/
├── public/              # Frontend files
│   └── index.html      # Main web interface
├── server/             # Backend files
│   └── index.js        # Express server
├── uploads/            # Temporary uploaded images
├── generated/          # Generated pilot photos
├── package.json        # Dependencies
├── .env               # Environment variables (create this)
├── .env.example       # Example environment file
└── README.md          # This file
```

## 🔐 Security Notes

- Never commit `.env` file to version control
- Keep your Google service account JSON file secure
- Regularly rotate API keys
- Set appropriate file size limits
- Consider rate limiting for production use

## 🐛 Troubleshooting

### Issue: "Google Drive not initialized"

**Solution**: Check that your service account JSON is correctly formatted in `.env`

### Issue: "Google AI API error"

**Solutions**:
- Verify your API key is valid
- Check that you've enabled the Gemini API
- Ensure you have API quota remaining

### Issue: Can't access from iPad

**Solutions**:
- Ensure both devices are on the same network
- Check firewall settings on your computer
- Try using your computer's IP address instead of localhost

### Issue: Images not uploading

**Solutions**:
- Check file size (must be under 10MB)
- Verify uploads directory has write permissions
- Check browser console for errors

## 📈 Production Deployment

For production deployment, consider:

1. **Use a proper image generation API** - The current implementation uses a placeholder. Integrate with:
   - Stable Diffusion
   - DALL-E
   - Midjourney API
   - Replicate API

2. **Add authentication** - Protect the endpoint from unauthorized access

3. **Set up HTTPS** - Required for camera access on public domains

4. **Use environment-specific configs** - Separate dev/prod configurations

5. **Add monitoring** - Track usage and errors

6. **Implement rate limiting** - Prevent API abuse

7. **Scale storage** - Consider CDN for generated images

## 🔄 Integrating Real AI Image Generation

The current implementation uses a placeholder for image generation. To integrate real AI image generation:

### Option 1: Replicate API (Recommended)

```bash
npm install replicate
```

```javascript
const Replicate = require('replicate');
const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

const output = await replicate.run(
  "stability-ai/sdxl:...",
  {
    input: {
      prompt: "Professional pilot portrait...",
      image: imageBase64
    }
  }
);
```

### Option 2: OpenAI DALL-E

```bash
npm install openai
```

```javascript
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const response = await openai.images.edit({
  image: imageBuffer,
  prompt: "Transform into a professional pilot portrait...",
  n: 1,
  size: "1024x1024"
});
```

## 📝 API Endpoints

### POST `/api/generate-pilot`

Generate a pilot photo from an uploaded image.

**Request**: Multipart form-data with `image` field

**Response**:
```json
{
  "success": true,
  "message": "Pilot photo generated successfully",
  "imageUrl": "/generated/pilot-xxx.jpg",
  "driveUrl": "https://drive.google.com/...",
  "driveViewLink": "https://drive.google.com/...",
  "fileId": "xxx"
}
```

### GET `/api/health`

Check server health and configuration status.

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2025-11-07T...",
  "services": {
    "googleAI": true,
    "googleDrive": true
  }
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for any purpose.

## 🙋 Support

If you encounter issues or have questions:

1. Check the troubleshooting section
2. Review the console logs for error messages
3. Ensure all environment variables are correctly set
4. Verify API keys and permissions

## 🎯 Roadmap

- [ ] Integration with real AI image generation services
- [ ] Batch processing for multiple students
- [ ] Custom uniform/background options
- [ ] Photo editing capabilities
- [ ] Email delivery of photos
- [ ] Admin dashboard for management
- [ ] Multiple language support
- [ ] Print-ready photo formats

---

Made with ❤️ for student pilot portrait generation
