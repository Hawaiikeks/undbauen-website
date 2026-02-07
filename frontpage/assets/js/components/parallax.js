// Parallax-Effekte für Hero-Section
class ParallaxHero {
  constructor() {
    this.heroVisual = null;
    this.heroContent = null;
    this.heroOverlay = null;
    this.rafId = null;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.init();
  }

  init() {
    this.heroVisual = document.querySelector('.hero-network-visual');
    this.heroContent = document.querySelector('.hero-content');
    this.heroOverlay = document.querySelector('.hero-overlay');
    
    if (!this.heroVisual || !this.heroContent) return;
    
    // Keine Parallax-Effekte bei reduzierter Motion
    if (this.reducedMotion) {
      return;
    }

    // Parallax-Effekt beim Scrollen mit requestAnimationFrame
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        this.rafId = window.requestAnimationFrame(() => {
          this.handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    // Initial position
    this.handleScroll();
  }

  handleScroll() {
    const scrollY = window.scrollY;
    const heroSection = document.querySelector('.hero');
    
    if (!heroSection) return;

    const heroHeight = heroSection.offsetHeight;
    const heroTop = heroSection.getBoundingClientRect().top;
    const heroBottom = heroSection.getBoundingClientRect().bottom;
    
    // Nur animieren wenn Hero-Section sichtbar ist
    if (heroBottom < 0 || heroTop > window.innerHeight) {
      return;
    }

    // Parallax für Network Visual - bewegt sich langsamer, bleibt sichtbar
    if (this.heroVisual) {
      const parallaxSpeed = 0.5; // Langsamer als Content für Tiefe
      const scale = 1 + (scrollY / heroHeight) * 0.15; // Leichte Skalierung beim Scrollen
      const translateY = scrollY * parallaxSpeed;
      // Netzwerk bleibt sichtbar, auch wenn Content ausgeblendet ist
      const opacity = Math.max(0.2, 1 - scrollY / 800);
      this.heroVisual.style.transform = `translateY(${translateY}px) scale(${scale})`;
      this.heroVisual.style.opacity = opacity;
      this.heroVisual.style.willChange = 'transform, opacity';
      this.heroVisual.style.transition = 'opacity 0.2s ease-out';
    }

    // Parallax für Overlay
    if (this.heroOverlay) {
      const parallaxSpeed = 0.4;
      const translateY = scrollY * parallaxSpeed;
      const opacity = Math.max(0.3, 0.7 - scrollY / heroHeight);
      this.heroOverlay.style.transform = `translateY(${translateY}px)`;
      this.heroOverlay.style.opacity = opacity;
    }

    // Parallax für Content - fadet beim Scrollen aus
    if (this.heroContent) {
      const parallaxSpeed = 0.3;
      const translateY = scrollY * parallaxSpeed;
      // Content fadet schneller aus, Netzwerk bleibt sichtbar
      const opacity = Math.max(0, 1 - scrollY / 300);
      this.heroContent.style.transform = `translateY(${translateY}px)`;
      this.heroContent.style.opacity = opacity;
      this.heroContent.style.transition = 'opacity 0.1s ease-out';
    }

    // Animiere SVG-Nodes beim Scrollen
    this.animateSVGNodes(scrollY);
  }

  animateSVGNodes(scrollY) {
    const svg = this.heroVisual?.querySelector('svg');
    if (!svg) return;

    const circles = svg.querySelectorAll('circle');
    const lines = svg.querySelectorAll('line');
    
    circles.forEach((circle, index) => {
      const speed = 0.15 + (index % 3) * 0.08; // Erhöhte Geschwindigkeit
      const offset = Math.sin(scrollY * 0.015 + index) * 3; // Stärkere Bewegung
      const currentX = parseFloat(circle.getAttribute('cx') || 0);
      const currentY = parseFloat(circle.getAttribute('cy') || 0);
      
      // Verwende CSS-Transforms statt inline styles wo möglich
      circle.style.transform = `translate(${offset}px, ${scrollY * speed}px)`;
      circle.style.opacity = Math.max(0.3, 1 - scrollY / 1000); // Langsamere Opacity-Änderung
      circle.style.willChange = 'transform, opacity';
    });

    lines.forEach((line, index) => {
      const opacity = Math.max(0.08, 0.2 - scrollY / 1200); // Langsamere Opacity-Änderung
      line.style.opacity = opacity;
      line.style.willChange = 'opacity';
    });
  }
  
  destroy() {
    if (this.rafId) {
      window.cancelAnimationFrame(this.rafId);
    }
  }
}

export const parallaxHero = new ParallaxHero();

