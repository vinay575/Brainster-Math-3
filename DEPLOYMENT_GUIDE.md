# Deployment Configuration Guide

## Backend (Render) Configuration

### Environment Variables to Set in Render Dashboard:

```bash
# Database
DATABASE_URL=your_database_connection_string

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# Frontend URLs (comma-separated)
FRONTEND_URLS=http://localhost:3000,https://sprightly-cuchufli-5a381c.netlify.app

# Firebase Configuration (for Google Login)
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email

# AWS S3 Configuration (if using S3 for videos)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_BUCKET_NAME=your_bucket_name

# Environment
NODE_ENV=production
PORT=5000
```

## Frontend (Netlify) Configuration

### Environment Variables to Set in Netlify Dashboard:

```bash
# API URL
REACT_APP_API_URL=https://your-backend-app.onrender.com

# Firebase Config
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

## Firebase Console Configuration

1. Go to Authentication > Sign-in method
2. Enable Google provider
3. Add authorized domains:
   - `localhost` (for development)
   - `sprightly-cuchufli-5a381c.netlify.app` (your Netlify domain)

## CORS Configuration

The backend is already configured to allow:
- `http://localhost:3000` (local development)
- `https://sprightly-cuchufli-5a381c.netlify.app` (your Netlify domain)

## Testing

After deployment, test with:
```bash
curl -H "Origin: https://sprightly-cuchufli-5a381c.netlify.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     https://your-backend-app.onrender.com/api/health
```

## Common Issues

1. **CORS Errors**: Make sure your Netlify domain is in FRONTEND_URLS
2. **Firebase Auth**: Add your Netlify domain to Firebase authorized domains
3. **API Connection**: Verify your backend URL in frontend config
4. **Environment Variables**: Double-check all variables are set correctly
