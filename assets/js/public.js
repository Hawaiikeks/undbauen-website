import { api } from "./services/apiClient.js";

const $ = (s)=>document.querySelector(s);

function openAuth(){ $("#authOverlay").style.display="flex"; $("#authErr").textContent=""; $("#regErr").textContent=""; }
function closeAuth(){ $("#authOverlay").style.display="none"; }

function setTab(t){
  document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active", x.dataset.tab===t));
  $("#panel-login").style.display = (t==="login")?"block":"none";
  $("#panel-register").style.display = (t==="register")?"block":"none";
  $("#panel-forgot").style.display = (t==="forgot")?"block":"none";
  $("#authTitle").textContent = t==="login" ? "Login" : (t==="register" ? "Registrieren" : "Passwort vergessen");
}

function renderMixedFeed(){
  const wrap = $("#publicMixedFeed");
  if(!wrap) return;

  const evs = api.listEvents().slice().sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)).slice(0,3).map(ev => ({
    type: 'event',
    title: ev.title,
    date: ev.date,
    time: ev.time,
    format: ev.format,
    html: `
      <div class="card" style="padding:16px">
        <div style="display:flex;justify-content:space-between;gap:10px">
          <div style="font-weight:900">${ev.title}</div>
          <span class="badge blue">Termin</span>
        </div>
        <div class="metaLine" style="margin-top:8px">
          <span>📅 ${ev.date}</span>
          <span>⏰ ${ev.time}</span>
        </div>
        <div class="hr"></div>
        <p class="p">Innovationsabend: Einloggen zum Buchen.</p>
        <div style="margin-top:10px">
          <button class="btn primary" data-open-auth>Buchen</button>
        </div>
      </div>
    `
  }));

  const updates = api.listUpdatesPublic().map(x => ({
    type: 'update',
    date: x.createdAt || "", // For sorting if needed
    html: `
      <div class="card" style="padding:16px">
        <div style="display:flex;justify-content:space-between;gap:10px">
          <div style="font-weight:900">${x.title}</div>
          <span class="badge">Update</span>
        </div>
        <p class="p" style="margin-top:8px">${x.intro}</p>
        <div class="hr"></div>
        <div class="chips">${(x.highlights||[]).slice(0,3).map(h=>`<span class="chip">${h}</span>`).join("")}</div>
        <div style="margin-top:12px">
          <button class="btn" data-open-auth>Lesen</button>
        </div>
      </div>
    `
  }));

  // Mix them: alternating or combined
  const mixed = [];
  const max = Math.max(evs.length, updates.length);
  for(let i=0; i<max; i++){
    if(evs[i]) mixed.push(evs[i].html);
    if(updates[i]) mixed.push(updates[i].html);
  }

  wrap.innerHTML = mixed.join("");
  wrap.querySelectorAll("[data-open-auth]").forEach(b=>b.addEventListener("click", openAuth));
}

function renderPublicPubs(){
  const wrap = $("#publicPubs");
  const items = api.listPublicationsPublic();
  wrap.innerHTML = items.map(x => `
    <div class="card" style="padding:16px">
      <div style="font-weight:900">${x.title}</div>
      <p class="p" style="margin-top:6px">${x.abstract}</p>
      <div class="chips" style="margin-top:10px">${(x.tags||[]).slice(0,6).map(t=>`<span class="chip">${t}</span>`).join("")}</div>
      <div style="margin-top:12px">
        <span class="badge">Member-only</span>
        <button class="btn" style="margin-left:8px" data-open-auth>Einloggen</button>
      </div>
    </div>
  `).join("");
  wrap.querySelectorAll("[data-open-auth]").forEach(b=>b.addEventListener("click", openAuth));
}

/* Network Slider */
function getCardsPerView(){
  if(window.innerWidth <= 480) return 1;
  if(window.innerWidth <= 768) return 2;
  if(window.innerWidth <= 1024) return 3;
  return 5;
}

