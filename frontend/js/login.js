import { api, saveAuth } from './api.js';
import { FIREBASE_CONFIG } from './config.js';

let currentMode = 'student';

// Debug: Check if functions are being defined
console.log('Login.js loaded, defining functions...');

window.switchToStudent = function() {
  console.log('Switching to student');
  currentMode = 'student';
  const toggleSlider = document.getElementById('toggleSlider');
  const studentToggle = document.getElementById('studentToggle');
  const adminToggle = document.getElementById('adminToggle');
  const formWrapper = document.getElementById('formWrapper');
  
  if (toggleSlider) toggleSlider.classList.remove('admin');
  if (studentToggle) studentToggle.classList.add('active');
  if (adminToggle) adminToggle.classList.remove('active');
  if (formWrapper) formWrapper.classList.remove('show-admin');
};

window.switchToAdmin = function() {
  console.log('Switching to admin');
  currentMode = 'admin';
  const toggleSlider = document.getElementById('toggleSlider');
  const studentToggle = document.getElementById('studentToggle');
  const adminToggle = document.getElementById('adminToggle');
  const formWrapper = document.getElementById('formWrapper');
  
  if (toggleSlider) toggleSlider.classList.add('admin');
  if (adminToggle) adminToggle.classList.add('active');
  if (studentToggle) studentToggle.classList.remove('active');
  if (formWrapper) formWrapper.classList.add('show-admin');
};

window.studentLogin = async function(event) {
  event.preventDefault();

  const email = document.getElementById('studentEmail').value;
  const password = document.getElementById('studentPassword').value;

  hideMessage('studentError');
  hideMessage('studentSuccess');

  try {
    const response = await api.auth.studentLogin(email, password);
    saveAuth(response.token, response.user);
    showMessage('studentSuccess', 'Login successful! Redirecting...');

    setTimeout(() => {
      window.location.href = 'student/dashboard.html';
    }, 1000);
  } catch (error) {
    showMessage('studentError', error.message);
  }
};

window.adminLogin = async function(event) {
  event.preventDefault();

  const email = document.getElementById('adminEmail').value;
  const password = document.getElementById('adminPassword').value;

  hideMessage('adminError');

  try {
    const response = await api.auth.adminLogin(email, password);
    saveAuth(response.token, response.user);

    setTimeout(() => {
      window.location.href = 'admin/dashboard.html';
    }, 500);
  } catch (error) {
    showMessage('adminError', error.message);
  }
};

window.openSignupModal = function() {
  document.getElementById('signupModal').style.display = 'flex';
  hideMessage('signupError');
  hideMessage('signupSuccess');
};

window.closeSignupModal = function() {
  document.getElementById('signupModal').style.display = 'none';
  document.getElementById('signupForm').reset();
};

window.studentSignup = async function(event) {
  event.preventDefault();

  const name = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  const phone = document.getElementById('signupPhone').value;
  const address = document.getElementById('signupAddress').value;

  hideMessage('signupError');
  hideMessage('signupSuccess');

  try {
    const response = await api.auth.studentSignup({
      name,
      email,
      password,
      phone,
      address
    });
    
    saveAuth(response.token, response.user);
    showMessage('signupSuccess', 'Account created successfully! Redirecting...');

    setTimeout(() => {
      window.location.href = 'student/dashboard.html';
    }, 1000);
  } catch (error) {
    showMessage('signupError', error.message);
  }
};

window.loginWithGoogle = async function(role) {
  console.log('Google login called for role:', role);
  try {
    // Check if Firebase is properly configured
    if (FIREBASE_CONFIG.apiKey === "YOUR_FIREBASE_API_KEY_HERE" || FIREBASE_CONFIG.appId === "YOUR_FIREBASE_APP_ID_HERE") {
      throw new Error('Firebase not configured. Please add your Firebase API key and App ID to config.js');
    }
    
    console.log('Firebase config:', FIREBASE_CONFIG);

    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
    const { getAuth, signInWithPopup, GoogleAuthProvider } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');

    const app = initializeApp(FIREBASE_CONFIG);
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();

    const result = await signInWithPopup(auth, provider);
    const idToken = await result.user.getIdToken();

    const response = await api.auth.googleLogin(idToken, role);
    saveAuth(response.token, response.user);

    if (role === 'admin') {
      window.location.href = 'admin/dashboard.html';
    } else {
      window.location.href = 'student/dashboard.html';
    }
  } catch (error) {
    const errorId = role === 'admin' ? 'adminError' : 'studentError';
    
    // Show user-friendly error messages
    if (error.message.includes('Firebase not configured')) {
      showMessage(errorId, 'Google login is not configured yet. Please use email login or contact administrator.');
    } else if (error.message.includes('API key not valid') || error.message.includes('CONFIGURATION_NOT_FOUND')) {
      showMessage(errorId, 'Firebase project not properly configured. Please contact administrator.');
    } else if (error.message.includes('Firebase not initialized')) {
      showMessage(errorId, 'Firebase not properly configured. Please contact administrator.');
    } else {
      showMessage(errorId, 'Google login failed: ' + error.message);
    }
  }
};

function showMessage(elementId, message) {
  const element = document.getElementById(elementId);
  element.textContent = message;
  element.style.display = 'block';
}

// Debug: Verify all functions are defined
console.log('Functions defined:', {
  switchToStudent: typeof window.switchToStudent,
  switchToAdmin: typeof window.switchToAdmin,
  loginWithGoogle: typeof window.loginWithGoogle,
  studentLogin: typeof window.studentLogin,
  adminLogin: typeof window.adminLogin
});

function hideMessage(elementId) {
  const element = document.getElementById(elementId);
  element.style.display = 'none';
}

if (localStorage.getItem('token')) {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user.role === 'admin') {
    window.location.href = 'admin/dashboard.html';
  } else {
    window.location.href = 'student/dashboard.html';
  }
}
