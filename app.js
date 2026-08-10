const { createApp, ref, onMounted, onUnmounted } = Vue;

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
    }

    function closeLightbox() {
      lightboxOpen.value = false;
      document.body.style.overflow = '';
      activePointers.clear();
      lightboxDragging.value = false;
    }

    function onLightboxWheel(e) {
      if (!lightboxOpen.value) return;
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

    function onKeydown(e) {
      if (e.key === 'Escape' && lightboxOpen.value) {
        closeLightbox();
      }
    }

    onMounted(() => {
      window.addEventListener('keydown', onKeydown);
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
      onLightboxPointerUp
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

revealElements.forEach((el) => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

const themeToggle = document.getElementById('theme-toggle');
const rootEl = document.documentElement;

if (themeToggle) {
  if (localStorage.getItem('theme') === 'dark') {
    rootEl.classList.add('dark');
  }

  themeToggle.addEventListener('click', () => {
    rootEl.classList.toggle('dark');
    localStorage.setItem('theme', rootEl.classList.contains('dark') ? 'dark' : 'light');
  });
}
