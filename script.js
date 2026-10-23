// Club Join URL Configuration
const JOIN_URL = "https://mkceclub.vercel.app/";
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

// Setup Join URLs
$$(".join-link").forEach(a => { 
  a.href = JOIN_URL;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
});

// Ambient Particles Canvas Background
const initCanvas = () => {
  const canvas = $("#ambient-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = Array.from({ length: 45 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.45,
    vy: (Math.random() - 0.5) * 0.45,
    size: Math.random() * 2.2 + 0.8,
    color: Math.random() > 0.5 ? "rgba(0, 183, 195, " : "rgba(0, 120, 212, "
  }));

  const render = () => {
    ctx.clearRect(0, 0, width, height);
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    
    // Draw interconnecting subtle lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 110) {
          ctx.strokeStyle = isDark 
            ? `rgba(0, 229, 255, ${(1 - dist / 110) * 0.15})`
            : `rgba(0, 120, 212, ${(1 - dist / 110) * 0.12})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw dots
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.fillStyle = p.color + (isDark ? "0.45)" : "0.35)");
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(render);
  };
  render();
};
initCanvas();

// Theme Switcher (Dark / Light)
const themeBtn = $("#theme-toggle");
const currentTheme = localStorage.getItem("theme") || 
  (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
document.documentElement.setAttribute("data-theme", currentTheme);
if (themeBtn) {
  themeBtn.textContent = currentTheme === "dark" ? "☀️" : "🌙";
  themeBtn.onclick = () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const nextTheme = isDark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
    themeBtn.textContent = nextTheme === "dark" ? "☀️" : "🌙";
  };
}

// Sticky Nav + Back to Top
const nav = $("#nav"), topBtn = $("#top");
window.addEventListener("scroll", () => {
  if (nav) nav.classList.toggle("solid", window.scrollY > 40);
  if (topBtn) topBtn.classList.toggle("show", window.scrollY > 500);
}, { passive: true });

if (topBtn) {
  topBtn.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
}

// Mobile Menu
const burger = $("#burger"), links = $("#links");
if (burger && links) {
  burger.onclick = () => {
    const isOpen = links.classList.toggle("open");
    burger.setAttribute("aria-expanded", isOpen);
  };
  $$("#links a").forEach(a => a.addEventListener("click", () => {
    links.classList.remove("open");
    burger.setAttribute("aria-expanded", false);
  }));
}

// Animated Counters with IntersectionObserver
const count = el => {
  const end = +el.dataset.count;
  if (isNaN(end)) return;
  const duration = 1200;
  const stepTime = 25;
  const steps = duration / stepTime;
  const increment = Math.max(1, Math.ceil(end / steps));
  let current = 0;
  
  const timer = setInterval(() => {
    current = Math.min(end, current + increment);
    el.textContent = current;
    if (current >= end) clearInterval(timer);
  }, stepTime);
};

const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add("in");
    if (e.target.dataset.count) count(e.target);
    io.unobserve(e.target);
  });
}, { threshold: 0.15 });

$$(".reveal, [data-count]").forEach((el, i) => {
  if (el.classList.contains("reveal")) {
    el.style.transitionDelay = (i % 4) * 80 + "ms";
  }
  io.observe(el);
});

// Active Navigation Spy
const spy = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      $$("#links a").forEach(a => {
        a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id);
      });
    }
  });
}, { rootMargin: "-40% 0px -55% 0px" });

$$("main section[id]").forEach(s => spy.observe(s));

// Filters for Events & Gallery
function setupFilter(container, items, attr) {
  if (!container) return;
  $$("button", container).forEach(btn => {
    btn.onclick = () => {
      $$("button", container).forEach(b => b.classList.toggle("on", b === btn));
      const filterVal = btn.dataset.f;
      items.forEach(item => {
        const matches = filterVal === "all" || item.dataset[attr] === filterVal;
        item.classList.toggle("hide", !matches);
      });
    };
  });
}
setupFilter($("#events .filters"), $$("#eventGrid .event"), "type");
setupFilter($("#gFilters"), $$(".gallery-grid .gallery-item, .masonry .gallery-item"), "cat");

// Gallery Lightbox Modal
const lb = $("#lb"), lbImg = $("img", lb);
if (lb && lbImg) {
  $$(".gallery-grid .gallery-item img, .masonry .gallery-item img, .winner-card-img").forEach(img => {
    img.onclick = () => {
      lbImg.src = img.src;
      lbImg.alt = img.alt || "Gallery image";
      lb.hidden = false;
    };
  });
  lb.onclick = e => {
    if (e.target === lb || e.target.tagName === "BUTTON") lb.hidden = true;
  };
  window.addEventListener("keydown", e => {
    if (e.key === "Escape") lb.hidden = true;
  });
}

// Open Full Event Brochure / Poster in Lightbox Modal
window.openBrochure = function(imageSrc, altText = "Event Brochure") {
  if (lb && lbImg) {
    lbImg.src = imageSrc;
    lbImg.alt = altText;
    lb.hidden = false;
  } else {
    window.open(imageSrc, "_blank");
  }
};

// Countdown Timer for Upcoming TECHX Event
const countdownEl = $("#event-countdown");
if (countdownEl) {
  // Target: November 15, 2026 09:00:00
  const targetDate = new Date("2026-11-15T09:00:00").getTime();
  
  const updateCountdown = () => {
    const now = new Date().getTime();
    const dist = targetDate - now;
    
    if (dist < 0) {
      countdownEl.innerHTML = "<span>Event in Progress or Concluded</span>";
      return;
    }
    
    const days = Math.floor(dist / (1000 * 60 * 60 * 24));
    const hours = Math.floor((dist % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((dist % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((dist % (1000 * 60)) / 1000);
    
    const dEl = $("#cd-days");
    const hEl = $("#cd-hours");
    const mEl = $("#cd-mins");
    const sEl = $("#cd-secs");
    
    if (dEl) dEl.textContent = String(days).padStart(2, "0");
    if (hEl) hEl.textContent = String(hours).padStart(2, "0");
    if (mEl) mEl.textContent = String(mins).padStart(2, "0");
    if (sEl) sEl.textContent = String(secs).padStart(2, "0");
  };
  
  updateCountdown();
  setInterval(updateCountdown, 1000);
}

// Event Details Quick Modal
const eventModal = $("#event-modal");
const modalTitle = $("#modal-title");
const modalDesc = $("#modal-desc");
const modalDate = $("#modal-date");
const modalRegister = $("#modal-register");
const modalClose = $("#modal-close");

const eventData = {
  techx: {
    title: "TECHX - Inter-Department Technical Challenge",
    desc: "A high-octane 6-hour technical marathon featuring Tech Quizzes, Logic Puzzles, Fun Tech Games, and an intense Code Sprint. Open for all departments and all years.",
    date: "November 15, 2026 · 6 Hours · All Departments",
    link: "https://forms.gle/REPLACE_TECHX"
  },
  design2build: {
    title: "Design2Build - Cross-Disciplinary Innovation",
    desc: "Transform ideas into functional digital and physical prototypes. Experience rapid UI/UX wireframing, architecture planning, and pitch presentations to mentor panels.",
    date: "December 2026 · 2 Days · Team Event",
    link: JOIN_URL
  },
  workshop: {
    title: "Microsoft Cloud & AI Workshop",
    desc: "Hands-on masterclass diving into Azure AI services, GitHub Copilot workflows, and Power Platform automation tools.",
    date: "Coming Soon · Half Day · All Years",
    link: JOIN_URL
  }
};

window.openEventDetails = function(key) {
  const item = eventData[key];
  if (!item || !eventModal) return;
  modalTitle.textContent = item.title;
  modalDesc.textContent = item.desc;
  modalDate.textContent = item.date;
  modalRegister.href = item.link;
  eventModal.classList.add("open");
  eventModal.setAttribute("aria-hidden", "false");
};

if (modalClose && eventModal) {
  modalClose.onclick = () => {
    eventModal.classList.remove("open");
    eventModal.setAttribute("aria-hidden", "true");
  };
  eventModal.onclick = e => {
    if (e.target === eventModal) {
      eventModal.classList.remove("open");
      eventModal.setAttribute("aria-hidden", "true");
    }
  };
}

// Cursor Glow Tracker
const glow = $("#glow");
if (glow) {
  window.addEventListener("pointermove", e => {
    glow.style.left = e.clientX + "px";
    glow.style.top = e.clientY + "px";
  }, { passive: true });
}

// ==========================================================================
// PWA (Progressive Web App): Service Worker & Native Install Prompt Manager
// ==========================================================================
let deferredPrompt = null;
const pwaInstallBtn = $("#pwa-install-btn");
const pwaBanner = $("#pwa-banner");
const pwaInstallAction = $("#pwa-install-action");
const pwaDismissAction = $("#pwa-dismiss-action");
const pwaCloseBtn = $("#pwa-close-btn");
const pwaIosModal = $("#pwa-ios-modal");
const pwaIosClose = $("#pwa-ios-close");
const pwaIosDone = $("#pwa-ios-done");

// Check if running on iOS or in Standalone
const isIos = () => /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
const isInStandaloneMode = () => ('standalone' in window.navigator && window.navigator.standalone) || window.matchMedia('(display-mode: standalone)').matches;

// 1. Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then((reg) => {
        console.log('ITF PWA: Service Worker registered successfully', reg.scope);
      })
      .catch((err) => {
        console.warn('ITF PWA: Service Worker registration failed', err);
      });
  });
}

// 2. Handle beforeinstallprompt (Android / Chromium Desktop / Edge)
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;

  if (pwaInstallBtn) pwaInstallBtn.hidden = false;

  // Show bottom banner after a short delay if not dismissed this session
  if (pwaBanner && !sessionStorage.getItem('pwa_banner_dismissed')) {
    setTimeout(() => {
      pwaBanner.hidden = false;
      pwaBanner.setAttribute('aria-hidden', 'false');
    }, 2500);
  }
});

// Trigger install prompt flow
const triggerInstall = async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`ITF PWA: User response to install: ${outcome}`);
    deferredPrompt = null;
    if (pwaBanner) pwaBanner.hidden = true;
    if (pwaInstallBtn) pwaInstallBtn.hidden = true;
  } else if (isIos() && !isInStandaloneMode() && pwaIosModal) {
    pwaIosModal.hidden = false;
    if (pwaBanner) pwaBanner.hidden = true;
  }
};

if (pwaInstallBtn) {
  // Always show on iOS if not already installed as standalone
  if (isIos() && !isInStandaloneMode()) {
    pwaInstallBtn.hidden = false;
  }
  pwaInstallBtn.onclick = triggerInstall;
}

if (pwaInstallAction) {
  pwaInstallAction.onclick = triggerInstall;
}

const dismissBanner = () => {
  if (pwaBanner) {
    pwaBanner.hidden = true;
    pwaBanner.setAttribute('aria-hidden', 'true');
    sessionStorage.setItem('pwa_banner_dismissed', 'true');
  }
};

if (pwaDismissAction) pwaDismissAction.onclick = dismissBanner;
if (pwaCloseBtn) pwaCloseBtn.onclick = dismissBanner;

// iOS Guide Modal Closures
if (pwaIosClose) pwaIosClose.onclick = () => { if (pwaIosModal) pwaIosModal.hidden = true; };
if (pwaIosDone) pwaIosDone.onclick = () => { if (pwaIosModal) pwaIosModal.hidden = true; };

// 3. Track App Installed
window.addEventListener('appinstalled', () => {
  console.log('ITF PWA: App successfully installed on device!');
  deferredPrompt = null;
  if (pwaBanner) pwaBanner.hidden = true;
  if (pwaInstallBtn) pwaInstallBtn.hidden = true;
});
