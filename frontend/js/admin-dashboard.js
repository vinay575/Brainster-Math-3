import { api, logout as apiLogout, requireAuth } from './api.js';

requireAuth('admin');

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

let chart = null;
let students = [];
let videos = [];
let requests = [];

window.showSection = function(sectionId) {
  document.querySelectorAll('.section').forEach(section => {
    section.classList.remove('active');
  });
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });

  document.getElementById(sectionId).classList.add('active');
  event.target.closest('.nav-item').classList.add('active');

  if (sectionId === 'students') loadStudents();
  if (sectionId === 'videos') loadVideos();
  if (sectionId === 'requests') loadRequests();
};

async function loadOverview() {
  try {
    const stats = await api.students.getStats();

    document.getElementById('totalStudents').textContent = stats.totalStudents || 0;

    const videosData = await api.videos.getAll();
    document.getElementById('totalVideos').textContent = videosData.length;

    const pendingCount = await api.levelRequests.getPendingCount();
    document.getElementById('pendingRequests').textContent = pendingCount.count || 0;

    if (pendingCount.count > 0) {
      const badge = document.getElementById('requestsBadge');
      badge.textContent = pendingCount.count;
      badge.style.display = 'block';
    }

    const today = new Date().toDateString();
    const todayActivities = stats.recentActivity.filter(a =>
      new Date(a.accessed_at).toDateString() === today
    );
    // Get unique students who were active today
    const uniqueStudents = new Set(todayActivities.map(a => a.student_id));
    document.getElementById('activeToday').textContent = uniqueStudents.size;

    renderLevelChart(stats.studentsByLevel);

    renderRecentActivity(stats.recentActivity.slice(0, 10));
  } catch (error) {
    console.error('Error loading overview:', error);
  }
}

function renderLevelChart(data) {
  const ctx = document.getElementById('levelChart').getContext('2d');

  if (chart) {
    chart.destroy();
  }

  const levels = Array.from({length: 8}, (_, i) => i + 1);
  const counts = levels.map(level => {
    const found = data.find(d => d.level === level);
    return found ? found.count : 0;
  });

  const colors = ['#7f62ab', '#fde468', '#7399c6', '#f26c4a', '#6dcfaf', '#374151', '#a7e2cf', '#d8e0eb'];
  
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: levels.map(l => `Level ${l}`),
      datasets: [{
        label: 'Students',
        data: counts,
        backgroundColor: levels.map((_, index) => colors[index % colors.length]),
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#ffffff',
        barThickness: 45,
        maxBarThickness: 50,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        },
        x: {
          grid: {
            display: false
          },
          categoryPercentage: 0.8,
          barPercentage: 0.9
        }
      },
      layout: {
        padding: {
          left: 10,
          right: 20
        }
      }
    }
  });
}

