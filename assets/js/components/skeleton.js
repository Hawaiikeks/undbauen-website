// Skeleton Screen Component
export const skeleton = {
  // Generate skeleton for thread list
  threadList(count = 3) {
    return Array(count).fill(0).map(() => `
      <div class="skeleton-card" style="margin-bottom:12px">
        <div style="display:flex; gap:12px">
          <div class="skeleton-avatar"></div>
          <div style="flex:1">
            <div class="skeleton-line" style="width:60%; margin-bottom:8px"></div>
            <div class="skeleton-line" style="width:80%"></div>
          </div>
        </div>
      </div>
    `).join('');
  },
  
  // Generate skeleton for forum thread list
  forumThreadList(count = 5) {
    return Array(count).fill(0).map(() => `
      <div class="skeleton-card" style="margin-bottom:12px; padding:16px">
        <div class="skeleton-line" style="width:70%; height:18px; margin-bottom:12px"></div>
        <div class="skeleton-line" style="width:50%; height:14px"></div>
      </div>
    `).join('');
  },
  
  // Generate skeleton for message list
  messageList(count = 4) {
    return Array(count).fill(0).map(() => `
      <div class="skeleton-card" style="margin-bottom:10px">
        <div style="display:flex; justify-content:space-between; margin-bottom:8px">
          <div class="skeleton-line" style="width:120px; height:16px"></div>
          <div class="skeleton-line" style="width:60px; height:14px"></div>
        </div>
        <div class="skeleton-line" style="width:90%"></div>
      </div>
    `).join('');
  },
  
  // Generate skeleton for member grid
  memberGrid(count = 6) {
    return Array(count).fill(0).map(() => `
      <div class="skeleton-card">
        <div class="skeleton-avatar" style="width:64px; height:64px; margin:0 auto 12px"></div>
        <div class="skeleton-line" style="width:70%; margin:0 auto 8px"></div>
        <div class="skeleton-line short" style="width:50%; margin:0 auto"></div>
      </div>
    `).join('');
  },
  
  // Generate skeleton for event grid
  eventGrid(count = 3) {
    return Array(count).fill(0).map(() => `
      <div class="skeleton-card">
        <div class="skeleton" style="width:100%; height:150px; margin-bottom:12px; border-radius:var(--radius)"></div>
        <div class="skeleton-line" style="width:80%; margin-bottom:8px"></div>
        <div class="skeleton-line" style="width:60%"></div>
      </div>
    `).join('');
  }
};

