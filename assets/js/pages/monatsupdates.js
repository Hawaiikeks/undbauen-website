/**
 * Monatsupdates Page
 *
 * Displays monthly updates in a timeline view with year/month navigation.
 * Shows update details, highlights, and attachments.
 *
 * @module pages/monatsupdates
 */

import { api } from '../services/apiClient.js';
import { avatarGenerator } from '../components/avatarGenerator.js';
import { toast } from '../components/toast.js';
import { formatFileSize } from '../utils.js';

/**
 * Query selector shorthand
 * @type {function(string): HTMLElement|null}
 */
const $ = s => document.querySelector(s);

// Store state for navigation
/** @type {Object<string, Array>} */
let updatesByYear = {};
/** @type {Array<string>} */
let years = [];
/** @type {string} */
let currentView = 'years';
/** @type {string|null} */
let selectedYear = null;
/** @type {Object|null} */
let selectedUpdate = null;

/**
 * Render empty detail view when no update is selected
 * @returns {void}
 */
function renderEmptyDetail() {
  $('#updateDetail').innerHTML = `
    <div class="card pane" style="text-align:center; padding:80px 40px">
      <div style="font-size:64px; margin-bottom:24px">📅</div>
      <div style="font-weight:600; font-size:24px; margin-bottom:12px">Wählen Sie ein Monatsupdate</div>
      <div style="color:var(--text-secondary); font-size:16px">Klicken Sie links im Zeitenstrahl auf ein Jahr, dann auf einen Monat</div>
    </div>
  `;
}

/**
 * Render years view showing all available years with update counts
 * @returns {void}
 */
function renderYears() {
  currentView = 'years';
  selectedYear = null;
  selectedUpdate = null;

  $('#timelineList').innerHTML = `
    <div style="position:relative; padding-left:24px">
      <div style="position:absolute; left:8px; top:0; bottom:0; width:2px; background:var(--border)"></div>
      ${years
    .map((year, idx) => {
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
    })
    .join('')}
    </div>
  `;

  if (years.length === 0) {
    $('#timelineList').innerHTML =
      '<div class="p" style="padding:20px">Noch keine Monatsupdates vorhanden.</div>';
  }

  // Event Listeners für Jahre
  $('#timelineList')
    .querySelectorAll('.timeline-year')
    .forEach(item => {
      item.addEventListener('click', () => {
        const year = item.dataset.year;
        if (year) {
          selectedYear = year;
          renderMonths(year);
        }
      });
    });

  // Clear detail view
  renderEmptyDetail();
}

/**
 * Renders the months view for a specific year.
 * @param {string} year - The year to render months for
 */
function renderMonths(year) {
  currentView = 'months';
  const yearUpdates = updatesByYear[year] || [];
  const monthNames = [
    'Januar',
    'Februar',
    'März',
    'April',
    'Mai',
    'Juni',
    'Juli',
    'August',
    'September',
    'Oktober',
    'November',
    'Dezember'
  ];

  $('#timelineList').innerHTML = `
    <div style="margin-bottom:16px">
      <button class="btn small" onclick="window.renderMonatsupdatesYears()" style="width:100%; margin-bottom:12px">← Zurück zu Jahren</button>
    </div>
    <div style="position:relative; padding-left:24px">
      <div style="position:absolute; left:8px; top:0; bottom:0; width:2px; background:var(--border)"></div>
      ${yearUpdates
    .map((upd, idx) => {
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
    })
    .join('')}
    </div>
  `;

  // Event Listeners für Monate
  $('#timelineList')
    .querySelectorAll('.timeline-month')
    .forEach(item => {
      item.addEventListener('click', () => {
        const updateId = item.dataset.updateId;
        const upd = yearUpdates.find(u => u.id === updateId);
        if (!upd) {
          return;
        }

        // Highlight selected
        $('#timelineList')
          .querySelectorAll('.timeline-month')
          .forEach(i => {
            i.style.background = 'var(--bg)';
            i.style.borderLeftColor = 'var(--primary)';
          });
        item.style.background = 'rgba(37, 99, 235, 0.15)';
        item.style.borderLeftColor = 'var(--accent)';
        item.style.fontWeight = '700';

        // Render detail view (inline, not navigate away)
        selectedUpdate = upd;
        renderUpdateDetail(upd, yearUpdates, year);
      });
    });
}

/**
 * Renders the detail view for a specific update.
 * @param {Object} upd - The update object
 * @param {Array} allYearUpdates - All updates for the current year
 * @param {string} currentYear - The current year
 */
