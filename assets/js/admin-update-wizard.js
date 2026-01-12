// Admin Monthly Update Wizard
// Professional editor with 7-step stepper and live preview

import { api } from "./services/apiClient.js";
import { MonthlyUpdateModel } from "./services/monthlyUpdateModel.js";
import { richTextEditor } from "./components/richTextEditor.js";
import { toast } from "./components/toast.js";

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

let currentUpdate = null;
let currentTab = 'basics';
const tabs = ['basics', 'content', 'participants', 'publish'];
let autoSaveTimer = null;
let isDraftSaved = true;
let hasUnsavedChanges = false;

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  if (!api.isAdmin()) {
    window.location.href = "admin.html";
    return;
  }

  // Check if editing existing update
  const urlParams = new URLSearchParams(window.location.search);
  const updateId = urlParams.get("id");
  
  if (updateId) {
    loadExistingUpdate(updateId);
  } else {
    createNewUpdate();
  }

  setupTabNavigation();
  setupAutoSave();
  setupDeviceToggle();
  renderTab('basics');
});

function createNewUpdate() {
  const month = new Date().toISOString().slice(0, 7); // YYYY-MM
  currentUpdate = MonthlyUpdateModel.create(month, "Neues Monatsupdate");
  isDraftSaved = false;
}

function loadExistingUpdate(id) {
  const updates = api.listUpdatesMember();
  const allUpdates = JSON.parse(localStorage.getItem("cms:updates") || "[]");
  const update = allUpdates.find(u => u.id === id);
  
  if (update) {
    // Migrate old format to new format if needed
    currentUpdate = migrateToNewFormat(update);
    isDraftSaved = true;
  } else {
    createNewUpdate();
  }
}

function migrateToNewFormat(oldUpdate) {
  // Convert old format to new extended format
  const newUpdate = MonthlyUpdateModel.create(
    oldUpdate.month || new Date().toISOString().slice(0, 7),
    oldUpdate.title || "Monatsupdate"
  );
  
  // Copy existing data
  newUpdate.id = oldUpdate.id;
  newUpdate.subtitle = oldUpdate.subtitle || "";
  newUpdate.editorialText = oldUpdate.intro || oldUpdate.editorialText || "";
  newUpdate.status = oldUpdate.status || "draft";
  newUpdate.createdAt = oldUpdate.createdAt || new Date().toISOString();
  newUpdate.updatedAt = oldUpdate.updatedAt || new Date().toISOString();
  newUpdate.publishedAt = oldUpdate.publishedAt || null;
  
  // Migrate highlights
  if (oldUpdate.highlights && Array.isArray(oldUpdate.highlights)) {
    newUpdate.highlights = oldUpdate.highlights.map((hl, idx) => {
      const highlight = MonthlyUpdateModel.createHighlight();
      highlight.id = hl.id || highlight.id;
      
      if (typeof hl === 'string') {
        highlight.title = hl;
      } else {
        highlight.title = hl.title || "";
        highlight.shortSummary = hl.memberText || hl.shortSummary || "";
        highlight.keyPoints = hl.keyPoints || [];
        if (hl.downloadUrl) {
          highlight.media.type = 'image';
          highlight.media.image.url = hl.downloadUrl;
        }
      }
      
      return highlight;
    });
  }
  
  // Calculate stats
  newUpdate.stats = MonthlyUpdateModel.calculateStats(newUpdate);
  
  return newUpdate;
}

function setupTabNavigation() {
  $$(".tab-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const tab = btn.dataset.tab;
      if (tabs.includes(tab)) {
        switchTab(tab);
      }
    });
  });
}

function switchTab(tab) {
  if (!tabs.includes(tab)) return;
  
  // Save current tab data
  saveCurrentTabData();
  
  currentTab = tab;
  updateTabNavigation();
  renderTab(tab);
  updatePreview();
}

function updateTabNavigation() {
  $$(".tab-btn").forEach(btn => {
    const isActive = btn.dataset.tab === currentTab;
    btn.classList.toggle("active", isActive);
    if (isActive) {
      btn.style.color = "var(--text-primary)";
      btn.style.borderBottomColor = "var(--primary)";
    } else {
      btn.style.color = "var(--text-secondary)";
      btn.style.borderBottomColor = "transparent";
    }
  });
  
  // Show/hide publish button
  $("#publishBtn").style.display = currentTab === 'publish' ? "block" : "none";
}

function setupAutoSave() {
  // Auto-save draft every 3 seconds after changes
  const debouncedSave = debounce(() => {
    saveDraft(false);
    updateAutoSaveStatus(true);
  }, 3000);
  
  // Listen to all input changes
  document.addEventListener("input", () => {
    hasUnsavedChanges = true;
    isDraftSaved = false;
    updateAutoSaveStatus(false);
    debouncedSave();
  });
  
  $("#saveDraft").addEventListener("click", () => {
    saveDraft(true);
  });
  
  $("#publishBtn").addEventListener("click", () => {
    publishUpdate();
  });
  
  // Warn before leaving with unsaved changes
  window.addEventListener("beforeunload", (e) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
      e.returnValue = "Sie haben ungespeicherte Änderungen. Möchten Sie die Seite wirklich verlassen?";
      return e.returnValue;
    }
  });
}

function updateAutoSaveStatus(saved) {
  const icon = $("#autoSaveIcon");
  const text = $("#autoSaveText");
  const badge = $("#saveDraftBadge");
  
  if (saved) {
    if (icon) icon.textContent = "💾";
    if (text) text.textContent = "Gespeichert";
    if (text) text.style.color = "var(--text-secondary)";
    if (badge) badge.style.display = "none";
    hasUnsavedChanges = false;
    isDraftSaved = true;
  } else {
    if (icon) icon.textContent = "⏳";
    if (text) text.textContent = "Wird gespeichert...";
    if (text) text.style.color = "var(--text-secondary)";
    if (badge) badge.style.display = "flex";
  }
}

function saveDraft(showToast = false) {
  if (!currentUpdate) return;
  
  saveCurrentTabData();
  
  currentUpdate.status = "draft";
  currentUpdate.updatedAt = new Date().toISOString();
  currentUpdate.stats = MonthlyUpdateModel.calculateStats(currentUpdate);
  
  // Save to localStorage
  const allUpdates = JSON.parse(localStorage.getItem("cms:updates") || "[]");
  const existingIndex = allUpdates.findIndex(u => u.id === currentUpdate.id);
  
  if (existingIndex >= 0) {
    allUpdates[existingIndex] = currentUpdate;
  } else {
    allUpdates.unshift(currentUpdate);
  }
  
  localStorage.setItem("cms:updates", JSON.stringify(allUpdates));
  
  if (showToast) {
    toast.success("Entwurf gespeichert.");
  }
  
  isDraftSaved = true;
  hasUnsavedChanges = false;
  updateAutoSaveStatus(true);
}

