const { createApp, ref, computed, watch, onMounted, onUnmounted, nextTick } = Vue;

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

////////////////////////////////////////////////////////////////////////////////
// i18n ////////////////////////////////////////////////////////////////////////

const TRANSLATIONS = {
  ru: {
    siteTitle: 'Обо мне',
    init: 'Инициализация',
    themeAria: 'Переключить тему',
    progressAria: 'Прогресс чтения страницы',
    langAria: 'Переключить язык',
    photoAlt: 'Никита Лецколюк',
    heroKicker: '/ код · дизайн · аналитика · музыка',
    heroTitle: 'Привет!',
    heroText: 'Меня зовут Никита, мне 21 год, увлекаюсь <a href="#programmer" class="highlight">программированием</a>, <a href="#designer" class="highlight">веб-дизайном</a> и <a href="#analyst" class="highlight">аналитикой</a>.',
    heroQuote: 'Шансы на успех есть всегда - моя задача превратить их в результат.',
    learnMore: 'Узнать больше',
    educationTitle: 'Образование',
    eduPlace1: 'ЮУрГТК',
    eduDesc1: 'Южно-Уральский государственный технический колледж, г. Челябинск',
    eduSpec1: 'Информационные системы и программирование (Программист)',
    eduDesc2: 'Уральский федеральный университет, г. Екатеринбург',
    eduPlace2: 'УрФУ',
    eduSpec2: 'Информатика и вычислительная техника (Алгоритмы искусственного интеллекта)',
    nowBadge: 'сейчас на 2 курсе',
    programmerTitle: 'Я - программист',
    programmerText: 'Имею практический опыт участия в разработке информационных систем, программного обеспечения и сервисов. Более 2-х лет участвую в IT-хакатонах, во время которых применял на себе роли DevOps и backend-разработчика. Пишу код на C# и Python.',
    githubAll: 'Все мои проекты можно посмотреть на <a href="https://github.com/sser1to" target="_blank">GitHub</a>.',
    designerTitle: 'Я - дизайнер',
    designerText: 'Умею с нуля делать красивые презентации, проектировать веб-интерфейсы и создавать оригинальные и запоминающиеся логотипы.',
    githubBeh: 'Мои работы можно посмотреть на <a href="https://www.behance.net/1e2387ef" target="_blank">Behance</a>.',
    analystTitle: 'Я - аналитик',
    analystText: 'Имею опыт анализа и формализации требований, взаимодействия с разработчиками и заказчиками, описания функциональности системы и моделирования бизнес-логики. Владею UML и умею разрабатывать диаграммы Use Case, Sequence, Activity, Class и Component для описания архитектуры и процессов системы, а также ER-диаграммы.',
    analystText2: 'Обладаю навыками проектирования API и баз данных: умею определять структуру и взаимосвязи сущностей, проектировать модели данных, описывать взаимодействие компонентов системы и формировать спецификации API.',
    analystText3: 'Обладаю аналитическим складом ума, навыками декомпозиции задач и системного мышления. Умею организовывать взаимодействие внутри команды, формулировать требования и переводить бизнес-потребности в понятную техническую структуру. Также умею составлять тест-кейсы для проверки функциональности системы и соответствия реализованного решения требованиям.',
    untilNow: 'сейчас',
    intern1: 'Прошёл турбостажировку в Сбер на системного аналитика.',
    intern2: 'Стажируюсь на системного аналитика в Сбер.',
    musicTitle: 'Я - битмейкер',
    musicText: 'Когда-то я увлекался созданием музыки. Ниже вы можете послушать несколько хороших примеров.',
    nowPlaying: 'Сейчас играет',
    prevTrack: 'Предыдущий трек',
    playPause: 'Воспроизвести или поставить на паузу',
    nextTrack: 'Следующий трек',
    designAlt: 'Дизайн',
    slideN: 'Слайд {0}',
    prevSlide: 'Предыдущий слайд',
    nextSlide: 'Следующий слайд',
    designPreview: 'Просмотр дизайна',
    close: 'Закрыть',
    adTitle: 'У меня есть личный тгк канал',
    footerName: 'Лецколюк<br>Никита<br>Максимович',
    footerContacts: 'Мои контакты'
  },
  en: {
    siteTitle: 'About Me',
    init: 'Initializing',
    themeAria: 'Toggle theme',
    progressAria: 'Page reading progress',
    langAria: 'Switch language',
    photoAlt: 'Nikita Letskolyuk',
    heroKicker: '/ code · design · analytics · beats',
    heroTitle: 'Hi there!',
    heroText: 'My name is Nikita, I am 21 years old, and I am into <a href="#programmer" class="highlight">programming</a>, <a href="#designer" class="highlight">web design</a> and <a href="#analyst" class="highlight">analytics</a>.',
    heroQuote: 'There is always a chance of success - my job is to turn it into results.',
    learnMore: 'Learn more',
    educationTitle: 'Education',
    eduPlace1: 'SUUTC',
    eduDesc1: 'South Ural State Technical College, Chelyabinsk',
    eduSpec1: 'Information Systems and Programming (Programmer)',
    eduDesc2: 'Ural Federal University, Yekaterinburg',
    eduPlace2: 'UrFU',
    eduSpec2: 'Computer Science (AI Algorithms)',
    nowBadge: 'now in 2nd year',
    programmerTitle: "I'm a programmer",
    programmerText: 'I have hands-on experience in the development of information systems, software and services. For more than 2 years I have been taking part in IT hackathons, where I took on the roles of DevOps and backend developer. I write code in C# and Python.',
    githubAll: 'All my projects can be found on <a href="https://github.com/sser1to" target="_blank">GitHub</a>.',
    designerTitle: "I'm a designer",
    designerText: 'I can create beautiful presentations from scratch, design web interfaces, and craft original and memorable logos.',
    githubBeh: 'My works can be found on <a href="https://www.behance.net/1e2387ef" target="_blank">Behance</a>.',
    analystTitle: "I'm an analyst",
    analystText: 'I have experience in analyzing and formalizing requirements, working with developers and customers, describing system functionality and modeling business logic. I know UML and can develop Use Case, Sequence, Activity, Class and Component diagrams to describe system architecture and processes, as well as ER diagrams.',
    analystText2: 'I also have API and database design skills: I can define the structure and relationships of entities, design data models, describe how system components interact, and produce API specifications.',
    analystText3: 'I have an analytical mindset, task decomposition skills and systems thinking. I know how to organize collaboration within a team, formulate requirements, and turn business needs into a clear technical structure. I can also write test cases to verify system functionality and check that the implemented solution meets the requirements.',
    untilNow: 'now',
    intern1: 'Completed a turbo internship at Sber as a system analyst.',
    intern2: 'Currently doing a system analyst internship at Sber.',
    musicTitle: "I'm a beatmaker",
    musicText: 'I used to be into making music. Below you can listen to a few good examples.',
    nowPlaying: 'Now playing',
    prevTrack: 'Previous track',
    playPause: 'Play or pause',
    nextTrack: 'Next track',
    designAlt: 'Design',
    slideN: 'Slide {0}',
    prevSlide: 'Previous slide',
    nextSlide: 'Next slide',
    designPreview: 'Design preview',
    close: 'Close',
    adTitle: 'I have a personal Telegram channel',
    footerName: 'Letskolyuk<br>Nikita<br>Maximovich',
    footerContacts: 'My contacts'
  }
};

