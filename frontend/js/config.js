// Determine API URL based on environment
let API_URL;

if (typeof window !== 'undefined') {
  // Browser environment
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Local development
    API_URL = 'http://localhost:5000/api';
  } else if (hostname.includes('netlify.app')) {
    // Netlify production - replace with your actual Render backend URL
    API_URL = 'https://brainster-math-3.onrender.com/api';
  } else {
    // Fallback for other domains
    API_URL = 'https://brainster-math-3.onrender.com/api';
  }
} else {
  // Node.js environment
  API_URL = process.env.NODE_ENV === 'production' 
    ? 'https://brainster-math-3.onrender.comcd/api'
    : 'http://localhost:5000/api';
}

// TODO: Replace with your actual Firebase configuration from Firebase Console
// Go to: https://console.firebase.google.com/ → Project Settings → Your apps → Web app
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCJ15rlPyvmXKezJc7hmKCj5PnyrRvV-Yc",
  authDomain: "next-6cfd1.firebaseapp.com",
  projectId: "next-6cfd1",
  storageBucket: "next-6cfd1.firebasestorage.app",
  messagingSenderId: "1051049838205",
  appId: "1:1051049838205:web:fe2aa50f7e068f7240d314",
  measurementId: "G-M0HV68F1G8"
};

export { API_URL, FIREBASE_CONFIG };

