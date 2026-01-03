/* Section Editor: Component for editing landing page sections */

/**
 * Render section editor
 * @param {Object} section - Section data
 * @param {number} index - Section index
 * @returns {string} HTML
 */
export function renderSectionEditor(section, index) {
  const sectionTypes = {
    hero: 'Hero Section',
    mission: 'Mission Section',
    features: 'Features Section',
    topics: 'Topics Section',
    cta: 'Call to Action',
    footer: 'Footer'
  };

  return `
    <div class="card pane" style="margin-bottom: 16px;" data-section-index="${index}">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <div>
          <div style="font-weight: 600; font-size: 16px;">${sectionTypes[section.type] || section.type}</div>
          <div style="color: var(--text-secondary); font-size: 12px; margin-top: 4px;">
            ${section.id || `Section ${index + 1}`}
          </div>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn small" onclick="window.moveSection(${index}, 'up')" ${index === 0 ? 'disabled' : ''}>↑</button>
          <button class="btn small" onclick="window.moveSection(${index}, 'down')">↓</button>
          <button class="btn small danger" onclick="window.deleteSection(${index})">✕</button>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div>
          <label class="label">Typ</label>
          <select class="input" data-section-field="type" data-section-index="${index}">
            ${Object.entries(sectionTypes).map(([key, label]) => `
              <option value="${key}" ${section.type === key ? 'selected' : ''}>${label}</option>
            `).join('')}
          </select>

          <label class="label" style="margin-top: 12px;">Titel</label>
          <input class="input" data-section-field="title" data-section-index="${index}" 
                 value="${section.title || ''}" placeholder="Section Title" />

          <label class="label" style="margin-top: 12px;">Untertitel</label>
          <input class="input" data-section-field="subtitle" data-section-index="${index}" 
                 value="${section.subtitle || ''}" placeholder="Section Subtitle" />

          <label class="label" style="margin-top: 12px;">Inhalt</label>
          <textarea class="textarea" data-section-field="content" data-section-index="${index}" 
                    rows="4" placeholder="Section Content">${section.content || ''}</textarea>
        </div>

        <div>
          ${section.type === 'hero' ? renderHeroFields(section, index) : ''}
          ${section.type === 'features' ? renderFeaturesFields(section, index) : ''}
          ${section.type === 'topics' ? renderTopicsFields(section, index) : ''}
          
          <label class="label" style="margin-top: 12px;">Sichtbarkeit</label>
          <select class="input" data-section-field="visibility" data-section-index="${index}">
            <option value="public" ${section.visibility === 'public' ? 'selected' : ''}>Öffentlich</option>
            <option value="member" ${section.visibility === 'member' ? 'selected' : ''}>Nur Mitglieder</option>
            <option value="hidden" ${section.visibility === 'hidden' ? 'selected' : ''}>Versteckt</option>
          </select>

          <label class="label" style="margin-top: 12px;">Reihenfolge</label>
          <input class="input" type="number" data-section-field="order" data-section-index="${index}" 
                 value="${section.order || index}" />
        </div>
      </div>
    </div>
  `;
}

/**
 * Render hero-specific fields
 */
function renderHeroFields(section, index) {
  return `
    <label class="label">Hero Bild URL</label>
    <input class="input" data-section-field="heroImage" data-section-index="${index}" 
           value="${section.heroImage || ''}" placeholder="https://..." />
    
    <label class="label" style="margin-top: 12px;">Hero Text</label>
    <textarea class="textarea" data-section-field="heroText" data-section-index="${index}" 
              rows="3" placeholder="Hero headline text">${section.heroText || ''}</textarea>
  `;
}

/**
 * Render features-specific fields
 */
function renderFeaturesFields(section, index) {
  return `
    <label class="label">Features (JSON Array)</label>
    <textarea class="textarea" data-section-field="features" data-section-index="${index}" 
              rows="6" placeholder='[{"title":"Feature 1","description":"..."}]'>${JSON.stringify(section.features || [], null, 2)}</textarea>
  `;
}

/**
 * Render topics-specific fields
 */
function renderTopicsFields(section, index) {
  return `
    <label class="label">Topics (JSON Array)</label>
    <textarea class="textarea" data-section-field="topics" data-section-index="${index}" 
              rows="6" placeholder='[{"title":"Topic 1","description":"..."}]'>${JSON.stringify(section.topics || [], null, 2)}</textarea>
  `;
}

/**
 * Collect section data from editor
 * @param {number} index - Section index
 * @returns {Object} Section data
 */
export function collectSectionData(index) {
  const container = document.querySelector(`[data-section-index="${index}"]`);
  if (!container) return null;

  const data = {};
  const inputs = container.querySelectorAll('[data-section-field]');
  
  inputs.forEach(input => {
    const field = input.dataset.sectionField;
    let value = input.value;

    // Parse JSON fields
    if (field === 'features' || field === 'topics') {
      try {
        value = JSON.parse(value);
      } catch (e) {
        value = [];
      }
    }

    // Parse number fields
    if (field === 'order') {
      value = parseInt(value) || 0;
    }

    data[field] = value;
  });

  return data;
}


