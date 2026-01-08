import { api } from '../services/apiClient.js';
import { avatarGenerator } from '../components/avatarGenerator.js';
import { commonTags } from '../utils.js';
import { qs } from '../utils.js';

const $ = s => document.querySelector(s);

/**
 * Renders a member profile page.
 */
export function renderMember() {
  const email = qs.get('email');
  const u = api.me();
  const p = api.getProfileByEmail(email);
  if (!p) {
    $('#memberCard').innerHTML = '<div class="p">Profil nicht verfügbar.</div>';
    return;
  }

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
  const initials = (p.name || p.email)
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  const customAvatarUrl = avatarGenerator.getAvatarUrl(p);
  const finalAvatarUrl = customAvatarUrl || defaultAvatarUrl;
  const hasCustomAvatar = !!customAvatarUrl;

  $('#memberCard').innerHTML = `
    <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap">
      <div style="display:flex;gap:16px;align-items:start">
        <div style="width:80px;height:80px;border-radius:50%;overflow:hidden;flex-shrink:0;background:var(--bg);border:2px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:600;color:var(--text-primary);background-image:url('${finalAvatarUrl}');background-size:cover;background-position:center;">
          ${hasCustomAvatar ? '' : `<span style="display:none;">${initials}</span>`}
        </div>
        <div>
          <div class="h2" style="margin:0">${p.name}</div>
        <div class="p">${p.headline || '—'}</div>
        <div class="metaLine" style="margin-top:10px">
          ${p.location ? `<span class="badge">${p.location}</span>` : ''}
          ${common.length ? `<span class="badge blue">Gemeinsam: ${common.slice(0, 3).join(', ')}</span>` : ''}
        </div>
      </div>
      <div style="display:flex;gap:10px;align-items:center">
        <button class="btn" id="favBtn">⭐ Favorit</button>
        ${isMe ? '<a class="btn primary" href="profil.html">Bearbeiten</a>' : p.privacy?.allowDM ? `<a class="btn primary" href="neue-nachricht.html?to=${encodeURIComponent(p.email)}">Nachricht senden</a>` : ''}
      </div>
    </div>
    <div class="hr"></div>
    <div class="grid grid-2">
      <div>
        <div style="font-weight:900">Bio</div>
        <p class="p" style="margin-top:8px">${(p.bio || '').replace(/\n/g, '<br/>') || '—'}</p>
        <div style="font-weight:900; margin-top:16px">Biete</div>
        <p class="p" style="margin-top:8px">${(p.offer || '—').replace(/\n/g, '<br/>')}</p>
        <div style="font-weight:900; margin-top:16px">Suche</div>
        <p class="p" style="margin-top:8px">${(p.lookingFor || '—').replace(/\n/g, '<br/>')}</p>
      </div>
      <div>
        <div style="font-weight:900">Skills</div>
        <div class="chips" style="margin-top:8px">${(p.skills || []).map(s => `<span class="chip">${s}</span>`).join('') || '—'}</div>
        <div style="font-weight:900; margin-top:12px">Interessen</div>
        <div class="chips" style="margin-top:8px">${(p.interests || []).map(s => `<span class="chip">${s}</span>`).join('') || '—'}</div>
      </div>
    </div>
  `;
  $('#favBtn').addEventListener('click', () => {
    const userId = p.userId || api.getProfileByEmail(p.email)?.userId || null;
    if (userId) {
      api.toggleFavorite('user', userId);
      $('#favBtn').textContent = '⭐ Favorit ✓';
    }
  });
}








