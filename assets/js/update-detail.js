// Public Magazine View for Monthly Updates
// Professional editorial layout

import { api } from "./services/apiClient.js";
import { avatarGenerator } from "./components/avatarGenerator.js";

const $ = (s) => document.querySelector(s);

// Get update slug from URL
const urlParams = new URLSearchParams(window.location.search);
const slug = urlParams.get("slug") || window.location.pathname.split("/").pop().replace(".html", "");

document.addEventListener("DOMContentLoaded", () => {
  loadUpdate(slug);
});

function loadUpdate(slugOrId) {
  const updates = api.listUpdatesMember();
  const allUpdates = JSON.parse(localStorage.getItem("cms:updates") || "[]");
  
  // Find update by slug or id
  let update = allUpdates.find(u => u.slug === slugOrId || u.id === slugOrId);
  
  // If not found, try old format
  if (!update) {
    update = updates.find(u => u.month === slugOrId);
  }
  
  if (!update) {
    $("#updateContent").innerHTML = `
      <div class="card pane" style="text-align:center; padding:60px 20px">
        <div style="font-size:48px; margin-bottom:16px">📄</div>
        <div style="font-weight:600; font-size:20px; margin-bottom:8px">Monatsupdate nicht gefunden</div>
        <div style="color:var(--text-secondary); margin-bottom:24px">Das gesuchte Update existiert nicht oder wurde entfernt.</div>
        <a href="monatsupdates.html" class="btn primary">Zurück zu Monatsupdates</a>
      </div>
    `;
    return;
  }
  
  renderUpdate(update);
}