function renderNetworkSlider(){
  const slider = $("#peopleSlider");
  const prevBtn = $("#prevBtn");
  const nextBtn = $("#nextBtn");
  const pagination = $("#pagination");
  const notice = $("#networkGuestNotice");
  
  if(!slider) return;
  
  const isLoggedIn = api.isLoggedIn();
  // Verwende listMembersPublic für öffentliche Ansicht, listMembers für eingeloggte
  let members = [];
  if(isLoggedIn){
    members = api.listMembers("");
  } else {
    // Versuche listMembersPublic, falls nicht verfügbar, hole alle Profile manuell
    if(api.listMembersPublic){
      members = api.listMembersPublic("");
    } else {
      // Fallback: Hole alle User und filtere nach sichtbaren Profilen
      try {
        const users = JSON.parse(localStorage.getItem("users") || "[]");
        for(const user of users){
          const profileKey = `profile:${user.email.toLowerCase()}`;
          const profile = JSON.parse(localStorage.getItem(profileKey) || "null");
          if(profile && profile.privacy?.visibleInDirectory){
            members.push(profile);
          }
        }
      } catch(e){
        console.error("Error loading public members:", e);
      }
    }
  }
  
  // Notice ausblenden, da Daten jetzt öffentlich sichtbar sind
  if(notice){
    notice.style.display = "none";
  }
  
  if(members.length === 0){
    slider.innerHTML = `<div style="padding:2rem;text-align:center;color:var(--muted)">Noch keine Mitglieder im Netzwerk.</div>`;
    if(prevBtn) prevBtn.style.display = "none";
    if(nextBtn) nextBtn.style.display = "none";
    if(pagination) pagination.innerHTML = "";
    return;
  }
  
  slider.innerHTML = members.map(p => {
    const initials = p.name.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2);
    const skills = [...(p.skills||[]), ...(p.interests||[])].slice(0,4);
    const bio = (p.bio||"").slice(0,150) + ((p.bio||"").length > 150 ? "..." : "");
    const linkedin = p.links?.linkedin || "";
    const website = p.links?.website || "";
    const location = p.location || "";
    // Avatar-Bild generieren mit DiceBear API
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(p.name)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
    
    return `
      <div class="person-card" data-email="${p.email}">
        <div class="person-image-container">
          <img src="${avatarUrl}" alt="${p.name}" class="person-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
          <div class="person-image-placeholder" style="display:none;">${initials}</div>
        </div>
        <div class="person-card-content">
          <div class="person-name">${p.name}</div>
          <div class="person-role">${p.headline || "Mitglied"}</div>
          ${location ? `<div class="person-location">📍 ${location}</div>` : ""}
          <div class="person-info">${bio || "Mitglied des Netzwerks"}</div>
          ${skills.length ? `<div class="chips" style="margin-top:10px;margin-bottom:10px">${skills.map(s=>`<span class="chip">${s}</span>`).join("")}</div>` : ""}
          <div class="person-links" style="display:flex;gap:10px;margin-top:auto;padding-top:10px;border-top:1px solid var(--border);">
            ${linkedin ? `<a href="${linkedin}" target="_blank" rel="noopener noreferrer" class="person-link" onclick="event.stopPropagation();" style="display:flex;align-items:center;gap:5px;color:var(--blue);text-decoration:none;font-size:0.9rem;">
              <span>🔗</span> LinkedIn
            </a>` : ""}
            ${website ? `<a href="${website}" target="_blank" rel="noopener noreferrer" class="person-link" onclick="event.stopPropagation();" style="display:flex;align-items:center;gap:5px;color:var(--blue);text-decoration:none;font-size:0.9rem;">
              <span>🌐</span> Website
            </a>` : ""}
            ${!linkedin && !website ? `<span style="font-size:0.85rem;color:var(--muted);">Kontakt über Netzwerk</span>` : ""}
          </div>
        </div>
      </div>
    `;
  }).join("");
  
  // Click handler für Person Cards
  slider.querySelectorAll(".person-card").forEach(card => {
    card.addEventListener("click", () => {
      const email = card.dataset.email;
      if(isLoggedIn){
        window.location.href = `app/member.html?email=${encodeURIComponent(email)}`;
      } else {
        // Auch ohne Login können Nutzer die Profile sehen, aber für Details müssen sie sich anmelden
        openAuth();
      }
    });
  });
  
  // Slider Logic
  let cardsPerView = getCardsPerView();
  const totalCards = members.length;
  let totalPages = Math.ceil(totalCards / cardsPerView);
  let currentPage = 0;
  
  function updateSlider(){
    cardsPerView = getCardsPerView();
    totalPages = Math.ceil(totalCards / cardsPerView);
    if(currentPage >= totalPages) currentPage = 0;
    
    const translateX = -(currentPage * (100 / cardsPerView));
    slider.style.transform = `translateX(${translateX}%)`;
    
    if(prevBtn) prevBtn.disabled = currentPage === 0;
    if(nextBtn) nextBtn.disabled = currentPage >= totalPages - 1;
    
    updatePagination();
  }
  
  function updatePagination(){
    if(!pagination) return;
    pagination.innerHTML = "";
    for(let i = 0; i < totalPages; i++){
      const dot = document.createElement("div");
      dot.className = "pagination-dot";
      if(i === currentPage) dot.classList.add("active");
      dot.addEventListener("click", () => {
        currentPage = i;
        updateSlider();
      });
      pagination.appendChild(dot);
    }
  }
  
  if(prevBtn) prevBtn.addEventListener("click", () => {
    if(currentPage > 0){
      currentPage--;
      updateSlider();
    }
  });
  
  if(nextBtn) nextBtn.addEventListener("click", () => {
    if(currentPage < totalPages - 1){
      currentPage++;
      updateSlider();
    }
  });
  
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      updateSlider();
    }, 250);
  });
  
  updateSlider();
}

