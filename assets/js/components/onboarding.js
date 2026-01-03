// Onboarding Tour für neue Nutzer
export function initOnboarding() {
  const onboardingCompleted = localStorage.getItem('onboardingCompleted');
  
  // Nur anzeigen wenn noch nicht abgeschlossen
  if (onboardingCompleted === 'true') {
    return;
  }
  
  // Prüfe ob wir im App-Bereich sind
  if (!document.querySelector('.app-container') && !window.location.pathname.includes('/app/')) {
    return;
  }
  
  // Warte kurz bis Seite geladen ist
  setTimeout(() => {
    showOnboarding();
  }, 1000);
}

function showOnboarding() {
  const steps = [
    {
      title: "Willkommen bei …undbauen!",
      content: "Wir freuen uns, dass Sie Teil unseres Netzwerks sind. Lassen Sie uns Ihnen die wichtigsten Features zeigen.",
      target: null
    },
    {
      title: "Netzwerk entdecken",
      content: "Im Netzwerk-Bereich finden Sie alle Mitglieder. Nutzen Sie Filter und Suche, um interessante Kontakte zu finden.",
      target: "#netzwerk, .network, [href*='mitglieder']"
    },
    {
      title: "Termine & Events",
      content: "Hier sehen Sie alle kommenden Innovationsabende und können sich direkt anmelden.",
      target: "#termine, .termine, [href*='termine']"
    },
    {
      title: "Forum & Diskussionen",
      content: "Im Forum können Sie Themen vertiefen, Fragen stellen und mit anderen Mitgliedern diskutieren.",
      target: "#updates, .forum, [href*='forum']"
    }
  ];
  
  let currentStep = 0;
  
  // Erstelle Modal
  const overlay = document.createElement('div');
  overlay.className = 'onboarding-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'onboarding-title');
  
  const modal = document.createElement('div');
  modal.className = 'onboarding-modal';
  
  const header = document.createElement('div');
  header.className = 'onboarding-header';
  
  const title = document.createElement('h3');
  title.id = 'onboarding-title';
  title.className = 'onboarding-title';
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'btn ghost onboarding-close';
  closeBtn.setAttribute('aria-label', 'Onboarding überspringen');
  closeBtn.innerHTML = '✕';
  closeBtn.addEventListener('click', () => {
    completeOnboarding();
    overlay.remove();
  });
  
  header.appendChild(title);
  header.appendChild(closeBtn);
  
  const body = document.createElement('div');
  body.className = 'onboarding-body';
  
  const content = document.createElement('p');
  content.className = 'onboarding-content';
  
  body.appendChild(content);
  
  const footer = document.createElement('div');
  footer.className = 'onboarding-footer';
  
  const skipBtn = document.createElement('button');
  skipBtn.className = 'btn ghost';
  skipBtn.textContent = 'Überspringen';
  skipBtn.addEventListener('click', () => {
    completeOnboarding();
    overlay.remove();
  });
  
  const nextBtn = document.createElement('button');
  nextBtn.className = 'btn primary';
  nextBtn.textContent = 'Weiter';
  nextBtn.addEventListener('click', () => {
    currentStep++;
    if (currentStep >= steps.length) {
      completeOnboarding();
      overlay.remove();
    } else {
      updateStep();
    }
  });
  
  footer.appendChild(skipBtn);
  footer.appendChild(nextBtn);
  
  modal.appendChild(header);
  modal.appendChild(body);
  modal.appendChild(footer);
  overlay.appendChild(modal);
  
  function updateStep() {
    const step = steps[currentStep];
    title.textContent = step.title;
    content.textContent = step.content;
    
    if (currentStep === steps.length - 1) {
      nextBtn.textContent = 'Los geht\'s!';
    } else {
      nextBtn.textContent = 'Weiter';
    }
    
    // Highlight target element if exists
    if (step.target) {
      const target = document.querySelector(step.target);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          target.classList.add('onboarding-highlight');
          setTimeout(() => {
            target.classList.remove('onboarding-highlight');
          }, 2000);
        }, 500);
      }
    }
  }
  
  function completeOnboarding() {
    localStorage.setItem('onboardingCompleted', 'true');
  }
  
  updateStep();
  document.body.appendChild(overlay);
  
  // Keyboard navigation
  overlay.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      completeOnboarding();
      overlay.remove();
    } else if (e.key === 'Enter' && document.activeElement === nextBtn) {
      nextBtn.click();
    }
  });
  
  // Focus management
  nextBtn.focus();
}