export function renderUpdateDetail(upd, allYearUpdates = [], currentYear = '') {
  // Use new format if available, fallback to old format
  const dateStr = upd.issueDate || upd.month || '';
  const [year, month] = dateStr.split('-');
  const monthNames = [
    'Januar',
    'Februar',
    'März',
    'April',
    'Mai',
    'Juni',
    'Juli',
    'August',
    'September',
    'Oktober',
    'November',
    'Dezember'
  ];
  const monthName = monthNames[parseInt(month) - 1] || month;

  // Find current index and prev/next
  const currentIndex = allYearUpdates.findIndex(u => u.id === upd.id);
  const prevUpdate = currentIndex > 0 ? allYearUpdates[currentIndex - 1] : null;
  const nextUpdate =
    currentIndex < allYearUpdates.length - 1 ? allYearUpdates[currentIndex + 1] : null;

  // Compact layout: Header, Text, Image, Small Highlight Cards
  const html = `
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
      ${
  upd.durationMin
    ? `
        <div style="display:flex; align-items:center; gap:8px">
          <span style="font-size:20px">⏱️</span>
          <div>
            <div style="font-weight:700; font-size:16px">${upd.durationMin} MINUTEN</div>
          </div>
        </div>
      `
    : ''
}
    </div>
    
    <!-- Editorial Text -->
    ${
  upd.editorialText
    ? `
      <div style="max-width:900px; margin:0 auto 48px; line-height:1.9; font-size:18px; color:var(--text-primary)">
        <h2 style="font-weight:700; font-size:28px; margin-bottom:20px">Ein Abend voller Impulse</h2>
        ${upd.editorialText
    .split('\n')
    .map(p => `<p style="margin-bottom:20px">${p}</p>`)
    .join('')}
      </div>
    `
    : upd.intro
      ? `
      <div style="max-width:900px; margin:0 auto 48px; line-height:1.9; font-size:18px; color:var(--text-primary)">
        <h2 style="font-weight:700; font-size:28px; margin-bottom:20px">Ein Abend voller Impulse</h2>
        <p>${upd.intro}</p>
      </div>
    `
      : ''
}
    
    <!-- Hero Image -->
    ${
  upd.heroImage?.url
    ? `
      <div style="margin-bottom:48px; border-radius:12px; overflow:hidden; position:relative; width:100%; max-height:500px; background:var(--bg);">
        <img src="${upd.heroImage.url}" 
             alt="${upd.heroImage.alt || ''}" 
             style="width:100%; max-width:100%; height:auto; max-height:500px; object-fit:cover; object-position:${(upd.heroImage.focalPoint?.x || 0.5) * 100}% ${(upd.heroImage.focalPoint?.y || 0.5) * 100}%; display:block;"
             onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'padding:80px; text-align:center; color:var(--text-secondary)\\'><span style=\\'font-size:48px\\'>🖼️</span><br/>Bild konnte nicht geladen werden</div>';"/>
        ${
  upd.heroImage.caption
    ? `
          <div style="padding:12px 24px; background:var(--bg); font-size:14px; color:var(--text-secondary); font-style:italic; text-align:center">
            ${upd.heroImage.caption}
          </div>
        `
    : ''
}
      </div>
    `
    : ''
}
    
    <!-- Highlights Section - Compact Cards -->
    ${
  (upd.highlights || []).length > 0
    ? `
      <div style="margin-bottom:64px">
        <h2 style="font-weight:900; font-size:32px; margin-bottom:32px">Die Highlights dieses Abends</h2>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:24px">
          ${upd.highlights
    .map((hl, idx) => {
      const highlight =
                typeof hl === 'string'
                  ? { title: hl, shortSummary: '', keyPoints: [], media: {}, id: `hl_${idx}` }
                  : hl;
      const highlightId = highlight.id || `hl_${upd.id}_${idx}`;
      return `
              <div class="highlight-card" 
                   onclick="window.openHighlightModal('${upd.id}', ${idx})"
                   style="cursor:pointer; padding:0; background:var(--bg); border-radius:12px; overflow:hidden; transition:all 0.3s; border:2px solid var(--border); box-shadow:0 2px 8px rgba(0,0,0,0.05)"
                   onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 8px 24px rgba(0,0,0,0.15)'; this.style.borderColor='var(--primary)'"
                   onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.05)'; this.style.borderColor='var(--border)'">
                ${
  highlight.media?.image?.url
    ? `
                  <div style="width:100%; height:200px; overflow:hidden; background:var(--bg); position:relative;">
                    <img src="${highlight.media.image.url}" 
                         alt="${highlight.media.image.alt || highlight.title}" 
                         style="width:100%; max-width:100%; height:100%; object-fit:cover; object-position:${(highlight.media.image.focalPoint?.x || 0.5) * 100}% ${(highlight.media.image.focalPoint?.y || 0.5) * 100}%; display:block;"
                         onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'width:100%; height:100%; background:linear-gradient(135deg, var(--primary), var(--accent)); display:flex; align-items:center; justify-content:center\\'><span style=\\'font-size:48px; opacity:0.3\\'>🖼️</span></div>';"/>
                  </div>
                `
    : `
                  <div style="width:100%; height:200px; background:linear-gradient(135deg, var(--primary), var(--accent)); display:flex; align-items:center; justify-content:center">
                    <span style="font-size:48px; opacity:0.3">⭐</span>
                  </div>
                `
}
                <div style="padding:20px">
                  <div style="font-weight:700; font-size:20px; margin-bottom:12px; color:var(--primary)">${highlight.title || 'Unbenanntes Highlight'}</div>
                  ${
  highlight.shortSummary
    ? `
                    <div style="font-size:14px; line-height:1.6; color:var(--text-secondary); margin-bottom:16px; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden">
                      ${highlight.shortSummary}
                    </div>
                  `
    : ''
}
                  ${
  (highlight.keyPoints || []).length > 0
    ? `
                    <ul style="list-style:none; padding:0; margin:0 0 16px 0">
                      ${highlight.keyPoints
    .slice(0, 3)
    .map(
      kp => `
                        <li style="padding:6px 0; font-size:13px; color:var(--text-secondary); display:flex; align-items:start; gap:8px">
                          <span style="color:var(--primary); font-weight:700">•</span>
                          <span style="flex:1">${kp.length > 50 ? kp.substring(0, 50) + '...' : kp}</span>
                        </li>
                      `
    )
    .join('')}
                      ${highlight.keyPoints.length > 3 ? `<li style="font-size:12px; color:var(--text-secondary); font-style:italic">+ ${highlight.keyPoints.length - 3} weitere</li>` : ''}
                    </ul>
                  `
    : ''
}
                  ${
  (highlight.categoryTags || []).length > 0
    ? `
                    <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:12px">
                      ${highlight.categoryTags
    .slice(0, 2)
    .map(
      tag => `
                        <span style="padding:4px 10px; background:var(--bg-secondary); border-radius:12px; font-size:11px; font-weight:600; text-transform:uppercase; color:var(--text-primary)">${tag}</span>
                      `
    )
    .join('')}
                      ${highlight.categoryTags.length > 2 ? `<span style="font-size:11px; color:var(--text-secondary)">+${highlight.categoryTags.length - 2}</span>` : ''}
                    </div>
                  `
    : ''
}
                  <div style="margin-top:16px; padding-top:16px; border-top:1px solid var(--border)">
                    <div style="font-size:12px; color:var(--primary); font-weight:600; text-align:center">Mehr erfahren →</div>
                  </div>
                </div>
              </div>
            `;
    })
    .join('')}
        </div>
      </div>
    `
    : ''
}
    
    <!-- Navigation between updates -->
    ${
  prevUpdate || nextUpdate
    ? `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:32px 0; border-top:2px solid var(--border); margin-top:64px">
        ${
  prevUpdate
    ? `
          <button class="btn" onclick="window.navigateToUpdate('${prevUpdate.id}')" style="display:flex; align-items:center; gap:8px">
            ← Vorheriger Monat
          </button>
        `
    : '<div></div>'
}
        <a href="monatsupdates.html" style="text-decoration:none; color:var(--text-secondary); font-weight:600">ARCHIV</a>
        ${
  nextUpdate
    ? `
          <button class="btn" onclick="window.navigateToUpdate('${nextUpdate.id}')" style="display:flex; align-items:center; gap:8px">
            Nächster Monat →
          </button>
        `
    : '<div></div>'
}
      </div>
    `
    : ''
}
  `;

  $('#updateDetail').innerHTML = html;
}

