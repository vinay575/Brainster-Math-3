# Firebase Setup Guide

## To get your Firebase configuration:

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `next-6cfd1`
3. **Go to Project Settings**: Click the gear icon → Project Settings
4. **Scroll down to "Your apps"** section
5. **Click "Add app"** → Web app (</>) icon
6. **Register your app** with a name like "BrainsterMath Web"
7. **Copy the config object** that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "next-6cfd1.firebaseapp.com",
  projectId: "next-6cfd1",
  storageBucket: "next-6cfd1.appspot.com",
  messagingSenderId: "115024405331932800837",
  appId: "1:115024405331932800837:web:XXXXXXXXXXXXXXXX"
};
```

## Update the config:

Replace the values in `frontend/js/config.js` with your actual Firebase config values.

## Enable Authentication:

1. **Go to Authentication** in Firebase Console
2. **Click "Get started"**
3. **Go to "Sign-in method" tab**
4. **Enable "Google" provider**
5. **Add your domain** (localhost:3000 for development)

## Current Issues Fixed:

✅ **Tab Switching**: Fixed element ID references in login.js
✅ **Firebase Config**: Added setup guide for proper API keys
✅ **Google Login**: Will work once you add the correct API key

## Next Steps:

1. Get your Firebase config from the console
2. Update `frontend/js/config.js` with real values
3. Test Google login functionality
