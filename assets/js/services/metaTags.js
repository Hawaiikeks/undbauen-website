/* Meta Tags: Service for managing SEO and social media meta tags */

/**
 * Set meta tags for SEO and social sharing
 * @param {Object} tags - Meta tag data
 */
export function setMetaTags(tags) {
  const {
    title,
    description,
    image,
    url,
    type = 'website',
    siteName = '…undbauen',
    locale = 'de_DE',
    twitterCard = 'summary_large_image',
    twitterSite = '@undbauen'
  } = tags;

  // Basic Meta Tags
  if (title) {
    document.title = title;
    setMeta('og:title', title);
    setMeta('twitter:title', title);
  }

  if (description) {
    setMeta('description', description);
    setMeta('og:description', description);
    setMeta('twitter:description', description);
  }

  if (image) {
    const imageUrl = image.startsWith('http') ? image : `${window.location.origin}${image}`;
    setMeta('og:image', imageUrl);
    setMeta('twitter:image', imageUrl);
    setMeta('image', imageUrl);
  }

  if (url) {
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    setMeta('og:url', fullUrl);
    setMeta('canonical', fullUrl);
  }

  // Open Graph Tags
  setMeta('og:type', type);
  setMeta('og:site_name', siteName);
  setMeta('og:locale', locale);

  // Twitter Card Tags
  setMeta('twitter:card', twitterCard);
  if (twitterSite) {
    setMeta('twitter:site', twitterSite);
  }

  // Additional Meta Tags
  setMeta('robots', 'index, follow');
  setMeta('author', siteName);
}

/**
 * Set a single meta tag
 * @param {string} property - Meta property or name
 * @param {string} content - Meta content
 * @param {string} attribute - Attribute type ('property' or 'name')
 */
function setMeta(property, content, attribute = null) {
  if (!content) return;

  // Determine attribute type
  const attrType = attribute || (property.includes(':') ? 'property' : 'name');

  // Find existing meta tag
  let meta = document.querySelector(`meta[${attrType}="${property}"]`);

  if (!meta) {
    // Create new meta tag
    meta = document.createElement('meta');
    meta.setAttribute(attrType, property);
    document.head.appendChild(meta);
  }

  // Set content
  meta.setAttribute('content', content);
}

/**
 * Set canonical URL
 * @param {string} url - Canonical URL
 */
export function setCanonical(url) {
  const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
  
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', fullUrl);
}

/**
 * Set structured data (JSON-LD)
 * @param {Object} data - Structured data object
 */
export function setStructuredData(data) {
  // Remove existing structured data with same type
  if (data['@type']) {
    const existing = document.querySelector(`script[type="application/ld+json"][data-type="${data['@type']}"]`);
    if (existing) {
      existing.remove();
    }
  }

  // Create new script tag
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  if (data['@type']) {
    script.setAttribute('data-type', data['@type']);
  }
  document.head.appendChild(script);
}

/**
 * Set organization structured data
 */
export function setOrganizationStructuredData() {
  setStructuredData({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '…undbauen',
    url: window.location.origin,
    logo: `${window.location.origin}/assets/images/logo.png`,
    description: 'Innovationsnetzwerk für nachhaltiges Bauen und Innovation',
    sameAs: [
      // Add social media links here
    ]
  });
}

/**
 * Set website structured data
 */
export function setWebsiteStructuredData() {
  setStructuredData({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '…undbauen',
    url: window.location.origin,
    description: 'Innovationsnetzwerk für nachhaltiges Bauen und Innovation',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${window.location.origin}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  });
}

/**
 * Set article structured data
 * @param {Object} article - Article data
 */
export function setArticleStructuredData(article) {
  const {
    title,
    description,
    image,
    url,
    author,
    datePublished,
    dateModified,
    publisher = '…undbauen'
  } = article;

  setStructuredData({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    image: image ? (image.startsWith('http') ? image : `${window.location.origin}${image}`) : undefined,
    url: url ? (url.startsWith('http') ? url : `${window.location.origin}${url}`) : window.location.href,
    author: {
      '@type': 'Person',
      name: author || publisher
    },
    publisher: {
      '@type': 'Organization',
      name: publisher,
      logo: {
        '@type': 'ImageObject',
        url: `${window.location.origin}/assets/images/logo.png`
      }
    },
    datePublished: datePublished || new Date().toISOString(),
    dateModified: dateModified || new Date().toISOString()
  });
}

/**
 * Set event structured data
 * @param {Object} event - Event data
 */
export function setEventStructuredData(event) {
  const {
    name,
    description,
    image,
    url,
    startDate,
    endDate,
    location,
    organizer = '…undbauen'
  } = event;

  setStructuredData({
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: name,
    description: description,
    image: image ? (image.startsWith('http') ? image : `${window.location.origin}${image}`) : undefined,
    url: url ? (url.startsWith('http') ? url : `${window.location.origin}${url}`) : window.location.href,
    startDate: startDate,
    endDate: endDate,
    location: {
      '@type': 'Place',
      name: location
    },
    organizer: {
      '@type': 'Organization',
      name: organizer
    }
  });
}

/**
 * Initialize default meta tags
 */
export function initDefaultMetaTags() {
  setMetaTags({
    title: '…undbauen – Innovationsnetzwerk',
    description: 'Innovationsnetzwerk für nachhaltiges Bauen und Innovation. Community-Plattform für Ideen, Events und Zusammenarbeit.',
    image: '/assets/images/og-image.jpg',
    url: window.location.href
  });

  setOrganizationStructuredData();
  setWebsiteStructuredData();
}