function renderRecentActivity(activities) {
  const container = document.getElementById('recentActivity');

  if (activities.length === 0) {
    container.innerHTML = '<p style="color: var(--text-light); text-align: center; padding: 20px;">No recent activity</p>';
    return;
  }

  // Group activities by student and get their latest activity
  const studentActivities = {};
  activities.forEach(activity => {
    if (!studentActivities[activity.student_id]) {
      studentActivities[activity.student_id] = {
        student_name: activity.student_name || 'Unknown Student',
        latest_activity: activity,
        activity_count: 1
      };
    } else {
      // Update to most recent activity
      if (new Date(activity.accessed_at) > new Date(studentActivities[activity.student_id].latest_activity.accessed_at)) {
        studentActivities[activity.student_id].latest_activity = activity;
      }
      studentActivities[activity.student_id].activity_count++;
    }
  });

  // Sort by most recent activity time
  const sortedStudents = Object.values(studentActivities).sort((a, b) => 
    new Date(b.latest_activity.accessed_at) - new Date(a.latest_activity.accessed_at)
  );

  const html = sortedStudents.map(student => {
    const activityText = student.activity_count > 1 
      ? `Watched Level ${student.latest_activity.level}, Sheet ${student.latest_activity.sheet}${student.latest_activity.slide} (${student.activity_count} activities)`
      : `Watched Level ${student.latest_activity.level}, Sheet ${student.latest_activity.sheet}${student.latest_activity.slide}`;
    
    return `
      <div style="padding: 12px; border-bottom: 1px solid var(--border-color);">
        <div style="font-weight: 600; color: var(--text-heading);">${student.student_name}</div>
        <div style="font-size: 13px; color: var(--text-light);">
          ${activityText}
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = html;
}

function getTimeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  // Debug logging
  console.log('Time calculation:', {
    now: now.toISOString(),
    date: date.toISOString(),
    diffInSeconds: diffInSeconds,
    dateString: dateString
  });
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  // For older dates, show the actual date and time
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

async function loadStudents() {
  try {
    students = await api.students.getAll();
    renderStudentsTable();
  } catch (error) {
    console.error('Error loading students:', error);
  }
}

function renderStudentsTable() {
  const tbody = document.querySelector('#studentsTable tbody');

  if (students.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-light);">No students found</td></tr>';
    return;
  }

  const html = students.map(student => `
    <tr>
      <td>${student.name}</td>
      <td>${student.email}</td>
      <td><span class="badge badge-primary">Level ${student.level}</span></td>
      <td>${student.phone || '-'}</td>
      <td>
        <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px; margin-right: 8px;" onclick="editStudent(${student.id})">Edit</button>
        <button class="btn btn-danger" style="padding: 6px 12px; font-size: 12px;" onclick="deleteStudent(${student.id})">Delete</button>
      </td>
    </tr>
  `).join('');

  tbody.innerHTML = html;
}

window.openStudentModal = function() {
  document.getElementById('studentModalTitle').textContent = 'Add Student';
  document.getElementById('studentForm').reset();
  document.getElementById('studentId').value = '';
  document.getElementById('studentPassword').required = true;
  document.getElementById('studentModal').classList.add('active');
};

window.closeStudentModal = function() {
  document.getElementById('studentModal').classList.remove('active');
};

window.editStudent = function(id) {
  const student = students.find(s => s.id === id);
  if (!student) return;

  document.getElementById('studentModalTitle').textContent = 'Edit Student';
  document.getElementById('studentId').value = student.id;
  document.getElementById('studentName').value = student.name;
  document.getElementById('studentEmail').value = student.email;
  document.getElementById('studentPhone').value = student.phone || '';
  document.getElementById('studentAddress').value = student.address || '';
  document.getElementById('studentLevel').value = student.level;
  document.getElementById('studentPassword').required = false;
  document.getElementById('studentModal').classList.add('active');
};

window.deleteStudent = async function(id) {
  showConfirmModal(
    'Delete Student',
    'Are you sure you want to delete this student? This action cannot be undone.',
    async () => {
      try {
        await api.students.delete(id);
        await loadStudents();
        showSuccessModal('Student deleted successfully');
      } catch (error) {
        showErrorModal('Failed to delete student: ' + error.message);
      }
    }
  );
};

document.getElementById('studentForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = document.getElementById('studentId').value;
  const data = {
    name: document.getElementById('studentName').value,
    email: document.getElementById('studentEmail').value,
    phone: document.getElementById('studentPhone').value,
    address: document.getElementById('studentAddress').value,
    level: parseInt(document.getElementById('studentLevel').value)
  };

  const password = document.getElementById('studentPassword').value;
  if (password) {
    data.password = password;
  }

  try {
    if (id) {
      await api.students.update(id, data);
      showSuccessModal('Student updated successfully');
    } else {
      await api.students.create(data);
      showSuccessModal('Student created successfully');
    }

    closeStudentModal();
    await loadStudents();
    await loadOverview();
  } catch (error) {
    showErrorModal('Failed to save student: ' + error.message);
  }
});

let currentVideoFilter = 'all';

async function loadVideos() {
  try {
    videos = await api.videos.getAll();
    renderVideosCards();
  } catch (error) {
    console.error('Error loading videos:', error);
  }
}

function renderVideosCards(filteredVideos = null) {
  const container = document.getElementById('videosContainer');
  
  const videosToRender = filteredVideos || videos;

  if (videosToRender.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 40px; grid-column: 1 / -1;">No videos found</p>';
    return;
  }

  const html = videosToRender.map(video => `
    <div class="video-card">
      <div class="video-level">Level ${video.level}</div>
      <div class="video-thumbnail" onclick="playVideo(${video.id})">
        ${video.video_url ? `
          <video preload="none" muted poster="">
            <source src="${video.video_url}" type="video/mp4">
            Your browser does not support the video tag.
          </video>
          <div class="play-overlay">
            <div class="play-icon">▶</div>
          </div>
        ` : `
          <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-light);">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z"/>
        </svg>
          </div>
        `}
      </div>
      <div class="video-title">Sheets ${video.sheet_start}A - ${video.sheet_end}B</div>
      <div class="video-range">${video.sheet_end - video.sheet_start + 1} sheets included</div>
      <div class="video-actions">
        <button class="btn btn-primary" onclick="playVideo(${video.id})">Play</button>
        <button class="btn btn-danger" onclick="deleteVideo(${video.id})">Delete</button>
      </div>
    </div>
  `).join('');

  container.innerHTML = html;
}

window.filterVideosByLevel = function(level) {
  currentVideoFilter = level;
  
  // Update active filter button
  document.querySelectorAll('.level-filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-level="${level}"]`).classList.add('active');
  
  // Filter videos
  const filteredVideos = level === 'all' ? videos : videos.filter(video => video.level === level);
  renderVideosCards(filteredVideos);
};

window.playVideo = function(videoId) {
  const video = videos.find(v => v.id === videoId);
  if (video) {
    if (video.video_url) {
      // Open video in modal
      document.getElementById('videoPlayerTitle').textContent = `Level ${video.level} - Sheets ${video.sheet_start}A to ${video.sheet_end}B`;
      document.getElementById('videoPlayer').src = video.video_url;
      document.getElementById('videoPlayerInfo').textContent = `${video.sheet_end - video.sheet_start + 1} sheets included`;
      document.getElementById('videoPlayerModal').classList.add('active');
    } else {
      showErrorModal('Video URL not available');
    }
  }
};

window.closeVideoPlayerModal = function() {
  document.getElementById('videoPlayerModal').classList.remove('active');
  document.getElementById('videoPlayer').pause();
  document.getElementById('videoPlayer').src = '';
};

window.openVideoModal = function() {
  document.getElementById('videoModal').classList.add('active');
};

window.closeVideoModal = function() {
  document.getElementById('videoModal').classList.remove('active');
  document.getElementById('videoForm').reset();
};

window.deleteVideo = async function(id) {
  if (!confirm('Are you sure you want to delete this video?')) return;

  try {
    await api.videos.delete(id);
    await loadVideos();
    showSuccessModal('Video deleted successfully');
  } catch (error) {
    showErrorModal('Failed to delete video: ' + error.message);
  }
};

document.getElementById('videoForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const level = document.getElementById('videoLevel').value;
  const sheetStart = document.getElementById('videoSheetStart').value;
  const sheetEnd = document.getElementById('videoSheetEnd').value;
  const file = document.getElementById('videoFile').files[0];

  if (!file) {
    showErrorModal('Please select a video file');
    return;
  }

  const formData = new FormData();
  formData.append('video', file);
  formData.append('level', level);
  formData.append('sheetStart', sheetStart);
  formData.append('sheetEnd', sheetEnd);

  try {
    await api.videos.upload(formData);
    showSuccessModal('Video uploaded successfully');
    closeVideoModal();
    await loadVideos();
  } catch (error) {
    showErrorModal('Failed to upload video: ' + error.message);
  }
});

