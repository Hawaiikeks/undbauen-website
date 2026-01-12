// Rich Text Editor Component using Quill.js
import { sanitizeRichText } from '../services/validation.js';

export const richTextEditor = {
  editors: new Map(),
  
  init() {
    // Load Quill.js if not already loaded
    if (!window.Quill) {
      this.loadQuill();
    } else {
      this.initializeEditors();
    }
  },
  
  loadQuill() {
    // Load Quill CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.quilljs.com/1.3.7/quill.snow.css';
    document.head.appendChild(link);
    
    // Load Quill JS
    const script = document.createElement('script');
    script.src = 'https://cdn.quilljs.com/1.3.7/quill.js';
    script.onload = () => this.initializeEditors();
    document.head.appendChild(script);
  },
  
  initializeEditors() {
    // Initialize all textareas with data-rich-text attribute
    // Aber nur wenn sie sichtbar sind (nicht in versteckten Modals)
    document.querySelectorAll('[data-rich-text]').forEach(textarea => {
      // Prüfe ob das Textarea in einem versteckten Modal ist
      const modal = textarea.closest('.modalOverlay, .modal');
      if (modal) {
        const isVisible = modal.style.display !== 'none' && 
                         window.getComputedStyle(modal).display !== 'none';
        if (!isVisible) {
          // Überspringe Editoren in versteckten Modals
          return;
        }
      }
      this.createEditor(textarea);
    });
  },
  
  createEditor(textarea) {
    try {
      const container = document.createElement('div');
      container.className = 'quill-editor-container';
      container.style.minHeight = '200px';
      
      // Insert container before textarea
      textarea.parentNode.insertBefore(container, textarea);
      textarea.style.display = 'none';
      
      // Create Quill instance with extended modules (mention removed to prevent errors)
      const quill = new Quill(container, {
      theme: 'snow',
      modules: {
        toolbar: {
          container: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link'],
            ['image'],
            ['blockquote', 'code-block'],
            [{ 'color': [] }, { 'background': [] }],
            ['clean']
          ],
          handlers: {
            image: () => this.handleImageUpload(quill)
          }
        }
      },
      placeholder: textarea.placeholder || 'Schreibe deine Nachricht...'
    });
    
    // Register custom formats
    this.registerCustomFormats(quill);
    
    // Sync Quill content to textarea
    quill.on('text-change', () => {
      textarea.value = quill.root.innerHTML;
    });
    
    // Set initial content if textarea has value
    if (textarea.value) {
      quill.root.innerHTML = textarea.value;
    }
    
    // Generate unique ID if textarea doesn't have one
    const editorId = textarea.id || `editor-${Date.now()}`;
    if (!textarea.id) {
      textarea.id = editorId;
    }
      container.id = `quill-${editorId}`;
      
      // Store editor reference
      this.editors.set(editorId, {
        quill,
        textarea,
        container
      });
      
      return quill;
    } catch (error) {
      console.warn("Failed to create Rich Text Editor, using plain textarea:", error);
      // If editor creation fails, ensure textarea is visible
      if (textarea) {
        textarea.style.display = '';
      }
      return null;
    }
  },
  
  handleImageUpload(quill) {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.setAttribute('style', 'display: none');
    
    input.onchange = () => {
      const file = input.files[0];
      if (!file) return;
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Bild ist zu groß. Maximal 5MB erlaubt.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        const range = quill.getSelection(true);
        quill.insertEmbed(range.index, 'image', imageUrl, 'user');
        quill.setSelection(range.index + 1);
      };
      reader.readAsDataURL(file);
    };
    
    input.click();
  },
  
  getContent(editorId, sanitize = true) {
    const editor = this.editors.get(editorId);
    if (!editor) return '';
    const content = editor.quill.root.innerHTML;
    return sanitize ? sanitizeRichText(content) : content;
  },
  
  setContent(editorId, content) {
    const editor = this.editors.get(editorId);
    if (!editor) return;
    editor.quill.root.innerHTML = content;
    editor.textarea.value = content;
  },
  
  clear(editorId) {
    const editor = this.editors.get(editorId);
    if (!editor) return;
    editor.quill.setText('');
    editor.textarea.value = '';
  },
  
  getText(editorId) {
    const editor = this.editors.get(editorId);
    if (!editor) return '';
    return editor.quill.getText();
  },
  
  // Register custom formats (Code Block styling only - spoiler removed to prevent errors)
  registerCustomFormats(quill) {
    try {
      // Enhanced code block styling
      const CodeBlock = Quill.import('formats/code-block');
      if (CodeBlock) {
        CodeBlock.className = 'ql-code-block-enhanced';
        Quill.register(CodeBlock, true);
      }
    } catch (e) {
      console.warn("Could not register custom formats:", e);
    }
  },
  
  // Handle mention (@user)
  handleMention(quill) {
    const range = quill.getSelection(true);
    if (range) {
      quill.insertText(range.index, '@');
      quill.setSelection(range.index + 1);
    }
  },
  
  // Search users for mentions
  searchUsers(searchTerm, renderList) {
    if (!window.api) return;
    
    const members = window.api.listMembers(searchTerm).slice(0, 10);
    const items = members.map(member => ({
      id: member.email,
      value: member.name || member.email.split('@')[0],
      email: member.email
    }));
    
    renderList(items, searchTerm);
  },
  
  // Render mention item in dropdown
  renderMentionItem(item) {
    return `<div class="mention-item">
      <strong>${item.value}</strong>
      <span class="mention-email">${item.email}</span>
    </div>`;
  },
  
  // Insert spoiler tag
  insertSpoiler(quill) {
    const range = quill.getSelection(true);
    if (range) {
      quill.formatText(range.index, range.length, 'spoiler', true);
    }
  }
};

