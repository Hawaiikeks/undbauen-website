import { api } from "./services/apiClient.js";
// Note: Some imports might fail if the files don't exist yet, but they should be in the develop branch
import { toast } from "./components/toast.js";
import { getIcon } from "./components/icons.js";
import { memberModal } from "./components/memberModal.js";

const $ = (s)=>document.querySelector(s);

// Make api available globally for search component
window.api = api;

/**
 * Opens the authentication modal
 */
const openAuth = () => {
  const overlay = $("#authOverlay");
  const authErr = $("#authErr");
  const regErr = $("#regErr");
  
  if (overlay) overlay.style.display = "flex";
  if (authErr) authErr.textContent = "";
  if (regErr) regErr.textContent = "";
};

/**
 * Closes the authentication modal
 */
const closeAuth = () => {
  const overlay = $("#authOverlay");
  if (overlay) overlay.style.display = "none";
};

/**
 * Sets the active tab in the authentication modal
 */
const setTab = (t) => {
  if (!t) return;

  const tabs = document.querySelectorAll(".tab");
  tabs.forEach(x => {
    const isActive = x.dataset.tab === t;
    x.classList.toggle("active", isActive);
    if (x.hasAttribute("role") && x.getAttribute("role") === "tab") {
      x.setAttribute("aria-selected", isActive ? "true" : "false");
    }
  });

  const loginPanel = $("#panel-login");
  const registerPanel = $("#panel-register");
  const forgotPanel = $("#panel-forgot");
  const authTitle = $("#authTitle");

  if (loginPanel) {
    if (t === "login") {
      loginPanel.classList.remove("tab-panel-hidden");
      loginPanel.setAttribute("aria-hidden", "false");
    } else {
      loginPanel.classList.add("tab-panel-hidden");
      loginPanel.setAttribute("aria-hidden", "true");
    }
  }

  if (registerPanel) {
    if (t === "register") {
      registerPanel.classList.remove("tab-panel-hidden");
      registerPanel.setAttribute("aria-hidden", "false");
    } else {
      registerPanel.classList.add("tab-panel-hidden");
      registerPanel.setAttribute("aria-hidden", "true");
    }
  }

  if (forgotPanel) {
    if (t === "forgot") {
      forgotPanel.classList.remove("tab-panel-hidden");
      forgotPanel.setAttribute("aria-hidden", "false");
    } else {
      forgotPanel.classList.add("tab-panel-hidden");
      forgotPanel.setAttribute("aria-hidden", "true");
    }
  }

  if (authTitle) {
    const titles = {
      login: "Login",
      register: "Registrieren",
      forgot: "Passwort vergessen"
    };
    authTitle.textContent = titles[t] || "Login";
  }
};

/**
 * Sanitizes a string to prevent XSS attacks
 */
const sanitizeHTML = (str) => {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

/**
 * Renders the mixed feed (Events + Updates)
 */
function renderMixedFeed(){
  const wrap = $("#publicMixedFeed");
  if(!wrap) return;

  try {
    const evs = api.listEvents().slice().sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)).slice(0,3).map(ev => ({
      type: 'event',
      title: ev.title,
      date: ev.date,
      time: ev.time,
      format: ev.format,
      html: `
        <div class="card ${ev.format === 'Innovationsabend' ? 'highlighted-card' : ''}" style="padding:16px">
          <div style="display:flex;justify-content:space-between;gap:10px">
            <div style="font-weight:900">${sanitizeHTML(ev.title)}</div>
            <span class="badge blue">Termin</span>
          </div>
          <div class="metaLine" style="margin-top:8px">
            <span>📅 ${sanitizeHTML(ev.date)}</span>
            <span>⏰ ${sanitizeHTML(ev.time)}</span>
          </div>
          <div class="hr"></div>
          <div style="display:flex; gap:10px; margin-top:10px">
            <a href="innovationsabend.html" class="btn primary">Details</a>
            <button class="btn secondary" data-open-auth>Buchen</button>
          </div>
        </div>
      `
    }));

    const updates = api.listUpdatesPublic().map(x => ({
      type: 'update',
      date: x.createdAt || "",
      html: `
        <div class="card" style="padding:16px">
          <div style="display:flex;justify-content:space-between;gap:10px">
            <div style="font-weight:900">${sanitizeHTML(x.title)}</div>
            <span class="badge">Update</span>
          </div>
          <p class="p" style="margin-top:8px">${sanitizeHTML(x.intro)}</p>
          <div class="hr"></div>
          <div class="chips">${(x.highlights||[]).slice(0,3).map(h=>`<span class="chip">${sanitizeHTML(h)}</span>`).join("")}</div>
          <div style="margin-top:12px">
            <button class="btn" data-open-auth>Lesen</button>
          </div>
        </div>
      `
    }));

    const mixed = [];
    const max = Math.max(evs.length, updates.length);
    for(let i=0; i<max; i++){
      if(evs[i]) mixed.push(evs[i].html);
      if(updates[i]) mixed.push(updates[i].html);
    }

    wrap.innerHTML = mixed.length > 0 ? mixed.join("") : '<div class="p-xl text-center text-muted">Keine Inhalte verfügbar.</div>';
    wrap.querySelectorAll("[data-open-auth]").forEach(b=>b.addEventListener("click", openAuth));
  } catch (error) {
    console.error("Error rendering mixed feed:", error);
  }
}

