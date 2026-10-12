/**
 * NOVA SHOP - E-COMMERCE ENGINE & SECURE PASSWORD STUDIO
 * 100% Client-Side Vanilla JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  // ============================================================================
  // 1. DYNAMIC AMBIENT BACKGROUND CANVAS
  // ============================================================================
  
  function initAmbientBackground() {
    const canvas = document.getElementById('ambientCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particleCount = Math.min(42, Math.floor((width * height) / 28000) + 10);
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2 + 1,
        color: Math.random() > 0.5 ? '99, 102, 241' : '16, 185, 129'
      });
    }

    let mouseX = -1000;
    let mouseY = -1000;
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });
    window.addEventListener('mouseleave', () => {
      mouseX = -1000;
      mouseY = -1000;
    });

    function render() {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        else if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        else if (p.y > height) p.y = 0;

        // Particle point
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, 0.5)`;
        ctx.fill();

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            const alpha = (1 - dist / 130) * 0.12;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        // Connection to cursor
        const cdx = p.x - mouseX;
        const cdy = p.y - mouseY;
        const cDist = Math.sqrt(cdx * cdx + cdy * cdy);
        if (cDist < 160) {
          const cAlpha = (1 - cDist / 160) * 0.25;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouseX, mouseY);
          ctx.strokeStyle = `rgba(99, 102, 241, ${cAlpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      requestAnimationFrame(render);
    }

    render();
  }

  initAmbientBackground();

  // ============================================================================
  // 2. SECURE PASSWORD GENERATOR STUDIO
  // ============================================================================

  // Output and action elements
  const passwordOutput = document.getElementById('passwordOutput');
  const toggleVisibilityBtn = document.getElementById('toggleVisibilityBtn');
  const eyeIcon = document.getElementById('eyeIcon');
  const regenerateBtn = document.getElementById('regenerateBtn');
  const syncIcon = document.getElementById('syncIcon');
  const copyBtn = document.getElementById('copyBtn');
  const copyBtnText = document.getElementById('copyBtnText');

  // Length slider and quick pills
  const lengthSlider = document.getElementById('lengthSlider');
  const lengthValue = document.getElementById('lengthValue');
  const presetPills = document.querySelectorAll('.len-pill');

  // Character Type Options (Questions asked from user)
  const optNumbers = document.getElementById('optNumbers');
  const optSymbols = document.getElementById('optSymbols');
  const optUppercase = document.getElementById('optUppercase');
  const optLowercase = document.getElementById('optLowercase');
  const allOptionCheckboxes = [optNumbers, optSymbols, optUppercase, optLowercase];

  // Touch Make Password Button
  const generateBtn = document.getElementById('generateBtn');

  // Status Alerts, Retry, and Toast
  const statusAlert = document.getElementById('statusAlert');
  const alertIconBox = document.getElementById('alertIconBox');
  const alertMessageText = document.getElementById('alertMessageText');
  const retrySelectionBtn = document.getElementById('retrySelectionBtn');
  const toastNotification = document.getElementById('toastNotification');
  const toastMessage = document.getElementById('toastMessage');

  // Strength Meter Elements
  const strengthLabel = document.getElementById('strengthLabel');
  const meterBars = [
    document.getElementById('meterBar1'),
    document.getElementById('meterBar2'),
    document.getElementById('meterBar3'),
    document.getElementById('meterBar4')
  ];

  // Character Sets (strictly includes user requirements: digits, sym ?><{}[]!@#, capital)
  const CHARACTERS = {
    numbers: '0123456789',
    symbols: '?><{}[]!@#$%^&*()-_+=~',
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz'
  };

  let currentPassword = '';
  let toastTimeout = null;

  /**
   * Cryptographically secure random integer generator using Web Crypto API
   */
  function getSecureRandomInt(max) {
    if (max <= 0) return 0;
    const array = new Uint32Array(1);
    const maxUint32 = 0xFFFFFFFF;
    const limit = maxUint32 - (maxUint32 % max);
    let rand;
    do {
      window.crypto.getRandomValues(array);
      rand = array[0];
    } while (rand >= limit);
    return rand % max;
  }

  /**
   * Secure Fisher-Yates shuffle
   */
  function secureShuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = getSecureRandomInt(i + 1);
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  }

  /**
   * Main Password Generation Function
   */
  function generatePassword() {
    const wantNumbers = optNumbers && optNumbers.checked;
    const wantSymbols = optSymbols && optSymbols.checked;
    const wantUppercase = optUppercase && optUppercase.checked;
    const wantLowercase = optLowercase && optLowercase.checked;
    const targetLength = parseInt(lengthSlider ? lengthSlider.value : 8, 10);

    // Validation: "seid error or try again if dont chice digits or num or sym"
    const selectedSets = [];
    if (wantNumbers) selectedSets.push(CHARACTERS.numbers);
    if (wantSymbols) selectedSets.push(CHARACTERS.symbols);
    if (wantUppercase) selectedSets.push(CHARACTERS.uppercase);
    if (wantLowercase) selectedSets.push(CHARACTERS.lowercase);

    if (selectedSets.length === 0) {
      // Show explicit error & provide "Try Again" button
      showStatusAlert('error', '⚠️ Error: Please select at least one character type (digits, numbers, or symbols)!', true);
      currentPassword = '';
      if (passwordOutput) {
        passwordOutput.value = '';
        passwordOutput.placeholder = '⚠️ Selection required. Please select options...';
      }
      updateStrengthMeter(0);
      return null;
    }

    // Clear old errors when options are valid
    clearStatusAlert();

    // Pool from selected groups
    const fullPool = selectedSets.join('');

    // Guarantee that every selected group is represented
    const resultChars = [];
    selectedSets.forEach(charSet => {
      const idx = getSecureRandomInt(charSet.length);
      resultChars.push(charSet[idx]);
    });

    // Fill remaining characters
    while (resultChars.length < targetLength) {
      const idx = getSecureRandomInt(fullPool.length);
      resultChars.push(fullPool[idx]);
    }

    // Cryptographically secure shuffle
    secureShuffle(resultChars);

    currentPassword = resultChars.join('');

    if (passwordOutput) {
      passwordOutput.value = currentPassword;
      passwordOutput.placeholder = 'Your password will appear here...';
    }

    // Evaluate strength
    evaluateStrength(currentPassword, wantNumbers, wantSymbols, wantUppercase, wantLowercase);

    return currentPassword;
  }

  /**
   * Password Strength Evaluation
   */
  function evaluateStrength(password, hasNum, hasSym, hasUpper, hasLower) {
    const length = password.length;
    let typeCount = 0;
    if (hasNum) typeCount++;
    if (hasSym) typeCount++;
    if (hasUpper) typeCount++;
    if (hasLower) typeCount++;

    let score = 1;
    if (length < 10) {
      score = typeCount <= 2 ? 1 : 2;
    } else if (length < 16) {
      if (typeCount <= 2) score = 2;
      else if (typeCount === 3) score = 3;
      else score = 4;
    } else {
      if (typeCount <= 1) score = 2;
      else if (typeCount === 2) score = 3;
      else score = 4;
    }

    updateStrengthMeter(score);
  }

  function updateStrengthMeter(score) {
    meterBars.forEach(bar => {
      if (bar) bar.className = 'meter-bar';
    });

    if (score === 0) {
      if (strengthLabel) {
        strengthLabel.textContent = 'None';
        strengthLabel.className = 'strength-tag';
      }
      return;
    }

    const configs = [
      { label: 'Weak', className: 'weak', barClass: 'active-weak', count: 1 },
      { label: 'Medium', className: 'medium', barClass: 'active-medium', count: 2 },
      { label: 'Strong', className: 'strong', barClass: 'active-strong', count: 3 },
      { label: 'Very Strong', className: 'very-strong', barClass: 'active-very-strong', count: 4 }
    ];

    const current = configs[score - 1];
    if (strengthLabel) {
      strengthLabel.textContent = current.label;
      strengthLabel.className = `strength-tag ${current.className}`;
    }

    for (let i = 0; i < current.count; i++) {
      if (meterBars[i]) meterBars[i].classList.add(current.barClass);
    }
  }

  /**
   * Clipboard Copy Feature: "users can copy their password after that site sayd coped"
   */
  function copyPasswordToClipboard() {
    if (!currentPassword || !passwordOutput || passwordOutput.value.trim() === '') {
      showStatusAlert('error', '⚠️ Please generate a password first.', false);
      return;
    }

    function onCopiedSuccess() {
      // Site said copied
      if (copyBtnText) copyBtnText.textContent = 'Copied! ✓';
      if (copyBtn) copyBtn.classList.add('copied');

      showStatusAlert('success', '✓ Password copied successfully to clipboard!', false);
      showToast('✓ Password copied successfully!');

      setTimeout(() => {
        if (copyBtnText) copyBtnText.textContent = 'Copy';
        if (copyBtn) copyBtn.classList.remove('copied');
      }, 2400);
    }

    function onCopiedFail() {
      showStatusAlert('error', 'Copy failed. Please try again.', false);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(currentPassword)
        .then(onCopiedSuccess)
        .catch(() => fallbackCopy(currentPassword, onCopiedSuccess, onCopiedFail));
    } else {
      fallbackCopy(currentPassword, onCopiedSuccess, onCopiedFail);
    }
  }

  function fallbackCopy(text, onSuccess, onFail) {
    try {
      const tempArea = document.createElement('textarea');
      tempArea.value = text;
      tempArea.style.position = 'fixed';
      tempArea.style.left = '-9999px';
      document.body.appendChild(tempArea);
      tempArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(tempArea);
      if (success) onSuccess();
      else onFail();
    } catch (e) {
      onFail();
    }
  }

  /**
   * Reset & Try Again Helper: "seid error or try again if dont chice digits or num or sym"
   */
  function resetAndTryAgain() {
    if (optNumbers) optNumbers.checked = true;
    if (optSymbols) optSymbols.checked = true;
    if (optUppercase) optUppercase.checked = true;
    if (optLowercase) optLowercase.checked = true;

    setLength(8);
    clearStatusAlert();
    generatePassword();
    showToast('✓ Default options restored & 8-char password generated!');
  }

  function setLength(newLen) {
    const val = Math.max(8, Math.min(32, newLen));
    if (lengthSlider) lengthSlider.value = val;
    if (lengthValue) lengthValue.textContent = val;

    presetPills.forEach(pill => {
      const pillLen = parseInt(pill.dataset.length, 10);
      pill.classList.toggle('active', pillLen === val);
    });

    generatePassword();
  }

  /**
   * Alert Notification Box
   */
  function showStatusAlert(type, message, showRetryBtn) {
    if (!statusAlert) return;
    statusAlert.className = `status-alert ${type}`;
    if (alertMessageText) alertMessageText.textContent = message;

    if (alertIconBox) {
      if (type === 'error') {
        alertIconBox.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color:var(--color-error);">
            <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        `;
      } else {
        alertIconBox.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color:var(--color-success);">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        `;
      }
    }

    if (retrySelectionBtn) {
      retrySelectionBtn.style.display = showRetryBtn ? 'inline-block' : 'none';
    }
  }

  function clearStatusAlert() {
    if (statusAlert) statusAlert.className = 'status-alert';
    if (alertMessageText) alertMessageText.textContent = '';
    if (alertIconBox) alertIconBox.innerHTML = '';
    if (retrySelectionBtn) retrySelectionBtn.style.display = 'none';
  }

  function showToast(msg) {
    if (!toastNotification) return;
    if (toastMessage) toastMessage.textContent = msg;
    toastNotification.classList.add('show');

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toastNotification.classList.remove('show');
    }, 2800);
  }

  // Visibility Toggle
  function toggleVisibility() {
    if (!passwordOutput) return;
    const isPass = passwordOutput.type === 'password';
    passwordOutput.type = isPass ? 'text' : 'password';

    if (eyeIcon) {
      if (isPass) {
        eyeIcon.innerHTML = `
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        `;
        toggleVisibilityBtn.title = 'Hide password';
      } else {
        eyeIcon.innerHTML = `
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
          <line x1="1" y1="1" x2="23" y2="23"></line>
        `;
        toggleVisibilityBtn.title = 'Show password';
      }
    }
  }

  // Event Listeners for Password Studio
  if (generateBtn) generateBtn.addEventListener('click', generatePassword);

  if (regenerateBtn) {
    regenerateBtn.addEventListener('click', () => {
      if (syncIcon) {
        syncIcon.classList.add('spinning');
        setTimeout(() => syncIcon.classList.remove('spinning'), 500);
      }
      generatePassword();
    });
  }

  if (copyBtn) copyBtn.addEventListener('click', copyPasswordToClipboard);
  if (toggleVisibilityBtn) toggleVisibilityBtn.addEventListener('click', toggleVisibility);
  if (retrySelectionBtn) retrySelectionBtn.addEventListener('click', resetAndTryAgain);

  if (lengthSlider) {
    lengthSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      if (lengthValue) lengthValue.textContent = val;
      presetPills.forEach(pill => {
        const pillLen = parseInt(pill.dataset.length, 10);
        pill.classList.toggle('active', pillLen === val);
      });
      generatePassword();
    });
  }

  presetPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const len = parseInt(pill.dataset.length, 10);
      setLength(len);
    });
  });

  allOptionCheckboxes.forEach(cb => {
    if (cb) {
      cb.addEventListener('change', () => {
        const hasAny = allOptionCheckboxes.some(c => c && c.checked);
        if (hasAny) {
          clearStatusAlert();
          generatePassword();
        } else {
          showStatusAlert('error', '⚠️ Error: Please select at least one character type (digits, numbers, or symbols)!', true);
          currentPassword = '';
          if (passwordOutput) {
            passwordOutput.value = '';
            passwordOutput.placeholder = '⚠️ Please select options above...';
          }
          updateStrengthMeter(0);
        }
      });
    }
  });

  // Initial startup generation: 8 characters with digits for UI user
  generatePassword();

  // ============================================================================
  // 3. ONLINE SHOP PRODUCTS & SHOPPING CART ENGINE
  // ============================================================================

  const PRODUCTS = [
    {
      id: 'prod-1',
      name: 'NOVA Hardware Key Vault Pro',
      category: 'Hardware Security',
      emoji: '🔑',
      price: 79.00,
      oldPrice: 99.00,
      badge: 'Bestseller',
      desc: 'FIPS 140-2 Level 3 certified hardware authentication token with USB-C and NFC.',
      rating: 4.9,
      reviews: 428
    },
    {
      id: 'prod-2',
      name: 'Aura Wireless ANC Headphones',
      category: 'Audio Gear',
      emoji: '🎧',
      price: 189.00,
      oldPrice: 229.00,
      badge: '20% OFF',
      desc: 'Spatial audio with 40-hour battery life and custom acoustic noise cancellation.',
      rating: 4.8,
      reviews: 312
    },
    {
      id: 'prod-3',
      name: 'Apex Cyber Mechanical Keyboard',
      category: 'Peripherals',
      emoji: '⌨️',
      price: 129.00,
      oldPrice: 159.00,
      badge: 'Trending',
      desc: 'Gasket-mounted hot-swappable tactile switches with wireless Bluetooth 5.3.',
      rating: 4.9,
      reviews: 580
    },
    {
      id: 'prod-4',
      name: 'Titanium Encrypted SSD 1TB',
      category: 'Storage',
      emoji: '💾',
      price: 149.00,
      oldPrice: 189.00,
      badge: 'Top Rated',
      desc: 'Hardware AES-256 encrypted portable solid state drive with 2000 MB/s read speed.',
      rating: 4.9,
      reviews: 215
    },
    {
      id: 'prod-5',
      name: 'Quantum Smart Fitness Tracker',
      category: 'Wearables',
      emoji: '⌚',
      price: 59.00,
      oldPrice: 79.00,
      badge: 'Hot Deal',
      desc: 'AMOLED continuous heart rate, SpO2 sensor, and 14-day ultra battery reserve.',
      rating: 4.7,
      reviews: 640
    },
    {
      id: 'prod-6',
      name: 'Omni GaN Fast Charger 100W',
      category: 'Power & Tech',
      emoji: '⚡',
      price: 45.00,
      oldPrice: 59.00,
      badge: 'New',
      desc: 'Compact 4-port fast charger supporting laptops, phones, and tablets simultaneously.',
      rating: 4.8,
      reviews: 189
    }
  ];

  let cart = [];

  // Render Shop Products Grid
  const productsGrid = document.getElementById('productsGrid');
  if (productsGrid) {
    productsGrid.innerHTML = PRODUCTS.map(p => `
      <article class="product-card" data-id="${p.id}">
        <span class="product-card-badge">${p.badge}</span>
        <div class="product-img-wrapper">
          <span class="product-emoji-hero">${p.emoji}</span>
        </div>
        <div class="product-card-body">
          <span class="product-cat">${p.category}</span>
          <h3 class="product-name">${p.name}</h3>
          <p class="product-desc">${p.desc}</p>
          <div class="product-rating">
            <span class="rating-stars">★★★★★</span>
            <span>${p.rating} (${p.reviews})</span>
          </div>
          <div class="product-footer-row">
            <div class="product-prices">
              <span class="product-price-current">$${p.price.toFixed(2)}</span>
              <span class="product-price-old">$${p.oldPrice.toFixed(2)}</span>
            </div>
            <button type="button" class="btn-add-to-cart" onclick="window.addToCart('${p.id}', this)">
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      </article>
    `).join('');
  }

  // Shopping Cart Drawer Controls
  const cartToggleBtn = document.getElementById('cartToggleBtn');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const cartBadge = document.getElementById('cartBadge');
  const drawerCartCount = document.getElementById('drawerCartCount');
  const cartItemsList = document.getElementById('cartItemsList');
  const cartEmptyState = document.getElementById('cartEmptyState');
  const cartDrawerFooter = document.getElementById('cartDrawerFooter');
  const cartSubtotalVal = document.getElementById('cartSubtotalVal');
  const checkoutBtn = document.getElementById('checkoutBtn');

  function openCart() {
    if (cartDrawer && cartOverlay) {
      cartDrawer.classList.add('open');
      cartOverlay.classList.add('open');
    }
  }

  function closeCart() {
    if (cartDrawer && cartOverlay) {
      cartDrawer.classList.remove('open');
      cartOverlay.classList.remove('open');
    }
  }

  if (cartToggleBtn) cartToggleBtn.addEventListener('click', openCart);
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  // Global Add to Cart
  window.addToCart = function(productId, btnEl) {
    const prod = PRODUCTS.find(p => p.id === productId);
    if (!prod) return;

    const existing = cart.find(item => item.id === productId);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ ...prod, qty: 1 });
    }

    // Button feedback
    if (btnEl) {
      btnEl.classList.add('added');
      btnEl.innerHTML = '<span>Added! ✓</span>';
      setTimeout(() => {
        btnEl.classList.remove('added');
        btnEl.innerHTML = '<span>Add to Cart</span>';
      }, 1500);
    }

    renderCart();
    showToast(`🛍️ Added "${prod.name}" to cart!`);
  };

  window.changeQty = function(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
      cart = cart.filter(i => i.id !== productId);
    }
    renderCart();
  };

  function renderCart() {
    const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    if (cartBadge) cartBadge.textContent = totalCount;
    if (drawerCartCount) drawerCartCount.textContent = `${totalCount} item${totalCount === 1 ? '' : 's'}`;

    if (cart.length === 0) {
      if (cartEmptyState) cartEmptyState.style.display = 'flex';
      if (cartDrawerFooter) cartDrawerFooter.style.display = 'none';
      if (cartItemsList) {
        cartItemsList.innerHTML = `
          <div class="cart-empty-message" id="cartEmptyState">
            <span class="empty-icon">🛍️</span>
            <p>Your shopping cart is currently empty.</p>
            <a href="#shop-section" class="btn btn-sm btn-primary-store" onclick="closeCart()">Start Shopping</a>
          </div>
        `;
      }
      return;
    }

    if (cartEmptyState) cartEmptyState.style.display = 'none';
    if (cartDrawerFooter) cartDrawerFooter.style.display = 'flex';
    if (cartSubtotalVal) cartSubtotalVal.textContent = `$${subtotal.toFixed(2)}`;

    if (cartItemsList) {
      cartItemsList.innerHTML = cart.map(item => `
        <div class="cart-item">
          <div class="cart-item-thumb">${item.emoji}</div>
          <div class="cart-item-info">
            <h4 class="cart-item-title">${item.name}</h4>
            <div class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</div>
          </div>
          <div class="cart-item-qty">
            <button type="button" class="btn-qty" onclick="window.changeQty('${item.id}', -1)">−</button>
            <span style="font-weight:700; font-size:0.85rem; min-width:18px; text-align:center;">${item.qty}</span>
            <button type="button" class="btn-qty" onclick="window.changeQty('${item.id}', 1)">+</button>
          </div>
        </div>
      `).join('');
    }
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      showToast('🔒 Redirecting to 256-bit SSL encrypted checkout...');
      setTimeout(() => {
        alert('Thank you! Demo checkout completed. Your credentials and order are 100% secure.');
        cart = [];
        renderCart();
        closeCart();
      }, 1200);
    });
  }
});
