// ==========================================================================
// MT-FLIX & MT LABS: Application Logic with Cinematic Splash Experience
// ==========================================================================

let activeProfile = null;
let myList = JSON.parse(localStorage.getItem('mtflix_my_list') || '[]');
let isAudioMuted = false;
let currentModalProject = null;
let splashTimer = null;

// Web Audio API: Netflix "Ta-Dum!" Synthesizer (Fallback / Secondary Chime)
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

// Initialize Application on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initSplashScreen();
  initProfileGate();
  initNavbar();
  renderHeroBillboard(PROJECTS_DATA[0]);
  renderAllRows();
  initSearch();
  initModalHandlers();
});

// ==========================================================================
// 0. CINEMATIC MT LABS SPLASH SCREEN CONTROLLER
// ==========================================================================
function initSplashScreen() {
  const splashScreen = document.getElementById('splash-screen');
  const initBtn = document.getElementById('initialize-splash-btn');
  const introCard = document.getElementById('splash-intro-card');
  const skipBtn = document.getElementById('skip-intro-btn');
  const replayBtn = document.getElementById('replay-intro-btn');

  if (initBtn) {
    initBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      triggerCinematicImpact();
    });
  }

  if (introCard) {
    introCard.addEventListener('click', () => {
      triggerCinematicImpact();
    });
  }

  if (skipBtn) {
    skipBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      finishSplashScreen();
    });
  }

  if (replayBtn) {
    replayBtn.addEventListener('click', () => {
      replaySplashScreen();
    });
  }
}

function triggerCinematicImpact() {
  const splashScreen = document.getElementById('splash-screen');
  const introCard = document.getElementById('splash-intro-card');
  const audio = document.getElementById('splash-audio');

  if (introCard) {
    introCard.classList.add('dismissed');
  }

  // Play cinematic impact sound effect
  if (audio && !isAudioMuted) {
    audio.currentTime = 0;
    audio.volume = 1.0;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        console.warn("Autoplay restriction prevented audio, falling back to synthesizer:", err);
        playNetflixTaDum();
      });
    }
  }

  // Activate cinematic visuals
  if (splashScreen) {
    splashScreen.classList.remove('fade-out');
    splashScreen.classList.add('impact-active');
  }

  // Automatically transition to profile gate after impact completes
  clearTimeout(splashTimer);
  splashTimer = setTimeout(() => {
    finishSplashScreen();
  }, 4800);
}

function finishSplashScreen() {
  clearTimeout(splashTimer);
  const splashScreen = document.getElementById('splash-screen');
  const audio = document.getElementById('splash-audio');
  const profileGate = document.getElementById('profile-gate');

  // Fade out audio smoothly if still playing
  if (audio && !audio.paused) {
    const fadeAudio = setInterval(() => {
      if (audio.volume > 0.1) {
        audio.volume -= 0.1;
      } else {
        audio.pause();
        audio.volume = 1.0;
        clearInterval(fadeAudio);
      }
    }, 50);
  }

  if (splashScreen) {
    splashScreen.classList.add('fade-out');
  }

  // Reveal Profile Selection Gate
  if (profileGate) {
    profileGate.classList.remove('hidden');
    profileGate.style.opacity = '1';
  }
}

function replaySplashScreen() {
  clearTimeout(splashTimer);
  const splashScreen = document.getElementById('splash-screen');
  const introCard = document.getElementById('splash-intro-card');
  const profileGate = document.getElementById('profile-gate');

  if (profileGate) {
    profileGate.classList.add('hidden');
  }

  if (splashScreen) {
    splashScreen.classList.remove('fade-out');
    splashScreen.classList.remove('impact-active');
  }

  if (introCard) {
    introCard.classList.add('dismissed');
  }

  // Force DOM reflow to re-trigger CSS animations
  void splashScreen.offsetWidth;

  triggerCinematicImpact();
}

// ==========================================================================
// 1. PROFILE GATE
// ==========================================================================
function initProfileGate() {
  const gate = document.getElementById('profile-gate');
  const grid = document.getElementById('profiles-grid');
  const guestBtn = document.getElementById('enter-guest-btn');

  if (grid) {
    grid.innerHTML = USER_PROFILES.map(p => `
      <div class="profile-card" data-id="${p.id}" onclick="selectProfile('${p.id}')">
        <div class="profile-avatar-box">
          <span>${p.avatar}</span>
        </div>
        <div class="profile-name">${p.name}</div>
        <div class="profile-tagline">${p.tagline}</div>
      </div>
    `).join('');
  }

  if (guestBtn) {
    guestBtn.addEventListener('click', () => {
      selectProfile('recruiter');
    });
  }

  // Check saved profile
  const saved = localStorage.getItem('mtflix_active_profile');
  if (saved) {
    const found = USER_PROFILES.find(p => p.id === saved);
    if (found) {
      applyProfile(found);
    }
  }
}

