/**
 * Miscellaneous Page Module
 * Handles testimonials, partners, FAQ rendering
 */

const $ = (s) => document.querySelector(s);

/**
 * Sanitizes a string to prevent XSS attacks
 * @param {string} str - String to sanitize
 * @returns {string} - Sanitized string
 */
const sanitizeHTML = (str) => {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

/**
 * Renders testimonials
 */
export const renderTestimonials = () => {
  const wrap = $("#testimonialsGrid");
  if (!wrap) return;
  
  const testimonials = [
    {
      name: "Dr. Sarah Müller",
      role: "Architektin & BIM-Expertin",
      company: "Müller Architekten",
      quote: "…undbauen hat mir geholfen, wertvolle Kontakte in der Branche zu knüpfen. Die Veranstaltungen sind immer inspirierend und der Austausch auf Augenhöhe ist genau das, was ich gesucht habe.",
      avatar: null
    },
    {
      name: "Thomas Weber",
      role: "Projektleiter Digitalisierung",
      company: "BauTech GmbH",
      quote: "Die Plattform verbindet Theorie und Praxis auf eine Weise, die ich sonst nirgendwo finde. Besonders die Diskussionen im Forum sind sehr bereichernd.",
      avatar: null
    },
    {
      name: "Lisa Schneider",
      role: "Nachhaltigkeitsberaterin",
      company: "GreenBuild Consulting",
      quote: "Als Quereinsteigerin in die Baubranche habe ich durch …undbauen schnell Anschluss gefunden. Das Netzwerk ist offen, hilfsbereit und fachlich auf hohem Niveau.",
      avatar: null
    },
    {
      name: "Michael Hoffmann",
      role: "Geschäftsführer",
      company: "Hoffmann Ingenieure",
      quote: "Die Innovationsabende sind ein fester Bestandteil meines Kalenders geworden. Hier treffe ich regelmäßig auf neue Perspektiven und Impulse für meine Arbeit.",
      avatar: null
    }
  ];
  
  wrap.innerHTML = testimonials.map(t => `
    <div class="testimonial-card">
      <div class="testimonial-quote">
        <svg class="quote-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.391 9.065-9.391v3.609c-1.76 0-3.219.992-3.219 3.521v2.261h4.435v7.391h-10.281zm-14.017 0v-7.391c0-5.704 3.748-9.391 9.082-9.391v3.609c-1.76 0-3.219.992-3.219 3.521v2.261h4.436v7.391h-10.28z" fill="currentColor" opacity="0.3"/>
        </svg>
        <p class="testimonial-text">${sanitizeHTML(t.quote)}</p>
      </div>
      <div class="testimonial-author">
        <div class="testimonial-avatar">
          ${t.avatar ? `<img src="${sanitizeHTML(t.avatar)}" alt="${sanitizeHTML(t.name)}" loading="lazy" />` : `<div class="avatar-placeholder">${sanitizeHTML(t.name.split(' ').map(n => n[0]).join(''))}</div>`}
        </div>
        <div class="testimonial-info">
          <div class="testimonial-name">${sanitizeHTML(t.name)}</div>
          <div class="testimonial-meta">${sanitizeHTML(t.role)}<br>${sanitizeHTML(t.company)}</div>
        </div>
      </div>
    </div>
  `).join("");
};

/**
 * Renders partners
 */
export const renderPartners = () => {
  const wrap = $("#partnersGrid");
  if (!wrap) return;
  
  const partners = [
    { name: "Partner 1", logo: null, url: "#" },
    { name: "Partner 2", logo: null, url: "#" },
    { name: "Partner 3", logo: null, url: "#" },
    { name: "Partner 4", logo: null, url: "#" },
    { name: "Partner 5", logo: null, url: "#" },
    { name: "Partner 6", logo: null, url: "#" }
  ];
  
  wrap.innerHTML = partners.map(p => `
    <div class="partner-logo">
      ${p.logo ? 
        `<a href="${sanitizeHTML(p.url)}" target="_blank" rel="noopener noreferrer" aria-label="${sanitizeHTML(p.name)} Website">
          <img src="${sanitizeHTML(p.logo)}" alt="${sanitizeHTML(p.name)}" loading="lazy" />
        </a>` :
        `<div class="partner-placeholder" aria-label="${sanitizeHTML(p.name)}">
          <span>${sanitizeHTML(p.name)}</span>
        </div>`
      }
    </div>
  `).join("");
};

/**
 * Renders FAQ
 */
export const renderFAQ = () => {
  const wrap = $("#faqContainer");
  if (!wrap) return;
  
  const faqs = [
    {
      question: "Wie kann ich Mitglied werden?",
      answer: "Sie können sich über den 'Mitglied werden'-Button registrieren. Nach der Registrierung erhalten Sie Zugang zum geschützten Memberbereich mit allen Funktionen des Netzwerks."
    },
    {
      question: "Was kostet die Mitgliedschaft?",
      answer: "Die Mitgliedschaft ist aktuell kostenlos. …undbauen ist ein unabhängiges Netzwerk-Format, das sich über Partner und Unterstützer finanziert."
    },
    {
      question: "Wie funktionieren die Innovationsabende?",
      answer: "Die monatlichen Innovationsabende finden regelmäßig statt. Mitglieder können Termine einsehen, vormerken und buchen. Die Veranstaltungen kombinieren Impulsvorträge mit moderierten Diskussionen."
    },
    {
      question: "Kann ich auch ohne Mitgliedschaft teilnehmen?",
      answer: "Die öffentlichen Informationen auf der Website sind für alle zugänglich. Für die Teilnahme an Veranstaltungen, den Zugang zum Forum und die Nutzung aller Netzwerk-Funktionen ist eine Mitgliedschaft erforderlich."
    },
    {
      question: "Wie funktioniert das Forum?",
      answer: "Das Forum ist der inhaltliche Kern des Netzwerks. Mitglieder können Themen diskutieren, Fragen stellen und Erfahrungen teilen. Das Forum ist moderiert und auf einen konstruktiven, sachlichen Austausch ausgelegt."
    },
    {
      question: "Wer kann Mitglied werden?",
      answer: "Das Netzwerk richtet sich an Fachleute aus Architektur, Ingenieurwesen, Bauwesen und digitaler Planung. Wir freuen uns über Praktiker:innen, Entscheider:innen, Forschende und Gestalter:innen, die sich aktiv mit der Weiterentwicklung der gebauten Umwelt beschäftigen."
    },
    {
      question: "Wie kann ich Kontakt zu anderen Mitgliedern aufnehmen?",
      answer: "Im geschützten Memberbereich können Sie Profile anderer Mitglieder einsehen und über das Nachrichtensystem direkt Kontakt aufnehmen. Zusätzlich bietet das Forum Möglichkeiten für den fachlichen Austausch."
    },
    {
      question: "Werden die Veranstaltungen auch online angeboten?",
      answer: "Die Innovationsabende finden primär als Präsenzveranstaltungen statt. Bei Bedarf können einzelne Formate auch hybrid oder online durchgeführt werden. Details finden Sie in den jeweiligen Veranstaltungsbeschreibungen."
    }
  ];
  
  wrap.innerHTML = faqs.map((faq, index) => `
    <div class="faq-item">
      <button 
        class="faq-question" 
        id="faq-question-${index}"
        aria-expanded="false"
        aria-controls="faq-answer-${index}"
        type="button">
        <span>${sanitizeHTML(faq.question)}</span>
        <span class="faq-icon" aria-hidden="true">+</span>
      </button>
      <div 
        class="faq-answer" 
        id="faq-answer-${index}"
        role="region"
        aria-labelledby="faq-question-${index}">
        <div class="faq-answer-content">
          <p class="p">${sanitizeHTML(faq.answer)}</p>
        </div>
      </div>
    </div>
  `).join("");
  
  // FAQ Accordion Functionality
  wrap.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
      const isExpanded = button.getAttribute('aria-expanded') === 'true';
      const answer = document.getElementById(button.getAttribute('aria-controls'));
      const icon = button.querySelector('.faq-icon');
      
      // Close all other items
      wrap.querySelectorAll('.faq-question').forEach(otherBtn => {
        if (otherBtn !== button) {
          otherBtn.setAttribute('aria-expanded', 'false');
          const otherAnswer = document.getElementById(otherBtn.getAttribute('aria-controls'));
          if (otherAnswer) {
            otherAnswer.classList.remove('faq-answer-open');
            otherAnswer.style.maxHeight = null;
          }
          const otherIcon = otherBtn.querySelector('.faq-icon');
          if (otherIcon) otherIcon.textContent = '+';
        }
      });
      
      // Toggle current item
      button.setAttribute('aria-expanded', !isExpanded);
      if (answer) {
        if (!isExpanded) {
          answer.classList.add('faq-answer-open');
          answer.style.maxHeight = answer.scrollHeight + 'px';
          if (icon) icon.textContent = '−';
        } else {
          answer.classList.remove('faq-answer-open');
          answer.style.maxHeight = null;
          if (icon) icon.textContent = '+';
        }
      }
    });
    
    // Keyboard navigation
    button.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        button.click();
      }
    });
  });
};
