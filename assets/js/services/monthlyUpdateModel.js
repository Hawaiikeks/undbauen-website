// Extended Monthly Update Data Model
// Based on professional innovation network / magazine requirements

export const MonthlyUpdateModel = {
  // Create a new monthly update with extended structure
  create(month, title, subtitle = '') {
    return {
      id: `upd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      slug: this.generateSlug(title, month),
      title,
      subtitle,
      issueDate: month, // YYYY-MM format
      startTime: null,
      endTime: null,
      location: null,
      durationMin: null,
      
      // Hero section
      heroImage: {
        url: null,
        alt: '',
        caption: '',
        focalPoint: { x: 0.5, y: 0.5 } // For image cropping/focus
      },
      
      // Editorial text (5-8 lines)
      editorialText: '',
      
      // Stats (auto-calculated)
      stats: {
        attendeesCount: 0,
        highlightsCount: 0,
        durationMin: 0
      },
      
      // Highlights array
      highlights: [],
      
      // Participants (references to user/participant database)
      participants: [],
      
      // Optional sections
      quotes: [],
      takeaways: [],
      resources: [],
      
      // Next event CTA
      nextEvent: {
        date: null,
        topic: '',
        ctaLabel: '',
        ctaUrl: ''
      },
      
      // SEO
      seo: {
        metaTitle: '',
        metaDescription: '',
        ogImage: null
      },
      
      // Status
      status: 'draft', // draft | published | archived
      
      // Timestamps
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: null
    };
  },
  
  // Generate URL-friendly slug
  generateSlug(title, month) {
    const monthNames = ['januar', 'februar', 'maerz', 'april', 'mai', 'juni', 
                       'juli', 'august', 'september', 'oktober', 'november', 'dezember'];
    const [year, monthNum] = month.split('-');
    const monthName = monthNames[parseInt(monthNum) - 1] || monthNum;
    const titleSlug = title
      .toLowerCase()
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return `${monthName}-${year}-${titleSlug}`;
  },
  
  // Create a new highlight
  createHighlight() {
    return {
      id: `hl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: '',
      categoryTags: [],
      shortSummary: '', // 2-3 sentences
      keyPoints: [], // max 3-5
      media: {
        type: null, // 'image' | 'embed'
        image: {
          url: null,
          alt: '',
          caption: '',
          focalPoint: { x: 0.5, y: 0.5 }
        },
        embedUrl: null
      },
      involvedParticipants: [], // Participant IDs
      deepDive: {
        enabled: false,
        contentRichText: '',
        attachments: []
      }
    };
  },
  
  // Create a participant reference
  createParticipantRef(participantId, role = '', tags = []) {
    return {
      participantId,
      role,
      tags,
      addedAt: new Date().toISOString()
    };
  },
  
  // Create a quote
  createQuote(text, sourceName = '', sourceRole = '') {
    return {
      id: `qt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text,
      sourceName,
      sourceRole
    };
  },
  
  // Create a takeaway
  createTakeaway(text, tag = '') {
    return {
      id: `tk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text,
      tag
    };
  },
  
  // Create a resource link
  createResourceLink(title, url, type = 'article', note = '') {
    return {
      id: `rs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      url,
      type, // article | tool | book | project | video
      note
    };
  },
  
  // Validate update before saving
  validate(update) {
    const errors = [];
    
    if (!update.title || update.title.trim().length < 3) {
      errors.push('Titel muss mindestens 3 Zeichen lang sein.');
    }
    
    if (!update.issueDate || !/^\d{4}-\d{2}$/.test(update.issueDate)) {
      errors.push('Ungültiges Datum. Format: YYYY-MM');
    }
    
    if (update.editorialText && update.editorialText.length > 600) {
      errors.push('Editorial-Text darf maximal 600 Zeichen lang sein.');
    }
    
    if (update.highlights.length === 0) {
      errors.push('Mindestens ein Highlight ist erforderlich.');
    }
    
    update.highlights.forEach((hl, idx) => {
      if (!hl.title || hl.title.trim().length < 3) {
        errors.push(`Highlight ${idx + 1}: Titel ist erforderlich.`);
      }
      if (hl.shortSummary && hl.shortSummary.length > 300) {
        errors.push(`Highlight ${idx + 1}: Summary darf maximal 300 Zeichen lang sein.`);
      }
      if (hl.keyPoints.length > 5) {
        errors.push(`Highlight ${idx + 1}: Maximal 5 Key Points erlaubt.`);
      }
      if (hl.media.type === 'image' && hl.media.image.url && !hl.media.image.alt) {
        errors.push(`Highlight ${idx + 1}: Alt-Text für Bild ist erforderlich.`);
      }
    });
    
    if (update.takeaways.length > 5) {
      errors.push('Maximal 5 Takeaways erlaubt.');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  },
  
  // Calculate stats
  calculateStats(update) {
    return {
      attendeesCount: update.participants.length,
      highlightsCount: update.highlights.length,
      durationMin: update.durationMin || 0
    };
  }
};















