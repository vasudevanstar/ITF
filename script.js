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
  const closeMenu = () => {
    links.classList.remove("open");
    burger.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
  };

  burger.onclick = (e) => {
    e.stopPropagation();
    const isOpen = links.classList.toggle("open");
    burger.classList.toggle("open", isOpen);
    burger.setAttribute("aria-expanded", isOpen);
  };

  $$("#links a").forEach(a => a.addEventListener("click", closeMenu));

  // Close when clicking outside
  document.addEventListener("click", (e) => {
    if (links.classList.contains("open") && !links.contains(e.target) && !burger.contains(e.target)) {
      closeMenu();
    }
  });

  // Close on Escape key
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && links.classList.contains("open")) {
      closeMenu();
    }
  });

  // Auto close menu when resizing to desktop
  window.addEventListener("resize", () => {
    if (window.innerWidth > 1080 && links.classList.contains("open")) {
      closeMenu();
    }
  });
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

// ==========================================================================
// Two-Row Infinite Scrolling Photo Gallery (Automatic division & seamless looping)
// ==========================================================================
function initInfiniteGallery() {
  const source = $("#gallerySource");
  const row1 = $("#galleryRow1");
  const row2 = $("#galleryRow2");
  if (!source || !row1 || !row2) return;

  // Read all child elements from source (supports both <div class="gallery-item"> and simple <img> tags)
  const rawItems = Array.from(source.children).filter(el => el.nodeType === 1);
  if (rawItems.length === 0) return;

  const normalizedItems = rawItems.map(item => {
    if (item.classList.contains("gallery-item")) {
      return item.cloneNode(true);
    }
    // If user provided a raw <img> tag, wrap it nicely
    const wrap = document.createElement("div");
    wrap.className = "gallery-item";
    const img = item.cloneNode(true);
    wrap.appendChild(img);
    const captionText = item.getAttribute("data-caption") || item.alt;
    if (captionText) {
      const cap = document.createElement("div");
      cap.className = "gallery-caption";
      cap.textContent = captionText;
      wrap.appendChild(cap);
    }
    return wrap;
  });

  // Divide items alternately between Row 1 and Row 2
  const row1Items = [];
  const row2Items = [];
  normalizedItems.forEach((item, index) => {
    if (index % 2 === 0) {
      row1Items.push(item);
    } else {
      row2Items.push(item);
    }
  });

  // Ensure both rows have items even if only 1 item was provided
  if (row2Items.length === 0 && row1Items.length > 0) {
    row2Items.push(row1Items[0].cloneNode(true));
  }

  // Populate row track with duplicate set for seamless infinite loop
  function populateTrack(rowEl, items) {
    const track = rowEl.querySelector(".gallery-marquee-track");
    if (!track) return;
    track.innerHTML = "";

    // Repeat items in base set until track comfortably exceeds viewport width
    let baseSet = [...items];
    while (baseSet.length < 6) {
      baseSet = baseSet.concat(items.map(it => it.cloneNode(true)));
    }

    // First Half: 0% to -50%
    baseSet.forEach(it => {
      track.appendChild(it.cloneNode(true));
    });

    // Second Half (Exact Duplicate): seamlessly loops back to 0% at -50%
    baseSet.forEach(it => {
      const clone = it.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);
    });
  }

  populateTrack(row1, row1Items);
  populateTrack(row2, row2Items);

  // Attach Lightbox click handlers to all generated gallery images
  attachGalleryLightbox();
}

// Lightbox click handler attachment
function attachGalleryLightbox() {
  const lb = $("#lb"), lbImg = $("img", lb);
  if (!lb || !lbImg) return;

  const clickableImgs = $$(
    ".gallery-marquee-viewport .gallery-item img, .winner-card-img, .gallery-item img"
  );

  clickableImgs.forEach(img => {
    img.onclick = (e) => {
      e.stopPropagation();
      lbImg.src = img.src;
      lbImg.alt = img.alt || "Event Photo";
      lb.hidden = false;
    };
  });
}

// Initialize infinite gallery on DOM load
initInfiniteGallery();

// Gallery Lightbox Modal
const lb = $("#lb"), lbImg = $("img", lb);
if (lb && lbImg) {
  lb.onclick = e => {
    if (e.target === lb || e.target.tagName === "BUTTON") lb.hidden = true;
  };
  window.addEventListener("keydown", e => {
    if (e.key === "Escape") lb.hidden = true;
  });
}