/**
 * Renders public publications
 */
const renderPublicPubs = () => {
  const wrap = $("#publicPubs");
  if (!wrap) return;

  try {
    let items = api.listPublicationsPublic().slice(0, 3);
    
    // Bilder für Publikationen
    const pubImages = [
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=200&h=150&fit=crop',
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=200&h=150&fit=crop',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&h=150&fit=crop'
    ];

    if (items.length === 0) {
      wrap.innerHTML = '<div class="p-xl text-center text-muted">Keine Publikationen verfügbar.</div>';
      return;
    }
    
    wrap.innerHTML = items.map((x, idx) => {
      const imageUrl = pubImages[idx % pubImages.length];
      const title = sanitizeHTML(x.title || '');
      const abstract = sanitizeHTML(x.abstract || '');
      const abstractShort = abstract.length > 100 ? abstract.substring(0, 100) + '...' : abstract;
      const tags = (x.tags || []).slice(0, 4).map(t => sanitizeHTML(t));
      
      return `
      <div class="pub-card-compact">
        <div class="pub-image-compact">
          <img src="${imageUrl}" alt="${title}" loading="lazy" />
        </div>
        <div class="pub-content-compact" style="padding: 1rem;">
          <div class="font-bold" style="font-size:14px;">${title}</div>
          <p class="p mt-sm" style="font-size:13px;line-height:1.5;">${abstractShort}</p>
          ${tags.length > 0 ? `<div class="chips mt-sm" style="font-size:11px;">${tags.map(t => `<span class="chip">${t}</span>`).join("")}</div>` : ''}
        </div>
      </div>
    `;
    }).join("");
  } catch (error) {
    console.error("Error rendering public publications:", error);
  }
};

/**
 * Renders testimonials
 */
function renderTestimonials(){
  const wrap = $("#testimonialsGrid");
  if(!wrap) return;
  
  const testimonials = [
    {
      name: "Dr. Sarah Müller",
      role: "Architektin & BIM-Expertin",
      company: "Müller Architekten",
      quote: "…undbauen hat mir geholfen, wertvolle Kontakte in der Branche zu knüpfen. Die Veranstaltungen sind immer inspirierend und der Austausch auf Augenhöhe ist genau das, was ich gesucht habe.",
      avatar: null
    },
    {
      name: "Thomas Weber",
      role: "Projektleiter Digitalisierung",
      company: "BauTech GmbH",
      quote: "Die Plattform verbindet Theorie und Praxis auf eine Weise, die ich sonst nirgendwo finde. Besonders die Diskussionen im Forum sind sehr bereichernd.",
      avatar: null
    }
  ];
  
  wrap.innerHTML = testimonials.map(t => `
    <div class="testimonial-card">
      <div class="testimonial-quote">
        <p class="testimonial-text">${t.quote}</p>
      </div>
      <div class="testimonial-author" style="margin-top:1rem; display:flex; align-items:center; gap:10px">
        <div class="testimonial-avatar" style="width:40px; height:40px; border-radius:50%; background:var(--bg-accent); display:flex; align-items:center; justify-content:center; font-weight:bold">
          ${t.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div class="testimonial-info">
          <div class="testimonial-name" style="font-weight:bold">${t.name}</div>
          <div class="testimonial-meta" style="font-size:0.8rem; color:var(--text-muted)">${t.role}, ${t.company}</div>
        </div>
      </div>
    </div>
  `).join("");
}

