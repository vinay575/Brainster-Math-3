import { api, getUser, logout as apiLogout, requireAuth } from './api.js';

requireAuth('student');

const user = getUser();
let videos = [];
let currentFilter = 'all';
let currentPage = 1;
const videosPerPage = 15; // 3x5 grid

// Set up level selector
function setupLevelSelector() {
  const filterDropdown = document.getElementById('levelFilter');
  
  // Clear existing options
  filterDropdown.innerHTML = '<option value="all">All Accessible Levels</option>';
  
  // Add accessible levels
  const levels = [user.level, ...(user.accessible_levels || [])];
  const uniqueLevels = [...new Set(levels)].sort((a, b) => a - b);
  
  uniqueLevels.forEach(level => {
    const filterOption = document.createElement('option');
    filterOption.value = level;
    filterOption.textContent = `Level ${level}`;
    filterDropdown.appendChild(filterOption);
  });
}

// Load videos for specific level
async function loadVideosForLevel(level) {
  try {
    videos = await api.videos.getByLevel(level);
    currentPage = 1;
    renderVideosGrid();
  } catch (error) {
    console.error('Error loading videos:', error);
    videos = [];
    renderVideosGrid();
  }
}

async function loadVideos() {
  try {
    videos = await api.videos.getByLevel(user.level);

    if (videos.length === 0) {
      document.getElementById('emptyState').style.display = 'block';
      document.getElementById('videosContainer').innerHTML = '';
      return;
    }

    document.getElementById('emptyState').style.display = 'none';
    renderVideosGrid();
  } catch (error) {
    console.error('Error loading videos:', error);
    document.getElementById('emptyState').style.display = 'block';
  }
}

function renderVideosGrid() {
  const container = document.getElementById('videosContainer');
  
  if (videos.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 40px;">No videos available for this level.</p>';
    return;
  }

  // Filter videos by level if needed
  let filteredVideos = videos;
  if (currentFilter !== 'all') {
    filteredVideos = videos.filter(video => video.level === currentFilter);
  }

  // Pagination
  const startIndex = (currentPage - 1) * videosPerPage;
  const endIndex = startIndex + videosPerPage;
  const paginatedVideos = filteredVideos.slice(startIndex, endIndex);

  const html = paginatedVideos.map(video => {
    return `
      <div class="video-card">
        <div class="level-text">Level ${video.level}</div>
        <div class="video-title">Sheets ${video.sheet_start}A-${video.sheet_end}B</div>
        <button class="play-btn" onclick="openVideo(${video.id})">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
          Play Video
        </button>
      </div>
    `;
  }).join('');

  container.innerHTML = html;
  
  // Render pagination
  renderPagination(filteredVideos.length);
}