function selectProfile(profileId) {
  const profile = USER_PROFILES.find(p => p.id === profileId) || USER_PROFILES[0];
  applyProfile(profile);
  localStorage.setItem('mtflix_active_profile', profile.id);

  playNetflixTaDum();

  const gate = document.getElementById('profile-gate');
  if (gate) {
    gate.style.opacity = '0';
    setTimeout(() => {
      gate.classList.add('hidden');
    }, 400);
  }
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
  if (gate) {
    gate.classList.remove('hidden');
    gate.style.opacity = '1';
  }
}

// ==========================================================================
// 2. NAVBAR
// ==========================================================================
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
      
      const audio = document.getElementById('splash-audio');
      if (audio && isAudioMuted) {
        audio.pause();
      }
    });
  }
}

// ==========================================================================
// 3. HERO BILLBOARD
// ==========================================================================
function renderHeroBillboard(project) {
  const hero = document.getElementById('hero-billboard');
  if (!hero || !project) return;

  hero.style.backgroundImage = `url('${project.bannerImage}')`;
  const hasLiveUrl = !!project.liveUrl;
  
  hero.innerHTML = `
    <div class="hero-vignette"></div>
    <div class="hero-content">
      <div class="hero-badge-row">
        <span class="original-pill">ORIGINAL SERIES</span>
        ${hasLiveUrl ? `<span class="card-live-pill" style="position: static;"><span class="live-dot"></span> LIVE WEB APP</span>` : ''}
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
        ${hasLiveUrl ? `
          <a href="${project.liveUrl}" target="_blank" rel="noopener noreferrer" class="btn-netflix btn-play" title="${project.isDemo ? 'Play Interactive Demo' : 'Launch Live Website'}" ${project.isDemo ? 'style="background: linear-gradient(135deg, #00f2fe 0%, #0284c7 100%); color: #000000; font-weight: 700;"' : ''}>
            <span>${project.isDemo ? '🎮' : '🚀'}</span> <span>${project.isDemo ? 'Play Interactive Demo' : 'Launch Live Website'}</span>
          </a>
          <a href="${project.repoUrl}" target="_blank" rel="noopener noreferrer" class="btn-netflix btn-info" title="View Code on GitHub">
            <span>💻</span> <span>View Code</span>
          </a>
        ` : `
          <a href="${project.repoUrl}" target="_blank" rel="noopener noreferrer" class="btn-netflix btn-play" title="View Code on GitHub">
            <span>💻</span> <span>View Code</span>
          </a>
        `}
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

// ==========================================================================
// 4. CATALOG ROWS & CAROUSELS
// ==========================================================================
function renderAllRows() {
  renderTop10Row();
  renderCategoryRow("Trending Originals", "🍿 Trending Now | Flagship Applications", "trending-row");
  renderCategoryRow("Web Applications & Full Stack", "⚡ Web Applications & Full Stack Systems", "web-row");
  renderCategoryRow("AI & Deep Tech Originals", "🤖 AI, Autonomous Agents & Audio Studio", "ai-row");
  renderCategoryRow("Knowledge & Systems Vault", "🧠 Second Brain, ICS Systems & Architecture Docs", "knowledge-row");
  renderMyListRow();
}

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
                ${p.liveUrl ? `
                  <a href="${p.liveUrl}" target="_blank" rel="noopener noreferrer" class="${p.isDemo ? 'card-demo-pill' : 'card-live-pill'}" onclick="event.stopPropagation();" title="${p.isDemo ? 'Play Interactive Demo ↗' : 'Launch Live Website ↗'}">
                    <span class="${p.isDemo ? 'demo-dot' : 'live-dot'}"></span> ${p.isDemo ? 'DEMO ↗' : 'LIVE ↗'}
                  </a>
                ` : ''}
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

function createCardHTML(p) {
  const inList = isProjectInMyList(p.id);
  const hasLiveUrl = !!p.liveUrl;

  return `
    <div class="netflix-card" data-id="${p.id}">
      <div class="card-inner" onclick="openDetailsModal('${p.id}')">
        <div class="card-fallback-art" style="background: ${p.posterGradient};">
          <div class="card-vignette"></div>
          <div class="card-badge-top">${p.rating}</div>
          ${hasLiveUrl ? `
            <a href="${p.liveUrl}" target="_blank" rel="noopener noreferrer" class="${p.isDemo ? 'card-demo-pill' : 'card-live-pill'}" onclick="event.stopPropagation();" title="${p.isDemo ? 'Play Interactive Demo ↗' : 'Launch Live Website ↗'}">
              <span class="${p.isDemo ? 'demo-dot' : 'live-dot'}"></span> ${p.isDemo ? 'DEMO ↗' : 'LIVE ↗'}
            </a>
          ` : ''}
          <div class="card-title-bottom">${p.title}</div>
        </div>
      </div>

      <!-- Hover Expand Drawer -->
      <div class="card-hover-drawer">
        <div class="hover-preview-media" style="background: ${p.posterGradient};">
          <div class="card-vignette"></div>
          <div class="card-badge-top">${p.category}</div>
          ${hasLiveUrl ? `
            <a href="${p.liveUrl}" target="_blank" rel="noopener noreferrer" class="${p.isDemo ? 'card-demo-pill' : 'card-live-pill'}" onclick="event.stopPropagation();" title="${p.isDemo ? 'Play Interactive Demo ↗' : 'Launch Live Website ↗'}">
              <span class="${p.isDemo ? 'demo-dot' : 'live-dot'}"></span> ${p.isDemo ? 'LIVE DEMO ↗' : 'LIVE WEB ↗'}
            </a>
          ` : ''}
          <div class="card-title-bottom" style="font-size: 1.1rem;">${p.title}</div>
        </div>
        <div class="hover-body">
          <div class="hover-controls">
            <div class="hover-btn-group-left">
              ${hasLiveUrl ? `
                <a href="${p.liveUrl}" target="_blank" rel="noopener noreferrer" class="circle-btn ${p.isDemo ? 'demo-btn' : 'live-btn'}" title="${p.isDemo ? 'Play Interactive Demo' : 'Launch Live Website (Opens in new tab)'}" onclick="event.stopPropagation();">
                  ${p.isDemo ? '🎮' : '🌐'}
                </a>
              ` : ''}
              <a href="${p.repoUrl}" target="_blank" rel="noopener noreferrer" class="circle-btn play-btn" title="View Source Code on GitHub" onclick="event.stopPropagation();">
                💻
              </a>
              <button class="circle-btn" onclick="event.stopPropagation(); toggleMyList('${p.id}', this)" title="${inList ? 'Remove from My List' : 'Add to My List'}">
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

          <!-- Direct Action Buttons for Cards -->
          <div class="card-action-bar">
            ${hasLiveUrl ? `
              <a href="${p.liveUrl}" target="_blank" rel="noopener noreferrer" class="card-action-link ${p.isDemo ? 'demo-link' : 'live-link'}" onclick="event.stopPropagation();">
                <span>${p.isDemo ? '🎮' : '🚀'}</span> <strong>${p.isDemo ? 'Interactive Demo ↗' : 'Live Site ↗'}</strong>
              </a>
              <a href="${p.repoUrl}" target="_blank" rel="noopener noreferrer" class="card-action-link code-link" onclick="event.stopPropagation();" title="GitHub Code">
                <span>💻</span> <strong>Code ↗</strong>
              </a>
            ` : `
              <a href="${p.repoUrl}" target="_blank" rel="noopener noreferrer" class="card-action-link code-link full-width" onclick="event.stopPropagation();">
                <span>💻</span> <strong>View GitHub Repository ↗</strong>
              </a>
            `}
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

function scrollCarousel(trackId, direction) {
  const track = document.getElementById(trackId);
  if (!track) return;
  const scrollAmount = track.clientWidth * 0.75;
  track.scrollBy({
    left: direction * scrollAmount,
    behavior: 'smooth'
  });
}

// ==========================================================================
// 5. DETAILS MODAL
// ==========================================================================
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
  const liveBtn = document.getElementById('modal-live-btn');
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
    ${project.liveUrl ? `<div class="modal-meta-field"><strong>Live Website:</strong> <a href="${project.liveUrl}" target="_blank" rel="noopener noreferrer" style="color: #46d369; text-decoration: underline; font-weight: 600;">${project.liveUrl} ↗</a></div>` : ''}
    <div class="modal-meta-field"><strong>Repository:</strong> <a href="${project.repoUrl}" target="_blank" rel="noopener noreferrer" style="color: #60a5fa; text-decoration: underline;">GitHub ↗</a></div>
  `;

  repoBtn.href = project.repoUrl;

  if (liveBtn) {
    if (project.liveUrl) {
      liveBtn.style.display = 'inline-flex';
      liveBtn.href = project.liveUrl;
      liveBtn.innerHTML = project.isDemo ? '<span>🎮</span> <span>Play Interactive Demo ↗</span>' : '<span>🚀</span> <span>Launch Live Website ↗</span>';
      if (project.isDemo) {
        liveBtn.style.background = 'linear-gradient(135deg, #00f2fe 0%, #0284c7 100%)';
        liveBtn.style.color = '#000000';
        liveBtn.style.fontWeight = '700';
      } else {
        liveBtn.style.background = '#46d369';
        liveBtn.style.color = '#000000';
        liveBtn.style.fontWeight = '700';
      }
    } else {
      liveBtn.style.display = 'none';
    }
  }

  const inList = isProjectInMyList(project.id);
  bookmarkBtn.innerHTML = inList ? '✓ In My List' : '➕ Add to My List';
  bookmarkBtn.onclick = () => {
    toggleMyList(project.id);
    const updated = isProjectInMyList(project.id);
    bookmarkBtn.innerHTML = updated ? '✓ In My List' : '➕ Add to My List';
  };

  modal.classList.add('active');
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

// ==========================================================================
// 6. MY LIST
// ==========================================================================
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

  if (btnElement) {
    btnElement.innerHTML = `<span>${isProjectInMyList(id) ? '✓' : '➕'}</span>`;
  }
}

// ==========================================================================
// 7. SEARCH
// ==========================================================================
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
