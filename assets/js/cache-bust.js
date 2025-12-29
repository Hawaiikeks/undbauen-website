// Cache Busting Helper
// Fügt automatisch Version-Parameter zu CSS/JS Links hinzu
(function() {
  'use strict';
  
  // Version basierend auf Build-Zeit oder Timestamp
  const VERSION = '2.0.0'; // Bei jedem Deployment erhöhen
  
  // Finde alle CSS/JS Links und füge Version hinzu
  function addCacheBusting() {
    // CSS Links
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
      const href = link.getAttribute('href');
      if (href && !href.includes('?v=') && !href.startsWith('http')) {
        const separator = href.includes('?') ? '&' : '?';
        link.setAttribute('href', href + separator + 'v=' + VERSION);
      }
    });
    
    // JS Scripts
    document.querySelectorAll('script[src]').forEach(script => {
      const src = script.getAttribute('src');
      if (src && !src.includes('?v=') && !src.startsWith('http') && !src.startsWith('//')) {
        const separator = src.includes('?') ? '&' : '?';
        script.setAttribute('src', src + separator + 'v=' + VERSION);
      }
    });
  }
  
  // Führe aus, sobald DOM bereit ist
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addCacheBusting);
  } else {
    addCacheBusting();
  }
})();

