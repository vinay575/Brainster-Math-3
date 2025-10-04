import { api, saveAuth } from './api.js';

window.handleSignup = async function(event) {
  event.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const phone = document.getElementById('phone').value;
  const address = document.getElementById('address').value;
  const level = parseInt(document.getElementById('level').value);

  hideMessage('error');
  hideMessage('success');

  try {
    const response = await api.auth.studentSignup({
      name,
      email,
      password,
      phone,
      address,
      level,
    });

    saveAuth(response.token, response.user);
    showMessage('success', 'Account created successfully! Redirecting...');

    setTimeout(() => {
      window.location.href = 'student/dashboard.html';
    }, 1500);
  } catch (error) {
    showMessage('error', error.message);
  }
};

function showMessage(elementId, message) {
  const element = document.getElementById(elementId);
  element.textContent = message;
  element.style.display = 'block';
}

function hideMessage(elementId) {
  const element = document.getElementById(elementId);
  element.style.display = 'none';
}

if (localStorage.getItem('token')) {
  window.location.href = 'student/dashboard.html';
}
