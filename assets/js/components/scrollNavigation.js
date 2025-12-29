// Scroll-based Navigation & Scroll-to-Top
class ScrollNavigation {
  constructor() {
    this.observer = null;
    this.scrollToTopBtn = null;
    this.init();
  }

  init() {
    this.createScrollToTopButton();
    this.setupSectionHighlighting();
    this.setupScrollProgress();
  }

  createScrollToTopButton() {
    this.scrollToTopBtn = document.createElement('button');
    this.scrollToTopBtn.className = 'scroll-to-top';
    this.scrollToTopBtn.setAttribute('aria-label', 'Nach oben scrollen');
    this.scrollToTopBtn.innerHTML = '↑';
    this.scrollToTopBtn.style.display = 'none';
    document.body.appendChild(this.scrollToTopBtn);

    this.scrollToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        this.scrollToTopBtn.style.display = 'flex';
      } else {
        this.scrollToTopBtn.style.display = 'none';
      }
    });
  }

  setupSectionHighlighting() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.navLinks a[href^="#"]');

    if (sections.length === 0 || navLinks.length === 0) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach(link => {
              const href = link.getAttribute('href');
              if (href === `#${id}`) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
              } else {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
              }
            });
          }
        });
      },
      {
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0
      }
    );

    sections.forEach(section => {
      this.observer.observe(section);
    });
  }

  setupScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.setAttribute('role', 'progressbar');
    progressBar.setAttribute('aria-label', 'Scroll-Fortschritt');
    progressBar.setAttribute('aria-valuemin', '0');
    progressBar.setAttribute('aria-valuemax', '100');
    progressBar.setAttribute('aria-valuenow', '0');
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (window.scrollY / windowHeight) * 100;
      progressBar.style.width = `${scrolled}%`;
      progressBar.setAttribute('aria-valuenow', Math.round(scrolled));
    });
  }
}

export const scrollNavigation = new ScrollNavigation();



