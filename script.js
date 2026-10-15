/* ════════════════════════════════════════════
   SOLTLESS — script.js (v2)
════════════════════════════════════════════ */

// ── COUNTDOWN ───────────────────────────────
(function(){
  const target = new Date();
  target.setDate(target.getDate() + 6);
  target.setHours(target.getHours() + 18);
  target.setMinutes(target.getMinutes() + 32);
  target.setSeconds(target.getSeconds() + 10);

  const pad = n => String(Math.max(0,n)).padStart(2,'0');

  function tick(){
    const diff = target - Date.now();
    if(diff <= 0){
      ['days','hours','minutes','seconds'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.textContent = '00';
      });
      return;
    }
    const d = Math.floor(diff/864e5);
    const h = Math.floor((diff%864e5)/36e5);
    const m = Math.floor((diff%36e5)/6e4);
    const s = Math.floor((diff%6e4)/1e3);
    const dEl = document.getElementById('days');
    const hEl = document.getElementById('hours');
    const mEl = document.getElementById('minutes');
    const sEl = document.getElementById('seconds');
    if(dEl) dEl.textContent = pad(d);
    if(hEl) hEl.textContent = pad(h);
    if(mEl) mEl.textContent = pad(m);
    if(sEl) sEl.textContent = pad(s);
  }
  tick();
  setInterval(tick, 1000);
})();

// ── NAVBAR SCROLL ────────────────────────────
(function(){
  const nav = document.getElementById('navbar');
  if(!nav) return;
  window.addEventListener('scroll', ()=>{
    nav.style.background = window.scrollY > 30
      ? 'rgba(6,8,16,0.98)'
      : 'rgba(6,8,16,0.85)';
  }, {passive:true});
})();

// ── MOBILE MENU ──────────────────────────────
(function(){
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('navLinks');
  if(!btn || !menu) return;

  // Inject mobile styles
  const s = document.createElement('style');
  s.textContent = `
    @media(max-width:768px){
      .nav-links.open{
        display:flex!important;
        flex-direction:column;
        position:fixed;
        top:60px;left:0;right:0;
        background:rgba(6,8,16,0.98);
        backdrop-filter:blur(16px);
        padding:28px 24px;
        gap:22px;
        border-bottom:1px solid rgba(59,130,246,0.15);
        z-index:998;
        animation:slideDown .3s ease;
      }
      .nav-links.open a{font-size:0.85rem;color:#fff;}
      @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
      .hamburger.active span:first-child{transform:translateY(7px) rotate(45deg);}
      .hamburger.active span:nth-child(2){opacity:0;}
      .hamburger.active span:last-child{transform:translateY(-7px) rotate(-45deg);}
    }
  `;
  document.head.appendChild(s);

  btn.addEventListener('click', ()=>{
    const open = menu.classList.toggle('open');
    btn.classList.toggle('active', open);
  });
  menu.querySelectorAll('a').forEach(a=>{
    a.addEventListener('click',()=>{
      menu.classList.remove('open');
      btn.classList.remove('active');
    });
  });
})();

// ── SCROLL REVEAL ────────────────────────────
(function(){
  const selectors = [
    '.pcard',
    '.lcard',
    '.cbox',
    '.drop-left > *',
    '.drop-right',
    '.sobre-content > *',
  ];

  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.style.opacity = '1';
        e.target.style.transform = e.target._baseTransform || 'translateY(0)';
        obs.unobserve(e.target);
      }
    });
  },{threshold:0.1, rootMargin:'0px 0px -30px 0px'});

  selectors.forEach(sel=>{
    document.querySelectorAll(sel).forEach((el,i)=>{
      el.style.opacity = '0';
      el.style.transform = 'translateY(22px)';
      el._baseTransform = 'translateY(0)';
      el.style.transition = `opacity .65s ease ${i*0.07}s, transform .65s ease ${i*0.07}s`;
      obs.observe(el);
    });
  });
})();

