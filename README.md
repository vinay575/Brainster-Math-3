# BrainsterMath E-Learning Platform

A comprehensive e-learning web application for BrainsterMath with two user roles (Admin and Student), featuring video management, level progression, and real-time analytics.

## 🌟 Features

### Student Features
- **Self-Registration**: Students can sign up with email/password or Google login
- **Multiple Authentication**: Email/password and Google OAuth
- **Level-Based Access**: Students assigned to levels 1-8, with 200 sheets per level
- **Video Learning**: Each sheet has slides A/B with video content
- **Level Upgrade Requests**: Students can request access to higher levels
- **Activity Tracking**: All video views are logged
- **Responsive Dashboard**: Modern, mobile-friendly interface

### Admin Features
- **Student Management**: Full CRUD operations for student accounts
- **Video Management**: Upload videos to S3 or link Google Drive videos
- **Automatic Video Mapping**: S3 videos with naming convention `L{level}_{sheetStart}_{sheetEnd}.mp4` are automatically mapped
- **Level Request Management**: Approve/reject student level upgrade requests
- **Real-Time Analytics**: Charts showing total students, students per level, and recent activity
- **Modern Dashboard**: Clean, professional interface with BrainsterMath branding

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express**
- **TiDB Cloud** (MySQL-compatible database)
- **bcrypt** (password hashing)
- **JWT** (authentication tokens)
- **AWS S3** (video storage)
- **Firebase Admin** (Google OAuth)
- **Multer** (file uploads)

### Frontend
- **HTML5**
- **Tailwind CSS** (styling)
- **Vanilla JavaScript** (ES6 modules)
- **Chart.js** (analytics charts)
- **Firebase JS SDK** (Google login)

## 📁 Project Structure

```
brainstermath/
├── backend/
│   ├── config/
│   │   ├── database.js        # TiDB connection
│   │   ├── firebase.js        # Firebase config
│   │   └── s3.js              # AWS S3 config
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── studentController.js
│   │   ├── videoController.js
│   │   └── levelRequestController.js
│   ├── models/
│   │   ├── Admin.js
│   │   ├── Student.js
│   │   ├── Video.js
│   │   ├── LevelRequest.js
│   │   └── ActivityLog.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── students.js
│   │   ├── videos.js
│   │   └── levelRequests.js
│   ├── middleware/
│   │   └── auth.js
│   ├── schema.sql             # Database schema
│   ├── seed.js                # Seed data script
│   ├── server.js              # Main server file
│   └── package.json
├── frontend/
│   ├── admin/
│   │   └── dashboard.html     # Admin dashboard
│   ├── student/
│   │   ├── dashboard.html     # Student dashboard
│   │   └── video.html         # Video player
│   ├── css/
│   │   └── styles.css         # Global styles
│   ├── js/
│   │   ├── config.js          # API & Firebase config
│   │   ├── api.js             # API wrapper
│   │   ├── login.js
│   │   └── signup.js
│   ├── login.html
│   └── signup.html
├── ca.pem                     # TiDB SSL certificate
├── .env                       # Environment variables
├── .env.example               # Environment template
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- TiDB Cloud account
- AWS S3 bucket
- Firebase project (for Google login)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd brainstermath
```

### 2. Download TiDB SSL Certificate

Download the ca.pem certificate from TiDB Cloud:
1. Log in to your TiDB Cloud dashboard
2. Navigate to your cluster
3. Click "Connect"
4. Download the CA certificate
5. Save it as `ca.pem` in the project root directory

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your actual credentials:

```env
# TiDB Cloud Configuration
DB_HOST=gateway01.ap-northeast-1.prod.aws.tidbcloud.com
DB_PORT=4000
DB_USER=3JqyNadcAP18rrJ.root
DB_PASSWORD=pAI5QUe7kn5oO0xs
DB_NAME=test
DB_SSL_CA=./ca.pem

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=ap-south-1
AWS_BUCKET_NAME=your_bucket_name
AWS_BUCKET_PREFIX=brainstermath-videos/

# Firebase Configuration
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Server Configuration
PORT=5000
FRONTEND_URL=http://localhost:3000

# Allowed Google Login Domains
ALLOWED_GOOGLE_DOMAINS=brainstermath.com,example.com
```