/**
 * Opens a highlight modal.
 * @param {string} updateId - The update ID
 * @param {number} highlightIndex - The highlight index
 */
window.openHighlightModal = function (updateId, highlightIndex) {
  const allUpdates = api.getAllUpdatesRaw();
  const updates = api.listUpdatesMember();
  const allUpdatesCombined = [
    ...allUpdates,
    ...updates.filter(u => !allUpdates.find(pu => pu.id === u.id))
  ];

  const update = allUpdatesCombined.find(u => u.id === updateId);
  if (!update || !update.highlights || !update.highlights[highlightIndex]) {
    return;
  }

  const highlight =
    typeof update.highlights[highlightIndex] === 'string'
      ? { title: update.highlights[highlightIndex], shortSummary: '', keyPoints: [], media: {} }
      : update.highlights[highlightIndex];

  const allMembers = api.listMembers();
  const involvedMembers = (highlight.involvedParticipants || [])
    .map(pid => allMembers.find(m => m.id === pid))
    .filter(Boolean);

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
            ${
  highlight.media?.image?.url
    ? `
              <div style="border-radius:12px; overflow:hidden; box-shadow:0 8px 24px rgba(0,0,0,0.1); position:relative; width:100%; height:400px; background:var(--bg);">
                <img src="${highlight.media.image.url}" 
                     alt="${highlight.media.image.alt || highlight.title}" 
                     style="width:100%; max-width:100%; height:400px; object-fit:cover; object-position:${(highlight.media.image.focalPoint?.x || 0.5) * 100}% ${(highlight.media.image.focalPoint?.y || 0.5) * 100}%; display:block;"
                     onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'width:100%; height:100%; background:linear-gradient(135deg, var(--primary), var(--accent)); border-radius:12px; display:flex; align-items:center; justify-content:center\\'><span style=\\'font-size:80px; opacity:0.3\\'>🖼️</span></div>';"/>
              </div>
            `
    : `
              <div style="width:100%; height:400px; background:linear-gradient(135deg, var(--primary), var(--accent)); border-radius:12px; display:flex; align-items:center; justify-content:center">
                <span style="font-size:80px; opacity:0.3">⭐</span>
              </div>
            `
}
          </div>
          
          <!-- Right: Content -->
          <div>
            ${
  highlight.shortSummary
    ? `
              <div style="font-size:17px; line-height:1.8; color:var(--text-primary); margin-bottom:24px">
                ${highlight.shortSummary}
              </div>
            `
    : highlight.memberText
      ? `
              <div class="highlight-content" style="line-height:1.8; font-size:15px; color:var(--text-primary); margin-bottom:24px">
                ${highlight.memberText}
              </div>
            `
      : ''
}
            
            ${
  (highlight.keyPoints || []).length > 0
    ? `
              <div style="margin-bottom:24px">
                <div style="font-weight:700; font-size:16px; margin-bottom:12px; color:var(--primary)">Key Points</div>
                <ul style="list-style:none; padding:0">
                  ${highlight.keyPoints
    .map(
      kp => `
                    <li style="padding:12px 0; border-bottom:1px solid var(--border); display:flex; align-items:start; gap:12px">
                      <span style="color:var(--primary); font-weight:700; font-size:20px; line-height:1">•</span>
                      <span style="flex:1; line-height:1.6">${kp}</span>
                    </li>
                  `
    )
    .join('')}
                </ul>
              </div>
            `
    : ''
}
            
            ${
  (highlight.categoryTags || []).length > 0
    ? `
              <div style="margin-bottom:24px">
                <div style="font-weight:700; font-size:16px; margin-bottom:12px; color:var(--primary)">Kategorien</div>
                <div style="display:flex; gap:8px; flex-wrap:wrap">
                  ${highlight.categoryTags
    .map(
      tag => `
                    <span style="padding:6px 14px; background:var(--bg); border-radius:20px; font-size:13px; font-weight:500">${tag}</span>
                  `
    )
    .join('')}
                </div>
              </div>
            `
    : ''
}
          </div>
        </div>
        
        <!-- Deep Dive Content -->
        ${
  highlight.deepDive?.enabled && highlight.deepDive?.contentRichText
    ? `
          <div style="margin-top:32px; padding-top:32px; border-top:2px solid var(--border)">
            <div style="font-weight:700; font-size:20px; margin-bottom:16px; color:var(--primary)">Ein tiefer Blick</div>
            <div class="highlight-content" style="line-height:1.8; font-size:15px; color:var(--text-primary)">
              ${highlight.deepDive.contentRichText}
            </div>
          </div>
        `
    : ''
}
        
        <!-- Involved Participants -->
        ${
  involvedMembers.length > 0
    ? `
          <div style="margin-top:32px; padding-top:32px; border-top:2px solid var(--border)">
            <div style="font-weight:700; font-size:20px; margin-bottom:16px; color:var(--primary)">Wer war dabei</div>
            <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap:16px">
              ${involvedMembers
    .map(
      member => `
                <div style="display:flex; align-items:center; gap:12px; padding:12px; background:var(--bg); border-radius:8px">
                  ${avatarGenerator.getAvatar(member, 40)}
                  <div>
                    <div style="font-weight:600; font-size:14px">${member.name || member.email}</div>
                    ${member.roleTitle ? `<div style="font-size:12px; color:var(--text-secondary)">${member.roleTitle}</div>` : ''}
                  </div>
                </div>
              `
    )
    .join('')}
            </div>
          </div>
        `
    : ''
}
        
        <!-- Downloads Section -->
        ${
  highlight.deepDive?.attachments && highlight.deepDive.attachments.length > 0
    ? `
          <div style="margin-top:32px; padding-top:32px; border-top:2px solid var(--border)">
            <div style="font-weight:700; font-size:20px; margin-bottom:16px; color:var(--primary)">Downloads</div>
            <div style="display:flex; flex-direction:column; gap:12px">
              ${highlight.deepDive.attachments
    .map(
      (att, attIdx) => `
                <div style="display:flex; align-items:center; gap:12px; padding:16px; background:var(--bg); border-radius:8px; border:1px solid var(--border)">
                  <span style="font-size:24px">📎</span>
                  <div style="flex:1">
                    <div style="font-weight:600; font-size:16px; margin-bottom:4px">${att.name || 'Datei'}</div>
                    ${att.size ? `<div style="font-size:12px; color:var(--text-secondary)">${formatFileSize(att.size)}</div>` : ''}
                  </div>
                  <button class="btn primary" onclick="window.downloadHighlightAttachment('${updateId}', ${highlightIndex}, ${attIdx})">📥 Herunterladen</button>
                </div>
              `
    )
    .join('')}
            </div>
          </div>
        `
    : ''
}
        
        <!-- Action Buttons -->
        <div style="margin-top:32px; padding-top:32px; border-top:2px solid var(--border); display:flex; gap:12px; flex-wrap:wrap">
          ${
  (highlight.categoryTags || []).includes('PROJECT') ||
            (highlight.categoryTags || []).includes('Projekt')
    ? `
            <button class="btn">Zum Projektbeispiel</button>
          `
    : ''
}
          <button class="btn" onclick="this.closest('.modalOverlay').remove()">Fenster schließen</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  modal.addEventListener('click', e => {
    if (e.target === modal) {
      modal.remove();
    }
  });
};

