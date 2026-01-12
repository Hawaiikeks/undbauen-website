/**
 * Members Directory Page
 *
 * Displays member directory with filtering, sorting, and search capabilities.
 * Shows member profiles with skills, interests, and contact information.
 *
 * @module pages/members
 */

import { api } from '../services/apiClient.js';
import { parseTags } from '../utils.js';

/**
 * Query selector shorthand
 * @type {function(string): HTMLElement|null}
 */
const $ = s => document.querySelector(s);

/**
 * Render members directory page
 * Initializes filters, sorting, and member list display
 * @returns {void}
 */
export function renderMembers() {
  let activeFilter = 'all';
  let sortBy = 'newest';

  // Collect all unique skills/interests for filter chips
  const allMembers = api.listMembers('');
  const allTags = new Set();
  allMembers.forEach(m => {
    (m.skills || []).forEach(s => allTags.add(s));
    (m.interests || []).forEach(i => allTags.add(i));
  });
  const sortedTags = Array.from(allTags).sort();

  // Render filter chips
  const filterChips = $('#memberFilterChips');
  if (filterChips) {
    filterChips.innerHTML = `
      <button class="filter-chip active" data-filter="all">Alle</button>
      ${sortedTags
    .slice(0, 20)
    .map(
      tag => `
        <button class="filter-chip" data-filter="${tag}">${tag}</button>
      `
    )
    .join('')}
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
  const sortSelect = $('#memberSortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', e => {
      sortBy = e.target.value;
      render();
    });
  }

  const render = () => {
    const q = ($('#memSearch').value || '').trim();
    let members = api.listMembers(q);

    // Apply filter
    if (activeFilter !== 'all') {
      members = members.filter(
        p => (p.skills || []).includes(activeFilter) || (p.interests || []).includes(activeFilter)
      );
    }

    // Apply sort
    if (sortBy === 'alphabetical') {
      members.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortBy === 'activity') {
      // Sort by activity (would need activity data)
      members.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
    } else {
      // newest first (default)
      members.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
    }

    $('#memGrid').innerHTML = members
      .map(
        p => `
      <div class="card" style="padding:16px">
        <div style="display:flex;justify-content:space-between;gap:10px">
          <div>
            <div style="font-weight:900">${p.name}</div>
            <div class="small">${p.headline || '—'}</div>
          </div>
          <button class="btn" data-fav-user="${p.userId}">⭐</button>
        </div>
        <div class="chips" style="margin-top:10px">${(p.skills || [])
    .slice(0, 4)
    .map(s => `<span class="chip">${s}</span>`)
    .join('')}</div>
        <div style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap">
          <a class="btn primary" href="member.html?email=${encodeURIComponent(p.email)}">Profil</a>
          ${p.privacy?.allowDM ? `<a class="btn" href="neue-nachricht.html?to=${encodeURIComponent(p.email)}">Nachricht</a>` : ''}
        </div>
      </div>
    `
      )
      .join('');
    $('#memGrid')
      .querySelectorAll('[data-fav-user]')
      .forEach(b => {
        b.addEventListener('click', () => {
          api.toggleFavorite('user', b.dataset.favUser);
          b.textContent = '⭐✓';
        });
      });
  };
  $('#memSearch').addEventListener('input', render);
  render();
}
