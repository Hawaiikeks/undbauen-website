// Message Features: Reactions, Typing Indicators, etc.
export const messageFeatures = {
  // Toggle reaction on message
  toggleReaction(msgId, emoji, threadId) {
    if (!window.api) return;
    
    const messages = window.api.getMessages(threadId);
    const message = messages.find(m => m.id === msgId);
    if (!message) return;
    
    if (!message.reactions) message.reactions = {};
    if (!message.reactions[emoji]) message.reactions[emoji] = [];
    
    const userEmail = window.api.me()?.email;
    const index = message.reactions[emoji].indexOf(userEmail);
    
    if (index > -1) {
      message.reactions[emoji].splice(index, 1);
      if (message.reactions[emoji].length === 0) {
        delete message.reactions[emoji];
      }
    } else {
      message.reactions[emoji].push(userEmail);
    }
    
    // Save updated messages
    window.api.setMessages(threadId, messages);
    return message.reactions;
  },
  
  // Show reaction picker
  showReactionPicker(msgId, buttonElement) {
    const emojis = ['👍', '❤️', '😄', '🎉', '👏', '🔥', '💯', '🚀'];
    
    // Remove existing picker
    const existing = document.querySelector('.reaction-picker');
    if (existing) existing.remove();
    
    const picker = document.createElement('div');
    picker.className = 'reaction-picker';
    
    emojis.forEach(emoji => {
      const btn = document.createElement('button');
      btn.className = 'reaction-picker-emoji';
      btn.textContent = emoji;
      btn.addEventListener('click', () => {
        const threadId = new URLSearchParams(location.search).get('thread');
        this.toggleReaction(msgId, emoji, threadId);
        picker.remove();
        // Reload message view
        if (window.renderMessages) {
          const activeThread = threadId;
          window.renderMessages();
          setTimeout(() => {
            if (activeThread) {
              const openThread = window.openThread;
              if (openThread) openThread(activeThread);
            }
          }, 100);
        }
      });
      picker.appendChild(btn);
    });
    
    document.body.appendChild(picker);
    
    // Position picker near button
    const rect = buttonElement.getBoundingClientRect();
    picker.style.position = 'fixed';
    picker.style.top = `${rect.top - 50}px`;
    picker.style.left = `${rect.left}px`;
    
    // Close on outside click
    setTimeout(() => {
      const closePicker = (e) => {
        if (!picker.contains(e.target) && e.target !== buttonElement) {
          picker.remove();
          document.removeEventListener('click', closePicker);
        }
      };
      document.addEventListener('click', closePicker);
    }, 100);
  },
  
  // Typing indicator (simulated - in real app would use WebSocket)
  showTypingIndicator(threadId, userName) {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
      indicator.style.display = 'block';
      indicator.innerHTML = `
        <div class="typing-indicator">
          <span>${userName} schreibt</span>
          <div class="typing-dots">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          </div>
        </div>
      `;
    }
  },
  
  hideTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
      indicator.style.display = 'none';
    }
  }
};

// Make available globally
window.messageFeatures = messageFeatures;




