// Open Full Event Brochure / Poster in Lightbox Modal
window.openBrochure = function (imageSrc, altText = "Event Brochure") {
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

window.openEventDetails = function (key) {
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

// ==========================================================================
// Student Innovation Hub: 30-Second Domain Quiz & 3D Member Pass Generator
// ==========================================================================

(function initStudentHub() {
  // Domain Quiz State & Data
  const domainProfiles = {
    ai: {
      title: "AI & Copilot Systems Engineer",
      icon: "🤖",
      desc: "You thrive at the cutting edge of artificial intelligence, model training, and generative algorithms. In ITF, you will build with Azure OpenAI and GitHub Copilot tools.",
      tech: ["Azure OpenAI", "Python", "Copilot Studio", "HuggingFace"],
      passDomain: "AI Systems",
      selectVal: "AI Systems"
    },
    cloud: {
      title: "Cloud & DevOps Architect",
      icon: "☁️",
      desc: "You love scalable infrastructure, continuous integration, and secure distributed cloud architectures powering modern global platforms.",
      tech: ["Microsoft Azure", "Docker", "GitHub Actions", "Kubernetes"],
      passDomain: "Cloud Architect",
      selectVal: "Cloud Architect"
    },
    dev: {
      title: "Full-Stack Software Engineer",
      icon: "💻",
      desc: "You are driven by crafting responsive web applications, robust APIs, and interactive digital solutions that users love.",
      tech: ["React / Next.js", "Node.js & TypeScript", "REST APIs", "Modern CSS"],
      passDomain: "Full-Stack Dev",
      selectVal: "Full-Stack Dev"
    },
    design: {
      title: "UI/UX & Experience Designer",
      icon: "🎨",
      desc: "You blend human psychology with high-fidelity visual aesthetics, crafting unforgettable interactions, design systems, and product prototypes.",
      tech: ["Figma Design", "Fluent Design", "Micro-animations", "Prototyping"],
      passDomain: "UI/UX Designer",
      selectVal: "UI/UX Designer"
    },
    lead: {
      title: "Community Lead & Tech Evangelist",
      icon: "🎪",
      desc: "You excel at energizing tech communities, presenting ideas, organizing high-impact hackathons, and inspiring teammates to victory.",
      tech: ["Public Speaking", "Event Management", "Pitch Decks", "DevRel & PR"],
      passDomain: "Community Lead",
      selectVal: "Community Lead"
    }
  };

  const quizContainer = $("#quizContainer");
  const quizSteps = $$(".quiz-step", quizContainer);
  const quizResult = $("#quizResult");
  const resultIcon = $("#resultIcon");
  const resultTitle = $("#resultTitle");
  const resultDesc = $("#resultDesc");
  const resultTech = $("#resultTech");
  const applyToPassBtn = $("#applyToPassBtn");
  const retakeQuizBtn = $("#retakeQuizBtn");

  let currentStep = 1;
  const quizAnswers = [];
  let detectedDomainKey = "ai";

  // Handle option click
  if (quizContainer) {
    quizContainer.addEventListener("click", e => {
      const optBtn = e.target.closest(".quiz-opt");
      if (!optBtn) return;

      const domain = optBtn.getAttribute("data-domain");
      if (!domain) return;

      quizAnswers.push(domain);

      if (currentStep < quizSteps.length) {
        // Go to next question
        quizSteps.forEach(s => s.classList.remove("active"));
        currentStep++;
        const nextStepEl = $(`[data-step="${currentStep}"]`, quizContainer);
        if (nextStepEl) nextStepEl.classList.add("active");
      } else {
        // Compute winning domain
        finishQuiz();
      }
    });
  }

  function finishQuiz() {
    // Hide all question steps
    quizSteps.forEach(s => s.classList.remove("active"));

    // Tally votes
    const counts = {};
    quizAnswers.forEach(d => { counts[d] = (counts[d] || 0) + 1; });
    let maxDomain = "ai";
    let maxCount = -1;
    for (const d in counts) {
      if (counts[d] > maxCount) {
        maxCount = counts[d];
        maxDomain = d;
      }
    }
    detectedDomainKey = maxDomain;
    const profile = domainProfiles[maxDomain] || domainProfiles.ai;

    if (resultIcon) resultIcon.textContent = profile.icon;
    if (resultTitle) resultTitle.textContent = profile.title;
    if (resultDesc) resultDesc.textContent = profile.desc;
    if (resultTech) {
      resultTech.innerHTML = profile.tech.map(t => `<span>${t}</span>`).join("");
    }

    if (quizResult) {
      quizResult.hidden = false;
    }
  }

  // Retake quiz
  if (retakeQuizBtn) {
    retakeQuizBtn.addEventListener("click", () => {
      quizAnswers.length = 0;
      currentStep = 1;
      if (quizResult) quizResult.hidden = true;
      quizSteps.forEach(s => s.classList.remove("active"));
      const firstStep = $(`[data-step="1"]`, quizContainer);
      if (firstStep) firstStep.classList.add("active");
    });
  }

  // Mobile Hub Tabs Switcher (Synchronizes view on mobile screens)
  const hubMobileNav = $("#hubMobileNav");
  const hubNavTabs = $$(".hub-nav-tab", hubMobileNav);
  const hubQuizCard = $("#hubQuizCard");
  const memberPassCard = $("#memberPassCard");

  if (hubMobileNav && hubNavTabs.length) {
    hubNavTabs.forEach(tab => {
      tab.addEventListener("click", () => {
        hubNavTabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        const target = tab.getAttribute("data-tab");
        if (target === "quiz" && hubQuizCard) {
          hubQuizCard.scrollIntoView({ behavior: "smooth", block: "start" });
        } else if (target === "pass" && memberPassCard) {
          memberPassCard.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }

  // Claim domain on Virtual Member Pass
  const passDomainInput = $("#passDomainInput");
  const holoDomain = $("#holoDomain");

  if (applyToPassBtn) {
    applyToPassBtn.addEventListener("click", () => {
      const profile = domainProfiles[detectedDomainKey] || domainProfiles.ai;
      if (passDomainInput) {
        passDomainInput.value = profile.selectVal;
        passDomainInput.dispatchEvent(new Event("change"));
      }
      if (holoDomain) {
        holoDomain.classList.remove("badge-updated");
        void holoDomain.offsetWidth; // Trigger reflow
        holoDomain.classList.add("badge-updated");
      }

      // Activate Pass tab on mobile
      if (hubNavTabs && hubNavTabs.length) {
        hubNavTabs.forEach(t => t.classList.toggle("active", t.getAttribute("data-tab") === "pass"));
      }

      // Smooth scroll to member pass card
      if (memberPassCard) {
        memberPassCard.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  // ========================================================================
  // ========================================================================
  // Live Member Pass Synchronization (Tied to Official College Identity)
  // ========================================================================
  const passNameInput = $("#passNameInput");
  const passRegInput = $("#passRegInput");
  const passDeptInput = $("#passDeptInput");
  const passYearInput = $("#passYearInput");
  const holoName = $("#holoName");
  const holoDept = $("#holoDept");
  const holoYear = $("#holoYear");
  const holoSerial = $("#holoSerial");
  const holoQrImg = $("#holoQrImg");
  const passStatusMsg = $("#passStatusMsg");
  const sharePassBtn = $("#sharePassBtn");

  // Feedback status notifier
  function showPassStatus(message, isSuccess = true) {
    if (!passStatusMsg) return;
    passStatusMsg.textContent = message;
    passStatusMsg.className = `pass-status-msg ${isSuccess ? "success" : "error"}`;
    clearTimeout(passStatusMsg._statusTimer);
    passStatusMsg._statusTimer = setTimeout(() => {
      passStatusMsg.textContent = "";
      passStatusMsg.className = "pass-status-msg";
    }, 4500);
  }

  // Get active site base URL (handles GitHub Pages, Vercel, or custom domains)
  const getBaseUrl = () => {
    if (window.location.protocol.startsWith("http")) {
      return window.location.origin + window.location.pathname;
    }
    return "https://mkceclub.vercel.app/";
  };

  // Generate dynamic Scannable Verification QR Payload URL
  const getVerificationPayloadUrl = () => {
    const name = (passNameInput && passNameInput.value.trim()) || "Innovator Student";
    const reg = (passRegInput && passRegInput.value.trim()) || "927622BCS045";
    const dept = (passDeptInput && passDeptInput.value) || "CSBS";
    const year = (passYearInput && passYearInput.value) || "2nd Year";
    const domain = (passDomainInput && passDomainInput.value) || "AI Systems";
    const serial = `ITF-2026-${reg}`;

    const params = new URLSearchParams({
      verify: "1",
      id: serial,
      name: name,
      reg: reg,
      dept: dept,
      year: year,
      domain: domain
    });
    return `${getBaseUrl()}?${params.toString()}`;
  };

  const updatePassDetails = () => {
    const nameVal = passNameInput ? passNameInput.value.trim() : "";
    if (holoName) {
      holoName.textContent = (nameVal || "Innovator Student").toUpperCase();
    }
    if (holoDept && passDeptInput) {
      holoDept.textContent = passDeptInput.value || "CSBS";
    }
    if (holoYear && passYearInput) {
      holoYear.textContent = passYearInput.value || "2nd Year";
    }
    if (holoDomain && passDomainInput) {
      holoDomain.textContent = passDomainInput.value || "AI Systems";
    }
    const regVal = passRegInput ? passRegInput.value.trim() : "";
    if (holoSerial) {
      holoSerial.textContent = `ITF-2026-${regVal || "927622BCS045"}`;
    }

    // Generate real, high-resolution scannable QR Code image (Client-side offline or API)
    if (holoQrImg) {
      const verifyUrl = getVerificationPayloadUrl();
      if (typeof QRCode !== "undefined") {
        try {
          const tempDiv = document.createElement("div");
          new QRCode(tempDiv, {
            text: verifyUrl,
            width: 320,
            height: 320,
            colorDark: "#091224",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.M
          });
          setTimeout(() => {
            const c = tempDiv.querySelector("canvas");
            if (c) {
              holoQrImg.src = c.toDataURL("image/png");
              return;
            }
            const im = tempDiv.querySelector("img");
            if (im && im.src) {
              holoQrImg.src = im.src;
            }
          }, 30);
        } catch (_) {
          holoQrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(verifyUrl)}&margin=1&format=png`;
        }
      } else {
        holoQrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(verifyUrl)}&margin=1&format=png`;
      }
    }
  };

  if (passNameInput) passNameInput.addEventListener("input", updatePassDetails);
  if (passRegInput) passRegInput.addEventListener("input", updatePassDetails);
  if (passDeptInput) passDeptInput.addEventListener("change", updatePassDetails);
  if (passYearInput) passYearInput.addEventListener("change", updatePassDetails);
  if (passDomainInput) passDomainInput.addEventListener("change", updatePassDetails);

  // Initial update
  updatePassDetails();

  // ========================================================================
  // 3D Holographic Card Interactive Tilt & Shimmer Glare Effect
  // ========================================================================
  const hologramStage = $("#hologramStage");
  const holoCard = $("#holoCard");

  if (hologramStage && holoCard) {
    const handleMove = (clientX, clientY) => {
      const rect = holoCard.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Card tilt rotation (-12deg to +12deg)
      const rotateX = ((centerY - y) / centerY) * 12;
      const rotateY = ((x - centerX) / centerX) * 14;

      // Shimmer reflection position (0% to 100%)
      const shimmerX = Math.round((x / rect.width) * 100);
      const shimmerY = Math.round((y / rect.height) * 100);

      holoCard.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
      holoCard.style.setProperty("--shimmer-x", `${shimmerX}%`);
      holoCard.style.setProperty("--shimmer-y", `${shimmerY}%`);
    };

    hologramStage.addEventListener("pointermove", e => {
      handleMove(e.clientX, e.clientY);
    });

    hologramStage.addEventListener("pointerleave", () => {
      holoCard.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    });

    // Touch support for mobile devices
    hologramStage.addEventListener("touchmove", e => {
      if (e.touches && e.touches[0]) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    hologramStage.addEventListener("touchend", () => {
      holoCard.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    });
  }

  // Helper function to safely load logo without tainting canvas
  function loadLogoImage() {
    return new Promise(resolve => {
      let resolved = false;
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          const domLogo = document.querySelector(".holo-logo");
          resolve(domLogo || null);
        }
      }, 2000);

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          resolve(img);
        }
      };
      img.onerror = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          const domLogo = document.querySelector(".holo-logo");
          resolve(domLogo || null);
        }
      };
      img.src = "assets/logo.png";
    });
  }

  // Helper function to safely load AAROH logo without tainting canvas
  function loadAarohImage() {
    return new Promise(resolve => {
      let resolved = false;
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          const domLogo = document.querySelector(".holo-aaroh-logo");
          resolve(domLogo || null);
        }
      }, 2000);

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          resolve(img);
        }
      };
      img.onerror = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          const domLogo = document.querySelector(".holo-aaroh-logo");
          resolve(domLogo || null);
        }
      };
      img.src = "assets/aaroh-logo.jpg";
    });
  }

  // Helper function to load high-resolution QR image (Instant client-side offline or API fallback)
  function loadQrImage() {
    return new Promise(resolve => {
      const payloadUrl = getVerificationPayloadUrl();

      // 1. Try local client-side QRCode library (Instant, 100% offline in PWA)
      if (typeof QRCode !== "undefined") {
        try {
          const tempDiv = document.createElement("div");
          new QRCode(tempDiv, {
            text: payloadUrl,
            width: 480,
            height: 480,
            colorDark: "#091224",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.M
          });

          setTimeout(() => {
            const qrCanvas = tempDiv.querySelector("canvas");
            if (qrCanvas) return resolve(qrCanvas);
            const qrImg = tempDiv.querySelector("img");
            if (qrImg && qrImg.src) return resolve(qrImg);
            fetchQrFromApi(payloadUrl).then(resolve);
          }, 35);
          return;
        } catch (e) {
          console.warn("Client QRCode fallback to API:", e);
        }
      }

      fetchQrFromApi(payloadUrl).then(resolve);
    });
  }

  function fetchQrFromApi(payloadUrl) {
    return new Promise(resolve => {
      let resolved = false;
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve(null);
        }
      }, 2500);

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          resolve(img);
        }
      };
      img.onerror = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          resolve(null);
        }
      };
      img.src = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(payloadUrl)}&margin=1&format=png`;
    });
  }

  // Helper function to draw rounded rectangles
  function roundRect(c, x, y, w, h, r) {
    if (c.roundRect) {
      c.beginPath();
      c.roundRect(x, y, w, h, r);
      c.closePath();
      return;
    }
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }

  // Convert canvas to Blob safely across all browsers
  function canvasToBlob(canvas, mimeType = "image/png", quality = 0.98) {
    return new Promise(resolve => {
      if (canvas.toBlob) {
        canvas.toBlob(b => resolve(b), mimeType, quality);
      } else {
        const dataUrl = canvas.toDataURL(mimeType, quality);
        const arr = dataUrl.split(",");
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        resolve(new Blob([u8arr], { type: mime }));
      }
    });
  }

  // Universal File Exporter (Supports Web Share API on mobile app / PWA, plus Blob URL download)
  async function triggerFileDownload(blob, filename, mimeType, title) {
    // 1. Try native Web Share API with file (works smoothly in PWA & mobile browsers)
    try {
      const file = new File([blob], filename, { type: mimeType });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: title,
          text: `Official Member Pass - Innovators Tech Forum, MKCE`
        });
        return true;
      }
    } catch (shareErr) {
      if (shareErr.name === 'AbortError') {
        return true; // User dismissed share sheet
      }
      console.warn("Share sheet bypassed, using direct blob download", shareErr);
    }

    // 2. Direct Blob download link (works universally in desktop & mobile browsers)
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(blobUrl), 15000);
    return true;
  }

  // ========================================================================
  // Ultra-HD 300+ DPI Pass Canvas Engine (1800 x 2520 px Razor-Sharp Portrait Replica)
  // Perfectly reproduces the holographic member pass with zero HTML2Canvas artifacts
  // ========================================================================
  async function generatePassCanvas() {
    const name = (passNameInput && passNameInput.value.trim()) || "Innovator Student";
    const reg = (passRegInput && passRegInput.value.trim()) || "927622BCS045";
    const dept = (passDeptInput && passDeptInput.value) || "CSBS";
    const year = (passYearInput && passYearInput.value) || "2nd Year";
    const domain = (passDomainInput && passDomainInput.value) || "AI Systems";
    const serial = `ITF-2026-${reg}`;

    // Parallel preload of club logo, AAROH logo & high-res QR code
    const [logoImg, aarohImg, qrImg] = await Promise.all([loadLogoImage(), loadAarohImage(), loadQrImage()]);

    const baseW = 600;
    const baseH = 840;
    const scale = 3; // 3x Supersampling for 300+ DPI print & Retina clarity (1800 x 2520 px)
    const cardRadius = 32;

    const canvas = document.createElement("canvas");
    canvas.width = baseW * scale;
    canvas.height = baseH * scale;

    const ctx = canvas.getContext("2d");
    ctx.scale(scale, scale);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const padX = 42;
    const padR = baseW - padX;

    // 1. Base Card Background (Deep Luxury Acrylic Navy with Rounded Corner Clipping)
    ctx.save();
    roundRect(ctx, 4, 4, baseW - 8, baseH - 8, cardRadius);
    ctx.clip();

    const bgGrad = ctx.createLinearGradient(0, 0, baseW, baseH);
    bgGrad.addColorStop(0, "#081022");
    bgGrad.addColorStop(0.5, "#0d1a38");
    bgGrad.addColorStop(1, "#0a1329");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, baseW, baseH);

    // Subtle holographic light sheen across the upper section
    const sheenGrad = ctx.createLinearGradient(0, 0, baseW, baseH * 0.7);
    sheenGrad.addColorStop(0, "rgba(255, 255, 255, 0.04)");
    sheenGrad.addColorStop(0.3, "rgba(0, 183, 195, 0.08)");
    sheenGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.12)");
    sheenGrad.addColorStop(0.7, "rgba(0, 120, 212, 0.05)");
    sheenGrad.addColorStop(1, "transparent");
    ctx.fillStyle = sheenGrad;
    ctx.fillRect(0, 0, baseW, baseH);
    ctx.restore();

    // 2. Outer Prismatic Holographic Rim
    ctx.save();
    roundRect(ctx, 4, 4, baseW - 8, baseH - 8, cardRadius);
    const borderGrad = ctx.createLinearGradient(0, 0, baseW, baseH);
    borderGrad.addColorStop(0, "rgba(0, 183, 195, 0.95)");
    borderGrad.addColorStop(0.25, "rgba(0, 120, 212, 0.85)");
    borderGrad.addColorStop(0.5, "rgba(242, 80, 34, 0.85)");
    borderGrad.addColorStop(0.75, "rgba(127, 186, 0, 0.85)");
    borderGrad.addColorStop(1, "rgba(255, 185, 0, 0.95)");
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = borderGrad;
    ctx.stroke();
    ctx.restore();

    // 3. Row 1: Top Header (ITF Logo + Title + AAROH Logo)
    const logoBoxX = padX;
    const logoBoxY = 44;
    const logoBoxSize = 56;

    // White rounded container for ITF Logo
    roundRect(ctx, logoBoxX, logoBoxY, logoBoxSize, logoBoxSize, 12);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    if (logoImg) {
      ctx.save();
      roundRect(ctx, logoBoxX + 4, logoBoxY + 4, logoBoxSize - 8, logoBoxSize - 8, 8);
      ctx.clip();
      ctx.drawImage(logoImg, logoBoxX + 4, logoBoxY + 4, logoBoxSize - 8, logoBoxSize - 8);
      ctx.restore();
    }

    // Title & Subtitle beside Logo
    const titleX = logoBoxX + logoBoxSize + 16;
    ctx.textAlign = "left";
    ctx.font = "800 24px 'Segoe UI', Arial, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("INNOVATORS TECH FORUM", titleX, logoBoxY + 25);

    ctx.font = "600 15px 'Segoe UI', Arial, sans-serif";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("A Microsoft Club · Under AAROH", titleX, logoBoxY + 48);

    // AAROH Logo Box on Top Right (Replacing MKCE text)
    const aarohBoxSize = 56;
    const aarohBoxX = padR - aarohBoxSize;
    const aarohBoxY = logoBoxY;
    roundRect(ctx, aarohBoxX, aarohBoxY, aarohBoxSize, aarohBoxSize, 12);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    if (aarohImg) {
      ctx.save();
      roundRect(ctx, aarohBoxX + 4, aarohBoxY + 4, aarohBoxSize - 8, aarohBoxSize - 8, 8);
      ctx.clip();
      ctx.drawImage(aarohImg, aarohBoxX + 4, aarohBoxY + 4, aarohBoxSize - 8, aarohBoxSize - 8);
      ctx.restore();
    } else {
      ctx.font = "800 16px 'Segoe UI', Arial, sans-serif";
      ctx.fillStyle = "#091224";
      ctx.textAlign = "center";
      ctx.fillText("AAROH", aarohBoxX + aarohBoxSize / 2, aarohBoxY + 34);
    }

    // 4. Row 2: Member ID Pill
    const pillH = 46;
    const pillW = 500;
    const pillX = (baseW - pillW) / 2;
    const pillY = 135;

    roundRect(ctx, pillX, pillY, pillW, pillH, pillH / 2);
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.fill();
    ctx.strokeStyle = "rgba(56, 189, 248, 0.45)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.textAlign = "left";
    ctx.font = "800 14px 'Segoe UI', Arial, sans-serif";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText("MEMBER ID", pillX + 24, pillY + 29);

    ctx.textAlign = "right";
    ctx.font = "700 21px 'Consolas', 'Courier New', monospace";
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(56, 189, 248, 0.6)";
    ctx.shadowBlur = 8;
    ctx.fillText(serial, pillX + pillW - 24, pillY + 30);
    ctx.shadowBlur = 0;

    // 5. Row 3: Member Full Name (Centered Horizontally)
    const nameY = 258;
    ctx.textAlign = "center";
    ctx.font = "900 36px 'Segoe UI', Arial, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(0, 0, 0, 0.85)";
    ctx.shadowBlur = 14;
    ctx.fillText(name.toUpperCase(), baseW / 2, nameY);
    ctx.shadowBlur = 0;

    // 6. Row 4: Department & Academic Year + Domain Pill (Centered Row)
    const deptYearText = `${dept}  •  ${year}  •`;
    ctx.font = "700 20px 'Segoe UI', Arial, sans-serif";
    const deptW = ctx.measureText(deptYearText).width;

    ctx.font = "800 16px 'Segoe UI', Arial, sans-serif";
    const domW = ctx.measureText(domain).width;
    const domPillW = domW + 32;
    const domPillH = 36;

    const totalDetailsW = deptW + 12 + domPillW;
    const startDetailsX = (baseW - totalDetailsW) / 2;
    const detailsBaselineY = 328;

    ctx.textAlign = "left";
    ctx.font = "700 20px 'Segoe UI', Arial, sans-serif";
    ctx.fillStyle = "#cbd5e1";
    ctx.fillText(deptYearText, startDetailsX, detailsBaselineY + 6);

    // Domain Pill
    const domPillX = startDetailsX + deptW + 12;
    const domPillY = detailsBaselineY - 18;
    roundRect(ctx, domPillX, domPillY, domPillW, domPillH, domPillH / 2);
    const pillGrad = ctx.createLinearGradient(domPillX, domPillY, domPillX + domPillW, domPillY + domPillH);
    pillGrad.addColorStop(0, "#0078D4");
    pillGrad.addColorStop(1, "#00B7C3");
    ctx.fillStyle = pillGrad;
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.font = "800 16px 'Segoe UI', Arial, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText(domain, domPillX + domPillW / 2, domPillY + 23);

    // 7. Row 5: Thin Divider Line
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padX, 390);
    ctx.lineTo(padR, 390);
    ctx.stroke();

    // 8. Row 6: Bottom Section (College Info on Left, Large QR Code on Right)
    // Substantially Enlarged Scannable QR Code Box (250x250 px, crisp white background & padding)
    const qrSize = 250;
    const qrX = padR - qrSize;
    const qrY = 440;

    roundRect(ctx, qrX, qrY, qrSize, qrSize, 22);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
    ctx.lineWidth = 3;
    ctx.stroke();

    if (qrImg) {
      ctx.save();
      roundRect(ctx, qrX + 16, qrY + 16, qrSize - 32, qrSize - 32, 12);
      ctx.clip();
      ctx.drawImage(qrImg, qrX + 16, qrY + 16, qrSize - 32, qrSize - 32);
      ctx.restore();
    }

    // College Information (Left side)
    const colX = padX;
    const colY = 510;
    ctx.textAlign = "left";
    ctx.font = "800 21px 'Segoe UI', Arial, sans-serif";
    ctx.fillStyle = "#f1f5f9";
    ctx.fillText("M. KUMARASAMY", colX, colY);
    ctx.fillText("COLLEGE OF", colX, colY + 28);
    ctx.fillText("ENGINEERING", colX, colY + 56);

    ctx.font = "500 15px 'Segoe UI', Arial, sans-serif";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("Autonomous · Affiliated", colX, colY + 98);
    ctx.fillText("to Anna University", colX, colY + 120);

    // Official Verified Pass Badge (Bottom Left)
    const badgeY = colY + 155;
    roundRect(ctx, colX, badgeY, 160, 34, 17);
    ctx.fillStyle = "rgba(0, 183, 195, 0.15)";
    ctx.fill();
    ctx.strokeStyle = "rgba(0, 183, 195, 0.45)";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.font = "800 13px 'Segoe UI', Arial, sans-serif";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText("✓ OFFICIAL MEMBER", colX + 14, badgeY + 22);

    return { canvas, name, reg, serial };
  }

  // Direct Blob download trigger (always triggers direct download on all devices)
  function directDownloadBlob(blob, filename) {
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 15000);
  }

  // Get high-resolution rendered pass canvas for downloads
  async function getRenderedPassCanvas() {
    const { canvas } = await generatePassCanvas();
    return canvas;
  }

  // ========================================================================
  // Direct Download: High-Quality Standard ISO CR80 Pass in PDF
  // ========================================================================
  const downloadPdfBtn = $("#downloadPdfBtn");

  if (downloadPdfBtn) {
    downloadPdfBtn.addEventListener("click", async () => {
      const origText = downloadPdfBtn.textContent;
      downloadPdfBtn.textContent = "Generating PDF... ⏳";
      downloadPdfBtn.disabled = true;

      try {
        const name = (passNameInput && passNameInput.value.trim()) || "Innovator Student";
        const reg = (passRegInput && passRegInput.value.trim()) || "927622BCS045";
        const cleanReg = reg.replace(/[/\\?%*:|"<>]/g, "-");

        const canvas = await getRenderedPassCanvas();

        const jspdfModule = window.jspdf;
        if (jspdfModule && jspdfModule.jsPDF) {
          const { jsPDF } = jspdfModule;

          // Calculate dynamic aspect ratio to prevent squishing or distortion
          const canvasW = canvas.width;
          const canvasH = canvas.height;
          const ratio = canvasH / canvasW;

          let pdfW, pdfH, orientation;
          if (ratio > 1) {
            // Portrait pass
            pdfW = 60.0;
            pdfH = Number((60.0 * ratio).toFixed(2));
            orientation = "portrait";
          } else {
            // Landscape pass
            pdfW = 85.6;
            pdfH = Number((85.6 * ratio).toFixed(2));
            orientation = "landscape";
          }

          const doc = new jsPDF({
            orientation: orientation,
            unit: "mm",
            format: [pdfW, pdfH],
            compress: true
          });

          // High quality image embedding in PDF
          const imgData = canvas.toDataURL("image/jpeg", 0.98);
          doc.addImage(imgData, "JPEG", 0, 0, pdfW, pdfH, undefined, "FAST");

          const pdfBlob = doc.output("blob");
          directDownloadBlob(pdfBlob, `ITF-Member-Pass-${cleanReg}.pdf`);

          showPassStatus("✓ Member Pass downloaded successfully", true);
          downloadPdfBtn.textContent = "PDF Downloaded! ✅";
          downloadPdfBtn.style.background = "#107c41";
        } else {
          // Robust Fallback: print popup formatted to standard card dimensions
          const imgData = canvas.toDataURL("image/png");
          const printWin = window.open("", "_blank");
          if (printWin) {
            printWin.document.write(`
              <!DOCTYPE html>
              <html>
              <head>
                <title>ITF Member Pass - ${name}</title>
                <style>
                  body { margin: 0; padding: 0; background: #000; display: flex; align-items: center; justify-content: center; height: 100vh; }
                  img { max-width: 90vw; max-height: 90vh; object-fit: contain; }
                </style>
              </head>
              <body>
                <img src="${imgData}" onload="window.print();" />
              </body>
              </html>
            `);
            printWin.document.close();
          }
          showPassStatus("✓ Member Pass downloaded successfully", true);
          downloadPdfBtn.textContent = "Print / PDF Ready! ✅";
        }
      } catch (err) {
        console.error("Pass PDF export error:", err);
        showPassStatus("Unable to download the pass. Please try again.", false);
        downloadPdfBtn.textContent = "Error generating PDF";
      } finally {
        setTimeout(() => {
          downloadPdfBtn.textContent = origText;
          downloadPdfBtn.style.background = "";
          downloadPdfBtn.disabled = false;
        }, 2500);
      }
    });
  }

  // ========================================================================
  // Direct Download: High-Resolution (2x–3x) PNG Image
  // Automatically saves as: ITF-Member-Pass-[REGISTER_NUMBER].png
  // ========================================================================
  const handleDownloadPassPng = async () => {
    const downloadBtns = document.querySelectorAll("#downloadPassBtn, .download-pass-img, #downloadImageBtn");
    const origTexts = Array.from(downloadBtns).map(b => b.textContent);
    downloadBtns.forEach(b => {
      b.textContent = "Generating PNG... ⏳";
      b.disabled = true;
    });

    try {
      const reg = (passRegInput && passRegInput.value.trim()) || "927622BCS045";
      const cleanReg = reg.replace(/[/\\?%*:|"<>]/g, "-");
      const filename = `ITF-Member-Pass-${cleanReg}.png`;

      const canvas = await getRenderedPassCanvas();
      const pngBlob = await canvasToBlob(canvas, "image/png");

      directDownloadBlob(pngBlob, filename);

      showPassStatus("✓ Member Pass downloaded successfully", true);
      downloadBtns.forEach(b => {
        b.textContent = "Downloaded! ✅";
        b.style.background = "#107c41";
      });
    } catch (err) {
      console.error("Pass PNG export error:", err);
      showPassStatus("Unable to download the pass. Please try again.", false);
      downloadBtns.forEach(b => {
        b.textContent = "Download Failed ❌";
      });
    } finally {
      setTimeout(() => {
        downloadBtns.forEach((b, i) => {
          b.textContent = origTexts[i] || "🖼️ Download PNG";
          b.style.background = "";
          b.disabled = false;
        });
      }, 2500);
    }
  };

  const downloadPassBtns = document.querySelectorAll("#downloadPassBtn, .download-pass-img, #downloadImageBtn");
  downloadPassBtns.forEach(btn => {
    btn.addEventListener("click", handleDownloadPassPng);
  });

  // ========================================================================
  // Share Pass Button Functionality (Web Share API with Clipboard Fallback)
  // ========================================================================
  function copyShareText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showPassStatus("✓ Member pass details copied to clipboard!", true);
      }).catch(() => {
        fallbackCopyText(text);
      });
    } else {
      fallbackCopyText(text);
    }
  }

  function fallbackCopyText(text) {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      showPassStatus("✓ Member pass details copied to clipboard!", true);
    } catch (_) {
      showPassStatus("Unable to share pass. Please copy link manually.", false);
    }
  }

  if (sharePassBtn) {
    sharePassBtn.addEventListener("click", async () => {
      const name = (passNameInput && passNameInput.value.trim()) || "Innovator Student";
      const reg = (passRegInput && passRegInput.value.trim()) || "927622BCS045";
      const dept = (passDeptInput && passDeptInput.value) || "CSBS";
      const year = (passYearInput && passYearInput.value) || "2nd Year";
      const domain = (passDomainInput && passDomainInput.value) || "AI Systems";
      const verifyUrl = getVerificationPayloadUrl();
      const shareTitle = `ITF Official Member Pass - ${name}`;
      const shareText = `Check out my official Innovators Tech Forum (A Microsoft Club @ MKCE) Member Pass! 🚀\nMember: ${name} (${reg})\nDepartment: ${dept} · ${year}\nDomain: ${domain}\nVerify credential: ${verifyUrl}`;

      if (navigator.share) {
        try {
          await navigator.share({
            title: shareTitle,
            text: shareText,
            url: verifyUrl
          });
          showPassStatus("✓ Member Pass shared successfully", true);
        } catch (shareErr) {
          if (shareErr.name !== "AbortError") {
            copyShareText(shareText);
          }
        }
      } else {
        copyShareText(shareText);
      }
    });
  }

  // ========================================================================
  // Instant QR Code Verification Reader (Triggered by Smartphone Camera Scan)
  // ========================================================================
  const checkVerificationOnLoad = () => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("verify") === "1" || params.has("id")) {
      const vModal = $("#verify-modal");
      if (!vModal) return;

      const vName = $("#verify-name");
      const vReg = $("#verify-reg");
      const vDept = $("#verify-dept");
      const vDomain = $("#verify-domain");
      const vId = $("#verify-id");

      if (vName && params.has("name")) vName.textContent = params.get("name");
      if (vReg && params.has("reg")) vReg.textContent = params.get("reg");
      const dept = params.get("dept") || "CSBS";
      const year = params.get("year") || "3rd Year";
      if (vDept) vDept.textContent = `${dept} · ${year}`;
      if (vDomain && params.has("domain")) vDomain.textContent = params.get("domain");
      if (vId && params.has("id")) vId.textContent = params.get("id");

      vModal.classList.add("open");
      vModal.setAttribute("aria-hidden", "false");
    }
  };

  // Run on page initialization
  checkVerificationOnLoad();

  // Verification modal close triggers
  const verifyModal = $("#verify-modal");
  const verifyClose = $("#verify-modal-close");
  const verifyDone = $("#verify-done-btn");
  const closeVerify = () => {
    if (verifyModal) {
      verifyModal.classList.remove("open");
      verifyModal.setAttribute("aria-hidden", "true");
    }
  };

  if (verifyClose) verifyClose.onclick = closeVerify;
  if (verifyDone) verifyDone.onclick = closeVerify;
  if (verifyModal) {
    verifyModal.onclick = e => {
      if (e.target === verifyModal) closeVerify();
    };
  }
})();

