/**
 * TalentHive — Sound Identity & Music Ecosystem Controller (ES6+)
 * 
 * Core UX Concept:
 * "You're not just creating an account. You're establishing your identity within the music ecosystem."
 * 
 * Features:
 * - Real-time 2-way reactive binding to the Live Sound Identity Card Preview
 * - Handle reservation & availability evaluator
 * - Analog dual-channel Stereo VU meter password entropy scoring
 * - Music ecosystem craft & role switcher
 * - Live stem & sync activity ledger
 * - Pure Canvas studio session lock-in confetti
 */

(function () {
  'use strict';

  // --- Ecosystem State ---
  const state = {
    role: 'creator', // 'creator' | 'industry'
    creditName: '',
    handle: '',
    craft: '',
    email: '',
    password: '',
    terms: false,
    isSubmitting: false
  };

  // --- DOM Element References ---
  const elements = {
    // Form & Card
    form: document.getElementById('signup-form'),
    card: document.querySelector('.form-glass-card'),
    btnSubmit: document.getElementById('btn-submit'),
    btnText: document.getElementById('btn-text'),
    btnLoader: document.getElementById('btn-loader'),

    // Role Switcher
    roleSelector: document.querySelector('.role-selector'),
    roleCreator: document.getElementById('role-creator'),
    roleIndustry: document.getElementById('role-industry'),
    roleCreatorLabel: document.getElementById('role-creator-label'),
    roleIndustryLabel: document.getElementById('role-industry-label'),

    // Inputs & Groups
    groupCreditName: document.getElementById('group-creditname'),
    inputCreditName: document.getElementById('creditname'),
    errorCreditName: document.getElementById('creditname-error'),

    groupHandle: document.getElementById('group-handle'),
    inputHandle: document.getElementById('handle'),
    handleBadge: document.getElementById('handle-badge'),
    errorHandle: document.getElementById('handle-error'),

    groupCraft: document.getElementById('group-craft'),
    selectCraft: document.getElementById('craft-select'),
    errorCraft: document.getElementById('craft-error'),

    groupEmail: document.getElementById('group-email'),
    inputEmail: document.getElementById('email'),
    errorEmail: document.getElementById('email-error'),

    // Password & Analog VU Meter
    groupPassword: document.getElementById('group-password'),
    inputPassword: document.getElementById('password'),
    errorPassword: document.getElementById('password-error'),
    btnTogglePassword: document.getElementById('btn-toggle-password'),
    iconEye: document.querySelector('.icon-eye'),
    iconEyeOff: document.querySelector('.icon-eye-off'),
    signalFidelity: document.getElementById('signal-fidelity'),
    
    // Stereo VU Segments
    vuLeftSegments: [
      document.getElementById('vu-l-1'),
      document.getElementById('vu-l-2'),
      document.getElementById('vu-l-3'),
      document.getElementById('vu-l-4'),
      document.getElementById('vu-l-5')
    ],
    vuRightSegments: [
      document.getElementById('vu-r-1'),
      document.getElementById('vu-r-2'),
      document.getElementById('vu-r-3'),
      document.getElementById('vu-r-4'),
      document.getElementById('vu-r-5')
    ],
    reqChips: {
      length: document.getElementById('req-length'),
      upper: document.getElementById('req-upper'),
      number: document.getElementById('req-number'),
      special: document.getElementById('req-special')
    },

    // Terms
    groupTerms: document.querySelector('.terms-group'),
    inputTerms: document.getElementById('terms'),
    errorTerms: document.getElementById('terms-error'),

    // Live Sound ID Card Elements (Reactive Preview)
    soundIdCard: document.getElementById('sound-id-card'),
    previewArtistName: document.getElementById('preview-artist-name'),
    previewHandle: document.getElementById('preview-handle'),
    previewCraftTag: document.getElementById('preview-craft-tag'),
    previewAvatarInitials: document.getElementById('preview-avatar-initials'),
    previewStatusPill: document.getElementById('preview-status-pill'),
    previewRoleSpec: document.getElementById('preview-role-spec'),

    // Live Ledger Ticker
    tickerText: document.getElementById('ticker-text'),
    tickerTime: document.getElementById('ticker-time'),

    // Success Modal
    modal: document.getElementById('success-modal'),
    summaryCreditName: document.getElementById('summary-credit-name'),
    summaryHandle: document.getElementById('summary-handle'),
    summaryCraft: document.getElementById('summary-craft'),
    btnModalClose: document.getElementById('btn-modal-close'),
    confettiCanvas: document.getElementById('confetti-canvas')
  };

  // --- Real-Time Music Ecosystem Ledger Feed ---
  const ecosystemEvents = [
    { text: '<strong>Maya Lin (Audio Architect)</strong> delivered <strong>master vocal stems</strong> to <strong>Warner Records</strong>', time: '1m ago' },
    { text: '<strong>Kairos Sound</strong> finalized a <strong>$12,000 sync license</strong> for an <strong>A24 Feature Film</strong>', time: '4m ago' },
    { text: '<strong>Elena Rostova</strong> accepted a <strong>Dolby Atmos Mix Engineer</strong> commission from <strong>Universal Music</strong>', time: '9m ago' },
    { text: '<strong>Devon Miller</strong> released <strong>session acoustic guitar splits</strong> to <strong>Atlantic Records</strong>', time: '15m ago' },
    { text: '<strong>Marcus Chen (Analog Lab)</strong> locked in a <strong>co-writing split sheet</strong> with <strong>Sony Masterworks</strong>', time: '22m ago' }
  ];
  let tickerIndex = 0;

  // ==========================================================================
  // 1. Reactive Sound Identity Card Binding
  // ==========================================================================
  function initReactiveIdentityCard() {
    // Artist / Credit Name Binding
    elements.inputCreditName.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      state.creditName = val;

      if (val.length > 0) {
        elements.previewArtistName.textContent = val;
        // Generate dynamic initials
        const initials = val.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
        elements.previewAvatarInitials.textContent = initials || 'TH';
        elements.previewStatusPill.textContent = 'RESERVED';
        elements.previewStatusPill.classList.add('active');
      } else {
        elements.previewArtistName.textContent = 'Your Artist / Credit Name';
        elements.previewAvatarInitials.textContent = 'TH';
        elements.previewStatusPill.textContent = 'UNCLAIMED';
        elements.previewStatusPill.classList.remove('active');
      }

      // Auto-suggest handle if handle is untouched
      if (!elements.inputHandle.value && val.length > 0) {
        const autoHandle = val.toLowerCase().replace(/[^a-z0-9]/g, '');
        elements.inputHandle.value = autoHandle;
        updateHandleUI(autoHandle);
      }
    });

    // Handle Reservation Binding
    elements.inputHandle.addEventListener('input', (e) => {
      // Clean handle (letters, numbers, underscore only)
      const cleanVal = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
      e.target.value = cleanVal;
      updateHandleUI(cleanVal);
    });

    // Craft Selection Binding
    elements.selectCraft.addEventListener('change', (e) => {
      const val = e.target.value;
      state.craft = val;
      if (val) {
        elements.previewCraftTag.innerHTML = `<span>${val}</span>`;
      } else {
        elements.previewCraftTag.innerHTML = `<span>Producer & Sound Architect</span>`;
      }
      validateCraft(false);
    });
  }

  function updateHandleUI(handleVal) {
    state.handle = handleVal;
    if (handleVal.length > 0) {
      elements.previewHandle.textContent = `talenthive.com/@${handleVal}`;
      elements.handleBadge.textContent = 'AVAILABLE';
      elements.handleBadge.style.color = 'var(--accent-emerald)';
      elements.handleBadge.style.borderColor = 'rgba(16, 185, 129, 0.35)';
      elements.handleBadge.style.background = 'rgba(16, 185, 129, 0.12)';
    } else {
      elements.previewHandle.textContent = 'talenthive.com/@handle';
      elements.handleBadge.textContent = 'Live URL';
      elements.handleBadge.style.color = 'var(--accent-amber)';
      elements.handleBadge.style.borderColor = 'rgba(245, 158, 11, 0.25)';
      elements.handleBadge.style.background = 'rgba(245, 158, 11, 0.1)';
    }
  }

  // ==========================================================================
  // 2. Music Ecosystem Role Switcher
  // ==========================================================================
  function initRoleSwitcher() {
    function setRole(newRole) {
      state.role = newRole;

      if (newRole === 'creator') {
        elements.roleSelector.classList.remove('is-industry');
        elements.roleCreatorLabel.classList.add('active');
        elements.roleIndustryLabel.classList.remove('active');
        elements.roleCreator.checked = true;

        elements.previewRoleSpec.textContent = 'CREATOR / ARTIST';
        elements.btnText.textContent = 'Lock In Sound Identity';
      } else {
        elements.roleSelector.classList.add('is-industry');
        elements.roleIndustryLabel.classList.add('active');
        elements.roleCreatorLabel.classList.remove('active');
        elements.roleIndustry.checked = true;

        elements.previewRoleSpec.textContent = 'LABEL / A&R / SYNC';
        elements.btnText.textContent = 'Register Executive Vault';
      }
    }

    elements.roleCreator.addEventListener('change', () => setRole('creator'));
    elements.roleIndustry.addEventListener('change', () => setRole('industry'));
    elements.roleCreatorLabel.addEventListener('click', () => setRole('creator'));
    elements.roleIndustryLabel.addEventListener('click', () => setRole('industry'));
  }

  // ==========================================================================
  // 3. Password Visibility & Analog VU Meter Engine
  // ==========================================================================
  function initPasswordFeatures() {
    // Visibility toggle
    elements.btnTogglePassword.addEventListener('click', () => {
      const isPassword = elements.inputPassword.getAttribute('type') === 'password';
      elements.inputPassword.setAttribute('type', isPassword ? 'text' : 'password');
      elements.btnTogglePassword.setAttribute('aria-pressed', isPassword ? 'true' : 'false');
      elements.btnTogglePassword.setAttribute('aria-label', isPassword ? 'Hide passphrase' : 'Show passphrase');
      elements.iconEye.classList.toggle('hidden', isPassword);
      elements.iconEyeOff.classList.toggle('hidden', !isPassword);
    });

    // Real-Time VU Meter Evaluation
    elements.inputPassword.addEventListener('input', () => {
      const val = elements.inputPassword.value;
      state.password = val;
      const metrics = calculateSignalEntropy(val);
      updateVUMeterUI(metrics);
      validatePassword(false);
    });
  }

  function calculateSignalEntropy(pass) {
    const checks = {
      length: pass.length >= 8,
      upper: /[A-Z]/.test(pass),
      number: /[0-9]/.test(pass),
      special: /[^A-Za-z0-9]/.test(pass)
    };

    let score = 0;
    if (checks.length) score++;
    if (checks.upper) score++;
    if (checks.number) score++;
    if (checks.special) score++;

    // Extra fidelity bonus for 12+ chars
    if (pass.length >= 12 && score === 4) score = 5;
    if (pass.length === 0) score = 0;

    return { checks, score, length: pass.length };
  }

  function updateVUMeterUI({ checks, score }) {
    // Update Requirement Chips
    elements.reqChips.length.classList.toggle('valid', checks.length);
    elements.reqChips.upper.classList.toggle('valid', checks.upper);
    elements.reqChips.number.classList.toggle('valid', checks.number);
    elements.reqChips.special.classList.toggle('valid', checks.special);

    // Reset all VU segments
    elements.vuLeftSegments.forEach(seg => { seg.className = 'vu-segment'; });
    elements.vuRightSegments.forEach(seg => { seg.className = 'vu-segment'; });

    const fidelityLevels = [
      { text: 'Signal: Noise Floor (-inf dB)', color: 'var(--text-muted)' },
      { text: 'Signal: Lo-Fi Tracking (-18dB)', color: '#06b6d4' },
      { text: 'Signal: Studio Session (-12dB)', color: '#10b981' },
      { text: 'Signal: Master Bus Ready (-3dB)', color: 'var(--accent-amber)' },
      { text: 'Signal: Broadcast Quality (0dB Peak)', color: '#f97316' },
      { text: 'Signal: Master Grade (32-bit Float)', color: 'var(--accent-emerald)' }
    ];

    const currentFidelity = fidelityLevels[score] || fidelityLevels[0];
    elements.signalFidelity.textContent = currentFidelity.text;
    elements.signalFidelity.style.color = currentFidelity.color;

    // Light up VU channels
    for (let i = 0; i < score; i++) {
      const tierClass = `tier-${i + 1}`;
      if (elements.vuLeftSegments[i]) elements.vuLeftSegments[i].classList.add(tierClass);
      if (elements.vuRightSegments[i]) elements.vuRightSegments[i].classList.add(tierClass);
    }
  }

  // ==========================================================================
  // 4. Validation Engine
  // ==========================================================================
  function setFieldState(group, errorEl, isValid, message = '') {
    if (isValid) {
      group.classList.remove('is-invalid');
      group.classList.add('is-valid');
      errorEl.textContent = '';
    } else {
      group.classList.remove('is-valid');
      group.classList.add('is-invalid');
      errorEl.textContent = message;
    }
  }

  function validateCreditName(showError = true) {
    const val = elements.inputCreditName.value.trim();
    if (val.length < 2) {
      if (showError) setFieldState(elements.groupCreditName, elements.errorCreditName, false, 'Please enter your professional artist or studio credit name');
      return false;
    }
    setFieldState(elements.groupCreditName, elements.errorCreditName, true);
    return true;
  }

  function validateHandle(showError = true) {
    const val = elements.inputHandle.value.trim();
    if (val.length < 3) {
      if (showError) setFieldState(elements.groupHandle, elements.errorHandle, false, 'Handle must be at least 3 characters long');
      return false;
    }
    setFieldState(elements.groupHandle, elements.errorHandle, true);
    return true;
  }

  function validateCraft(showError = true) {
    const val = elements.selectCraft.value;
    if (!val) {
      if (showError) setFieldState(elements.groupCraft, elements.errorCraft, false, 'Please select your primary audio discipline');
      return false;
    }
    setFieldState(elements.groupCraft, elements.errorCraft, true);
    return true;
  }

  function validateEmail(showError = true) {
    const val = elements.inputEmail.value.trim();
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    
    if (!val || !emailRegex.test(val)) {
      if (showError) setFieldState(elements.groupEmail, elements.errorEmail, false, 'Please enter a valid studio or representative email');
      return false;
    }
    setFieldState(elements.groupEmail, elements.errorEmail, true);
    return true;
  }

  function validatePassword(showError = true) {
    const val = elements.inputPassword.value;
    const { score } = calculateSignalEntropy(val);

    if (val.length < 8) {
      if (showError) setFieldState(elements.groupPassword, elements.errorPassword, false, 'Passphrase must contain at least 8 characters');
      return false;
    }

    if (score < 3) {
      if (showError) setFieldState(elements.groupPassword, elements.errorPassword, false, 'Passphrase signal fidelity too low. Fulfill at least 3 audio requirements');
      return false;
    }

    setFieldState(elements.groupPassword, elements.errorPassword, true);
    return true;
  }

  function validateTerms(showError = true) {
    const isChecked = elements.inputTerms.checked;
    if (!isChecked) {
      if (showError) {
        elements.groupTerms.classList.add('is-invalid');
        elements.errorTerms.textContent = 'Please agree to the Ecosystem Charter & Stem Escrow Standards';
      }
      return false;
    }
    elements.groupTerms.classList.remove('is-invalid');
    elements.errorTerms.textContent = '';
    return true;
  }

  function initValidationListeners() {
    elements.inputCreditName.addEventListener('blur', () => validateCreditName(true));
    elements.inputHandle.addEventListener('blur', () => validateHandle(true));
    elements.selectCraft.addEventListener('blur', () => validateCraft(true));
    elements.inputEmail.addEventListener('blur', () => validateEmail(true));
    elements.inputPassword.addEventListener('blur', () => validatePassword(true));
    elements.inputTerms.addEventListener('change', () => validateTerms(true));
  }

  // ==========================================================================
  // 5. Form Submission & State Management
  // ==========================================================================
  function initFormSubmit() {
    elements.form.addEventListener('submit', (e) => {
      e.preventDefault();

      const isNameValid = validateCreditName(true);
      const isHandleValid = validateHandle(true);
      const isCraftValid = validateCraft(true);
      const isEmailValid = validateEmail(true);
      const isPassValid = validatePassword(true);
      const isTermsValid = validateTerms(true);

      const isFormValid = isNameValid && isHandleValid && isCraftValid && isEmailValid && isPassValid && isTermsValid;

      if (!isFormValid) {
        elements.card.classList.remove('shake-error');
        void elements.card.offsetWidth;
        elements.card.classList.add('shake-error');

        if (!isNameValid) elements.inputCreditName.focus();
        else if (!isHandleValid) elements.inputHandle.focus();
        else if (!isCraftValid) elements.selectCraft.focus();
        else if (!isEmailValid) elements.inputEmail.focus();
        else if (!isPassValid) elements.inputPassword.focus();
        else if (!isTermsValid) elements.inputTerms.focus();
        return;
      }

      // Enter Loading State
      setLoadingState(true);

      setTimeout(() => {
        setLoadingState(false);
        showSuccessModal();
        triggerStudioConfetti();
      }, 1300);
    });

    elements.btnModalClose.addEventListener('click', () => {
      elements.modal.classList.add('hidden');
    });
  }

  function setLoadingState(isLoading) {
    state.isSubmitting = isLoading;
    elements.btnSubmit.disabled = isLoading;
    elements.btnText.classList.toggle('hidden', isLoading);
    elements.btnLoader.classList.toggle('hidden', !isLoading);
  }

  function showSuccessModal() {
    elements.summaryCreditName.textContent = elements.inputCreditName.value.trim();
    elements.summaryHandle.textContent = `talenthive.com/@${elements.inputHandle.value.trim()}`;
    elements.summaryCraft.textContent = elements.selectCraft.value;
    elements.modal.classList.remove('hidden');
  }

  // ==========================================================================
  // 6. Live Ledger Ticker
  // ==========================================================================
  function initLedgerTicker() {
    setInterval(() => {
      tickerIndex = (tickerIndex + 1) % ecosystemEvents.length;
      const ev = ecosystemEvents[tickerIndex];
      
      elements.tickerText.style.opacity = '0';
      setTimeout(() => {
        elements.tickerText.innerHTML = ev.text;
        elements.tickerTime.textContent = ev.time;
        elements.tickerText.style.transition = 'opacity 0.3s ease';
        elements.tickerText.style.opacity = '1';
      }, 300);
    }, 5500);
  }

  // ==========================================================================
  // 7. Studio Gold & Cyan Confetti Burst
  // ==========================================================================
  function triggerStudioConfetti() {
    const canvas = elements.confettiCanvas;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#f59e0b', '#fbbf24', '#38bdf8', '#06b6d4', '#ef4444', '#10b981', '#ffffff'];

    for (let i = 0; i < 120; i++) {
      particles.push({
        x: width / 2 + (Math.random() - 0.5) * 160,
        y: height * 0.45 + (Math.random() - 0.5) * 80,
        size: Math.random() * 7 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 0.5) * 15 - 5,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
        opacity: 1,
        decay: Math.random() * 0.012 + 0.008
      });
    }

    let animationFrame;
    function render() {
      ctx.clearRect(0, 0, width, height);

      let alive = false;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.32;
        p.vx *= 0.98;
        p.rotation += p.rotSpeed;
        p.opacity -= p.decay;

        if (p.opacity > 0) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          ctx.restore();
        }
      }

      if (alive) {
        animationFrame = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, width, height);
        cancelAnimationFrame(animationFrame);
      }
    }

    render();
  }

  // --- Initialize on Ready ---
  document.addEventListener('DOMContentLoaded', () => {
    initReactiveIdentityCard();
    initRoleSwitcher();
    initPasswordFeatures();
    initValidationListeners();
    initFormSubmit();
    initLedgerTicker();
  });

})();
