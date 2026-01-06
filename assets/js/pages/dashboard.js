/**
 * Dashboard Page
 * Renders the main dashboard with metrics, events, recommendations, favorites, and activities
 */

import { api } from '../services/apiClient.js';
import { handleError } from '../services/errorHandler.js';
import { renderErrorState } from '../components/emptyStates.js';
import { openBookedEventModal } from './events.js';

const $ = s => document.querySelector(s);

/**
 * Format date from YYYY-MM-DD to DD.MM.YYYY
 * @param {Object} ev - Event object with date property
 * @returns {string} Formatted date string
 */
function fmtDate(ev) {
  const dateParts = ev.date.split('-');
  const formattedDate =
    dateParts.length === 3 ? `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}` : ev.date;
  return `${formattedDate} ${ev.time}`;
}

/**
 * Calculate end time from start time and duration
 * @param {string} startTime - Start time in HH:MM format
 * @param {number} durationMinutes - Duration in minutes
 * @returns {string} End time in HH:MM format
 */
function calculateEndTime(startTime, durationMinutes) {
  const [hours, minutes] = startTime.split(':').map(Number);
  const start = new Date();
  start.setHours(hours, minutes, 0, 0);
  const end = new Date(start.getTime() + durationMinutes * 60000);
  return `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;
}

/**
 * Render dashboard with user metrics and activity
 * @returns {Promise<void>}
 */
export async function renderDashboard() {
  try {
    const u = api.me();
    if (!u) {
      handleError('User not found', { context: 'renderDashboard', category: 'permission' });
      return;
    }

    // Edge case: Ensure events is an array
    const eventsList = api.listEvents();
    const events = Array.isArray(eventsList)
      ? eventsList.slice().sort((a, b) => {
        // Edge case: Handle missing date/time
        const aDate = (a?.date || '') + (a?.time || '');
        const bDate = (b?.date || '') + (b?.time || '');
        return aDate.localeCompare(bDate);
      })
      : [];

    // Add ticket creation CTA (nur einmal)
    const ticketCta = document.querySelector('#ticketCtaContainer');
    if (ticketCta) {
      // Check if user has tickets
      const { ticketRepository } = await import('../services/repositories/ticketRepository.js');
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
          ${
  userTickets.length > 0
    ? `
            <a href="tickets.html" class="btn" style="text-decoration: none; padding: 8px 16px; font-size: 13px;">
              📋 Meine Ideen (${userTickets.length})
            </a>
          `
    : ''
}
        </div>
      `;
      ticketCta.querySelector('#createTicketBtn')?.addEventListener('click', async () => {
        const btn = ticketCta.querySelector('#createTicketBtn');
        const { setButtonLoading } = await import('../utils/buttonHelpers.js');
        setButtonLoading(btn, true, 'Wird geöffnet...');
        const { showTicketWizard } = await import('../components/ticketWizard.js');
        showTicketWizard();
      });
    }

    // Prüfe ob Dashboard-Elemente existieren
    const quickMetricsRow = $('#quickMetricsRow');
    const detailedMetricsCard = $('#detailedMetricsCard'); // Optional - nicht mehr im HTML
    const cardNext = $('#cardNext');
    const cardRecs = $('#cardRecs');
    const cardFavs = $('#cardFavs');
    const cardActivity = $('#cardActivity');

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
      // OPTIMIZED: Load threads once and reuse (eliminate duplicate API call)
      const threads = api.getForumThreads() || [];
      
      // Calculate user's forum posts
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

      // OPTIMIZED: Reuse threads instead of calling getForumThreads() again
      const allForumPosts = threads.flatMap(t => {
        try {
          return (api.getForumPosts(t.id) || []).filter(p => !p.deleted);
        } catch (e) {
          console.warn('Error getting posts for thread', t.id, e);
          return [];
        }
      });
      totalForumPosts = allForumPosts.length;
    } catch (e) {
      handleError(e, { context: 'renderDashboard', section: 'forumMetrics' });
    }

    try {
      const userThreads = api.getThreads(u.email) || [];
      const unreadMessages = userThreads.filter(t => (t.unreadCount || 0) > 0);
      unreadCount = unreadMessages.reduce((sum, t) => sum + (t.unreadCount || 0), 0);
      totalMessages = userThreads.length;
    } catch (e) {
      handleError(e, { context: 'renderDashboard', section: 'messageMetrics' });
    }

    try {
      const members = api.listMembers() || [];
      membersCount = members.length;
    } catch (e) {
      handleError(e, { context: 'renderDashboard', section: 'memberMetrics' });
    }

    try {
      const favs = api.getFavorites() || [];
      favoritesCount = favs.length;
    } catch (e) {
      handleError(e, { context: 'renderDashboard', section: 'favoritesMetrics' });
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
    const bookedEvents = events.filter(e =>
      api.getParticipants(e.id).some(p => p.email.toLowerCase() === u.email.toLowerCase())
    );
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
      const endTime = nextBooked.durationMinutes
        ? calculateEndTime(nextBooked.time, nextBooked.durationMinutes)
        : null;

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
      cardNext.querySelectorAll('[data-open-event]').forEach(btn => {
        btn.addEventListener('click', () => openBookedEventModal(nextBooked.id));
      });
    } else {
      // Mehrere Termine - Swipe-Funktion mit detaillierten Infos
      let currentIndex = 0;
      const renderSwipeCard = () => {
        const currentEvent = bookedEvents[currentIndex];
        const count = api.bookingsCount(currentEvent.id);
        const endTime = currentEvent.durationMinutes
          ? calculateEndTime(currentEvent.time, currentEvent.durationMinutes)
          : null;

        $('#cardNext').innerHTML = `
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
        cardNext.querySelector('.event-swipe-left')?.addEventListener('click', e => {
          e.stopPropagation();
          currentIndex = (currentIndex - 1 + bookedEvents.length) % bookedEvents.length;
          renderSwipeCard();
        });

        cardNext.querySelector('.event-swipe-right')?.addEventListener('click', e => {
          e.stopPropagation();
          currentIndex = (currentIndex + 1) % bookedEvents.length;
          renderSwipeCard();
        });

        cardNext.querySelectorAll('.event-swipe-dot').forEach((dot, i) => {
          dot.addEventListener('click', e => {
            e.stopPropagation();
            currentIndex = i;
            renderSwipeCard();
          });
        });

        cardNext.querySelectorAll('[data-open-event]').forEach(btn => {
          btn.addEventListener('click', () => openBookedEventModal(currentEvent.id));
        });
      };

      renderSwipeCard();
    }

    // Booked event modal wiring (if on dashboard page)
    if ($('#bookedEventClose')) {
      $('#bookedEventClose').addEventListener(
        'click',
        () => ($('#bookedEventOverlay').style.display = 'none')
      );
    }
    if ($('#bookedEventOverlay')) {
      $('#bookedEventOverlay').addEventListener('click', e => {
        if (e.target.id === 'bookedEventOverlay') {
          $('#bookedEventOverlay').style.display = 'none';
        }
      });
    }

    // recommendations - kompakt
    const recs = api.recommendContacts();
    if (cardRecs) {
      cardRecs.innerHTML = `
        <div class="kpiTitle">Empfohlene Kontakte</div>
        <div class="kpiBody">
          ${
  recs.length
    ? recs
      .slice(0, 3)
      .map(
        p =>
          `<div style="margin-bottom:8px; cursor:pointer; padding:8px; border-radius:var(--radius); transition:background 0.2s;" onclick="window.location.href='member.html?email=${encodeURIComponent(p.email)}'" onmouseover="this.style.background='var(--bg)'" onmouseout="this.style.background='transparent'"><b>${p.name}</b><br/><span class="small">${p.headline || '—'}</span></div>`
      )
      .join('')
    : 'Noch keine Empfehlungen - ergänze Schlagwörter in deinem Profil.'
}
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
          const isPersonType =
            f.targetType === 'profile' || f.targetType === 'member' || f.targetType === 'user';
          const looksLikeEmail = f.targetId && f.targetId.includes('@');
          return isPersonType || looksLikeEmail;
        });

        console.log('Favorite people:', favoritePeople);

        // Lade Profile für alle favorisierten Personen
        const favoriteProfiles = favoritePeople
          .map(f => {
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
              return profile
                ? {
                  ...f,
                  profile,
                  email: f.targetId.includes('@') ? f.targetId : profile?.email || ''
                }
                : null;
            } catch (e) {
              console.warn('Error loading profile for favorite:', f.targetId, e);
              return null;
            }
          })
          .filter(p => p !== null && p.profile);

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
                ${favIndex > 0 ? '<button class="event-swipe-btn event-swipe-left" aria-label="Vorheriger" style="left: 0;">←</button>' : ''}
                <div class="kpiBody" style="cursor: pointer; text-align: center; padding: ${favIndex > 0 || favIndex < favoriteProfiles.length - 1 ? '0 40px' : '0'};" onclick="window.location.href='member.html?email=${encodeURIComponent(email)}'">
                  <div style="font-size: 32px; margin-bottom: 8px;">👤</div>
                  <div style="font-weight: 600; font-size: 16px; margin-bottom: 4px;">${fav.profile.name || 'Unbekannt'}</div>
                  <div class="small" style="color: var(--text-secondary);">${fav.profile.headline || '—'}</div>
                </div>
                ${favIndex < favoriteProfiles.length - 1 ? '<button class="event-swipe-btn event-swipe-right" aria-label="Nächster" style="right: 0;">→</button>' : ''}
              </div>
              <div style="margin-top: 8px; display: flex; gap: 4px; justify-content: center;">
                ${favoriteProfiles.map((_, i) => `<div class="event-swipe-dot ${i === favIndex ? 'active' : ''}" data-index="${i}"></div>`).join('')}
              </div>
            `;

            // Event Listeners
            const leftBtn = cardFavs.querySelector('.event-swipe-left');
            const rightBtn = cardFavs.querySelector('.event-swipe-right');
            const dots = cardFavs.querySelectorAll('.event-swipe-dot');

            if (leftBtn) {
              leftBtn.addEventListener('click', e => {
                e.stopPropagation();
                favIndex = Math.max(0, favIndex - 1);
                renderFavorite();
              });
            }

            if (rightBtn) {
              rightBtn.addEventListener('click', e => {
                e.stopPropagation();
                favIndex = Math.min(favoriteProfiles.length - 1, favIndex + 1);
                renderFavorite();
              });
            }

            dots.forEach((dot, i) => {
              dot.addEventListener('click', e => {
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
          const unreadMessages = (api.getThreads(u.email) || []).filter(
            t => (t.unreadCount || 0) > 0
          );
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
          const userPosts = allThreads
            .flatMap(t => {
              try {
                const posts = api.getForumPosts(t.id) || [];
                const userPost = posts.find(p => p.authorEmail === u.email && !p.deleted);
                if (userPost) {
                  // Prüfe ob es neue Posts nach dem eigenen gibt
                  const newerPosts = posts.filter(
                    p => !p.deleted && p.authorEmail !== u.email && p.createdAt > userPost.createdAt
                  );
                  if (newerPosts.length > 0) {
                    const newestPost = newerPosts.sort((a, b) =>
                      b.createdAt.localeCompare(a.createdAt)
                    )[0];
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
            })
            .filter(t => t !== null);

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
          const favs = api.getFavorites() || [];
          const favoriteThreads = favs.filter(f => f.targetType === 'thread');
          const watchedThreads = allThreads.filter(
            t => t.watchedBy && t.watchedBy.includes(u.email)
          );

          [...favoriteThreads, ...watchedThreads.map(t => ({ targetId: t.id }))].forEach(fav => {
            try {
              const thread = api.getForumThread(fav.targetId);
              if (thread && thread.lastActivityAt) {
                // Prüfe ob es neue Posts gibt (vereinfacht: wenn lastActivityAt neuer als letzter Besuch)
                const posts = api.getForumPosts(fav.targetId) || [];
                const newPosts = posts.filter(
                  p =>
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
          ${
  visibleActivities.length === 0
    ? `
            <div class="p" style="color: var(--text-secondary);">Keine neuen Aktivitäten.</div>
          `
    : visibleActivities
      .map(a => {
        const date = a.createdAt
          ? new Date(a.createdAt).toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit'
          })
          : '';
        const clickAction = a.url
          ? `onclick="window.location.href='${a.url}'" style="cursor:pointer;"`
          : '';
        return `<div class="listItem" ${clickAction} style="margin-bottom: 8px;">
              <div>
                <b style="font-size: 14px;">${a.title}</b>
                <div class="small" style="margin-top: 4px;">${(a.message || '').substring(0, 80)}${(a.message || '').length > 80 ? '...' : ''}</div>
                ${date ? `<div class="small" style="margin-top: 4px; color: var(--text-secondary);">${date}</div>` : ''}
              </div>
            </div>`;
      })
      .join('')
}
          ${
  activities.length > 5
    ? `
            <div style="margin-top: 12px; text-align: center;">
              <span class="small" style="color: var(--text-secondary);">+ ${activities.length - 5} weitere</span>
            </div>
          `
    : ''
}
        `;
      } catch (e) {
        handleError(e, { context: 'renderDashboard', section: 'activities' });
        // Fallback: Zeige zumindest den Titel
        cardActivity.innerHTML = `
          <div style="font-weight:900; margin-bottom: 12px;">Aktivitäten</div>
          <div class="hr" style="margin-bottom: 12px;"></div>
          <div class="p" style="color: var(--text-secondary);">Fehler beim Laden der Aktivitäten.</div>
        `;
      }
    }
  } catch (error) {
    handleError(error, { context: 'renderDashboard' });
    const main = document.querySelector('main');
    if (main && $('#quickMetricsRow')) {
      $('#quickMetricsRow').innerHTML = renderErrorState({
        title: 'Fehler beim Laden des Dashboards',
        message: 'Das Dashboard konnte nicht geladen werden. Bitte versuchen Sie es erneut.',
        retryLabel: 'Erneut versuchen',
        retryCallback: () => window.location.reload()
      });
    }
  }
}
