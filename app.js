const { createApp, ref, watch, onMounted, onUnmounted } = Vue;

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

let showAdModal = () => {};

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

function pointerDist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function pointerMid(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

createApp({
  setup() {
    const currentSlide = ref(0);

    const slides = ref([
      { src: 'src/img/design1.png' },
      { src: 'src/img/design2.png' },
      { src: 'src/img/design3.png' }
    ]);

    const dragStartX = ref(null);

    function nextSlide() {
      currentSlide.value = (currentSlide.value + 1) % slides.value.length;
    }

    function prevSlide() {
      currentSlide.value = (currentSlide.value - 1 + slides.value.length) % slides.value.length;
    }

    function onPointerDown(e) {
      dragStartX.value = e.clientX;
    }

    function onPointerUp(e) {
      if (dragStartX.value === null) return;
      const diff = dragStartX.value - e.clientX;
      dragStartX.value = null;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
    }

    // ===== Lightbox =====
    const lightboxOpen = ref(false);
    const lightboxSrc = ref('');
    const lightboxScale = ref(1);
    const lightboxX = ref(0);
    const lightboxY = ref(0);
    const lightboxDragging = ref(false);

    const activePointers = new Map();
    let pinchStartDistance = null;
    let pinchStartScale = 1;
    let pinchMidX = 0;
    let pinchMidY = 0;
    let isDragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    function openLightbox(src) {
      lightboxSrc.value = src;
      lightboxScale.value = 1;
      lightboxX.value = 0;
      lightboxY.value = 0;
      lightboxOpen.value = true;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.classList.add('lightbox-open');
    }

    function closeLightbox() {
      lightboxOpen.value = false;
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.classList.remove('lightbox-open');
      activePointers.clear();
      lightboxDragging.value = false;
    }

    function onLightboxWheel(e) {
      if (!lightboxOpen.value) return;
      e.preventDefault();
      const factor = e.deltaY > 0 ? 0.9 : 1.1;
      lightboxScale.value = clamp(lightboxScale.value * factor, 0.5, 5);
    }

    function onLightboxPointerDown(e) {
      if (!lightboxOpen.value) return;
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      lightboxDragging.value = true;
      pinchStartDistance = null;
      if (activePointers.size === 1) {
        isDragging = true;
        dragOffsetX = e.clientX - lightboxX.value;
        dragOffsetY = e.clientY - lightboxY.value;
      } else if (activePointers.size === 2) {
        isDragging = false;
        const pts = [...activePointers.values()];
        pinchStartDistance = pointerDist(pts[0], pts[1]);
        pinchStartScale = lightboxScale.value;
        const mid = pointerMid(pts[0], pts[1]);
        pinchMidX = mid.x;
        pinchMidY = mid.y;
      }
    }

    function onLightboxPointerMove(e) {
      if (!lightboxOpen.value || !activePointers.has(e.pointerId)) return;
      activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (activePointers.size === 2 && pinchStartDistance) {
        const pts = [...activePointers.values()];
        const d = pointerDist(pts[0], pts[1]);
        lightboxScale.value = clamp(pinchStartScale * (d / pinchStartDistance), 0.5, 5);
        const mid = pointerMid(pts[0], pts[1]);
        lightboxX.value += mid.x - pinchMidX;
        lightboxY.value += mid.y - pinchMidY;
        pinchMidX = mid.x;
        pinchMidY = mid.y;
      } else if (isDragging) {
        lightboxX.value = e.clientX - dragOffsetX;
        lightboxY.value = e.clientY - dragOffsetY;
      }
    }

    function onLightboxPointerUp(e) {
      if (!lightboxOpen.value) return;
      if (activePointers.has(e.pointerId)) {
        activePointers.delete(e.pointerId);
      }
      isDragging = false;
      pinchStartDistance = null;
      if (activePointers.size === 0) {
        lightboxDragging.value = false;
      }
    }

    // ===== Telegram ad modal =====
    const adVisible = ref(false);
    const adWidgetHost = ref(null);
    const adWidgetCreated = ref(false);
    let adWidgetScriptAdded = false;
    let adWidgetPending = false;

    function loadTelegramWidget() {
      if (adWidgetScriptAdded) return;
      adWidgetScriptAdded = true;
      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-widget.js?24';
      script.async = true;
      script.onload = () => {
        if (adWidgetPending) {
          createAdWidget();
        }
      };
      document.head.appendChild(script);
    }

    function createAdWidget() {
      if (adWidgetCreated.value || !window.TelegramWidget || !adWidgetHost.value) return;
      window.TelegramWidget.createPost(adWidgetHost.value, 'sser1tohub/1', {
        width: '100%',
        theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light'
      });
      adWidgetCreated.value = true;
      adWidgetPending = false;
    }

    function closeAd() {
      adVisible.value = false;
    }

    watch(adVisible, (val) => {
      if (!val) return;
      if (window.TelegramWidget) {
        createAdWidget();
      } else {
        adWidgetPending = true;
      }
    }, { flush: 'post' });

    function onKeydown(e) {
      if (e.key !== 'Escape') return;
      if (adVisible.value) {
        closeAd();
      } else if (lightboxOpen.value) {
        closeLightbox();
      }
    }

    onMounted(() => {
      showAdModal = () => { adVisible.value = true; };
      window.addEventListener('keydown', onKeydown);
      loadTelegramWidget();
    });

    onUnmounted(() => {
      window.removeEventListener('keydown', onKeydown);
    });

    return {
      currentSlide,
      slides,
      nextSlide,
      prevSlide,
      onPointerDown,
      onPointerUp,
      lightboxOpen,
      lightboxSrc,
      lightboxScale,
      lightboxX,
      lightboxY,
      lightboxDragging,
      openLightbox,
      closeLightbox,
      onLightboxWheel,
      onLightboxPointerDown,
      onLightboxPointerMove,
      onLightboxPointerUp,
      adVisible,
      adWidgetHost,
      adWidgetCreated,
      closeAd
    };
  }
}).mount('#app');

const revealElements = document.querySelectorAll('.hero, .section');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

function startReveals() {
  revealElements.forEach((el) => {
    el.classList.add('reveal');
    revealObserver.observe(el);
  });
}

const preloader = document.getElementById('preloader');

if (preloader) {
  document.documentElement.classList.add('preloading');
  document.body.classList.add('preloading');
  setTimeout(() => {
    preloader.classList.add('preloader-hidden');
    preloader.addEventListener('transitionend', () => preloader.remove(), { once: true });
    document.documentElement.classList.remove('preloading');
    document.body.classList.remove('preloading');
    startReveals();
    setTimeout(showAdModal, 3000);
  }, 3000);
} else {
  startReveals();
  setTimeout(showAdModal, 3000);
}

const themeToggle = document.getElementById('theme-toggle');
const rootEl = document.documentElement;

const scrollProgress = document.getElementById('scroll-progress');
const scrollProgressText = document.querySelector('.scroll-progress-text');

let maxScrollPct = 0;

function updateScrollProgress() {
  const doc = document.documentElement;
  const max = doc.scrollHeight - window.innerHeight;
  const pct = max > 0 ? clamp(Math.round((window.scrollY / max) * 100), 0, 100) : 0;
  if (pct > maxScrollPct) {
    maxScrollPct = pct;
  }
  scrollProgressText.textContent = maxScrollPct + '%';
  scrollProgress.style.setProperty('--progress', maxScrollPct * 3.6 + 'deg');
}

window.addEventListener('scroll', updateScrollProgress, { passive: true });
window.addEventListener('resize', updateScrollProgress);
updateScrollProgress();

if (themeToggle) {
  if (localStorage.getItem('theme') === 'dark') {
    rootEl.classList.add('dark');
  }

  themeToggle.addEventListener('click', () => {
    rootEl.classList.toggle('dark');
    localStorage.setItem('theme', rootEl.classList.contains('dark') ? 'dark' : 'light');
  });
}
