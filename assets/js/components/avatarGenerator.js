// Avatar Generator Component
export const avatarGenerator = {
  // 20 predefined icon avatars (SVG paths for construction/architecture/tech themes)
  iconAvatars: [
    { id: 'building', name: 'Gebäude', path: 'M3 21h18M5 21V7l8-4v18M19 21V11l-6-4' },
    { id: 'hammer', name: 'Hammer', path: 'M15 2a1 1 0 0 0-1 1v5h-2V3a1 1 0 0 0-2 0v5H6a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h4v7a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-7h4a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-4V3a1 1 0 0 0-1-1z' },
    { id: 'ruler', name: 'Lineal', path: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z' },
    { id: 'blueprint', name: 'Bauplan', path: 'M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z' },
    { id: 'wrench', name: 'Schraubenschlüssel', path: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z' },
    { id: 'layers', name: 'Ebenen', path: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
    { id: 'box', name: 'Box', path: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z' },
    { id: 'grid', name: 'Raster', path: 'M3 3h8v8H3zM14 3h8v8h-8zM14 14h8v8h-8zM3 14h8v8H3z' },
    { id: 'code', name: 'Code', path: 'M16 18l6-6-6-6M8 6l-6 6 6 6' },
    { id: 'cpu', name: 'CPU', path: 'M9 2v2M15 2v2M9 18v2M15 18v2M5 12H2M22 12h-3M6 12h.01M18 12h.01M7.8 7.8l-.71-.71M16.2 7.8l.71-.71M7.8 16.2l-.71.71M16.2 16.2l.71.71M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z' },
    { id: 'database', name: 'Datenbank', path: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z' },
    { id: 'zap', name: 'Blitz', path: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z' },
    { id: 'target', name: 'Ziel', path: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
    { id: 'compass', name: 'Kompass', path: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
    { id: 'lightbulb', name: 'Glühbirne', path: 'M9 21h6M12 3a6 6 0 0 0 6 6c0 4-3 6-3 6H9s-3-2-3-6a6 6 0 0 1 6-6zM12 9v6' },
    { id: 'rocket', name: 'Rakete', path: 'M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09zM12 15l-3-3a22.74 22.74 0 0 1 2-3.95A12.89 12.89 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.9 22.9 0 0 1-4 2z' },
    { id: 'shield', name: 'Schild', path: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
    { id: 'star', name: 'Stern', path: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
    { id: 'trending-up', name: 'Trend', path: 'M23 6l-9.5 9.5-5-5L1 18' },
    { id: 'users', name: 'Team', path: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' }
  ],
  
  generateInitials(name) {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  },
  
  generateInitialsAvatar(name, size = 48) {
    const initials = this.generateInitials(name);
    const colors = [
      { bg: '#6366F1', text: '#FFFFFF' },
      { bg: '#06B6D4', text: '#FFFFFF' },
      { bg: '#8B5CF6', text: '#FFFFFF' },
      { bg: '#10B981', text: '#FFFFFF' },
      { bg: '#F59E0B', text: '#FFFFFF' },
      { bg: '#EF4444', text: '#FFFFFF' }
    ];
    const colorIndex = initials.charCodeAt(0) % colors.length;
    const color = colors[colorIndex];
    
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="${color.bg}" rx="${size/2}"/>
      <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" 
            font-family="Inter, sans-serif" font-size="${size * 0.4}" font-weight="600" fill="${color.text}">${initials}</text>
    </svg>`;
  },
  
  generateIconAvatar(iconId, size = 48) {
    const icon = this.iconAvatars.find(i => i.id === iconId);
    if (!icon) return this.generateInitialsAvatar('?', size);
    
    const colors = [
      { bg: '#6366F1', stroke: '#FFFFFF' },
      { bg: '#06B6D4', stroke: '#FFFFFF' },
      { bg: '#8B5CF6', stroke: '#FFFFFF' }
    ];
    const colorIndex = iconId.charCodeAt(0) % colors.length;
    const color = colors[colorIndex];
    
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" fill="${color.bg}" rx="12"/>
      <path d="${icon.path}" stroke="${color.stroke}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  },
  
  getAvatar(user) {
    if (!user) return this.generateInitialsAvatar('?');
    
    if (user.avatarType === 'icon' && user.avatarId) {
      return this.generateIconAvatar(user.avatarId);
    }
    
    return this.generateInitialsAvatar(user.name || user.email || '?');
  },
  
  renderAvatar(user, size = 48) {
    const avatar = this.getAvatar(user);
    return `<div class="avatar" style="width:${size}px;height:${size}px;border-radius:50%;overflow:hidden;display:inline-block;flex-shrink:0;">${avatar}</div>`;
  }
};


