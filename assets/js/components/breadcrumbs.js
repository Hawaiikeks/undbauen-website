// Breadcrumbs-Komponente für App-Bereich
class Breadcrumbs {
  constructor() {
    this.routes = {
      'dashboard.html': ['Dashboard'],
      'termine.html': ['Termine'],
      'forum.html': ['Forum'],
      'forum-kategorie.html': ['Forum', 'Kategorie'],
      'forum-thread.html': ['Forum', 'Thread'],
      'nachrichten.html': ['Nachrichten'],
      'neue-nachricht.html': ['Nachrichten', 'Neue Nachricht'],
      'mitglieder.html': ['Mitglieder'],
      'member.html': ['Mitglieder', 'Profil'],
      'profil.html': ['Profil'],
      'einstellungen.html': ['Einstellungen'],
      'admin.html': ['Admin']
    };
  }

  init() {
    const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
    const breadcrumbs = this.generateBreadcrumbs(currentPage);
    this.render(breadcrumbs);
  }

  generateBreadcrumbs(currentPage) {
    const basePath = currentPage.replace('.html', '');
    const route = this.routes[currentPage] || [basePath.charAt(0).toUpperCase() + basePath.slice(1)];
    
    // Dynamische Breadcrumbs für Forum-Kategorien und Threads
    if (currentPage === 'forum-kategorie.html') {
      const categoryName = new URLSearchParams(window.location.search).get('name') || 'Kategorie';
      return [
        { label: 'Forum', href: 'forum.html' },
        { label: categoryName, href: null }
      ];
    }
    
    if (currentPage === 'forum-thread.html') {
      const threadName = new URLSearchParams(window.location.search).get('title') || 'Thread';
      const categoryName = new URLSearchParams(window.location.search).get('category') || 'Kategorie';
      return [
        { label: 'Forum', href: 'forum.html' },
        { label: categoryName, href: `forum-kategorie.html?name=${encodeURIComponent(categoryName)}` },
        { label: threadName, href: null }
      ];
    }
    
    if (currentPage === 'member.html') {
      const memberName = new URLSearchParams(window.location.search).get('name') || 'Mitglied';
      return [
        { label: 'Mitglieder', href: 'mitglieder.html' },
        { label: memberName, href: null }
      ];
    }

    // Standard-Breadcrumbs
    if (route.length === 1) {
      return [{ label: route[0], href: null }];
    }

    return route.map((label, index) => {
      if (index === route.length - 1) {
        return { label, href: null };
      }
      // Finde die entsprechende HTML-Datei
      const href = Object.keys(this.routes).find(key => 
        this.routes[key][this.routes[key].length - 1] === label
      ) || null;
      return { label, href };
    });
  }

  render(breadcrumbs) {
    const main = document.querySelector('main#main-content, main.pageWrap');
    if (!main) return;

    // Prüfe ob Breadcrumbs bereits existieren
    let breadcrumbContainer = document.querySelector('.breadcrumbs');
    if (!breadcrumbContainer) {
      breadcrumbContainer = document.createElement('nav');
      breadcrumbContainer.className = 'breadcrumbs';
      breadcrumbContainer.setAttribute('aria-label', 'Breadcrumb-Navigation');
      main.insertBefore(breadcrumbContainer, main.firstChild);
    }

    breadcrumbContainer.innerHTML = breadcrumbs.map((crumb, index) => {
      if (crumb.href) {
        return `<a href="${crumb.href}" class="breadcrumb-link"><strong>${crumb.label}</strong></a>`;
      } else {
        return `<span class="breadcrumb-current" aria-current="page"><strong>${crumb.label}</strong></span>`;
      }
    }).join('<span class="breadcrumb-separator" aria-hidden="true"><strong> › </strong></span>');
  }

  update(crumbs) {
    this.render(crumbs);
  }
}

export const breadcrumbs = new Breadcrumbs();