const DEFAULT_LANG = 'ru';
const SUPPORTED_LANGS = ['ru', 'en'];

function getSavedLang() {
  const saved = localStorage.getItem('lang');
  return SUPPORTED_LANGS.includes(saved) ? saved : DEFAULT_LANG;
}

function translate(lang, key, args = []) {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS[DEFAULT_LANG];
  let text = dict[key] !== undefined ? dict[key] : key;
  args.forEach((arg, i) => {
    text = text.replace('{' + i + '}', arg);
  });
  return text;
}

createApp({
  setup() {
    const lang = ref(getSavedLang());

    const t = (key, ...args) => translate(lang.value, key, args);

    window.__setSiteLang = (value) => {
      if (SUPPORTED_LANGS.includes(value)) {
        lang.value = value;
      }
    };

    watch(lang, (value) => {
      localStorage.setItem('lang', value);
      document.documentElement.lang = value;
      document.title = translate(value, 'siteTitle');
      window.dispatchEvent(new CustomEvent('langchange', { detail: value }));
    }, { immediate: true });

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

    // ===== Music player =====
    const tracks = ref([
      { src: 'src/audio/in the rain.mp3', title: 'in the rain' },
      { src: 'src/audio/r4m4mb4r.mp3', title: 'r4m4mb4r' },
      { src: 'src/audio/i miss you.mp3', title: 'i miss you' }
    ]);

    const currentTrackIndex = ref(0);
    const isPlaying = ref(false);
    const currentTime = ref(0);
    const duration = ref(0);
    const audioEl = ref(null);

    const currentTrack = computed(() => tracks.value[currentTrackIndex.value]);

    const progressPct = computed(() => {
      if (!duration.value) return 0;
      return clamp((currentTime.value / duration.value) * 100, 0, 100);
    });

    function formatTime(sec) {
      if (!isFinite(sec) || sec < 0) sec = 0;
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      return `${m}:${s.toString().padStart(2, '0')}`;
    }

    function togglePlay() {
      const el = audioEl.value;
      if (!el) return;
      if (el.paused) {
        el.play().catch(() => {});
      } else {
        el.pause();
      }
    }

    function selectTrack(i) {
      if (i === currentTrackIndex.value) {
        togglePlay();
        return;
      }
      currentTrackIndex.value = i;
      currentTime.value = 0;
      duration.value = 0;
      isPlaying.value = false;
      nextTick(() => {
        const el = audioEl.value;
        if (!el) return;
        el.load();
        el.play().catch(() => {});
      });
    }

    function nextTrack() {
      selectTrack((currentTrackIndex.value + 1) % tracks.value.length);
    }

    function prevTrack() {
      selectTrack((currentTrackIndex.value - 1 + tracks.value.length) % tracks.value.length);
    }

    function onLoadedMetadata(e) {
      duration.value = e.target.duration;
    }

    function onTimeUpdate(e) {
      currentTime.value = e.target.currentTime;
    }

    function onProgressDown(e) {
      const el = audioEl.value;
      if (!el || !duration.value) return;
      const bar = e.currentTarget;
      const seek = (ev) => {
        const rect = bar.getBoundingClientRect();
        const ratio = clamp((ev.clientX - rect.left) / rect.width, 0, 1);
        const t = ratio * (el.duration || 0);
        el.currentTime = t;
        currentTime.value = t;
      };
      seek(e);
      const moveHandler = (ev) => seek(ev);
      const upHandler = () => {
        window.removeEventListener('pointermove', moveHandler);
        window.removeEventListener('pointerup', upHandler);
      };
      window.addEventListener('pointermove', moveHandler);
      window.addEventListener('pointerup', upHandler);
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
      lang,
      t,
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
      closeAd,
      tracks,
      currentTrackIndex,
      currentTrack,
      isPlaying,
      currentTime,
      duration,
      audioEl,
      progressPct,
      formatTime,
      togglePlay,
      selectTrack,
      nextTrack,
      prevTrack,
      onLoadedMetadata,
      onTimeUpdate,
      onProgressDown
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

const langToggle = document.getElementById('lang-toggle');
const langToggleText = document.getElementById('lang-toggle-text');
const scrollProgress = document.getElementById('scroll-progress');

let uiLang = getSavedLang();

function applyStaticI18n(value) {
  document.documentElement.lang = value;
  document.title = translate(value, 'siteTitle');

  const preloaderText = document.querySelector('.preloader-text');
  if (preloaderText) {
    preloaderText.textContent = translate(value, 'init');
  }

  if (themeToggle) {
    themeToggle.setAttribute('aria-label', translate(value, 'themeAria'));
  }

  if (scrollProgress) {
    scrollProgress.setAttribute('aria-label', translate(value, 'progressAria'));
  }

  if (langToggle && langToggleText) {
    langToggle.setAttribute('aria-label', translate(value, 'langAria'));
    langToggleText.textContent = value === 'ru' ? 'EN' : 'RU';
  }
}

applyStaticI18n(uiLang);

window.addEventListener('langchange', (e) => {
  uiLang = e.detail;
  applyStaticI18n(uiLang);
});

if (langToggle) {
  langToggle.addEventListener('click', () => {
    uiLang = uiLang === 'ru' ? 'en' : 'ru';
    applyStaticI18n(uiLang);
    if (window.__setSiteLang) {
      window.__setSiteLang(uiLang);
    }
  });
}

function updateScrollProgress() {
  const doc = document.documentElement;
  const max = doc.scrollHeight - window.innerHeight;
  const pct = max > 0 ? clamp(Math.round((window.scrollY / max) * 100), 0, 100) : 0;
  scrollProgress.style.setProperty('--scroll-progress', pct + '%');
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