window.syncS3Videos = async function() {
  if (!confirm('This will sync all videos from S3. Continue?')) return;

  try {
    const result = await api.videos.sync();
    showSuccessModal(result.message);
    await loadVideos();
  } catch (error) {
    showErrorModal('Failed to sync videos: ' + error.message);
  }
};

async function loadRequests() {
  try {
    requests = await api.levelRequests.getAll();
    renderRequestsTable();
  } catch (error) {
    console.error('Error loading requests:', error);
  }
}

function renderRequestsTable() {
  const tbody = document.querySelector('#requestsTable tbody');

  if (requests.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-light); padding: 40px;">No requests found</td></tr>';
    return;
  }

  const html = requests.map(request => {
    const getStatusClass = (status) => {
      switch(status) {
        case 'pending': return 'status-pending';
        case 'approved': return 'status-approved';
        case 'rejected': return 'status-rejected';
        default: return 'status-pending';
      }
    };

    const getStatusText = (status) => {
      switch(status) {
        case 'pending': return 'Pending';
        case 'approved': return 'Approved';
        case 'rejected': return 'Rejected';
        default: return 'Pending';
      }
    };

    return `
      <tr>
        <td style="font-weight: 600; color: #1f2937;">${request.student_name}</td>
        <td><span style="color: #6b7280; font-weight: 600;">Level ${request.current_level}</span></td>
        <td><span style="color: #7e62a8; font-weight: 600;">Level ${request.requested_level}</span></td>
        <td class="message-cell" title="${request.message || 'No message'}">${request.message || '-'}</td>
        <td><span class="status-badge ${getStatusClass(request.status)}">${getStatusText(request.status)}</span></td>
        <td>
          ${request.status === 'pending' ? `
            <div class="action-buttons">
              <button class="btn-approve" onclick="approveRequest(${request.id})">✓ Approve</button>
              <button class="btn-reject" onclick="rejectRequest(${request.id})">✗ Reject</button>
            </div>
          ` : '<span style="color: #6b7280; font-style: italic;">Completed</span>'}
        </td>
      </tr>
    `;
  }).join('');

  tbody.innerHTML = html;
}