function publishUpdate() {
  // Save all current tab data first
  saveCurrentTabData();
  
  // Validate
  const validation = MonthlyUpdateModel.validate(currentUpdate);
  if (!validation.valid) {
    toast.error(validation.errors.join("\n"));
    return;
  }
  
  // Check for duplicate month
  const allUpdates = JSON.parse(localStorage.getItem("cms:updates") || "[]");
  const existing = allUpdates.find(u => 
    (u.issueDate === currentUpdate.issueDate || u.month === currentUpdate.issueDate) && 
    u.status === "published" && 
    u.id !== currentUpdate.id
  );
  
  if (existing) {
    toast.error(`Für ${currentUpdate.issueDate} existiert bereits ein veröffentlichtes Monatsupdate.`);
    return;
  }
  
  // Set published status
  currentUpdate.status = "published";
  currentUpdate.publishedAt = new Date().toISOString();
  currentUpdate.updatedAt = new Date().toISOString();
  
  // Ensure we have an ID
  if (!currentUpdate.id) {
    currentUpdate.id = `upd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // Save to localStorage
  const existingIndex = allUpdates.findIndex(u => u.id === currentUpdate.id);
  if (existingIndex >= 0) {
    allUpdates[existingIndex] = currentUpdate;
  } else {
    allUpdates.unshift(currentUpdate);
  }
  
  localStorage.setItem("cms:updates", JSON.stringify(allUpdates));
  
  // Show success message
  toast.success("✅ Monatsupdate wurde erfolgreich erstellt und veröffentlicht!");
  
  // Redirect to admin after 2 seconds
  setTimeout(() => {
    window.location.href = "admin.html?tab=content";
  }, 2000);
}

function saveCurrentTabData() {
  if (!currentUpdate) return;
  
  switch (currentTab) {
    case 'basics':
      if ($("#step1Month")) saveStep1Basics();
      if ($("#step2Alt")) saveStep2Hero();
      break;
    case 'content':
      if ($("#hlTitle_0")) saveStep3Highlights();
      if ($("#takeawayText_0")) saveStep5Takeaways();
      if ($("#resourceTitle_0")) saveStep6Resources();
      break;
    case 'participants':
      if ($("#participantSelect")) saveStep4Participants();
      break;
    case 'publish':
      if ($("#step7MetaDesc")) saveStep7SEO();
      break;
  }
}

function renderTab(tab) {
  currentTab = tab;
  updateTabNavigation();
  
  switch (tab) {
    case 'basics':
      renderTabBasics();
      break;
    case 'content':
      renderTabContent();
      break;
    case 'participants':
      renderTabParticipants();
      break;
    case 'publish':
      renderTabPublish();
      break;
  }
  
  updatePreview();
}

// ========== TAB 1: BASICS ==========
function renderTabBasics() {
  $("#tabContent").innerHTML = `
    <div style="max-width:700px">
      <div style="font-weight:700; font-size:20px; margin-bottom:24px">Basics</div>
      
      ${renderStep1Content()}
      <div style="margin-top:32px"></div>
      ${renderStep2Content()}
    </div>
  `;
  
  // Wire up events
  if ($("#step1Title")) {
    $("#step1Title").addEventListener("input", () => {
      const title = $("#step1Title").value;
      const month = $("#step1Month")?.value;
      if (title && month) {
        currentUpdate.slug = MonthlyUpdateModel.generateSlug(title, month);
        if ($("#step1Slug")) $("#step1Slug").textContent = currentUpdate.slug;
      }
    });
  }
  
  if ($("#step1Month")) {
    $("#step1Month").addEventListener("change", () => {
      const title = $("#step1Title")?.value;
      const month = $("#step1Month").value;
      if (title && month) {
        currentUpdate.slug = MonthlyUpdateModel.generateSlug(title, month);
        if ($("#step1Slug")) $("#step1Slug").textContent = currentUpdate.slug;
      }
    });
  }
  
  // Character counter for editorial
  const editorial = $("#step2Editorial");
  const counter = $("#editorialCount");
  if (editorial && counter) {
    editorial.addEventListener("input", () => {
      counter.textContent = editorial.value.length;
      counter.style.color = editorial.value.length > 600 ? "var(--danger)" : "var(--text-secondary)";
    });
    counter.textContent = editorial.value.length;
  }
}

function renderStep1Content() {
  return `
    <div style="margin-bottom:32px">
      <div style="font-weight:600; font-size:16px; margin-bottom:16px; color:var(--text-secondary)">Grundinformationen</div>
      
      <label class="label">Monat (YYYY-MM)</label>
      <input class="input" id="step1Month" type="month" value="${currentUpdate.issueDate || ''}" placeholder="2026-02"/>
      <div class="small" style="color:var(--text-secondary); margin-top:4px">Das Datum des Innovationsabends</div>
      
      <label class="label" style="margin-top:16px">Titel *</label>
      <input class="input" id="step1Title" value="${currentUpdate.title || ''}" placeholder="Monatsupdate Februar 2026"/>
      <div class="small" style="color:var(--text-secondary); margin-top:4px">Haupttitel des Updates</div>
      
      <label class="label" style="margin-top:16px">Untertitel</label>
      <input class="input" id="step1Subtitle" value="${currentUpdate.subtitle || ''}" placeholder="Optional: Kurzer Untertitel"/>
      
      <label class="label" style="margin-top:16px">Status</label>
      <select class="input" id="step1Status">
        <option value="draft" ${currentUpdate.status === 'draft' ? 'selected' : ''}>Entwurf</option>
        <option value="published" ${currentUpdate.status === 'published' ? 'selected' : ''}>Veröffentlicht</option>
        <option value="archived" ${currentUpdate.status === 'archived' ? 'selected' : ''}>Archiviert</option>
      </select>
      
      <div style="margin-top:16px; padding:12px; background:var(--bg); border-radius:6px">
        <div style="font-weight:600; margin-bottom:8px">URL-Slug</div>
        <div style="font-family:monospace; font-size:14px; color:var(--text-secondary)" id="step1Slug">${currentUpdate.slug || ''}</div>
        <div class="small" style="color:var(--text-secondary); margin-top:4px">Wird automatisch aus Titel und Datum generiert</div>
      </div>
    </div>
  `;
}

function renderStep2Content() {
  return `
    <div>
      <div style="font-weight:600; font-size:16px; margin-bottom:16px; color:var(--text-secondary)">Hero & Editorial</div>
      
      <label class="label">Hero-Bild</label>
      <div style="margin-bottom:16px">
        ${currentUpdate.heroImage?.url ? `
          <div id="heroImageContainer" style="position:relative; margin-bottom:12px; cursor:crosshair">
            <img src="${currentUpdate.heroImage.url}" alt="Hero" style="width:100%; max-height:300px; object-fit:cover; border-radius:8px; object-position:${(currentUpdate.heroImage.focalPoint?.x || 0.5) * 100}% ${(currentUpdate.heroImage.focalPoint?.y || 0.5) * 100}%"/>
            <div id="heroFocalPoint" style="position:absolute; width:20px; height:20px; border:3px solid var(--primary); border-radius:50%; background:rgba(255,255,255,0.8); transform:translate(-50%, -50%); pointer-events:none; z-index:10; left:${(currentUpdate.heroImage.focalPoint?.x || 0.5) * 100}%; top:${(currentUpdate.heroImage.focalPoint?.y || 0.5) * 100}%"></div>
            <button class="btn danger small" onclick="removeHeroImage()" style="position:absolute; top:8px; right:8px; z-index:20">✕ Entfernen</button>
          </div>
          <div style="display:flex; gap:8px; margin-top:8px">
            <button class="btn small" onclick="openHeroCrop()">✂️ Focal Point setzen</button>
          </div>
          <div class="small" style="color:var(--text-secondary); margin-top:4px">Klicken Sie auf das Bild, um den Fokuspunkt zu setzen</div>
        ` : `
          <div style="border:2px dashed var(--border); border-radius:8px; padding:40px; text-align:center; background:var(--bg)">
            <div style="font-size:48px; margin-bottom:12px">📷</div>
            <div style="margin-bottom:12px">Kein Bild hochgeladen</div>
            <button class="btn primary" onclick="uploadHeroImage()">Bild hochladen</button>
          </div>
        `}
        <input type="file" id="heroImageInput" accept="image/*" style="display:none" onchange="handleHeroImageUpload(event)"/>
      </div>
      
      <label class="label">Alt-Text *</label>
      <input class="input" id="step2Alt" value="${currentUpdate.heroImage?.alt || ''}" placeholder="Beschreibung des Bildes für Barrierefreiheit"/>
      <div class="small" style="color:var(--text-secondary); margin-top:4px">Pflichtfeld für Barrierefreiheit</div>
      
      <label class="label" style="margin-top:16px">Bildunterschrift</label>
      <input class="input" id="step2Caption" value="${currentUpdate.heroImage?.caption || ''}" placeholder="Optional: Bildunterschrift"/>
      
      <label class="label" style="margin-top:16px">Editorial-Text (5-8 Zeilen)</label>
      <textarea class="textarea" id="step2Editorial" style="min-height:120px" placeholder="Kurze Einleitung zum Monatsupdate...">${currentUpdate.editorialText || ''}</textarea>
      <div class="small" style="color:var(--text-secondary); margin-top:4px">
        <span id="editorialCount">${(currentUpdate.editorialText || '').length}</span> / 600 Zeichen
      </div>
    </div>
  `;
}

// ========== TAB 2: CONTENT ==========
function renderTabContent() {
  $("#tabContent").innerHTML = `
    <div style="max-width:700px">
      <div style="font-weight:700; font-size:20px; margin-bottom:24px">Content</div>
      
      <div style="margin-bottom:32px">
        <div style="font-weight:600; font-size:16px; margin-bottom:16px; color:var(--text-secondary)">Highlights</div>
        ${renderStep3Content()}
      </div>
      
      <div style="margin-bottom:32px">
        <div style="font-weight:600; font-size:16px; margin-bottom:16px; color:var(--text-secondary)">Takeaways</div>
        ${renderStep5Content()}
      </div>
      
      <div>
        <div style="font-weight:600; font-size:16px; margin-bottom:16px; color:var(--text-secondary)">Resources</div>
        ${renderStep6Content()}
      </div>
    </div>
  `;
}

function renderStep3Content() {
  const highlights = currentUpdate.highlights || [];
  return `
    <div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px">
        <div class="small" style="color:var(--text-secondary)">${highlights.length} Highlight${highlights.length !== 1 ? 's' : ''}</div>
        <button class="btn primary" onclick="addNewHighlight()">+ Highlight hinzufügen</button>
      </div>
      ${highlights.length === 0 ? `
        <div style="text-align:center; padding:40px 20px; background:var(--bg); border-radius:8px; border:2px dashed var(--border)">
          <div style="font-size:32px; margin-bottom:8px">✨</div>
          <div style="font-weight:600; margin-bottom:4px">Noch keine Highlights</div>
          <button class="btn primary" onclick="addNewHighlight()">Erstes Highlight hinzufügen</button>
        </div>
      ` : `
        <div style="display:flex; flex-direction:column; gap:12px">
          ${highlights.map((hl, idx) => `
            <div class="card" style="padding:16px; cursor:pointer; ${idx === currentHighlightIndex ? 'border:2px solid var(--primary)' : ''}" onclick="editHighlight(${idx})">
              <div style="display:flex; justify-content:space-between; align-items:start">
                <div style="flex:1">
                  <div style="font-weight:600; margin-bottom:4px">${hl.title || 'Unbenanntes Highlight'}</div>
                  <div style="font-size:14px; color:var(--text-secondary)">${hl.shortSummary ? hl.shortSummary.substring(0, 100) + '...' : 'Keine Beschreibung'}</div>
                </div>
                <button class="btn danger small" onclick="event.stopPropagation(); deleteHighlight(${idx})">✕</button>
              </div>
            </div>
          `).join('')}
        </div>
        ${currentHighlightIndex >= 0 ? renderHighlightEditor(highlights[currentHighlightIndex], currentHighlightIndex) : ''}
      `}
    </div>
  `;
}

function renderStep5Content() {
  // This will be implemented similarly to renderStep3Content
  return `<div class="p" style="color:var(--text-secondary)">Takeaways werden hier angezeigt...</div>`;
}

function renderStep6Content() {
  // This will be implemented similarly to renderStep3Content
  return `<div class="p" style="color:var(--text-secondary)">Resources werden hier angezeigt...</div>`;
}

// ========== TAB 3: PARTICIPANTS ==========
function renderTabParticipants() {
  $("#tabContent").innerHTML = `
    <div style="max-width:700px">
      <div style="font-weight:700; font-size:20px; margin-bottom:24px">Teilnehmer</div>
      ${renderStep4Content()}
    </div>
  `;
}

function renderStep4Content() {
  // This will use the existing renderStep4() content
  return `<div class="p" style="color:var(--text-secondary)">Teilnehmer-Auswahl wird hier angezeigt...</div>`;
}

// ========== TAB 4: PUBLISH ==========
function renderTabPublish() {
  $("#tabContent").innerHTML = `
    <div style="max-width:700px">
      <div style="font-weight:700; font-size:20px; margin-bottom:24px">Veröffentlichen</div>
      ${renderStep7Content()}
    </div>
  `;
}

function renderStep7Content() {
  // This will use the existing renderStep7() content
  return `<div class="p" style="color:var(--text-secondary)">SEO & Veröffentlichung wird hier angezeigt...</div>`;
}

// ========== STEP 1: BASICS ==========
function renderStep1() {
  $("#stepContent").innerHTML = `
    <div style="max-width:700px">
      <div style="font-weight:700; font-size:20px; margin-bottom:24px">1. Basics</div>
      
      <label class="label">Monat (YYYY-MM)</label>
      <input class="input" id="step1Month" type="month" value="${currentUpdate.issueDate || ''}" placeholder="2026-02"/>
      <div class="small" style="color:var(--text-secondary); margin-top:4px">Das Datum des Innovationsabends</div>
      
      <label class="label" style="margin-top:16px">Titel *</label>
      <input class="input" id="step1Title" value="${currentUpdate.title || ''}" placeholder="Monatsupdate Februar 2026"/>
      <div class="small" style="color:var(--text-secondary); margin-top:4px">Haupttitel des Updates</div>
      
      <label class="label" style="margin-top:16px">Untertitel</label>
      <input class="input" id="step1Subtitle" value="${currentUpdate.subtitle || ''}" placeholder="Optional: Kurzer Untertitel"/>
      
      <label class="label" style="margin-top:16px">Status</label>
      <select class="input" id="step1Status">
        <option value="draft" ${currentUpdate.status === 'draft' ? 'selected' : ''}>Entwurf</option>
        <option value="published" ${currentUpdate.status === 'published' ? 'selected' : ''}>Veröffentlicht</option>
        <option value="archived" ${currentUpdate.status === 'archived' ? 'selected' : ''}>Archiviert</option>
      </select>
      
      <div style="margin-top:24px; padding:12px; background:var(--bg); border-radius:6px">
        <div style="font-weight:600; margin-bottom:8px">URL-Slug</div>
        <div style="font-family:monospace; font-size:14px; color:var(--text-secondary)" id="step1Slug">${currentUpdate.slug || ''}</div>
        <div class="small" style="color:var(--text-secondary); margin-top:4px">Wird automatisch aus Titel und Datum generiert</div>
      </div>
      
      <div style="margin-top:32px; display:flex; gap:8px; justify-content:flex-end">
        <button class="btn" onclick="goToStep(${currentStep + 1})">Weiter →</button>
      </div>
    </div>
  `;
  
  // Update slug on title change
  $("#step1Title").addEventListener("input", () => {
    const title = $("#step1Title").value;
    const month = $("#step1Month").value;
    if (title && month) {
      currentUpdate.slug = MonthlyUpdateModel.generateSlug(title, month);
      $("#step1Slug").textContent = currentUpdate.slug;
    }
  });
  
  $("#step1Month").addEventListener("change", () => {
    const title = $("#step1Title").value;
    const month = $("#step1Month").value;
    if (title && month) {
      currentUpdate.slug = MonthlyUpdateModel.generateSlug(title, month);
      $("#step1Slug").textContent = currentUpdate.slug;
    }
  });
}

function saveStep1Basics() {
  currentUpdate.issueDate = $("#step1Month").value;
  currentUpdate.title = $("#step1Title").value.trim();
  currentUpdate.subtitle = $("#step1Subtitle").value.trim();
  currentUpdate.status = $("#step1Status").value;
  currentUpdate.slug = MonthlyUpdateModel.generateSlug(currentUpdate.title, currentUpdate.issueDate);
}

// ========== STEP 2: HERO ==========
function renderStep2() {
  $("#stepContent").innerHTML = `
    <div style="max-width:700px">
      <div style="font-weight:700; font-size:20px; margin-bottom:24px">2. Hero & Editorial</div>
      
      <label class="label">Hero-Bild</label>
      <div style="margin-bottom:16px">
        ${currentUpdate.heroImage?.url ? `
          <div id="heroImageContainer" style="position:relative; margin-bottom:12px; cursor:crosshair">
            <img src="${currentUpdate.heroImage.url}" alt="Hero" style="width:100%; max-height:300px; object-fit:cover; border-radius:8px; object-position:${(currentUpdate.heroImage.focalPoint?.x || 0.5) * 100}% ${(currentUpdate.heroImage.focalPoint?.y || 0.5) * 100}%"/>
            <div id="heroFocalPoint" style="position:absolute; width:20px; height:20px; border:3px solid var(--primary); border-radius:50%; background:rgba(255,255,255,0.8); transform:translate(-50%, -50%); pointer-events:none; z-index:10; left:${(currentUpdate.heroImage.focalPoint?.x || 0.5) * 100}%; top:${(currentUpdate.heroImage.focalPoint?.y || 0.5) * 100}%"></div>
            <button class="btn danger small" onclick="removeHeroImage()" style="position:absolute; top:8px; right:8px; z-index:20">✕ Entfernen</button>
          </div>
          <div style="display:flex; gap:8px; margin-top:8px">
            <button class="btn small" onclick="openHeroCrop()">✂️ Focal Point setzen</button>
          </div>
          <div class="small" style="color:var(--text-secondary); margin-top:4px">Klicken Sie auf das Bild, um den Fokuspunkt zu setzen</div>
        ` : `
          <div style="border:2px dashed var(--border); border-radius:8px; padding:40px; text-align:center; background:var(--bg)">
            <div style="font-size:48px; margin-bottom:12px">📷</div>
            <div style="margin-bottom:12px">Kein Bild hochgeladen</div>
            <button class="btn primary" onclick="uploadHeroImage()">Bild hochladen</button>
          </div>
        `}
        <input type="file" id="heroImageInput" accept="image/*" style="display:none" onchange="handleHeroImageUpload(event)"/>
      </div>
      
      <label class="label">Alt-Text *</label>
      <input class="input" id="step2Alt" value="${currentUpdate.heroImage?.alt || ''}" placeholder="Beschreibung des Bildes für Barrierefreiheit"/>
      <div class="small" style="color:var(--text-secondary); margin-top:4px">Pflichtfeld für Barrierefreiheit</div>
      
      <label class="label" style="margin-top:16px">Bildunterschrift</label>
      <input class="input" id="step2Caption" value="${currentUpdate.heroImage?.caption || ''}" placeholder="Optional: Bildunterschrift"/>
      
      <label class="label" style="margin-top:16px">Editorial-Text (5-8 Zeilen)</label>
      <textarea class="textarea" id="step2Editorial" style="min-height:120px" placeholder="Kurze Einleitung zum Monatsupdate...">${currentUpdate.editorialText || ''}</textarea>
      <div class="small" style="color:var(--text-secondary); margin-top:4px">
        <span id="editorialCount">0</span> / 600 Zeichen
      </div>
      
      <div style="margin-top:32px; display:flex; gap:8px; justify-content:space-between">
        <button class="btn" onclick="goToStep(${currentStep - 1})">← Zurück</button>
        <button class="btn" onclick="goToStep(${currentStep + 1})">Weiter →</button>
      </div>
    </div>
  `;
  
  // Character counter
  const editorial = $("#step2Editorial");
  const counter = $("#editorialCount");
  editorial.addEventListener("input", () => {
    counter.textContent = editorial.value.length;
    counter.style.color = editorial.value.length > 600 ? "var(--danger)" : "var(--text-secondary)";
  });
  counter.textContent = editorial.value.length;
}

function saveStep2Hero() {
  currentUpdate.heroImage = currentUpdate.heroImage || {};
  currentUpdate.heroImage.alt = $("#step2Alt").value.trim();
  currentUpdate.heroImage.caption = $("#step2Caption").value.trim();
  currentUpdate.editorialText = $("#step2Editorial").value.trim();
}

window.uploadHeroImage = function() {
  $("#heroImageInput").click();
};

window.handleHeroImageUpload = function(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  if (file.size > 10 * 1024 * 1024) {
    toast.error("Bild ist zu groß. Maximal 10MB.");
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    currentUpdate.heroImage = currentUpdate.heroImage || {};
    currentUpdate.heroImage.url = e.target.result;
    currentUpdate.heroImage.focalPoint = { x: 0.5, y: 0.5 };
    renderTab('basics');
    updatePreview();
    
    // Add focal point indicator after image loads
    setTimeout(() => {
      addHeroFocalPointUI();
    }, 100);
  };
  reader.readAsDataURL(file);
};

function addHeroFocalPointUI() {
  const heroImage = $(".update-hero img");
  if (!heroImage || !currentUpdate.heroImage?.url) return;
  
  // Check if UI already exists
  if ($("#heroFocalPointContainer")) return;
  
  const container = heroImage.parentElement;
  if (!container) return;
  
  container.style.position = 'relative';
  container.style.cursor = 'crosshair';
  
  const indicator = document.createElement('div');
  indicator.id = 'heroFocalPoint';
  indicator.style.cssText = 'position:absolute; width:20px; height:20px; border:3px solid var(--primary); border-radius:50%; background:rgba(255,255,255,0.8); transform:translate(-50%, -50%); pointer-events:none; z-index:10';
  indicator.style.left = (currentUpdate.heroImage.focalPoint.x * 100) + '%';
  indicator.style.top = (currentUpdate.heroImage.focalPoint.y * 100) + '%';
  indicator.style.display = 'block';
  
  container.appendChild(indicator);
  
  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width);
    const y = ((e.clientY - rect.top) / rect.height);
    indicator.style.left = (x * 100) + '%';
    indicator.style.top = (y * 100) + '%';
  });
  
  container.addEventListener('click', (e) => {
    const rect = container.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    
    currentUpdate.heroImage.focalPoint = { x, y };
    indicator.style.left = (x * 100) + '%';
    indicator.style.top = (y * 100) + '%';
    updatePreview();
    toast.success("Fokuspunkt gesetzt");
  });
}

window.removeHeroImage = function() {
  currentUpdate.heroImage = {
    url: null,
    alt: '',
    caption: '',
    focalPoint: { x: 0.5, y: 0.5 }
  };
  renderTab('basics');
  updatePreview();
};

window.openHeroCrop = function() {
  const container = $("#heroImageContainer");
  const indicator = $("#heroFocalPoint");
  if (container && indicator) {
    indicator.style.display = 'block';
    
    container.addEventListener('mousemove', function handleMove(e) {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width);
      const y = ((e.clientY - rect.top) / rect.height);
      indicator.style.left = (x * 100) + '%';
      indicator.style.top = (y * 100) + '%';
    });
    
    container.addEventListener('click', function handleClick(e) {
      const rect = container.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
      
      currentUpdate.heroImage.focalPoint = { x, y };
      indicator.style.left = (x * 100) + '%';
      indicator.style.top = (y * 100) + '%';
      updatePreview();
      toast.success("Fokuspunkt gesetzt");
      
      container.removeEventListener('mousemove', handleMove);
      container.removeEventListener('click', handleClick);
    }, { once: true });
  }
};

// ========== STEP 3: HIGHLIGHTS ==========
let currentHighlightIndex = -1;

function renderStep3() {
  const highlights = currentUpdate.highlights || [];
  
  $("#stepContent").innerHTML = `
    <div style="max-width:700px">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px">
        <div style="font-weight:700; font-size:20px">3. Highlights</div>
        <button class="btn primary" onclick="addNewHighlight()">+ Highlight hinzufügen</button>
      </div>
      
      ${highlights.length === 0 ? `
        <div style="text-align:center; padding:60px 20px; background:var(--bg); border-radius:8px; border:2px dashed var(--border)">
          <div style="font-size:48px; margin-bottom:12px">✨</div>
          <div style="font-weight:600; margin-bottom:8px">Noch keine Highlights</div>
          <div style="color:var(--text-secondary); margin-bottom:16px">Fügen Sie das erste Highlight hinzu</div>
          <button class="btn primary" onclick="addNewHighlight()">Erstes Highlight hinzufügen</button>
        </div>
      ` : `
        <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:24px">
          ${highlights.map((hl, idx) => `
            <div class="card" style="padding:16px; cursor:pointer; ${idx === currentHighlightIndex ? 'border:2px solid var(--primary)' : ''}" onclick="editHighlight(${idx})">
              <div style="display:flex; justify-content:space-between; align-items:start">
                <div style="flex:1">
                  <div style="font-weight:600; margin-bottom:4px">${hl.title || 'Unbenanntes Highlight'}</div>
                  <div style="font-size:14px; color:var(--text-secondary)">${hl.shortSummary ? hl.shortSummary.substring(0, 100) + '...' : 'Keine Beschreibung'}</div>
                  <div style="margin-top:8px; display:flex; gap:8px; flex-wrap:wrap">
                    ${(hl.categoryTags || []).map(tag => `<span style="padding:4px 8px; background:var(--bg); border-radius:4px; font-size:12px">${tag}</span>`).join('')}
                  </div>
                </div>
                <div style="display:flex; gap:4px; margin-left:12px">
                  <button class="btn small" onclick="event.stopPropagation(); moveHighlight(${idx}, 'up')" ${idx === 0 ? 'disabled' : ''}>↑</button>
                  <button class="btn small" onclick="event.stopPropagation(); moveHighlight(${idx}, 'down')" ${idx === highlights.length - 1 ? 'disabled' : ''}>↓</button>
                  <button class="btn danger small" onclick="event.stopPropagation(); deleteHighlight(${idx})">✕</button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
        
        ${currentHighlightIndex >= 0 ? renderHighlightEditor(highlights[currentHighlightIndex], currentHighlightIndex) : ''}
      `}
      
      <div style="margin-top:32px; display:flex; gap:8px; justify-content:space-between">
        <button class="btn" onclick="goToStep(${currentStep - 1})">← Zurück</button>
        <button class="btn" onclick="goToStep(${currentStep + 1})">Weiter →</button>
      </div>
    </div>
  `;
}

function renderHighlightEditor(highlight, index) {
  const allMembers = api.listMembers();
  const selectedParticipantIds = highlight.involvedParticipants || [];
  
  return `
    <div class="card" style="margin-top:24px; padding:20px; background:var(--bg)">
      <div style="font-weight:600; margin-bottom:16px">Highlight bearbeiten</div>
      
      <label class="label">Titel *</label>
      <input class="input" id="hlTitle_${index}" value="${highlight.title || ''}" placeholder="Highlight Titel"/>
      
      <label class="label" style="margin-top:12px">Kategorien (Tags)</label>
      <input class="input" id="hlTags_${index}" value="${(highlight.categoryTags || []).join(', ')}" placeholder="Innovation, Design, Tech (kommagetrennt)"/>
      <div class="small" style="color:var(--text-secondary); margin-top:4px">Kommagetrennte Tags</div>
      
      <label class="label" style="margin-top:12px">Kurze Zusammenfassung (2-3 Sätze)</label>
      <textarea class="textarea" id="hlSummary_${index}" style="min-height:80px" placeholder="Kurze Beschreibung...">${highlight.shortSummary || ''}</textarea>
      <div class="small" style="color:var(--text-secondary); margin-top:4px">
        <span id="hlSummaryCount_${index}">${highlight.shortSummary?.length || 0}</span> / 300 Zeichen
      </div>
      
      <label class="label" style="margin-top:12px">Key Points (max. 5)</label>
      <div id="hlKeyPoints_${index}">
        ${(highlight.keyPoints || []).map((kp, kpIdx) => `
          <div style="display:flex; gap:8px; margin-bottom:8px">
            <input class="input" value="${kp}" placeholder="Key Point ${kpIdx + 1}" onchange="updateKeyPoint(${index}, ${kpIdx}, this.value)"/>
            <button class="btn small danger" onclick="removeKeyPoint(${index}, ${kpIdx})">✕</button>
          </div>
        `).join('')}
        ${(highlight.keyPoints || []).length < 5 ? `
          <button class="btn small" onclick="addKeyPoint(${index})">+ Key Point hinzufügen</button>
        ` : ''}
      </div>
      
      <label class="label" style="margin-top:12px">Bild</label>
      ${highlight.media?.image?.url ? `
        <div style="position:relative; margin-bottom:12px">
          <div id="hlImageContainer_${index}" style="position:relative; width:100%; max-height:300px; overflow:hidden; border-radius:8px; cursor:crosshair" 
               onmousemove="handleImageMouseMove(${index}, event)" 
               onclick="setFocalPoint(${index}, event)"
               onmouseleave="hideFocalPointIndicator(${index})">
            <img id="hlImage_${index}" 
                 src="${highlight.media.image.url}" 
                 alt="Highlight" 
                 style="width:100%; max-height:300px; object-fit:cover; border-radius:8px"/>
            <div id="hlFocalPoint_${index}" 
                 style="position:absolute; width:20px; height:20px; border:3px solid var(--primary); border-radius:50%; background:rgba(255,255,255,0.8); transform:translate(-50%, -50%); pointer-events:none; display:none; z-index:10"></div>
          </div>
          <div style="display:flex; gap:8px; margin-top:8px">
            <button class="btn danger small" onclick="removeHighlightImage(${index})">✕ Entfernen</button>
            <button class="btn small" onclick="openImageCrop(${index})">✂️ Focal Point setzen</button>
          </div>
          <div class="small" style="color:var(--text-secondary); margin-top:4px">Klicken Sie auf das Bild, um den Fokuspunkt zu setzen</div>
        </div>
      ` : ''}
      <input type="file" id="hlImageInput_${index}" accept="image/*" style="display:none" onchange="handleHighlightImageUpload(${index}, event)"/>
      <button class="btn small" onclick="uploadHighlightImage(${index})">${highlight.media?.image?.url ? 'Bild ersetzen' : 'Bild hochladen'}</button>
      
      ${highlight.media?.image?.url ? `
        <label class="label" style="margin-top:12px">Alt-Text *</label>
        <input class="input" id="hlAlt_${index}" value="${highlight.media.image.alt || ''}" placeholder="Beschreibung des Bildes"/>
      ` : ''}
      
      <label class="label" style="margin-top:16px">Beteiligte Teilnehmer</label>
      <div style="max-height:200px; overflow-y:auto; border:1px solid var(--border); border-radius:6px; padding:12px; margin-bottom:12px">
        ${allMembers.map(member => {
          const isSelected = selectedParticipantIds.includes(member.id);
          return `
            <div style="display:flex; align-items:center; gap:8px; padding:8px; ${isSelected ? 'background:var(--bg)' : ''}">
              <input type="checkbox" 
                     id="hlParticipant_${index}_${member.id}" 
                     ${isSelected ? 'checked' : ''} 
                     onchange="toggleHighlightParticipant(${index}, '${member.id}')"/>
              <label for="hlParticipant_${index}_${member.id}" style="flex:1; cursor:pointer; font-size:14px">
                ${member.name || member.email}
              </label>
            </div>
          `;
        }).join('')}
      </div>
      <div class="small" style="color:var(--text-secondary); margin-top:4px">Wählen Sie Teilnehmer aus, die an diesem Highlight beteiligt waren</div>
      
      <label class="label" style="margin-top:16px">Download-Dateien (optional)</label>
      <div style="margin-bottom:12px">
        <div id="hlAttachments_${index}" style="display:flex; flex-direction:column; gap:8px; margin-bottom:8px">
          ${(highlight.deepDive?.attachments || []).map((att, attIdx) => `
            <div style="display:flex; align-items:center; gap:8px; padding:8px; background:var(--bg); border-radius:6px; border:1px solid var(--border)">
              <span style="font-size:20px">📎</span>
              <div style="flex:1">
                <div style="font-weight:600; font-size:14px">${att.name || 'Datei'}</div>
                <div style="font-size:12px; color:var(--text-secondary)">${att.size ? formatFileSize(att.size) : ''}</div>
              </div>
              <button class="btn danger small" onclick="removeHighlightAttachment(${index}, ${attIdx})">✕</button>
            </div>
          `).join('')}
        </div>
        <input type="file" id="hlAttachmentInput_${index}" style="display:none" onchange="handleHighlightAttachmentUpload(${index}, event)"/>
        <button class="btn small" onclick="uploadHighlightAttachment(${index})">+ Datei hinzufügen</button>
        <div class="small" style="color:var(--text-secondary); margin-top:4px">PDF, ZIP, DOCX, etc. (max. 50MB)</div>
      </div>
      
      <label class="label" style="margin-top:16px">Deep Dive (optional)</label>
      <div style="margin-bottom:8px">
        <label style="display:flex; align-items:center; gap:8px; cursor:pointer">
          <input type="checkbox" id="hlDeepDiveEnabled_${index}" ${highlight.deepDive?.enabled ? 'checked' : ''} onchange="toggleDeepDive(${index})"/>
          <span>Deep Dive aktivieren</span>
        </label>
      </div>
      ${highlight.deepDive?.enabled ? `
        <textarea class="textarea" id="hlDeepDive_${index}" data-rich-text style="min-height:150px" placeholder="Ausführlicher Text für Deep Dive...">${highlight.deepDive?.contentRichText || ''}</textarea>
      ` : ''}
      
      <div style="margin-top:16px">
        <button class="btn" onclick="closeHighlightEditor()">Fertig</button>
      </div>
    </div>
  `;
}

window.addNewHighlight = function() {
  const highlight = MonthlyUpdateModel.createHighlight();
  currentUpdate.highlights = currentUpdate.highlights || [];
  currentUpdate.highlights.push(highlight);
  currentHighlightIndex = currentUpdate.highlights.length - 1;
  renderTab('content');
  updatePreview();
};

window.editHighlight = function(index) {
  currentHighlightIndex = index;
  renderTab('content');
};

window.closeHighlightEditor = function() {
  saveHighlightData(currentHighlightIndex);
  currentHighlightIndex = -1;
  renderTab('content');
  updatePreview();
};

function saveHighlightData(index) {
  if (index < 0 || !currentUpdate.highlights[index]) return;
  
  const highlight = currentUpdate.highlights[index];
  highlight.title = $(`#hlTitle_${index}`)?.value.trim() || '';
  highlight.categoryTags = $(`#hlTags_${index}`)?.value.split(',').map(t => t.trim()).filter(t => t) || [];
  highlight.shortSummary = $(`#hlSummary_${index}`)?.value.trim() || '';
  
  // Key points are saved via updateKeyPoint
  if ($(`#hlAlt_${index}`)) {
    highlight.media = highlight.media || { type: null, image: {}, embedUrl: null };
    highlight.media.image.alt = $(`#hlAlt_${index}`).value.trim();
  }
  
  // Save involved participants
  const checkboxes = $$(`#hlParticipant_${index}_`);
  highlight.involvedParticipants = Array.from(checkboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.id.split('_').pop());
  
  // Save deep dive
  if ($(`#hlDeepDiveEnabled_${index}`)?.checked) {
    highlight.deepDive = highlight.deepDive || { enabled: false, contentRichText: '', attachments: [] };
    highlight.deepDive.enabled = true;
    const deepDiveTextarea = $(`#hlDeepDive_${index}`);
    if (deepDiveTextarea) {
      // Try to get from Rich Text Editor
      const editor = richTextEditor.editors.get(`hlDeepDive_${index}`);
      if (editor && editor.quill) {
        highlight.deepDive.contentRichText = editor.quill.root.innerHTML;
      } else {
        highlight.deepDive.contentRichText = deepDiveTextarea.value;
      }
    }
  } else {
    if (highlight.deepDive) {
      highlight.deepDive.enabled = false;
    }
  }
}

window.updateKeyPoint = function(highlightIndex, keyPointIndex, value) {
  if (!currentUpdate.highlights[highlightIndex]) return;
  currentUpdate.highlights[highlightIndex].keyPoints = currentUpdate.highlights[highlightIndex].keyPoints || [];
  currentUpdate.highlights[highlightIndex].keyPoints[keyPointIndex] = value;
  updatePreview();
};

window.addKeyPoint = function(highlightIndex) {
  if (!currentUpdate.highlights[highlightIndex]) return;
  currentUpdate.highlights[highlightIndex].keyPoints = currentUpdate.highlights[highlightIndex].keyPoints || [];
  if (currentUpdate.highlights[highlightIndex].keyPoints.length < 5) {
    currentUpdate.highlights[highlightIndex].keyPoints.push('');
    renderTab('content');
  }
};

window.removeKeyPoint = function(highlightIndex, keyPointIndex) {
  if (!currentUpdate.highlights[highlightIndex]) return;
  currentUpdate.highlights[highlightIndex].keyPoints.splice(keyPointIndex, 1);
  renderTab('content');
};

window.moveHighlight = function(index, direction) {
  if (direction === 'up' && index > 0) {
    [currentUpdate.highlights[index], currentUpdate.highlights[index - 1]] = 
    [currentUpdate.highlights[index - 1], currentUpdate.highlights[index]];
    renderStep(3);
  } else if (direction === 'down' && index < currentUpdate.highlights.length - 1) {
    [currentUpdate.highlights[index], currentUpdate.highlights[index + 1]] = 
    [currentUpdate.highlights[index + 1], currentUpdate.highlights[index]];
    renderStep(3);
  }
};

window.deleteHighlight = function(index) {
  if (confirm("Highlight wirklich löschen?")) {
    currentUpdate.highlights.splice(index, 1);
    if (currentHighlightIndex === index) {
      currentHighlightIndex = -1;
    } else if (currentHighlightIndex > index) {
      currentHighlightIndex--;
    }
    renderTab('content');
    updatePreview();
  }
};

window.uploadHighlightImage = function(index) {
  $(`#hlImageInput_${index}`).click();
};

window.handleHighlightImageUpload = function(index, event) {
  const file = event.target.files[0];
  if (!file) return;
  
  if (file.size > 10 * 1024 * 1024) {
    toast.error("Bild ist zu groß. Maximal 10MB.");
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    if (!currentUpdate.highlights[index]) return;
    currentUpdate.highlights[index].media = currentUpdate.highlights[index].media || { type: null, image: {}, embedUrl: null };
    currentUpdate.highlights[index].media.type = 'image';
    currentUpdate.highlights[index].media.image = currentUpdate.highlights[index].media.image || {};
    currentUpdate.highlights[index].media.image.url = e.target.result;
    currentUpdate.highlights[index].media.image.focalPoint = { x: 0.5, y: 0.5 };
    renderTab('content');
    updatePreview();
    
    // Initialize Rich Text Editor for deep dive if enabled
    setTimeout(() => {
      const deepDiveTextarea = $(`#hlDeepDive_${index}`);
      if (deepDiveTextarea && deepDiveTextarea.hasAttribute('data-rich-text')) {
        if (!richTextEditor.editors.has(`hlDeepDive_${index}`)) {
          richTextEditor.createEditor(deepDiveTextarea);
        }
      }
    }, 300);
  };
  reader.readAsDataURL(file);
};

// File attachment upload for highlights
window.uploadHighlightAttachment = function(index) {
  $(`#hlAttachmentInput_${index}`).click();
};

window.handleHighlightAttachmentUpload = function(index, event) {
  const file = event.target.files[0];
  if (!file) return;
  
  if (file.size > 50 * 1024 * 1024) {
    toast.error("Datei ist zu groß. Maximal 50MB.");
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    if (!currentUpdate.highlights[index]) return;
    
    currentUpdate.highlights[index].deepDive = currentUpdate.highlights[index].deepDive || { 
      enabled: false, 
      contentRichText: '', 
      attachments: [] 
    };
    
    const attachment = {
      id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      type: file.type,
      size: file.size,
      data: e.target.result, // Base64 encoded
      uploadedAt: new Date().toISOString()
    };
    
    currentUpdate.highlights[index].deepDive.attachments.push(attachment);
    renderTab('content');
    toast.success("Datei hinzugefügt");
  };
  reader.readAsDataURL(file);
  
  // Reset input
  event.target.value = '';
};

window.removeHighlightAttachment = function(highlightIndex, attachmentIndex) {
  if (!currentUpdate.highlights[highlightIndex]?.deepDive?.attachments) return;
  
  currentUpdate.highlights[highlightIndex].deepDive.attachments.splice(attachmentIndex, 1);
  renderTab('content');
  toast.success("Datei entfernt");
};

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

window.removeHighlightImage = function(index) {
  if (!currentUpdate.highlights[index]) return;
  currentUpdate.highlights[index].media = { type: null, image: {}, embedUrl: null };
  renderTab('content');
  updatePreview();
};

// Image Crop / Focal Point Functions
window.openImageCrop = function(index) {
  const indicator = $(`#hlFocalPoint_${index}`);
  if (indicator) {
    indicator.style.display = 'block';
    updateFocalPointPosition(index);
  }
};

window.handleImageMouseMove = function(index, event) {
  const container = $(`#hlImageContainer_${index}`);
  const indicator = $(`#hlFocalPoint_${index}`);
  if (!container || !indicator) return;
  
  const rect = container.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width);
  const y = ((event.clientY - rect.top) / rect.height);
  
  indicator.style.left = (x * 100) + '%';
  indicator.style.top = (y * 100) + '%';
  indicator.style.display = 'block';
};

window.setFocalPoint = function(index, event) {
  const container = $(`#hlImageContainer_${index}`);
  if (!container || !currentUpdate.highlights[index]) return;
  
  const rect = container.getBoundingClientRect();
  const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
  const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
  
  currentUpdate.highlights[index].media = currentUpdate.highlights[index].media || { type: null, image: {}, embedUrl: null };
  currentUpdate.highlights[index].media.image = currentUpdate.highlights[index].media.image || {};
  currentUpdate.highlights[index].media.image.focalPoint = { x, y };
  
  updateFocalPointPosition(index);
  updatePreview();
  toast.success("Fokuspunkt gesetzt");
};

window.updateFocalPointPosition = function(index) {
  const highlight = currentUpdate.highlights[index];
  if (!highlight?.media?.image?.focalPoint) return;
  
  const indicator = $(`#hlFocalPoint_${index}`);
  if (indicator) {
    indicator.style.left = (highlight.media.image.focalPoint.x * 100) + '%';
    indicator.style.top = (highlight.media.image.focalPoint.y * 100) + '%';
    indicator.style.display = 'block';
  }
};

window.hideFocalPointIndicator = function(index) {
  // Keep it visible, just don't update on mouse move
};

window.toggleHighlightParticipant = function(highlightIndex, participantId) {
  if (!currentUpdate.highlights[highlightIndex]) return;
  currentUpdate.highlights[highlightIndex].involvedParticipants = currentUpdate.highlights[highlightIndex].involvedParticipants || [];
  
  const index = currentUpdate.highlights[highlightIndex].involvedParticipants.indexOf(participantId);
  if (index >= 0) {
    currentUpdate.highlights[highlightIndex].involvedParticipants.splice(index, 1);
  } else {
    currentUpdate.highlights[highlightIndex].involvedParticipants.push(participantId);
  }
  
  // Update checkbox visually
  const checkbox = $(`#hlParticipant_${highlightIndex}_${participantId}`);
  if (checkbox) {
    checkbox.checked = index < 0; // checked if we added it
  }
  
  // Update background of parent div
  const parentDiv = checkbox?.closest('div');
  if (parentDiv) {
    if (index < 0) {
      parentDiv.style.background = 'var(--bg)';
    } else {
      parentDiv.style.background = '';
    }
  }
  
  updatePreview();
};

window.toggleDeepDive = function(index) {
  const enabled = $(`#hlDeepDiveEnabled_${index}`)?.checked || false;
  if (!currentUpdate.highlights[index]) return;
  
  currentUpdate.highlights[index].deepDive = currentUpdate.highlights[index].deepDive || { enabled: false, contentRichText: '', attachments: [] };
  currentUpdate.highlights[index].deepDive.enabled = enabled;
  
  renderTab('content');
  
  // Initialize Rich Text Editor if enabled
  if (enabled) {
    setTimeout(() => {
      const deepDiveTextarea = $(`#hlDeepDive_${index}`);
      if (deepDiveTextarea && deepDiveTextarea.hasAttribute('data-rich-text')) {
        if (!richTextEditor.editors.has(`hlDeepDive_${index}`)) {
          richTextEditor.createEditor(deepDiveTextarea);
        }
      }
    }, 300);
  }
};

function saveStep3Highlights() {
  if (currentHighlightIndex >= 0) {
    saveHighlightData(currentHighlightIndex);
  }
}

// ========== STEP 4: PARTICIPANTS ==========
function renderStep4() {
  const allMembers = api.listMembers();
  const selectedIds = (currentUpdate.participants || []).map(p => p.participantId);
  
  $("#stepContent").innerHTML = `
    <div style="max-width:700px">
      <div style="font-weight:700; font-size:20px; margin-bottom:24px">4. Teilnehmer</div>
      
      <div style="margin-bottom:16px">
        <input class="input" id="participantSearch" placeholder="Teilnehmer suchen..." style="margin-bottom:12px"/>
        <div style="display:flex; gap:8px; flex-wrap:wrap">
          <button class="btn small" onclick="filterParticipants('all')" data-filter="all">Alle</button>
          <button class="btn small" onclick="filterParticipants('selected')" data-filter="selected">Ausgewählt</button>
          <button class="btn small" onclick="filterParticipants('unselected')" data-filter="unselected">Nicht ausgewählt</button>
        </div>
      </div>
      
      <div id="participantsList" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap:12px; margin-bottom:24px">
        ${allMembers.map(member => {
          const isSelected = selectedIds.includes(member.id);
          return `
            <div class="card" style="padding:12px; cursor:pointer; ${isSelected ? 'border:2px solid var(--primary); background:var(--bg)' : ''}" onclick="toggleParticipant('${member.id}')">
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px">
                <input type="checkbox" id="participant_${member.id}" ${isSelected ? 'checked' : ''} onchange="toggleParticipant('${member.id}')" onclick="event.stopPropagation()"/>
                <div style="font-weight:600; font-size:14px">${member.name || member.email}</div>
              </div>
              <div style="font-size:12px; color:var(--text-secondary)">${member.email}</div>
            </div>
          `;
        }).join('')}
      </div>
      
      <div style="margin-top:32px; display:flex; gap:8px; justify-content:space-between">
        <button class="btn" onclick="goToStep(${currentStep - 1})">← Zurück</button>
        <button class="btn" onclick="goToStep(${currentStep + 1})">Weiter →</button>
      </div>
    </div>
  `;
  
  // Search functionality
  $("#participantSearch").addEventListener("input", (e) => {
    const search = e.target.value.toLowerCase();
    $$("#participantsList .card").forEach(card => {
      const text = card.textContent.toLowerCase();
      card.style.display = text.includes(search) ? '' : 'none';
    });
  });
}

window.toggleParticipant = function(participantId) {
  currentUpdate.participants = currentUpdate.participants || [];
  const index = currentUpdate.participants.findIndex(p => p.participantId === participantId);
  
  if (index >= 0) {
    currentUpdate.participants.splice(index, 1);
  } else {
    currentUpdate.participants.push(MonthlyUpdateModel.createParticipantRef(participantId));
  }
  
  // Update checkbox visually without re-rendering entire step
  const checkbox = $(`#participant_${participantId}`);
  if (checkbox) {
    checkbox.checked = index < 0;
  }
  
  // Update card styling
  const card = checkbox?.closest('.card');
  if (card) {
    if (index < 0) {
      card.style.border = '2px solid var(--primary)';
      card.style.background = 'var(--bg)';
    } else {
      card.style.border = '';
      card.style.background = '';
    }
  }
  
  updatePreview();
};

window.filterParticipants = function(filter) {
  $$("[data-filter]").forEach(btn => btn.classList.toggle("active", btn.dataset.filter === filter));
  
  const selectedIds = (currentUpdate.participants || []).map(p => p.participantId);
  
  $$("#participantsList .card").forEach(card => {
    const checkbox = card.querySelector("input[type='checkbox']");
    const isSelected = checkbox.checked;
    
    if (filter === 'all') {
      card.style.display = '';
    } else if (filter === 'selected') {
      card.style.display = isSelected ? '' : 'none';
    } else if (filter === 'unselected') {
      card.style.display = !isSelected ? '' : 'none';
    }
  });
};

function saveStep4Participants() {
  // Already saved via toggleParticipant
}

// ========== STEP 5: TAKEAWAYS & QUOTES ==========
function renderStep5() {
  const quotes = currentUpdate.quotes || [];
  const takeaways = currentUpdate.takeaways || [];
  
  $("#stepContent").innerHTML = `
    <div style="max-width:700px">
      <div style="font-weight:700; font-size:20px; margin-bottom:24px">5. Takeaways & Quotes</div>
      
      <div style="margin-bottom:32px">
        <div style="font-weight:600; margin-bottom:12px">Quotes (${quotes.length})</div>
        <div id="quotesList" style="display:flex; flex-direction:column; gap:12px; margin-bottom:16px">
          ${quotes.map((quote, idx) => `
            <div class="card" style="padding:16px">
              <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:12px">
                <div style="flex:1">
                  <textarea class="textarea" style="min-height:60px" placeholder="Zitat..." onchange="updateQuote(${idx}, 'text', this.value)">${quote.text || ''}</textarea>
                </div>
                <button class="btn danger small" onclick="removeQuote(${idx})">✕</button>
              </div>
              <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px">
                <input class="input" placeholder="Quelle (Name)" value="${quote.sourceName || ''}" onchange="updateQuote(${idx}, 'sourceName', this.value)"/>
                <input class="input" placeholder="Rolle" value="${quote.sourceRole || ''}" onchange="updateQuote(${idx}, 'sourceRole', this.value)"/>
              </div>
            </div>
          `).join('')}
        </div>
        <button class="btn" onclick="addQuote()">+ Quote hinzufügen</button>
      </div>
      
      <div>
        <div style="font-weight:600; margin-bottom:12px">Takeaways (${takeaways.length} / 5)</div>
        <div id="takeawaysList" style="display:flex; flex-direction:column; gap:12px; margin-bottom:16px">
          ${takeaways.map((tk, idx) => `
            <div class="card" style="padding:16px">
              <div style="display:flex; gap:8px; align-items:start">
                <div style="flex:1">
                  <input class="input" value="${tk.text || ''}" placeholder="Takeaway Text..." onchange="updateTakeaway(${idx}, 'text', this.value)"/>
                  <input class="input" style="margin-top:8px" value="${tk.tag || ''}" placeholder="Tag (optional)" onchange="updateTakeaway(${idx}, 'tag', this.value)"/>
                </div>
                <button class="btn danger small" onclick="removeTakeaway(${idx})">✕</button>
              </div>
            </div>
          `).join('')}
        </div>
        ${takeaways.length < 5 ? `
          <button class="btn" onclick="addTakeaway()">+ Takeaway hinzufügen</button>
        ` : '<div class="small" style="color:var(--text-secondary)">Maximum von 5 Takeaways erreicht</div>'}
      </div>
      
      <div style="margin-top:32px; display:flex; gap:8px; justify-content:space-between">
        <button class="btn" onclick="goToStep(${currentStep - 1})">← Zurück</button>
        <button class="btn" onclick="goToStep(${currentStep + 1})">Weiter →</button>
      </div>
    </div>
  `;
}

window.addQuote = function() {
  currentUpdate.quotes = currentUpdate.quotes || [];
  currentUpdate.quotes.push(MonthlyUpdateModel.createQuote('', '', ''));
  renderStep(5);
};

window.updateQuote = function(index, field, value) {
  if (!currentUpdate.quotes[index]) return;
  currentUpdate.quotes[index][field] = value;
  updatePreview();
};

window.removeQuote = function(index) {
  currentUpdate.quotes.splice(index, 1);
  renderStep(5);
  updatePreview();
};

window.addTakeaway = function() {
  currentUpdate.takeaways = currentUpdate.takeaways || [];
  if (currentUpdate.takeaways.length < 5) {
    currentUpdate.takeaways.push(MonthlyUpdateModel.createTakeaway('', ''));
    renderStep(5);
  }
};

window.updateTakeaway = function(index, field, value) {
  if (!currentUpdate.takeaways[index]) return;
  currentUpdate.takeaways[index][field] = value;
  updatePreview();
};

window.removeTakeaway = function(index) {
  currentUpdate.takeaways.splice(index, 1);
  renderStep(5);
  updatePreview();
};

function saveStep5Takeaways() {
  // Already saved via update functions
}

// ========== STEP 6: RESOURCES & NEXT EVENT ==========
function renderStep6() {
  const resources = currentUpdate.resources || [];
  const nextEvent = currentUpdate.nextEvent || {};
  
  $("#stepContent").innerHTML = `
    <div style="max-width:700px">
      <div style="font-weight:700; font-size:20px; margin-bottom:24px">6. Resources & Next Event</div>
      
      <div style="margin-bottom:32px">
        <div style="font-weight:600; margin-bottom:12px">Resources</div>
        <div id="resourcesList" style="display:flex; flex-direction:column; gap:12px; margin-bottom:16px">
          ${resources.map((res, idx) => `
            <div class="card" style="padding:16px">
              <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:12px">
                <div style="flex:1; display:grid; grid-template-columns: 1fr 1fr; gap:8px">
                  <input class="input" value="${res.title || ''}" placeholder="Titel" onchange="updateResource(${idx}, 'title', this.value)"/>
                  <select class="input" onchange="updateResource(${idx}, 'type', this.value)">
                    <option value="article" ${res.type === 'article' ? 'selected' : ''}>Artikel</option>
                    <option value="tool" ${res.type === 'tool' ? 'selected' : ''}>Tool</option>
                    <option value="book" ${res.type === 'book' ? 'selected' : ''}>Buch</option>
                    <option value="project" ${res.type === 'project' ? 'selected' : ''}>Projekt</option>
                    <option value="video" ${res.type === 'video' ? 'selected' : ''}>Video</option>
                  </select>
                </div>
                <button class="btn danger small" onclick="removeResource(${idx})">✕</button>
              </div>
              <input class="input" style="margin-bottom:8px" value="${res.url || ''}" placeholder="URL" onchange="updateResource(${idx}, 'url', this.value)"/>
              <input class="input" value="${res.note || ''}" placeholder="Notiz (optional)" onchange="updateResource(${idx}, 'note', this.value)"/>
            </div>
          `).join('')}
        </div>
        <button class="btn" onclick="addResource()">+ Resource hinzufügen</button>
      </div>
      
      <div>
        <div style="font-weight:600; margin-bottom:12px">Nächstes Event</div>
        <div class="card" style="padding:16px">
          <label class="label">Datum</label>
          <input class="input" type="date" id="nextEventDate" value="${nextEvent.date || ''}"/>
          
          <label class="label" style="margin-top:12px">Thema</label>
          <input class="input" id="nextEventTopic" value="${nextEvent.topic || ''}" placeholder="Thema des nächsten Events"/>
          
          <label class="label" style="margin-top:12px">CTA Label</label>
          <input class="input" id="nextEventLabel" value="${nextEvent.ctaLabel || ''}" placeholder="z.B. 'Jetzt anmelden'"/>
          
          <label class="label" style="margin-top:12px">CTA URL</label>
          <input class="input" id="nextEventUrl" value="${nextEvent.ctaUrl || ''}" placeholder="https://..."/>
        </div>
      </div>
      
      <div style="margin-top:32px; display:flex; gap:8px; justify-content:space-between">
        <button class="btn" onclick="goToStep(${currentStep - 1})">← Zurück</button>
        <button class="btn" onclick="goToStep(${currentStep + 1})">Weiter →</button>
      </div>
    </div>
  `;
}

window.addResource = function() {
  currentUpdate.resources = currentUpdate.resources || [];
  currentUpdate.resources.push(MonthlyUpdateModel.createResourceLink('', '', 'article', ''));
  renderStep(6);
};

window.updateResource = function(index, field, value) {
  if (!currentUpdate.resources[index]) return;
  currentUpdate.resources[index][field] = value;
  updatePreview();
};

window.removeResource = function(index) {
  currentUpdate.resources.splice(index, 1);
  renderStep(6);
  updatePreview();
};

function saveStep6Resources() {
  currentUpdate.nextEvent = {
    date: $("#nextEventDate").value,
    topic: $("#nextEventTopic").value.trim(),
    ctaLabel: $("#nextEventLabel").value.trim(),
    ctaUrl: $("#nextEventUrl").value.trim()
  };
}

// ========== STEP 7: SEO & PUBLISH ==========
function renderStep7() {
  const seo = currentUpdate.seo || {};
  
  $("#stepContent").innerHTML = `
    <div style="max-width:700px">
      <div style="font-weight:700; font-size:20px; margin-bottom:24px">7. SEO & Veröffentlichung</div>
      
      <div style="margin-bottom:32px">
        <div style="font-weight:600; margin-bottom:12px">SEO-Einstellungen</div>
        <div class="card" style="padding:16px">
          <label class="label">Meta Title</label>
          <input class="input" id="seoTitle" value="${seo.metaTitle || ''}" placeholder="${currentUpdate.title || 'Titel'}"/>
          <div class="small" style="color:var(--text-secondary); margin-top:4px">Wird für Suchmaschinen verwendet</div>
          
          <label class="label" style="margin-top:12px">Meta Description</label>
          <textarea class="textarea" id="seoDescription" style="min-height:80px" placeholder="Kurze Beschreibung für Suchmaschinen...">${seo.metaDescription || ''}</textarea>
          <div class="small" style="color:var(--text-secondary); margin-top:4px">
            <span id="seoDescCount">${seo.metaDescription?.length || 0}</span> / 160 Zeichen (empfohlen)
          </div>
          
          <label class="label" style="margin-top:12px">OG Image URL</label>
          <input class="input" id="seoOgImage" value="${seo.ogImage || ''}" placeholder="URL für Social Media Vorschau"/>
          <div class="small" style="color:var(--text-secondary); margin-top:4px">Falls leer, wird Hero-Bild verwendet</div>
        </div>
      </div>
      
      <div style="margin-bottom:32px">
        <div style="font-weight:600; margin-bottom:12px">Checkliste vor Veröffentlichung</div>
        <div class="card" style="padding:16px">
          <div id="checklist">
            ${renderChecklist()}
          </div>
        </div>
      </div>
      
      <div style="margin-top:32px; display:flex; gap:8px; justify-content:space-between">
        <button class="btn" onclick="goToStep(${currentStep - 1})">← Zurück</button>
        <button class="btn primary" onclick="publishUpdate()">📢 Veröffentlichen</button>
      </div>
    </div>
  `;
  
  // Character counter
  const desc = $("#seoDescription");
  const counter = $("#seoDescCount");
  desc.addEventListener("input", () => {
    counter.textContent = desc.value.length;
    counter.style.color = desc.value.length > 160 ? "var(--warning)" : "var(--text-secondary)";
  });
}

function renderChecklist() {
  const checks = [];
  
  // Hero image alt text
  if (currentUpdate.heroImage?.url && !currentUpdate.heroImage?.alt) {
    checks.push({ text: "Hero-Bild Alt-Text fehlt", valid: false });
  } else if (currentUpdate.heroImage?.url) {
    checks.push({ text: "Hero-Bild Alt-Text vorhanden", valid: true });
  }
  
  // Highlights
  if (!currentUpdate.highlights || currentUpdate.highlights.length === 0) {
    checks.push({ text: "Keine Highlights vorhanden", valid: false });
  } else {
    checks.push({ text: `${currentUpdate.highlights.length} Highlight(s) vorhanden`, valid: true });
    
    // Check highlight images
    const highlightsWithoutAlt = currentUpdate.highlights.filter(hl => 
      hl.media?.image?.url && !hl.media?.image?.alt
    );
    if (highlightsWithoutAlt.length > 0) {
      checks.push({ text: `${highlightsWithoutAlt.length} Highlight-Bild(er) ohne Alt-Text`, valid: false });
    }
  }
  
  // Takeaways
  if (!currentUpdate.takeaways || currentUpdate.takeaways.length === 0) {
    checks.push({ text: "Keine Takeaways vorhanden", valid: false });
  } else {
    checks.push({ text: `${currentUpdate.takeaways.length} Takeaway(s) vorhanden`, valid: true });
  }
  
  // OG Image
  if (!currentUpdate.seo?.ogImage && !currentUpdate.heroImage?.url) {
    checks.push({ text: "OG Image fehlt", valid: false });
  } else {
    checks.push({ text: "OG Image vorhanden", valid: true });
  }
  
  return checks.map(check => `
    <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px">
      <span style="font-size:18px">${check.valid ? '✅' : '❌'}</span>
      <span style="${check.valid ? '' : 'color:var(--danger)'}">${check.text}</span>
    </div>
  `).join('');
}

function saveStep7SEO() {
  currentUpdate.seo = {
    metaTitle: $("#seoTitle").value.trim() || currentUpdate.title,
    metaDescription: $("#seoDescription").value.trim(),
    ogImage: $("#seoOgImage").value.trim() || currentUpdate.heroImage?.url
  };
}

// ========== RENDER STEP ==========
// Legacy function for compatibility - redirects to tabs
function renderStep(step) {
  // Map old steps to new tabs
  if (step <= 2) {
    switchTab('basics');
  } else if (step <= 6) {
    switchTab('content');
  } else if (step === 4) {
    switchTab('participants');
  } else {
    switchTab('publish');
  }
}

// ========== LIVE PREVIEW ==========
function updatePreview() {
  if (!currentUpdate) return;
  
  const device = $("[data-device].active")?.dataset.device || "desktop";
  const previewWidth = device === "mobile" ? "375px" : device === "tablet" ? "768px" : "100%";
  
  const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 
                     'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  const [year, monthNum] = (currentUpdate.issueDate || '').split('-');
  const monthName = monthNames[parseInt(monthNum) - 1] || monthNum;
  
  let previewHTML = `
    <div style="max-width:${previewWidth}; margin:0 auto; background:white; border-radius:8px; overflow:hidden">
      <!-- Hero -->
      ${currentUpdate.heroImage?.url ? `
        <div style="position:relative">
          <img src="${currentUpdate.heroImage.url}" alt="${currentUpdate.heroImage.alt || ''}" style="width:100%; height:300px; object-fit:cover"/>
          <div style="position:absolute; bottom:0; left:0; right:0; background:linear-gradient(transparent, rgba(0,0,0,0.7)); padding:24px; color:white">
            <div style="font-size:12px; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px">Monatsupdate · Innovationsabend</div>
            <div style="font-weight:900; font-size:32px; margin-bottom:4px">${currentUpdate.title || 'Titel'}</div>
            ${currentUpdate.subtitle ? `<div style="font-size:18px; opacity:0.9">${currentUpdate.subtitle}</div>` : ''}
            <div style="margin-top:12px; font-size:14px">${monthName} ${year}</div>
          </div>
        </div>
      ` : `
        <div style="background:var(--bg); padding:60px 24px; text-align:center">
          <div style="font-size:12px; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; color:var(--text-secondary)">Monatsupdate · Innovationsabend</div>
          <div style="font-weight:900; font-size:32px; margin-bottom:4px">${currentUpdate.title || 'Titel'}</div>
          <div style="font-size:14px; color:var(--text-secondary)">${monthName} ${year}</div>
        </div>
      `}
      
      <!-- Stats -->
      <div style="padding:16px; background:var(--bg); border-bottom:1px solid var(--border); display:flex; gap:24px; font-size:14px">
        <div><strong>${currentUpdate.stats?.attendeesCount || 0}</strong> Teilnehmer</div>
        <div><strong>${currentUpdate.stats?.highlightsCount || 0}</strong> Highlights</div>
        ${currentUpdate.durationMin ? `<div><strong>${currentUpdate.durationMin}</strong> Min</div>` : ''}
      </div>
      
      <!-- Editorial -->
      ${currentUpdate.editorialText ? `
        <div style="padding:32px 24px; line-height:1.8; font-size:16px; color:var(--text-secondary)">
          ${currentUpdate.editorialText}
        </div>
      ` : ''}
      
      <!-- Highlights -->
      ${(currentUpdate.highlights || []).length > 0 ? `
        <div style="padding:32px 24px">
          <div style="font-weight:900; font-size:24px; margin-bottom:24px">Highlights</div>
          <div style="display:grid; gap:32px">
            ${currentUpdate.highlights.map(hl => `
              <div style="border-left:4px solid var(--primary); padding-left:20px">
                <div style="font-weight:700; font-size:20px; margin-bottom:12px; color:var(--primary)">${hl.title || 'Unbenannt'}</div>
                ${hl.media?.image?.url ? `
                  <img src="${hl.media.image.url}" alt="${hl.media.image.alt || ''}" style="width:100%; max-height:200px; object-fit:cover; border-radius:8px; margin-bottom:12px"/>
                ` : ''}
                ${hl.shortSummary ? `<div style="line-height:1.7; margin-bottom:12px">${hl.shortSummary}</div>` : ''}
                ${(hl.keyPoints || []).length > 0 ? `
                  <ul style="margin:12px 0; padding-left:20px">
                    ${hl.keyPoints.map(kp => `<li style="margin-bottom:8px">${kp}</li>`).join('')}
                  </ul>
                ` : ''}
                ${(hl.categoryTags || []).length > 0 ? `
                  <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:12px">
                    ${hl.categoryTags.map(tag => `<span style="padding:4px 12px; background:var(--bg); border-radius:16px; font-size:12px">${tag}</span>`).join('')}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
      
      <!-- Participants -->
      ${(currentUpdate.participants || []).length > 0 ? `
        <div style="padding:32px 24px; background:var(--bg)">
          <div style="font-weight:900; font-size:24px; margin-bottom:24px">Wer war dabei</div>
          <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap:16px">
            ${currentUpdate.participants.map(p => {
              const member = api.listMembers().find(m => m.id === p.participantId);
              if (!member) return '';
              return `
                <div style="text-align:center">
                  <div style="width:60px; height:60px; border-radius:50%; background:var(--primary); margin:0 auto 8px; display:flex; align-items:center; justify-content:center; color:white; font-weight:600">
                    ${(member.name || member.email).charAt(0).toUpperCase()}
                  </div>
                  <div style="font-size:12px; font-weight:600">${member.name || member.email}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}
      
      <!-- Takeaways -->
      ${(currentUpdate.takeaways || []).length > 0 ? `
        <div style="padding:32px 24px">
          <div style="font-weight:900; font-size:24px; margin-bottom:24px">Was wir mitnehmen</div>
          <div style="display:grid; gap:12px">
            ${currentUpdate.takeaways.map(tk => `
              <div style="padding:16px; background:var(--bg); border-radius:8px; border-left:4px solid var(--accent)">
                <div style="font-weight:600; margin-bottom:4px">${tk.text || ''}</div>
                ${tk.tag ? `<div style="font-size:12px; color:var(--text-secondary)">${tk.tag}</div>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
      
      <!-- Next Event -->
      ${currentUpdate.nextEvent?.date ? `
        <div style="padding:32px 24px; background:var(--primary); color:white; text-align:center">
          <div style="font-weight:700; font-size:20px; margin-bottom:8px">Nächstes Event</div>
          <div style="font-size:18px; margin-bottom:16px">${currentUpdate.nextEvent.topic || ''}</div>
          ${currentUpdate.nextEvent.ctaUrl ? `
            <a href="${currentUpdate.nextEvent.ctaUrl}" style="display:inline-block; padding:12px 24px; background:white; color:var(--primary); border-radius:6px; text-decoration:none; font-weight:600">
              ${currentUpdate.nextEvent.ctaLabel || 'Jetzt anmelden'}
            </a>
          ` : ''}
        </div>
      ` : ''}
    </div>
  `;
  
  $("#livePreview").innerHTML = previewHTML;
}

function setupDeviceToggle() {
  $$("[data-device]").forEach(btn => {
    btn.addEventListener("click", () => {
      $$("[data-device]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      updatePreview();
    });
  });
}

// Utility functions
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Make functions globally available
window.goToStep = goToStep;