### 4. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Enable Authentication > Sign-in method > Google
4. Go to Project Settings > Service Accounts
5. Click "Generate New Private Key"
6. Copy the credentials to your `.env` file
7. For frontend, get your Web API key from Project Settings > General
8. Update `frontend/js/config.js` with your Firebase config:

```javascript
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

### 5. Set Up AWS S3

1. Create an S3 bucket in AWS console
2. Create a folder: `brainstermath-videos/`
3. Upload videos with naming convention: `L{level}_{sheetStart}_{sheetEnd}.mp4`
   - Example: `L1_1_5.mp4` (Level 1, Sheets 1-5)
   - Example: `L1_6_10.mp4` (Level 1, Sheets 6-10)
4. Create an IAM user with S3 access
5. Generate access keys and add to `.env`

### 6. Install Backend Dependencies

```bash
cd backend
npm install
```

### 7. Initialize Database

Run migrations and seed data:

```bash
npm run seed
```

This will:
- Create all database tables
- Create an admin user: `admin@brainstermath.com` / `admin123`
- Create 8 sample students (one per level) with password: `student123`

### 8. Start the Backend Server

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

The server will start on `http://localhost:5000`

### 9. Serve the Frontend

Use any static file server. For example:

```bash
cd frontend
npx serve .
```

Or use Python:

```bash
cd frontend
python3 -m http.server 3000
```

Or use VS Code Live Server extension.

Access the application at `http://localhost:3000`

### 10. Sync S3 Videos

After uploading videos to S3, sync them to the database:

1. Login as admin
2. Go to Video Management
3. Click "Sync S3 Videos"

This will automatically parse filenames and create video entries.

## 🎯 Usage

### Admin Login
- URL: `http://localhost:3000/login.html`
- Click "Admin" tab
- Email: `admin@brainstermath.com`
- Password: `admin123`

### Student Login
- URL: `http://localhost:3000/login.html`
- Click "Student" tab
- Use any seeded student email (e.g., `alice@example.com`)
- Password: `student123`

Or create a new account at `http://localhost:3000/signup.html`

### Video Naming Convention

Videos in S3 **must** follow this naming pattern:

```
L{level}_{sheetStart}_{sheetEnd}.mp4
```

Examples:
- `L1_1_5.mp4` - Level 1, Sheets 1-5
- `L1_6_10.mp4` - Level 1, Sheets 6-10
- `L2_1_10.mp4` - Level 2, Sheets 1-10
- `L8_191_200.mp4` - Level 8, Sheets 191-200

### Student Level Progression

1. Student starts at their assigned level
2. Student can request upgrade to next level
3. Admin receives notification
4. Admin approves/rejects request
5. If approved, student's level is updated (old level is removed)
6. Student gets access to the new level's content

## 📊 Database Schema

### Tables

- **admins**: Admin user accounts
- **students**: Student accounts with level and accessible_levels
- **videos**: Video metadata and S3 links
- **level_requests**: Student upgrade requests
- **activity_log**: Student video viewing history

See `backend/schema.sql` for full schema.

## 🔒 Security Features

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens for session management
- Role-based access control (admin/student)
- Level-based content restriction
- TLS/SSL for TiDB connection
- Environment variables for sensitive data
- CORS configuration
- Input validation and sanitization

## 🎨 UI Design

The interface follows BrainsterMath branding:

**Colors:**
- Primary: `#7e62a8` (purple)
- Text Headings: `#271d47` (dark purple)
- Admin Background: `#7e62a8`

**Features:**
- Responsive design (mobile, tablet, desktop)
- Modern glassmorphism effects
- Smooth animations and transitions
- Accessible forms and navigation
- Clean, professional layout

## 🧪 Testing

### Manual Testing Checklist

**Authentication:**
- [ ] Student email/password login
- [ ] Student Google login
- [ ] Student signup
- [ ] Admin email/password login
- [ ] Admin Google login
- [ ] Token expiration and refresh
- [ ] Logout functionality

**Student Features:**
- [ ] View assigned level sheets
- [ ] Play videos for accessible sheets
- [ ] Navigate between videos (previous/next)
- [ ] Request level upgrade
- [ ] View request status
- [ ] Activity logging