window.approveRequest = async function(id) {
  const request = requests.find(r => r.id === id);
  if (!request) return;

  // Create approval modal
  const modal = document.createElement('div');
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
    <div style="background: white; border-radius: 16px; padding: 32px; max-width: 500px; width: 90%;">
      <h2 style="color: var(--text-heading); margin-bottom: 20px;">Approve Level Request</h2>
      <div style="margin-bottom: 20px;">
        <p style="color: var(--text-light); margin-bottom: 8px;"><strong>Student:</strong> ${request.student_name}</p>
        <p style="color: var(--text-light); margin-bottom: 8px;"><strong>Request:</strong> Level ${request.current_level} → Level ${request.requested_level}</p>
        ${request.message ? `<p style="color: var(--text-light); margin-bottom: 8px;"><strong>Message:</strong> ${request.message}</p>` : ''}
      </div>
      <div class="input-group">
        <label>Admin Response (Optional)</label>
        <textarea id="adminResponse" rows="3" placeholder="Enter your response..."></textarea>
      </div>
      <div style="display: flex; gap: 12px; margin-top: 24px;">
        <button onclick="this.closest('.modal').remove()" class="btn btn-secondary" style="flex: 1;">Cancel</button>
        <button onclick="confirmApproval(${id})" class="btn btn-success" style="flex: 1;">Approve Request</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
};

window.confirmApproval = async function(id) {
  const response = document.getElementById('adminResponse').value;

  try {
    await api.levelRequests.approve(id, response || '');
    showSuccessModal('Request approved successfully');
    document.querySelector('.modal').remove();
    await loadRequests();
    await loadOverview();
  } catch (error) {
    showErrorModal('Failed to approve request: ' + error.message);
  }
};