// ── PRODUCT MODAL GALLERY ────────────────────
(function(){
  const modal = document.getElementById('product-modal');
  const closeBtn = modal?.querySelector('.close');
  const track = document.getElementById('modal-image-track');
  const galleryCount = document.getElementById('gallery-count');
  const gallerySideLabel = document.getElementById('gallery-side-label');
  const modalProductName = document.getElementById('modal-product-name');
  const modalProductPrice = document.getElementById('modal-product-price');
  const shell = document.getElementById('modal-image-shell');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  const dotsWrap = document.getElementById('gallery-dots');
  const finalizeBtn = document.getElementById('finalize-purchase');
  const sizeOptions = document.getElementById('size-options');
  const sizeSelectionStatus = document.getElementById('size-selection-status');
  const sizeWidth = document.getElementById('size-width');
  const sizeLength = document.getElementById('size-length');
  const sizeSleeve = document.getElementById('size-sleeve');

  if(!modal || !track || !galleryCount || !modalProductName || !modalProductPrice || !shell) return;

  let currentIndex = 0;
  let images = [];
  let startX = 0;
  let selectedSize = null;
  const sizeMeasurements = {
    P: { width: 53, length: 71, sleeve: 22 },
    PP: { width: 55, length: 73, sleeve: 23 },
    M: { width: 57, length: 75, sleeve: 24 },
    G: { width: 59, length: 77, sleeve: 25 },
    GG: { width: 61, length: 79, sleeve: 26 },
  };

  function updateSizeSelection(size) {
    selectedSize = size;
    const measurements = size ? sizeMeasurements[size] : null;
    if (sizeWidth) sizeWidth.textContent = measurements?.width ?? '--';
    if (sizeLength) sizeLength.textContent = measurements?.length ?? '--';
    if (sizeSleeve) sizeSleeve.textContent = measurements?.sleeve ?? '--';
    if (sizeSelectionStatus) {
      sizeSelectionStatus.textContent = size ? `Tamanho ${size} selecionado` : 'Selecione uma opção';
    }
    if (finalizeBtn) finalizeBtn.disabled = !size;
  }

  function resetSizeSelection() {
    sizeOptions?.querySelectorAll('input[name="product-size"]').forEach(input => {
      input.checked = false;
    });
    updateSizeSelection(null);
  }

  function triggerSwitchAnimation() {
    shell.classList.remove('is-switching');
    void shell.offsetWidth;
    shell.classList.add('is-switching');
    setTimeout(() => shell.classList.remove('is-switching'), 380);
  }

  function updateDots() {
    if(!dotsWrap) return;
    dotsWrap.innerHTML = images.map((_, index) => {
      const active = index === currentIndex ? 'active' : '';
      return `<span class="${active}" data-index="${index}"></span>`;
    }).join('');
  }

  function syncGalleryState() {
    if(!images.length) return;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    track.style.filter = 'brightness(1.04) saturate(1.08)';
    galleryCount.textContent = `Imagem ${currentIndex + 1} de ${images.length}`;
    if (gallerySideLabel) {
      gallerySideLabel.textContent = currentIndex === 0 ? 'FRENTE' : 'COSTAS';
    }
    updateDots();
    if (prevBtn) prevBtn.style.display = images.length > 1 ? 'flex' : 'none';
    if (nextBtn) nextBtn.style.display = images.length > 1 ? 'flex' : 'none';
    setTimeout(() => {
      track.style.filter = 'brightness(1) saturate(1)';
    }, 180);
  }

  function goToImage(index) {
    if(!images.length) return;

    currentIndex = (index + images.length) % images.length;

    triggerSwitchAnimation();
    syncGalleryState();
  }

  function moveImage(step) {
    goToImage(currentIndex + step);
  }

  function openGallery(card) {
    const name = card.querySelector('h3')?.textContent?.trim() || 'Produto';
    const price = card.querySelector('span')?.textContent?.trim() || '';
    const cardImages = Array.from(card.querySelectorAll('img'))
      .map(img => img.getAttribute('src'))
      .filter(Boolean)
      .map(src => src.trim());

    images = cardImages.length ? cardImages : [card.querySelector('img')?.getAttribute('src')].filter(Boolean);
    currentIndex = 0;

    modalProductName.textContent = name;
    modalProductPrice.textContent = price;
    resetSizeSelection();
    track.innerHTML = images.map((src, index) => `
      <div class="gallery-slide" data-index="${index}">
        <img src="${src}" alt="${name} ${index + 1}">
        <span class="gallery-slide-tag">${index === 0 ? 'FRENTE' : 'COSTAS'}</span>
      </div>
    `).join('');
    currentIndex = 0;
    syncGalleryState();
    modal.style.display = 'block';
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeGallery() {
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
  }

  document.querySelectorAll('.pcard').forEach(card => {
    card.style.cursor = 'pointer';
    const cardViewport = card.querySelector('.pcard-viewport');
    const toggleButton = card.querySelector('.pcard-toggle');
    const productName = card.querySelector('h3')?.textContent?.trim() || 'produto';

    toggleButton?.addEventListener('click', (event) => {
      event.stopPropagation();
      if (!cardViewport) return;
      const showingBack = cardViewport.dataset.side === 'back';
      cardViewport.dataset.side = showingBack ? 'front' : 'back';
      toggleButton.textContent = showingBack ? 'VER COSTAS' : 'VER FRENTE';
      toggleButton.setAttribute(
        'aria-label',
        showingBack
          ? `Mostrar costas da ${productName}`
          : `Mostrar frente da ${productName}`
      );
    });

    card.addEventListener('click', (event) => {
      const target = event.target;
      if (target.closest('.close')) return;
      openGallery(card);
    });
  });

  closeBtn?.addEventListener('click', closeGallery);

  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeGallery();
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.style.display === 'block') closeGallery();
  });

  prevBtn?.addEventListener('click', (event) => {
    event.stopPropagation();
    moveImage(-1);
  });

  nextBtn?.addEventListener('click', (event) => {
    event.stopPropagation();
    moveImage(1);
  });

  dotsWrap?.addEventListener('click', (event) => {
    const dot = event.target.closest('span');
    if(!dot) return;
    const index = Number(dot.dataset.index ?? -1);
    if(Number.isInteger(index) && index >= 0 && index < images.length) {
      goToImage(index);
    }
  });

  sizeOptions?.addEventListener('change', (event) => {
    const input = event.target;
    if (input.matches('input[name="product-size"]')) {
      updateSizeSelection(input.value);
    }
  });

  finalizeBtn?.addEventListener('click', () => {
    if (!selectedSize) return;
    const productName = modalProductName.textContent;
    const message = `Olá, gostaria de finalizar a compra do produto ${productName}, tamanho ${selectedSize}.`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/554599169464?text=${encodedMessage}`, '_blank');
    closeGallery();
  });

  shell.addEventListener('pointerdown', (event) => {
    if (images.length < 2) return;
    if (event.target.closest('.gallery-btn')) return;
    startX = event.clientX;
    shell.setPointerCapture(event.pointerId);
  });

  shell.addEventListener('pointerup', (event) => {
    if (images.length < 2) return;
    if (event.target.closest('.gallery-btn')) return;
    const deltaX = event.clientX - startX;
    if (deltaX < -40) {
      moveImage(1);
    } else if (deltaX > 40) {
      moveImage(-1);
    }
  });

  shell.addEventListener('pointerleave', () => { startX = 0; });
})();

// ── SATURN FLOAT ANIMATION ───────────────────
(function(){
  const scene = document.querySelector('.saturn-scene');
  if(!scene) return;
  let y = 0, dir = 1, frame;
  function animate(){
    y += 0.018 * dir;
    if(Math.abs(y) > 1) dir *= -1;
    scene.style.transform = `translateY(calc(-50% + ${y}%))`;
    frame = requestAnimationFrame(animate);
  }
  animate();
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden) cancelAnimationFrame(frame);
    else animate();
  });
})();

// ── SMOOTH SCROLL ────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  const href = a.getAttribute('href');
  if(!href || href === '#') return;
  a.addEventListener('click', e=>{
    const target = document.querySelector(href);
    target.scrollIntoView({behavior:'smooth', block:'start'});
  });
});

console.log('%c🪐 SOLTLESS — Vista Outro Mundo', 'font-family:monospace;font-size:13px;color:#3B82F6;background:#060810;padding:6px 14px;border-radius:4px;border-left:3px solid #F97316');

// ── SOBRE — REVEAL HISTÓRIA ──────────────────
(function(){
  const btn = document.getElementById('sobreRevealBtn');
  const wrap = document.getElementById('sobreHistoria');
  if(!btn || !wrap) return;
  btn.addEventListener('click', ()=>{
    const isOpen = wrap.classList.toggle('open');
    btn.textContent = isOpen ? 'FECHAR HISTÓRIA' : 'CONHECER NOSSA HISTÓRIA';
    if(isOpen){
      setTimeout(()=>{
        wrap.scrollIntoView({behavior:'smooth', block:'start'});
      }, 100);
    }
  });
})();
// ── WHATSAPP CONTACT ────────────────────────
(function(){
  const whatsappLink = document.getElementById('whatsapp-contact');
  if(!whatsappLink) return;
  whatsappLink.addEventListener('click', () => {
    const message = 'Olá, gostaria de entrar em contato.';
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/554599169464?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  });
})();