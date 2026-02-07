/* Resources Tool Hub: Professional Tool Launcher */

import { toolRepository } from '../services/repositories/toolRepository.js';
import { api } from '../services/apiClient.js';
import { toast } from '../components/toast.js';
import { getIcon } from '../components/icons.js';

let tools = [];

/**
 * Tool icons mapping - Simple colored squares with initials
 */
const TOOL_ICONS = {
  onedrive: `<div style="width: 48px; height: 48px; background: linear-gradient(135deg, #0078D4 0%, #005A9E 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 18px; box-shadow: 0 2px 8px rgba(0, 120, 212, 0.3);">OD</div>`,
  miro: `<div style="width: 48px; height: 48px; background: linear-gradient(135deg, #FFD02F 0%, #FFC107 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #050038; font-weight: 700; font-size: 18px; box-shadow: 0 2px 8px rgba(255, 208, 47, 0.3);">M</div>`,
  notion: `<div style="width: 48px; height: 48px; background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 18px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);">N</div>`,
  canva: `<div style="width: 48px; height: 48px; background: linear-gradient(135deg, #00C4CC 0%, #00A8B0 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 18px; box-shadow: 0 2px 8px rgba(0, 196, 204, 0.3);">C</div>`,
  github: `<div style="width: 48px; height: 48px; background: linear-gradient(135deg, #181717 0%, #24292e 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 18px; box-shadow: 0 2px 8px rgba(24, 23, 23, 0.3);">GH</div>`,
  linkedin: `<div style="width: 48px; height: 48px; background: linear-gradient(135deg, #0077B5 0%, #005885 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 18px; box-shadow: 0 2px 8px rgba(0, 119, 181, 0.3);">in</div>`
};

/**
 * Get tool icon by key
 */
function getToolIcon(toolKey) {
  const key = toolKey.toLowerCase();
  return TOOL_ICONS[key] || `<div style="width: 48px; height: 48px; background: var(--primary); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 18px;">${toolKey[0]?.toUpperCase() || '?'}</div>`;
}

/**
 * Render tool card
 */
function renderToolCard(tool) {
  const icon = getToolIcon(tool.key);
  const description = tool.description || '';
  
  return `
    <div class="tool-card" 
         data-tool-id="${tool.id}"
         role="button"
         tabindex="0"
         aria-label="${tool.name} öffnen"
         onclick="window.openTool('${tool.id}')"
         onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();window.openTool('${tool.id}')}">
      <div class="tool-card-header">
        <div class="tool-icon">
          ${icon}
        </div>
        <span class="tool-badge">Externes Tool</span>
      </div>
      <div class="tool-card-content">
        <h3 class="tool-name">${escapeHtml(tool.name)}</h3>
        <p class="tool-description">${escapeHtml(description)}</p>
      </div>
      <div class="tool-card-footer">
        <button class="btn primary tool-open-btn" 
                onclick="event.stopPropagation(); window.openTool('${tool.id}')"
                aria-label="${tool.name} öffnen">
          Öffnen
        </button>
      </div>
    </div>
  `;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Open tool in new tab
 */
window.openTool = function(toolId) {
  const tool = tools.find(t => t.id === toolId);
  if (!tool || !tool.url) {
    toast.error('Tool-Link nicht verfügbar');
    return;
  }
  window.open(tool.url, '_blank', 'noopener,noreferrer');
};

/**
 * Initialize Tool Hub
 */
export async function init() {
  const user = api.me();
  if (!user) {
    window.location.href = '../index.html';
    return;
  }

  await loadTools();
  render();
}

/**
 * Load tools from repository
 */
async function loadTools() {
  try {
    tools = await toolRepository.findVisible();
  } catch (error) {
    console.error('Error loading tools:', error);
    toast.error('Fehler beim Laden der Tools');
    tools = [];
  }
}

/**
 * Render Tool Hub page
 */
function render() {
  const container = document.querySelector('#resourcesContainer');
  if (!container) return;

  container.innerHTML = `
    <div class="tool-hub">
      <div class="tool-hub-header">
        <h1 class="tool-hub-title">Ressourcen & Tools</h1>
        <p class="tool-hub-subtitle">Zentrale Arbeitsumgebungen des Netzwerks</p>
      </div>

      ${tools.length === 0 ? `
        <div class="tool-hub-empty">
          <div class="tool-hub-empty-icon">${getIcon('folder', 64)}</div>
          <p class="tool-hub-empty-text">Keine Tools verfügbar</p>
        </div>
      ` : `
        <div class="tool-hub-grid">
          ${tools.map(tool => renderToolCard(tool)).join('')}
        </div>
      `}
    </div>
  `;
}

// Don't auto-initialize - let the HTML page or router handle it
// This prevents double initialization
