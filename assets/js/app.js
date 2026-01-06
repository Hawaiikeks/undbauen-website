import { api } from "./services/apiClient.js";
import { breadcrumbs } from "./components/breadcrumbs.js";
import { richTextEditor } from "./components/richTextEditor.js";
import { chartRenderer } from "./components/chartRenderer.js";
import { avatarGenerator } from "./components/avatarGenerator.js";
import { initSidebar, updateBadges } from "./components/sidebar.js";

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

// Import router and auth guard
import { guardRoute, canAccessRoute } from './services/authGuard.js';
import { getCurrentPath, getCurrentRoute } from './services/router.js';

function guard(){
  console.log('🔵 guard() called');
  const isLoggedIn = api.isLoggedIn();
  console.log('🔵 isLoggedIn:', isLoggedIn);
  if(!isLoggedIn){
    console.log('❌ Not logged in, redirecting...');
    // Determine correct redirect path based on current location
    const isInApp = window.location.pathname.includes('/app/');
    const redirectPath = isInApp ? '../index.html' : 'index.html';
    window.location.href = redirectPath;
    return false;
  }
  
  // Check route access
  const path = getCurrentPath();
  const guardResult = guardRoute(path);
  
  if (!guardResult.allowed) {
    if (guardResult.redirect) {
      window.location.href = guardResult.redirect;
    } else {
      const isInApp = window.location.pathname.includes('/app/');
      const redirectPath = isInApp ? '../index.html' : 'index.html';
      window.location.href = redirectPath;
    }
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

async function setShell(){
  console.log('🔵 setShell() STARTED');
  initTheme();
  if($("#themeToggle")) $("#themeToggle").addEventListener("click", toggleTheme);
  
  const u = await api.me();
  console.log('🔵 setShell() user:', u);
  if($("#userLabel")) $("#userLabel").textContent = u?.name || "Member";
  if($("#logoutBtn")) $("#logoutBtn").addEventListener("click", ()=>{ api.logout(); window.location.href="../index.html"; });
  if($("#logoutBtn2")) $("#logoutBtn2").addEventListener("click", ()=>{ api.logout(); window.location.href="../index.html"; });

  // Initialize Sidebar Navigation
  if (document.getElementById('sidebarContainer')) {
    console.log('🔵 Sidebar container found, initializing...');
    const userRole = u?.role || 'member';
    const currentPath = window.location.pathname;
    console.log('🔵 User role:', userRole, 'Path:', currentPath);
    initSidebar(userRole, currentPath);
    console.log('✅ Sidebar initialized');
    
    // Show mobile menu button on mobile
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    if (mobileMenuBtn) {
      const checkMobile = () => {
        mobileMenuBtn.style.display = window.innerWidth < 768 ? 'block' : 'none';
      };
      checkMobile();
      window.addEventListener('resize', checkMobile);
    }
  } else {
    console.warn('⚠️ No sidebar container found');
  }
}

function fmtDate(ev){ 
  // Format date from YYYY-MM-DD to DD.MM.YYYY
  const dateParts = ev.date.split('-');
  const formattedDate = dateParts.length === 3 ? `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}` : ev.date;
  return `${formattedDate} ${ev.time}`; 
}

function parseTags(str){
  return (str||"").split(",").map(s=>s.trim()).filter(Boolean)
    .filter((v,i,a)=>a.indexOf(v)===i);
}

/* ========== DASHBOARD ========== */
async function renderDashboard(){
  console.log('🔵 renderDashboard() STARTED');
  const u = await api.me();
  console.log('🔵 User:', u);
  if (!u) {
    console.error('❌ User not found');
    return;
  }
  
  const events = (await api.listEvents()).slice().sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
  
  // Add ticket creation CTA (nur einmal)
  const ticketCta = document.querySelector('#ticketCtaContainer');
  if (ticketCta) {
    // Check if user has tickets
    const { ticketRepository } = await import('./services/repositories/ticketRepository.js');
    const userTickets = await ticketRepository.findByUserId(u.id);
    
    // ticketCtaContainer ist jetzt eine card pane im grid-2 Layout
    ticketCta.innerHTML = `
      <div style="font-weight:900; margin-bottom: 12px;">Haben Sie eine Idee?</div>
      <div class="hr" style="margin-bottom: 12px;"></div>
      <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 16px; line-height: 1.5;">
        Teilen Sie Ihre Vorschläge, Verbesserungen oder Ideen mit der Community. Ihre Ideen helfen uns, die Plattform kontinuierlich zu verbessern.
      </div>
      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <button class="btn primary" id="createTicketBtn" style="padding: 8px 16px; font-size: 13px;">+ Idee einreichen</button>
        ${userTickets.length > 0 ? `
          <a href="tickets.html" class="btn" style="text-decoration: none; padding: 8px 16px; font-size: 13px;">
            📋 Meine Ideen (${userTickets.length})
          </a>
        ` : ''}
      </div>
    `;
    ticketCta.querySelector('#createTicketBtn')?.addEventListener('click', async () => {
      const { showTicketWizard } = await import('./components/ticketWizard.js');
      showTicketWizard();
    });
  }

  // Prüfe ob Dashboard-Elemente existieren
  const quickMetricsRow = $("#quickMetricsRow");
  const detailedMetricsCard = $("#detailedMetricsCard"); // Optional - nicht mehr im HTML
  const cardNext = $("#cardNext");
  const cardRecs = $("#cardRecs");
  const cardFavs = $("#cardFavs");
  const cardActivity = $("#cardActivity");
  
  if (!quickMetricsRow || !cardNext || !cardRecs || !cardFavs || !cardActivity) {
    console.warn('Dashboard elements not found, waiting for DOM...');
    setTimeout(() => renderDashboard(), 300);
    return;
  }

  // Calculate metrics with error handling
  let forumPostsCount = 0;
  let totalForumPosts = 0;
  let unreadCount = 0;
  let totalMessages = 0;
  let membersCount = 0;
  let favoritesCount = 0;
  
  try {
    const threads = api.getForumThreads() || [];
    const allPosts = threads.flatMap(t => {
      try {
        const posts = api.getForumPosts(t.id) || [];
        return posts.filter(p => !p.deleted && p.authorEmail === u.email);
      } catch (e) {
        console.warn('Error getting posts for thread', t.id, e);
        return [];
      }
    });
    forumPostsCount = allPosts.length;
    
    const allThreads = api.getForumThreads() || [];
    const allForumPosts = allThreads.flatMap(t => {
      try {
        return (api.getForumPosts(t.id) || []).filter(p => !p.deleted);
      } catch (e) {
        console.warn('Error getting posts for thread', t.id, e);
        return [];
      }
    });
    totalForumPosts = allForumPosts.length;
  } catch (e) {
    console.error('Error calculating forum metrics:', e);
  }
  
  try {
    const userThreads = api.getThreads(u.email) || [];
    const unreadMessages = userThreads.filter(t => (t.unreadCount || 0) > 0);
    unreadCount = unreadMessages.reduce((sum, t) => sum + (t.unreadCount || 0), 0);
    totalMessages = userThreads.length;
  } catch (e) {
    console.error('Error calculating message metrics:', e);
  }
  
  try {
    const members = api.listMembers() || [];
    membersCount = members.length;
  } catch (e) {
    console.error('Error calculating member metrics:', e);
  }
  
  try {
    const favs = api.getFavorites() || [];
    favoritesCount = favs.length;
  } catch (e) {
    console.error('Error calculating favorites metrics:', e);
  }
  
  // Render quick metrics (4 pill buttons) - schmaler
  quickMetricsRow.innerHTML = `
    <div style="display: flex; gap: 8px; flex-wrap: wrap; width: 100%;">
      <div style="flex: 1; min-width: 120px; padding: 10px 12px; background: rgba(16, 185, 129, 0.1); border-radius: 16px; border: 1px solid rgba(16, 185, 129, 0.2); text-align: center;">
        <div style="font-size: 18px; margin-bottom: 2px;">💬</div>
        <div style="font-weight: 600; font-size: 13px; color: var(--text-primary);">Forum Beiträge</div>
        <div style="font-size: 20px; font-weight: 700; color: #10B981; margin-top: 2px;">${forumPostsCount}</div>
        <div style="font-size: 10px; color: var(--text-secondary); margin-top: 2px;">↑</div>
      </div>
      <div style="flex: 1; min-width: 120px; padding: 10px 12px; background: rgba(255, 107, 53, 0.1); border-radius: 16px; border: 1px solid rgba(255, 107, 53, 0.2); text-align: center;">
        <div style="font-size: 18px; margin-bottom: 2px;">✉️</div>
        <div style="font-weight: 600; font-size: 13px; color: var(--text-primary);">Nachrichten</div>
        <div style="font-size: 20px; font-weight: 700; color: #FF6B35; margin-top: 2px;">${unreadCount > 0 ? `${unreadCount} neu` : '0'}</div>
        <div style="font-size: 10px; color: var(--text-secondary); margin-top: 2px;">↑</div>
      </div>
      <div style="flex: 1; min-width: 120px; padding: 10px 12px; background: rgba(107, 114, 128, 0.1); border-radius: 16px; border: 1px solid rgba(107, 114, 128, 0.2); text-align: center;">
        <div style="font-size: 18px; margin-bottom: 2px;">👤</div>
        <div style="font-weight: 600; font-size: 13px; color: var(--text-primary);">Mitglieder</div>
        <div style="font-size: 20px; font-weight: 700; color: #6B7280; margin-top: 2px;">${membersCount}</div>
        <div style="font-size: 10px; color: var(--text-secondary); margin-top: 2px;">→</div>
      </div>
      <div style="flex: 1; min-width: 120px; padding: 10px 12px; background: rgba(107, 114, 128, 0.1); border-radius: 16px; border: 1px solid rgba(107, 114, 128, 0.2); text-align: center;">
        <div style="font-size: 18px; margin-bottom: 2px;">⭐</div>
        <div style="font-weight: 600; font-size: 13px; color: var(--text-primary);">Favoriten</div>
        <div style="font-size: 20px; font-weight: 700; color: #6B7280; margin-top: 2px;">${favoritesCount}</div>
        <div style="font-size: 10px; color: var(--text-secondary); margin-top: 2px;">↑</div>
      </div>
    </div>
  `;

  // Detailed metrics card entfernt - nicht mehr benötigt (optional, falls noch im DOM)
  if (detailedMetricsCard) {
    detailedMetricsCard.style.display = 'none';
  }
  
  // Alle gebuchten Termine
  const bookedEvents = events.filter(e => api.getParticipants(e.id).some(p=>p.email.toLowerCase()===u.email.toLowerCase()));
  const nextBooked = bookedEvents[0];
  
  if (bookedEvents.length === 0) {
    cardNext.innerHTML = `
      <div class="kpiTitle">Nächster Termin</div>
      <div class="kpiBody">Noch keine Buchung. Buche deinen nächsten Innovationsabend.</div>
      <div style="margin-top:10px"><a class="btn primary" href="termine.html">Termine ansehen</a></div>
    `;
  } else if (bookedEvents.length === 1) {
    // Nur ein Termin - detaillierte Anzeige
    const count = api.bookingsCount(nextBooked.id);
    const endTime = nextBooked.durationMinutes ? calculateEndTime(nextBooked.time, nextBooked.durationMinutes) : null;
    
    cardNext.innerHTML = `
      <div class="kpiTitle">Nächster Termin</div>
      <div class="kpiBody" style="cursor: pointer; min-height: 120px;" data-open-event="${nextBooked.id}">
        <b style="font-size:16px; display:block; margin-bottom:12px;">${nextBooked.title}</b>
        <div style="display:flex; flex-direction:column; gap:8px; font-size:14px;">
          <div style="display:flex; align-items:center; gap:6px;">
            <span>📅</span>
            <span>${fmtDate(nextBooked).split(' ')[0]}</span>
          </div>
          <div style="display:flex; align-items:center; gap:6px;">
            <span>⏰</span>
            <span>${nextBooked.time}${endTime ? ` - ${endTime}` : ''}${nextBooked.durationMinutes ? ` (${nextBooked.durationMinutes} Min.)` : ''}</span>
          </div>
          <div style="display:flex; align-items:center; gap:6px;">
            <span>📍</span>
            <span>${nextBooked.location || 'Nicht angegeben'}</span>
          </div>
          <div style="display:flex; align-items:center; gap:6px; margin-top:4px;">
            <span>👥</span>
            <span>Teilnehmer: ${count}/${nextBooked.capacity || '∞'}</span>
          </div>
        </div>
      </div>
      <div style="margin-top:10px">
        <button class="btn primary" data-open-event="${nextBooked.id}">Details anzeigen</button>
      </div>
    `;
    cardNext.querySelectorAll("[data-open-event]").forEach(btn => {
      btn.addEventListener("click", () => openBookedEventModal(nextBooked.id));
    });
  } else {
    // Mehrere Termine - Swipe-Funktion mit detaillierten Infos
    let currentIndex = 0;
    const renderSwipeCard = () => {
      const currentEvent = bookedEvents[currentIndex];
      const count = api.bookingsCount(currentEvent.id);
      const endTime = currentEvent.durationMinutes ? calculateEndTime(currentEvent.time, currentEvent.durationMinutes) : null;
      
      $("#cardNext").innerHTML = `
        <div class="kpiTitle">Gebuchte Termine (${currentIndex + 1}/${bookedEvents.length})</div>
        <div style="position: relative;">
          <button class="event-swipe-btn event-swipe-left" aria-label="Vorheriger Termin">←</button>
          <div class="kpiBody" style="cursor: pointer; min-height: 120px; padding: 0 40px;" data-open-event="${currentEvent.id}">
            <b style="font-size:16px; display:block; margin-bottom:12px;">${currentEvent.title}</b>
            <div style="display:flex; flex-direction:column; gap:8px; font-size:14px;">
              <div style="display:flex; align-items:center; gap:6px;">
                <span>📅</span>
                <span>${fmtDate(currentEvent).split(' ')[0]}</span>
              </div>
              <div style="display:flex; align-items:center; gap:6px;">
                <span>⏰</span>
                <span>${currentEvent.time}${endTime ? ` - ${endTime}` : ''}${currentEvent.durationMinutes ? ` (${currentEvent.durationMinutes} Min.)` : ''}</span>
              </div>
              <div style="display:flex; align-items:center; gap:6px;">
                <span>📍</span>
                <span>${currentEvent.location || 'Nicht angegeben'}</span>
              </div>
              <div style="display:flex; align-items:center; gap:6px; margin-top:4px;">
                <span>👥</span>
                <span>Teilnehmer: ${count}/${currentEvent.capacity || '∞'}</span>
              </div>
            </div>
          </div>
          <button class="event-swipe-btn event-swipe-right" aria-label="Nächster Termin">→</button>
        </div>
        <div style="margin-top:10px">
          <button class="btn primary" data-open-event="${currentEvent.id}">Details anzeigen</button>
        </div>
        <div style="margin-top:8px; display:flex; gap:4px; justify-content:center;">
          ${bookedEvents.map((_, i) => `<div class="event-swipe-dot ${i === currentIndex ? 'active' : ''}" data-index="${i}"></div>`).join('')}
        </div>
      `;
      
      // Event Listeners
      cardNext.querySelector(".event-swipe-left")?.addEventListener("click", (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex - 1 + bookedEvents.length) % bookedEvents.length;
        renderSwipeCard();
      });
      
      cardNext.querySelector(".event-swipe-right")?.addEventListener("click", (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex + 1) % bookedEvents.length;
        renderSwipeCard();
      });
      
      cardNext.querySelectorAll(".event-swipe-dot").forEach((dot, i) => {
        dot.addEventListener("click", (e) => {
          e.stopPropagation();
          currentIndex = i;
          renderSwipeCard();
        });
      });
      
      cardNext.querySelectorAll("[data-open-event]").forEach(btn => {
        btn.addEventListener("click", () => openBookedEventModal(currentEvent.id));
      });
    };
    
    renderSwipeCard();
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

  // "Gespeichert"-Karte entfernt - Funktion existiert nicht mehr

  // recommendations - kompakt
  const recs = api.recommendContacts();
  if (cardRecs) {
    cardRecs.innerHTML = `
      <div class="kpiTitle">Empfohlene Kontakte</div>
      <div class="kpiBody">
        ${recs.length ? recs.slice(0,3).map(p=>`<div style="margin-bottom:8px; cursor:pointer; padding:8px; border-radius:var(--radius); transition:background 0.2s;" onclick="window.location.href='member.html?email=${encodeURIComponent(p.email)}'" onmouseover="this.style.background='var(--bg)'" onmouseout="this.style.background='transparent'"><b>${p.name}</b><br/><span class="small">${p.headline||"—"}</span></div>`).join("") : `Noch keine Empfehlungen - ergänze Schlagwörter in deinem Profil.`}
      </div>
    `;
  }

  // favorites - favorisierte Personen mit Swipe
  if (cardFavs) {
    try {
      // Alle Favoriten holen
      const allFavs = api.getFavorites() || [];
      console.log('All favorites:', allFavs);
      
      // Filtere nach Personen (profile oder member, oder wenn targetId eine Email ist)
      const favoritePeople = allFavs.filter(f => {
        // Prüfe ob es eine Person ist (profile/member) oder ob targetId wie eine Email aussieht
        const isPersonType = f.targetType === 'profile' || f.targetType === 'member' || f.targetType === 'user';
        const looksLikeEmail = f.targetId && f.targetId.includes('@');
        return isPersonType || looksLikeEmail;
      });
      
      console.log('Favorite people:', favoritePeople);
      
      // Lade Profile für alle favorisierten Personen
      const favoriteProfiles = favoritePeople.map(f => {
        try {
          // targetId könnte eine Email oder eine User-ID sein
          let profile = null;
          if (f.targetId.includes('@')) {
            // Es ist eine Email
            profile = api.getProfileByEmail(f.targetId);
          } else {
            // Es könnte eine User-ID sein, versuche User zu finden
            const users = api.adminListUsers();
            const user = users.find(u => u.id === f.targetId);
            if (user) {
              profile = api.getProfileByEmail(user.email);
            }
          }
          return profile ? { ...f, profile, email: f.targetId.includes('@') ? f.targetId : (profile?.email || '') } : null;
        } catch (e) {
          console.warn('Error loading profile for favorite:', f.targetId, e);
          return null;
        }
      }).filter(p => p !== null && p.profile);
      
      console.log('Favorite profiles loaded:', favoriteProfiles.length);
      
      const favoriteCount = favoriteProfiles.length;
      
      if (favoriteCount === 0) {
        cardFavs.innerHTML = `
          <div class="kpiTitle">Favoriten ⭐ (0)</div>
          <div class="kpiBody">Noch keine favoriten Personen favorisiert.</div>
        `;
      } else if (favoriteCount === 1) {
        const fav = favoriteProfiles[0];
        const email = fav.email || fav.targetId;
        cardFavs.innerHTML = `
          <div class="kpiTitle">Favoriten ⭐ (1)</div>
          <div class="kpiBody" style="cursor: pointer; text-align: center;" onclick="window.location.href='member.html?email=${encodeURIComponent(email)}'">
            <div style="font-size: 32px; margin-bottom: 8px;">👤</div>
            <div style="font-weight: 600; font-size: 16px; margin-bottom: 4px;">${fav.profile.name || 'Unbekannt'}</div>
            <div class="small" style="color: var(--text-secondary);">${fav.profile.headline || '—'}</div>
          </div>
        `;
      } else {
        let favIndex = 0;
        const renderFavorite = () => {
          const fav = favoriteProfiles[favIndex];
          const email = fav.email || fav.targetId;
          cardFavs.innerHTML = `
            <div class="kpiTitle">Favoriten ⭐ (${favIndex + 1}/${favoriteProfiles.length})</div>
            <div style="position: relative;">
              ${favIndex > 0 ? `<button class="event-swipe-btn event-swipe-left" aria-label="Vorheriger" style="left: 0;">←</button>` : ''}
              <div class="kpiBody" style="cursor: pointer; text-align: center; padding: ${favIndex > 0 || favIndex < favoriteProfiles.length - 1 ? '0 40px' : '0'};" onclick="window.location.href='member.html?email=${encodeURIComponent(email)}'">
                <div style="font-size: 32px; margin-bottom: 8px;">👤</div>
                <div style="font-weight: 600; font-size: 16px; margin-bottom: 4px;">${fav.profile.name || 'Unbekannt'}</div>
                <div class="small" style="color: var(--text-secondary);">${fav.profile.headline || '—'}</div>
              </div>
              ${favIndex < favoriteProfiles.length - 1 ? `<button class="event-swipe-btn event-swipe-right" aria-label="Nächster" style="right: 0;">→</button>` : ''}
            </div>
            <div style="margin-top: 8px; display: flex; gap: 4px; justify-content: center;">
              ${favoriteProfiles.map((_, i) => `<div class="event-swipe-dot ${i === favIndex ? 'active' : ''}" data-index="${i}"></div>`).join('')}
            </div>
          `;
          
          // Event Listeners
          const leftBtn = cardFavs.querySelector(".event-swipe-left");
          const rightBtn = cardFavs.querySelector(".event-swipe-right");
          const dots = cardFavs.querySelectorAll(".event-swipe-dot");
          
          if (leftBtn) {
            leftBtn.addEventListener("click", (e) => {
              e.stopPropagation();
              favIndex = Math.max(0, favIndex - 1);
              renderFavorite();
            });
          }
          
          if (rightBtn) {
            rightBtn.addEventListener("click", (e) => {
              e.stopPropagation();
              favIndex = Math.min(favoriteProfiles.length - 1, favIndex + 1);
              renderFavorite();
            });
          }
          
          dots.forEach((dot, i) => {
            dot.addEventListener("click", (e) => {
              e.stopPropagation();
              favIndex = i;
              renderFavorite();
            });
          });
        };
        renderFavorite();
      }
    } catch (e) {
      console.error('Error rendering favorites:', e);
      // Fallback: Zeige zumindest die Anzahl aller Favoriten
      const totalFavs = (api.getFavorites() || []).length;
      cardFavs.innerHTML = `
        <div class="kpiTitle">Favoriten ⭐ (${totalFavs})</div>
        <div class="kpiBody">${totalFavs === 0 ? 'Noch keine favoriten Personen favorisiert.' : 'Fehler beim Laden der Favoriten.'}</div>
      `;
    }
  }

  // Aktivitäten - kombiniert aus Nachrichten, Forum-Updates, etc.
  if (cardActivity) {
    try {
      const activities = [];
      
      // 1. Neue Nachrichten
      try {
        const unreadMessages = (api.getThreads(u.email) || []).filter(t => (t.unreadCount || 0) > 0);
        unreadMessages.forEach(thread => {
          activities.push({
            id: `msg_${thread.id}`,
            type: 'message',
            title: 'Neue Nachricht',
            message: `Von ${thread.otherName || thread.otherEmail || 'Unbekannt'}: ${thread.subject || thread.lastSnippet || ''}`,
            threadId: thread.id,
            createdAt: thread.lastMessageAt || new Date().toISOString(),
            url: `nachrichten.html?thread=${encodeURIComponent(thread.id)}`
          });
        });
      } catch (e) {
        console.warn('Error loading messages for activities:', e);
      }
      
      // 2. Neue Beiträge in Threads wo man geschrieben hat
      try {
        const allThreads = api.getForumThreads() || [];
        const userPosts = allThreads.flatMap(t => {
          try {
            const posts = api.getForumPosts(t.id) || [];
            const userPost = posts.find(p => p.authorEmail === u.email && !p.deleted);
            if (userPost) {
              // Prüfe ob es neue Posts nach dem eigenen gibt
              const newerPosts = posts.filter(p => 
                !p.deleted && 
                p.authorEmail !== u.email && 
                p.createdAt > userPost.createdAt
              );
              if (newerPosts.length > 0) {
                const newestPost = newerPosts.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
                return {
                  threadId: t.id,
                  threadTitle: t.title,
                  newPostsCount: newerPosts.length,
                  lastPostAt: newestPost.createdAt
                };
              }
            }
            return null;
          } catch (e) {
            return null;
          }
        }).filter(t => t !== null);
        
        userPosts.forEach(thread => {
          activities.push({
            id: `thread_${thread.threadId}`,
            type: 'forum_reply',
            title: 'Neue Antworten',
            message: `In "${thread.threadTitle}": ${thread.newPostsCount} neue ${thread.newPostsCount === 1 ? 'Antwort' : 'Antworten'}`,
            threadId: thread.threadId,
            createdAt: thread.lastPostAt,
            url: `forum-thread.html?thread=${encodeURIComponent(thread.threadId)}`
          });
        });
      } catch (e) {
        console.warn('Error loading forum posts for activities:', e);
      }
      
      // 3. Neue Beiträge in favorisierten/beobachteten Threads
      try {
        const allThreads = api.getForumThreads() || [];
        const favoriteThreads = favs.filter(f => f.targetType === 'thread');
        const watchedThreads = allThreads.filter(t => t.watchedBy && t.watchedBy.includes(u.email));
        
        [...favoriteThreads, ...watchedThreads.map(t => ({ targetId: t.id }))].forEach(fav => {
          try {
            const thread = api.getForumThread(fav.targetId);
            if (thread && thread.lastActivityAt) {
              // Prüfe ob es neue Posts gibt (vereinfacht: wenn lastActivityAt neuer als letzter Besuch)
              const posts = api.getForumPosts(fav.targetId) || [];
              const newPosts = posts.filter(p => 
                !p.deleted && 
                p.authorEmail !== u.email &&
                p.createdAt > (thread.lastViewedAt || thread.createdAt)
              );
              if (newPosts.length > 0) {
                activities.push({
                  id: `fav_thread_${fav.targetId}`,
                  type: 'forum_favorite',
                  title: 'Neue Beiträge',
                  message: `In "${thread.title}": ${newPosts.length} neue ${newPosts.length === 1 ? 'Beitrag' : 'Beiträge'}`,
                  threadId: fav.targetId,
                  createdAt: thread.lastActivityAt,
                  url: `forum-thread.html?thread=${encodeURIComponent(fav.targetId)}`
                });
              }
            }
          } catch (e) {
            // Ignore errors
          }
        });
      } catch (e) {
        console.warn('Error loading favorite threads for activities:', e);
      }
      
      // Sortiere nach Datum (neueste zuerst)
      activities.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      
      // Render Aktivitäten
      const visibleActivities = activities.slice(0, 5);
      cardActivity.innerHTML = `
        <div style="font-weight:900; margin-bottom: 12px;">Aktivitäten</div>
        <div class="hr" style="margin-bottom: 12px;"></div>
        ${visibleActivities.length === 0 ? `
          <div class="p" style="color: var(--text-secondary);">Keine neuen Aktivitäten.</div>
        ` : visibleActivities.map(a => {
          const date = a.createdAt ? new Date(a.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }) : '';
          const clickAction = a.url ? `onclick="window.location.href='${a.url}'" style="cursor:pointer;"` : '';
          return `<div class="listItem" ${clickAction} style="margin-bottom: 8px;">
            <div>
              <b style="font-size: 14px;">${a.title}</b>
              <div class="small" style="margin-top: 4px;">${(a.message||"").substring(0, 80)}${(a.message||"").length > 80 ? '...' : ''}</div>
              ${date ? `<div class="small" style="margin-top: 4px; color: var(--text-secondary);">${date}</div>` : ''}
            </div>
          </div>`;
        }).join("")}
        ${activities.length > 5 ? `
          <div style="margin-top: 12px; text-align: center;">
            <span class="small" style="color: var(--text-secondary);">+ ${activities.length - 5} weitere</span>
          </div>
        ` : ''}
      `;
    } catch (e) {
      console.error('Error rendering activities:', e);
      // Fallback: Zeige zumindest den Titel
      cardActivity.innerHTML = `
        <div style="font-weight:900; margin-bottom: 12px;">Aktivitäten</div>
        <div class="hr" style="margin-bottom: 12px;"></div>
        <div class="p" style="color: var(--text-secondary);">Fehler beim Laden der Aktivitäten.</div>
      `;
    }
  }
}

/* ========== EVENTS ========== */
async function renderEvents(){
  const wrap = $("#eventsGrid");
  const u = await api.me();
  const events = (await api.listEvents()).slice().sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
  
  // Sicherstellen dass Event-Modal geschlossen ist beim Laden
  if ($("#evOverlay")) {
    $("#evOverlay").style.display = "none";
  }

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
              <span>📅 ${fmtDate(ev).split(' ')[0]}</span><span>⏰ ${ev.time}</span>
              <span class="badge">${ev.location}</span>
            </div>
            <div class="chips" style="margin-top:10px">${(ev.tags||[]).slice(0,6).map(t=>`<span class="chip">${t}</span>`).join("")}</div>
          </div>
          <span class="badge blue">${ev.format}</span>
        </div>
        <div class="hr"></div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button class="btn primary" data-book="${ev.id}" ${full||isBooked(ev)?"disabled":""}>${isBooked(ev)?"Gebucht":(full?"Ausgebucht":"Buchen")}</button>
          ${isBooked(ev) ? `
            <button class="btn" data-ics="${ev.id}">ICS</button>
            <button class="btn" data-open="${ev.id}">Details</button>
          ` : ''}
        </div>
        <div class="small" style="margin-top:10px">Teilnehmer: ${count}/${ev.capacity}</div>
      </div>
    `;
  }).join("");

  wrap.querySelectorAll("[data-book]").forEach(b=>b.addEventListener("click", ()=>{
    const id = b.dataset.book;
    const res = api.bookEvent(id);
    if(!res.success) toast.error(res.error);
    renderEvents();
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
  const parts = api.getParticipants(eventId).slice(0,12);
  const threadId = ev.eventThreadId || null;
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
    ${ev.explanation ? `
    <div class="hr"></div>
    <div style="font-weight:900; margin-bottom:8px">Weitere Erklärung</div>
    <div class="p" style="white-space: pre-wrap; word-wrap: break-word;">${ev.explanation}</div>
    ` : ''}
    <div class="hr"></div>
    <div style="font-weight:900">Teilnehmer (Preview)</div>
    <div class="small">Nur sichtbar für eingeloggte Nutzer (MVP). Später: nur für gebuchte.</div>
    <div style="margin-top:10px">
      ${parts.length ? parts.map(p=>`<div class="listItem"><div><b>${p.email}</b></div><span class="badge">participant</span></div>`).join("") : `<div class="p">Noch keine Teilnehmer.</div>`}
    </div>
    <div style="margin-top:12px; display:flex; gap:10px; flex-wrap:wrap">
      ${threadId ? `<a class="btn primary" href="forum-thread.html?thread=${encodeURIComponent(threadId)}">Zum Event-Thread</a>` : ''}
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
  
  const parts = api.getParticipants(eventId);
  const threadId = ev.eventThreadId || null;
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
      <div class="p" style="white-space: pre-wrap; word-wrap: break-word;">${ev.descriptionMember}</div>
    </div>
    ` : ''}
    ${ev.explanation ? `
    <div class="hr"></div>
    <div style="margin-bottom:12px">
      <div style="font-weight:600; margin-bottom:8px">Weitere Erklärung</div>
      <div class="p" style="white-space: pre-wrap; word-wrap: break-word;">${ev.explanation}</div>
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
      ${threadId ? `<a class="btn" href="forum-thread.html?thread=${encodeURIComponent(threadId)}">Zum Event-Thread</a>` : ''}
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
      if(res.success){
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
    
    // Get theme-aware badge styles
    const isLightMode = document.documentElement.getAttribute('data-theme') !== 'dark';
    const badgeStyle = isLightMode 
      ? 'background: rgba(255, 107, 53, 0.15); color: #C2410C; border: 1px solid rgba(255, 107, 53, 0.3); font-weight: 600;'
      : 'background: var(--primary); color: white;';
    
    return `
    <a class="card forum-category-card" href="forum-kategorie.html?cat=${encodeURIComponent(c.id)}" style="padding:20px; text-decoration:none; display:block">
      <div style="display:flex; align-items:start; gap:12px">
        <div style="font-size:32px; line-height:1">${c.icon || '💬'}</div>
        <div style="flex:1">
          <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:8px">
            <div style="font-weight:900; font-size:18px">${c.title}</div>
            <div class="badge" style="${badgeStyle}">${c.topicCount} ${c.topicCount === 1 ? 'Thread' : 'Threads'}</div>
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
  const catTitle = $("#catTitle");
  const catDesc = $("#catDesc");
  const threadList = $("#threadList");
  
  if (!catTitle || !catDesc || !threadList) {
    console.error('Forum category elements not found');
    const main = document.querySelector('main');
    if (main) {
      main.innerHTML = `<div class="card pane"><div class="p">Fehler beim Laden der Kategorie. Bitte laden Sie die Seite neu.</div><button class="btn primary" onclick="window.location.reload()">Seite neu laden</button></div>`;
    }
    return;
  }
  
  const catId = qs.get("cat") || "cat_general";
  const cat = api.listForumCategories().find(c=>c.id===catId);
  
  if (!cat) {
    console.error('Category not found:', catId);
    catTitle.textContent = "Kategorie nicht gefunden";
    catDesc.textContent = "";
    threadList.innerHTML = `<div class="p">Die Kategorie wurde nicht gefunden.</div>`;
    return;
  }
  
  catTitle.textContent = cat.title || "Kategorie";
  catDesc.textContent = cat.desc || "";

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
  
  threadList.innerHTML = sortedThreads.length ? `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; padding:0 6px">
      <div class="small" style="color:var(--text-secondary)">${sortedThreads.length} ${sortedThreads.length === 1 ? 'Thread' : 'Threads'}</div>
      <select class="select" id="threadSort" style="width:auto; font-size:13px">
        <option value="latest" ${sortBy === 'latest' ? 'selected' : ''}>Neueste zuerst</option>
        <option value="popular" ${sortBy === 'popular' ? 'selected' : ''}>Beliebteste</option>
        <option value="replies" ${sortBy === 'replies' ? 'selected' : ''}>Meiste Antworten</option>
      </select>
    </div>
    ${sortedThreads.map((t, index)=>{
      const lastPostDate = new Date(t.lastActivityAt).toLocaleDateString('de-DE', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      // Wechselnde Farben: Orange und Grün (Accent)
      const borderColor = index % 2 === 0 ? 'var(--primary)' : 'var(--accent)';
      const borderStyle = `border: 2px solid ${borderColor}; border-radius: var(--radius);`;
      
      return `
      <a href="forum-thread.html?thread=${encodeURIComponent(t.id)}" style="text-decoration:none; display:block; margin-bottom:12px;">
        <div class="listItem forum-thread-item" style="padding:16px; cursor:pointer; ${borderStyle} background: var(--surface); transition: all 0.2s ease; ${t.pinned ? 'border-left:4px solid var(--primary);' : ''}">
          <div style="flex:1">
            <div style="display:flex; align-items:start; gap:8px; margin-bottom:8px">
              <div style="font-weight:900; font-size:16px; flex:1; color:var(--text-primary)">
                ${t.pinned ? '<span style="color:var(--primary); margin-right:6px">📌</span>' : ''}
                ${t.title}
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
          </div>
        </div>
      </a>
    `;
    }).join("")}
  ` : `
    <div style="text-align:center; padding:48px 24px; color:var(--text-secondary)">
      <div style="font-size:64px; margin-bottom:16px; opacity:0.5">💬</div>
      <div style="font-size:18px; font-weight:600; margin-bottom:8px; color:var(--text-primary)">Keine Threads in dieser Kategorie.</div>
      <div style="font-size:14px; margin-bottom:24px">Erstelle den ersten Thread und starte eine Diskussion!</div>
      <button class="btn primary" id="emptyStateNewThread">Neuen Thread erstellen</button>
    </div>
  `;
  
  // Empty state button handler
  $("#emptyStateNewThread")?.addEventListener("click", () => {
    $("#newThreadBtn")?.click();
  });
  
  // Ensure newThreadBtn exists and works
  const newThreadBtn = $("#newThreadBtn");
  if (newThreadBtn && !newThreadBtn.hasAttribute('data-wired')) {
    newThreadBtn.setAttribute('data-wired', 'true');
    newThreadBtn.addEventListener("click", () => {
      $("#thrOverlay").style.display = "flex";
      $("#thrTitle").value = "";
      $("#thrBody").value = "";
      $("#thrErr").textContent = "";
    });
  }
  
  // Sortierung Event Listener
  $("#threadSort")?.addEventListener("change", (e) => {
    const newUrl = new URL(location.href);
    newUrl.searchParams.set('sort', e.target.value);
    location.href = newUrl.toString();
  });

  // new thread modal - sicherstellen dass es geschlossen ist beim Laden
  if ($("#thrOverlay")) {
    $("#thrOverlay").style.display = "none";
  }
  
  const open = ()=>$("#thrOverlay").style.display="flex";
  const close = ()=>$("#thrOverlay").style.display="none";
  
  // Nur öffnen wenn Button geklickt wird
  $("#newThreadBtn")?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    open();
  });
  
  $("#thrClose")?.addEventListener("click", close);
  $("#thrOverlay")?.addEventListener("click",(e)=>{ if(e.target.id==="thrOverlay") close(); });

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
      if(!res.success){ 
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
  
  // Process images - add max-width and responsive styling
  content = content.replace(/<img([^>]*)>/gi, (match, attrs) => {
    // Extract src attribute to check if it's a data URL
    const srcMatch = attrs.match(/src=["']([^"']+)["']/i);
    const src = srcMatch ? srcMatch[1] : '';
    
    // Check if style attribute already exists
    let styleAttr = '';
    if (attrs.includes('style=')) {
      const styleMatch = attrs.match(/style=["']([^"']+)["']/i);
      styleAttr = styleMatch ? styleMatch[1] : '';
    }
    
    // Add responsive styles
    if (!styleAttr.includes('max-width') && !styleAttr.includes('maxWidth')) {
      styleAttr = styleAttr ? `${styleAttr}; max-width: 100%; height: auto; display: block;` : 'max-width: 100%; height: auto; display: block;';
    }
    
    // Add error handler for broken images
    if (!attrs.includes('onerror')) {
      attrs += ` onerror="this.style.display='none'; this.outerHTML='<div style=\\'padding:20px; text-align:center; background:var(--bg); border:1px solid var(--border); border-radius:6px; color:var(--text-secondary)\\'><span style=\\'font-size:24px\\'>🖼️</span><br/>Bild konnte nicht geladen werden</div>';"`;
    }
    
    // Update or add style attribute
    if (attrs.includes('style=')) {
      attrs = attrs.replace(/style=["'][^"']*["']/i, `style="${styleAttr}"`);
    } else {
      attrs += ` style="${styleAttr}"`;
    }
    
    return `<img${attrs}>`;
  });
  
  return content;
}