**Admin Features:**
- [ ] View all students
- [ ] Create student
- [ ] Edit student
- [ ] Delete student
- [ ] Change student level
- [ ] Upload video to S3
- [ ] Add Google Drive video link
- [ ] Sync S3 videos
- [ ] Delete video
- [ ] View level upgrade requests
- [ ] Approve/reject requests
- [ ] View analytics charts

**Security:**
- [ ] Students can only access their level's content
- [ ] Students cannot access admin routes
- [ ] Admins can access all routes
- [ ] Invalid tokens are rejected
- [ ] SQL injection prevention
- [ ] XSS prevention

## 🐛 Troubleshooting

### Database Connection Failed
- Verify TiDB credentials in `.env`
- Check `ca.pem` file exists and is correct
- Ensure TiDB cluster is running
- Check firewall/network settings

### Firebase Google Login Not Working
- Verify Firebase config in `frontend/js/config.js`
- Check Firebase console for enabled authentication methods
- Ensure authorized domains are configured in Firebase
- Check browser console for errors

### Videos Not Loading
- Verify S3 bucket permissions (public read access)
- Check video naming convention matches pattern
- Run "Sync S3 Videos" in admin dashboard
- Check browser console for CORS errors
- Verify AWS credentials in `.env`

### CORS Errors
- Check `FRONTEND_URL` in `.env` matches your frontend URL
- Verify CORS middleware is configured correctly
- Check browser console for specific CORS error

## 📝 API Endpoints

### Authentication
- `POST /api/auth/student/login` - Student email login
- `POST /api/auth/admin/login` - Admin email login
- `POST /api/auth/student/signup` - Student registration
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/verify` - Verify JWT token

### Students
- `GET /api/students` - Get all students (admin)
- `GET /api/students/:id` - Get student by ID (admin)
- `POST /api/students` - Create student (admin)
- `PUT /api/students/:id` - Update student (admin)
- `DELETE /api/students/:id` - Delete student (admin)
- `GET /api/students/stats` - Get statistics (admin)
- `GET /api/students/profile` - Get my profile (student)
- `GET /api/students/activity` - Get my activity (student)
- `POST /api/students/activity` - Log activity (student)

### Videos
- `POST /api/videos/upload` - Upload video to S3 (admin)
- `POST /api/videos/google-drive` - Add Google Drive link (admin)
- `POST /api/videos/sync` - Sync S3 videos (admin)
- `GET /api/videos/all` - Get all videos (admin)
- `GET /api/videos/level/:level` - Get videos by level (student)
- `GET /api/videos/level/:level/sheet/:sheet` - Get video by sheet (student)
- `DELETE /api/videos/:id` - Delete video (admin)

### Level Requests
- `POST /api/level-requests` - Create upgrade request (student)
- `GET /api/level-requests/my-requests` - Get my requests (student)
- `GET /api/level-requests` - Get all requests (admin)
- `GET /api/level-requests/pending` - Get pending requests (admin)
- `GET /api/level-requests/pending/count` - Get pending count (admin)
- `POST /api/level-requests/:id/approve` - Approve request (admin)
- `POST /api/level-requests/:id/reject` - Reject request (admin)

## 🚀 Deployment

### Backend Deployment

1. Set up a Linux server (Ubuntu/Debian recommended)
2. Install Node.js and PM2:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2
```

3. Clone repository and install dependencies:
```bash
git clone <repo-url>
cd brainstermath/backend
npm install
```

4. Configure `.env` with production values
5. Run migrations:
```bash
npm run seed
```

6. Start with PM2:
```bash
pm2 start server.js --name brainstermath-api
pm2 save
pm2 startup
```

### Frontend Deployment

Deploy frontend to:
- **Netlify**: Drag and drop `frontend/` folder
- **Vercel**: Connect GitHub repository
- **AWS S3 + CloudFront**: Static website hosting
- **Nginx**: Serve as static files

Update `frontend/js/config.js` with production API URL.

## 📄 License

Proprietary - BrainsterMath

## 👥 Support

For issues and questions, contact the development team.

---

**Built with ❤️ for BrainsterMath**
