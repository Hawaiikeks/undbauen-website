import { members, events } from "./data.js";
import { getIcon } from "./components/icons.js";
import { memberModal } from "./components/memberModal.js";
import { heroAnimation } from "./components/heroAnimation.js";
import { hoverCard } from "./components/hoverCard.js";

const $ = (s) => document.querySelector(s);

const sanitizeHTML = (str) => {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

const debounce = (fn, wait) => {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
};

// --- Events ---

const renderPublicEvents = () => {
  const wrap = $("#publicEvents");
  if (!wrap) return;

  const evs = events.slice().sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  if (evs.length === 0) {
    wrap.innerHTML = '<div class="p-xl text-center text-muted">Keine Termine verfügbar.</div>';
    return;
  }

  wrap.innerHTML = evs.map((ev, i) => {
    const isBlurred = i >= 2;
    const [y, m, d] = (ev.date || '').split('-');
    const dateObj   = y ? new Date(+y, +m - 1, +d) : null;
    const dayName   = dateObj ? dateObj.toLocaleDateString('de-DE', { weekday: 'short' }) : '';
    const dateShort = dateObj ? `${d}.${m}.${y}` : '';
    return `
      <div class="event-card-compact-small${isBlurred ? ' event-card-blurred' : ''}">
        <div class="event-card-accent"></div>
        <div class="event-card-content-small">
          <div class="event-card-top">
            <span class="event-badge">${sanitizeHTML(ev.format || '')}</span>
          </div>
          <h3 class="event-card-title-small">${sanitizeHTML(ev.title || '')}</h3>
          <div class="event-card-meta-small">
            ${dayName ? `<span class="event-meta-item">${getIcon('calendar', 13)} ${dayName}, ${dateShort}</span>` : ''}
            ${ev.time ? `<span class="event-meta-item">${getIcon('clock', 13)} ${sanitizeHTML(ev.time)} Uhr</span>` : ''}
          </div>
        </div>
        ${isBlurred ? '<div class="event-card-blur-overlay"><span>Nur für Mitglieder sichtbar</span></div>' : ''}
      </div>
    `;
  }).join("");
};

// --- Social Proof ---

const renderSocialProof = () => {
  const wrap = $("#socialProofStats");
  if (!wrap) return;

  const total = 35;

  wrap.innerHTML = `
    <div class="stat-card">
      <div class="stat-number" id="statTotalMembers">0</div>
      <div class="stat-label">Mitglieder</div>
    </div>
  `;

  const el = $("#statTotalMembers");
  if (!el) return;
  let n = 0;
  const timer = setInterval(() => {
    n++;
    el.textContent = n;
    if (n >= total) clearInterval(timer);
  }, 1000 / total);
};

// --- Network Slider ---

let currentFilter = "all";
let currentSort   = "newest";
let allMembers    = [];

function setupNetworkFilters() {
  const filterChips = $("#filterChips");
  const sortSelect  = $("#sortSelect");
  if (!filterChips || !sortSelect) return;

  const skills = new Set();
  allMembers.forEach(m => (m.stichwoerter || []).forEach(s => skills.add(s)));

  Array.from(skills).sort().slice(0, 10).forEach(skill => {
    const chip = document.createElement("button");
    chip.className    = "filter-chip";
    chip.textContent  = skill;
    chip.dataset.filter = skill;
    chip.addEventListener("click", () => {
      document.querySelectorAll(".filter-chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      currentFilter = skill;
      updateNetworkSlider();
    });
    filterChips.appendChild(chip);
  });

  sortSelect.addEventListener("change", (e) => { currentSort = e.target.value; updateNetworkSlider(); });

  filterChips.querySelector('[data-filter="all"]')?.addEventListener("click", () => {
    document.querySelectorAll(".filter-chip").forEach(c => c.classList.remove("active"));
    filterChips.querySelector('[data-filter="all"]').classList.add("active");
    currentFilter = "all";
    updateNetworkSlider();
  });
}

function filterAndSortMembers(list) {
  let result = currentFilter === "all"
    ? [...list]
    : list.filter(m => m.stichwoerter?.includes(currentFilter));

  if (currentSort === "alphabetical") {
    result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  } else if (currentSort === "activity") {
    result.sort((a, b) =>
      ((b.catchphrase?.length > 20 ? 1 : 0) + (b.stichwoerter?.length || 0)) -
      ((a.catchphrase?.length > 20 ? 1 : 0) + (a.stichwoerter?.length || 0))
    );
  }
  return result;
}

function renderCard(p) {
  const name      = sanitizeHTML(p.name || '');
  const taetigkeit = sanitizeHTML(p.taetigkeit || 'Mitglied');
  const location  = sanitizeHTML(p.location || '');
  const chips     = (p.stichwoerter || []).slice(0, 3).map(s => sanitizeHTML(s));
  const initials  = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return `
    <div class="person-card" data-name="${name}" role="listitem" tabindex="0"
         aria-label="Profil von ${name}, ${taetigkeit}">
      <div class="person-image-container">
        ${p.photo ? `<img src="${p.photo}" alt="${name}" class="person-image" loading="lazy"
          onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />` : ''}
        <div class="person-image-placeholder" style="${p.photo ? 'display:none;' : ''}">${initials}</div>
      </div>
      <div class="person-card-content">
        <div class="person-name">${name}</div>
        <div class="person-role">${taetigkeit}</div>
        ${chips.length ? `<div class="chips mt-sm">${chips.map(s => `<span class="chip">${s}</span>`).join('')}</div>` : ''}
      </div>
    </div>
  `;
}

function renderNetworkSlider() {
  const slider = $("#peopleSlider");
  if (!slider) return;

  const notice = $("#networkGuestNotice");
  if (notice) notice.style.display = "none";

  allMembers = members.slice();
  setupNetworkFilters();
  updateNetworkSlider();
}

function updateNetworkSlider() {
  const slider  = $("#peopleSlider");
  const prevBtn = $("#prevBtn");
  const nextBtn = $("#nextBtn");
  if (!slider) return;

  const list = filterAndSortMembers(allMembers);

  if (list.length === 0) {
    slider.innerHTML = '<div class="p-xl text-center text-muted">Keine Mitglieder gefunden.</div>';
    if (prevBtn) prevBtn.classList.add("hidden");
    if (nextBtn) nextBtn.classList.add("hidden");
    return;
  }

  if (prevBtn) prevBtn.classList.remove("hidden");
  if (nextBtn) nextBtn.classList.remove("hidden");

  const getVisible = () => {
    if (window.innerWidth <= 480)  return 1;
    if (window.innerWidth <= 768)  return 2;
    if (window.innerWidth <= 1024) return 3;
    return 4;
  };

  let index = 0;
  const SHIFT = 2;

  function render() {
    const visible = getVisible();
    const page = Array.from({ length: visible }, (_, i) => list[(index + i) % list.length]);
    slider.innerHTML = page.map(renderCard).join("");

    slider.querySelectorAll(".person-card").forEach(card => {
      const person = list.find(p => sanitizeHTML(p.name || '') === card.dataset.name);
      if (!person) return;

      card.addEventListener("click", () => memberModal.show(person));

      let hoverTimeout;
      card.addEventListener("mouseenter", () => {
        hoverTimeout = setTimeout(() => hoverCard.show(person, card), 500);
      });
      card.addEventListener("mouseleave", () => {
        clearTimeout(hoverTimeout);
        hoverCard.hide();
      });
    });
  }

  prevBtn?.addEventListener("click", () => { index = (index - SHIFT + list.length) % list.length; render(); });
  nextBtn?.addEventListener("click", () => { index = (index + SHIFT) % list.length; render(); });

  slider.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft")  { index = (index - SHIFT + list.length) % list.length; render(); }
    if (e.key === "ArrowRight") { index = (index + SHIFT) % list.length; render(); }
  });

  window.addEventListener("resize", debounce(render, 250));
  render();
}