function renderForumThread(){
  const threadTitle = $("#threadTitle");
  const postsWrap = $("#postsWrap");
  const threadMeta = $("#threadMeta");
  
  if (!threadTitle || !postsWrap) {
    console.error('Forum thread elements not found');
    return;
  }
  
  const threadId = qs.get("thread");
  if (!threadId) {
    threadTitle.textContent = "Kein Thread ausgewählt";
    postsWrap.innerHTML = "<div class='p'>Bitte wählen Sie einen Thread aus.</div>";
    return;
  }
  
  let t = api.getForumThread(threadId);
  if(!t){ 
    threadTitle.textContent = "Nicht gefunden"; 
    postsWrap.innerHTML = "<div class='p'>Thread existiert nicht.</div>"; 
    return; 
  }
  
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

  if (t.title) {
    threadTitle.textContent = t.title;
  } else {
    threadTitle.textContent = "Unbenannter Thread";
    console.warn('Thread has no title:', t);
  }
  const u = api.me();
  const isLiked = u && t.likes && t.likes.includes(u.email.toLowerCase());
  const isWatching = u && t.watchedBy && t.watchedBy.includes(u.email.toLowerCase());
  
  if (threadMeta) {
    threadMeta.innerHTML = `
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
  }
  
  // Like/Watch Buttons
  if(u){
    $("#likeThreadBtn")?.addEventListener("click", () => {
      const res = api.likeThread(threadId);
      if(res.success){
        location.reload();
      }
    });
    
    $("#watchThreadBtn")?.addEventListener("click", () => {
      const res = api.watchThread(threadId);
      if(res.success){
        location.reload();
      }
    });
  }

  const posts = api.getForumPosts(threadId);
  if (!posts || posts.length === 0) {
    postsWrap.innerHTML = "<div class='p'>Noch keine Antworten in diesem Thread.</div>";
  } else {
    postsWrap.innerHTML = posts.map(p=>{
    const author = api.getProfileByEmail(p.authorEmail) || { name: p.authorEmail.split("@")[0], email: p.authorEmail };
    const authorName = author.name || p.authorEmail.split("@")[0];
    const initials = (authorName || p.authorEmail).split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2);
    const authorAvatar = avatarGenerator.getAvatarUrl(author) || null;
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
          <div class="forum-post-avatar" style="width:40px;height:40px;border-radius:50%;overflow:hidden;flex-shrink:0;background:var(--bg);border:2px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600;color:var(--text-primary);${authorAvatar ? `background-image:url('${authorAvatar}');background-size:cover;background-position:center;` : ''}">
            ${authorAvatar ? '' : initials}
          </div>
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
          <button class="forum-reply-button" data-copy-link="${p.id}" title="Link kopieren">
            🔗 Link
          </button>
          ${p.authorEmail !== u.email ? `
            <button class="forum-reply-button" data-report-post="${p.id}" data-report-type="post" title="Beitrag melden" style="color:var(--danger)">
              🚩 Melden
            </button>
          ` : ''}
          ${p.authorEmail === u.email ? `
            <button class="forum-reply-button" data-delete-post="${p.id}" style="color:var(--danger)" title="Eigenen Post löschen">
              🗑️ Löschen
            </button>
          ` : ''}
        </div>
      ` : ''}
    </div>
  `;
  }).join("");

  // Quote button handlers
  postsWrap.querySelectorAll("[data-quote-post]").forEach(btn => {
    btn.addEventListener("click", () => {
      const postId = btn.dataset.quotePost;
      const post = posts.find(p => p.id === postId);
      if (!post) return;
      
      const author = api.getProfileByEmail(post.authorEmail) || { name: post.authorEmail.split("@")[0] };
      const authorName = author.name || post.authorEmail.split("@")[0];
      
      // Extract text from HTML (remove tags)
      const textContent = post.body.replace(/<[^>]*>/g, '').trim();
      const quoteText = textContent.length > 200 ? textContent.substring(0, 200) + '...' : textContent;
      
      // Create quote block with gray background
      const quoteBlock = `<blockquote style="background:var(--bg); border-left:3px solid var(--primary); padding:12px; margin:12px 0; border-radius:4px; color:var(--text-secondary); font-style:italic;">
        <div style="font-weight:600; margin-bottom:6px; color:var(--text-primary);">${authorName} schrieb:</div>
        <div>${quoteText}</div>
      </blockquote>
      
      `;
      
      // Insert quote into reply editor
      const replyBodyEl = $("#replyBody");
      if (replyBodyEl) {
        // Check if Quill editor exists
        if (richTextEditor.editors.has("replyBody")) {
          const editor = richTextEditor.editors.get("replyBody");
          const range = editor.quill.getSelection(true);
          const currentContent = editor.quill.root.innerHTML;
          editor.quill.root.innerHTML = currentContent + quoteBlock;
          editor.textarea.value = editor.quill.root.innerHTML;
          // Scroll to reply area
          replyBodyEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          // Fallback to textarea
          replyBodyEl.value = replyBodyEl.value + quoteBlock;
          replyBodyEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });
  });

  // Report button handlers
  postsWrap.querySelectorAll("[data-report-post]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const postId = btn.dataset.reportPost;
      const post = posts.find(p => p.id === postId);
      if (!post) return;
      
      const author = api.getProfileByEmail(post.authorEmail) || { name: post.authorEmail.split("@")[0] };
      const authorName = author.name || post.authorEmail.split("@")[0];
      
      // Import and show report modal
      const { showReportModal } = await import('./components/reportModal.js');
      showReportModal('post', postId, {
        title: `Beitrag von ${authorName}`,
        content: post.body.replace(/<[^>]*>/g, '').substring(0, 100) + '...'
      });
    });
  });

  // Link button handlers - fix the link functionality
  postsWrap.querySelectorAll(".forum-reply-button").forEach(btn => {
    if (btn.textContent.includes('🔗')) {
      btn.onclick = function() {
        const postId = this.closest('.forum-post-card')?.id?.replace('post-', '');
        if (postId) {
          const link = window.location.origin + window.location.pathname + '#post-' + postId;
          navigator.clipboard.writeText(link).then(() => {
            const originalText = this.textContent;
            this.textContent = '✓ Kopiert!';
            setTimeout(() => {
              this.textContent = originalText;
            }, 2000);
          }).catch(err => {
            console.error('Failed to copy link:', err);
            alert('Link konnte nicht kopiert werden.');
          });
        }
      };
    }
    
    // Delete button handler
    if (btn.dataset.deletePost) {
      btn.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const postId = btn.dataset.deletePost;
        console.log('Delete button clicked, postId:', postId);
        
        const post = posts.find(p => p.id === postId);
        if (!post) {
          console.error('Post not found:', postId);
          return;
        }
        
        // Check if this is the last post
        const allPosts = api.getForumPosts(threadId);
        const nonDeletedPosts = allPosts.filter(p => !p.deleted);
        const isLastPost = nonDeletedPosts.length === 1 && nonDeletedPosts[0].id === postId;
        
        console.log('Is last post:', isLastPost, 'Total posts:', nonDeletedPosts.length);
        
        // Show confirmation modal
        try {
          const confirmModule = await import('./components/confirmModal.js');
          const confirmModal = confirmModule.confirmModal;
          const message = isLastPost 
            ? `Dies ist der letzte Beitrag in diesem Thread. Wenn Sie diesen Beitrag löschen, wird auch der gesamte Thread gelöscht. Möchten Sie fortfahren?`
            : `Möchten Sie diesen Beitrag wirklich löschen?`;
          const confirmed = await confirmModal.show(
            message,
            isLastPost ? 'Thread wird gelöscht' : 'Beitrag löschen',
            'Löschen',
            'Abbrechen'
          );
          
          console.log('Confirmation result:', confirmed);
          
          if (confirmed) {
            const res = api.deleteForumPost(threadId, postId);
            console.log('Delete result:', res);
            
            if (res && res.success) {
              if (res.isLastPost) {
                // Delete thread as well
                api.adminDeleteThread(threadId);
                const { showSuccessModal } = await import('./components/successModal.js');
                showSuccessModal('Der Beitrag und der Thread wurden erfolgreich gelöscht.', 'Gelöscht');
                setTimeout(() => {
                  window.location.href = 'forum.html';
                }, 1500);
              } else {
                const { showSuccessModal } = await import('./components/successModal.js');
                showSuccessModal('Der Beitrag wurde erfolgreich gelöscht.', 'Beitrag gelöscht');
                setTimeout(() => {
                  location.reload();
                }, 1500);
              }
            } else {
              // Import toast dynamically
              const { toast } = await import('./components/toast.js');
              toast.error(res?.error || "Fehler beim Löschen.");
              console.error('Delete failed:', res);
            }
          }
        } catch (error) {
          console.error('Error in delete handler:', error);
          alert('Fehler beim Löschen: ' + error.message);
        }
      });
    }
  });

  if(api.isAdmin()){
    $("#adminThreadTools").style.display="flex";
    $("#pinBtn").textContent = t.pinned ? "Unpin" : "Pin";
    $("#lockBtn").textContent = t.locked ? "Unlock" : "Lock";

    $("#pinBtn").onclick = ()=>{ api.adminPinThread(threadId, !t.pinned); location.reload(); };
    $("#lockBtn").onclick = ()=>{ api.adminLockThread(threadId, !t.locked); location.reload(); };
    $("#delBtn").onclick = ()=>{ if(confirm("Thread wirklich löschen (soft)?")){ api.adminDeleteThread(threadId); window.location.href="forum.html"; } };
  }

  $("#replyBtn").addEventListener("click", ()=>{
      if (replyErr) replyErr.textContent = "";
      // Get content from Rich Text Editor if available
      let body = "";
      if (replyBody) {
        if (window.Quill && richTextEditor.editors.has("replyBody")) {
          const editor = richTextEditor.editors.get("replyBody");
          body = editor.quill.root.innerHTML.trim();
          const textOnly = editor.quill.getText().trim();
          if (!textOnly || textOnly.length === 0) {
            body = "";
          }
        } else {
          body = replyBody.value.trim();
        }
      }
      if(!body){ 
        if (replyErr) replyErr.textContent = "Text fehlt."; 
        return; 
      }
      const res = api.replyForumThread(threadId, body);
      if(!res.success){ 
        if (replyErr) replyErr.textContent = res.error; 
        return; 
      }
      location.reload();
    });
  }
  
  // Initialize Rich Text Editor for reply - ensure it works
  if (replyBody) {
    setTimeout(() => {
      if (window.Quill) {
        if (!richTextEditor.editors.has("replyBody")) {
          try {
            richTextEditor.createEditor(replyBody);
          } catch (e) {
            console.warn("Could not initialize Rich Text Editor:", e);
          }
        }
      } else {
        richTextEditor.init();
        setTimeout(() => {
          if (!richTextEditor.editors.has("replyBody")) {
            try {
              richTextEditor.createEditor(replyBody);
            } catch (e) {
              console.warn("Could not initialize Rich Text Editor:", e);
            }
          }
        }, 1000);
      }
    }, 100);
  }

  if(t.locked && replyBody){
    replyBody.disabled = true;
    if (replyBtn) replyBtn.disabled = true;
    if (replyErr) replyErr.textContent = "Thread ist geschlossen.";
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
      <div style="display:flex;justify-content:space-between;gap:10px;align-items:center; margin-bottom:16px">
        <div style="font-weight:900">Unterhaltung</div>
        <a class="btn" href="neue-nachricht.html">Neue</a>
      </div>
      <div id="msgList" style="flex:1; overflow-y:auto; margin-bottom:16px; padding-bottom:16px; border-bottom:1px solid var(--border); min-height:200px; max-height:400px"></div>
      <div style="flex-shrink:0">
        <label class="label">Antwort</label>
        <div style="position:relative">
          <textarea class="textarea" id="replyMsg" data-rich-text placeholder="Schreibe deine Nachricht..." style="min-height:100px; max-height:200px; resize:vertical"></textarea>
        </div>
        <div id="attachmentList" style="margin-top:8px"></div>
        <div class="err" id="msgErr"></div>
        <div style="margin-top:10px; display:flex; align-items:center; gap:8px">
          <button class="btn small" id="attachBtn">📎 Anhang</button>
          <button class="btn primary" id="sendReply">Senden</button>
          <div id="typingIndicator" style="display:none; font-size:13px; color:var(--text-secondary); font-style:italic">
            ${api.getProfileByEmail(api.getThreads(u.email).find(t=>t.id===threadId)?.otherEmail)?.name || 'Jemand'} schreibt...
          </div>
        </div>
      </div>
    `;
    right.querySelector("#msgList").innerHTML = msgs.map(m=>{
      const hasAttachments = m.attachments && m.attachments.length > 0;
      return `
      <div class="msgBlock ${m.from===u.email?"msgBlock-own":""}" style="margin-bottom:16px">
        <div class="msgMeta">
          <span><b>${m.from===u.email?"Du":m.from}</b> → ${m.to===u.email?"Du":m.to}</span>
          <span>${new Date(m.createdAt).toLocaleString()}</span>
        </div>
        <div class="p message-content">${m.body || ""}</div>
        ${hasAttachments ? `
          <div class="message-attachments" style="margin-top:8px">
            ${m.attachments.map((att, idx) => `
              <div class="attachment-item" style="margin-top:4px">
                <span style="flex:1">📎 ${att.name} (${(att.size / 1024).toFixed(1)} KB)</span>
                <button class="btn small" onclick="downloadAttachment('${att.url}', '${att.name}')" title="Download">⬇️ Download</button>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
    }).join("");

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
      // Reset input so same file can be selected again
      attachmentInput.value = '';
    });
    
    function updateAttachmentList() {
      const list = right.querySelector("#attachmentList");
      if (list) {
        if (selectedAttachments.length > 0) {
          list.innerHTML = `
            <div style="padding:8px; background:var(--bg); border-radius:6px; border:1px solid var(--border)">
              <div style="font-size:13px; font-weight:600; margin-bottom:8px">Anhänge:</div>
              ${selectedAttachments.map((att, idx) => `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:6px; margin-bottom:4px; background:var(--surface); border-radius:4px">
                  <span style="font-size:12px; flex:1">📎 ${att.name} (${(att.size / 1024).toFixed(1)} KB)</span>
                  <button class="btn small" style="margin-left:8px" onclick="removeAttachment(${idx})" title="Entfernen">✕</button>
                </div>
              `).join('')}
            </div>
          `;
        } else {
          list.innerHTML = '';
        }
      }
    }
    
    // Make removeAttachment accessible
    window.removeAttachment = function(idx) {
      selectedAttachments.splice(idx, 1);
      updateAttachmentList();
    };
    
    // Make downloadAttachment accessible
    window.downloadAttachment = function(url, filename) {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    
    right.querySelector("#attachBtn").addEventListener("click", () => attachmentInput.click());
    
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
    if(!res.success){ $("#sendErr").textContent=res.error; return; }
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

  // Get avatar for member
  const defaultPortraits = [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=faces'
  ];
  const nameHash = (p.name || p.email).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const portraitIndex = nameHash % defaultPortraits.length;
  const defaultAvatarUrl = defaultPortraits[portraitIndex];
  const initials = (p.name || p.email).split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2);
  const customAvatarUrl = avatarGenerator.getAvatarUrl(p);
  const finalAvatarUrl = customAvatarUrl || defaultAvatarUrl;
  const hasCustomAvatar = !!customAvatarUrl;

  $("#memberCard").innerHTML = `
    <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap">
      <div style="display:flex;gap:16px;align-items:start">
        <div style="width:80px;height:80px;border-radius:50%;overflow:hidden;flex-shrink:0;background:var(--bg);border:2px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:600;color:var(--text-primary);background-image:url('${finalAvatarUrl}');background-size:cover;background-position:center;">
          ${hasCustomAvatar ? '' : `<span style="display:none;">${initials}</span>`}
        </div>
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
        <div style="font-weight:900; margin-top:16px">Biete</div>
        <p class="p" style="margin-top:8px">${(p.offer||"—").replace(/\n/g,"<br/>")}</p>
        <div style="font-weight:900; margin-top:16px">Suche</div>
        <p class="p" style="margin-top:8px">${(p.lookingFor||"—").replace(/\n/g,"<br/>")}</p>
      </div>
      <div>
        <div style="font-weight:900">Skills</div>
        <div class="chips" style="margin-top:8px">${(p.skills||[]).map(s=>`<span class="chip">${s}</span>`).join("") || "—"}</div>
        <div style="font-weight:900; margin-top:12px">Interessen</div>
        <div class="chips" style="margin-top:8px">${(p.interests||[]).map(s=>`<span class="chip">${s}</span>`).join("") || "—"}</div>
      </div>
    </div>
  `;
  $("#favBtn").addEventListener("click", ()=>{ 
    const userId = p.userId || api.getProfileByEmail(p.email)?.userId || null;
    if (userId) {
      api.toggleFavorite("user", userId); 
      $("#favBtn").textContent="⭐ Favorit ✓"; 
    }
  });
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

// Collect all unique skills and interests from all profiles
function getAllAvailableTags(type = 'skills') {
  const allMembers = api.listMembers("");
  const tagSet = new Set();
  
  allMembers.forEach(member => {
    const tags = member[type] || [];
    tags.forEach(tag => {
      if (tag && tag.trim()) {
        tagSet.add(tag.trim());
      }
    });
  });
  
  return Array.from(tagSet).sort();
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
  
  // Add dropdowns for Skills and Interests - direkt unter dem Input-Feld
  const skillsInput = $("#pSkills");
  const interestsInput = $("#pInterests");
  
  // Get all available tags
  const allSkills = getAllAvailableTags('skills');
  const allInterests = getAllAvailableTags('interests');
  
  // Create Skills dropdown - direkt nach dem Input-Feld einfügen
  if (skillsInput && !skillsInput.parentElement.querySelector('.tag-dropdown')) {
    const skillsDropdown = document.createElement('div');
    skillsDropdown.className = 'tag-dropdown';
    skillsDropdown.id = 'skillsDropdown';
    skillsDropdown.style.cssText = 'position:relative; margin-top:8px;';
    
    const skillsDropdownBtn = document.createElement('button');
    skillsDropdownBtn.type = 'button';
    skillsDropdownBtn.className = 'btn small';
    skillsDropdownBtn.textContent = 'Bestehende Skills auswählen ▼';
    skillsDropdownBtn.style.cssText = 'width:100%; text-align:left; background:var(--surface); border:1px solid var(--border); color:var(--text-primary); font-weight:500;';
    
    const skillsDropdownMenu = document.createElement('div');
    skillsDropdownMenu.className = 'tag-dropdown-menu';
    skillsDropdownMenu.id = 'skillsDropdownMenu';
    skillsDropdownMenu.style.cssText = 'display:none; position:absolute; top:100%; left:0; right:0; background:var(--bg); border:1px solid var(--border); border-radius:6px; max-height:200px; overflow-y:auto; z-index:100; margin-top:4px; box-shadow:0 4px 12px rgba(0,0,0,0.1);';
    
    if (allSkills.length > 0) {
      allSkills.forEach(skill => {
        const item = document.createElement('div');
        item.className = 'tag-dropdown-item';
        item.textContent = skill;
        item.style.cssText = 'padding:8px 12px; cursor:pointer; transition:background 0.2s;';
        item.addEventListener('mouseenter', () => {
          item.style.background = 'rgba(0,0,0,0.05)';
        });
        item.addEventListener('mouseleave', () => {
          item.style.background = 'transparent';
        });
        item.addEventListener('click', () => {
          const currentValue = $("#pSkills").value.trim();
          const currentTags = parseTags(currentValue);
          if (!currentTags.includes(skill)) {
            const newValue = currentValue ? `${currentValue}, ${skill}` : skill;
            $("#pSkills").value = newValue;
          }
          skillsDropdownMenu.style.display = 'none';
        });
        skillsDropdownMenu.appendChild(item);
      });
    } else {
      const emptyItem = document.createElement('div');
      emptyItem.textContent = 'Noch keine Skills vorhanden';
      emptyItem.style.cssText = 'padding:8px 12px; color:var(--text-secondary); font-size:12px;';
      skillsDropdownMenu.appendChild(emptyItem);
    }
    
    skillsDropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = skillsDropdownMenu.style.display === 'block';
      skillsDropdownMenu.style.display = isVisible ? 'none' : 'block';
    });
    
    skillsDropdown.appendChild(skillsDropdownBtn);
    skillsDropdown.appendChild(skillsDropdownMenu);
    // Direkt nach dem Input-Feld einfügen
    skillsInput.parentElement.insertBefore(skillsDropdown, skillsInput.nextSibling);
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!skillsDropdown.contains(e.target)) {
        skillsDropdownMenu.style.display = 'none';
      }
    });
  }
  
  // Create Interests dropdown - direkt nach dem Input-Feld einfügen
  if (interestsInput && !interestsInput.parentElement.querySelector('#interestsDropdown')) {
    const interestsDropdown = document.createElement('div');
    interestsDropdown.className = 'tag-dropdown';
    interestsDropdown.id = 'interestsDropdown';
    interestsDropdown.style.cssText = 'position:relative; margin-top:8px;';
    
    const interestsDropdownBtn = document.createElement('button');
    interestsDropdownBtn.type = 'button';
    interestsDropdownBtn.className = 'btn small';
    interestsDropdownBtn.textContent = 'Bestehende Interessen auswählen ▼';
    interestsDropdownBtn.style.cssText = 'width:100%; text-align:left; background:var(--surface); border:1px solid var(--border); color:var(--text-primary); font-weight:500;';
    
    const interestsDropdownMenu = document.createElement('div');
    interestsDropdownMenu.className = 'tag-dropdown-menu';
    interestsDropdownMenu.id = 'interestsDropdownMenu';
    interestsDropdownMenu.style.cssText = 'display:none; position:absolute; top:100%; left:0; right:0; background:var(--bg); border:1px solid var(--border); border-radius:6px; max-height:200px; overflow-y:auto; z-index:100; margin-top:4px; box-shadow:0 4px 12px rgba(0,0,0,0.1);';
    
    // Combine skills and interests for interests dropdown (as requested)
    const allAvailableForInterests = [...new Set([...allSkills, ...allInterests])].sort();
    
    if (allAvailableForInterests.length > 0) {
      allAvailableForInterests.forEach(interest => {
        const item = document.createElement('div');
        item.className = 'tag-dropdown-item';
        item.textContent = interest;
        item.style.cssText = 'padding:8px 12px; cursor:pointer; transition:background 0.2s;';
        item.addEventListener('mouseenter', () => {
          item.style.background = 'rgba(0,0,0,0.05)';
        });
        item.addEventListener('mouseleave', () => {
          item.style.background = 'transparent';
        });
        item.addEventListener('click', () => {
          const currentValue = $("#pInterests").value.trim();
          const currentTags = parseTags(currentValue);
          if (!currentTags.includes(interest)) {
            const newValue = currentValue ? `${currentValue}, ${interest}` : interest;
            $("#pInterests").value = newValue;
          }
          interestsDropdownMenu.style.display = 'none';
        });
        interestsDropdownMenu.appendChild(item);
      });
    } else {
      const emptyItem = document.createElement('div');
      emptyItem.textContent = 'Noch keine Interessen vorhanden';
      emptyItem.style.cssText = 'padding:8px 12px; color:var(--text-secondary); font-size:12px;';
      interestsDropdownMenu.appendChild(emptyItem);
    }
    
    interestsDropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = interestsDropdownMenu.style.display === 'block';
      interestsDropdownMenu.style.display = isVisible ? 'none' : 'block';
    });
    
    interestsDropdown.appendChild(interestsDropdownBtn);
    interestsDropdown.appendChild(interestsDropdownMenu);
    // Direkt nach dem Input-Feld einfügen
    interestsInput.parentElement.insertBefore(interestsDropdown, interestsInput.nextSibling);
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!interestsDropdown.contains(e.target)) {
        interestsDropdownMenu.style.display = 'none';
      }
    });
  }
  
  // Avatar selector
  const avatarSelector = $("#avatarSelector");
  if (avatarSelector) {
    // Create file input for upload
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    
    let uploadedImage = p.avatarImage || null;
    window.currentUploadedImage = uploadedImage;
    
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Bild ist zu groß. Maximal 5MB erlaubt.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        uploadedImage = event.target.result;
        window.currentUploadedImage = uploadedImage;
        // Update the upload option preview
        const uploadOption = avatarSelector.querySelector('[data-avatar-type="upload"]');
        if (uploadOption) {
          const preview = uploadOption.querySelector('.avatar-preview');
          if (preview) {
            preview.innerHTML = `<img src="${uploadedImage}" alt="Upload" style="width:100%;height:100%;object-fit:cover;border-radius:50%;"/>`;
          }
        }
        // Select the upload option
        avatarSelector.querySelectorAll('.avatar-option').forEach(o => o.classList.remove('selected'));
        uploadOption?.classList.add('selected');
      };
      reader.readAsDataURL(file);
    });
    
    avatarSelector.innerHTML = `
      <div class="avatar-option ${!p.avatarType || p.avatarType === 'initials' ? 'selected' : ''}" data-avatar-type="initials" data-avatar-id="">
        <div style="width:64px;height:64px;margin:0 auto;">${avatarGenerator.generateInitialsAvatar(u.name || u.email, 64)}</div>
        <div style="text-align:center;margin-top:8px;font-size:12px;">Initialen</div>
      </div>
      <div class="avatar-option ${p.avatarType === 'upload' ? 'selected' : ''}" data-avatar-type="upload" data-avatar-id="">
        <div class="avatar-preview" style="width:64px;height:64px;margin:0 auto;border-radius:50%;overflow:hidden;background:var(--bg);border:2px solid var(--border);display:flex;align-items:center;justify-content:center;">
          ${p.avatarType === 'upload' && p.avatarImage ? 
            `<img src="${p.avatarImage}" alt="Upload" style="width:100%;height:100%;object-fit:cover;"/>` : 
            `<span style="font-size:24px;">📷</span>`
          }
        </div>
        <div style="text-align:center;margin-top:8px;font-size:12px;">Eigenes Bild</div>
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
        if (opt.dataset.avatarType === 'upload') {
          fileInput.click();
        } else {
          avatarSelector.querySelectorAll('.avatar-option').forEach(o => o.classList.remove('selected'));
          opt.classList.add('selected');
          uploadedImage = null; // Clear uploaded image when selecting other option
          window.currentUploadedImage = null;
        }
      });
    });
    
  }

  const saveProfileHandler = ()=>{
    const selectedAvatar = avatarSelector?.querySelector('.avatar-option.selected');
    const avatarType = selectedAvatar?.dataset.avatarType || 'initials';
    const avatarId = selectedAvatar?.dataset.avatarId || '';
    // Only include avatarImage if upload type is selected and image exists
    const avatarImage = (avatarType === 'upload' && window.currentUploadedImage) ? window.currentUploadedImage : 
                        (avatarType === 'upload' && p.avatarImage) ? p.avatarImage : 
                        (avatarType !== 'upload') ? null : null;
    
    $("#pErr").textContent=""; $("#pOk").textContent="";
    const profileData = {
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
    };
    
    // Only add avatarImage if it's set
    if (avatarImage !== null) {
      profileData.avatarImage = avatarImage;
    } else if (avatarType !== 'upload') {
      // Clear avatarImage when switching to non-upload type
      profileData.avatarImage = null;
    }
    
    const res = api.updateMyProfile(profileData);
    if(!res.success){ 
      $("#pErr").textContent=res.error; 
      return; 
    }
    // Success Modal anzeigen
    import('./components/successModal.js').then(module => {
      module.showSuccessModal('Ihr Profil wurde erfolgreich gespeichert.', 'Erfolgreich gespeichert');
    });
    // Update progress after save
    setTimeout(() => renderProfileProgress(), 100);
  };
  
  $("#saveProfile").addEventListener("click", saveProfileHandler);
  $("#saveProfileTop")?.addEventListener("click", saveProfileHandler);
}