// Theme Toggle
function initTheme(){
  // Check localStorage first
  let theme = localStorage.getItem('theme');
  
  // If no theme in localStorage, use system preference
  if (!theme) {
    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeIcon(theme);
  
  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('theme')) {
      const newTheme = e.matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
      updateThemeIcon(newTheme);
    }
  });
}

function updateThemeIcon(theme){
  const btn = $("#themeToggle");
  if(btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
  
  // Inform hero scene iframe
  const heroIframe = $(".hero-iframe");
  if (heroIframe && heroIframe.contentWindow) {
    heroIframe.contentWindow.postMessage({ type: 'theme-change', theme: theme }, '*');
  }
}

function toggleTheme(){
  const current = document.documentElement.getAttribute('data-theme');
  const newTheme = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
}

document.addEventListener("DOMContentLoaded", ()=>{
  initTheme();
  
  renderMixedFeed();
  renderPublicPubs();

  if($("#themeToggle")) $("#themeToggle").addEventListener("click", toggleTheme);
  if($("#openAuth")) $("#openAuth").addEventListener("click", openAuth);
  if($("#openAuth2")) $("#openAuth2").addEventListener("click", openAuth);
  if($("#closeAuth")) $("#closeAuth").addEventListener("click", closeAuth);
  if($("#authOverlay")) $("#authOverlay").addEventListener("click", (e)=>{ if(e.target.id==="authOverlay") closeAuth(); });
  document.addEventListener("keydown",(e)=>{ if(e.key==="Escape") closeAuth(); });

  document.querySelectorAll(".tab").forEach(t=>t.addEventListener("click", ()=>setTab(t.dataset.tab)));

  if($("#doLogin")) $("#doLogin").addEventListener("click", ()=>{
    try {
      const res = api.login($("#loginEmail").value, $("#loginPass").value);
      if($("#authErr")) $("#authErr").textContent = res.ok ? "" : res.error;
      if(res.ok) window.location.href = "app/dashboard.html";
    } catch(e) {
      console.error("Login error:", e);
      if($("#authErr")) $("#authErr").textContent = "Fehler beim Login. Bitte öffne die Seite über einen lokalen Server (z.B. Live Server).";
    }
  });

  if($("#doRegister")) $("#doRegister").addEventListener("click", ()=>{
    try {
      const res = api.register($("#regName").value, $("#regEmail").value, $("#regPass").value);
      if($("#regErr")) $("#regErr").textContent = res.ok ? "" : res.error;
      if(res.ok) window.location.href = "app/dashboard.html";
    } catch(e) {
      console.error("Register error:", e);
      if($("#regErr")) $("#regErr").textContent = "Fehler bei der Registrierung. Bitte öffne die Seite über einen lokalen Server (z.B. Live Server).";
    }
  });

  if($("#doForgot")) $("#doForgot").addEventListener("click", ()=>{
    if($("#fpOk")) $("#fpOk").textContent = "Wenn ein Konto existiert, senden wir einen Link (MVP: kein Versand).";
  });
});