window.rejectRequest = async function(id) {
  const request = requests.find(r => r.id === id);
  if (!request) return;

  // Create rejection modal
  const modal = document.createElement('div');
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
    <div style="background: white; border-radius: 16px; padding: 32px; max-width: 500px; width: 90%;">
      <h2 style="color: var(--text-heading); margin-bottom: 20px;">Reject Level Request</h2>
      <div style="margin-bottom: 20px;">
        <p style="color: var(--text-light); margin-bottom: 8px;"><strong>Student:</strong> ${request.student_name}</p>
        <p style="color: var(--text-light); margin-bottom: 8px;"><strong>Request:</strong> Level ${request.current_level} → Level ${request.requested_level}</p>
        ${request.message ? `<p style="color: var(--text-light); margin-bottom: 8px;"><strong>Message:</strong> ${request.message}</p>` : ''}
      </div>
      <div class="input-group">
        <label>Reason for Rejection (Required)</label>
        <textarea id="rejectionReason" rows="3" placeholder="Enter reason for rejection..." required></textarea>
      </div>
      <div style="display: flex; gap: 12px; margin-top: 24px;">
        <button onclick="this.closest('.modal').remove()" class="btn btn-secondary" style="flex: 1;">Cancel</button>
        <button onclick="confirmRejection(${id})" class="btn btn-danger" style="flex: 1;">Reject Request</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
};

window.confirmRejection = async function(id) {
  const response = document.getElementById('rejectionReason').value;
  
  if (!response.trim()) {
    showErrorModal('Please provide a reason for rejection');
    return;
  }

  try {
    await api.levelRequests.reject(id, response);
    showSuccessModal('Request rejected');
    document.querySelector('.modal').remove();
    await loadRequests();
    await loadOverview();
  } catch (error) {
    showErrorModal('Failed to reject request: ' + error.message);
  }
};

// Modal functions
function showSuccessModal(message) {
  const modal = document.createElement('div');
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
    <div style="background: white; border-radius: 16px; padding: 32px; max-width: 400px; width: 90%; text-align: center;">
      <div style="width: 60px; height: 60px; background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
      </div>
      <h3 style="color: var(--text-heading); margin-bottom: 16px;">Success!</h3>
      <p style="color: var(--text-light); margin-bottom: 24px;">${message}</p>
      <button onclick="this.closest('.modal').remove()" class="btn btn-primary" style="width: 100%;">OK</button>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  setTimeout(() => {
    if (modal.parentNode) {
      modal.remove();
    }
  }, 5000);
}

function showErrorModal(message) {
  const modal = document.createElement('div');
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
    <div style="background: white; border-radius: 16px; padding: 32px; max-width: 400px; width: 90%; text-align: center;">
      <div style="width: 60px; height: 60px; background: #ef4444; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </div>
      <h3 style="color: var(--text-heading); margin-bottom: 16px;">Error</h3>
      <p style="color: var(--text-light); margin-bottom: 24px;">${message}</p>
      <button onclick="this.closest('.modal').remove()" class="btn btn-primary" style="width: 100%;">OK</button>
    </div>
  `;
  
  document.body.appendChild(modal);
}

function showConfirmModal(title, message, onConfirm) {
  const modal = document.createElement('div');
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
    <div style="background: white; border-radius: 16px; padding: 32px; max-width: 400px; width: 90%; text-align: center;">
      <div style="width: 60px; height: 60px; background: #f59e0b; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      </div>
      <h3 style="color: var(--text-heading); margin-bottom: 16px;">${title}</h3>
      <p style="color: var(--text-light); margin-bottom: 24px;">${message}</p>
      <div style="display: flex; gap: 12px;">
        <button onclick="this.closest('.modal').remove()" class="btn btn-secondary" style="flex: 1;">Cancel</button>
        <button onclick="this.closest('.modal').remove(); (${onConfirm.toString()})()" class="btn btn-primary" style="flex: 1;">Confirm</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

loadOverview();
