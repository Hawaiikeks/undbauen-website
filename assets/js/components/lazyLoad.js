// Lazy Loading für Bilder
class LazyLoader {
  constructor() {
    this.observer = null;
    this.init();
  }

  init() {
    if (!('IntersectionObserver' in window)) {
      // Fallback: Lade alle Bilder sofort
      document.querySelectorAll('img[loading="lazy"]').forEach(img => {
        img.classList.add('loaded');
      });
      return;
    }

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          img.classList.add('loaded');
          this.observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px'
    });

    // Beobachte alle lazy-loading Bilder
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
      if (img.src && !img.dataset.src) {
        // Bild hat bereits src, markiere als geladen
        img.classList.add('loaded');
      } else {
        this.observer.observe(img);
      }
    });
  }

  observe(img) {
    if (this.observer && img) {
      this.observer.observe(img);
    }
  }
}

export const lazyLoader = new LazyLoader();



