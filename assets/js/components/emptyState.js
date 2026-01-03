// Empty State Component
export const emptyState = {
  // Forum: No threads
  noThreads(message = "Noch keine Threads in dieser Kategorie.") {
    return `
      <div style="text-align:center; padding:48px 24px; color:var(--text-secondary)">
        <div style="font-size:64px; margin-bottom:16px; opacity:0.5">💬</div>
        <div style="font-size:18px; font-weight:600; margin-bottom:8px; color:var(--text-primary)">${message}</div>
        <div style="font-size:14px; margin-bottom:24px">Erstelle den ersten Thread und starte eine Diskussion!</div>
        <button class="btn primary" id="emptyStateNewThread">Neuen Thread erstellen</button>
      </div>
    `;
  },
  
  // Messages: No messages
  noMessages(message = "Noch keine Nachrichten.") {
    return `
      <div style="text-align:center; padding:48px 24px; color:var(--text-secondary)">
        <div style="font-size:64px; margin-bottom:16px; opacity:0.5">📬</div>
        <div style="font-size:18px; font-weight:600; margin-bottom:8px; color:var(--text-primary)">${message}</div>
        <div style="font-size:14px; margin-bottom:24px">Starte eine Unterhaltung mit einem Mitglied!</div>
        <a href="neue-nachricht.html" class="btn primary">Neue Nachricht</a>
      </div>
    `;
  },
  
  // Members: No members
  noMembers(message = "Noch keine Mitglieder gefunden.") {
    return `
      <div style="text-align:center; padding:48px 24px; color:var(--text-secondary)">
        <div style="font-size:64px; margin-bottom:16px; opacity:0.5">👥</div>
        <div style="font-size:18px; font-weight:600; margin-bottom:8px; color:var(--text-primary)">${message}</div>
        <div style="font-size:14px">Versuche andere Suchbegriffe oder Filter.</div>
      </div>
    `;
  },
  
  // Events: No events
  noEvents(message = "Keine Termine verfügbar.") {
    return `
      <div style="text-align:center; padding:48px 24px; color:var(--text-secondary)">
        <div style="font-size:64px; margin-bottom:16px; opacity:0.5">📅</div>
        <div style="font-size:18px; font-weight:600; margin-bottom:8px; color:var(--text-primary)">${message}</div>
        <div style="font-size:14px">Neue Termine werden hier angezeigt, sobald sie verfügbar sind.</div>
      </div>
    `;
  },
  
  // Generic empty state
  generic(icon = "📭", title = "Keine Einträge", description = "", action = null) {
    return `
      <div style="text-align:center; padding:48px 24px; color:var(--text-secondary)">
        <div style="font-size:64px; margin-bottom:16px; opacity:0.5">${icon}</div>
        <div style="font-size:18px; font-weight:600; margin-bottom:8px; color:var(--text-primary)">${title}</div>
        ${description ? `<div style="font-size:14px; margin-bottom:24px">${description}</div>` : ''}
        ${action || ''}
      </div>
    `;
  }
};










