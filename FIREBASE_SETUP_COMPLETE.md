# 🔥 Firebase Setup Guide - Complete Solution

## The Problem
You're getting `CONFIGURATION_NOT_FOUND` error because your Firebase project needs to be properly configured in the Firebase Console.

## Step-by-Step Solution

### 1. Go to Firebase Console
- **URL**: https://console.firebase.google.com/
- **Select Project**: `next-6cfd1`

### 2. Enable Authentication
1. **Click "Authentication"** in the left sidebar
2. **Click "Get started"** if you haven't set it up yet
3. **Go to "Sign-in method" tab**
4. **Enable "Google" provider**:
   - Click on "Google"
   - Toggle "Enable"
   - Add your project support email
   - Click "Save"

### 3. Add Your Domain
1. **In Authentication → Settings → Authorized domains**
2. **Add these domains**:
   - `localhost` (for development)
   - `127.0.0.1` (for development)
   - Your production domain (if you have one)

### 4. Get Web App Configuration
1. **Go to Project Settings** (gear icon)
2. **Scroll down to "Your apps"**
3. **Click "Add app" → Web app (</>)**
4. **Register your app**:
   - App nickname: `BrainsterMath Web`
   - Check "Also set up Firebase Hosting" (optional)
5. **Copy the config object** that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "next-6cfd1.firebaseapp.com",
  projectId: "next-6cfd1",
  storageBucket: "next-6cfd1.appspot.com",
  messagingSenderId: "1051049838205",
  appId: "1:1051049838205:web:XXXXXXXXXXXXXXXX"
};
```

### 5. Update Your Config
Replace the values in `frontend/js/config.js` with your real Firebase config:

```javascript
const FIREBASE_CONFIG = {
  apiKey: "YOUR_REAL_API_KEY_HERE",
  authDomain: "next-6cfd1.firebaseapp.com",
  projectId: "next-6cfd1",
  storageBucket: "next-6cfd1.appspot.com",
  messagingSenderId: "1051049838205",
  appId: "YOUR_REAL_APP_ID_HERE"
};
```

## Alternative: Disable Google Login Temporarily

If you want to skip Google login for now, I can modify the code to hide the Google login buttons and only show email login.

## Quick Test
After completing the setup:
1. **Refresh your browser**
2. **Try Google login**
3. **Should work without errors**

## Common Issues & Solutions

### Issue: "CONFIGURATION_NOT_FOUND"
- **Solution**: Complete steps 1-4 above

### Issue: "API key not valid"
- **Solution**: Use the real API key from Firebase Console

### Issue: "Domain not authorized"
- **Solution**: Add your domain in Authentication settings

## Need Help?
If you're still having issues, I can:
1. **Hide Google login** temporarily
2. **Add more debugging** to identify the exact problem
3. **Create a fallback** authentication system

Let me know which option you prefer!
