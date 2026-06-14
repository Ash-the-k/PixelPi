// ============================================================
// PixelPi Technologies — Admin Dashboard JavaScript
// ============================================================

const API = window.location.origin + '/api';
let authToken = localStorage.getItem('pp_admin_token');
let currentUser = null;
let chartsInitialized = {};

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

const el = (id) => document.getElementById(id);

async function apiFetch(endpoint, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  // Remove Content-Type for FormData
  if (options.body instanceof FormData) delete headers['Content-Type'];
  try {
    const res = await fetch(`${API}${endpoint}`, { ...options, headers });
    if (res.status === 401 || res.status === 403) { logout(); return null; }
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('API Error:', endpoint, err);
    return null;
  }
}

function showAlert(elementId, message, type = 'err') {
  const alert = el(elementId);
  if (!alert) return;
  alert.textContent = message;
  alert.className = `alert alert-${type}`;
  alert.style.display = 'block';
  if (type === 'ok') setTimeout(() => { alert.style.display = 'none'; }, 4000);
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function statusBadge(status) {
  const map = {
    new: 'b', active: 'g', published: 'g', read: 'y', reviewing: 'y',
    shortlisted: 'b', hired: 'g', rejected: 'r', replied: 'g',
    archived: 'r', draft: 'y', contacted: 'b', accepted: 'g',
    bounced: 'r', unsubscribed: 'r', action: 'b', login: 'g',
    create: 'g', update: 'y', delete: 'r', view: 'b'
  };
  return `<span class="badge badge-${map[status] || 'b'}">${status}</span>`;
}

function skeleton(rows = 3) {
  let html = '';
  for (let i = 0; i < rows; i++) {
    html += `<tr><td colspan="10" style="padding:14px"><div style="height:14px;background:var(--surface2);border-radius:6px;animation:pulse 1.5s infinite"></div></td></tr>`;
  }
  return html;
}

function emptyState(icon, text) {
  return `<tr><td colspan="10" class="empty"><i class="fas ${icon}"></i>${text}</td></tr>`;
}

function dbWarning() {
  return `<div style="background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.2);border-radius:10px;padding:14px 18px;margin-bottom:16px;display:flex;align-items:center;gap:10px;font-size:13px;color:var(--warning)">
    <i class="fas fa-database"></i>
    <span><strong>Running in Local Fallback Mode</strong> — MySQL database is offline. Form submissions, blog posts, and career openings are currently saved to and served from local files.</span>
  </div>`;
}

// ============================================================
// AUTHENTICATION
// ============================================================

async function checkAuth() {
  if (!authToken) { showLogin(); return; }
  const res = await apiFetch('/admin/status');
  if (res && res.success) {
    currentUser = res.user;
    showDashboard();
  } else {
    showLogin();
  }
}

function showLogin() {
  authToken = null;
  localStorage.removeItem('pp_admin_token');
  el('loginScreen').style.display = 'flex';
  el('dashShell').style.display = 'none';
  el('dashShell').className = 'dash';
}

function showDashboard() {
  el('loginScreen').style.display = 'none';
  el('dashShell').style.display = 'block';
  el('dashShell').className = 'dash show';
  if (currentUser) {
    el('uName').textContent = currentUser.username || 'Admin';
  }
  loadDashboard();
}

async function login(e) {
  e.preventDefault();
  const username = el('username').value.trim();
  const password = el('password').value.trim();
  if (!username || !password) {
    showAlert('loginAlert', 'Please enter username and password');
    return;
  }
  const btn = e.target.querySelector('button[type="submit"]');
  const originalText = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
  btn.disabled = true;

  const res = await apiFetch('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });

  btn.innerHTML = originalText;
  btn.disabled = false;

  if (res && res.success) {
    authToken = res.token;
    currentUser = res.user;
    localStorage.setItem('pp_admin_token', authToken);
    showDashboard();
  } else {
    showAlert('loginAlert', res?.error || 'Invalid credentials. Please try again.');
    el('password').value = '';
    el('password').focus();
  }
}

function logout() {
  apiFetch('/admin/logout', { method: 'POST' }).catch(() => {});
  authToken = null;
  currentUser = null;
  localStorage.removeItem('pp_admin_token');
  showLogin();
}

// ============================================================
// NAVIGATION
// ============================================================

function setupNavigation() {
  document.querySelectorAll('.sb-nav a[data-page]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const pageId = link.dataset.page;
      document.querySelectorAll('.sb-nav a').forEach(a => a.classList.remove('active'));
      link.classList.add('active');
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      const page = el(pageId);
      if (page) {
        page.classList.add('active');
        page.style.animation = 'fadeIn 0.3s ease';
      }
      loadPageData(pageId);
      const sidebar = document.querySelector('.sidebar');
      if (sidebar) sidebar.classList.remove('mobile-open');
    });
  });
}

