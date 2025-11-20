# AI Photo Booth - School Open Day

An interactive web-based kiosk application that allows users to take selfies and transform them into AI-generated styled photos using Google Gemini AI. Perfect for School Open Days and events!

## Features

- **Interactive Kiosk Mode**: Full-screen touch-friendly interface
- **AI-Powered Transformations**: 9 pre-defined styles (Astronaut, Doctor, Scientist, Chef, Pilot, Artist, Superhero, Wizard, Rock Star)
- **Professional 4R Photos**: Output in 1200x1800px format suitable for printing
- **QR Code Delivery**: Users scan a QR code to download their photo
- **Custom Branding**: Optional overlay frame for school branding
- **Auto-Reset**: Returns to attract screen after 3 minutes of inactivity

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 3
- **AI**: Google Gemini 2.0 Flash Exp
- **QR Code**: qrcode library

## Prerequisites

Before you begin, ensure you have:

1. **Node.js** (version 18 or higher)
2. **Google Gemini API Key** - Get it from [Google AI Studio](https://aistudio.google.com/app/apikey)
3. **Webhook URL** - A webhook endpoint to handle image uploads (e.g., N8N, Make, or custom)

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd testweb
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:

   Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```

   Edit `.env`:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   VITE_WEBHOOK_URL=your_webhook_url_here
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

## Configuration

### Runtime Configuration

Settings can also be configured at runtime through the Settings modal (gear icon on the home screen):

- **School Name**: Displayed on the welcome screen
- **Gemini API Key**: Required for AI image generation
- **Webhook URL**: Required for QR code generation
- **Overlay Frame URL**: Optional branded frame (1200x1800px recommended)

Settings are stored in browser localStorage and persist across sessions.

### Webhook Setup

The webhook endpoint should:

1. Accept a POST request with JSON body:
   ```json
   {
     "image": "data:image/jpeg;base64,/9j/4AAQ...",
     "metadata": {
       "style": "Astronaut",
       "timestamp": "2025-11-20T10:30:00.000Z"
     }
   }
   ```

2. Upload the image to cloud storage (e.g., S3, Cloudinary, etc.)

3. Return a JSON response with the public URL:
   ```json
   {
     "url": "https://your-storage.com/photos/unique-id.jpg"
   }
   ```

#### Example N8N Workflow

1. Create a webhook node to receive POST requests
2. Add a "Move Binary Data" node to convert base64 to binary
3. Add an upload node (e.g., S3, Cloudinary, etc.)
4. Add a "Respond to Webhook" node that returns the URL

#### Example Make.com Scenario

1. Webhook module to receive data
2. Base64 decoder
3. Upload to cloud storage (Dropbox, Google Drive, etc.)
4. Return public URL in response

## Building for Production

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Preview the production build**:
   ```bash
   npm run preview
   ```

3. **Deploy**: Upload the `dist` folder to your web server or hosting service

### Deployment Recommendations

- **Static Hosting**: Vercel, Netlify, GitHub Pages, AWS S3 + CloudFront
- **Kiosk Mode**: Use a dedicated device (tablet/touchscreen) in fullscreen mode
- **Browser**: Chrome or Edge recommended for best camera support
- **Network**: Stable internet connection required for AI processing

## Kiosk Setup

For a professional kiosk experience:

1. **Hardware**:
   - Touchscreen display (recommended: 24" or larger)
   - Webcam (1080p or better)
   - Computer/Tablet running Chrome in kiosk mode

2. **Browser Setup (Chrome)**:
   ```bash
   chrome --kiosk --app=http://localhost:3000
   ```

3. **Disable Sleep/Screensaver**:
   - Configure OS to prevent display from sleeping
   - Disable automatic updates during event hours

4. **Camera Permissions**:
   - Allow camera access for the application
   - Test camera before the event

## Project Structure

```
src/
├── components/          # React components
│   ├── AttractScreen.tsx    # IDLE state - welcome screen
│   ├── CameraCapture.tsx    # CAMERA state - take photo
│   ├── StyleSelection.tsx   # REVIEW state - choose style
│   ├── LoadingScreen.tsx    # PROCESSING state - AI working
│   ├── ResultDisplay.tsx    # RESULT state - show result + QR
│   └── SettingsModal.tsx    # Configuration modal
├── services/            # External service integrations
│   └── geminiService.ts     # Google Gemini AI integration
├── utils/               # Utility functions
│   ├── imageProcessing.ts   # Canvas/image manipulation
│   └── storage.ts           # localStorage helpers
├── types/               # TypeScript type definitions
│   └── index.ts
├── App.tsx              # Main app with state machine
├── main.tsx             # React entry point
└── index.css            # Global styles (Tailwind)
```

## State Machine

The application uses a simple state machine:

```
IDLE → CAMERA → REVIEW → PROCESSING → RESULT → (back to IDLE)
         ↑         ↓
         └─────────┘ (Retake)
```

- **IDLE**: Attract screen, waiting for user to start
- **CAMERA**: Webcam active, countdown, capture
- **REVIEW**: Display captured photo, select style
- **PROCESSING**: AI generating styled image
- **RESULT**: Display final photo with QR code

## Customization

### Adding New Styles

Edit `src/components/StyleSelection.tsx` and add to the `STYLE_OPTIONS` array:

```typescript
{
  id: 'new-style',
  name: 'Style Name',
  description: 'Short description',
  prompt: 'Detailed AI prompt for transformation...',
  icon: '🎭',
}
```

### Changing Colors

Edit `tailwind.config.js`:

```javascript
colors: {
  primary: '#1e3a8a',    // Main blue
  secondary: '#f59e0b',  // Accent orange
  background: '#f3f4f6', // Background gray
}
```

### Adjusting Photo Dimensions

Edit `src/utils/imageProcessing.ts`:

```typescript
export const PHOTO_4R_WIDTH = 1200;  // 4x6 inches at 300 DPI
export const PHOTO_4R_HEIGHT = 1800;
```

## Troubleshooting

### Camera not working
- Check browser permissions (Settings → Privacy → Camera)
- Ensure HTTPS or localhost (cameras require secure context)
- Try a different browser (Chrome/Edge recommended)

### AI generation fails
- Verify Gemini API key is correct and has quota
- Check browser console for error messages
- Ensure stable internet connection

### QR code not appearing
- Verify webhook URL is configured correctly
- Check webhook is returning correct JSON format
- Test webhook independently with curl/Postman

### Image quality issues
- Ensure good lighting for camera
- Use high-quality webcam (1080p minimum)
- Adjust JPEG quality in `imageProcessing.ts` if needed

## Important Notes

### Gemini Image Generation Limitation

The current implementation uses Google Gemini 2.0 Flash Exp, which generates text descriptions rather than actual images. For production use, you should:

1. Integrate with Google Imagen API for actual image generation
2. Use the Gemini-generated description to call another image generation service
3. Or use a different AI model that supports image-to-image transformation

This is noted in `src/services/geminiService.ts` as a TODO for production deployment.

### Privacy & Data

- No photos are stored permanently by the application
- Photos are only uploaded to your configured webhook
- Configure your webhook to handle data retention according to your privacy policy
- Consider adding a privacy notice on the attract screen

## License

This project is provided as-is for educational and event purposes.

## Support

For issues, questions, or contributions, please contact the development team or create an issue in the repository.

---

**Built with ❤️ for School Open Days**
