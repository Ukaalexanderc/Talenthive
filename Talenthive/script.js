/**
 * TALENTHIVE — Two-Sided Music Talent Marketplace Controller (Vanilla ES6+)
 * 
 * Core Loop:
 * Talent creates offer -> Client discovers -> Reviews work/credits -> Sends brief -> Escrow secured -> Paid.
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. Initial Mock Database of Verified Music Talent
  // ==========================================================================
  const talentRoster = [
    {
      id: 'talent-1',
      name: 'Maya Lin',
      role: 'Producer',
      initials: 'ML',
      location: 'London, UK (Remote)',
      rateAmount: 350,
      rateBasis: 'per song',
      currency: '$',
      services: ['Afrobeats Production', 'Modern Pop Stems', 'Arrangement'],
      sampleTrack: 'Midnight Afro Fusion (Master Demo)',
      sampleBpm: '104 BPM',
      credits: ['Warner Chappell', 'Olamide Session', 'BBC Radio 1'],
      completedJobs: 48,
      rating: 5.0,
      reviewCount: 42,
      responseTime: '< 1 hr',
      availability: 'Remote & In person',
      bio: 'Multi-platinum credited producer specializing in global Afro-fusion, contemporary pop, and tight percussion arrangements. Delivered over 40+ label-ready records.'
    },
    {
      id: 'talent-2',
      name: 'Devon Miller',
      role: 'Mixing',
      initials: 'DM',
      location: 'Los Angeles, CA (Remote)',
      rateAmount: 280,
      rateBasis: 'per song',
      currency: '$',
      services: ['Dolby Atmos Mix', 'Analog Stem Summing', 'Vocal Tuning'],
      sampleTrack: 'Horizon Nights (Dolby Atmos Mastered)',
      sampleBpm: 'Stereo 48k',
      credits: ['Universal Music Group', 'Grammy-Nominated Session', 'Def Jam'],
      completedJobs: 64,
      rating: 4.9,
      reviewCount: 58,
      responseTime: '< 2 hrs',
      availability: 'Remote',
      bio: 'Specialist in punchy, dynamic low-end and immersive spatial audio. Analog outboard gear including Neve summing and Tube-Tech compression.'
    },
    {
      id: 'talent-3',
      name: 'Aaliyah Vance',
      role: 'Singer',
      initials: 'AV',
      location: 'Atlanta, GA (Remote)',
      rateAmount: 400,
      rateBasis: 'per song',
      currency: '$',
      services: ['Lead Vocals', 'Toplining & Melodies', 'Harmony Stems'],
      sampleTrack: 'Deep Embers (Dry Stems & Wet Mix)',
      sampleBpm: 'Key: F# Minor',
      credits: ['Atlantic Records', 'Spotify Editorial Top 50', 'Sony Sync'],
      completedJobs: 57,
      rating: 5.0,
      reviewCount: 51,
      responseTime: '< 1 hr',
      availability: 'Remote',
      bio: 'Session vocalist and Billboard-charting topliner with custom untreated vocal booth and Neumann U87 signal chain. 24-hour turnaround available.'
    },
    {
      id: 'talent-4',
      name: 'Elena Rostova',
      role: 'Songwriter',
      initials: 'ER',
      location: 'Berlin, Germany (Remote)',
      rateAmount: 650,
      rateBasis: 'per project',
      currency: '$',
      services: ['Cinematic Film Score', 'Game Soundtrack', 'Hybrid Synth'],
      sampleTrack: 'Echoes of Solitude (Full Orchestral)',
      sampleBpm: '92 BPM / Atmos',
      credits: ['A24 Feature Film', 'Netflix Series', 'Ableton Soundbank'],
      completedJobs: 32,
      rating: 5.0,
      reviewCount: 29,
      responseTime: '< 3 hrs',
      availability: 'Remote & In person',
      bio: 'Film composer blending modern modular synthesis with full live string ensembles. Experienced in cue sheet delivery and direct director collaboration.'
    },
    {
      id: 'talent-5',
      name: 'Marcus Chen',
      role: 'Session Player',
      initials: 'MC',
      location: 'Nashville, TN (Remote)',
      rateAmount: 150,
      rateBasis: 'per song',
      currency: '$',
      services: ['Acoustic & Electric Guitar', 'Pedal Steel', 'Bass Guitar'],
      sampleTrack: 'Southern Drift (DI & Tube Amp Stems)',
      sampleBpm: '118 BPM',
      credits: ['Sony Masterworks', 'Grand Ole Opry Live', 'Fender Demo Artist'],
      completedJobs: 91,
      rating: 5.0,
      reviewCount: 88,
      responseTime: '< 1 hr',
      availability: 'Both',
      bio: 'First-call session guitarist delivering DI and mic’d vintage tube amp stems within 48 hours. Flawless timekeeping and tasteful musicality.'
    },
    {
      id: 'talent-6',
      name: 'Kairos Sound Lab',
      role: 'Mastering',
      initials: 'KS',
      location: 'Stockholm, Sweden (Remote)',
      rateAmount: 95,
      rateBasis: 'per song',
      currency: '$',
      services: ['Apple Digital Masters', 'Analog Tape Warmth', 'DDP Export'],
      sampleTrack: 'Golden Hour (Loudness & Punch A/B)',
      sampleBpm: '-14 LUFS',
      credits: ['Ninja Tune', 'Spinnin Records', 'Anjunabeats'],
      completedJobs: 124,
      rating: 5.0,
      reviewCount: 119,
      responseTime: '< 1 hr',
      availability: 'Remote',
      bio: 'Mastering facility equipped with custom Weiss digital processing, Manley Massive Passive EQ, and PMC active monitors.'
    }
  ];

  // ==========================================================================
  // 2. Application State
  // ==========================================================================
  const state = {
    currentView: 'onboarding', // 'onboarding' | 'marketplace'
    onboardingStep: 'intent',  // 'intent' | 'talent-form' | 'hirer-form'
    activeRoleFilter: 'all',
    searchQuery: '',
    currentlyPlayingId: null,
    audioContext: null
  };

  // ==========================================================================
  // 3. DOM References
  // ==========================================================================
  const dom = {
    // Views
    viewOnboarding: document.getElementById('view-onboarding'),
    viewMarketplace: document.getElementById('view-marketplace'),
    
    // Steps
    stepIntent: document.getElementById('step-intent'),
    stepTalentForm: document.getElementById('step-talent-form'),
    stepHirerForm: document.getElementById('step-hirer-form'),
    
    // Buttons
    btnChoiceTalent: document.getElementById('btn-choice-talent'),
    btnChoiceHirer: document.getElementById('btn-choice-hirer'),
    btnBackTalent: document.getElementById('btn-back-talent'),
    btnBackHirer: document.getElementById('btn-back-hirer'),
    navHomeBtn: document.getElementById('nav-home-btn'),
    navMarketplaceBtn: document.getElementById('nav-marketplace-btn'),
    navJoinBtn: document.getElementById('nav-join-btn'),
    
    // Forms
    formTalent: document.getElementById('form-talent'),
    formHirer: document.getElementById('form-hirer'),
    
    // Market & Filters
    marketRosterGrid: document.getElementById('market-roster-grid'),
    marketSearch: document.getElementById('market-search'),
    filterRolePills: document.getElementById('filter-role-pills'),
    
    // Modals
    profileModal: document.getElementById('profile-modal'),
    profileDrawerBody: document.getElementById('profile-drawer-body'),
    btnCloseProfile: document.getElementById('btn-close-profile'),
    
    briefModal: document.getElementById('brief-modal'),
    formSendBrief: document.getElementById('form-send-brief'),
    briefTargetName: document.getElementById('brief-target-name'),
    briefAgreedRate: document.getElementById('brief-agreed-rate'),
    briefDepositDisplay: document.getElementById('brief-deposit-display'),
    briefTotalDisplay: document.getElementById('brief-total-display'),
    btnCloseBrief: document.getElementById('btn-close-brief'),
    
    toastHub: document.getElementById('toast-hub')
  };

  // ==========================================================================
  // 4. View & Step Management
  // ==========================================================================
  function showView(viewName) {
    state.currentView = viewName;
    if (viewName === 'onboarding') {
      dom.viewOnboarding.classList.add('active');
      dom.viewMarketplace.classList.remove('active');
    } else {
      dom.viewMarketplace.classList.add('active');
      dom.viewOnboarding.classList.remove('active');
      renderMarketplaceRoster();
    }
  }

  function showOnboardingStep(stepName) {
    state.onboardingStep = stepName;
    dom.stepIntent.classList.toggle('active', stepName === 'intent');
    dom.stepTalentForm.classList.toggle('active', stepName === 'talent-form');
    dom.stepHirerForm.classList.toggle('active', stepName === 'hirer-form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ==========================================================================
  // 5. Onboarding Form Interactions
  // ==========================================================================
  function initOnboardingFlow() {
    // Step 1 Intent Selections
    dom.btnChoiceTalent.addEventListener('click', () => {
      showOnboardingStep('talent-form');
    });

    dom.btnChoiceHirer.addEventListener('click', () => {
      showOnboardingStep('hirer-form');
    });

    dom.btnBackTalent.addEventListener('click', () => {
      showOnboardingStep('intent');
    });

    dom.btnBackHirer.addEventListener('click', () => {
      showOnboardingStep('intent');
    });

    // Top Nav buttons
    dom.navHomeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showView('onboarding');
      showOnboardingStep('intent');
    });

    dom.navMarketplaceBtn.addEventListener('click', () => {
      showView('marketplace');
    });

    dom.navJoinBtn.addEventListener('click', () => {
      showView('onboarding');
      showOnboardingStep('intent');
    });

    // --- Talent Form: Role Chips Toggle ---
    const talentRoleChips = document.querySelectorAll('#talent-role-chips .role-chip');
    const talentSelectedRoleInput = document.getElementById('talent-selected-role');

    talentRoleChips.forEach(chip => {
      chip.addEventListener('click', () => {
        talentRoleChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        talentSelectedRoleInput.value = chip.getAttribute('data-role');
      });
    });

    // Talent Form: Availability Toggle
    const talentAvailBtns = document.querySelectorAll('#talent-availability-control .seg-btn');
    const talentSelectedAvailInput = document.getElementById('talent-selected-avail');

    talentAvailBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        talentAvailBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        talentSelectedAvailInput.value = btn.getAttribute('data-val');
      });
    });

    // Talent Form Submission
    dom.formTalent.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('talent-name').value.trim();
      const email = document.getElementById('talent-email').value.trim();
      const role = talentSelectedRoleInput.value;
      const offer = document.getElementById('talent-offer').value.trim();
      const rateAmount = parseFloat(document.getElementById('talent-rate-amount').value) || 250;
      const rateBasis = document.getElementById('talent-rate-basis').value;
      const currency = document.getElementById('talent-currency').value;
      const location = document.getElementById('talent-location').value.trim() || 'Remote';
      const avail = talentSelectedAvailInput.value;

      if (!name || !email || !offer) {
        showToast('Please fill in your name, email, and what you offer.', 'alert');
        return;
      }

      // Add to Talent Roster dynamically
      const newTalent = {
        id: `talent-${Date.now()}`,
        name: name,
        role: role,
        initials: name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'TH',
        location: location.includes('Remote') ? location : `${location} (${avail})`,
        rateAmount: rateAmount,
        rateBasis: rateBasis,
        currency: currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$',
        services: offer.split(',').map(s => s.trim()).filter(Boolean),
        sampleTrack: `${name} — Featured Session Demo`,
        sampleBpm: 'Master Quality',
        credits: ['New Verified Talent', 'TalentHive Roster 2026'],
        completedJobs: 0,
        rating: 5.0,
        reviewCount: 0,
        responseTime: '< 1 hr',
        availability: avail,
        bio: `Professional ${role} offering ${offer}. Ready for new studio bookings and remote stem commissions.`
      };

      talentRoster.unshift(newTalent);

      showToast(`Welcome ${name}! Your service profile is live in the marketplace.`, 'success');
      showView('marketplace');
    });

    // --- Hirer Form: Service Chips Toggle ---
    const hirerServiceChips = document.querySelectorAll('#hirer-service-chips .role-chip');
    const hirerSelectedServiceInput = document.getElementById('hirer-selected-service');

    hirerServiceChips.forEach(chip => {
      chip.addEventListener('click', () => {
        hirerServiceChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        hirerSelectedServiceInput.value = chip.getAttribute('data-service');
      });
    });

    // Hirer Form: Budget Chips Toggle
    const hirerBudgetChips = document.querySelectorAll('#hirer-budget-chips .budget-chip');
    const hirerSelectedBudgetInput = document.getElementById('hirer-selected-budget');

    hirerBudgetChips.forEach(chip => {
      chip.addEventListener('click', () => {
        hirerBudgetChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        hirerSelectedBudgetInput.value = chip.getAttribute('data-budget');
      });
    });

    // Hirer Form Submission
    dom.formHirer.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('hirer-name').value.trim();
      const service = hirerSelectedServiceInput.value;
      const budget = hirerSelectedBudgetInput.value;

      if (!name) {
        showToast('Please enter your name or company.', 'alert');
        return;
      }

      showToast(`Finding top verified ${service} professionals for budget (${budget})...`, 'success');
      
      // Auto-filter by relevant role if applicable
      state.activeRoleFilter = mapServiceToRole(service);
      updateFilterPillUI(state.activeRoleFilter);
      showView('marketplace');
    });
  }

  function mapServiceToRole(service) {
    if (service === 'Production' || service === 'Beat') return 'Producer';
    if (service === 'Vocals') return 'Singer';
    if (service === 'Mixing') return 'Mixing';
    if (service === 'Mastering') return 'Mastering';
    if (service === 'Session musician') return 'Session Player';
    if (service === 'Songwriting') return 'Songwriter';
    return 'all';
  }

  function updateFilterPillUI(filterVal) {
    const pills = document.querySelectorAll('#filter-role-pills .filter-pill');
    pills.forEach(pill => {
      pill.classList.toggle('active', pill.getAttribute('data-filter') === filterVal);
    });
  }

  // ==========================================================================
  // 6. Marketplace Roster Rendering & Filtering
  // ==========================================================================
  function renderMarketplaceRoster() {
    const query = state.searchQuery.toLowerCase();
    const roleFilter = state.activeRoleFilter;

    const filtered = talentRoster.filter(item => {
      const matchesRole = (roleFilter === 'all' || item.role.toLowerCase() === roleFilter.toLowerCase());
      const matchesSearch = !query || (
        item.name.toLowerCase().includes(query) ||
        item.role.toLowerCase().includes(query) ||
        item.services.some(s => s.toLowerCase().includes(query)) ||
        item.credits.some(c => c.toLowerCase().includes(query))
      );
      return matchesRole && matchesSearch;
    });

    if (filtered.length === 0) {
      dom.marketRosterGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; color: var(--text-secondary);">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 0.75rem; color: var(--lime-accent);"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <h3 style="color: var(--text-primary); font-size: 1.25rem; margin-bottom: 0.35rem;">No exact music talent matches</h3>
          <p style="font-size: 0.9rem;">Try adjusting your keyword or reset filters to browse the full vetted roster.</p>
        </div>
      `;
      return;
    }

    dom.marketRosterGrid.innerHTML = filtered.map(talent => `
      <article class="talent-card" data-id="${talent.id}">
        
        <!-- Header: Avatar + Meta -->
        <div class="card-talent-header">
          <div class="talent-avatar">${talent.initials}</div>
          <div class="talent-meta-top">
            <div class="talent-name-row">
              <h3 class="talent-name">${talent.name}</h3>
              <span class="badge-verified" title="Verified Proof of Work">✦</span>
            </div>
            <span class="talent-role-tag">${talent.role.toUpperCase()} // ${talent.location}</span>
          </div>
        </div>

        <!-- Services Tags -->
        <div class="talent-services-row">
          ${talent.services.map(s => `<span class="service-badge">${s}</span>`).join('')}
        </div>

        <!-- Inline Audio Waveform Player -->
        <div class="talent-audio-player" id="player-${talent.id}">
          <button type="button" class="btn-play-sample" data-talent-id="${talent.id}" aria-label="Play audio demo">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </button>
          <div class="audio-track-info">
            <div class="track-name">${talent.sampleTrack}</div>
            <div class="waveform-bars">
              <span class="wave-col"></span>
              <span class="wave-col"></span>
              <span class="wave-col"></span>
              <span class="wave-col"></span>
              <span class="wave-col"></span>
              <span class="wave-col"></span>
              <span class="wave-col"></span>
              <span class="wave-col"></span>
            </div>
          </div>
        </div>

        <!-- Proof of Ability / Metrics -->
        <div class="talent-metrics-grid">
          <div class="metric-item">
            <span class="metric-label">COMPLETED</span>
            <span class="metric-val text-lime">${talent.completedJobs} JOBS</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">RATING</span>
            <span class="metric-val">★ ${talent.rating.toFixed(1)} (${talent.reviewCount})</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">RESPONSE</span>
            <span class="metric-val">${talent.responseTime}</span>
          </div>
        </div>

        <!-- Action Footer -->
        <div class="card-action-footer">
          <div class="rate-badge">
            <span class="rate-label">STARTING AT</span>
            <span class="rate-price">${talent.currency}${talent.rateAmount} <small style="font-size:0.75rem; color:var(--text-muted);">/${talent.rateBasis}</small></span>
          </div>
          <div class="card-btns">
            <button type="button" class="btn-card-view" data-view-id="${talent.id}">View Profile</button>
            <button type="button" class="btn-card-hire" data-hire-id="${talent.id}">Send Brief</button>
          </div>
        </div>

      </article>
    `).join('');

    attachMarketplaceCardListeners();
  }

  function attachMarketplaceCardListeners() {
    // Audio Player Toggle
    document.querySelectorAll('.btn-play-sample').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const talentId = btn.getAttribute('data-talent-id');
        toggleAudioPlayback(talentId);
      });
    });

    // View Profile Drawer
    document.querySelectorAll('.btn-card-view').forEach(btn => {
      btn.addEventListener('click', () => {
        const talentId = btn.getAttribute('data-view-id');
        openTalentProfile(talentId);
      });
    });

    // Send Brief Modal
    document.querySelectorAll('.btn-card-hire').forEach(btn => {
      btn.addEventListener('click', () => {
        const talentId = btn.getAttribute('data-hire-id');
        openSendBriefModal(talentId);
      });
    });
  }

  // ==========================================================================
  // 7. Interactive Audio Sample Simulator
  // ==========================================================================
  function toggleAudioPlayback(talentId) {
    const playerContainer = document.getElementById(`player-${talentId}`);
    
    if (state.currentlyPlayingId === talentId) {
      // Pause
      stopAudioPlayback();
      return;
    }

    // Stop any previously playing
    stopAudioPlayback();

    // Start playing
    state.currentlyPlayingId = talentId;
    if (playerContainer) {
      playerContainer.classList.add('playing');
      const btn = playerContainer.querySelector('.btn-play-sample');
      if (btn) btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;
    }

    playSyntheticAudioSnippet();
  }

  function stopAudioPlayback() {
    if (state.currentlyPlayingId) {
      const prevContainer = document.getElementById(`player-${state.currentlyPlayingId}`);
      if (prevContainer) {
        prevContainer.classList.remove('playing');
        const btn = prevContainer.querySelector('.btn-play-sample');
        if (btn) btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
      }
      state.currentlyPlayingId = null;
    }
  }

  function playSyntheticAudioSnippet() {
    try {
      if (!state.audioContext) {
        state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (state.audioContext.state === 'suspended') {
        state.audioContext.resume();
      }
      
      const ctx = state.audioContext;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 2.5);
    } catch (err) {
      // AudioContext fallback
    }
  }

  // ==========================================================================
  // 8. Profile Drawer & Brief Modal
  // ==========================================================================
  function openTalentProfile(talentId) {
    const talent = talentRoster.find(t => t.id === talentId);
    if (!talent) return;

    dom.profileDrawerBody.innerHTML = `
      <div style="display:flex; align-items:center; gap:1.25rem; margin-bottom:1.5rem;">
        <div class="talent-avatar" style="width:64px; height:64px; font-size:1.4rem;">${talent.initials}</div>
        <div>
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <h2 style="font-family:var(--font-heading); font-size:1.6rem; font-weight:800;">${talent.name}</h2>
            <span class="badge-verified" style="font-size:1.1rem;">✦</span>
          </div>
          <p style="font-family:var(--font-mono); font-size:0.82rem; color:var(--text-secondary);">${talent.role.toUpperCase()} // ${talent.location}</p>
        </div>
      </div>

      <p style="font-size:0.95rem; color:var(--text-secondary); line-height:1.6; margin-bottom:1.5rem;">${talent.bio}</p>

      <div style="margin-bottom:1.5rem;">
        <h4 style="font-family:var(--font-mono); font-size:0.75rem; color:var(--lime-accent); letter-spacing:0.06em; margin-bottom:0.65rem;">VERIFIED LINER CREDITS</h4>
        <div style="display:flex; flex-wrap:wrap; gap:0.5rem;">
          ${talent.credits.map(c => `<span style="background:var(--bg-surface-elevated); border:1px solid var(--border-subtle); padding:0.35rem 0.75rem; border-radius:6px; font-size:0.8rem;">${c}</span>`).join('')}
        </div>
      </div>

      <div style="margin-bottom:1.5rem;">
        <h4 style="font-family:var(--font-mono); font-size:0.75rem; color:var(--lime-accent); letter-spacing:0.06em; margin-bottom:0.65rem;">FEATURED AUDIO STEM DEMO</h4>
        <div class="talent-audio-player playing" style="background:var(--bg-surface-elevated);">
          <div class="audio-track-info">
            <div class="track-name" style="font-size:0.9rem;">${talent.sampleTrack}</div>
            <div style="font-family:var(--font-mono); font-size:0.75rem; color:var(--text-muted);">${talent.sampleBpm} • 24-bit WAV Master</div>
          </div>
        </div>
      </div>

      <div style="display:flex; align-items:center; justify-content:space-between; background:var(--bg-surface-elevated); padding:1rem 1.25rem; border-radius:12px; border:1px solid var(--border-subtle); margin-bottom:1.5rem;">
        <div>
          <span style="font-family:var(--font-mono); font-size:0.7rem; color:var(--text-muted); display:block;">STARTING RATE</span>
          <span style="font-family:var(--font-mono); font-size:1.35rem; font-weight:800; color:var(--lime-accent);">${talent.currency}${talent.rateAmount} <small style="font-size:0.85rem; color:var(--text-secondary);">/${talent.rateBasis}</small></span>
        </div>
        <button type="button" class="btn-primary-lime" style="width:auto; height:44px; padding:0 1.5rem;" onclick="document.getElementById('btn-close-profile').click(); setTimeout(() => document.querySelector('[data-hire-id=\\'${talent.id}\\']').click(), 150);">
          <span>Send Project Brief</span>
        </button>
      </div>
    `;

    dom.profileModal.classList.remove('hidden');
  }

  function openSendBriefModal(talentId) {
    const talent = talentRoster.find(t => t.id === talentId);
    if (!talent) return;

    dom.briefTargetName.textContent = talent.name;
    dom.briefAgreedRate.value = talent.rateAmount;
    updateEscrowCalculation(talent.rateAmount);

    // Set default deadline to 7 days from now
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    document.getElementById('brief-deadline-date').value = nextWeek.toISOString().split('T')[0];

    dom.briefModal.classList.remove('hidden');
  }

  function updateEscrowCalculation(rate) {
    const val = parseFloat(rate) || 0;
    dom.briefDepositDisplay.textContent = `$${val.toFixed(2)}`;
    dom.briefTotalDisplay.textContent = `$${val.toFixed(2)}`;
  }

  function initModals() {
    // Close Profile
    dom.btnCloseProfile.addEventListener('click', () => {
      dom.profileModal.classList.add('hidden');
    });

    // Close Brief
    dom.btnCloseBrief.addEventListener('click', () => {
      dom.briefModal.classList.add('hidden');
    });

    // Rate Input Live Calculation
    dom.briefAgreedRate.addEventListener('input', (e) => {
      updateEscrowCalculation(e.target.value);
    });

    // Brief Submission
    dom.formSendBrief.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('brief-project-title').value.trim();
      const rate = dom.briefAgreedRate.value;
      const targetName = dom.briefTargetName.textContent;

      if (!title) {
        showToast('Please enter a project title.', 'alert');
        return;
      }

      dom.briefModal.classList.add('hidden');
      showToast(`Brief for "${title}" sent to ${targetName}. $${rate} locked in TalentHive Escrow.`, 'success');
    });

    // Backdrop clicks
    window.addEventListener('click', (e) => {
      if (e.target === dom.profileModal) dom.profileModal.classList.add('hidden');
      if (e.target === dom.briefModal) dom.briefModal.classList.add('hidden');
    });
  }

  // ==========================================================================
  // 9. Search & Filter Handlers
  // ==========================================================================
  function initFilters() {
    // Keyword Search
    dom.marketSearch.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.trim();
      renderMarketplaceRoster();
    });

    // Role Pills
    const pills = document.querySelectorAll('#filter-role-pills .filter-pill');
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        state.activeRoleFilter = pill.getAttribute('data-filter');
        renderMarketplaceRoster();
      });
    });
  }

  // ==========================================================================
  // 10. Toast Notification System
  // ==========================================================================
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="toast-icon-lime"><polyline points="20 6 9 17 4 12"/></svg>
      <span>${message}</span>
    `;

    dom.toastHub.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }

  // ==========================================================================
  // 11. App Bootstrap
  // ==========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    initOnboardingFlow();
    initFilters();
    initModals();
    renderMarketplaceRoster();
  });

})();
