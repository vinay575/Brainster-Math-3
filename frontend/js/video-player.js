import { api, getUser, requireAuth, logout as apiLogout } from './api.js';

requireAuth('student');

const user = getUser();
const urlParams = new URLSearchParams(window.location.search);
const videoId = urlParams.get('id');
const level = urlParams.get('level');

let currentVideo = null;
let nextVideo = null;
let prevVideo = null;
let notifications = [];

window.goBack = function() {
  window.location.href = 'dashboard.html';
};

async function loadVideo() {
  if (!videoId || !level) {
    alert('Invalid video parameters');
    goBack();
    return;
  }

  try {
    const videos = await api.videos.getByLevel(level);
    currentVideo = videos.find(v => v.id == videoId);

    if (!currentVideo) {
      alert('Video not found');
      goBack();
      return;
    }

    const currentIndex = videos.findIndex(v => v.id == videoId);
    nextVideo = currentIndex < videos.length - 1 ? videos[currentIndex + 1] : null;
    prevVideo = currentIndex > 0 ? videos[currentIndex - 1] : null;

    renderVideo();

    api.students.logActivity({
      sheet: currentVideo.sheet_start,
      slide: 'A',
      level: currentVideo.level
    });
  } catch (error) {
    console.error('Error loading video:', error);
    alert('Failed to load video');
    goBack();
  }
}

function renderVideo() {
  document.getElementById('videoTitle').textContent =
    `Level ${currentVideo.level}: Sheets ${currentVideo.sheet_start}A - ${currentVideo.sheet_end}B`;

  document.getElementById('videoDescription').textContent =
    `Watch and learn from this comprehensive video covering sheets ${currentVideo.sheet_start} through ${currentVideo.sheet_end}.`;

  document.getElementById('levelBadge').textContent = `Level ${currentVideo.level}`;
  document.getElementById('sheetBadge').textContent =
    `Sheets ${currentVideo.sheet_start}-${currentVideo.sheet_end}`;

  const videoWrapper = document.getElementById('videoWrapper');

  if (currentVideo.video_url.includes('drive.google.com')) {
    const driveId = extractGoogleDriveId(currentVideo.video_url);
    videoWrapper.innerHTML = `
      <iframe
        src="https://drive.google.com/file/d/${driveId}/preview"
        width="100%"
        height="600"
        allow="autoplay"
        style="border: none;"
      ></iframe>
    `;
  } else {
    videoWrapper.innerHTML = `
      <video controls autoplay style="width: 100%; height: auto;">
        <source src="${currentVideo.video_url}" type="video/mp4">
        Your browser does not support the video tag.
      </video>
    `;
  }

  document.getElementById('prevBtn').disabled = !prevVideo;
  document.getElementById('nextBtn').disabled = !nextVideo;
}

function extractGoogleDriveId(url) {
  const match = url.match(/\/d\/([^\/]+)/);
  return match ? match[1] : null;
}

window.loadNextVideo = function() {
  if (nextVideo) {
    window.location.href = `video.html?id=${nextVideo.id}&level=${level}`;
  }
};

window.loadPreviousVideo = function() {
  if (prevVideo) {
    window.location.href = `video.html?id=${prevVideo.id}&level=${level}`;
  }
};

// Notification functions
async function loadNotifications() {
  try {
    notifications = await api.students.getNotifications();
    updateNotificationBadge();
  } catch (error) {
    console.error('Error loading notifications:', error);
  }
}

function updateNotificationBadge() {
  const unreadCount = notifications.filter(n => !n.read).length;
  const badge = document.getElementById('notificationBadge');
  
  if (unreadCount > 0) {
    badge.textContent = unreadCount;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

window.toggleNotifications = function() {
  const modal = document.getElementById('notificationModal');
  modal.classList.add('active');
  renderNotifications();
};

window.closeNotificationModal = function() {
  const modal = document.getElementById('notificationModal');
  modal.classList.remove('active');
};

function renderNotifications() {
  const container = document.getElementById('notificationsList');
  const noNotifications = document.getElementById('noNotifications');
  
  if (notifications.length === 0) {
    container.innerHTML = '';
    noNotifications.style.display = 'block';
    return;
  }
  
  noNotifications.style.display = 'none';
  
  const html = notifications.map(notification => {
    const timeAgo = getTimeAgo(notification.created_at);
    return `
      <div class="notification-item ${notification.read ? '' : 'unread'}" onclick="markAsRead(${notification.id})">
        <div class="notification-title">${notification.title}</div>
        <div class="notification-message">${notification.message}</div>
        <div class="notification-time">${timeAgo}</div>
      </div>
    `;
  }).join('');
  
  container.innerHTML = html;
}

function getTimeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
}

async function markAsRead(notificationId) {
  try {
    await api.students.markNotificationAsRead(notificationId);
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
    updateNotificationBadge();
    renderNotifications();
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
}

// Logout function
window.logout = function() {
  // Create logout confirmation modal
  const modal = document.createElement('div');
  modal.className = 'logout-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  
  modal.innerHTML = `
    <div style="background: white; border-radius: 16px; padding: 32px; max-width: 400px; width: 90%;">
      <div style="text-align: center; margin-bottom: 24px;">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" style="margin: 0 auto 16px;">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16,17 21,12 16,7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
        <h2 style="color: #1f2937; margin: 0 0 8px 0; font-size: 20px;">Confirm Logout</h2>
        <p style="color: #6b7280; margin: 0; font-size: 14px;">Are you sure you want to logout?</p>
      </div>
      <div style="display: flex; gap: 12px;">
        <button onclick="closeLogoutModal()" style="flex: 1; padding: 12px; background: #f3f4f6; color: #374151; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Cancel</button>
        <button onclick="confirmLogout()" style="flex: 1; padding: 12px; background: #ef4444; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Logout</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
};

window.closeLogoutModal = function() {
  const modal = document.querySelector('.logout-modal');
  if (modal) {
    modal.remove();
  }
};

window.confirmLogout = function() {
  // Remove modal and logout
  const modal = document.querySelector('.logout-modal');
  if (modal) {
    modal.remove();
  }
  apiLogout();
};

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  // Set user email
  document.getElementById('userEmail').textContent = user.email;
  
  // Load notifications
  loadNotifications();
});

loadVideo();
