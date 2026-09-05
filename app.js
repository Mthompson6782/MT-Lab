// ==========================================================================
// MT-FLIX: Netflix-Style Application Logic
// ==========================================================================

let activeProfile = null;
let myList = JSON.parse(localStorage.getItem('mtflix_my_list') || '[]');
let isAudioMuted = false;
let currentModalProject = null;

// Web Audio API: Netflix "Ta-Dum!" Synthesizer
function playNetflixTaDum() {
  if (isAudioMuted) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // Deep impactful sub-bass hit
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(65.41, now); // C2
    osc1.frequency.exponentialRampToValueAtTime(32.7, now + 1.2);
    gain1.gain.setValueAtTime(0.7, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

    const filter1 = ctx.createBiquadFilter();
    filter1.type = 'lowpass';
    filter1.frequency.setValueAtTime(220, now);
    filter1.frequency.exponentialRampToValueAtTime(40, now + 1.2);

    osc1.connect(filter1);
    filter1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 1.4);

    // Warm cinematic harmonic chord swell
    const freqs = [130.81, 164.81, 196.00, 261.63]; // C3, E3, G3, C4
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + 0.15 + (idx * 0.04));
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.25 / freqs.length, now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + 0.15);
      osc.stop(now + 2.1);
    });
  } catch (e) {
    console.warn("Audio Context error:", e);
  }
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initProfileGate();
  initNavbar();
  renderHeroBillboard(PROJECTS_DATA[0]);
  renderAllRows();
  initSearch();
  initModalHandlers();
});

// Profile Gate Setup
function initProfileGate() {
  const gate = document.getElementById('profile-gate');
  const grid = document.getElementById('profiles-grid');
  const guestBtn = document.getElementById('enter-guest-btn');

  grid.innerHTML = USER_PROFILES.map(p => `
    <div class="profile-card" data-id="${p.id}" onclick="selectProfile('${p.id}')">
      <div class="profile-avatar-box">
        <span>${p.avatar}</span>
      </div>
      <div class="profile-name">${p.name}</div>
      <div class="profile-tagline">${p.tagline}</div>
    </div>
  `).join('');

  guestBtn.addEventListener('click', () => {
    selectProfile('recruiter');
  });

  // Check saved profile
  const saved = localStorage.getItem('mtflix_active_profile');
  if (saved) {
    const found = USER_PROFILES.find(p => p.id === saved);
    if (found) {
      applyProfile(found);
      gate.classList.add('hidden');
    }
  }
}

function selectProfile(profileId) {
  const profile = USER_PROFILES.find(p => p.id === profileId) || USER_PROFILES[0];
  applyProfile(profile);
  localStorage.setItem('mtflix_active_profile', profile.id);

  playNetflixTaDum();

  const gate = document.getElementById('profile-gate');
  gate.style.opacity = '0';
  setTimeout(() => {
    gate.classList.add('hidden');
  }, 400);
}

function applyProfile(profile) {
  activeProfile = profile;
  const navAvatar = document.getElementById('nav-profile-avatar');
  if (navAvatar) {
    navAvatar.textContent = profile.avatar;
    navAvatar.title = `${profile.name} (${profile.tagline})`;
  }
}

function switchProfilePrompt() {
  const gate = document.getElementById('profile-gate');
  gate.classList.remove('hidden');
  gate.style.opacity = '1';
}

// Navbar Logic
function initNavbar() {
  const nav = document.getElementById('netflix-navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 45) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });

  const soundBtn = document.getElementById('audio-toggle');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      isAudioMuted = !isAudioMuted;
      soundBtn.innerHTML = isAudioMuted ? '🔇' : '🔊';
      soundBtn.title = isAudioMuted ? 'Sound Muted' : 'Sound Enabled';
    });
  }
}

