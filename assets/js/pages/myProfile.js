import { api } from '../services/apiClient.js';
import { avatarGenerator } from '../components/avatarGenerator.js';
import { toast } from '../components/toast.js';
import { parseTags } from '../utils.js';

const $ = s => document.querySelector(s);

/**
 * Renders the profile progress indicator.
 */
export function renderProfileProgress() {
  const container = $('#profileProgress');
  if (!container) {
    return;
  }

  const u = api.me();
  // Edge case: User not logged in or missing email
  if (!u || !u.email) {
    container.innerHTML = '<div class="p">Bitte melden Sie sich an, um Ihr Profil zu sehen.</div>';
    return;
  }

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
        ${checks
    .map(
      c => `
          <div class="profile-progress-item ${c.value && c.value !== '' ? 'completed' : ''}">
            <span class="profile-progress-icon">${c.value && c.value !== '' ? '✓' : '○'}</span>
            <span class="profile-progress-label">${c.label}</span>
          </div>
        `
    )
    .join('')}
      </div>
      ${
  missingFields.length > 0
    ? `
        <div class="profile-progress-actions">
          <p class="small text-muted">Vervollständigen Sie Ihr Profil für bessere Sichtbarkeit im Netzwerk:</p>
          ${missingFields
    .map(
      f => `
            <button class="btn ghost small" onclick="document.getElementById('${f.field}')?.focus()">
              ${f.label} hinzufügen
            </button>
          `
    )
    .join('')}
        </div>
      `
    : ''
}
    </div>
  `;
}

/**
 * Collect all unique skills and interests from all profiles
 * @param {string} type - 'skills' or 'interests'
 * @returns {string[]} Array of unique tags
 */
export function getAllAvailableTags(type = 'skills') {
  const allMembers = api.listMembers('');
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

/**
 * Renders the my profile page.
 */
export function renderMyProfile() {
  const u = api.me();
  const p = api.getProfileByEmail(u.email);

  // Render profile progress
  renderProfileProgress();

  $('#pHeadline').value = p.headline || '';
  $('#pLoc').value = p.location || '';
  $('#pBio').value = p.bio || '';
  $('#pSkills').value = (p.skills || []).join(', ');
  $('#pInterests').value = (p.interests || []).join(', ');
  $('#pOffer').value = p.offer || '';
  $('#pSeek').value = p.lookingFor || '';
  $('#pLi').value = p.links?.linkedin || '';
  $('#pWeb').value = p.links?.website || '';
  $('#pVis').checked = !!p.privacy?.visibleInDirectory;
  $('#pDM').checked = !!p.privacy?.allowDM;

  // Add dropdowns for Skills and Interests - direkt unter dem Input-Feld
  const skillsInput = $('#pSkills');
  const interestsInput = $('#pInterests');

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
    skillsDropdownBtn.style.cssText =
      'width:100%; text-align:left; background:var(--surface); border:1px solid var(--border); color:var(--text-primary); font-weight:500;';

    const skillsDropdownMenu = document.createElement('div');
    skillsDropdownMenu.className = 'tag-dropdown-menu';
    skillsDropdownMenu.id = 'skillsDropdownMenu';
    skillsDropdownMenu.style.cssText =
      'display:none; position:absolute; top:100%; left:0; right:0; background:var(--bg); border:1px solid var(--border); border-radius:6px; max-height:200px; overflow-y:auto; z-index:100; margin-top:4px; box-shadow:0 4px 12px rgba(0,0,0,0.1);';

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
          const currentValue = $('#pSkills').value.trim();
          const currentTags = parseTags(currentValue);
          if (!currentTags.includes(skill)) {
            const newValue = currentValue ? `${currentValue}, ${skill}` : skill;
            $('#pSkills').value = newValue;
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

    skillsDropdownBtn.addEventListener('click', e => {
      e.stopPropagation();
      const isVisible = skillsDropdownMenu.style.display === 'block';
      skillsDropdownMenu.style.display = isVisible ? 'none' : 'block';
    });

    skillsDropdown.appendChild(skillsDropdownBtn);
    skillsDropdown.appendChild(skillsDropdownMenu);
    // Direkt nach dem Input-Feld einfügen
    skillsInput.parentElement.insertBefore(skillsDropdown, skillsInput.nextSibling);

    // Close dropdown when clicking outside
    document.addEventListener('click', e => {
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
    interestsDropdownBtn.style.cssText =
      'width:100%; text-align:left; background:var(--surface); border:1px solid var(--border); color:var(--text-primary); font-weight:500;';

    const interestsDropdownMenu = document.createElement('div');
    interestsDropdownMenu.className = 'tag-dropdown-menu';
    interestsDropdownMenu.id = 'interestsDropdownMenu';
    interestsDropdownMenu.style.cssText =
      'display:none; position:absolute; top:100%; left:0; right:0; background:var(--bg); border:1px solid var(--border); border-radius:6px; max-height:200px; overflow-y:auto; z-index:100; margin-top:4px; box-shadow:0 4px 12px rgba(0,0,0,0.1);';

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
          const currentValue = $('#pInterests').value.trim();
          const currentTags = parseTags(currentValue);
          if (!currentTags.includes(interest)) {
            const newValue = currentValue ? `${currentValue}, ${interest}` : interest;
            $('#pInterests').value = newValue;
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

    interestsDropdownBtn.addEventListener('click', e => {
      e.stopPropagation();
      const isVisible = interestsDropdownMenu.style.display === 'block';
      interestsDropdownMenu.style.display = isVisible ? 'none' : 'block';
    });

    interestsDropdown.appendChild(interestsDropdownBtn);
    interestsDropdown.appendChild(interestsDropdownMenu);
    // Direkt nach dem Input-Feld einfügen
    interestsInput.parentElement.insertBefore(interestsDropdown, interestsInput.nextSibling);

    // Close dropdown when clicking outside
    document.addEventListener('click', e => {
      if (!interestsDropdown.contains(e.target)) {
        interestsDropdownMenu.style.display = 'none';
      }
    });
  }

  // Avatar selector
  const avatarSelector = $('#avatarSelector');
  if (avatarSelector) {
    // Create file input for upload
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    let uploadedImage = p.avatarImage || null;
    window.currentUploadedImage = uploadedImage;

    fileInput.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) {
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Bild ist zu groß. Maximal 5MB erlaubt.');
        return;
      }

      const reader = new FileReader();
      reader.onload = event => {
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
        avatarSelector
          .querySelectorAll('.avatar-option')
          .forEach(o => o.classList.remove('selected'));
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
          ${
  p.avatarType === 'upload' && p.avatarImage
    ? `<img src="${p.avatarImage}" alt="Upload" style="width:100%;height:100%;object-fit:cover;"/>`
    : '<span style="font-size:24px;">📷</span>'
}
        </div>
        <div style="text-align:center;margin-top:8px;font-size:12px;">Eigenes Bild</div>
      </div>
      ${avatarGenerator.iconAvatars
    .map(
      icon => `
        <div class="avatar-option ${p.avatarType === 'icon' && p.avatarId === icon.id ? 'selected' : ''}" 
             data-avatar-type="icon" data-avatar-id="${icon.id}">
          <div style="width:64px;height:64px;margin:0 auto;">${avatarGenerator.generateIconAvatar(icon.id, 64)}</div>
          <div style="text-align:center;margin-top:8px;font-size:12px;">${icon.name}</div>
        </div>
      `
    )
    .join('')}
    `;

    avatarSelector.querySelectorAll('.avatar-option').forEach(opt => {
      opt.addEventListener('click', () => {
        if (opt.dataset.avatarType === 'upload') {
          fileInput.click();
        } else {
          avatarSelector
            .querySelectorAll('.avatar-option')
            .forEach(o => o.classList.remove('selected'));
          opt.classList.add('selected');
          uploadedImage = null; // Clear uploaded image when selecting other option
          window.currentUploadedImage = null;
        }
      });
    });
  }

  const saveProfileHandler = () => {
    const selectedAvatar = avatarSelector?.querySelector('.avatar-option.selected');
    const avatarType = selectedAvatar?.dataset.avatarType || 'initials';
    const avatarId = selectedAvatar?.dataset.avatarId || '';
    // Only include avatarImage if upload type is selected and image exists
    const avatarImage =
      avatarType === 'upload' && window.currentUploadedImage
        ? window.currentUploadedImage
        : avatarType === 'upload' && p.avatarImage
          ? p.avatarImage
          : avatarType !== 'upload'
            ? null
            : null;

    $('#pErr').textContent = '';
    $('#pOk').textContent = '';
    const profileData = {
      headline: $('#pHeadline').value.trim(),
      location: $('#pLoc').value.trim(),
      bio: $('#pBio').value.trim(),
      skills: parseTags($('#pSkills').value),
      interests: parseTags($('#pInterests').value),
      offer: $('#pOffer').value.trim(),
      lookingFor: $('#pSeek').value.trim(),
      links: { linkedin: $('#pLi').value.trim(), website: $('#pWeb').value.trim() },
      privacy: { visibleInDirectory: $('#pVis').checked, allowDM: $('#pDM').checked },
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
    if (!res.ok) {
      $('#pErr').textContent = res.error;
      return;
    }
    // Success Modal anzeigen
    import('../components/successModal.js').then(module => {
      module.showSuccessModal(
        'Ihr Profil wurde erfolgreich gespeichert.',
        'Erfolgreich gespeichert'
      );
    });
    // Update progress after save
    setTimeout(() => renderProfileProgress(), 100);
  };

  $('#saveProfile').addEventListener('click', saveProfileHandler);
  $('#saveProfileTop')?.addEventListener('click', saveProfileHandler);
}