// --- FAQ ---

function renderFAQ() {
  const wrap = $("#faqContainer");
  if (!wrap) return;

  const faqs = [
    {
      question: "Wie kann ich Mitglied werden?",
      answer: "Sie können über den Button 'Kontakt aufnehmen' eine E-Mail an <a href='mailto:kontakt@undbauen.de' class='faq-link'>kontakt@undbauen.de</a> senden, um Ihr Interesse an einer Mitgliedschaft mitzuteilen. Alternativ können Sie Ihre Anfrage auch eigenständig per E-Mail an <a href='mailto:kontakt@undbauen.de' class='faq-link'>kontakt@undbauen.de</a> senden."
    },
    {
      question: "Was kostet die Mitgliedschaft?",
      answer: "Die Mitgliedschaft ist aktuell kostenlos. …undbauen ist ein unabhängiges Netzwerk-Format, das sich über Partner und Unterstützer finanziert."
    },
    {
      question: "Wie funktionieren die Innovationsabende?",
      answer: "Die Innovationsabende finden regelmäßig statt und kombinieren Impulsvorträge mit moderierten Diskussionen. Inhalte werden von eingeladenen Expert:innen oder im gemeinsamen Austausch erarbeitet."
    },
    {
      question: "Kann ich auch ohne Mitgliedschaft teilnehmen?",
      answer: "Die öffentlichen Informationen auf der Website sind für alle zugänglich. Für die aktive Teilnahme an Veranstaltungen und die Nutzung der Netzwerk-Funktionen ist eine Mitgliedschaft erforderlich."
    },
    {
      question: "Wer kann Mitglied werden?",
      answer: "Das Netzwerk richtet sich an Fachleute aus Architektur, Ingenieurwesen, Bauwesen und digitaler Planung. Wir freuen uns über Praktiker:innen, Entscheider:innen, Forschende und Gestalter:innen, die sich aktiv mit der Weiterentwicklung der gebauten Umwelt beschäftigen."
    },
    {
      question: "Werden die Veranstaltungen auch online angeboten?",
      answer: "Unsere Veranstaltungen finden überwiegend online statt. Ergänzend bieten wir je nach Format auch hybride oder reine Präsenzveranstaltungen an."
    }
  ];

  wrap.innerHTML = faqs.map((faq, i) => `
    <div class="faq-item">
      <button class="faq-question" id="faq-question-${i}"
              aria-expanded="false" aria-controls="faq-answer-${i}" type="button">
        <span>${faq.question}</span>
        <span class="faq-icon" aria-hidden="true">+</span>
      </button>
      <div class="faq-answer" id="faq-answer-${i}"
           role="region" aria-labelledby="faq-question-${i}">
        <div class="faq-answer-content"><p class="p">${faq.answer}</p></div>
      </div>
    </div>
  `).join("");

  wrap.querySelectorAll(".faq-question").forEach(btn => {
    btn.addEventListener("click", () => {
      const isOpen = btn.getAttribute("aria-expanded") === "true";

      wrap.querySelectorAll(".faq-question").forEach(other => {
        other.setAttribute("aria-expanded", "false");
        const ans = document.getElementById(other.getAttribute("aria-controls"));
        if (ans) { ans.classList.remove("faq-answer-open"); ans.style.maxHeight = null; }
        const icon = other.querySelector(".faq-icon");
        if (icon) icon.textContent = "+";
      });

      if (!isOpen) {
        btn.setAttribute("aria-expanded", "true");
        const ans = document.getElementById(btn.getAttribute("aria-controls"));
        if (ans) { ans.classList.add("faq-answer-open"); ans.style.maxHeight = ans.scrollHeight + "px"; }
        const icon = btn.querySelector(".faq-icon");
        if (icon) icon.textContent = "−";
      }
    });
  });
}

