# 🚀 Quick Start Guide

Get your Student Pilot Photo Generator up and running in 5 minutes!

## Step 1: Install Dependencies

```bash
cd app
npm install
```

## Step 2: Get API Keys

### Google AI API (Required)

1. Visit: https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key

### Google Drive API (Required)

1. Go to: https://console.cloud.google.com/
2. Create a new project
3. Enable "Google Drive API"
4. Create Service Account:
   - APIs & Services → Credentials → Create Credentials → Service Account
   - Download JSON key file
5. Create a folder in Google Drive
6. Share folder with service account email (from JSON file)
7. Copy folder ID from URL

## Step 3: Configure Environment

```bash
cp .env.example .env
nano .env  # or use any text editor
```

Add your keys:

```env
PORT=3000
GOOGLE_AI_API_KEY=your_api_key_here
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...entire JSON...}
GOOGLE_DRIVE_FOLDER_ID=your_folder_id
```

**Important**: Paste the entire service account JSON on one line!

## Step 4: Start the Server

```bash
npm start
```

You should see:

```
✈️  Student Pilot Photo Generator Server

🌐 Local:   http://localhost:3000
📱 Network: http://192.168.1.XXX:3000

Open the Network URL on your iPad!
```

## Step 5: Access from iPad

1. Connect iPad to same WiFi network
2. Open Safari
3. Navigate to the Network URL shown (e.g., `http://192.168.1.100:3000`)
4. Bookmark or add to home screen for easy access

## Step 6: Test It Out!

1. Tap "Take Photo with Camera" or upload an image
2. Click "Generate Pilot Photo"
3. Wait 30-60 seconds
4. Scan QR code or use download link

## Troubleshooting

### Can't connect from iPad?

```bash
# Find your IP address
npm run ip
```

Make sure:
- Both devices on same WiFi
- Firewall allows port 3000
- Using Network URL, not localhost

### API Errors?

Check:
```bash
curl http://localhost:3000/api/health
```

Should return:
```json
{
  "status": "ok",
  "services": {
    "googleAI": true,
    "googleDrive": true
  }
}
```

### Drive Upload Fails?

Verify:
- Service account JSON is valid
- Folder is shared with service account
- Folder ID is correct

## Next Steps

- Read full [README.md](README.md) for advanced configuration
- Integrate real AI image generation (see README)
- Customize the pilot portrait prompt
- Add authentication for production use

## Need Help?

1. Check the [README.md](README.md) troubleshooting section
2. Verify all environment variables are set
3. Check server console logs for errors
4. Review Google Cloud Console for API errors

---

Happy generating! ✈️