/**
 * Downloads a highlight attachment.
 * @param {string} updateId - The update ID
 * @param {number} highlightIndex - The highlight index
 * @param {number} attachmentIndex - The attachment index
 */
window.downloadHighlightAttachment = function (updateId, highlightIndex, attachmentIndex) {
  const allUpdates = api.getAllUpdatesRaw();
  const updates = api.listUpdatesMember();
  const allUpdatesCombined = [
    ...allUpdates,
    ...updates.filter(u => !allUpdates.find(pu => pu.id === u.id))
  ];

  const update = allUpdatesCombined.find(u => u.id === updateId);
  if (!update || !update.highlights || !update.highlights[highlightIndex]) {
    return;
  }

  const highlight =
    typeof update.highlights[highlightIndex] === 'string'
      ? { title: update.highlights[highlightIndex], deepDive: { attachments: [] } }
      : update.highlights[highlightIndex];

  const attachment = highlight.deepDive?.attachments?.[attachmentIndex];
  if (!attachment || !attachment.data) {
    toast.error('Datei nicht gefunden');
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

  toast.success('Download gestartet');
};

/**
 * Navigates to a specific update.
 * @param {string} updateId - The update ID
 */
window.navigateToUpdate = function (updateId) {
  const allUpdates = api.getAllUpdatesRaw();
  const updates = api.listUpdatesMember();
  const allUpdatesCombined = [
    ...allUpdates,
    ...updates.filter(u => !allUpdates.find(pu => pu.id === u.id))
  ];

  const update = allUpdatesCombined.find(u => u.id === updateId);
  if (!update) {
    return;
  }

  const dateStr = update.issueDate || update.month || '';
  const [year] = dateStr.split('-');

  if (year) {
    // Find all updates for this year
    const yearUpdates = allUpdatesCombined
      .filter(u => {
        const uDate = u.issueDate || u.month || '';
        return uDate.startsWith(year);
      })
      .sort((a, b) => {
        const dateA = a.issueDate || a.month || '';
        const dateB = b.issueDate || b.month || '';
        return dateB.localeCompare(dateA);
      });

    // Render months view and select the update
    window.renderMonatsupdatesMonths(year, yearUpdates, updateId);
  }
};

/**
 * Renders the months view for a specific year (global function for navigation).
 * @param {string} year - The year
 * @param {Array} yearUpdates - All updates for the year
 * @param {string} selectUpdateId - Optional update ID to select
 */
window.renderMonatsupdatesMonths = function (year, yearUpdates, selectUpdateId) {
  const monthNames = [
    'Januar',
    'Februar',
    'März',
    'April',
    'Mai',
    'Juni',
    'Juli',
    'August',
    'September',
    'Oktober',
    'November',
    'Dezember'
  ];

  $('#timelineList').innerHTML = `
    <div style="margin-bottom:16px">
      <button class="btn small" onclick="window.renderMonatsupdatesYears()" style="width:100%; margin-bottom:12px">← Zurück zu Jahren</button>
    </div>
    <div style="position:relative; padding-left:24px">
      <div style="position:absolute; left:8px; top:0; bottom:0; width:2px; background:var(--border)"></div>
      ${yearUpdates
    .map(upd => {
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
    })
    .join('')}
    </div>
  `;

  // Event Listeners
  $('#timelineList')
    .querySelectorAll('.timeline-month')
    .forEach(item => {
      item.addEventListener('click', () => {
        const updateId = item.dataset.updateId;
        const upd = yearUpdates.find(u => u.id === updateId);
        if (!upd) {
          return;
        }

        // Highlight selected
        $('#timelineList')
          .querySelectorAll('.timeline-month')
          .forEach(i => {
            i.style.background = 'var(--bg)';
            i.style.borderLeftColor = 'var(--primary)';
            i.style.fontWeight = '600';
          });
        item.style.background = 'rgba(37, 99, 235, 0.15)';
        item.style.borderLeftColor = 'var(--accent)';
        item.style.fontWeight = '700';

        // Render detail
        renderUpdateDetail(upd, yearUpdates, year);
      });
    });

  // Auto-select if specified
  if (selectUpdateId) {
    const selectedItem = $('#timelineList').querySelector(`[data-update-id="${selectUpdateId}"]`);
    if (selectedItem) {
      selectedItem.click();
    }
  }
};

/**
 * Makes renderYears globally available.
 */
window.renderMonatsupdatesYears = function () {
  renderYears();
};

/**
 * Downloads update content.
 * @param {string} updateId - The update ID
 */
window.downloadUpdateContent = function (updateId) {
  const updates = api.listUpdatesMember();
  const upd = updates.find(u => u.id === updateId);
  if (!upd) {
    return;
  }

  const highlights = upd.highlights || [];
  const downloadUrls = highlights
    .map(h => (typeof h === 'string' ? null : h.downloadUrl))
    .filter(url => url);

  if (downloadUrls.length === 0) {
    toast.info('Keine Downloads verfügbar.');
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

/**
 * Renders the monatsupdates page.
 */
export function renderMonatsupdates() {
  // Ensure elements exist
  if (!$('#timelineList') || !$('#updateDetail')) {
    console.warn('Monatsupdates page elements not found');
    return;
  }

  const updates = api.listUpdatesMember();
  const allUpdates = api.getAllUpdatesRaw();
  const publishedUpdates = allUpdates.filter(u => u.status === 'published');

  // Merge with old format if needed
  const allUpdatesCombined = [
    ...publishedUpdates,
    ...updates.filter(u => !publishedUpdates.find(pu => pu.id === u.id))
  ];
  const sortedUpdates = allUpdatesCombined.sort((a, b) => {
    const dateA = a.issueDate || a.month || '';
    const dateB = b.issueDate || b.month || '';
    return dateB.localeCompare(dateA);
  });

  // Gruppiere Updates nach Jahren
  updatesByYear = {};
  sortedUpdates.forEach(upd => {
    const dateStr = upd.issueDate || upd.month || '';
    const [year] = dateStr.split('-');
    if (year && year.length === 4) {
      if (!updatesByYear[year]) {
        updatesByYear[year] = [];
      }
      updatesByYear[year].push(upd);
    }
  });

  years = Object.keys(updatesByYear).sort((a, b) => b.localeCompare(a));
  currentView = 'years';
  selectedYear = null;
  selectedUpdate = null;

  // Make renderYears globally available
  window.renderMonatsupdatesYears = renderYears;

  // Start mit Jahren
  renderYears();
}