function loadPageData(pageId) {
  switch (pageId) {
    case 'pgDash': loadDashboard(); break;
    case 'pgAnalytics': loadAnalytics(); break;
    case 'pgSecurity': loadSecurity(); break;
    case 'pgBlog': loadBlogPosts(); break;
    case 'pgGallery': loadGallery(); break;
    case 'pgCareers': loadCareerOpenings(); break;
    case 'pgApps': loadApplications(); break;
    case 'pgContacts': loadContacts(); break;
    case 'pgCollabs': loadCollaborations(); break;
    case 'pgAudit': loadAuditLogs(); break;
    case 'pgSettings': loadSettings(); break;
  }
}

// ============================================================
// DASHBOARD
// ============================================================

async function loadDashboard() {
  const statsEl = el('dStats');
  if (statsEl) statsEl.innerHTML = '<div class="stat" style="opacity:1;transform:none"><div style="height:80px;display:flex;align-items:center;justify-content:center;color:var(--text3)"><i class="fas fa-spinner fa-spin" style="font-size:20px"></i></div></div>'.repeat(4);

  // Try the overview endpoint (needs DB)
  const res = await apiFetch('/admin/dashboard/overview');
  // Get analytics data (works without DB - in-memory)
  const aRes = await apiFetch('/admin/analytics');
  // Get security data (works without DB - in-memory)
  const secRes = await apiFetch('/admin/security');
  // Get gallery data (works without DB - filesystem)
  const galRes = await apiFetch('/admin/gallery');

  // Build stats from whatever is available
  const dbOk = res && res.success && res.data && res.data.stats;
  const s = dbOk ? res.data.stats : {};
  const aData = (aRes && aRes.success) ? aRes.data : {};
  const galCount = (galRes && galRes.success) ? galRes.data.length : 0;

  if (statsEl) {
    statsEl.innerHTML = `
      ${statCard('fa-eye', aData.today?.views || 0, "Today's Views", 'rgba(99,102,241,.15)', 'var(--primary-light)')}
      ${statCard('fa-user', aData.today?.unique || 0, 'Unique Visitors', 'rgba(52,211,153,.15)', 'var(--success)')}
      ${statCard('fa-images', galCount, 'Gallery Images', 'rgba(251,191,36,.15)', 'var(--warning)')}
      ${statCard('fa-shield-alt', secRes?.data?.score || 100, 'Security Score', 'rgba(244,114,182,.15)', 'var(--accent)')}
    `;
    animateCards(statsEl);
  }

  // DB-dependent extra stats row
  const dbStatsEl = el('dDbStats');
  if (dbStatsEl) {
    if (dbOk) {
      dbStatsEl.innerHTML = `
        ${statCard('fa-file-alt', s.total_applications || 0, 'Applications', 'rgba(99,102,241,.15)', 'var(--primary-light)')}
        ${statCard('fa-envelope', s.total_contacts || 0, 'Contact Messages', 'rgba(52,211,153,.15)', 'var(--success)')}
        ${statCard('fa-users', s.subscribers || 0, 'Subscribers', 'rgba(251,191,36,.15)', 'var(--warning)')}
        ${statCard('fa-pen-fancy', s.total_posts || 0, 'Blog Posts', 'rgba(244,114,182,.15)', 'var(--accent)')}
      `;
      dbStatsEl.style.display = '';
      animateCards(dbStatsEl);
    } else {
      dbStatsEl.style.display = 'none';
    }
  }

  // DB warning
  const warnEl = el('dDbWarn');
  if (warnEl) warnEl.innerHTML = dbOk ? '' : dbWarning();

  // Security score ring
  if (secRes && secRes.success) {
    renderSecurityScore(el('secScore'), secRes.data.score);
  }

  // Traffic chart (always works - in-memory)
  if (aData.daily) {
    renderTrafficChart(aData);
  }

  // Recent activity (DB-dependent)
  const actEl = el('dActivity');
  if (actEl) {
    if (dbOk && res.data.recentActivity && res.data.recentActivity.length > 0) {
      actEl.innerHTML = res.data.recentActivity.slice(0, 8).map(a => `
        <tr>
          <td>${statusBadge(a.action || 'action')}</td>
          <td>${a.username || '—'}</td>
          <td>${a.resource || '—'}</td>
          <td style="color:var(--text3);font-size:12px">${formatDateTime(a.created_at)}</td>
        </tr>
      `).join('');
    } else {
      actEl.innerHTML = emptyState('fa-clock', dbOk ? 'No recent activity' : 'Activity logs require database connection');
    }
  }
}