// Hero Billboard Renderer
function renderHeroBillboard(project) {
  const hero = document.getElementById('hero-billboard');
  if (!hero || !project) return;

  hero.style.backgroundImage = `url('${project.bannerImage}')`;
  
  hero.innerHTML = `
    <div class="hero-vignette"></div>
    <div class="hero-content">
      <div class="hero-badge-row">
        <span class="original-pill">ORIGINAL SERIES</span>
      </div>
      <h1 class="hero-title">${project.title}</h1>
      <div class="hero-meta-row">
        <span class="match-badge">${project.matchScore}% Match</span>
        <span class="rating-badge">${project.rating}</span>
        <span class="quality-badge">${project.quality}</span>
        <span class="quality-badge">${project.duration}</span>
        <span class="quality-badge">${project.year}</span>
      </div>
      <p class="hero-synopsis">${project.synopsis}</p>
      <div class="hero-action-row">
        <a href="${project.repoUrl}" target="_blank" rel="noopener noreferrer" class="btn-netflix btn-play">
          <span>▶</span> <span>View Code</span>
        </a>
        <button class="btn-netflix btn-info" onclick="openDetailsModal('${project.id}')">
          <span>ℹ</span> <span>More Info</span>
        </button>
        <button class="btn-bookmark-hero" onclick="toggleMyList('${project.id}', this)" title="Add to My List">
          <span>${isProjectInMyList(project.id) ? '✓' : '➕'}</span>
        </button>
      </div>
    </div>
  `;
}

// Render All Rows
function renderAllRows() {
  renderTop10Row();
  renderCategoryRow("Trending Originals", "🍿 Trending Now | Flagship Applications", "trending-row");
  renderCategoryRow("Web Applications & Full Stack", "⚡ Web Applications & Full Stack Systems", "web-row");
  renderCategoryRow("AI & Deep Tech Originals", "🤖 AI, Autonomous Agents & Audio Studio", "ai-row");
  renderCategoryRow("Knowledge & Systems Vault", "🧠 Second Brain, ICS Systems & Architecture Docs", "knowledge-row");
  renderMyListRow();
}

// Render Category Carousel Row
function renderCategoryRow(rowKey, displayTitle, elementId) {
  const container = document.getElementById(elementId);
  if (!container) return;

  const items = PROJECTS_DATA.filter(p => p.rows && p.rows.includes(rowKey));
  if (items.length === 0) return;

  container.innerHTML = `
    <div class="row-header">
      <h2 class="row-title">${displayTitle}</h2>
      <span class="row-explore-link">Explore All (${items.length}) ›</span>
    </div>
    <div class="carousel-wrapper">
      <button class="chevron-btn chevron-left" onclick="scrollCarousel('${elementId}-track', -1)">‹</button>
      <div class="carousel-track" id="${elementId}-track">
        ${items.map(p => createCardHTML(p)).join('')}
      </div>
      <button class="chevron-btn chevron-right" onclick="scrollCarousel('${elementId}-track', 1)">›</button>
    </div>
  `;
}