function renderUpdate(update) {
  const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 
                     'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  const [year, monthNum] = (update.issueDate || update.month || '').split('-');
  const monthName = monthNames[parseInt(monthNum) - 1] || monthNum;
  
  let html = `
    <!-- Hero Section -->
    <div class="update-hero" style="position:relative; margin-bottom:48px; border-radius:12px; overflow:hidden">
      ${update.heroImage?.url ? `
        <div style="position:relative; width:100%; height:500px; overflow:hidden">
          <img src="${update.heroImage.url}" 
               alt="${update.heroImage.alt || ''}" 
               style="width:100%; height:100%; object-fit:cover; object-position:${(update.heroImage.focalPoint?.x || 0.5) * 100}% ${(update.heroImage.focalPoint?.y || 0.5) * 100}%"/>
          <div style="position:absolute; bottom:0; left:0; right:0; background:linear-gradient(transparent, rgba(0,0,0,0.8)); padding:48px 32px">
            <div style="color:white">
              <div style="font-size:14px; text-transform:uppercase; letter-spacing:2px; margin-bottom:12px; opacity:0.9">Monatsupdate · Innovationsabend</div>
              <h1 style="font-weight:900; font-size:48px; line-height:1.1; margin-bottom:8px; color:white">${update.title || 'Monatsupdate'}</h1>
              ${update.subtitle ? `<div style="font-size:24px; margin-bottom:16px; opacity:0.95">${update.subtitle}</div>` : ''}
              <div style="font-size:16px; opacity:0.9">${monthName} ${year}</div>
            </div>
          </div>
        </div>
      ` : `
        <div style="background:var(--bg); padding:80px 32px; text-align:center; border:2px solid var(--border); border-radius:12px">
          <div style="font-size:14px; text-transform:uppercase; letter-spacing:2px; margin-bottom:12px; color:var(--text-secondary)">Monatsupdate · Innovationsabend</div>
          <h1 style="font-weight:900; font-size:48px; line-height:1.1; margin-bottom:8px">${update.title || 'Monatsupdate'}</h1>
          ${update.subtitle ? `<div style="font-size:24px; margin-bottom:16px; color:var(--text-secondary)">${update.subtitle}</div>` : ''}
          <div style="font-size:16px; color:var(--text-secondary)">${monthName} ${year}</div>
        </div>
      `}
      ${update.heroImage?.caption ? `
        <div style="padding:12px 32px; background:var(--bg); font-size:14px; color:var(--text-secondary); font-style:italic; text-align:center">
          ${update.heroImage.caption}
        </div>
      ` : ''}
    </div>
    
    <!-- Stats Bar -->
    <div style="display:flex; gap:32px; padding:24px; background:var(--bg); border-radius:8px; margin-bottom:48px; flex-wrap:wrap; justify-content:center">
      <div style="text-align:center">
        <div style="font-weight:700; font-size:24px; color:var(--primary)">${update.stats?.attendeesCount || update.participants?.length || 0}</div>
        <div style="font-size:14px; color:var(--text-secondary)">Teilnehmer</div>
      </div>
      <div style="text-align:center">
        <div style="font-weight:700; font-size:24px; color:var(--primary)">${update.stats?.highlightsCount || update.highlights?.length || 0}</div>
        <div style="font-size:14px; color:var(--text-secondary)">Highlights</div>
      </div>
      ${update.durationMin ? `
        <div style="text-align:center">
          <div style="font-weight:700; font-size:24px; color:var(--primary)">${update.durationMin}</div>
          <div style="font-size:14px; color:var(--text-secondary)">Minuten</div>
        </div>
      ` : ''}
      ${update.issueDate ? `
        <div style="text-align:center">
          <div style="font-weight:700; font-size:24px; color:var(--primary)">${monthName}</div>
          <div style="font-size:14px; color:var(--text-secondary)">${year}</div>
        </div>
      ` : ''}
    </div>
    
    <!-- Editorial Text -->
    ${update.editorialText ? `
      <div style="max-width:800px; margin:0 auto 64px; line-height:1.9; font-size:18px; color:var(--text-primary)">
        ${update.editorialText.split('\n').map(p => `<p style="margin-bottom:20px">${p}</p>`).join('')}
      </div>
    ` : ''}
    
    <!-- Highlights Section -->
    ${(update.highlights || []).length > 0 ? `
      <div style="margin-bottom:64px">
        <h2 style="font-weight:900; font-size:36px; margin-bottom:40px; text-align:center">Highlights</h2>
        <div style="display:grid; gap:48px">
          ${update.highlights.map((hl, idx) => renderHighlight(hl, idx, update)).join('')}
        </div>
      </div>
    ` : ''}
    
    <!-- Participants Section -->
    ${(update.participants || []).length > 0 ? `
      <div style="margin-bottom:64px">
        <h2 style="font-weight:900; font-size:36px; margin-bottom:40px; text-align:center">Wer war dabei</h2>
        ${renderParticipants(update.participants, update)}
      </div>
    ` : ''}
    
    <!-- Quotes Section -->
    ${(update.quotes || []).length > 0 ? `
      <div style="margin-bottom:64px">
        <h2 style="font-weight:900; font-size:36px; margin-bottom:40px; text-align:center">Diskussion & Community</h2>
        <div style="display:grid; gap:24px; max-width:900px; margin:0 auto">
          ${update.quotes.map(quote => `
            <div style="padding:32px; background:var(--bg); border-left:4px solid var(--primary); border-radius:8px">
              <div style="font-size:20px; line-height:1.7; margin-bottom:16px; font-style:italic">"${quote.text}"</div>
              ${quote.sourceName ? `
                <div style="font-weight:600; color:var(--text-secondary)">
                  ${quote.sourceName}${quote.sourceRole ? `, ${quote.sourceRole}` : ''}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}
    
    <!-- Takeaways Section -->
    ${(update.takeaways || []).length > 0 ? `
      <div style="margin-bottom:64px">
        <h2 style="font-weight:900; font-size:36px; margin-bottom:40px; text-align:center">Was wir mitnehmen</h2>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:24px; max-width:1200px; margin:0 auto">
          ${update.takeaways.map(tk => `
            <div style="padding:24px; background:var(--bg); border-radius:12px; border-left:4px solid var(--accent); box-shadow:0 2px 8px rgba(0,0,0,0.05)">
              <div style="font-weight:600; font-size:16px; line-height:1.6; margin-bottom:8px">${tk.text}</div>
              ${tk.tag ? `
                <div style="font-size:12px; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.5px">${tk.tag}</div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}
    
    <!-- Resources Section -->
    ${(update.resources || []).length > 0 ? `
      <div style="margin-bottom:64px">
        <h2 style="font-weight:900; font-size:36px; margin-bottom:40px; text-align:center">Vertiefen</h2>
        <div style="display:grid; gap:16px; max-width:800px; margin:0 auto">
          ${update.resources.map(res => {
            const icons = {
              article: '📄',
              tool: '🛠️',
              book: '📚',
              project: '🚀',
              video: '🎥'
            };
            return `
              <a href="${res.url}" target="_blank" rel="noopener" style="display:flex; align-items:center; gap:16px; padding:20px; background:var(--bg); border-radius:8px; text-decoration:none; transition:all 0.2s; border:2px solid transparent" 
                 onmouseover="this.style.borderColor='var(--primary)'; this.style.transform='translateX(4px)'"
                 onmouseout="this.style.borderColor='transparent'; this.style.transform='translateX(0)'">
                <div style="font-size:32px">${icons[res.type] || '🔗'}</div>
                <div style="flex:1">
                  <div style="font-weight:600; font-size:16px; margin-bottom:4px; color:var(--text-primary)">${res.title}</div>
                  ${res.note ? `<div style="font-size:14px; color:var(--text-secondary)">${res.note}</div>` : ''}
                  <div style="font-size:12px; color:var(--text-secondary); margin-top:4px">${res.url}</div>
                </div>
                <div style="color:var(--primary)">→</div>
              </a>
            `;
          }).join('')}
        </div>
      </div>
    ` : ''}
    
    <!-- Next Event CTA -->
    ${update.nextEvent?.date ? `
      <div style="margin-bottom:64px; padding:48px; background:linear-gradient(135deg, var(--primary), var(--accent)); border-radius:16px; text-align:center; color:white">
        <div style="font-size:14px; text-transform:uppercase; letter-spacing:2px; margin-bottom:12px; opacity:0.9">Nächstes Event</div>
        <div style="font-weight:700; font-size:32px; margin-bottom:16px">${update.nextEvent.topic || 'Innovationsabend'}</div>
        ${update.nextEvent.date ? `
          <div style="font-size:18px; margin-bottom:24px; opacity:0.95">
            ${new Date(update.nextEvent.date).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        ` : ''}
        ${update.nextEvent.ctaUrl ? `
          <a href="${update.nextEvent.ctaUrl}" class="btn" style="background:white; color:var(--primary); font-weight:600; padding:16px 32px; display:inline-block; text-decoration:none; border-radius:8px">
            ${update.nextEvent.ctaLabel || 'Jetzt anmelden'}
          </a>
        ` : ''}
      </div>
    ` : ''}
    
    <!-- Navigation Footer -->
    <div style="display:flex; justify-content:space-between; align-items:center; padding:32px 0; border-top:2px solid var(--border); margin-top:64px">
      <a href="monatsupdates.html" style="text-decoration:none; color:var(--text-primary); font-weight:600">
        ← Zurück zu Monatsupdates
      </a>
      <a href="monatsupdates.html" style="text-decoration:none; color:var(--primary); font-weight:600">
        Alle Updates anzeigen →
      </a>
    </div>
  `;
  
  $("#updateContent").innerHTML = html;
}

function renderHighlight(highlight, index, update) {
  const isEven = index % 2 === 0;
  
  return `
    <div style="display:grid; grid-template-columns: ${isEven ? '1fr 1fr' : '1fr 1fr'}; gap:48px; align-items:center; ${isEven ? '' : 'direction:rtl'}" 
         class="highlight-item">
      <div style="${isEven ? '' : 'direction:ltr'}">
        ${highlight.media?.image?.url ? `
          <div style="position:relative; border-radius:12px; overflow:hidden; box-shadow:0 8px 24px rgba(0,0,0,0.1)">
            <img src="${highlight.media.image.url}" 
                 alt="${highlight.media.image.alt || highlight.title}" 
                 style="width:100%; height:400px; object-fit:cover; object-position:${(highlight.media.image.focalPoint?.x || 0.5) * 100}% ${(highlight.media.image.focalPoint?.y || 0.5) * 100}%"/>
          </div>
        ` : ''}
      </div>
      <div style="${isEven ? '' : 'direction:ltr'}">
        <div style="font-weight:700; font-size:28px; margin-bottom:16px; color:var(--primary)">${highlight.title || 'Unbenanntes Highlight'}</div>
        ${highlight.shortSummary ? `
          <div style="font-size:17px; line-height:1.8; color:var(--text-primary); margin-bottom:20px">
            ${highlight.shortSummary}
          </div>
        ` : ''}
        ${(highlight.keyPoints || []).length > 0 ? `
          <ul style="list-style:none; padding:0; margin:20px 0">
            ${highlight.keyPoints.map(kp => `
              <li style="padding:12px 0; border-bottom:1px solid var(--border); display:flex; align-items:start; gap:12px">
                <span style="color:var(--primary); font-weight:700; font-size:20px; line-height:1">•</span>
                <span style="flex:1; line-height:1.6">${kp}</span>
              </li>
            `).join('')}
          </ul>
        ` : ''}
        ${(highlight.categoryTags || []).length > 0 ? `
          <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:20px">
            ${highlight.categoryTags.map(tag => `
              <span style="padding:6px 14px; background:var(--bg); border-radius:20px; font-size:13px; font-weight:500; color:var(--text-primary)">
                ${tag}
              </span>
            `).join('')}
          </div>
        ` : ''}
        ${highlight.involvedParticipants && highlight.involvedParticipants.length > 0 ? `
          <div style="margin-top:24px; padding-top:24px; border-top:1px solid var(--border)">
            <div style="font-size:12px; text-transform:uppercase; letter-spacing:1px; color:var(--text-secondary); margin-bottom:12px">Beteiligte</div>
            <div style="display:flex; gap:12px; flex-wrap:wrap">
              ${highlight.involvedParticipants.map(pid => {
                const member = api.listMembers().find(m => m.id === pid);
                if (!member) return '';
                return `
                  <div style="display:flex; align-items:center; gap:8px; padding:8px 12px; background:var(--bg); border-radius:20px">
                    ${avatarGenerator.getAvatar(member, 32)}
                    <span style="font-size:14px; font-weight:500">${member.name || member.email}</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}
        ${highlight.deepDive?.enabled && highlight.deepDive?.contentRichText ? `
          <div style="margin-top:24px">
            <button class="btn" onclick="toggleDeepDive(${index})" id="deepDiveBtn_${index}">
              Mehr lesen ↓
            </button>
            <div id="deepDiveContent_${index}" style="display:none; margin-top:20px; padding:24px; background:var(--bg); border-radius:8px; line-height:1.8">
              ${highlight.deepDive.contentRichText}
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

function renderParticipants(participants, update) {
  const allMembers = api.listMembers();
  const participantData = participants.map(p => {
    const member = allMembers.find(m => m.id === p.participantId);
    return member ? { ...member, role: p.role, tags: p.tags } : null;
  }).filter(Boolean);
  
  if (participantData.length === 0) return '';
  
  return `
    <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap:24px; max-width:1200px; margin:0 auto">
      ${participantData.map(member => {
        const highlights = (update.highlights || []).filter(hl => 
          hl.involvedParticipants && hl.involvedParticipants.includes(member.id)
        );
        
        return `
          <div class="participant-card" style="padding:24px; background:var(--bg); border-radius:12px; text-align:center; cursor:pointer; transition:all 0.2s; border:2px solid transparent"
               onclick="showParticipantModal('${member.id}', ${JSON.stringify(highlights.map(h => h.title)).replace(/"/g, '&quot;')})"
               onmouseover="this.style.borderColor='var(--primary)'; this.style.transform='translateY(-4px)'"
               onmouseout="this.style.borderColor='transparent'; this.style.transform='translateY(0)'">
            ${avatarGenerator.getAvatar(member, 80)}
            <div style="font-weight:600; font-size:16px; margin-top:16px; margin-bottom:4px">${member.name || member.email}</div>
            ${member.email ? `<div style="font-size:13px; color:var(--text-secondary); margin-bottom:8px">${member.email}</div>` : ''}
            ${member.role || member.roleTitle ? `
              <div style="font-size:14px; color:var(--primary); font-weight:500; margin-bottom:8px">
                ${member.role || member.roleTitle}
              </div>
            ` : ''}
            ${member.organization ? `
              <div style="font-size:12px; color:var(--text-secondary)">${member.organization}</div>
            ` : ''}
            ${highlights.length > 0 ? `
              <div style="margin-top:12px; padding-top:12px; border-top:1px solid var(--border)">
                <div style="font-size:11px; text-transform:uppercase; color:var(--text-secondary); margin-bottom:4px">Beteiligt an</div>
                <div style="font-size:12px; font-weight:500; color:var(--primary)">${highlights.length} Highlight(s)</div>
              </div>
            ` : ''}
          </div>
        `;
      }).join('')}
    </div>
  `;
}

window.toggleDeepDive = function(index) {
  const content = $(`#deepDiveContent_${index}`);
  const btn = $(`#deepDiveBtn_${index}`);
  if (content.style.display === 'none') {
    content.style.display = 'block';
    btn.textContent = 'Weniger anzeigen ↑';
  } else {
    content.style.display = 'none';
    btn.textContent = 'Mehr lesen ↓';
  }
};

window.showParticipantModal = function(participantId, highlightTitles) {
  const member = api.listMembers().find(m => m.id === participantId);
  if (!member) return;
  
  const titles = Array.isArray(highlightTitles) ? highlightTitles : [];
  
  const modal = document.createElement('div');
  modal.className = 'modalOverlay';
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal" style="max-width:600px">
      <div class="modalHeader">
        <div class="modalTitle">Teilnehmer-Profil</div>
        <button class="btn" onclick="this.closest('.modalOverlay').remove()">✕</button>
      </div>
      <div class="modalBody">
        <div style="text-align:center; margin-bottom:24px">
          ${avatarGenerator.getAvatar(member, 120)}
          <div style="font-weight:700; font-size:24px; margin-top:16px">${member.name || member.email}</div>
          ${member.email ? `<div style="color:var(--text-secondary); margin-top:4px">${member.email}</div>` : ''}
        </div>
        ${member.roleTitle || member.organization ? `
          <div style="padding:16px; background:var(--bg); border-radius:8px; margin-bottom:16px">
            ${member.roleTitle ? `<div style="font-weight:600; margin-bottom:4px">${member.roleTitle}</div>` : ''}
            ${member.organization ? `<div style="font-size:14px; color:var(--text-secondary)">${member.organization}</div>` : ''}
          </div>
        ` : ''}
        ${titles.length > 0 ? `
          <div style="margin-top:24px">
            <div style="font-weight:600; margin-bottom:12px">Beteiligt an folgenden Highlights:</div>
            <ul style="list-style:none; padding:0">
              ${titles.map(title => `
                <li style="padding:8px 0; border-bottom:1px solid var(--border)">
                  <span style="color:var(--primary)">•</span> ${title}
                </li>
              `).join('')}
            </ul>
          </div>
        ` : ''}
        <div style="margin-top:24px; text-align:center">
          <a href="member.html?id=${member.id}" class="btn primary">Vollständiges Profil anzeigen</a>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
};