function animateCards(container) {
  container.querySelectorAll('.stat').forEach((s, i) => {
    s.style.opacity = '0';
    s.style.transform = 'translateY(10px)';
    setTimeout(() => {
      s.style.transition = 'all 0.4s ease';
      s.style.opacity = '1';
      s.style.transform = 'translateY(0)';
    }, i * 100);
  });
}

function statCard(icon, value, label, bgColor, iconColor) {
  return `<div class="stat">
    <div class="stat-icon" style="background:${bgColor};color:${iconColor}"><i class="fas ${icon}"></i></div>
    <div class="stat-val">${value}</div>
    <div class="stat-lbl">${label}</div>
  </div>`;
}

function renderSecurityScore(container, score) {
  if (!container) return;
  const color = score >= 80 ? 'var(--success)' : score >= 50 ? 'var(--warning)' : 'var(--danger)';
  const label = score >= 80 ? 'System Secure' : score >= 50 ? 'Needs Attention' : 'At Risk';
  container.innerHTML = `
    <div class="score-ring" style="background:conic-gradient(${color} ${score}%, var(--surface2) 0)">
      <div style="width:90px;height:90px;border-radius:50%;background:var(--surface);display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;color:${color}">${score}</div>
    </div>
    <p style="font-size:13px;color:var(--text2)">${label}</p>
  `;
}

function renderTrafficChart(data) {
  const canvas = el('trafficChart');
  if (!canvas) return;
  if (chartsInitialized.traffic) chartsInitialized.traffic.destroy();
  chartsInitialized.traffic = new Chart(canvas, {
    type: 'line',
    data: {
      labels: data.dayLabels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Page Views',
        data: data.daily || [0, 0, 0, 0, 0, 0, 0],
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99,102,241,0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#6366f1',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8', font: { size: 11 } } },
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8', font: { size: 11 } }, beginAtZero: true }
      }
    }
  });
}

// ============================================================
// ANALYTICS
// ============================================================

async function loadAnalytics() {
  const res = await apiFetch('/admin/analytics');
  if (!res || !res.success) return;
  const d = res.data;

  const statsEl = el('aStats');
  if (statsEl) {
    statsEl.innerHTML = `
      ${statCard('fa-eye', d.today?.views || 0, "Today's Views", 'rgba(99,102,241,.15)', 'var(--primary-light)')}
      ${statCard('fa-user', d.today?.unique || 0, 'Unique Visitors', 'rgba(52,211,153,.15)', 'var(--success)')}
      ${statCard('fa-chart-line', d.week?.views || 0, 'Weekly Views', 'rgba(251,191,36,.15)', 'var(--warning)')}
      ${statCard('fa-database', d.total?.views || 0, 'Total Tracked', 'rgba(244,114,182,.15)', 'var(--accent)')}
    `;
  }

  // Hourly chart
  const hourlyCanvas = el('hourlyChart');
  if (hourlyCanvas) {
    if (chartsInitialized.hourly) chartsInitialized.hourly.destroy();
    chartsInitialized.hourly = new Chart(hourlyCanvas, {
      type: 'bar',
      data: {
        labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
        datasets: [{
          label: 'Requests',
          data: d.hourly || Array(24).fill(0),
          backgroundColor: 'rgba(99,102,241,0.6)',
          borderRadius: 4
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 12 } },
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' }, beginAtZero: true }
        }
      }
    });
  }

  // Browser chart
  const browserCanvas = el('browserChart');
  if (browserCanvas && d.browsers) {
    if (chartsInitialized.browser) chartsInitialized.browser.destroy();
    const labels = Object.keys(d.browsers);
    const values = Object.values(d.browsers);
    if (labels.length > 0) {
      chartsInitialized.browser = new Chart(browserCanvas, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{
            data: values,
            backgroundColor: ['#6366f1', '#f472b6', '#34d399', '#fbbf24', '#94a3b8'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 12, font: { size: 11 } } } }
        }
      });
    }
  }

  // Top pages
  const pagesEl = el('aPages');
  if (pagesEl) {
    pagesEl.innerHTML = (!d.pageViews || d.pageViews.length === 0)
      ? emptyState('fa-chart-bar', 'No page data yet')
      : d.pageViews.map(([page, views]) => `<tr><td>${page}</td><td><strong>${views}</strong></td></tr>`).join('');
  }
}

// ============================================================
// SECURITY
// ============================================================

