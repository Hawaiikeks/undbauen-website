import { api } from "./services/apiClient.js";
import { breadcrumbs } from "./components/breadcrumbs.js";
import { richTextEditor } from "./components/richTextEditor.js";
import { chartRenderer } from "./components/chartRenderer.js";
import { avatarGenerator } from "./components/avatarGenerator.js";

const $ = (s)=>document.querySelector(s);
const qs = new URLSearchParams(location.search);

// Debounce utility for performance
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

function guard(){
  if(!api.isLoggedIn()){
    window.location.href = "../index.html";
    return false;
  }
  return true;
}

// Theme Toggle
function initTheme(){
  const savedTheme = localStorage.getItem('theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

function updateThemeIcon(theme){
  const btn = $("#themeToggle");
  if(btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function toggleTheme(){
  const current = document.documentElement.getAttribute('data-theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const newTheme = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
}

function setShell(){
  initTheme();
  if($("#themeToggle")) $("#themeToggle").addEventListener("click", toggleTheme);
  
  const u = api.me();
  if($("#userLabel")) $("#userLabel").textContent = u?.name || "Member";
  if($("#logoutBtn")) $("#logoutBtn").addEventListener("click", ()=>{ api.logout(); window.location.href="../index.html"; });
  if($("#logoutBtn2")) $("#logoutBtn2").addEventListener("click", ()=>{ api.logout(); window.location.href="../index.html"; });

  // nav active
  const page = document.body.dataset.page;
  const map = {
    dashboard:"dashboard", termine:"termine", forum:"forum",
    "forum-category":"forum", "forum-thread":"forum",
    messages:"nachrichten", compose:"nachrichten",
    members:"mitglieder", member:"mitglieder",
    profile:"einstellungen", settings:"einstellungen",
    admin:"admin"
  };
  const active = map[page];
  document.querySelectorAll("[data-nav]").forEach(a=>a.classList.toggle("active", a.dataset.nav===active));
  if(api.isAdmin() && $("#adminLink")) $("#adminLink").style.display="";
}

function fmtDate(ev){ return `${ev.date} ${ev.time}`; }

function parseTags(str){
  return (str||"").split(",").map(s=>s.trim()).filter(Boolean)
    .filter((v,i,a)=>a.indexOf(v)===i);
}

/* ========== DASHBOARD ========== */
function renderDashboard(){
  const u = api.me();
  const events = api.listEvents().slice().sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));

  // next booked
  const nextBooked = events.find(e => api.getParticipants(e.id).some(p=>p.email.toLowerCase()===u.email.toLowerCase()));
  $("#cardNext").innerHTML = `
    <div class="kpiTitle">Nächster Termin</div>
    ${nextBooked ? `
      <div class="kpiBody" style="cursor: pointer;" data-open-event="${nextBooked.id}"><b>${nextBooked.title}</b><br/>${fmtDate(nextBooked)} · ${nextBooked.location}</div>
      <div style="margin-top:10px">
        <button class="btn primary" data-open-event="${nextBooked.id}">Details anzeigen</button>
      </div>
    ` : `
      <div class="kpiBody">Noch keine Buchung. Buche deinen nächsten Innovationsabend.</div>
      <div style="margin-top:10px"><a class="btn primary" href="termine.html">Termine ansehen</a></div>
    `}
  `;
  
  // Make booked event clickable
  if(nextBooked){
    $("#cardNext").querySelectorAll("[data-open-event]").forEach(btn => {
      btn.addEventListener("click", () => openBookedEventModal(nextBooked.id));
    });
  }
  
  // Booked event modal wiring (if on dashboard page)
  if($("#bookedEventClose")) {
    $("#bookedEventClose").addEventListener("click", ()=>$("#bookedEventOverlay").style.display="none");
  }
  if($("#bookedEventOverlay")) {
    $("#bookedEventOverlay").addEventListener("click",(e)=>{ 
      if(e.target.id==="bookedEventOverlay") $("#bookedEventOverlay").style.display="none"; 
    });
  }

  // saved preview (MVP: derive from favorites or saved toggle - we used saved toggle in api.saveEvent)
  $("#cardSaved").innerHTML = `
    <div class="kpiTitle">Gespeichert</div>
    <div class="kpiBody">Speichere interessante Termine direkt in der Terminliste.</div>
    <div style="margin-top:10px"><a class="btn" href="termine.html">Öffnen</a></div>
  `;

  // recommendations
  const recs = api.recommendContacts();
  $("#cardRecs").innerHTML = `
    <div class="kpiTitle">Empfohlene Kontakte</div>
    <div class="kpiBody">
      ${recs.length ? recs.slice(0,5).map(p=>`<div style="margin-bottom:8px"><b>${p.name}</b><br/><span class="small">${p.headline||"—"}</span></div>`).join("") : `Noch keine Empfehlungen – ergänze Skills/Interessen im Profil.`}
    </div>
    <div style="margin-top:10px"><a class="btn" href="mitglieder.html">Mitglieder</a></div>
  `;

  // favorites
  const favs = api.getFavorites();
  $("#cardFavs").innerHTML = `
    <div class="kpiTitle">Favoriten ⭐</div>
    <div class="kpiBody">${favs.length ? `${favs.length} gespeichert.` : `Noch keine Favoriten gesetzt.`}</div>
    <div style="margin-top:10px"><span class="badge">Privat</span></div>
  `;

  // notifications
  const n = api.listNotifications().slice(0,6);
  $("#cardNotifs").innerHTML = `
    <div style="font-weight:900">Benachrichtigungen</div>
    <div class="hr"></div>
    ${n.length ? n.map(x=>`<div class="listItem">
      <div><b>${x.title}</b><div class="small">${x.message||""}</div></div>
      <span class="badge ${x.read?"":"blue"}">${x.read?"gelesen":"neu"}</span>
    </div>`).join("") : `<div class="p">Keine neuen Hinweise.</div>`}
  `;

  // activity
  const acts = api.listActivity().slice(0,8);
  $("#cardActivity").innerHTML = `
    <div style="font-weight:900">Meine Aktivitäten</div>
    <div class="hr"></div>
    ${acts.length ? acts.map(a=>`<div class="listItem">
      <div><b>${a.type}</b><div class="small">${a.referenceType} · ${a.referenceId}</div></div>
      <span class="badge">${new Date(a.createdAt).toLocaleString()}</span>
    </div>`).join("") : `<div class="p">Noch keine Aktivitäten.</div>`}
  `;
  
  // Activity chart
  if (window.Chart && $("#activityChart")) {
    const allActivities = api.listActivity();
    setTimeout(() => {
      chartRenderer.renderActivityChart("activityChart", allActivities);
    }, 100);
  }
}

/* ========== EVENTS ========== */
function renderEvents(){
  const wrap = $("#eventsGrid");
  const u = api.me();
  const events = api.listEvents().slice().sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));

  const isBooked = (ev)=> api.getParticipants(ev.id).some(p=>p.email.toLowerCase()===u.email.toLowerCase());
  wrap.innerHTML = events.map(ev=>{
    const count = api.bookingsCount(ev.id);
    const full = count >= ev.capacity;
    return `
      <div class="card" style="padding:16px">
        <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start">
          <div>
            <div style="font-weight:900">${ev.title}</div>
            <div class="metaLine" style="margin-top:6px">
              <span>📅 ${ev.date}</span><span>⏰ ${ev.time}</span>
              <span class="badge">${ev.location}</span>
            </div>
            <div class="chips" style="margin-top:10px">${(ev.tags||[]).slice(0,6).map(t=>`<span class="chip">${t}</span>`).join("")}</div>
          </div>
          <span class="badge blue">${ev.format}</span>
        </div>
        <div class="hr"></div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button class="btn primary" data-book="${ev.id}" ${full||isBooked(ev)?"disabled":""}>${isBooked(ev)?"Gebucht":(full?"Ausgebucht":"Buchen")}</button>
          <button class="btn" data-save="${ev.id}">Speichern</button>
          <button class="btn" data-ics="${ev.id}">ICS</button>
          <button class="btn" data-open="${ev.id}">Details</button>
        </div>
        <div class="small" style="margin-top:10px">Teilnehmer: ${count}/${ev.capacity}</div>
      </div>
    `;
  }).join("");

  wrap.querySelectorAll("[data-book]").forEach(b=>b.addEventListener("click", ()=>{
    const id = b.dataset.book;
    const res = api.bookEvent(id);
    if(!res.ok) toast.error(res.error);
    renderEvents();
  }));
  wrap.querySelectorAll("[data-save]").forEach(b=>b.addEventListener("click", ()=>{
    api.saveEvent(b.dataset.save);
    b.textContent = "Gespeichert ✓";
  }));
  wrap.querySelectorAll("[data-ics]").forEach(b=>b.addEventListener("click", ()=>api.exportICSForEvent(b.dataset.ics)));
  wrap.querySelectorAll("[data-open]").forEach(b=>b.addEventListener("click", ()=>openEventModal(b.dataset.open)));

  $("#exportBooked").addEventListener("click", ()=>api.exportICSForBooked());

  // modal wiring
  $("#evClose").addEventListener("click", ()=>$("#evOverlay").style.display="none");
  $("#evOverlay").addEventListener("click",(e)=>{ if(e.target.id==="evOverlay") $("#evOverlay").style.display="none"; });
}

function openEventModal(eventId){
  const ev = api.getEvent(eventId);
  if(!ev) return;
  const threadId = api.ensureEventThread(eventId);
  const parts = api.getParticipants(eventId).slice(0,12);
  $("#evTitle").textContent = ev.title;
  $("#evBody").innerHTML = `
    <div class="metaLine">
      <span class="badge blue">${ev.format}</span>
      <span class="badge">📅 ${ev.date}</span>
      <span class="badge">⏰ ${ev.time}</span>
      <span class="badge">${ev.location}</span>
    </div>
    <div class="hr"></div>
    <div class="p">${ev.descriptionMember || ""}</div>
    <div class="hr"></div>
    <div style="font-weight:900">Teilnehmer (Preview)</div>
    <div class="small">Nur sichtbar für eingeloggte Nutzer (MVP). Später: nur für gebuchte.</div>
    <div style="margin-top:10px">
      ${parts.length ? parts.map(p=>`<div class="listItem"><div><b>${p.email}</b></div><span class="badge">participant</span></div>`).join("") : `<div class="p">Noch keine Teilnehmer.</div>`}
    </div>
    <div style="margin-top:12px; display:flex; gap:10px; flex-wrap:wrap">
      <a class="btn primary" href="forum-thread.html?thread=${encodeURIComponent(threadId)}">Zum Event-Thread</a>
      <button class="btn" onclick="navigator.clipboard.writeText(location.href)">Link kopieren</button>
    </div>
  `;
  $("#evOverlay").style.display="flex";
}

function openBookedEventModal(eventId){
  const ev = api.getEvent(eventId);
  if(!ev) return;
  const u = api.me();
  const isBooked = api.getParticipants(eventId).some(p=>p.email.toLowerCase()===u.email.toLowerCase());
  if(!isBooked) return;
  
  const threadId = api.ensureEventThread(eventId);
  const parts = api.getParticipants(eventId);
  const count = parts.length;
  
  // Extract Teams link from location or use teamsLink field if available
  const teamsLink = ev.teamsLink || (ev.location && ev.location.includes("Teams") ? extractTeamsLink(ev.location) : null);
  
  // Format time with duration
  const endTime = ev.durationMinutes ? calculateEndTime(ev.time, ev.durationMinutes) : null;
  
  $("#bookedEventTitle").textContent = ev.title;
  $("#bookedEventBody").innerHTML = `
    <div class="metaLine">
      <span class="badge blue">${ev.format}</span>
    </div>
    <div class="hr"></div>
    <div style="margin-bottom:12px">
      <div style="font-weight:600; margin-bottom:8px">📅 Datum & Uhrzeit</div>
      <div class="p">${fmtDate(ev)}</div>
      <div class="p">${ev.time}${endTime ? ` - ${endTime}` : ''}${ev.durationMinutes ? ` (${ev.durationMinutes} Min.)` : ''}</div>
    </div>
    <div class="hr"></div>
    <div style="margin-bottom:12px">
      <div style="font-weight:600; margin-bottom:8px">📍 Ort</div>
      <div class="p">${ev.location || "Nicht angegeben"}</div>
    </div>
    ${teamsLink ? `
    <div class="hr"></div>
    <div style="margin-bottom:12px">
      <div style="font-weight:600; margin-bottom:8px">🔗 Teams-Link</div>
      <div style="margin-bottom:8px">
        <a href="${teamsLink}" target="_blank" rel="noopener noreferrer" class="btn primary">Zu Teams beitreten</a>
      </div>
      <div class="small">${teamsLink}</div>
    </div>
    ` : ''}
    ${ev.descriptionMember ? `
    <div class="hr"></div>
    <div style="margin-bottom:12px">
      <div style="font-weight:600; margin-bottom:8px">Beschreibung</div>
      <div class="p">${ev.descriptionMember}</div>
    </div>
    ` : ''}
    <div class="hr"></div>
    <div style="margin-bottom:12px">
      <div style="font-weight:600; margin-bottom:8px">Teilnehmer</div>
      <div class="p">${count}/${ev.capacity || "∞"}</div>
    </div>
    <div class="hr"></div>
    <div style="margin-top:12px; display:flex; gap:10px; flex-wrap:wrap">
      <button class="btn primary" data-ics-export="${eventId}">ICS Export</button>
      <a class="btn" href="forum-thread.html?thread=${encodeURIComponent(threadId)}">Zum Event-Thread</a>
      <button class="btn danger" data-cancel-booking="${eventId}">Buchung stornieren</button>
    </div>
  `;
  
  // Wire up buttons
  const overlay = $("#bookedEventOverlay");
  overlay.querySelector(`[data-ics-export="${eventId}"]`)?.addEventListener("click", () => {
    api.exportICSForEvent(eventId);
  });
  
  overlay.querySelector(`[data-cancel-booking="${eventId}"]`)?.addEventListener("click", () => {
    if(confirm(`Möchtest du die Buchung für "${ev.title}" wirklich stornieren?`)){
      const res = api.cancelBooking(eventId);
      if(res.ok){
        alert("Buchung erfolgreich storniert.");
        overlay.style.display = "none";
        renderDashboard();
      } else {
        alert(res.error || "Fehler beim Stornieren.");
      }
    }
  });
  
  overlay.style.display = "flex";
}

function extractTeamsLink(location){
  // Try to extract Teams link from location string
  // This is a simple implementation - can be enhanced
  const match = location.match(/(https?:\/\/[^\s]+)/);
  return match ? match[1] : null;
}

function calculateEndTime(startTime, durationMinutes){
  const [hours, minutes] = startTime.split(':').map(Number);
  const start = new Date();
  start.setHours(hours, minutes, 0, 0);
  const end = new Date(start.getTime() + durationMinutes * 60000);
  return `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;
}

/* ========== FORUM ========== */
function renderForum(){
  // Show loading state
  const catGrid = $("#catGrid");
  if (!catGrid) return;
  
  catGrid.innerHTML = '<div class="p-xl text-center text-muted">Lade Forum...</div>';
  
  setTimeout(() => {
    const cats = api.listForumCategories();
    $("#catGrid").innerHTML = cats.map(c=>{
    const lastThreadInfo = c.lastThread ? `
      <div class="small" style="margin-top:8px; color:var(--text-secondary)">
        <div>Letzter Thread: <strong>${c.lastThread.title.length > 40 ? c.lastThread.title.substring(0, 40) + '...' : c.lastThread.title}</strong></div>
        <div style="margin-top:4px">${new Date(c.lastThread.lastActivityAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
      </div>
    ` : '<div class="small" style="margin-top:8px; color:var(--text-muted)">Noch keine Threads</div>';
    
    return `
    <a class="card forum-category-card" href="forum-kategorie.html?cat=${encodeURIComponent(c.id)}" style="padding:20px; text-decoration:none; display:block">
      <div style="display:flex; align-items:start; gap:12px">
        <div style="font-size:32px; line-height:1">${c.icon || '💬'}</div>
        <div style="flex:1">
          <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:8px">
            <div style="font-weight:900; font-size:18px">${c.title}</div>
            <div class="badge" style="background:var(--primary); color:white">${c.topicCount} ${c.topicCount === 1 ? 'Thread' : 'Threads'}</div>
          </div>
          <p class="p" style="margin-top:4px; color:var(--text-secondary); font-size:14px">${c.desc}</p>
          ${lastThreadInfo}
        </div>
      </div>
    </a>
  `;
  }).join("");
  }, 300);
}

// Forum Search Function
function performForumSearch(query) {
  const searchLower = query.toLowerCase();
  const threads = api.getForumThreads();
  const results = [];
  
  // Search in threads
  threads.forEach(thread => {
    const titleMatch = thread.title.toLowerCase().includes(searchLower);
    const categoryMatch = thread.categoryId?.toLowerCase().includes(searchLower);
    
    if (titleMatch || categoryMatch) {
      results.push({
        type: 'thread',
        id: thread.id,
        title: thread.title,
        category: thread.categoryId,
        match: titleMatch ? 'title' : 'category',
        thread: thread
      });
    }
    
    // Search in posts
    const posts = api.getForumPosts(thread.id);
    posts.forEach(post => {
      if (post.body && post.body.toLowerCase().includes(searchLower)) {
        const bodyText = post.body.replace(/<[^>]*>/g, '').substring(0, 150);
        results.push({
          type: 'post',
          id: post.id,
          threadId: thread.id,
          threadTitle: thread.title,
          body: bodyText,
          author: post.authorEmail,
          match: 'body',
          post: post
        });
      }
    });
  });
  
  // Display results
  if (results.length > 0) {
    $("#catGrid").style.display = "none";
    $("#forumSearchResults").style.display = "block";
    
    // Highlight search term
    const highlight = (text) => {
      const regex = new RegExp(`(${query})`, 'gi');
      return text.replace(regex, '<mark style="background:var(--primary); color:white; padding:2px 4px; border-radius:3px">$1</mark>');
    };
    
    $("#forumSearchResultsList").innerHTML = `
      <div class="small" style="color:var(--text-secondary); margin-bottom:12px">${results.length} Ergebnis${results.length === 1 ? '' : 'se'} gefunden</div>
      ${results.map(r => {
        if (r.type === 'thread') {
          return `
            <div class="card" style="padding:16px; margin-bottom:12px">
              <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:8px">
                <div>
                  <div style="font-weight:600; font-size:16px; margin-bottom:4px">
                    <a href="forum-thread.html?thread=${encodeURIComponent(r.id)}" style="text-decoration:none; color:var(--primary)">
                      ${highlight(r.title)}
                    </a>
                  </div>
                  <div class="small" style="color:var(--text-secondary)">
                    Kategorie: ${r.category} · ${r.thread.replyCount || 0} Antworten
                  </div>
                </div>
                <span class="badge">Thread</span>
              </div>
            </div>
          `;
        } else {
          return `
            <div class="card" style="padding:16px; margin-bottom:12px">
              <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:8px">
                <div style="flex:1">
                  <div class="small" style="color:var(--text-secondary); margin-bottom:4px">
                    Post in: <a href="forum-thread.html?thread=${encodeURIComponent(r.threadId)}" style="color:var(--primary)">${r.threadTitle}</a>
                  </div>
                  <div style="font-size:14px; line-height:1.6; color:var(--text-primary)">
                    ${highlight(r.body)}...
                  </div>
                  <div class="small" style="color:var(--text-secondary); margin-top:8px">
                    Von: ${r.author.split('@')[0]}
                  </div>
                </div>
                <span class="badge">Post</span>
              </div>
            </div>
          `;
        }
      }).join('')}
    `;
  } else {
    $("#catGrid").style.display = "none";
    $("#forumSearchResults").style.display = "block";
    $("#forumSearchResultsList").innerHTML = `
      <div style="text-align:center; padding:48px 24px; color:var(--text-secondary)">
        <div style="font-size:64px; margin-bottom:16px; opacity:0.5">🔍</div>
        <div style="font-size:18px; font-weight:600; margin-bottom:8px; color:var(--text-primary)">Keine Ergebnisse gefunden</div>
        <div style="font-size:14px">Versuche andere Suchbegriffe.</div>
      </div>
    `;
  }
}

function renderForumCategory(){
  const catId = qs.get("cat") || "cat_general";
  const cat = api.listForumCategories().find(c=>c.id===catId);
  $("#catTitle").textContent = cat?.title || "Kategorie";
  $("#catDesc").textContent = cat?.desc || "";

  let threads = api.getForumThreads()
    .filter(t=>t.categoryId===catId && !t.archived);
  
  // Thread-Views initialisieren falls nicht vorhanden
  threads.forEach(t => {
    if (!t.views) t.views = 0;
  });
  
  // Sortierung
  const sortBy = new URLSearchParams(location.search).get('sort') || 'latest';
  let sortedThreads = [...threads];
  if (sortBy === 'popular') {
    sortedThreads.sort((a, b) => {
      const scoreA = (a.replyCount || 0) + (a.views || 0) + (a.likes?.length || 0);
      const scoreB = (b.replyCount || 0) + (b.views || 0) + (b.likes?.length || 0);
      return scoreB - scoreA;
    });
  } else if (sortBy === 'replies') {
    sortedThreads.sort((a, b) => (b.replyCount || 0) - (a.replyCount || 0));
  } else {
    // latest (default) - pinned first
    sortedThreads.sort((a, b) => {
      if (!!b.pinned !== !!a.pinned) return (b.pinned?1:0)-(a.pinned?1:0);
      return (b.lastActivityAt||"").localeCompare(a.lastActivityAt||"");
    });
  }
  
  const author = (email) => {
    const profile = api.getProfileByEmail(email);
    return profile?.name || email.split("@")[0];
  };
  
  $("#threadList").innerHTML = sortedThreads.length ? `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; padding:0 6px">
      <div class="small" style="color:var(--text-secondary)">${sortedThreads.length} ${sortedThreads.length === 1 ? 'Thread' : 'Threads'}</div>
      <select class="select" id="threadSort" style="width:auto; font-size:13px">
        <option value="latest" ${sortBy === 'latest' ? 'selected' : ''}>Neueste zuerst</option>
        <option value="popular" ${sortBy === 'popular' ? 'selected' : ''}>Beliebteste</option>
        <option value="replies" ${sortBy === 'replies' ? 'selected' : ''}>Meiste Antworten</option>
      </select>
    </div>
    ${sortedThreads.map(t=>{
      const lastPostDate = new Date(t.lastActivityAt).toLocaleDateString('de-DE', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      return `
      <div class="listItem forum-thread-item" style="padding:16px; ${t.pinned ? 'border-left:3px solid var(--primary);' : ''}">
        <div style="flex:1">
          <div style="display:flex; align-items:start; gap:8px; margin-bottom:8px">
            <div style="font-weight:900; font-size:16px; flex:1">
              ${t.pinned ? '<span style="color:var(--primary); margin-right:6px">📌</span>' : ''}
              <a href="forum-thread.html?thread=${encodeURIComponent(t.id)}" style="text-decoration:none; color:var(--text-primary)">${t.title}</a>
              ${t.type==="event"?`<span class="badge blue" style="margin-left:8px">Event</span>`:""}
            </div>
          </div>
          <div style="display:flex; gap:16px; flex-wrap:wrap; font-size:13px; color:var(--text-secondary)">
            <span>👤 ${author(t.createdBy)}</span>
            <span>💬 ${t.replyCount || 0} Antworten</span>
            <span>👁️ ${t.views || 0} Aufrufe</span>
            <span>🕒 ${lastPostDate}</span>
          </div>
          ${t.tags && t.tags.length > 0 ? `
            <div style="margin-top:8px; display:flex; gap:6px; flex-wrap:wrap">
              ${t.tags.map(tag => `<span class="badge" style="font-size:11px; padding:2px 8px">${tag}</span>`).join('')}
            </div>
          ` : ''}
        </div>
        <div style="display:flex;gap:8px;align-items:center; margin-left:12px">
          ${t.locked?`<span class="badge warn" title="Geschlossen">🔒</span>`:""}
          <a class="btn small" href="forum-thread.html?thread=${encodeURIComponent(t.id)}">Öffnen</a>
        </div>
      </div>
    `;
    }).join("")}
  ` : emptyState.noThreads("Keine Threads in dieser Kategorie.");
  
  // Empty state button handler
  $("#emptyStateNewThread")?.addEventListener("click", () => {
    $("#newThreadBtn")?.click();
  });
  
  // Sortierung Event Listener
  $("#threadSort")?.addEventListener("change", (e) => {
    const newUrl = new URL(location.href);
    newUrl.searchParams.set('sort', e.target.value);
    location.href = newUrl.toString();
  });

  // new thread modal
  const open = ()=>$("#thrOverlay").style.display="flex";
  const close = ()=>$("#thrOverlay").style.display="none";
  $("#newThreadBtn").addEventListener("click", open);
  $("#thrClose").addEventListener("click", close);
  $("#thrOverlay").addEventListener("click",(e)=>{ if(e.target.id==="thrOverlay") close(); });

  $("#thrCreate").addEventListener("click", async ()=>{
    $("#thrErr").textContent = "";
    const title = $("#thrTitle").value.trim();
    
    // Disable button to prevent double submission
    const btn = $("#thrCreate");
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Wird erstellt...";
    
    try {
      // Get content from Rich Text Editor if available, otherwise from textarea
      let body = "";
      const editorId = "thrBody";
      
      // Check if Quill editor exists for this textarea
      if (richTextEditor.editors.has(editorId)) {
        try {
          // Get HTML content from Quill editor
          body = richTextEditor.getContent(editorId).trim();
          // Also check plain text to ensure there's actual content
          const textOnly = richTextEditor.getText(editorId);
          if (!textOnly || textOnly.trim().length === 0) {
            body = "";
          }
        } catch (e) {
          console.warn("Error getting content from editor:", e);
          // Fallback to textarea
          body = $("#thrBody").value.trim();
        }
      } else if ($("#thrBody")) {
        // Fallback to textarea value if editor not initialized
        body = $("#thrBody").value.trim();
      }
      
      if(!title || !body){ 
        $("#thrErr").textContent="Titel und Text erforderlich."; 
        btn.disabled = false;
        btn.textContent = originalText;
        return; 
      }
      
      const res = api.createForumThread(catId, title, body);
      if(!res.ok){ 
        $("#thrErr").textContent = res.error; 
        btn.disabled = false;
        btn.textContent = originalText;
        return; 
      }
      
      // Success - redirect
      window.location.href = `forum-thread.html?thread=${encodeURIComponent(res.threadId)}`;
    } catch (error) {
      console.error("Error creating thread:", error);
      $("#thrErr").textContent = "Fehler beim Erstellen des Threads. Bitte versuchen Sie es erneut.";
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });
  
  // Initialize Rich Text Editor for new thread after modal opens
  $("#newThreadBtn")?.addEventListener("click", () => {
    // Clear previous content
    if ($("#thrTitle")) $("#thrTitle").value = "";
    if ($("#thrBody")) $("#thrBody").value = "";
    if ($("#thrErr")) $("#thrErr").textContent = "";
    
    // Try to initialize editor, but don't block if it fails
    setTimeout(() => {
      try {
        if (window.Quill && $("#thrBody") && !richTextEditor.editors.has("thrBody")) {
          richTextEditor.createEditor($("#thrBody"));
        } else if (!window.Quill) {
          // Try to load Quill, but don't wait for it
          richTextEditor.init();
          setTimeout(() => {
            try {
              if ($("#thrBody") && !richTextEditor.editors.has("thrBody") && window.Quill) {
                richTextEditor.createEditor($("#thrBody"));
              }
            } catch (e) {
              console.warn("Could not initialize Rich Text Editor, using plain textarea:", e);
            }
          }, 1000);
        }
      } catch (e) {
        console.warn("Rich Text Editor initialization failed, using plain textarea:", e);
        // Editor will fall back to plain textarea
      }
    }, 200);
  });
}

// Process post content: handle spoilers, code blocks, mentions
function processPostContent(content) {
  if (!content) return '';
  
  // Process spoilers - convert data-spoiler to clickable spoilers
  content = content.replace(/<span[^>]*data-spoiler="true"[^>]*class="spoiler-text"[^>]*>(.*?)<\/span>/gi, (match, text) => {
    const id = `spoiler-${Math.random().toString(36).substr(2, 9)}`;
    return `<span class="spoiler-text" id="${id}" onclick="this.classList.toggle('revealed')">${text}</span>`;
  });
  
  // Process mentions - ensure they're clickable
  content = content.replace(/@(\w+)/g, '<span class="mention">@$1</span>');
  
  return content;
}

function renderForumThread(){
  const threadId = qs.get("thread");
  let t = api.getForumThread(threadId);
  if(!t){ $("#threadTitle").textContent="Nicht gefunden"; $("#postsWrap").innerHTML="<div class='p'>Thread existiert nicht.</div>"; return; }
  
  // Views erhöhen (nur einmal pro Session)
  const viewKey = `thread_viewed_${threadId}`;
  if (!sessionStorage.getItem(viewKey)) {
    const threads = api.getForumThreads();
    const updatedThreads = threads.map(thread => 
      thread.id === threadId ? { ...thread, views: (thread.views || 0) + 1 } : thread
    );
    api.saveForumThreads(updatedThreads);
    sessionStorage.setItem(viewKey, 'true');
    t = updatedThreads.find(thread => thread.id === threadId);
  }

  $("#threadTitle").textContent = t.title;
  const u = api.me();
  const isLiked = u && t.likes && t.likes.includes(u.email.toLowerCase());
  const isWatching = u && t.watchedBy && t.watchedBy.includes(u.email.toLowerCase());
  
  $("#threadMeta").innerHTML = `
    <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap">
      <span class="badge">${t.categoryId}</span>
      ${t.type==="event"?`<span class="badge blue">Event</span>`:""}
      ${t.pinned?`<span class="badge">📌 Pinned</span>`:""}
      ${t.locked?`<span class="badge warn">🔒 Locked</span>`:""}
      <span class="badge" style="background:var(--bg)">👁️ ${t.views || 0} Aufrufe</span>
      ${u ? `
        <button class="btn small ${isLiked ? 'primary' : ''}" id="likeThreadBtn" title="Thread liken">
          👍 ${t.likes?.length || 0}
        </button>
        <button class="btn small ${isWatching ? 'primary' : ''}" id="watchThreadBtn" title="Thread beobachten">
          ${isWatching ? '👁️ Beobachten' : '👁️‍🗨️ Beobachten'}
        </button>
      ` : ''}
    </div>
  `;
  
  // Like/Watch Buttons
  if(u){
    $("#likeThreadBtn")?.addEventListener("click", () => {
      const res = api.likeThread(threadId);
      if(res.ok){
        location.reload();
      }
    });
    
    $("#watchThreadBtn")?.addEventListener("click", () => {
      const res = api.watchThread(threadId);
      if(res.ok){
        location.reload();
      }
    });
  }

  const posts = api.getForumPosts(threadId);
  $("#postsWrap").innerHTML = posts.map(p=>{
    const author = api.getProfileByEmail(p.authorEmail) || { name: p.authorEmail.split("@")[0], email: p.authorEmail };
    const authorName = author.name || p.authorEmail.split("@")[0];
    const initials = (authorName || p.authorEmail).split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2);
    const postDate = new Date(p.createdAt).toLocaleDateString('de-DE', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const isOriginalPoster = p.type === 'op' || p.type === 'original';
    const authorProfile = api.getProfileByEmail(p.authorEmail);
    const isAdminUser = authorProfile && api.isAdmin() && p.authorEmail === (api.me()?.email || '');
    const userBadges = [];
    if(isOriginalPoster) userBadges.push('<span class="badge" style="background:var(--primary); color:white; font-size:11px; margin-left:6px">OP</span>');
    if(isAdminUser) userBadges.push('<span class="badge" style="background:var(--accent); color:white; font-size:11px; margin-left:6px">Admin</span>');
    
    return `
    <div class="forum-post-card" id="post-${p.id}">
      <div class="forum-post-header">
        <div class="forum-post-author">
          <div class="forum-post-avatar">${initials}</div>
          <div class="forum-post-meta">
            <div style="display:flex; align-items:center; gap:4px">
              <div class="forum-post-author-name">${authorName}</div>
              ${userBadges.join('')}
            </div>
            <div class="forum-post-date">${postDate} · ${p.type === 'op' || p.type === 'original' ? 'Original' : 'Antwort'}</div>
          </div>
        </div>
      </div>
      <div class="forum-post-content">${p.deleted ? "<p><em>Beitrag wurde entfernt.</em></p>" : processPostContent(p.body || "")}</div>
      ${!p.deleted && u ? `
        <div class="forum-post-actions">
          <button class="forum-reply-button" data-quote-post="${p.id}" title="Zitieren">
            💬 Zitieren
          </button>
          <button class="forum-reply-button" onclick="navigator.clipboard.writeText(window.location.href + '#post-' + '${p.id}')" title="Link kopieren">
            🔗 Link
          </button>
          ${p.authorEmail === u.email ? `
            <button class="forum-reply-button" style="color:var(--danger)" title="Eigenen Post löschen">
              🗑️ Löschen
            </button>
          ` : ''}
        </div>
      ` : ''}
    </div>
  `;
  }).join("");

  if(api.isAdmin()){
    $("#adminThreadTools").style.display="flex";
    $("#pinBtn").textContent = t.pinned ? "Unpin" : "Pin";
    $("#lockBtn").textContent = t.locked ? "Unlock" : "Lock";

    $("#pinBtn").onclick = ()=>{ api.adminPinThread(threadId, !t.pinned); location.reload(); };
    $("#lockBtn").onclick = ()=>{ api.adminLockThread(threadId, !t.locked); location.reload(); };
    $("#delBtn").onclick = ()=>{ if(confirm("Thread wirklich löschen (soft)?")){ api.adminDeleteThread(threadId); window.location.href="forum.html"; } };
  }

  $("#replyBtn").addEventListener("click", ()=>{
    $("#replyErr").textContent="";
    // Get content from Rich Text Editor if available
    let body = "";
    if (window.Quill && $("#replyBody").value) {
      body = $("#replyBody").value.trim();
      const textOnly = richTextEditor.getText("replyBody");
      if (!textOnly || textOnly.trim().length === 0) {
        body = "";
      }
    } else {
      body = $("#replyBody").value.trim();
    }
    if(!body){ $("#replyErr").textContent="Text fehlt."; return; }
    const res = api.replyForumThread(threadId, body);
    if(!res.ok){ $("#replyErr").textContent = res.error; return; }
    location.reload();
  });
  
  // Initialize Rich Text Editor for reply - ensure it works
  setTimeout(() => {
    if (window.Quill) {
      if ($("#replyBody") && !richTextEditor.editors.has("replyBody")) {
        richTextEditor.createEditor($("#replyBody"));
      }
    } else {
      richTextEditor.init();
      setTimeout(() => {
        if ($("#replyBody") && !richTextEditor.editors.has("replyBody")) {
          richTextEditor.createEditor($("#replyBody"));
        }
      }, 1000);
    }
  }, 100);

  if(t.locked){
    $("#replyBody").disabled = true;
    $("#replyBtn").disabled = true;
    $("#replyErr").textContent = "Thread ist geschlossen.";
  }
}

/* ========== MESSAGES ========== */
function renderMessages(){
  const u = api.me();
  let tab = "inbox";
  let activeThread = qs.get("thread") || null;
  
  // Filter State (aus LocalStorage laden)
  let currentFilter = localStorage.getItem('msgFilter') || 'all';
  
  // Filter Toggle
  $("#msgFilterToggle")?.addEventListener("click", () => {
    const filters = $("#msgFilters");
    if(filters){
      filters.style.display = filters.style.display === 'none' ? 'block' : 'none';
    }
  });
  
  // Filter Chips Event Listeners
  $("#msgFilterChips")?.querySelectorAll(".filter-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      // Update active state
      $("#msgFilterChips").querySelectorAll(".filter-chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      currentFilter = chip.dataset.filter;
      localStorage.setItem('msgFilter', currentFilter);
      renderThreadList();
    });
  });
  
  // Set initial active filter
  setTimeout(() => {
    $("#msgFilterChips")?.querySelectorAll(".filter-chip").forEach(chip => {
      if(chip.dataset.filter === currentFilter){
        chip.classList.add("active");
      }
    });
  }, 100);

  const renderThreadList = (showLoading = false)=>{
    if(showLoading && tab === "inbox"){
      $("#threadList").innerHTML = skeleton.messageList(5);
      setTimeout(() => {
        renderThreadList(false);
      }, 300);
      return;
    }
    
    const q = ($("#msgSearch").value||"").toLowerCase().trim();
    let threads = api.getThreads(u.email);
    
    // Apply filter
    if(tab === "inbox" && currentFilter !== 'all'){
      if(currentFilter === 'unread'){
        threads = threads.filter(t => t.unreadCount > 0);
      } else if(currentFilter === 'relevant'){
        // Relevant = threads with unread or recent activity
        threads = threads.filter(t => t.unreadCount > 0 || 
          (t.lastMessageAt && new Date(t.lastMessageAt) > new Date(Date.now() - 7*24*60*60*1000)));
      } else if(currentFilter === 'contacts'){
        // Contacts = threads with known users (simplified: all for now)
        threads = threads;
      } else if(currentFilter === 'favorites'){
        // Favorites = threads marked as favorite (would need favorite field)
        threads = threads.filter(t => t.favorite === true);
      }
    }
    
    // Apply search
    threads = threads.filter(t => !q || (t.otherEmail+t.subject+t.lastSnippet).toLowerCase().includes(q))
      .sort((a,b)=> (b.lastMessageAt||"").localeCompare(a.lastMessageAt||""));

    $("#threadList").innerHTML = (tab==="inbox")
      ? threads.map(t=>{
        const isUnread = t.unreadCount > 0;
        const profile = api.getProfileByEmail(t.otherEmail);
        const otherName = profile?.name || t.otherEmail.split("@")[0];
        const lastDate = t.lastMessageAt ? new Date(t.lastMessageAt).toLocaleDateString('de-DE', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }) : '';
        return `
        <div class="threadItem ${t.id===activeThread?"active":""} ${isUnread ? "thread-unread" : ""}" data-thread="${t.id}">
          <div class="threadTop">
            <div class="threadName" style="${isUnread ? 'font-weight:600; color:var(--text-primary)' : ''}">${otherName}</div>
            ${isUnread ? `<div class="badge blue" style="background:var(--primary); color:white">${t.unreadCount} neu</div>` : ''}
          </div>
          <div class="threadSnippet" style="${isUnread ? 'font-weight:500' : ''}">
            <b>${t.subject||"—"}</b><br/>
            <span style="color:var(--text-secondary); font-size:13px">${t.lastSnippet||""}</span>
            ${lastDate ? `<span style="color:var(--text-muted); font-size:12px; margin-left:8px">${lastDate}</span>` : ''}
          </div>
        </div>
      `;
      }).join("")
      : api.listSystemMessages().map(m=>`
        <div class="threadItem" data-system="${m.id}">
          <div class="threadTop">
            <div class="threadName">SYSTEM</div>
            <div class="badge ${m.read?"":"blue"}">${m.read?"":"neu"}</div>
          </div>
          <div class="threadSnippet"><b>${m.title}</b><br/>${(m.body||"").slice(0,90)}</div>
        </div>
      `).join("");

    $("#threadList").querySelectorAll("[data-thread]").forEach(el=>{
      el.addEventListener("click", ()=>{
        activeThread = el.dataset.thread;
        api.markThreadRead(activeThread);
        openThread(activeThread);
        renderThreadList();
      });
    });

    $("#threadList").querySelectorAll("[data-system]").forEach(el=>{
      el.addEventListener("click", ()=>{
        openSystem(el.dataset.system);
      });
    });
  };

  const openThread = (threadId)=>{
    const msgs = api.getMessages(threadId);
    const right = $("#rightPane");
    right.innerHTML = `
      <div style="display:flex;justify-content:space-between;gap:10px;align-items:center">
        <div style="font-weight:900">Unterhaltung</div>
        <a class="btn" href="neue-nachricht.html">Neue</a>
      </div>
      <div class="hr"></div>
      <div id="msgList"></div>
      <div class="hr"></div>
      <label class="label">Antwort</label>
      <textarea class="textarea" id="replyMsg" data-rich-text></textarea>
      <div id="attachmentList"></div>
      <div class="err" id="msgErr"></div>
      <div style="margin-top:10px; display:flex; align-items:center; gap:8px">
        <button class="btn primary" id="sendReply">Senden</button>
        <div id="typingIndicator" style="display:none; font-size:13px; color:var(--text-secondary); font-style:italic">
          ${api.getProfileByEmail(api.getThreads(u.email).find(t=>t.id===threadId)?.otherEmail)?.name || 'Jemand'} schreibt...
        </div>
      </div>
    `;
    right.querySelector("#msgList").innerHTML = msgs.map(m=>`
      <div class="msgBlock ${m.from===u.email?"msgBlock-own":""}">
        <div class="msgMeta">
          <span><b>${m.from===u.email?"Du":m.from}</b> → ${m.to===u.email?"Du":m.to}</span>
          <span>${new Date(m.createdAt).toLocaleString()}</span>
        </div>
        <div class="p message-content">${m.body || ""}</div>
      </div>
    `).join("");

    // Typing indicator
    let typingTimeout;
    right.querySelector("#replyMsg")?.addEventListener("input", () => {
      // Simulate typing indicator (in real app, would send to server)
      clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        // Stop typing indicator
      }, 1000);
    });
    
    // File attachment
    const attachmentInput = document.createElement('input');
    attachmentInput.type = 'file';
    attachmentInput.multiple = true;
    attachmentInput.style.display = 'none';
    document.body.appendChild(attachmentInput);
    
    let selectedAttachments = [];
    attachmentInput.addEventListener('change', (e) => {
      Array.from(e.target.files).forEach(file => {
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`Datei ${file.name} ist zu groß. Maximal 10MB erlaubt.`);
          return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
          selectedAttachments.push({
            name: file.name,
            size: file.size,
            type: file.type,
            url: event.target.result
          });
          updateAttachmentList();
        };
        reader.readAsDataURL(file);
      });
    });
    
    function updateAttachmentList() {
      const list = right.querySelector("#attachmentList");
      if (list) {
        if (selectedAttachments.length > 0) {
          list.innerHTML = `
            <div style="margin-top:8px; padding:8px; background:var(--bg); border-radius:6px">
              <div style="font-size:13px; font-weight:600; margin-bottom:8px">Anhänge:</div>
              ${selectedAttachments.map((att, idx) => `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:6px; margin-bottom:4px; background:var(--surface); border-radius:4px">
                  <span style="font-size:12px">📎 ${att.name}</span>
                  <button class="btn small" onclick="selectedAttachments.splice(${idx}, 1); updateAttachmentList();">✕</button>
                </div>
              `).join('')}
            </div>
          `;
        } else {
          list.innerHTML = '';
        }
      }
    }
    
    right.querySelector("#sendReply").addEventListener("click", ()=>{
      let body = "";
      if (window.Quill && $("#replyMsg").value) {
        body = $("#replyMsg").value.trim();
        const textOnly = richTextEditor.getText("replyMsg");
        if (!textOnly || textOnly.trim().length === 0) {
          body = "";
        }
      } else {
        body = right.querySelector("#replyMsg").value.trim();
      }
      if(!body && selectedAttachments.length === 0){ 
        right.querySelector("#msgErr").textContent="Text oder Anhang erforderlich."; 
        return; 
      }
      const other = api.getThreads(u.email).find(t=>t.id===threadId)?.otherEmail;
      api.sendMessage({ 
        to: other, 
        subject: "Re: " + (api.getThreads(u.email).find(t=>t.id===threadId)?.subject||""), 
        body,
        attachments: selectedAttachments
      });
      selectedAttachments = [];
      location.href = `nachrichten.html?thread=${encodeURIComponent(threadId)}`;
    });
    
    // Add attachment button
    const attachBtn = document.createElement('button');
    attachBtn.className = 'btn small';
    attachBtn.textContent = '📎 Anhang';
    attachBtn.style.marginLeft = '8px';
    attachBtn.addEventListener('click', () => attachmentInput.click());
    right.querySelector("#sendReply").parentNode.insertBefore(attachBtn, right.querySelector("#sendReply"));
    
    // Attachment list container
    const attachmentList = document.createElement('div');
    attachmentList.id = 'attachmentList';
    right.querySelector("#sendReply").parentNode.insertBefore(attachmentList, right.querySelector("#sendReply"));
    
    // Initialize Rich Text Editor for reply
    setTimeout(() => {
      if (window.Quill && $("#replyMsg") && !richTextEditor.editors.has("replyMsg")) {
        richTextEditor.createEditor($("#replyMsg"));
      }
    }, 100);
  };

  const openSystem = (id)=>{
    const msg = api.listSystemMessages().find(x=>x.id===id);
    if(!msg) return;
    $("#rightPane").innerHTML = `
      <div style="font-weight:900">Systemnachricht</div>
      <div class="hr"></div>
      <div class="msgBlock">
        <div class="msgMeta"><span><b>${msg.title}</b></span><span>${new Date(msg.createdAt).toLocaleString()}</span></div>
        <div class="p">${(msg.body||"").replace(/\n/g,"<br/>")}</div>
      </div>
    `;
  };

  document.querySelectorAll("[data-msgtab]").forEach(t=>{
    t.addEventListener("click", ()=>{
      document.querySelectorAll("[data-msgtab]").forEach(x=>x.classList.toggle("active", x===t));
      tab = t.dataset.msgtab;
      $("#rightPane").innerHTML = `<div class="p">Wähle links eine Unterhaltung oder Systemnachricht.</div>`;
      renderThreadList();
    });
  });
  $("#msgSearch").addEventListener("input", renderThreadList);

  renderThreadList();
  if(activeThread){ api.markThreadRead(activeThread); openThread(activeThread); }
}

/* ========== COMPOSE ========== */
function renderCompose(){
  const u = api.me();
  const list = api.listMembers("");
  const toParam = qs.get("to") || "";
  $("#toSelect").innerHTML = list
    .filter(p=>p.email.toLowerCase() !== u.email.toLowerCase())
    .filter(p=>p.privacy?.allowDM)
    .map(p=>`<option value="${p.email}" ${p.email===toParam?"selected":""}>${p.name} (${p.email})</option>`)
    .join("");
  $("#sendBtn").addEventListener("click", ()=>{
    $("#sendErr").textContent="";
    const to = $("#toSelect").value;
    const subject = $("#subj").value.trim();
    let body = "";
    if (window.Quill && $("#body").value) {
      body = $("#body").value.trim();
      const textOnly = richTextEditor.getText("body");
      if (!textOnly || textOnly.trim().length === 0) {
        body = "";
      }
    } else {
      body = $("#body").value.trim();
    }
    if(!to){ $("#sendErr").textContent="Empfänger fehlt."; return; }
    if(!body){ $("#sendErr").textContent="Nachricht fehlt."; return; }
    const res = api.sendMessage({ to, subject, body });
    if(!res.ok){ $("#sendErr").textContent=res.error; return; }
    window.location.href = `nachrichten.html?thread=${encodeURIComponent(res.threadId)}`;
  });
  
  // Initialize Rich Text Editor for compose
  setTimeout(() => {
    if (window.Quill && $("#body") && !richTextEditor.editors.has("body")) {
      richTextEditor.createEditor($("#body"));
    }
  }, 100);
}

/* ========== MEMBERS DIRECTORY ========== */
function renderMembers(){
  let activeFilter = "all";
  let sortBy = "newest";
  
  // Collect all unique skills/interests for filter chips
  const allMembers = api.listMembers("");
  const allTags = new Set();
  allMembers.forEach(m => {
    (m.skills || []).forEach(s => allTags.add(s));
    (m.interests || []).forEach(i => allTags.add(i));
  });
  const sortedTags = Array.from(allTags).sort();
  
  // Render filter chips
  const filterChips = $("#memberFilterChips");
  if (filterChips) {
    filterChips.innerHTML = `
      <button class="filter-chip active" data-filter="all">Alle</button>
      ${sortedTags.slice(0, 20).map(tag => `
        <button class="filter-chip" data-filter="${tag}">${tag}</button>
      `).join('')}
    `;
    
    filterChips.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        filterChips.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        activeFilter = chip.dataset.filter;
        render();
      });
    });
  }
  
  // Sort select
  const sortSelect = $("#memberSortSelect");
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      sortBy = e.target.value;
      render();
    });
  }
  
  const render = ()=>{
    const q = ($("#memSearch").value||"").trim();
    let members = api.listMembers(q);
    
    // Apply filter
    if (activeFilter !== "all") {
      members = members.filter(p => 
        (p.skills || []).includes(activeFilter) || 
        (p.interests || []).includes(activeFilter)
      );
    }
    
    // Apply sort
    if (sortBy === "alphabetical") {
      members.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (sortBy === "activity") {
      // Sort by activity (would need activity data)
      members.sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
    } else {
      // newest first (default)
      members.sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
    }
    
    $("#memGrid").innerHTML = members.map(p=>`
      <div class="card" style="padding:16px">
        <div style="display:flex;justify-content:space-between;gap:10px">
          <div>
            <div style="font-weight:900">${p.name}</div>
            <div class="small">${p.headline||"—"}</div>
          </div>
          <button class="btn" data-fav-user="${p.userId}">⭐</button>
        </div>
        <div class="chips" style="margin-top:10px">${(p.skills||[]).slice(0,4).map(s=>`<span class="chip">${s}</span>`).join("")}</div>
        <div style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap">
          <a class="btn primary" href="member.html?email=${encodeURIComponent(p.email)}">Profil</a>
          ${p.privacy?.allowDM ? `<a class="btn" href="neue-nachricht.html?to=${encodeURIComponent(p.email)}">Nachricht</a>`:""}
        </div>
      </div>
    `).join("");
    $("#memGrid").querySelectorAll("[data-fav-user]").forEach(b=>{
      b.addEventListener("click", ()=>{ api.toggleFavorite("user", b.dataset.favUser); b.textContent="⭐✓"; });
    });
  };
  $("#memSearch").addEventListener("input", render);
  render();
}

/* ========== MEMBER PROFILE ========== */
function renderMember(){
  const email = qs.get("email");
  const u = api.me();
  const p = api.getProfileByEmail(email);
  if(!p){ $("#memberCard").innerHTML = `<div class="p">Profil nicht verfügbar.</div>`; return; }

  const isMe = email.toLowerCase() === u.email.toLowerCase();
  const common = commonTags(api.getProfileByEmail(u.email), p);

  $("#memberCard").innerHTML = `
    <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap">
      <div>
        <div class="h2" style="margin:0">${p.name}</div>
        <div class="p">${p.headline||"—"}</div>
        <div class="metaLine" style="margin-top:10px">
          ${p.location?`<span class="badge">${p.location}</span>`:""}
          ${common.length?`<span class="badge blue">Gemeinsam: ${common.slice(0,3).join(", ")}</span>`:""}
        </div>
      </div>
      <div style="display:flex;gap:10px;align-items:center">
        <button class="btn" id="favBtn">⭐ Favorit</button>
        ${isMe ? `<a class="btn primary" href="profil.html">Bearbeiten</a>` : (p.privacy?.allowDM ? `<a class="btn primary" href="neue-nachricht.html?to=${encodeURIComponent(p.email)}">Nachricht senden</a>`:"")}
      </div>
    </div>
    <div class="hr"></div>
    <div class="grid grid-2">
      <div>
        <div style="font-weight:900">Bio</div>
        <p class="p" style="margin-top:8px">${(p.bio||"").replace(/\n/g,"<br/>") || "—"}</p>
      </div>
      <div>
        <div style="font-weight:900">Skills</div>
        <div class="chips" style="margin-top:8px">${(p.skills||[]).map(s=>`<span class="chip">${s}</span>`).join("") || "—"}</div>
        <div style="font-weight:900; margin-top:12px">Interessen</div>
        <div class="chips" style="margin-top:8px">${(p.interests||[]).map(s=>`<span class="chip">${s}</span>`).join("") || "—"}</div>
      </div>
    </div>
    <div class="hr"></div>
    <div class="grid grid-2">
      <div>
        <div style="font-weight:900">Biete</div>
        <p class="p" style="margin-top:8px">${(p.offer||"—").replace(/\n/g,"<br/>")}</p>
      </div>
      <div>
        <div style="font-weight:900">Suche</div>
        <p class="p" style="margin-top:8px">${(p.lookingFor||"—").replace(/\n/g,"<br/>")}</p>
      </div>
    </div>
  `;
  $("#favBtn").addEventListener("click", ()=>{ api.toggleFavorite("user", p.userId); $("#favBtn").textContent="⭐ Favorit ✓"; });
}

function commonTags(a,b){
  const A = new Set([...(a?.skills||[]), ...(a?.interests||[])].map(x=>x.toLowerCase()));
  const out = [];
  for(const x of [...(b?.skills||[]), ...(b?.interests||[])]){
    if(A.has(x.toLowerCase())) out.push(x);
  }
  return [...new Set(out)];
}

/* ========== MY PROFILE ========== */
function renderProfileProgress(){
  const container = $("#profileProgress");
  if(!container) return;
  
  const u = api.me();
  const p = api.getProfileByEmail(u.email);
  
  // Checkliste der Profil-Felder
  const checks = [
    { key: 'name', label: 'Name', value: u?.name, field: null },
    { key: 'headline', label: 'Headline', value: p?.headline, field: 'pHeadline' },
    { key: 'bio', label: 'Bio', value: p?.bio, field: 'pBio' },
    { key: 'skills', label: 'Skills', value: p?.skills?.length > 0, field: 'pSkills' },
    { key: 'interests', label: 'Interessen', value: p?.interests?.length > 0, field: 'pInterests' },
    { key: 'avatar', label: 'Profilbild', value: false, field: null } // Placeholder, da aktuell keine Upload-Funktion
  ];
  
  const completed = checks.filter(c => c.value && c.value !== '').length;
  const total = checks.length;
  const percentage = Math.round((completed / total) * 100);
  
  const missingFields = checks.filter(c => !c.value || c.value === '').filter(c => c.field);
  
  container.innerHTML = `
    <div class="profile-progress-card">
      <div class="profile-progress-header">
        <h3 class="h3">Profil-Vollständigkeit</h3>
        <span class="profile-progress-percentage">${percentage}%</span>
      </div>
      <div class="profile-progress-bar">
        <div class="profile-progress-fill" style="width: ${percentage}%"></div>
      </div>
      <div class="profile-progress-checklist">
        ${checks.map(c => `
          <div class="profile-progress-item ${c.value && c.value !== '' ? 'completed' : ''}">
            <span class="profile-progress-icon">${c.value && c.value !== '' ? '✓' : '○'}</span>
            <span class="profile-progress-label">${c.label}</span>
          </div>
        `).join('')}
      </div>
      ${missingFields.length > 0 ? `
        <div class="profile-progress-actions">
          <p class="small text-muted">Vervollständigen Sie Ihr Profil für bessere Sichtbarkeit im Netzwerk:</p>
          ${missingFields.map(f => `
            <button class="btn ghost small" onclick="document.getElementById('${f.field}')?.focus()">
              ${f.label} hinzufügen
            </button>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

function renderMyProfile(){
  const u = api.me();
  const p = api.getProfileByEmail(u.email);
  
  // Render profile progress
  renderProfileProgress();
  
  $("#pHeadline").value = p.headline||"";
  $("#pLoc").value = p.location||"";
  $("#pBio").value = p.bio||"";
  $("#pSkills").value = (p.skills||[]).join(", ");
  $("#pInterests").value = (p.interests||[]).join(", ");
  $("#pOffer").value = p.offer||"";
  $("#pSeek").value = p.lookingFor||"";
  $("#pLi").value = p.links?.linkedin||"";
  $("#pWeb").value = p.links?.website||"";
  $("#pVis").checked = !!p.privacy?.visibleInDirectory;
  $("#pDM").checked = !!p.privacy?.allowDM;
  
  // Avatar selector
  const avatarSelector = $("#avatarSelector");
  if (avatarSelector) {
    avatarSelector.innerHTML = `
      <div class="avatar-option ${!p.avatarType || p.avatarType === 'initials' ? 'selected' : ''}" data-avatar-type="initials" data-avatar-id="">
        <div style="width:64px;height:64px;margin:0 auto;">${avatarGenerator.generateInitialsAvatar(u.name || u.email, 64)}</div>
        <div style="text-align:center;margin-top:8px;font-size:12px;">Initialen</div>
      </div>
      ${avatarGenerator.iconAvatars.map(icon => `
        <div class="avatar-option ${p.avatarType === 'icon' && p.avatarId === icon.id ? 'selected' : ''}" 
             data-avatar-type="icon" data-avatar-id="${icon.id}">
          <div style="width:64px;height:64px;margin:0 auto;">${avatarGenerator.generateIconAvatar(icon.id, 64)}</div>
          <div style="text-align:center;margin-top:8px;font-size:12px;">${icon.name}</div>
        </div>
      `).join('')}
    `;
    
    avatarSelector.querySelectorAll('.avatar-option').forEach(opt => {
      opt.addEventListener('click', () => {
        avatarSelector.querySelectorAll('.avatar-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
      });
    });
  }

  $("#saveProfile").addEventListener("click", ()=>{
    const selectedAvatar = avatarSelector?.querySelector('.avatar-option.selected');
    const avatarType = selectedAvatar?.dataset.avatarType || 'initials';
    const avatarId = selectedAvatar?.dataset.avatarId || '';
    
    $("#pErr").textContent=""; $("#pOk").textContent="";
    const res = api.updateMyProfile({
      headline: $("#pHeadline").value.trim(),
      location: $("#pLoc").value.trim(),
      bio: $("#pBio").value.trim(),
      skills: parseTags($("#pSkills").value),
      interests: parseTags($("#pInterests").value),
      offer: $("#pOffer").value.trim(),
      lookingFor: $("#pSeek").value.trim(),
      links: { linkedin: $("#pLi").value.trim(), website: $("#pWeb").value.trim() },
      privacy: { visibleInDirectory: $("#pVis").checked, allowDM: $("#pDM").checked },
      avatarType,
      avatarId,
      completed: true
    });
    if(!res.ok){ $("#pErr").textContent=res.error; return; }
    $("#pOk").textContent="Gespeichert ✅";
    // Update progress after save
    setTimeout(() => renderProfileProgress(), 100);
  });
}

/* ========== ADMIN ========== */
function renderAdmin(){
  if(!api.isAdmin()){ window.location.href="dashboard.html"; return; }

  let tab = "users";
  const setTab = (t)=>{
    tab=t;
    document.querySelectorAll("[data-admtab]").forEach(x=>x.classList.toggle("active", x.dataset.admtab===t));
    renderAdminPanels();
  };
  document.querySelectorAll("[data-admtab]").forEach(x=>x.addEventListener("click", ()=>setTab(x.dataset.admtab)));

  const open = ()=>$("#admEvOverlay").style.display="flex";
  const close = ()=>$("#admEvOverlay").style.display="none";
  $("#admEvClose").addEventListener("click", close);
  $("#admEvOverlay").addEventListener("click",(e)=>{ if(e.target.id==="admEvOverlay") close(); });

  function renderAdminPanels(){
    if(tab==="users"){
      const users = api.adminListUsers();
      $("#adminLeft").innerHTML = `
        <div style="font-weight:900">Mitglieder</div>
        <div class="hr"></div>
        <table class="table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Aktion</th></tr></thead>
          <tbody>
            ${users.map(u=>`
              <tr>
                <td>${u.name}</td><td>${u.email}</td>
                <td>${u.role}</td><td>${u.status}</td>
                <td>
                  <button class="btn" data-role="${u.id}">Role</button>
                  <button class="btn danger" data-status="${u.id}">Block</button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;
      $("#adminRight").innerHTML = `<div class="p">Tipp: Admin Seed ist <b>admin@undbauen.local</b>.</div>`;

      $("#adminLeft").querySelectorAll("[data-role]").forEach(b=>{
        b.addEventListener("click", ()=>{
          const id = b.dataset.role;
          const u = users.find(x=>x.id===id);
          const next = u.role==="admin" ? "member" : "admin";
          if(confirm(`Rolle ändern zu ${next}?`)) api.adminSetUserRole(id, next), location.reload();
        });
      });
      $("#adminLeft").querySelectorAll("[data-status]").forEach(b=>{
        b.addEventListener("click", ()=>{
          const id = b.dataset.status;
          confirmModal.show(
            "User blocken?",
            "User blocken",
            "Blocken",
            "Abbrechen"
          ).then(confirmed => {
            if(confirmed){
              api.adminSetUserStatus(id, "blocked");
              toast.success("User blockiert.");
              location.reload();
            }
          });
        });
      });
    }

    if(tab==="events"){
      const evs = api.listEvents().slice().sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
      $("#adminLeft").innerHTML = `
        <div style="display:flex;justify-content:space-between;gap:10px;align-items:center">
          <div style="font-weight:900">Termine (CRUD)</div>
          <button class="btn primary" id="newEv">+ Neu</button>
        </div>
        <div class="hr"></div>
        <table class="table">
          <thead><tr><th>Titel</th><th>Datum</th><th>Cap</th><th>Buchungen</th><th>Aktion</th></tr></thead>
          <tbody>
            ${evs.map(e=>`
              <tr>
                <td>${e.title}</td><td>${e.date} ${e.time}</td><td>${e.capacity}</td><td>${api.bookingsCount(e.id)}</td>
                <td>
                  <button class="btn" data-edit="${e.id}">Edit</button>
                  <button class="btn danger" data-del="${e.id}">Del</button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;
      $("#adminRight").innerHTML = `<div class="p">Event-Thread wird beim Öffnen im Member-Modal automatisch erzeugt (MVP).</div>`;

      $("#newEv").addEventListener("click", ()=>{
        $("#admEvTitle").textContent="Neues Event";
        $("#admEvBody").innerHTML = evFormHTML({});
        open();
        wireEvForm(null);
      });
      $("#adminLeft").querySelectorAll("[data-edit]").forEach(b=>{
        b.addEventListener("click", ()=>{
          const ev = api.getEvent(b.dataset.edit);
          $("#admEvTitle").textContent="Event bearbeiten";
          $("#admEvBody").innerHTML = evFormHTML(ev);
          open();
          wireEvForm(ev.id);
        });
      });
      $("#adminLeft").querySelectorAll("[data-del]").forEach(b=>{
        b.addEventListener("click", ()=>{
          confirmModal.show(
            "Event löschen (soft)?",
            "Event löschen",
            "Löschen",
            "Abbrechen"
          ).then(confirmed => {
            if(confirmed){
              api.adminDeleteEvent(b.dataset.del);
              toast.success("Event gelöscht.");
              location.reload();
            }
          });
        });
      });
    }

    if(tab==="content"){
      const ups = api.listUpdatesMember();
      const pubs = api.listPublicationsMember();
      $("#adminLeft").innerHTML = `
        <div style="font-weight:900">Monatsupdates</div>
        <div class="hr"></div>
        ${ups.map(u=>`
          <div class="listItem"><div><b>${u.title}</b><div class="small">${u.month}</div></div>
            <button class="btn danger" data-delupd="${u.id}">Del</button>
          </div>
        `).join("")}
        <div style="margin-top:12px"><button class="btn primary" id="addUpd">+ Update</button></div>
      `;
      $("#adminRight").innerHTML = `
        <div style="font-weight:900">Publikationen</div>
        <div class="hr"></div>
        ${pubs.map(p=>`
          <div class="listItem"><div><b>${p.title}</b><div class="small">${(p.tags||[]).join(", ")}</div></div>
            <button class="btn danger" data-delpub="${p.id}">Del</button>
          </div>
        `).join("")}
        <div style="margin-top:12px"><button class="btn primary" id="addPub">+ Publikation</button></div>
      `;

      $("#adminLeft").querySelectorAll("[data-delupd]").forEach(b=>b.addEventListener("click", ()=>{
        confirmModal.show(
          "Update löschen?",
          "Update löschen",
          "Löschen",
          "Abbrechen"
        ).then(confirmed => {
          if(confirmed){
            api.adminDeleteUpdate(b.dataset.delupd);
            toast.success("Update gelöscht.");
            location.reload();
          }
        });
      }));
      $("#adminRight").querySelectorAll("[data-delpub]").forEach(b=>b.addEventListener("click", ()=>{
        confirmModal.show(
          "Publikation löschen?",
          "Publikation löschen",
          "Löschen",
          "Abbrechen"
        ).then(confirmed => {
          if(confirmed){
            api.adminDeletePublication(b.dataset.delpub);
            toast.success("Publikation gelöscht.");
            location.reload();
          }
        });
      }));

      $("#addUpd").addEventListener("click", ()=>{
        const month = prompt("Monat (YYYY-MM):","2026-02"); if(!month) return;
        const title = prompt("Titel:","Monatsupdate"); if(!title) return;
        api.adminCreateUpdate({ month, title, intro:"Teaser", highlights:["Highlight 1","Highlight 2"], memberBody:"Member-Text" });
        location.reload();
      });
      $("#addPub").addEventListener("click", ()=>{
        const title = prompt("Titel:","Publikation"); if(!title) return;
        api.adminCreatePublication({ title, abstract:"Abstract", tags:["Tag"], memberBody:"Member-Body", downloadUrl:"" });
        location.reload();
      });
    }
  }

  function evFormHTML(ev){
    return `
      <label class="label">Titel</label><input class="input" id="fTitle" value="${ev.title||""}"/>
      <div class="row" style="margin-top:10px">
        <div style="flex:1"><label class="label">Datum</label><input class="input" id="fDate" value="${ev.date||""}" placeholder="YYYY-MM-DD"/></div>
        <div style="flex:1"><label class="label">Zeit</label><input class="input" id="fTime" value="${ev.time||""}" placeholder="18:00"/></div>
      </div>
      <div class="row" style="margin-top:10px">
        <div style="flex:1"><label class="label">Dauer (Min)</label><input class="input" id="fDur" value="${ev.durationMinutes||90}"/></div>
        <div style="flex:1"><label class="label">Kapazität</label><input class="input" id="fCap" value="${ev.capacity||40}"/></div>
      </div>
      <label class="label" style="margin-top:10px">Location</label><input class="input" id="fLoc" value="${ev.location||""}"/>
      <label class="label" style="margin-top:10px">Format</label><input class="input" id="fFmt" value="${ev.format||"Innovationsabend"}"/>
      <label class="label" style="margin-top:10px">Tags (Komma)</label><input class="input" id="fTags" value="${(ev.tags||[]).join(", ")}"/>
      <label class="label" style="margin-top:10px">Public Desc</label><textarea class="textarea" id="fPub">${ev.descriptionPublic||""}</textarea>
      <label class="label" style="margin-top:10px">Member Desc</label><textarea class="textarea" id="fMem">${ev.descriptionMember||""}</textarea>
      <div class="err" id="fErr"></div>
      <div style="margin-top:12px"><button class="btn primary" id="fSave">Speichern</button></div>
    `;
  }

  function wireEvForm(id){
    $("#fSave").addEventListener("click", ()=>{
      $("#fErr").textContent="";
      const payload = {
        title: $("#fTitle").value.trim(),
        date: $("#fDate").value.trim(),
        time: $("#fTime").value.trim(),
        durationMinutes: Number($("#fDur").value||90),
        capacity: Number($("#fCap").value||40),
        location: $("#fLoc").value.trim(),
        format: $("#fFmt").value.trim(),
        tags: parseTags($("#fTags").value),
        descriptionPublic: $("#fPub").value.trim(),
        descriptionMember: $("#fMem").value.trim()
      };
      if(!payload.title || !payload.date || !payload.time){ $("#fErr").textContent="Titel/Datum/Zeit erforderlich."; return; }
      if(id) api.adminUpdateEvent(id, payload);
      else api.adminCreateEvent(payload);
      location.reload();
    });
  }

  renderAdminPanels();
}

/* ========== ROUTER ========== */
document.addEventListener("DOMContentLoaded", async ()=>{
  if(!guard()) return;
  setShell();
  
  // Initialize breadcrumbs
  breadcrumbs.init();
  
  // Initialize Rich Text Editor
  if (window.Quill) {
    richTextEditor.init();
  } else {
    // Wait for Quill to load
    const checkQuill = setInterval(() => {
      if (window.Quill) {
        clearInterval(checkQuill);
        richTextEditor.init();
      }
    }, 100);
    setTimeout(() => clearInterval(checkQuill), 5000); // Timeout after 5 seconds
  }
  
  // Lazy-load onboarding for new users
  const onboardingCompleted = localStorage.getItem('onboardingCompleted');
  if (onboardingCompleted !== 'true') {
    try {
      const { initOnboarding } = await import('./components/onboarding.js');
      initOnboarding();
    } catch (error) {
      console.warn('Onboarding konnte nicht geladen werden:', error);
    }
  }

  const page = document.body.dataset.page;
  switch(page){
    case "dashboard": renderDashboard(); break;
    case "termine": renderEvents(); break;
    case "forum": renderForum(); break;
    case "forum-category": renderForumCategory(); break;
    case "forum-thread": renderForumThread(); break;
    case "messages": renderMessages(); break;
    case "compose": renderCompose(); break;
    case "members": renderMembers(); break;
    case "member": renderMember(); break;
    case "profile": renderMyProfile(); break;
    case "settings": /* nothing more */ break;
    case "admin": renderAdmin(); break;
  }
});