/* ========== MONATSUPDATES ========== */
function renderMonatsupdates(){
  // Ensure elements exist
  if(!$("#timelineList") || !$("#updateDetail")) {
    console.warn("Monatsupdates page elements not found");
    return;
  }
  
  const updates = api.listUpdatesMember();
  const allUpdates = JSON.parse(localStorage.getItem("cms:updates") || "[]");
  const publishedUpdates = allUpdates.filter(u => u.status === "published");
  
  // Merge with old format if needed
  const allUpdatesCombined = [...publishedUpdates, ...updates.filter(u => !publishedUpdates.find(pu => pu.id === u.id))];
  const sortedUpdates = allUpdatesCombined.sort((a, b) => {
    const dateA = a.issueDate || a.month || '';
    const dateB = b.issueDate || b.month || '';
    return dateB.localeCompare(dateA);
  });
  
  // Gruppiere Updates nach Jahren
  const updatesByYear = {};
  sortedUpdates.forEach(upd => {
    const dateStr = upd.issueDate || upd.month || '';
    const [year] = dateStr.split('-');
    if(year && year.length === 4) {
      if(!updatesByYear[year]) {
        updatesByYear[year] = [];
      }
      updatesByYear[year].push(upd);
    }
  });
  
  const years = Object.keys(updatesByYear).sort((a, b) => b.localeCompare(a));
  let currentView = 'years';
  let selectedYear = null;
  let selectedUpdate = null;
  
  const renderYears = () => {
    currentView = 'years';
    selectedYear = null;
    selectedUpdate = null;
    
    $("#timelineList").innerHTML = `
      <div style="position:relative; padding-left:24px">
        <div style="position:absolute; left:8px; top:0; bottom:0; width:2px; background:var(--border)"></div>
        ${years.map((year, idx) => {
          const count = updatesByYear[year].length;
          return `
            <div style="position:relative; margin-bottom:16px">
              <div class="timeline-year" data-year="${year}" 
                   style="padding:16px; border-left:3px solid var(--primary); cursor:pointer; transition:all 0.2s; border-radius:6px; background:var(--bg); position:relative; z-index:2"
                   onmouseover="this.style.background='rgba(37, 99, 235, 0.1)'; this.style.borderLeftColor='var(--accent)'"
                   onmouseout="this.style.background='var(--bg)'; this.style.borderLeftColor='var(--primary)'">
                <div style="font-weight:700; font-size:18px; margin-bottom:4px">${year}</div>
                <div style="font-size:13px; color:var(--text-secondary)">${count} ${count === 1 ? 'Update' : 'Updates'}</div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
    
    if(years.length === 0) {
      $("#timelineList").innerHTML = '<div class="p" style="padding:20px">Noch keine Monatsupdates vorhanden.</div>';
    }
    
    // Event Listeners für Jahre
    $("#timelineList").querySelectorAll(".timeline-year").forEach(item => {
      item.addEventListener("click", () => {
        const year = item.dataset.year;
        if(year) {
          selectedYear = year;
          renderMonths(year);
        }
      });
    });
    
    // Clear detail view
    renderEmptyDetail();
  };
  
  const renderMonths = (year) => {
    currentView = 'months';
    const yearUpdates = updatesByYear[year] || [];
    const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
    
    $("#timelineList").innerHTML = `
      <div style="margin-bottom:16px">
        <button class="btn small" onclick="renderMonatsupdatesYears()" style="width:100%; margin-bottom:12px">← Zurück zu Jahren</button>
      </div>
      <div style="position:relative; padding-left:24px">
        <div style="position:absolute; left:8px; top:0; bottom:0; width:2px; background:var(--border)"></div>
        ${yearUpdates.map((upd, idx) => {
          const dateStr = upd.issueDate || upd.month || '';
          const [, month] = dateStr.split('-');
          const monthName = monthNames[parseInt(month) - 1] || month;
          return `
            <div style="position:relative; margin-bottom:12px">
              <div class="timeline-month" data-update-id="${upd.id}" 
                   style="padding:14px; border-left:3px solid var(--primary); cursor:pointer; transition:all 0.2s; border-radius:6px; background:var(--bg); position:relative; z-index:2"
                   onmouseover="this.style.background='rgba(37, 99, 235, 0.1)'; this.style.borderLeftColor='var(--accent)'; this.style.transform='translateX(4px)'"
                   onmouseout="this.style.background='var(--bg)'; this.style.borderLeftColor='var(--primary)'; this.style.transform='translateX(0)'">
                <div style="font-weight:600; font-size:15px; margin-bottom:4px">📅 ${monthName}</div>
                <div style="font-size:12px; color:var(--text-secondary); line-height:1.4">${upd.title || 'Monatsupdate'}</div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
    
    // Event Listeners für Monate
    $("#timelineList").querySelectorAll(".timeline-month").forEach(item => {
      item.addEventListener("click", () => {
        const updateId = item.dataset.updateId;
        const upd = yearUpdates.find(u => u.id === updateId);
        if(!upd) return;
        
        // Highlight selected
        $("#timelineList").querySelectorAll(".timeline-month").forEach(i => {
          i.style.background = "var(--bg)";
          i.style.borderLeftColor = "var(--primary)";
        });
        item.style.background = "rgba(37, 99, 235, 0.15)";
        item.style.borderLeftColor = "var(--accent)";
        item.style.fontWeight = "700";
        
        // Render detail view (inline, not navigate away)
        selectedUpdate = upd;
        renderUpdateDetail(upd, yearUpdates, year);
      });
    });
  };
  
  const renderEmptyDetail = () => {
    $("#updateDetail").innerHTML = `
      <div class="card pane" style="text-align:center; padding:80px 40px">
        <div style="font-size:64px; margin-bottom:24px">📅</div>
        <div style="font-weight:600; font-size:24px; margin-bottom:12px">Wählen Sie ein Monatsupdate</div>
        <div style="color:var(--text-secondary); font-size:16px">Klicken Sie links im Zeitenstrahl auf ein Jahr, dann auf einen Monat</div>
      </div>
    `;
  };
  
  // Make renderYears globally available
  window.renderMonatsupdatesYears = renderYears;
  
  // Start mit Jahren
  renderYears();
}