// --- Theme ---

const initTheme = () => {
  const theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeIcon(theme);
};

const updateThemeIcon = (theme) => {
  const btn = $("#themeToggle");
  if (!btn) return;
  let icon = btn.querySelector('.icon-theme');
  if (!icon) {
    icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('class', 'icon icon-theme');
    icon.setAttribute('width', '20');    icon.setAttribute('height', '20');
    icon.setAttribute('viewBox', '0 0 24 24'); icon.setAttribute('fill', 'none');
    icon.setAttribute('stroke', 'currentColor'); icon.setAttribute('stroke-width', '1.5');
    icon.setAttribute('stroke-linecap', 'round'); icon.setAttribute('stroke-linejoin', 'round');
    icon.setAttribute('aria-hidden', 'true');
    btn.appendChild(icon);
  }
  icon.innerHTML = theme === 'dark'
    ? '<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path>'
    : '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
  btn.setAttribute("aria-pressed", theme === 'dark' ? "true" : "false");
  btn.setAttribute("aria-label", theme === 'dark' ? "Zu hellem Theme wechseln" : "Zu dunklem Theme wechseln");
};

const toggleTheme = () => {
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  updateThemeIcon(next);
};

// --- Mobile Menu ---

const toggleMobileMenu = () => {
  const toggle = $("#mobileMenuToggle");
  const nav    = $("#navLinks");
  if (!toggle || !nav) return;
  const isOpen = toggle.getAttribute("aria-expanded") === "true";
  toggle.setAttribute("aria-expanded", String(!isOpen));
  nav.setAttribute("aria-hidden", String(isOpen));
  document.body.style.overflow = isOpen ? "" : "hidden";
};