async function loadSecurity() {
  const res = await apiFetch('/admin/security');
  if (!res || !res.success) return;
  const d = res.data;

  const statsEl = el('sStats');
  if (statsEl) {
    statsEl.innerHTML = `
      ${statCard('fa-shield-alt', d.score, 'Security Score', 'rgba(52,211,153,.15)', 'var(--success)')}
      ${statCard('fa-exclamation-triangle', d.summary?.today || 0, 'Threats Today', 'rgba(248,113,113,.15)', 'var(--danger)')}
      ${statCard('fa-ban', d.totalBlocked || 0, 'Blocked IPs', 'rgba(251,191,36,.15)', 'var(--warning)')}
      ${statCard('fa-key', d.summary?.failedLogins || 0, 'Failed Logins', 'rgba(99,102,241,.15)', 'var(--primary-light)')}
    `;
  }

  renderSecurityScore(el('secScoreBig'), d.score);

  const protEl = el('protStatus');
  if (protEl) {
    protEl.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:10px;padding:10px">
        ${protItem('SSL/HTTPS', d.ssl, 'fa-lock')}
        ${protItem('Rate Limiting', true, 'fa-tachometer-alt')}
        ${protItem('JWT Authentication', true, 'fa-key')}
        ${protItem('CORS Protection', true, 'fa-shield-alt')}
        ${protItem('Input Validation', true, 'fa-check-circle')}
      </div>
    `;
  }

  const threatEl = el('sThreats');
  if (threatEl) {
    threatEl.innerHTML = (!d.threats || d.threats.length === 0)
      ? emptyState('fa-shield-alt', 'No threats detected — all clear!')
      : d.threats.slice(0, 20).map(t => `
          <tr>
            <td>${statusBadge(t.type)}</td>
            <td style="font-family:monospace;font-size:12px">${t.ip || '—'}</td>
            <td style="font-size:12px">${t.detail || '—'}</td>
            <td style="color:var(--text3);font-size:12px">${formatDateTime(t.ts)}</td>
          </tr>
        `).join('');
  }
}

function protItem(label, enabled, icon) {
  return `<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">
    <i class="fas ${icon}" style="color:${enabled ? 'var(--success)' : 'var(--danger)'};width:20px"></i>
    <span style="flex:1;font-size:13px">${label}</span>
    <span class="badge badge-${enabled ? 'g' : 'r'}">${enabled ? 'Active' : 'Inactive'}</span>
  </div>`;
}

function blockIP() {
  const ip = el('blockIpInput')?.value.trim();
  if (!ip) return;
  apiFetch('/admin/security/block-ip', { method: 'POST', body: JSON.stringify({ ip }) }).then(() => {
    el('blockIpInput').value = '';
    loadSecurity();
  });
}

// ============================================================
// BLOG MANAGER
// ============================================================

async function loadBlogPosts() {
  const tbody = el('bPosts');
  if (!tbody) return;
  tbody.innerHTML = skeleton(3);

  const res = await apiFetch('/admin/blog');
  if (!res || !res.success) {
    tbody.innerHTML = emptyState('fa-pen-fancy', 'Blog requires database connection');
    return;
  }
  const posts = res.data?.posts || res.data || [];
  if (posts.length === 0) {
    tbody.innerHTML = emptyState('fa-pen-fancy', 'No posts yet. Create your first post!');
    return;
  }
  tbody.innerHTML = posts.map(p => `
    <tr>
      <td><strong>${p.title}</strong></td>
      <td>${p.category || '—'}</td>
      <td>${statusBadge(p.status)}</td>
      <td>${p.views || 0}</td>
      <td style="font-size:12px;color:var(--text3)">${formatDate(p.published_at || p.created_at)}</td>
      <td>
        <button class="btn btn-sm btn-s" onclick="editBlogPost(${p.id})"><i class="fas fa-edit"></i></button>
        <button class="btn btn-sm btn-d" onclick="deleteBlogPost(${p.id})"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

function openBlogModal(post = null) {
  el('bmTitle').innerHTML = (post ? 'Edit Post' : 'New Post') + '<button onclick="closeBlogModal()">&times;</button>';
  el('bfId').value = post?.id || '';
  el('bfTitle').value = post?.title || '';
  el('bfCat').value = post?.category || 'Technology';
  el('bfExcerpt').value = post?.excerpt || '';
  el('bfContent').value = post?.content || '';
  el('bfCover').value = post?.cover_image || '';
  el('bfAuthor').value = post?.author || 'Pixel Pi Team';
  el('bfStatus').value = post?.status || 'draft';
  el('blogModal').classList.add('show');
}

function closeBlogModal() { el('blogModal').classList.remove('show'); }

async function editBlogPost(id) {
  const res = await apiFetch(`/admin/blog/${id}`);
  if (res && res.success) {
    openBlogModal(res.data);
  }
}

async function saveBlogPost(e) {
  e.preventDefault();
  const id = el('bfId').value;
  const body = {
    title: el('bfTitle').value,
    category: el('bfCat').value,
    excerpt: el('bfExcerpt').value,
    content: el('bfContent').value,
    cover_image: el('bfCover').value,
    author: el('bfAuthor').value,
    status: el('bfStatus').value
  };

  const res = id
    ? await apiFetch(`/admin/blog/${id}`, { method: 'PUT', body: JSON.stringify(body) })
    : await apiFetch('/admin/blog', { method: 'POST', body: JSON.stringify(body) });

  if (res && res.success) {
    closeBlogModal();
    loadBlogPosts();
  }
}

async function deleteBlogPost(id) {
  if (!confirm('Delete this blog post?')) return;
  const res = await apiFetch(`/admin/blog/${id}`, { method: 'DELETE' });
  if (res && res.success) loadBlogPosts();
}

// ============================================================
// GALLERY
// ============================================================

async function loadGallery() {
  const grid = el('galGrid');
  if (!grid) return;
  grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text3)"><i class="fas fa-spinner fa-spin" style="font-size:24px"></i></div>';

  const res = await apiFetch('/admin/gallery');
  if (!res || !res.success || !res.data || res.data.length === 0) {
    grid.innerHTML = '<div class="empty" style="grid-column:1/-1"><i class="fas fa-images"></i>No gallery images yet. Upload some!</div>';
    return;
  }
  grid.innerHTML = res.data.map(img => {
    const safeTitle = (img.title || '').replace(/'/g, "\\'").replace(/"/g, "&quot;");
    const safeDesc = (img.desc || '').replace(/'/g, "\\'").replace(/"/g, "&quot;");
    return `
      <div class="gal-item">
        <div class="gal-img-wrap">
          <img src="${img.url}" alt="${img.filename}" loading="lazy" onerror="this.src='/images/logo.jpg'">
        </div>
        <div class="gal-details">
          <div>
            <div class="gal-title" title="${img.title || img.filename}">${img.title || img.filename}</div>
            <div class="gal-desc" title="${img.desc || 'No description'}">${img.desc || 'No description'}</div>
          </div>
          <div class="gal-actions">
            <button class="btn btn-sm btn-s" onclick="editGalleryImage('${img.filename}', '${safeTitle}', '${safeDesc}')"><i class="fas fa-edit"></i> Edit</button>
            <button class="btn btn-sm btn-d" onclick="deleteGalleryImage('${img.filename}')"><i class="fas fa-trash"></i> Delete</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

async function uploadGalleryImages(e) {
  const files = e.target.files;
  if (!files.length) return;
  const formData = new FormData();
  Array.from(files).forEach(f => formData.append('images', f));

  try {
    const res = await fetch(`${API}/admin/gallery/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}` },
      body: formData
    });
    const data = await res.json();
    if (data.success) loadGallery();
    else alert(data.error || 'Upload failed');
  } catch (err) {
    console.error('Upload error:', err);
    alert('Upload failed. Check console for details.');
  }
  e.target.value = '';
}

async function deleteGalleryImage(filename) {
  if (!confirm('Delete this image?')) return;
  await apiFetch(`/admin/gallery/${encodeURIComponent(filename)}`, { method: 'DELETE' });
  loadGallery();
}

function editGalleryImage(filename, title, desc) {
  el('gefFilename').value = filename;
  el('gefTitle').value = title;
  el('gefDesc').value = desc;
  el('galEditModal').classList.add('show');
}

function closeGalEditModal() {
  el('galEditModal').classList.remove('show');
}

async function saveGalleryImageDetails(e) {
  e.preventDefault();
  const filename = el('gefFilename').value;
  const body = {
    title: el('gefTitle').value.trim(),
    desc: el('gefDesc').value.trim()
  };

  const res = await apiFetch(`/admin/gallery/${encodeURIComponent(filename)}`, {
    method: 'PUT',
    body: JSON.stringify(body)
  });

  if (res && res.success) {
    closeGalEditModal();
    loadGallery();
  } else {
    alert(res?.error || 'Failed to save details');
  }
}

// ============================================================
// CAREER OPENINGS
// ============================================================

async function loadCareerOpenings() {
  const tbody = el('cOpenings');
  if (!tbody) return;
  tbody.innerHTML = skeleton(3);

  const res = await apiFetch('/admin/career-openings');
  if (!res || !res.success) {
    tbody.innerHTML = emptyState('fa-briefcase', 'Career openings require database connection');
    return;
  }
  if (!res.data || res.data.length === 0) {
    tbody.innerHTML = emptyState('fa-briefcase', 'No career openings. Create one to get started!');
    return;
  }
  tbody.innerHTML = res.data.map(o => `
    <tr>
      <td><strong>${o.title}</strong></td>
      <td>${o.department || '—'}</td>
      <td>${o.type || 'full-time'}</td>
      <td>${o.location || '—'}</td>
      <td>${statusBadge(o.is_active ? 'active' : 'archived')}</td>
      <td>
        <button class="btn btn-sm btn-s" onclick="editCareerOpening(${o.id})"><i class="fas fa-edit"></i></button>
        <button class="btn btn-sm btn-d" onclick="deleteCareerOpening(${o.id})"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

function openCareerModal(opening = null) {
  el('cmTitle').innerHTML = (opening ? 'Edit Opening' : 'New Opening') + '<button onclick="closeCareerModal()">&times;</button>';
  el('cfId').value = opening?.id || '';
  el('cfTitle').value = opening?.title || '';
  el('cfDept').value = opening?.department || '';
  el('cfLoc').value = opening?.location || 'Bangalore, India';
  el('cfType').value = opening?.type || 'full-time';
  el('cfExp').value = opening?.experience || '';
  el('cfDesc').value = opening?.description || '';
  el('cfReq').value = opening?.requirements || '';
  el('careerModal').classList.add('show');
}

function closeCareerModal() { el('careerModal').classList.remove('show'); }

async function editCareerOpening(id) {
  const res = await apiFetch('/admin/career-openings');
  if (res && res.success) {
    const opening = res.data.find(o => o.id === id);
    if (opening) openCareerModal(opening);
  }
}

async function saveCareerOpening(e) {
  e.preventDefault();
  const id = el('cfId').value;
  const body = {
    title: el('cfTitle').value,
    department: el('cfDept').value,
    location: el('cfLoc').value,
    type: el('cfType').value,
    experience: el('cfExp').value,
    description: el('cfDesc').value,
    requirements: el('cfReq').value
  };

  const res = id
    ? await apiFetch(`/admin/career-openings/${id}`, { method: 'PUT', body: JSON.stringify(body) })
    : await apiFetch('/admin/career-openings', { method: 'POST', body: JSON.stringify(body) });

  if (res && res.success) {
    closeCareerModal();
    loadCareerOpenings();
  } else {
    alert(res?.error || 'Failed to save. Is the database connected?');
  }
}

async function deleteCareerOpening(id) {
  if (!confirm('Delete this career opening?')) return;
  const res = await apiFetch(`/admin/career-openings/${id}`, { method: 'DELETE' });
  if (res && res.success) loadCareerOpenings();
  else alert(res?.error || 'Failed to delete. Is the database connected?');
}

// ============================================================
// APPLICATIONS
// ============================================================

let appPage = 1;

async function loadApplications() {
  const tbody = el('appList');
  if (!tbody) return;
  tbody.innerHTML = skeleton(4);

  const search = el('appSearch')?.value || '';
  const status = el('appFilter')?.value || 'all';

  const res = await apiFetch(`/admin/applications?page=${appPage}&limit=20&status=${status}&search=${search}`);
  if (!res || !res.success) {
    tbody.innerHTML = emptyState('fa-file-alt', 'Applications require database connection');
    return;
  }
  const apps = res.data?.applications || res.data || [];
  if (apps.length === 0) {
    tbody.innerHTML = emptyState('fa-file-alt', 'No applications found');
    return;
  }
  tbody.innerHTML = apps.map(a => `
    <tr>
      <td style="font-family:monospace;font-size:11px">${(a.application_id || String(a.id)).substring(0, 12)}...</td>
      <td><strong>${a.name}</strong></td>
      <td style="font-size:12px">${a.email}</td>
      <td>${a.position}</td>
      <td>${statusBadge(a.status)}</td>
      <td style="font-size:12px;color:var(--text3)">${formatDate(a.created_at)}</td>
      <td>
        <button class="btn btn-sm btn-s" onclick="viewApplication('${a.application_id || a.id}')"><i class="fas fa-eye"></i></button>
      </td>
    </tr>
  `).join('');
}

async function viewApplication(id) {
  const res = await apiFetch(`/admin/applications/${id}`);
  if (!res || !res.success) return;
  const a = res.data;

  const detailEl = el('appDetail');
  if (detailEl) {
    detailEl.innerHTML = `
      <div class="grid-2">
        <div class="fg"><label>Name</label><div class="fi" style="background:var(--surface2);cursor:default">${a.name}</div></div>
        <div class="fg"><label>Email</label><div class="fi" style="background:var(--surface2);cursor:default">${a.email}</div></div>
        <div class="fg"><label>Phone</label><div class="fi" style="background:var(--surface2);cursor:default">${a.phone || '—'}</div></div>
        <div class="fg"><label>Position</label><div class="fi" style="background:var(--surface2);cursor:default">${a.position}</div></div>
        <div class="fg"><label>Education</label><div class="fi" style="background:var(--surface2);cursor:default">${a.education || '—'}</div></div>
        <div class="fg"><label>University</label><div class="fi" style="background:var(--surface2);cursor:default">${a.university || '—'}</div></div>
      </div>
      <div class="fg"><label>Skills</label><div class="fi" style="background:var(--surface2);cursor:default;min-height:40px">${a.skills || '—'}</div></div>
      <div class="fg"><label>Experience</label><div class="fi" style="background:var(--surface2);cursor:default;min-height:40px">${a.experience || '—'}</div></div>
      ${a.portfolio ? `<div class="fg"><label>Portfolio</label><a href="${a.portfolio}" target="_blank" class="fi" style="background:var(--surface2);display:block;color:var(--primary-light)">${a.portfolio}</a></div>` : ''}
      ${a.message ? `<div class="fg"><label>Message</label><div class="fi" style="background:var(--surface2);cursor:default;min-height:40px">${a.message}</div></div>` : ''}
      ${a.resume_filename ? `<div class="fg"><label>Resume</label><a href="/uploads/resumes/${a.resume_filename}" target="_blank" class="btn btn-sm btn-s"><i class="fas fa-download"></i> ${a.resume_filename}</a></div>` : ''}
      <div class="fg">
        <label>Update Status</label>
        <select class="fi" id="appStatusSelect">
          ${['new', 'reviewing', 'shortlisted', 'interviewed', 'hired', 'rejected'].map(s =>
            `<option value="${s}" ${a.status === s ? 'selected' : ''}>${s.charAt(0).toUpperCase() + s.slice(1)}</option>`
          ).join('')}
        </select>
      </div>
      <button class="btn btn-p" onclick="updateAppStatus('${a.application_id || a.id}')" style="width:100%;margin-top:8px"><i class="fas fa-save"></i> Update Status</button>
    `;
  }
  el('appModal').classList.add('show');
}

async function updateAppStatus(id) {
  const status = el('appStatusSelect')?.value;
  if (!status) return;
  const res = await apiFetch(`/admin/applications/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  });
  if (res && res.success) {
    el('appModal').classList.remove('show');
    loadApplications();
  }
}

// ============================================================
// CONTACTS
// ============================================================

async function loadContacts() {
  const tbody = el('ctList');
  if (!tbody) return;
  tbody.innerHTML = skeleton(3);

  const res = await apiFetch('/admin/contacts');
  if (!res || !res.success) {
    tbody.innerHTML = emptyState('fa-envelope', 'Contacts require database connection');
    return;
  }
  const contacts = res.data || [];
  if (contacts.length === 0) {
    tbody.innerHTML = emptyState('fa-envelope', 'No contact submissions yet');
    return;
  }
  tbody.innerHTML = contacts.map(c => `
    <tr>
      <td><strong>${c.name}</strong></td>
      <td style="font-size:12px">${c.email}</td>
      <td>${c.subject || '—'}</td>
      <td>${statusBadge(c.status)}</td>
      <td style="font-size:12px;color:var(--text3)">${formatDate(c.created_at)}</td>
      <td>
        <select class="fi" style="width:100px;padding:4px 8px;font-size:11px" onchange="updateContactStatus(${c.id}, this.value)">
          ${['new', 'read', 'replied', 'archived'].map(s => `<option value="${s}" ${c.status === s ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </td>
    </tr>
  `).join('');
}

async function updateContactStatus(id, status) {
  await apiFetch(`/admin/contacts/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
}

// ============================================================
// COLLABORATIONS
// ============================================================

async function loadCollaborations() {
  const tbody = el('coList');
  if (!tbody) return;
  tbody.innerHTML = skeleton(3);

  const res = await apiFetch('/admin/collaborations');
  if (!res || !res.success) {
    tbody.innerHTML = emptyState('fa-handshake', 'Collaborations require database connection');
    return;
  }
  const collabs = res.data || [];
  if (collabs.length === 0) {
    tbody.innerHTML = emptyState('fa-handshake', 'No collaboration inquiries yet');
    return;
  }
  tbody.innerHTML = collabs.map(c => `
    <tr>
      <td><strong>${c.name}</strong></td>
      <td>${c.company || '—'}</td>
      <td>${c.type || '—'}</td>
      <td>${statusBadge(c.status)}</td>
      <td style="font-size:12px;color:var(--text3)">${formatDate(c.created_at)}</td>
      <td>
        <select class="fi" style="width:110px;padding:4px 8px;font-size:11px" onchange="updateCollabStatus(${c.id}, this.value)">
          ${['new', 'reviewing', 'contacted', 'accepted', 'rejected'].map(s => `<option value="${s}" ${c.status === s ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </td>
    </tr>
  `).join('');
}

async function updateCollabStatus(id, status) {
  await apiFetch(`/admin/collaborations/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
}

// ============================================================
// AUDIT LOGS
// ============================================================

async function loadAuditLogs() {
  const tbody = el('auList');
  if (!tbody) return;
  tbody.innerHTML = skeleton(4);

  const res = await apiFetch('/admin/audit-logs');
  if (!res || !res.success) {
    tbody.innerHTML = emptyState('fa-history', 'Audit logs require database connection');
    return;
  }
  const logs = res.data || [];
  if (logs.length === 0) {
    tbody.innerHTML = emptyState('fa-history', 'No audit logs yet');
    return;
  }
  tbody.innerHTML = logs.map(l => `
    <tr>
      <td>${l.username || '—'}</td>
      <td>${statusBadge(l.action)}</td>
      <td>${l.resource || '—'}</td>
      <td style="font-size:12px;max-width:200px;overflow:hidden;text-overflow:ellipsis">${l.details || '—'}</td>
      <td style="font-family:monospace;font-size:11px">${l.ip_address || '—'}</td>
      <td style="font-size:12px;color:var(--text3)">${formatDateTime(l.created_at)}</td>
    </tr>
  `).join('');
}

// ============================================================
// SETTINGS
// ============================================================

async function loadSettings() {
  const sysEl = el('sysStatus');
  if (sysEl) {
    let healthData = { status: 'Unknown', database: 'unknown', email: 'unknown', environment: 'unknown', version: '—' };
    try {
      const health = await apiFetch('/health');
      if (health) healthData = health;
    } catch (e) {}

    const dbColor = healthData.database === 'connected' ? '🟢' : '🟡';
    const srvColor = healthData.status === 'OK' ? '🟢' : (healthData.status === 'ERROR' ? '🔴' : '🟡');
    const emailColor = healthData.email === 'configured' ? '🟢' : '🟡';

    sysEl.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:10px">
        ${settingsRow('Server Status', `${srvColor} ${healthData.status || 'Running'}`)}
        ${settingsRow('Database', `${dbColor} ${healthData.database || 'Unknown'}`)}
        ${settingsRow('Email', `${emailColor} ${healthData.email || 'Unknown'}`)}
        ${settingsRow('Environment', healthData.environment || 'development')}
        ${settingsRow('Version', healthData.version || '2.0.0')}
      </div>
    `;
  }

  const srvEl = el('srvInfo');
  if (srvEl) {
    srvEl.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:10px">
        ${settingsRow('URL', window.location.origin)}
        ${settingsRow('Admin User', currentUser?.username || '—')}
        ${settingsRow('Role', currentUser?.role || '—')}
        ${settingsRow('Session', 'Active')}
      </div>
    `;
  }
}

function settingsRow(label, value) {
  return `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">
    <span style="font-size:13px;color:var(--text2)">${label}</span>
    <span style="font-size:13px;font-weight:500">${value}</span>
  </div>`;
}

// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // Login form
  const loginForm = el('loginForm');
  if (loginForm) loginForm.addEventListener('submit', login);

  // Blog form
  const blogForm = el('blogForm');
  if (blogForm) blogForm.addEventListener('submit', saveBlogPost);

  // Career form
  const careerForm = el('careerForm');
  if (careerForm) careerForm.addEventListener('submit', saveCareerOpening);

  // Gallery upload
  const galUpload = el('galUpload');
  if (galUpload) galUpload.addEventListener('change', uploadGalleryImages);

  // Gallery edit details form
  const galEditForm = el('galEditForm');
  if (galEditForm) galEditForm.addEventListener('submit', saveGalleryImageDetails);

  // Application search/filter
  const appSearch = el('appSearch');
  if (appSearch) {
    let debounce;
    appSearch.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(loadApplications, 300);
    });
  }
  const appFilter = el('appFilter');
  if (appFilter) appFilter.addEventListener('change', loadApplications);

  // Setup navigation
  setupNavigation();

  // Mobile sidebar toggle
  const topbar = document.querySelector('.topbar');
  if (topbar) {
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'btn btn-sm btn-s';
    toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
    toggleBtn.style.cssText = 'display:none;margin-right:12px';
    toggleBtn.id = 'sidebarToggle';
    toggleBtn.addEventListener('click', () => {
      document.querySelector('.sidebar')?.classList.toggle('mobile-open');
    });
    topbar.insertBefore(toggleBtn, topbar.firstChild);
    if (window.innerWidth <= 768) toggleBtn.style.display = 'inline-flex';
    window.addEventListener('resize', () => {
      toggleBtn.style.display = window.innerWidth <= 768 ? 'inline-flex' : 'none';
    });
  }

  // Check auth
  checkAuth();
});

// Add animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
  @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  .dash.show { display:block !important; }
  .sidebar.mobile-open { display:block !important; z-index:200; }
  @media(max-width:768px) { .sidebar.mobile-open { display:block !important; } }
`;
document.head.appendChild(styleSheet);