/**
 * Renders partners
 */
function renderPartners(){
  const wrap = $("#partnersGrid");
  if(!wrap) return;
  
  const partners = ["Partner 1", "Partner 2", "Partner 3", "Partner 4"];
  
  wrap.innerHTML = partners.map(p => `
    <div class="partner-placeholder" style="padding:1rem; border:1px solid var(--border); border-radius:8px; text-align:center">
      <span>${p}</span>
    </div>
  `).join("");
}

/**
 * Renders FAQ
 */
function renderFAQ(){
  const wrap = $("#faqContainer");
  if(!wrap) return;
  
  const faqs = [
    {
      question: "Wie kann ich Mitglied werden?",
      answer: "Sie können sich über den 'Bauen'-Button registrieren."
    },
    {
      question: "Was kostet die Mitgliedschaft?",
      answer: "Die Mitgliedschaft ist aktuell kostenlos."
    }
  ];
  
  wrap.innerHTML = faqs.map((faq, index) => `
    <div class="faq-item" style="margin-bottom:1rem; border-bottom:1px solid var(--border); padding-bottom:1rem">
      <button class="faq-question" style="width:100%; text-align:left; background:none; border:none; font-weight:bold; cursor:pointer; display:flex; justify-content:space-between">
        <span>${faq.question}</span>
        <span>+</span>
      </button>
      <div class="faq-answer" style="display:none; margin-top:0.5rem">
        <p>${faq.answer}</p>
      </div>
    </div>
  `).join("");

  wrap.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const ans = btn.nextElementSibling;
      const isVisible = ans.style.display === 'block';
      ans.style.display = isVisible ? 'none' : 'block';
      btn.querySelector('span:last-child').textContent = isVisible ? '+' : '-';
    });
  });
}

/**
 * Theme initialization and toggle
 */
const initTheme = () => {
  let theme = localStorage.getItem('theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeIcon(theme);
};

const updateThemeIcon = (theme) => {
  const btn = $("#themeToggle");
  if(btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
  
  const heroIframe = $(".hero-iframe");
  if (heroIframe && heroIframe.contentWindow) {
    heroIframe.contentWindow.postMessage({ type: 'theme-change', theme: theme }, '*');
  }
};

const toggleTheme = () => {
  const current = document.documentElement.getAttribute('data-theme');
  const newTheme = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
};

/**
 * Mobile Menu
 */
const toggleMobileMenu = () => {
  const nav = $("#navLinks");
  const toggle = $("#mobileMenuToggle");
  if(!nav || !toggle) return;
  const isExpanded = toggle.getAttribute("aria-expanded") === "true";
  toggle.setAttribute("aria-expanded", !isExpanded);
  nav.classList.toggle("active");
};

/**
 * Main Initialization
 */
document.addEventListener("DOMContentLoaded", ()=>{
  initTheme();
  renderMixedFeed();
  renderPublicPubs();
  renderTestimonials();
  renderPartners();
  renderFAQ();

  if($("#themeToggle")) $("#themeToggle").addEventListener("click", toggleTheme);
  if($("#openAuth")) $("#openAuth").addEventListener("click", openAuth);
  if($("#closeAuth")) $("#closeAuth").addEventListener("click", closeAuth);
  if($("#mobileMenuToggle")) $("#mobileMenuToggle").addEventListener("click", toggleMobileMenu);
  
  if($("#authOverlay")) {
    $("#authOverlay").addEventListener("click", (e)=>{ if(e.target.id==="authOverlay") closeAuth(); });
  }

  document.querySelectorAll(".tab").forEach(t=>{
    t.addEventListener("click", ()=>setTab(t.dataset.tab));
  });

  if($("#doLogin")) $("#doLogin").addEventListener("click", async ()=>{
    const email = $("#loginEmail").value;
    const password = $("#loginPass").value;
    const res = api.login(email, password);
    if($("#authErr")) $("#authErr").textContent = res.success ? "" : res.error;
    if(res.success) {
      window.location.href = "app/dashboard.html";
    }
  });

  if($("#doRegister")) $("#doRegister").addEventListener("click", async ()=>{
    const res = await api.register($("#regName").value, $("#regEmail").value, $("#regPass").value);
    if($("#regErr")) $("#regErr").textContent = res.success ? "" : res.error;
    if(res.success) {
      window.location.href = "app/dashboard.html";
    }
  });
});