const closeMobileMenu = () => {
  $("#mobileMenuToggle")?.setAttribute("aria-expanded", "false");
  $("#navLinks")?.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
};

// --- Init ---

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  heroAnimation?.init?.();
  memberModal?.init?.();

  renderPublicEvents();
  renderSocialProof();
  renderNetworkSlider();
  renderFAQ();

  $("#mobileMenuToggle")?.addEventListener("click", toggleMobileMenu);
  $("#themeToggle")?.addEventListener("click", toggleTheme);

  document.querySelectorAll(".navLinks a").forEach(link =>
    link.addEventListener("click", () => { if (window.innerWidth <= 768) closeMobileMenu(); })
  );

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { closeMobileMenu(); }
  });

  const ctaEmail    = $("#ctaEmail");
  const ctaTextarea = $("#ctaMessage");
  const ctaMailto   = $("#ctaMailto");
  if (ctaEmail && ctaTextarea && ctaMailto) {
    ctaTextarea.value = [
      "Hallo \u2026undbauen-Team,",
      "",
      "ich w\u00FCrde gerne am n\u00E4chsten Innovationsabend teilnehmen.",
      "",
      "Kurz zu mir: [Dein Name], [Dein Hintergrund / Branche].",
      "Von \u2026undbauen erfahren habe ich durch: [z. B. Social Media / Empfehlung].",
      "",
      "Nat\u00FCrlich kannst du auch eine eigene Nachricht oder andere Anliegen an uns schreiben.",
      "",
      "Viele Grüße Lukas"
    ].join("\n");

    const updateMailto = () => {
      const email = ctaEmail.value.trim();
      const msg   = ctaTextarea.value.trim();
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      ctaMailto.classList.toggle("btn-disabled", !valid);
      ctaMailto.setAttribute("aria-disabled", String(!valid));
      if (!valid) { ctaMailto.removeAttribute("href"); return; }
      const body = encodeURIComponent(
        msg + "\n\n" +
        "Meine E-Mail: " + email
      );
      ctaMailto.href = `mailto:kontakt@undbauen.de?subject=Interesse%20an%20Mitgliedschaft&body=${body}`;
    };
    ctaEmail.addEventListener("input", updateMailto);
    ctaTextarea.addEventListener("input", updateMailto);
    updateMailto();
  }
});