function renderPagination(totalVideos) {
  const totalPages = Math.ceil(totalVideos / videosPerPage);
  const pagination = document.getElementById('pagination');
  
  if (totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }
  
  // Update page info
  document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${totalPages}`;
  
  // Update button states
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  
  prevBtn.disabled = currentPage <= 1;
  nextBtn.disabled = currentPage >= totalPages;
  
  prevBtn.style.opacity = currentPage <= 1 ? '0.5' : '1';
  nextBtn.style.opacity = currentPage >= totalPages ? '0.5' : '1';
}

window.changePage = function(direction) {
  const totalPages = Math.ceil(videos.length / videosPerPage);
  
  if (direction === -1 && currentPage > 1) {
    currentPage--;
  } else if (direction === 1 && currentPage < totalPages) {
    currentPage++;
  }
  
  renderVideosGrid();
};

window.filterVideosByLevel = function(level) {
  console.log('Filtering by level:', level);
  currentFilter = level === 'all' ? null : parseInt(level);
  currentPage = 1;
  
  renderVideosGrid();
};

window.toggleNotifications = function() {
  document.getElementById('notificationModal').classList.add('active');
  loadNotifications();
};

window.closeNotificationModal = function() {
  document.getElementById('notificationModal').classList.remove('active');
};

async function loadNotifications() {
  try {
    const requests = await api.levelRequests.getMy();
    const notifications = requests.filter(req => req.status !== 'pending');
    
    const container = document.getElementById('notificationsList');
    const noNotifications = document.getElementById('noNotifications');
    
    if (notifications.length === 0) {
      container.innerHTML = '';
      noNotifications.style.display = 'block';
      return;
    }
    
    noNotifications.style.display = 'none';
    
    const html = notifications.map(notification => {
      const isApproved = notification.status === 'approved';
      const isRejected = notification.status === 'rejected';
      
      return `
        <div style="padding: 16px; border: 2px solid ${isApproved ? '#10b981' : '#ef4444'}; border-radius: 12px; margin-bottom: 16px; background: ${isApproved ? '#f0fdf4' : '#fef2f2'};">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            <div style="width: 40px; height: 40px; background: ${isApproved ? '#10b981' : '#ef4444'}; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                ${isApproved ? '<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>' : '<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>'}
              </svg>
            </div>
            <div>
              <h3 style="color: var(--text-heading); margin: 0; font-size: 16px;">
                Level Request ${isApproved ? 'Approved' : 'Rejected'}
              </h3>
              <p style="color: var(--text-light); margin: 4px 0 0 0; font-size: 14px;">
                ${new Date(notification.updated_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div style="background: white; padding: 12px; border-radius: 8px; margin-bottom: 12px;">
            <p style="margin: 0; color: var(--text-heading); font-weight: 500;">
              Request: Level ${notification.current_level} → Level ${notification.requested_level}
            </p>
            ${notification.message ? `<p style="margin: 8px 0 0 0; color: var(--text-light); font-size: 14px;">Your message: "${notification.message}"</p>` : ''}
          </div>
          
          ${notification.admin_response ? `
            <div style="background: ${isApproved ? '#d1fae5' : '#fee2e2'}; padding: 12px; border-radius: 8px; border-left: 4px solid ${isApproved ? '#10b981' : '#ef4444'};">
              <p style="margin: 0; color: var(--text-heading); font-weight: 500; font-size: 14px;">
                Admin Response:
              </p>
              <p style="margin: 4px 0 0 0; color: var(--text-light); font-size: 14px;">
                ${notification.admin_response}
              </p>
            </div>
          ` : ''}
          
          ${isApproved ? `
            <div style="margin-top: 12px; padding: 8px 16px; background: #10b981; color: white; border-radius: 6px; text-align: center; font-weight: 500;">
              🎉 You can now access Level ${notification.requested_level} content!
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
    
    container.innerHTML = html;
    
    // Update notification badge
    const badge = document.getElementById('notificationBadge');
    if (notifications.length > 0) {
      badge.textContent = notifications.length;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
    
  } catch (error) {
    console.error('Error loading notifications:', error);
    document.getElementById('notificationsList').innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 20px;">Error loading notifications</p>';
  }
}

window.openVideo = function(videoId) {
  const video = videos.find(v => v.id === videoId);
  if (video) {
    window.location.href = `video.html?id=${videoId}&level=${user.level}`;
  }
};

document.getElementById('searchSheet').addEventListener('input', (e) => {
  const query = e.target.value.trim();
  
  if (!query) {
    // When search is empty, show all videos by reloading them
    loadVideos();
    return;
  }

  const searchNumber = parseInt(query);
  if (isNaN(searchNumber)) {
    // If not a valid number, show no results
    document.getElementById('videosContainer').innerHTML = '<p style="text-align: center; color: #6b7280; padding: 40px;">Please enter a valid sheet number</p>';
    document.getElementById('emptyState').style.display = 'none';
    return;
  }

  // Filter videos by sheet number
  const filteredVideos = videos.filter(video => {
    // Check if the search number falls within the sheet range
    return searchNumber >= video.sheet_start && searchNumber <= video.sheet_end;
  });

  // Update the videos container with filtered results
  const container = document.getElementById('videosContainer');
  
  if (filteredVideos.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 40px;">No videos found for sheet number ' + searchNumber + '</p>';
    document.getElementById('emptyState').style.display = 'none';
    return;
  }

  // Render filtered videos
  const html = filteredVideos.map(video => {
    return `
      <div class="video-card">
        <div class="level-text">Level ${video.level}</div>
        <div class="video-title">Sheets ${video.sheet_start}A-${video.sheet_end}B</div>
        <button class="play-btn" onclick="openVideo(${video.id})">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
          Play Video
        </button>
      </div>
    `;
  }).join('');

  container.innerHTML = html;
  document.getElementById('emptyState').style.display = 'none';
});

window.openUpgradeModal = function() {
  document.getElementById('upgradeModal').classList.add('active');
  document.getElementById('modalCurrentLevel').value = `Level ${user.level}`;

  const select = document.getElementById('requestedLevel');
  select.innerHTML = '';

  for (let i = user.level + 1; i <= 8; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = `Level ${i}`;
    select.appendChild(option);
  }

  document.getElementById('modalError').style.display = 'none';
  document.getElementById('modalSuccess').style.display = 'none';
};

window.closeUpgradeModal = function() {
  document.getElementById('upgradeModal').classList.remove('active');
  document.getElementById('upgradeForm').reset();
};

window.submitUpgradeRequest = async function(event) {
  event.preventDefault();

  const requestedLevel = parseInt(document.getElementById('requestedLevel').value);
  const message = document.getElementById('requestMessage').value;

  document.getElementById('modalError').style.display = 'none';
  document.getElementById('modalSuccess').style.display = 'none';

  try {
    await api.levelRequests.create({ requestedLevel, message });

    document.getElementById('modalSuccess').textContent = 'Request submitted successfully!';
    document.getElementById('modalSuccess').style.display = 'block';

    setTimeout(() => {
      closeUpgradeModal();
      showSuccessModal('Level upgrade request submitted successfully! Your request is now pending admin approval.');
    }, 1000);
  } catch (error) {
    document.getElementById('modalError').textContent = error.message;
    document.getElementById('modalError').style.display = 'block';
  }
};

// Success modal function
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
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (modal.parentNode) {
      modal.remove();
    }
  }, 5000);
}

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
  // Set user email
  document.getElementById('userEmail').textContent = user.email;
  
  setupLevelSelector();
  loadVideos();
  loadNotifications(); // Load notifications on page load
});

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