function renderUpdateDetail(upd, allYearUpdates = [], currentYear = '') {
  // Use new format if available, fallback to old format
  const dateStr = upd.issueDate || upd.month || '';
  const [year, month] = dateStr.split('-');
  const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  const monthName = monthNames[parseInt(month) - 1] || month;
  
  // Find current index and prev/next
  const currentIndex = allYearUpdates.findIndex(u => u.id === upd.id);
  const prevUpdate = currentIndex > 0 ? allYearUpdates[currentIndex - 1] : null;
  const nextUpdate = currentIndex < allYearUpdates.length - 1 ? allYearUpdates[currentIndex + 1] : null;
  
  // Compact layout: Header, Text, Image, Small Highlight Cards
  let html = `
    <!-- Header -->
    <div style="margin-bottom:32px">
      <div style="font-size:12px; text-transform:uppercase; letter-spacing:2px; color:var(--text-secondary); margin-bottom:8px">MONATSUPDATE INNOVATIONSABEND</div>
      <h1 style="font-weight:900; font-size:42px; line-height:1.2; margin-bottom:16px">${upd.title || 'Monatsupdate'}</h1>
      ${upd.subtitle ? `<div style="font-size:20px; color:var(--text-secondary); margin-bottom:24px">${upd.subtitle}</div>` : ''}
    </div>
    
    <!-- Stats Bar -->
    <div style="display:flex; gap:24px; padding:20px; background:var(--bg); border-radius:8px; margin-bottom:40px; flex-wrap:wrap">
      <div style="display:flex; align-items:center; gap:8px">
        <span style="font-size:20px">📅</span>
        <div>
          <div style="font-weight:700; font-size:16px">${monthName.toUpperCase()} ${year}</div>
        </div>
      </div>
      <div style="display:flex; align-items:center; gap:8px">
        <span style="font-size:20px">👥</span>
        <div>
          <div style="font-weight:700; font-size:16px">${upd.stats?.attendeesCount || upd.participants?.length || 0} TEILNEHMER</div>
        </div>
      </div>
      <div style="display:flex; align-items:center; gap:8px">
        <span style="font-size:20px">⭐</span>
        <div>
          <div style="font-weight:700; font-size:16px">${upd.stats?.highlightsCount || upd.highlights?.length || 0} HIGHLIGHTS</div>
        </div>
      </div>
      ${upd.durationMin ? `
        <div style="display:flex; align-items:center; gap:8px">
          <span style="font-size:20px">⏱️</span>
          <div>
            <div style="font-weight:700; font-size:16px">${upd.durationMin} MINUTEN</div>
          </div>
        </div>
      ` : ''}
    </div>
    
    <!-- Editorial Text -->
    ${upd.editorialText ? `
      <div style="max-width:900px; margin:0 auto 48px; line-height:1.9; font-size:18px; color:var(--text-primary)">
        <h2 style="font-weight:700; font-size:28px; margin-bottom:20px">Ein Abend voller Impulse</h2>
        ${upd.editorialText.split('\n').map(p => `<p style="margin-bottom:20px">${p}</p>`).join('')}
      </div>
    ` : upd.intro ? `
      <div style="max-width:900px; margin:0 auto 48px; line-height:1.9; font-size:18px; color:var(--text-primary)">
        <h2 style="font-weight:700; font-size:28px; margin-bottom:20px">Ein Abend voller Impulse</h2>
        <p>${upd.intro}</p>
      </div>
    ` : ''}
    
    <!-- Hero Image -->
    ${upd.heroImage?.url ? `
      <div style="margin-bottom:48px; border-radius:12px; overflow:hidden; position:relative; width:100%; max-height:500px; background:var(--bg);">
        <img src="${upd.heroImage.url}" 
             alt="${upd.heroImage.alt || ''}" 
             style="width:100%; max-width:100%; height:auto; max-height:500px; object-fit:cover; object-position:${(upd.heroImage.focalPoint?.x || 0.5) * 100}% ${(upd.heroImage.focalPoint?.y || 0.5) * 100}%; display:block;"
             onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'padding:80px; text-align:center; color:var(--text-secondary)\\'><span style=\\'font-size:48px\\'>🖼️</span><br/>Bild konnte nicht geladen werden</div>';"/>
        ${upd.heroImage.caption ? `
          <div style="padding:12px 24px; background:var(--bg); font-size:14px; color:var(--text-secondary); font-style:italic; text-align:center">
            ${upd.heroImage.caption}
          </div>
        ` : ''}
      </div>
    ` : ''}
    
    <!-- Highlights Section - Compact Cards -->
    ${(upd.highlights || []).length > 0 ? `
      <div style="margin-bottom:64px">
        <h2 style="font-weight:900; font-size:32px; margin-bottom:32px">Die Highlights dieses Abends</h2>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:24px">
          ${upd.highlights.map((hl, idx) => {
            const highlight = typeof hl === 'string' ? { title: hl, shortSummary: '', keyPoints: [], media: {}, id: `hl_${idx}` } : hl;
            const highlightId = highlight.id || `hl_${upd.id}_${idx}`;
            return `
              <div class="highlight-card" 
                   onclick="openHighlightModal('${upd.id}', ${idx})"
                   style="cursor:pointer; padding:0; background:var(--bg); border-radius:12px; overflow:hidden; transition:all 0.3s; border:2px solid var(--border); box-shadow:0 2px 8px rgba(0,0,0,0.05)"
                   onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 8px 24px rgba(0,0,0,0.15)'; this.style.borderColor='var(--primary)'"
                   onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.05)'; this.style.borderColor='var(--border)'">
                ${highlight.media?.image?.url ? `
                  <div style="width:100%; height:200px; overflow:hidden; background:var(--bg); position:relative;">
                    <img src="${highlight.media.image.url}" 
                         alt="${highlight.media.image.alt || highlight.title}" 
                         style="width:100%; max-width:100%; height:100%; object-fit:cover; object-position:${(highlight.media.image.focalPoint?.x || 0.5) * 100}% ${(highlight.media.image.focalPoint?.y || 0.5) * 100}%; display:block;"
                         onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'width:100%; height:100%; background:linear-gradient(135deg, var(--primary), var(--accent)); display:flex; align-items:center; justify-content:center\\'><span style=\\'font-size:48px; opacity:0.3\\'>🖼️</span></div>';"/>
                  </div>
                ` : `
                  <div style="width:100%; height:200px; background:linear-gradient(135deg, var(--primary), var(--accent)); display:flex; align-items:center; justify-content:center">
                    <span style="font-size:48px; opacity:0.3">⭐</span>
                  </div>
                `}
                <div style="padding:20px">
                  <div style="font-weight:700; font-size:20px; margin-bottom:12px; color:var(--primary)">${highlight.title || 'Unbenanntes Highlight'}</div>
                  ${highlight.shortSummary ? `
                    <div style="font-size:14px; line-height:1.6; color:var(--text-secondary); margin-bottom:16px; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden">
                      ${highlight.shortSummary}
                    </div>
                  ` : ''}
                  ${(highlight.keyPoints || []).length > 0 ? `
                    <ul style="list-style:none; padding:0; margin:0 0 16px 0">
                      ${highlight.keyPoints.slice(0, 3).map(kp => `
                        <li style="padding:6px 0; font-size:13px; color:var(--text-secondary); display:flex; align-items:start; gap:8px">
                          <span style="color:var(--primary); font-weight:700">•</span>
                          <span style="flex:1">${kp.length > 50 ? kp.substring(0, 50) + '...' : kp}</span>
                        </li>
                      `).join('')}
                      ${highlight.keyPoints.length > 3 ? `<li style="font-size:12px; color:var(--text-secondary); font-style:italic">+ ${highlight.keyPoints.length - 3} weitere</li>` : ''}
                    </ul>
                  ` : ''}
                  ${(highlight.categoryTags || []).length > 0 ? `
                    <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:12px">
                      ${highlight.categoryTags.slice(0, 2).map(tag => `
                        <span style="padding:4px 10px; background:var(--bg-secondary); border-radius:12px; font-size:11px; font-weight:600; text-transform:uppercase; color:var(--text-primary)">${tag}</span>
                      `).join('')}
                      ${highlight.categoryTags.length > 2 ? `<span style="font-size:11px; color:var(--text-secondary)">+${highlight.categoryTags.length - 2}</span>` : ''}
                    </div>
                  ` : ''}
                  <div style="margin-top:16px; padding-top:16px; border-top:1px solid var(--border)">
                    <div style="font-size:12px; color:var(--primary); font-weight:600; text-align:center">Mehr erfahren →</div>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    ` : ''}
    
    <!-- Navigation between updates -->
    ${(prevUpdate || nextUpdate) ? `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:32px 0; border-top:2px solid var(--border); margin-top:64px">
        ${prevUpdate ? `
          <button class="btn" onclick="navigateToUpdate('${prevUpdate.id}')" style="display:flex; align-items:center; gap:8px">
            ← Vorheriger Monat
          </button>
        ` : '<div></div>'}
        <a href="monatsupdates.html" style="text-decoration:none; color:var(--text-secondary); font-weight:600">ARCHIV</a>
        ${nextUpdate ? `
          <button class="btn" onclick="navigateToUpdate('${nextUpdate.id}')" style="display:flex; align-items:center; gap:8px">
            Nächster Monat →
          </button>
        ` : '<div></div>'}
      </div>
    ` : ''}
  `;
  
  $("#updateDetail").innerHTML = html;
}

// Highlight Modal
window.openHighlightModal = function(updateId, highlightIndex) {
  const allUpdates = JSON.parse(localStorage.getItem("cms:updates") || "[]");
  const updates = api.listUpdatesMember();
  const allUpdatesCombined = [...allUpdates, ...updates.filter(u => !allUpdates.find(pu => pu.id === u.id))];
  
  const update = allUpdatesCombined.find(u => u.id === updateId);
  if (!update || !update.highlights || !update.highlights[highlightIndex]) return;
  
  const highlight = typeof update.highlights[highlightIndex] === 'string' 
    ? { title: update.highlights[highlightIndex], shortSummary: '', keyPoints: [], media: {} }
    : update.highlights[highlightIndex];
  
  const allMembers = api.listMembers();
  const involvedMembers = (highlight.involvedParticipants || []).map(pid => 
    allMembers.find(m => m.id === pid)
  ).filter(Boolean);
  
  // Create modal
  const modal = document.createElement('div');
  modal.className = 'modalOverlay';
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal" style="max-width:1000px; max-height:90vh; overflow-y:auto">
      <div class="modalHeader" style="position:sticky; top:0; background:var(--bg); z-index:10; border-bottom:2px solid var(--border)">
        <div class="modalTitle" style="font-weight:900; font-size:28px">${highlight.title || 'Highlight'}</div>
        <button class="btn" onclick="this.closest('.modalOverlay').remove()" style="font-size:24px; padding:8px 16px">✕</button>
      </div>
      <div class="modalBody" style="padding:32px">
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:32px; margin-bottom:32px">
          <!-- Left: Image -->
          <div>
            ${highlight.media?.image?.url ? `
              <div style="border-radius:12px; overflow:hidden; box-shadow:0 8px 24px rgba(0,0,0,0.1); position:relative; width:100%; height:400px; background:var(--bg);">
                <img src="${highlight.media.image.url}" 
                     alt="${highlight.media.image.alt || highlight.title}" 
                     style="width:100%; max-width:100%; height:400px; object-fit:cover; object-position:${(highlight.media.image.focalPoint?.x || 0.5) * 100}% ${(highlight.media.image.focalPoint?.y || 0.5) * 100}%; display:block;"
                     onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'width:100%; height:100%; background:linear-gradient(135deg, var(--primary), var(--accent)); border-radius:12px; display:flex; align-items:center; justify-content:center\\'><span style=\\'font-size:80px; opacity:0.3\\'>🖼️</span></div>';"/>
              </div>
            ` : `
              <div style="width:100%; height:400px; background:linear-gradient(135deg, var(--primary), var(--accent)); border-radius:12px; display:flex; align-items:center; justify-content:center">
                <span style="font-size:80px; opacity:0.3">⭐</span>
              </div>
            `}
          </div>
          
          <!-- Right: Content -->
          <div>
            ${highlight.shortSummary ? `
              <div style="font-size:17px; line-height:1.8; color:var(--text-primary); margin-bottom:24px">
                ${highlight.shortSummary}
              </div>
            ` : highlight.memberText ? `
              <div class="highlight-content" style="line-height:1.8; font-size:15px; color:var(--text-primary); margin-bottom:24px">
                ${highlight.memberText}
              </div>
            ` : ''}
            
            ${(highlight.keyPoints || []).length > 0 ? `
              <div style="margin-bottom:24px">
                <div style="font-weight:700; font-size:16px; margin-bottom:12px; color:var(--primary)">Key Points</div>
                <ul style="list-style:none; padding:0">
                  ${highlight.keyPoints.map(kp => `
                    <li style="padding:12px 0; border-bottom:1px solid var(--border); display:flex; align-items:start; gap:12px">
                      <span style="color:var(--primary); font-weight:700; font-size:20px; line-height:1">•</span>
                      <span style="flex:1; line-height:1.6">${kp}</span>
                    </li>
                  `).join('')}
                </ul>
              </div>
            ` : ''}
            
            ${(highlight.categoryTags || []).length > 0 ? `
              <div style="margin-bottom:24px">
                <div style="font-weight:700; font-size:16px; margin-bottom:12px; color:var(--primary)">Kategorien</div>
                <div style="display:flex; gap:8px; flex-wrap:wrap">
                  ${highlight.categoryTags.map(tag => `
                    <span style="padding:6px 14px; background:var(--bg); border-radius:20px; font-size:13px; font-weight:500">${tag}</span>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        </div>
        
        <!-- Deep Dive Content -->
        ${highlight.deepDive?.enabled && highlight.deepDive?.contentRichText ? `
          <div style="margin-top:32px; padding-top:32px; border-top:2px solid var(--border)">
            <div style="font-weight:700; font-size:20px; margin-bottom:16px; color:var(--primary)">Ein tiefer Blick</div>
            <div class="highlight-content" style="line-height:1.8; font-size:15px; color:var(--text-primary)">
              ${highlight.deepDive.contentRichText}
            </div>
          </div>
        ` : ''}
        
        <!-- Involved Participants -->
        ${involvedMembers.length > 0 ? `
          <div style="margin-top:32px; padding-top:32px; border-top:2px solid var(--border)">
            <div style="font-weight:700; font-size:20px; margin-bottom:16px; color:var(--primary)">Wer war dabei</div>
            <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap:16px">
              ${involvedMembers.map(member => `
                <div style="display:flex; align-items:center; gap:12px; padding:12px; background:var(--bg); border-radius:8px">
                  ${avatarGenerator.getAvatar(member, 40)}
                  <div>
                    <div style="font-weight:600; font-size:14px">${member.name || member.email}</div>
                    ${member.roleTitle ? `<div style="font-size:12px; color:var(--text-secondary)">${member.roleTitle}</div>` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        <!-- Downloads Section -->
        ${highlight.deepDive?.attachments && highlight.deepDive.attachments.length > 0 ? `
          <div style="margin-top:32px; padding-top:32px; border-top:2px solid var(--border)">
            <div style="font-weight:700; font-size:20px; margin-bottom:16px; color:var(--primary)">Downloads</div>
            <div style="display:flex; flex-direction:column; gap:12px">
              ${highlight.deepDive.attachments.map((att, attIdx) => `
                <div style="display:flex; align-items:center; gap:12px; padding:16px; background:var(--bg); border-radius:8px; border:1px solid var(--border)">
                  <span style="font-size:24px">📎</span>
                  <div style="flex:1">
                    <div style="font-weight:600; font-size:16px; margin-bottom:4px">${att.name || 'Datei'}</div>
                    ${att.size ? `<div style="font-size:12px; color:var(--text-secondary)">${formatFileSize(att.size)}</div>` : ''}
                  </div>
                  <button class="btn primary" onclick="downloadHighlightAttachment('${updateId}', ${highlightIndex}, ${attIdx})">📥 Herunterladen</button>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        <!-- Action Buttons -->
        <div style="margin-top:32px; padding-top:32px; border-top:2px solid var(--border); display:flex; gap:12px; flex-wrap:wrap">
          ${(highlight.categoryTags || []).includes('PROJECT') || (highlight.categoryTags || []).includes('Projekt') ? `
            <button class="btn">Zum Projektbeispiel</button>
          ` : ''}
          <button class="btn" onclick="this.closest('.modalOverlay').remove()">Fenster schließen</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
};

// Download attachment function
window.downloadHighlightAttachment = function(updateId, highlightIndex, attachmentIndex) {
  const allUpdates = JSON.parse(localStorage.getItem("cms:updates") || "[]");
  const updates = api.listUpdatesMember();
  const allUpdatesCombined = [...allUpdates, ...updates.filter(u => !allUpdates.find(pu => pu.id === u.id))];
  
  const update = allUpdatesCombined.find(u => u.id === updateId);
  if (!update || !update.highlights || !update.highlights[highlightIndex]) return;
  
  const highlight = typeof update.highlights[highlightIndex] === 'string' 
    ? { title: update.highlights[highlightIndex], deepDive: { attachments: [] } }
    : update.highlights[highlightIndex];
  
  const attachment = highlight.deepDive?.attachments?.[attachmentIndex];
  if (!attachment || !attachment.data) {
    toast.error("Datei nicht gefunden");
    return;
  }
  
  // Convert base64 to blob and download
  const byteCharacters = atob(attachment.data.split(',')[1] || attachment.data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: attachment.type || 'application/octet-stream' });
  
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = attachment.name || 'download';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
  
  toast.success("Download gestartet");
};

function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Navigation function
window.navigateToUpdate = function(updateId) {
  const allUpdates = JSON.parse(localStorage.getItem("cms:updates") || "[]");
  const updates = api.listUpdatesMember();
  const allUpdatesCombined = [...allUpdates, ...updates.filter(u => !allUpdates.find(pu => pu.id === u.id))];
  
  const update = allUpdatesCombined.find(u => u.id === updateId);
  if (!update) return;
  
  const dateStr = update.issueDate || update.month || '';
  const [year] = dateStr.split('-');
  
  if (year) {
    // Find all updates for this year
    const yearUpdates = allUpdatesCombined.filter(u => {
      const uDate = u.issueDate || u.month || '';
      return uDate.startsWith(year);
    }).sort((a, b) => {
      const dateA = a.issueDate || a.month || '';
      const dateB = b.issueDate || b.month || '';
      return dateB.localeCompare(dateA);
    });
    
    // Render months view and select the update
    renderMonatsupdatesMonths(year, yearUpdates, updateId);
  }
};

window.renderMonatsupdatesMonths = function(year, yearUpdates, selectUpdateId) {
  const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  
  $("#timelineList").innerHTML = `
    <div style="margin-bottom:16px">
      <button class="btn small" onclick="renderMonatsupdatesYears()" style="width:100%; margin-bottom:12px">← Zurück zu Jahren</button>
    </div>
    <div style="position:relative; padding-left:24px">
      <div style="position:absolute; left:8px; top:0; bottom:0; width:2px; background:var(--border)"></div>
      ${yearUpdates.map((upd) => {
        const dateStr = upd.issueDate || upd.month || '';
        const [, month] = dateStr.split('-');
        const monthName = monthNames[parseInt(month) - 1] || month;
        const isSelected = upd.id === selectUpdateId;
        return `
          <div style="position:relative; margin-bottom:12px">
            <div class="timeline-month" data-update-id="${upd.id}" 
                 style="padding:14px; border-left:3px solid ${isSelected ? 'var(--accent)' : 'var(--primary)'}; cursor:pointer; transition:all 0.2s; border-radius:6px; background:${isSelected ? 'rgba(37, 99, 235, 0.15)' : 'var(--bg)'}; position:relative; z-index:2; font-weight:${isSelected ? '700' : '600'}"
                 onmouseover="if('${upd.id}' !== '${selectUpdateId}') { this.style.background='rgba(37, 99, 235, 0.1)'; this.style.borderLeftColor='var(--accent)'; this.style.transform='translateX(4px)'; }"
                 onmouseout="if('${upd.id}' !== '${selectUpdateId}') { this.style.background='var(--bg)'; this.style.borderLeftColor='var(--primary)'; this.style.transform='translateX(0)'; }">
              <div style="font-weight:600; font-size:15px; margin-bottom:4px">📅 ${monthName}</div>
              <div style="font-size:12px; color:var(--text-secondary); line-height:1.4">${upd.title || 'Monatsupdate'}</div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
  
  // Event Listeners
  $("#timelineList").querySelectorAll(".timeline-month").forEach(item => {
    item.addEventListener("click", () => {
      const updateId = item.dataset.updateId;
      const upd = yearUpdates.find(u => u.id === updateId);
      if (!upd) return;
      
      // Highlight selected
      $("#timelineList").querySelectorAll(".timeline-month").forEach(i => {
        i.style.background = "var(--bg)";
        i.style.borderLeftColor = "var(--primary)";
        i.style.fontWeight = "600";
      });
      item.style.background = "rgba(37, 99, 235, 0.15)";
      item.style.borderLeftColor = "var(--accent)";
      item.style.fontWeight = "700";
      
      // Render detail
      renderUpdateDetail(upd, yearUpdates, year);
    });
  });
  
  // Auto-select if specified
  if (selectUpdateId) {
    const selectedItem = $("#timelineList").querySelector(`[data-update-id="${selectUpdateId}"]`);
    if (selectedItem) {
      selectedItem.click();
    }
  }
};

window.downloadUpdateContent = function(updateId) {
  const updates = api.listUpdatesMember();
  const upd = updates.find(u => u.id === updateId);
  if(!upd) return;
  
  const highlights = upd.highlights || [];
  const downloadUrls = highlights
    .map(h => typeof h === 'string' ? null : h.downloadUrl)
    .filter(url => url);
  
  if(downloadUrls.length === 0) {
    toast.info("Keine Downloads verfügbar.");
    return;
  }
  
  // Download all files
  downloadUrls.forEach((url, idx) => {
    setTimeout(() => {
      const link = document.createElement('a');
      link.href = url;
      link.download = `update-${upd.month}-${idx + 1}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, idx * 200);
  });
};

/* ========== ADMIN ========== */
function renderAdmin(){
  if(!api.isAdmin()){ window.location.href="dashboard.html"; return; }

  // Get tab from URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const urlTab = urlParams.get('tab');
  
  // Set initial tab based on URL or default to users
  let tab = urlTab || "users";
  
  // Update page title based on tab
  const titleMap = {
    'users': 'Benutzerverwaltung',
    'events': 'Terminverwaltung',
    'content': 'Inhaltsverwaltung'
  };
  
  const pageTitle = document.getElementById('adminPageTitle');
  const tabsContainer = document.getElementById('adminTabs');
  
  if (urlTab) {
    // If URL has a tab parameter, show only that tab (hide tab navigation)
    if (pageTitle) pageTitle.textContent = titleMap[urlTab] || 'Verwaltung';
    if (tabsContainer) tabsContainer.style.display = 'none';
  } else {
    // If no URL parameter, show all tabs (normal admin page)
    if (pageTitle) pageTitle.textContent = 'Verwaltung';
    if (tabsContainer) tabsContainer.style.display = 'block';
  }
  
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

  function updateFormHTML(upd){
    // Normalize highlights structure
    let highlights = upd.highlights || [];
    if(highlights.length === 0) highlights = [{ title: '', memberText: '', downloadUrl: '' }];
    highlights = highlights.map(h => typeof h === 'string' ? { title: h, memberText: '', downloadUrl: '' } : h);
    
    return `
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:24px; max-height:80vh; overflow:hidden">
        <!-- Editor links -->
        <div style="overflow-y:auto; padding-right:12px">
          <label class="label">Monat (YYYY-MM)</label>
          <input class="input" id="uMonth" value="${upd.month||""}" placeholder="2026-02"/>
          <label class="label" style="margin-top:10px">Titel</label>
          <input class="input" id="uTitle" value="${upd.title||""}" placeholder="Monatsupdate Februar 2026"/>
          <label class="label" style="margin-top:10px">Teaser/Intro</label>
          <textarea class="textarea" id="uIntro" style="min-height:80px;">${upd.intro||""}</textarea>
          <div class="hr" style="margin:20px 0"></div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <label class="label" style="margin:0">Highlights</label>
            <div>
              <button class="btn small" id="uHighlightPrev" style="margin-right:4px">←</button>
              <span id="uHighlightCounter" style="font-weight:600">1 / ${highlights.length}</span>
              <button class="btn small" id="uHighlightNext" style="margin-left:4px">→</button>
              <button class="btn small primary" id="uHighlightAdd" style="margin-left:8px">+ Highlight</button>
            </div>
          </div>
          <div id="uHighlightContainer">
            <label class="label">Highlight-Titel</label>
            <input class="input" id="uHighlightTitle" placeholder="Highlight Titel" style="font-weight:700; font-size:16px"/>
            <label class="label" style="margin-top:10px">Member-Text (Rich Text)</label>
            <textarea class="textarea" id="uHighlightMemberText" data-rich-text placeholder="Schreibe den Member-Text für dieses Highlight..." style="min-height:250px;"></textarea>
            <label class="label" style="margin-top:10px">Download-URL (optional)</label>
            <input class="input" id="uHighlightDownload" placeholder="https://... oder Datei hochladen"/>
            <input type="file" id="uHighlightFile" style="display:none" accept="*/*"/>
            <button class="btn small" id="uHighlightFileBtn" style="margin-top:4px">📎 Datei hochladen</button>
          </div>
          <div class="err" id="uErr"></div>
          <div style="margin-top:12px">
            <button class="btn primary" id="uSave">Speichern</button>
            <button class="btn danger small" id="uHighlightDelete" style="margin-left:8px">Highlight löschen</button>
          </div>
        </div>
        
        <!-- Vorschau rechts -->
        <div style="overflow-y:auto; padding-left:12px; border-left:2px solid var(--border)">
          <div style="font-weight:900; margin-bottom:16px; font-size:18px">📄 Vorschau</div>
          <div id="uPreview" style="background:var(--bg); padding:20px; border-radius:8px; min-height:400px">
            <div class="p" style="color:var(--text-secondary)">Vorschau wird hier angezeigt...</div>
          </div>
        </div>
      </div>
    `;
  }

  function wireUpdateForm(id){
    let currentHighlights = [];
    let currentHighlightIndex = 0;
    
    // Load highlights from existing update or initialize
    if(id) {
      const ups = api.listUpdatesMember();
      const upd = ups.find(u => u.id === id);
      if(upd && upd.highlights) {
        currentHighlights = upd.highlights.map(h => typeof h === 'string' ? { title: h, memberText: '', downloadUrl: '' } : h);
      }
    }
    if(currentHighlights.length === 0) {
      currentHighlights = [{ title: '', memberText: '', downloadUrl: '' }];
    }
    
    // Initialize editor only once - don't recreate on highlight switch
    let highlightEditor = null;
    const initEditorOnce = () => {
      const textarea = $("#uHighlightMemberText");
      if(!textarea) {
        setTimeout(initEditorOnce, 100);
        return;
      }
      
      // Check if editor already exists
      if(richTextEditor.editors.has("uHighlightMemberText")) {
        highlightEditor = richTextEditor.editors.get("uHighlightMemberText");
        if(highlightEditor && highlightEditor.quill) {
          highlightEditor.quill.off('text-change');
          highlightEditor.quill.on('text-change', updatePreview);
        }
        return;
      }
      
      // Wait for Quill to be available
      const tryInit = (attempts = 0) => {
        if(attempts > 20) {
          console.warn("Rich Text Editor could not be initialized");
          return;
        }
        
        if(window.Quill && textarea) {
          try {
            richTextEditor.createEditor(textarea);
            highlightEditor = richTextEditor.editors.get("uHighlightMemberText");
            if(highlightEditor && highlightEditor.quill) {
              highlightEditor.quill.on('text-change', updatePreview);
            }
          } catch(e) {
            console.warn("Could not create Rich Text Editor:", e);
            setTimeout(() => tryInit(attempts + 1), 200);
          }
        } else {
          if(!window.Quill && richTextEditor) {
            richTextEditor.init();
          }
          setTimeout(() => tryInit(attempts + 1), 200);
        }
      };
      
      setTimeout(() => tryInit(), 300);
    };
    
    const updatePreview = () => {
      const month = $("#uMonth")?.value || '';
      const title = $("#uTitle")?.value || '';
      const intro = $("#uIntro")?.value || '';
      const highlightTitle = $("#uHighlightTitle")?.value || '';
      let memberText = '';
      
      // Get content from editor
      if(highlightEditor && highlightEditor.quill) {
        memberText = highlightEditor.quill.root.innerHTML;
      } else {
        const textarea = $("#uHighlightMemberText");
        if(textarea) {
          memberText = textarea.value || '';
        }
      }
      
      // Build preview HTML
      const [year, monthNum] = month.split('-');
      const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
      const monthName = monthNames[parseInt(monthNum) - 1] || monthNum;
      
      let previewHTML = '';
      if(month) {
        previewHTML += `<div style="font-size:12px; color:var(--text-secondary); margin-bottom:8px; text-transform:uppercase">${monthName} ${year}</div>`;
      }
      if(title) {
        previewHTML += `<div style="font-weight:900; font-size:24px; margin-bottom:12px">${title}</div>`;
      }
      if(intro) {
        previewHTML += `<div style="font-size:15px; line-height:1.6; color:var(--text-secondary); margin-bottom:24px; padding:16px; background:var(--bg); border-radius:6px">${intro}</div>`;
      }
      if(highlightTitle || memberText) {
        previewHTML += `<div style="margin-bottom:24px; padding:16px; background:var(--bg); border-radius:6px; border-left:4px solid var(--primary)">`;
        if(highlightTitle) {
          previewHTML += `<div style="font-weight:700; font-size:18px; margin-bottom:12px; color:var(--primary)">${highlightTitle}</div>`;
        }
        if(memberText) {
          previewHTML += `<div style="line-height:1.8; font-size:15px">${memberText}</div>`;
        }
        previewHTML += `</div>`;
      }
      
      if(!previewHTML) {
        previewHTML = '<div class="p" style="color:var(--text-secondary)">Vorschau wird hier angezeigt...</div>';
      }
      
      $("#uPreview").innerHTML = previewHTML;
    };
    
    const renderHighlight = (index) => {
      const hl = currentHighlights[index] || { title: '', memberText: '', downloadUrl: '' };
      $("#uHighlightTitle").value = hl.title || '';
      $("#uHighlightDownload").value = hl.downloadUrl || '';
      $("#uHighlightCounter").textContent = `${index + 1} / ${currentHighlights.length}`;
      
      // Update editor content (don't recreate editor!)
      setTimeout(() => {
        if(highlightEditor && highlightEditor.quill) {
          highlightEditor.quill.root.innerHTML = hl.memberText || '';
          highlightEditor.textarea.value = hl.memberText || '';
        } else {
          // Fallback: set textarea value directly
          const textarea = $("#uHighlightMemberText");
          if(textarea) {
            textarea.value = hl.memberText || '';
          }
          // Try to initialize editor if not exists
          if(!highlightEditor) {
            initEditorOnce();
          }
        }
        updatePreview();
      }, 100);
    };
    
    // Initialize editor once
    initEditorOnce();
    
    // Set up preview update listeners
    $("#uMonth")?.addEventListener("input", updatePreview);
    $("#uTitle")?.addEventListener("input", updatePreview);
    $("#uIntro")?.addEventListener("input", updatePreview);
    $("#uHighlightTitle")?.addEventListener("input", updatePreview);
    
    // Initial render
    setTimeout(() => {
      renderHighlight(0);
      updatePreview();
    }, 500);
    
    
    const saveCurrentHighlight = () => {
      if(currentHighlightIndex >= 0 && currentHighlightIndex < currentHighlights.length) {
        const title = $("#uHighlightTitle").value.trim();
        let memberText = '';
        // Try to get content from Rich Text Editor
        if(highlightEditor && highlightEditor.quill) {
          memberText = highlightEditor.quill.root.innerHTML;
        } else {
          // Try to get editor again
          highlightEditor = richTextEditor.editors.get("uHighlightMemberText");
          if(highlightEditor && highlightEditor.quill) {
            memberText = highlightEditor.quill.root.innerHTML;
          } else {
            // Fallback to textarea value
            const textarea = $("#uHighlightMemberText");
            if(textarea) {
              memberText = textarea.value || '';
            }
          }
        }
        const downloadUrl = $("#uHighlightDownload").value.trim();
        currentHighlights[currentHighlightIndex] = { title, memberText, downloadUrl };
      }
    };
    
    // Navigation
    $("#uHighlightPrev")?.addEventListener("click", () => {
      saveCurrentHighlight();
      if(currentHighlightIndex > 0) {
        currentHighlightIndex--;
        renderHighlight(currentHighlightIndex);
      }
    });
    
    $("#uHighlightNext")?.addEventListener("click", () => {
      saveCurrentHighlight();
      if(currentHighlightIndex < currentHighlights.length - 1) {
        currentHighlightIndex++;
        renderHighlight(currentHighlightIndex);
      }
    });
    
    // Add highlight
    $("#uHighlightAdd")?.addEventListener("click", () => {
      saveCurrentHighlight();
      currentHighlights.push({ title: '', memberText: '', downloadUrl: '' });
      currentHighlightIndex = currentHighlights.length - 1;
      renderHighlight(currentHighlightIndex);
    });
    
    // Delete highlight
    $("#uHighlightDelete")?.addEventListener("click", () => {
      if(currentHighlights.length > 1) {
        saveCurrentHighlight();
        currentHighlights.splice(currentHighlightIndex, 1);
        if(currentHighlightIndex >= currentHighlights.length) {
          currentHighlightIndex = currentHighlights.length - 1;
        }
        renderHighlight(currentHighlightIndex);
        updatePreview();
      } else {
        toast.error("Mindestens ein Highlight ist erforderlich.");
      }
    });
    
    // File upload
    $("#uHighlightFileBtn")?.addEventListener("click", () => {
      $("#uHighlightFile").click();
    });
    $("#uHighlightFile")?.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if(!file) return;
      if(file.size > 50 * 1024 * 1024) {
        toast.error("Datei ist zu groß. Maximal 50MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        $("#uHighlightDownload").value = event.target.result;
        toast.success("Datei hochgeladen.");
      };
      reader.readAsDataURL(file);
    });
    
    // Initialize editor once
    initEditorOnce();
    
    // Set up preview update listeners
    $("#uMonth")?.addEventListener("input", updatePreview);
    $("#uTitle")?.addEventListener("input", updatePreview);
    $("#uIntro")?.addEventListener("input", updatePreview);
    $("#uHighlightTitle")?.addEventListener("input", updatePreview);
    
    // Initial render - wait for modal to be fully visible
    setTimeout(() => {
      renderHighlight(0);
      updatePreview();
    }, 500);
    
    // Save
    $("#uSave").addEventListener("click", ()=>{
      saveCurrentHighlight();
      $("#uErr").textContent="";
      const month = $("#uMonth").value.trim();
      const title = $("#uTitle").value.trim();
      if(!month || !title){ $("#uErr").textContent="Monat und Titel erforderlich."; return; }
      
      // Filter empty highlights
      const validHighlights = currentHighlights.filter(h => h.title.trim() || h.memberText.trim());
      if(validHighlights.length === 0) {
        $("#uErr").textContent="Mindestens ein Highlight mit Titel oder Text ist erforderlich.";
        return;
      }
      
      const payload = {
        month,
        title,
        intro: $("#uIntro").value.trim(),
        highlights: validHighlights,
        memberBody: "" // Deprecated, using highlights with memberText instead
      };
      
      if(id) {
        const ups = api.listUpdatesMember();
        const allUpdates = JSON.parse(localStorage.getItem("cms:updates") || "[]");
        const updated = allUpdates.map(u => u.id === id ? {...u, ...payload} : u);
        localStorage.setItem("cms:updates", JSON.stringify(updated));
        toast.success("Update aktualisiert.");
        close();
        location.reload();
      } else {
        const res = api.adminCreateUpdate(payload);
        if(res.success) {
          toast.success("Update erstellt.");
          close();
          location.reload();
        } else {
          $("#uErr").textContent = res.error || "Fehler beim Erstellen.";
          return;
        }
      }
    });
  }

  function renderAdminPanels(){
    try {
      if(tab==="users"){
      const users = api.adminListUsers();
      $("#adminLeft").innerHTML = `
        <div style="display:flex;justify-content:space-between;gap:10px;align-items:center">
          <div style="font-weight:900">Mitglieder</div>
          <button class="btn primary" id="addUser">+ Neues Mitglied</button>
        </div>
        <div class="hr"></div>
        <table class="table" style="width:100%">
          <thead><tr><th style="padding:12px 16px">Name</th><th style="padding:12px 16px">Email</th><th style="padding:12px 16px">Role</th><th style="padding:12px 16px">Status</th><th style="padding:12px 16px">Aktion</th></tr></thead>
          <tbody>
            ${users.map(u=>{
              const isBlocked = u.status === "blocked" || u.status === "inactive";
              return `
              <tr style="${isBlocked ? 'opacity:0.5; color:var(--text-muted)' : ''}">
                <td style="padding:12px 16px">${u.name}</td>
                <td style="padding:12px 16px">${u.email}</td>
                <td style="padding:12px 16px">
                  <select class="input" style="width:100%; padding:6px 8px; font-size:14px" data-role-select="${u.id}">
                    <option value="member" ${u.role==="member"?"selected":""}>Member</option>
                    <option value="admin" ${u.role==="admin"?"selected":""}>Admin</option>
                    <option value="moderator" ${u.role==="moderator"?"selected":""}>Moderator</option>
                    <option value="editor" ${u.role==="editor"?"selected":""}>Editor</option>
                    <option value="author" ${u.role==="author"?"selected":""}>Author</option>
                  </select>
                </td>
                <td style="padding:12px 16px; ${isBlocked ? 'color:var(--text-muted)' : ''}">${isBlocked ? 'inaktiv' : u.status}</td>
                <td style="padding:12px 16px; white-space: nowrap;">
                  <button class="btn small ${isBlocked ? 'primary' : ''}" data-status="${u.id}" style="margin-right:8px">${isBlocked ? 'Entsperren' : 'Sperren'}</button>
                  <button class="btn danger small" data-delete="${u.id}">Entfernen</button>
                </td>
              </tr>
            `;
            }).join("")}
          </tbody>
        </table>
      `;
      $("#adminRight").innerHTML = ``;

      $("#adminLeft").querySelectorAll("[data-role-select]").forEach(select=>{
        select.addEventListener("change", async ()=>{
          const id = select.dataset.roleSelect;
          const newRole = select.value;
          const u = users.find(x=>x.id===id);
          
          // Use confirm modal
          const { confirmModal } = await import('./components/confirmModal.js');
          const confirmed = await confirmModal.show(
            `Möchten Sie die Rolle von ${u.name} zu "${newRole}" ändern?`,
            'Rolle ändern',
            'Ändern',
            'Abbrechen'
          );
          
          if(confirmed) {
            const res = api.adminSetUserRole(id, newRole);
            if(res.success) {
              // Show success modal
              const { showSuccessModal } = await import('./components/successModal.js');
              showSuccessModal(`Die Rolle von ${u.name} wurde erfolgreich zu "${newRole}" geändert.`, 'Rolle geändert');
              setTimeout(() => location.reload(), 1500);
            } else {
              toast.error(res.error || "Fehler beim Ändern der Rolle");
              select.value = u.role;
            }
          } else {
            // Reset to original value
            select.value = u.role;
          }
        });
      });
      $("#adminLeft").querySelectorAll("[data-status]").forEach(b=>{
        b.addEventListener("click", async ()=>{
          const id = b.dataset.status;
          const u = users.find(x=>x.id===id);
          const isBlocked = u.status === "blocked" || u.status === "inactive";
          if(isBlocked){
            // Entsperren
            const res = api.adminSetUserStatus(id, "active");
            if(res && res.success) {
              const { showSuccessModal } = await import('./components/successModal.js');
              showSuccessModal(`Der Benutzer "${u.name}" wurde erfolgreich entsperrt.`, 'Benutzer entsperrt');
              setTimeout(() => location.reload(), 1500);
            } else {
              toast.error(res?.error || "Fehler beim Entsperren.");
            }
          } else {
            // Sperren
            const { confirmModal } = await import('./components/confirmModal.js');
            const confirmed = await confirmModal.show(
              `User ${u.name} sperren?`,
              "User sperren",
              "Sperren",
              "Abbrechen"
            );
            
            if(confirmed){
              api.adminSetUserStatus(id, "inactive");
              // Systemnachricht senden
              const systemKey = `system:${u.email.toLowerCase()}`;
              const existing = JSON.parse(localStorage.getItem(systemKey) || "[]");
              existing.unshift({
                id: `sys_${Date.now()}`,
                type: "account_blocked",
                title: "Account gesperrt",
                body: `Ihr Account wurde von einem Administrator gesperrt. Bei Fragen kontaktieren Sie bitte den Support.`,
                createdAt: new Date().toISOString(),
                read: false
              });
              localStorage.setItem(systemKey, JSON.stringify(existing));
              
              const { showSuccessModal } = await import('./components/successModal.js');
              showSuccessModal(`Der Benutzer "${u.name}" wurde erfolgreich gesperrt.`, 'Benutzer gesperrt');
              setTimeout(() => location.reload(), 1500);
            }
          }
        });
      });
      $("#adminLeft").querySelectorAll("[data-delete]").forEach(b=>{
        b.addEventListener("click", async ()=>{
          const id = b.dataset.delete;
          const u = users.find(x=>x.id===id);
          if(!u) return;
          
          const { confirmModal } = await import('./components/confirmModal.js');
          const confirmed = await confirmModal.show(
            `Wollen Sie wirklich den User ${u.name} entfernen? Diese Aktion kann nicht rückgängig gemacht werden!`,
            "User entfernen",
            "Entfernen",
            "Abbrechen"
          );
          
          if(confirmed){
            const res = api.adminDeleteUser(id);
            if(res && res.success){
              const { showSuccessModal } = await import('./components/successModal.js');
              showSuccessModal(`Der Benutzer "${u.name}" wurde erfolgreich entfernt.`, 'Benutzer entfernt');
              setTimeout(() => location.reload(), 1500);
            } else {
              toast.error(res?.error || "Fehler beim Entfernen.");
            }
          }
        });
      });
      
      // Neues Mitglied hinzufügen
      const openUserModal = ()=>{
        $("#admUserOverlay").style.display = "flex";
        $("#newUserName").value = "";
        $("#newUserEmail").value = "";
        $("#newUserPassword").value = "";
        $("#newUserRole").value = "member";
        $("#newUserErr").textContent = "";
      };
      const closeUserModal = ()=>{
        $("#admUserOverlay").style.display = "none";
      };
      $("#addUser")?.addEventListener("click", openUserModal);
      $("#admUserClose")?.addEventListener("click", closeUserModal);
      $("#newUserCancel")?.addEventListener("click", closeUserModal);
      $("#admUserOverlay")?.addEventListener("click", (e)=>{
        if(e.target.id === "admUserOverlay") closeUserModal();
      });
      $("#newUserSave")?.addEventListener("click", ()=>{
        $("#newUserErr").textContent = "";
        const name = $("#newUserName").value.trim();
        const email = $("#newUserEmail").value.trim();
        const password = $("#newUserPassword").value.trim();
        const role = $("#newUserRole").value;
        if(!name || !email || !password){
          $("#newUserErr").textContent = "Alle Felder sind erforderlich.";
          return;
        }
        const res = api.register(email, password, name);
        if(res.success){
          // Set role if not member
          if(role !== "member"){
            const users = api.adminListUsers();
            const newUser = users.find(u => u.email === email);
            if(newUser){
              api.adminSetUserRole(newUser.id, role);
            }
          }
          toast.success("Mitglied hinzugefügt.");
          closeUserModal();
          location.reload();
        } else {
          $("#newUserErr").textContent = res.error;
        }
      });
    }

    if(tab==="events"){
      const evs = api.listEvents().filter(e => !e.deleted).slice().sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
      $("#adminLeft").innerHTML = `
        <div style="display:flex;justify-content:space-between;gap:10px;align-items:center">
          <div style="font-weight:900">Termine (CRUD)</div>
          <button class="btn primary" id="newEv">+ Neu</button>
        </div>
        <div class="hr"></div>
        <table class="table" style="width:100%">
          <thead><tr><th style="padding:12px 16px">Titel</th><th style="padding:12px 16px">Datum</th><th style="padding:12px 16px">Cap</th><th style="padding:12px 16px">Buchungen</th><th style="padding:12px 16px">Aktion</th></tr></thead>
          <tbody>
            ${evs.map(e=>`
              <tr>
                <td style="padding:12px 16px">${e.title}</td>
                <td style="padding:12px 16px">${e.date} ${e.time}</td>
                <td style="padding:12px 16px">${e.capacity}</td>
                <td style="padding:12px 16px">${api.bookingsCount(e.id)}</td>
                <td style="padding:12px 16px; white-space: nowrap;">
                  <button class="btn small" data-edit="${e.id}">Edit</button>
                  <button class="btn danger small" data-del="${e.id}">Entfernen</button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;
      $("#adminRight").innerHTML = ``;

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
        b.addEventListener("click", async ()=>{
          const eventId = b.dataset.del;
          const ev = api.getEvent(eventId);
          if(!ev) {
            console.error('Event nicht gefunden:', eventId);
            return;
          }
          
          try {
            const { confirmModal } = await import('./components/confirmModal.js');
            const confirmed = await confirmModal.show(
              `Wollen Sie wirklich den Termin "${ev.title}" entfernen?`,
              "Termin entfernen",
              "Entfernen",
              "Abbrechen"
            );
            
            if(confirmed){
              const res = api.adminDeleteEvent(eventId);
              console.log('Delete result:', res);
              
              if(res && res.success){
                const { showSuccessModal } = await import('./components/successModal.js');
                showSuccessModal('Der Termin wurde erfolgreich entfernt.', 'Termin entfernt');
                // Reload after a short delay to show the success message
                setTimeout(() => {
                  // Ensure we're still on the events tab
                  if(tab === "events") {
                    renderAdminPanels();
                  }
                }, 1500);
              } else {
                const { toast } = await import('./components/toast.js');
                toast.error(res?.error || "Fehler beim Entfernen.");
              }
            }
          } catch (error) {
            console.error('Fehler beim Löschen des Termins:', error);
            const { toast } = await import('./components/toast.js');
            toast.error('Fehler beim Löschen des Termins: ' + error.message);
          }
        });
      });
    }

    if(tab==="content"){
      // Get all updates (including drafts) from localStorage
      // Both storageAdapter and wizard use "cms:updates" key
      let ups = [];
      try {
        const raw = localStorage.getItem("cms:updates");
        if (raw) {
          ups = JSON.parse(raw);
        }
      } catch(e) {
        console.error("Fehler beim Laden der Updates:", e);
        ups = [];
      }
      
      // Sort by date (newest first)
      ups = ups.sort((a, b) => {
        const dateA = a.issueDate || a.month || a.createdAt || "";
        const dateB = b.issueDate || b.month || b.createdAt || "";
        return dateB.localeCompare(dateA);
      });
      
      const pubs = api.listPublicationsMember();
      $("#adminLeft").innerHTML = `
        <div style="font-weight:900">Monatsupdates</div>
        <div class="hr"></div>
        ${ups.length === 0 ? `
          <div style="padding:20px; text-align:center; color:var(--text-secondary)">
            Noch keine Monatsupdates vorhanden
          </div>
        ` : ups.map(u=>`
          <div class="listItem"><div><b>${u.title || 'Unbenannt'}</b><div class="small">${u.issueDate || u.month || 'Kein Datum'} ${u.status === 'draft' ? ' (Entwurf)' : ''}</div></div>
            <button class="btn danger" data-delupd="${u.id}">Entfernen</button>
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

      $("#adminLeft").querySelectorAll("[data-delupd]").forEach(b=>{
        b.addEventListener("click", async (e)=>{
          e.stopPropagation();
          const updateId = b.dataset.delupd;
          const upd = ups.find(u => u.id === updateId);
          if(!upd) {
            console.error('Update nicht gefunden:', updateId);
            const { toast } = await import('./components/toast.js');
            toast.error("Update nicht gefunden.");
            return;
          }
          
          try {
            const { confirmModal } = await import('./components/confirmModal.js');
            const confirmed = await confirmModal.show(
              `Wollen Sie wirklich das Monatsupdate "${upd.title || 'Unbenannt'}" entfernen? Diese Aktion kann nicht rückgängig gemacht werden.`,
              "Monatsupdate entfernen",
              "Entfernen",
              "Abbrechen"
            );
            
            if(confirmed){
              const res = api.adminDeleteUpdate(updateId);
              console.log('Delete update result:', res);
              
              if(res && res.success){
                const { showSuccessModal } = await import('./components/successModal.js');
                showSuccessModal('Das Monatsupdate wurde erfolgreich entfernt.', 'Monatsupdate entfernt');
                // Reload after a short delay to show the success message
                setTimeout(() => {
                  // Ensure we're still on the content tab
                  if(tab === "content") {
                    renderAdminPanels();
                  }
                }, 1500);
              } else {
                const { toast } = await import('./components/toast.js');
                toast.error(res?.error || "Fehler beim Entfernen. Bitte versuchen Sie es erneut.");
              }
            }
          } catch(err) {
            console.error("Fehler beim Löschen des Monatsupdates:", err);
            const { toast } = await import('./components/toast.js');
            toast.error("Fehler beim Löschen des Monatsupdates: " + err.message);
          }
        });
      });
      $("#adminRight").querySelectorAll("[data-delpub]").forEach(b=>b.addEventListener("click", async ()=>{
        const { confirmModal } = await import('./components/confirmModal.js');
        const confirmed = await confirmModal.show(
          "Publikation löschen?",
          "Publikation löschen",
          "Löschen",
          "Abbrechen"
        );
        
        if(confirmed){
          try {
            const res = api.adminDeletePublication(b.dataset.delpub);
            console.log('Delete publication result:', res);
            
            if(res && res.success){
              const { showSuccessModal } = await import('./components/successModal.js');
              showSuccessModal('Die Publikation wurde erfolgreich gelöscht.', 'Publikation gelöscht');
              // Reload after a short delay to show the success message
              setTimeout(() => {
                // Ensure we're still on the content tab
                if(tab === "content") {
                  renderAdminPanels();
                }
              }, 1500);
            } else {
              const { toast } = await import('./components/toast.js');
              toast.error(res?.error || "Fehler beim Löschen.");
            }
          } catch (error) {
            console.error("Fehler beim Löschen der Publikation:", error);
            const { toast } = await import('./components/toast.js');
            toast.error("Fehler beim Löschen der Publikation: " + error.message);
          }
        }
      }));

      $("#addUpd").addEventListener("click", ()=>{
        window.location.href = "admin-update-wizard.html";
        return;
      });
      
      // Old update creation (keep for backward compatibility)
      const oldAddUpd = document.getElementById("oldAddUpd");
      if(oldAddUpd) oldAddUpd.addEventListener("click", ()=>{
        $("#admEvTitle").textContent="Neues Monatsupdate";
        $("#admEvBody").innerHTML = updateFormHTML({});
        open();
        // Initialize Rich Text Editor after modal is opened
        setTimeout(() => {
          wireUpdateForm(null);
          // Force Rich Text Editor initialization
          if(window.Quill && richTextEditor) {
            const textarea = $("#uHighlightMemberText");
            if(textarea && !richTextEditor.editors.has("uHighlightMemberText")) {
              try {
                richTextEditor.createEditor(textarea);
              } catch(e) {
                console.warn("Could not initialize Rich Text Editor:", e);
              }
            }
          }
        }, 100);
      });
      $("#addPub").addEventListener("click", ()=>{
        const title = prompt("Titel:","Publikation"); if(!title) return;
        api.adminCreatePublication({ title, abstract:"Abstract", tags:["Tag"], memberBody:"Member-Body", downloadUrl:"" });
        location.reload();
      });
    }
    } catch (error) {
      console.error('Error in renderAdminPanels:', error);
      if ($("#adminLeft")) {
        $("#adminLeft").innerHTML = `<div class="card pane"><div class="p">Fehler beim Laden der Admin-Bereiche. Bitte laden Sie die Seite neu.</div><button class="btn primary" onclick="window.location.reload()">Seite neu laden</button></div>`;
      }
    }
  }

  // System-Einstellungen Tab wurde entfernt (nicht mehr benötigt)

  function evFormHTML(ev){
    return `
      <label class="label">Titel</label><input class="input" id="fTitle" value="${ev.title||""}"/>
      <div class="row" style="margin-top:10px">
        <div style="flex:1"><label class="label">Datum</label><input class="input" id="fDate" value="${ev.date ? ev.date.split('-').reverse().join('.') : ''}" placeholder="DD.MM.YYYY"/></div>
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
      <label class="label" style="margin-top:10px">Member Desc</label><textarea class="textarea" id="fMem" style="min-height:120px;">${ev.descriptionMember||""}</textarea>
      <label class="label" style="margin-top:10px">Weitere Erklärung</label><textarea class="textarea" id="fExplanation" style="min-height:100px;" placeholder="Zusätzliche Informationen zu diesem Termin...">${ev.explanation||""}</textarea>
      <div class="err" id="fErr"></div>
      <div style="margin-top:12px"><button class="btn primary" id="fSave">Speichern</button></div>
    `;
  }

  function wireEvForm(id){
    $("#fSave").addEventListener("click", ()=>{
      $("#fErr").textContent="";
      // Convert DD.MM.YYYY to YYYY-MM-DD
      let dateValue = $("#fDate").value.trim();
      if (dateValue.includes('.')) {
        const parts = dateValue.split('.');
        if (parts.length === 3) {
          dateValue = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }
      const payload = {
        title: $("#fTitle").value.trim(),
        date: dateValue,
        time: $("#fTime").value.trim(),
        durationMinutes: Number($("#fDur").value||90),
        capacity: Number($("#fCap").value||40),
        location: $("#fLoc").value.trim(),
        format: $("#fFmt").value.trim(),
        tags: parseTags($("#fTags").value),
        descriptionPublic: $("#fPub").value.trim(),
        descriptionMember: $("#fMem").value.trim(),
        explanation: $("#fExplanation").value.trim()
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
console.log('🟢 app.js: Script loaded, setting up DOMContentLoaded listener...');
console.log('🟢 app.js: document.readyState =', document.readyState);

// Check if DOM is already loaded
if (document.readyState === 'loading') {
  console.log('🟢 app.js: DOM still loading, adding event listener...');
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  console.log('🟢 app.js: DOM already loaded, calling initApp immediately...');
  initApp();
}

async function initApp() {
  console.log('🟢 initApp() STARTED');
  console.log('🟢 DOMContentLoaded fired');
  try {
    console.log('🟢 Calling guard()...');
    const guardResult = guard();
    console.log('🟢 Guard result:', guardResult);
    if(!guardResult) return;
    
    // Seed example update if on updates page and no updates exist
    if(document.body.dataset.page === "updates") {
      try {
        const seedModule = await import("./seedExampleUpdate.js");
        const updates = api.listUpdatesMember();
        const allUpdates = JSON.parse(localStorage.getItem("cms:updates") || "[]");
        if((updates.length === 0 && allUpdates.length === 0) || !allUpdates.find(u => (u.issueDate || u.month) === "2026-03")) {
          seedModule.seedExampleUpdate();
        }
      } catch(e) {
        console.warn("Could not seed example update:", e);
      }
    }
    
    await setShell();
    
    // Update sidebar on navigation (for SPA-like behavior)
    if (document.getElementById('sidebarContainer')) {
      // Intercept link clicks in sidebar
      document.addEventListener('click', async (e) => {
        const link = e.target.closest('.sidebar-item');
        if (link && link.href) {
          // Let the navigation happen, then update sidebar
          setTimeout(async () => {
            const user = api.me();
            if (user) {
              const userRole = user.role || 'member';
              const currentPath = window.location.pathname;
              const { renderSidebar } = await import('./components/sidebar.js');
              await renderSidebar(userRole, currentPath, false);
            }
          }, 50);
        }
      }, true);
    }
    
    // Alle Modals beim Start schließen
    const modals = ["evOverlay", "thrOverlay", "admEvOverlay", "bookedEventOverlay"];
    modals.forEach(modalId => {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.style.display = "none";
      }
    });
    
    // Initialize breadcrumbs
    try {
      breadcrumbs.init();
    } catch (error) {
      console.error('Error initializing breadcrumbs:', error);
    }
    
    // Initialize Rich Text Editor with error handling
    try {
      if (window.Quill) {
        richTextEditor.init();
      } else {
        // Wait for Quill to load
        const checkQuill = setInterval(() => {
          if (window.Quill) {
            clearInterval(checkQuill);
            try {
              richTextEditor.init();
            } catch (error) {
              console.error('Error initializing Quill editor:', error);
            }
          }
        }, 100);
        setTimeout(() => clearInterval(checkQuill), 5000); // Timeout after 5 seconds
      }
    } catch (error) {
      console.error('Error setting up Quill editor:', error);
    }
    
    // Onboarding deaktiviert - nicht mehr anzeigen
    // Setze onboardingCompleted automatisch auf true, damit es nie erscheint
    localStorage.setItem('onboardingCompleted', 'true');

    const page = document.body.dataset.page;
    console.log('🟢 Router: Current page =', page);
    try {
      switch(page){
        case "dashboard": 
          console.log('🟢 Router: Calling renderDashboard()...');
          await renderDashboard(); 
          console.log('✅ Router: renderDashboard() completed');
          break;
        case "termine": await renderEvents(); break;
        case "forum": 
          try {
            renderForum(); 
          } catch (error) {
            console.error('Error rendering forum:', error);
            const main = document.querySelector('main');
            if (main) {
              main.innerHTML = `<div class="card pane"><div class="p">Fehler beim Laden des Forums. Bitte laden Sie die Seite neu.</div><button class="btn primary" onclick="window.location.reload()">Seite neu laden</button></div>`;
            }
          }
          break;
        case "forum-category": 
          try {
            renderForumCategory(); 
          } catch (error) {
            console.error('Error rendering forum category:', error);
            const main = document.querySelector('main');
            if (main) {
              main.innerHTML = `<div class="card pane"><div class="p">Fehler beim Laden der Kategorie. Bitte laden Sie die Seite neu.</div><button class="btn primary" onclick="window.location.reload()">Seite neu laden</button></div>`;
            }
          }
          break;
        case "forum-thread": 
          try {
            renderForumThread(); 
          } catch (error) {
            console.error('Error rendering forum thread:', error);
            const main = document.querySelector('main');
            if (main) {
              main.innerHTML = `<div class="card pane"><div class="p">Fehler beim Laden des Threads. Bitte laden Sie die Seite neu.</div><button class="btn primary" onclick="window.location.reload()">Seite neu laden</button></div>`;
            }
          }
          break;
        case "messages": renderMessages(); break;
        case "compose": renderCompose(); break;
        case "members": renderMembers(); break;
        case "member": renderMember(); break;
        case "updates": renderMonatsupdates(); break;
        case "profile": renderMyProfile(); break;
        case "settings": /* nothing more */ break;
        case "admin": renderAdmin(); break;
        case "resources":
          const { renderResources } = await import('./pages/resources.js');
          renderResources();
          break;
        case "resources-admin":
          const { renderResourcesAdmin } = await import('./pages/resourcesAdmin.js');
          renderResourcesAdmin();
          break;
        case "knowledge":
          const { renderKnowledge } = await import('./pages/knowledge.js');
          renderKnowledge();
          break;
        case "knowledge-admin":
          const { renderKnowledgeAdmin } = await import('./pages/knowledgeAdmin.js');
          renderKnowledgeAdmin();
          break;
        case "public-pages":
          const { renderPublicPagesEditor } = await import('./pages/publicPagesEditor.js');
          renderPublicPagesEditor();
          break;
        default:
          console.warn('Unknown page:', page);
      }
    } catch (error) {
      console.error('Error rendering page:', page, error);
      // Show error message to user
      const main = document.querySelector('main') || document.body;
      if (main) {
        main.innerHTML = `<div class="card pane"><div class="p">Fehler beim Laden der Seite. Bitte versuchen Sie es erneut oder laden Sie die Seite neu.</div><button class="btn primary" onclick="window.location.reload()">Seite neu laden</button></div>`;
      }
    }
  } catch (error) {
    console.error('❌ Critical error in router:', error);
    console.error('Stack:', error.stack);
    // Fallback: redirect to dashboard
    if (window.location.pathname.includes('/app/')) {
      window.location.href = 'dashboard.html';
    }
  }
}

console.log('🟢 app.js: End of file reached');
