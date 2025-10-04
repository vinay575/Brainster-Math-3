# BrainsterMath Quick Setup Guide

## Prerequisites

✅ Node.js v16+ installed
✅ TiDB Cloud account with active cluster
✅ AWS S3 bucket created
✅ Firebase project created (for Google login)

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 2: Configure Environment

Copy `.env.example` to `.env` and update:

```bash
cp .env.example .env
nano .env  # or use your favorite editor
```

**Required values:**
- Database credentials (already provided for TiDB)
- JWT_SECRET (generate a secure random string)
- AWS S3 credentials and bucket name
- Firebase credentials (from Firebase Console > Project Settings > Service Accounts)

### Step 3: Download TiDB SSL Certificate

1. Go to TiDB Cloud Dashboard
2. Select your cluster
3. Click "Connect"
4. Download `ca.pem`
5. Place it in the project root directory

### Step 4: Setup Firebase (Optional - for Google Login)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create/Select project
3. Enable Authentication > Google Sign-In
4. Download service account key:
   - Project Settings > Service Accounts
   - Generate New Private Key
5. Copy credentials to `.env`

For frontend Firebase config:
```javascript
// frontend/js/config.js
const FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  // ... get from Firebase Console > Project Settings
};
```

### Step 5: Initialize Database

```bash
cd backend
npm run seed
```

This creates:
- Database tables
- Admin user: `admin@brainstermath.com` / `admin123`
- 8 sample students (one per level) with password: `student123`

### Step 6: Start Backend Server

```bash
npm start
```

Server runs on `http://localhost:5000`

### Step 7: Start Frontend

Open a new terminal:

```bash
cd frontend
npx serve .
```

Or use Python:

```bash
python3 -m http.server 3000
```

Or use any static file server.

Frontend runs on `http://localhost:3000`

### Step 8: Upload Videos to S3

Videos must follow naming convention: `L{level}_{sheetStart}_{sheetEnd}.mp4`

Examples:
```
L1_1_5.mp4      → Level 1, Sheets 1-5
L1_6_10.mp4     → Level 1, Sheets 6-10
L2_1_10.mp4     → Level 2, Sheets 1-10
```

Upload to: `your-bucket/brainstermath-videos/`

### Step 9: Sync Videos

1. Login as admin
2. Go to Videos section
3. Click "Sync S3"
4. Videos will be automatically mapped to database

### Step 10: Test the Application

**Admin Login:**
- URL: `http://localhost:3000/login.html`
- Click "Admin" tab
- Email: `admin@brainstermath.com`
- Password: `admin123`

**Student Login:**
- URL: `http://localhost:3000/login.html`
- Click "Student" tab
- Email: `alice@example.com` (or any seeded student)
- Password: `student123`

Or create new account at: `http://localhost:3000/signup.html`

## 📋 Feature Checklist

After setup, test these features:

### Admin Features
- [ ] Login with email/password
- [ ] View dashboard with charts
- [ ] Add new student
- [ ] Edit student level
- [ ] Delete student
- [ ] Upload video to S3
- [ ] Sync S3 videos
- [ ] View level upgrade requests
- [ ] Approve/reject requests

### Student Features
- [ ] Sign up with email/password
- [ ] Login with email/password
- [ ] View assigned level videos
- [ ] Play videos
- [ ] Navigate between videos (previous/next)
- [ ] Request level upgrade
- [ ] View request status

## 🔧 Common Issues

### Database Connection Failed
- Verify TiDB credentials in `.env`
- Check `ca.pem` exists in root directory
- Ensure TiDB cluster is running

### Videos Not Loading
- Check S3 bucket permissions (public read)
- Verify AWS credentials in `.env`
- Run "Sync S3 Videos" in admin panel
- Check video naming convention

### Google Login Not Working
- Verify Firebase config in `frontend/js/config.js`
- Check Firebase Console > Authentication > Sign-in methods
- Ensure authorized domains are configured

### CORS Errors
- Check `FRONTEND_URL` in `.env` matches your frontend URL
- Restart backend after changing `.env`

## 📞 Need Help?

Check the full README.md for detailed documentation.

---

**Total Setup Time: ~5 minutes** ⚡

Once configured, you're ready to use BrainsterMath!