// Render Top 10 Row
function renderTop10Row() {
  const container = document.getElementById('top10-row');
  if (!container) return;

  const top10Items = PROJECTS_DATA
    .filter(p => p.top10Rank !== null)
    .sort((a, b) => a.top10Rank - b.top10Rank);

  container.innerHTML = `
    <div class="row-header">
      <h2 class="row-title">🏆 Top 10 in Tech Today</h2>
      <span class="row-explore-link">Explore Rankings ›</span>
    </div>
    <div class="carousel-wrapper">
      <button class="chevron-btn chevron-left" onclick="scrollCarousel('top10-track', -1)">‹</button>
      <div class="carousel-track" id="top10-track">
        ${top10Items.map((p, idx) => `
          <div class="top10-card" onclick="openDetailsModal('${p.id}')">
            <div class="top10-number">${idx + 1}</div>
            <div class="top10-poster-box">
              <div class="card-fallback-art" style="background: ${p.posterGradient};">
                <div class="card-badge-top">${p.category}</div>
                <div class="card-title-bottom">${p.title}</div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
      <button class="chevron-btn chevron-right" onclick="scrollCarousel('top10-track', 1)">›</button>
    </div>
  `;
}

// Render My List Row
function renderMyListRow() {
  const container = document.getElementById('mylist-row');
  if (!container) return;

  const items = PROJECTS_DATA.filter(p => myList.includes(p.id));

  if (items.length === 0) {
    container.innerHTML = `
      <div class="row-header">
        <h2 class="row-title">🔖 My List</h2>
      </div>
      <div style="padding: 0 4% 20px; color: #777; font-size: 0.9rem;">
        No titles in your list yet. Hover over any card and click ➕ to bookmark projects!
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="row-header">
      <h2 class="row-title">🔖 My List (${items.length})</h2>
    </div>
    <div class="carousel-wrapper">
      <button class="chevron-btn chevron-left" onclick="scrollCarousel('mylist-track', -1)">‹</button>
      <div class="carousel-track" id="mylist-track">
        ${items.map(p => createCardHTML(p)).join('')}
      </div>
      <button class="chevron-btn chevron-right" onclick="scrollCarousel('mylist-track', 1)">›</button>
    </div>
  `;
}

// Generate Card HTML
function createCardHTML(p) {
  const inList = isProjectInMyList(p.id);
  return `
    <div class="netflix-card" data-id="${p.id}">
      <div class="card-inner" onclick="openDetailsModal('${p.id}')">
        <div class="card-fallback-art" style="background: ${p.posterGradient};">
          <div class="card-vignette"></div>
          <div class="card-badge-top">${p.rating}</div>
          <div class="card-title-bottom">${p.title}</div>
        </div>
      </div>

      <!-- Hover Expand Drawer -->
      <div class="card-hover-drawer">
        <div class="hover-preview-media" style="background: ${p.posterGradient};">
          <div class="card-vignette"></div>
          <div class="card-badge-top">${p.category}</div>
          <div class="card-title-bottom" style="font-size: 1.1rem;">${p.title}</div>
        </div>
        <div class="hover-body">
          <div class="hover-controls">
            <div class="hover-btn-group-left">
              <a href="${p.repoUrl}" target="_blank" rel="noopener noreferrer" class="circle-btn play-btn" title="Open GitHub Repo">
                ▶
              </a>
              <button class="circle-btn" onclick="toggleMyList('${p.id}', this)" title="${inList ? 'Remove from My List' : 'Add to My List'}">
                ${inList ? '✓' : '➕'}
              </button>
              <button class="circle-btn" onclick="openDetailsModal('${p.id}')" title="More Information">
                ⌄
              </button>
            </div>
            <div>
              <span class="match-badge" style="font-size: 0.8rem; font-weight: bold;">${p.matchScore}%</span>
            </div>
          </div>
          <div class="hover-meta">
            <span class="rating-badge">${p.rating}</span>
            <span>${p.duration}</span>
            <span class="quality-badge">${p.quality}</span>
          </div>
          <div class="hover-tags-row">
            ${p.tags.slice(0, 3).map(t => `<span class="tech-tag">${t}</span>`).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

// Carousel Scroll Buttons
function scrollCarousel(trackId, direction) {
  const track = document.getElementById(trackId);
  if (!track) return;
  const scrollAmount = track.clientWidth * 0.75;
  track.scrollBy({
    left: direction * scrollAmount,
    behavior: 'smooth'
  });
}

// Details Modal
function openDetailsModal(projectId) {
  const project = PROJECTS_DATA.find(p => p.id === projectId);
  if (!project) return;
  currentModalProject = project;

  const modal = document.getElementById('details-modal');
  const heroMedia = document.getElementById('modal-hero-media');
  const title = document.getElementById('modal-title');
  const subtitle = document.getElementById('modal-subtitle');
  const match = document.getElementById('modal-match');
  const year = document.getElementById('modal-year');
  const rating = document.getElementById('modal-rating');
  const quality = document.getElementById('modal-quality');
  const duration = document.getElementById('modal-duration');
  const desc = document.getElementById('modal-description');
  const tags = document.getElementById('modal-tags');
  const stats = document.getElementById('modal-stats');
  const repoBtn = document.getElementById('modal-repo-btn');
  const bookmarkBtn = document.getElementById('modal-bookmark-btn');

  heroMedia.style.background = project.posterGradient;
  title.textContent = project.title;
  subtitle.textContent = project.subtitle;
  match.textContent = `${project.matchScore}% Match`;
  year.textContent = project.year;
  rating.textContent = project.rating;
  quality.textContent = project.quality;
  duration.textContent = project.duration;

  desc.innerHTML = (project.longDescription || project.synopsis).replace(/\n/g, '<br>');

  tags.innerHTML = project.tags.map(t => `<span class="tech-tag" style="font-size: 0.8rem; margin: 3px; display: inline-block;">${t}</span>`).join('');

  stats.innerHTML = `
    <div class="modal-meta-field"><strong>Category:</strong> <span>${project.category}</span></div>
    <div class="modal-meta-field"><strong>Status:</strong> <span>${project.stats.status}</span></div>
    <div class="modal-meta-field"><strong>Audio/Format:</strong> <span>${project.audio}</span></div>
  `;

  repoBtn.href = project.repoUrl;

  const inList = isProjectInMyList(project.id);
  bookmarkBtn.innerHTML = inList ? '✓ In My List' : '➕ Add to My List';
  bookmarkBtn.onclick = () => {
    toggleMyList(project.id);
    const updated = isProjectInMyList(project.id);
    bookmarkBtn.innerHTML = updated ? '✓ In My List' : '➕ Add to My List';
  };

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeDetailsModal() {
  const modal = document.getElementById('details-modal');
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

function initModalHandlers() {
  const modal = document.getElementById('details-modal');
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeDetailsModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDetailsModal();
    }
  });
}

// My List Management
function isProjectInMyList(id) {
  return myList.includes(id);
}

function toggleMyList(id, btnElement) {
  if (myList.includes(id)) {
    myList = myList.filter(item => item !== id);
  } else {
    myList.push(id);
  }
  localStorage.setItem('mtflix_my_list', JSON.stringify(myList));

  renderMyListRow();

  // If button passed, update icon
  if (btnElement) {
    btnElement.innerHTML = `<span>${isProjectInMyList(id) ? '✓' : '➕'}</span>`;
  }
}

// Search Functionality
function initSearch() {
  const input = document.getElementById('search-input');
  if (!input) return;

  input.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (!query) {
      renderAllRows();
      return;
    }

    const filtered = PROJECTS_DATA.filter(p => 
      p.title.toLowerCase().includes(query) ||
      p.synopsis.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      p.tags.some(t => t.toLowerCase().includes(query))
    );

    const container = document.getElementById('trending-row');
    const webContainer = document.getElementById('web-row');
    const aiContainer = document.getElementById('ai-row');
    const knowContainer = document.getElementById('knowledge-row');
    const top10Container = document.getElementById('top10-row');
    const mylistContainer = document.getElementById('mylist-row');

    top10Container.innerHTML = '';
    webContainer.innerHTML = '';
    aiContainer.innerHTML = '';
    knowContainer.innerHTML = '';
    mylistContainer.innerHTML = '';

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="row-header">
          <h2 class="row-title">Search Results</h2>
        </div>
        <div style="padding: 20px 4%; color: #888;">
          No projects matched your search for "<strong>${escapeHtml(query)}</strong>".
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="row-header">
          <h2 class="row-title">Search Results (${filtered.length})</h2>
        </div>
        <div class="carousel-wrapper">
          <div class="carousel-track" style="flex-wrap: wrap; gap: 20px;">
            ${filtered.map(p => createCardHTML(p)).join('')}
          </div>
        </div>
      `;
    }
  });
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
