/* Demo Data: Seed data for local testing */

import { ticketRepository } from '../services/repositories/ticketRepository.js';
import { notificationRepository } from '../services/repositories/notificationRepository.js';
import { reportRepository } from '../services/repositories/reportRepository.js';
import { resourceRepository } from '../services/repositories/resourceRepository.js';
import { knowledgeRepository } from '../services/repositories/knowledgeRepository.js';
import { pageRepository } from '../services/repositories/pageRepository.js';
import { userRepository } from '../services/repositories/userRepository.js';

/**
 * Seed all demo data
 */
export async function seedDemoData() {
  console.log('🌱 Seeding demo data...');
  
  try {
    await seedUsers();
    await seedTickets();
    await seedNotifications();
    await seedReports();
    await seedResources();
    await seedKnowledge();
    await seedPublicPages();
    
    console.log('✅ Demo data seeded successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    return false;
  }
}

/**
 * Seed demo users (if not already exist)
 */
async function seedUsers() {
  const existingUsers = await userRepository.findAll();
  if (existingUsers.length > 0) {
    console.log('Users already exist, skipping...');
    return;
  }

  const demoUsers = [
    {
      email: 'admin@undbauen.de',
      name: 'Admin User',
      role: 'admin',
      status: 'active'
    },
    {
      email: 'moderator@undbauen.de',
      name: 'Moderator User',
      role: 'moderator',
      status: 'active'
    },
    {
      email: 'editor@undbauen.de',
      name: 'Editor User',
      role: 'editor',
      status: 'active'
    },
    {
      email: 'member@undbauen.de',
      name: 'Member User',
      role: 'member',
      status: 'active'
    }
  ];

  for (const user of demoUsers) {
    await userRepository.create(user);
  }
  console.log('✅ Seeded users');
}

/**
 * Seed demo tickets
 */
async function seedTickets() {
  const existingTickets = await ticketRepository.findAll();
  if (existingTickets.length > 0) {
    console.log('Tickets already exist, skipping...');
    return;
  }

  const users = await userRepository.findAll();
  const member = users.find(u => u.role === 'member');
  const admin = users.find(u => u.role === 'admin');

  if (!member || !admin) {
    console.warn('No users found for ticket seeding');
    return;
  }

  const demoTickets = [
    {
      createdByUserId: member.id,
      category: 'feature',
      title: 'Dark Mode für die gesamte Plattform',
      description: 'Es wäre großartig, wenn die gesamte Plattform einen Dark Mode hätte. Das würde die Augen schonen und die Nutzung bei wenig Licht verbessern.',
      links: ['https://example.com/dark-mode-inspiration'],
      attachments: [],
      visibilityPublicCandidate: true,
      status: 'open',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      createdByUserId: member.id,
      category: 'bug',
      title: 'Bilder werden nicht korrekt angezeigt',
      description: 'Wenn ich Bilder in Forum-Posts hochlade, werden sie manchmal nicht korrekt angezeigt. Sie erscheinen zu groß oder außerhalb des Containers.',
      links: [],
      attachments: [],
      visibilityPublicCandidate: false,
      status: 'in-progress',
      assignedToUserId: admin.id,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      createdByUserId: member.id,
      category: 'improvement',
      title: 'Bessere Suche in der Knowledge Base',
      description: 'Die Suche in der Knowledge Base könnte verbessert werden. Es wäre hilfreich, wenn man nach Tags, Kategorien oder Autoren suchen könnte.',
      links: [],
      attachments: [],
      visibilityPublicCandidate: true,
      status: 'resolved',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  for (const ticket of demoTickets) {
    await ticketRepository.create(ticket);
  }
  console.log('✅ Seeded tickets');
}

/**
 * Seed demo notifications
 */
async function seedNotifications() {
  const existingNotifications = await notificationRepository.findAll();
  if (existingNotifications.length > 0) {
    console.log('Notifications already exist, skipping...');
    return;
  }

  const users = await userRepository.findAll();
  const member = users.find(u => u.role === 'member');

  if (!member) {
    console.warn('No users found for notification seeding');
    return;
  }

  const demoNotifications = [
    {
      userId: member.id,
      type: 'ticket_status_changed',
      entityType: 'Ticket',
      entityId: 'ticket_1',
      title: 'Ticket-Status geändert',
      body: 'Ihr Ticket "Dark Mode für die gesamte Plattform" wurde auf "In Bearbeitung" gesetzt.',
      isRead: false,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      userId: member.id,
      type: 'ticket_comment',
      entityType: 'Ticket',
      entityId: 'ticket_1',
      title: 'Neuer Kommentar',
      body: 'Es gibt einen neuen Kommentar zu Ihrem Ticket.',
      isRead: false,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      userId: member.id,
      type: 'system',
      entityType: 'System',
      entityId: 'system_1',
      title: 'Willkommen bei …undbauen',
      body: 'Willkommen auf der Plattform! Wir freuen uns, dass Sie dabei sind.',
      isRead: true,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  for (const notification of demoNotifications) {
    await notificationRepository.create(notification);
  }
  console.log('✅ Seeded notifications');
}

/**
 * Seed demo reports
 */
async function seedReports() {
  const existingReports = await reportRepository.findAll();
  if (existingReports.length > 0) {
    console.log('Reports already exist, skipping...');
    return;
  }

  const users = await userRepository.findAll();
  const member = users.find(u => u.role === 'member');
  const moderator = users.find(u => u.role === 'moderator');

  if (!member || !moderator) {
    console.warn('No users found for report seeding');
    return;
  }

  const demoReports = [
    {
      reporterUserId: member.id,
      targetType: 'Post',
      targetId: 'post_1',
      reason: 'spam',
      note: 'Dieser Post enthält Spam-Links.',
      status: 'pending',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      reporterUserId: member.id,
      targetType: 'Comment',
      targetId: 'comment_1',
      reason: 'harassment',
      note: 'Dieser Kommentar enthält beleidigende Inhalte.',
      status: 'dismissed',
      resolvedByUserId: moderator.id,
      resolutionAction: 'dismissed',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  for (const report of demoReports) {
    await reportRepository.create(report);
  }
  console.log('✅ Seeded reports');
}

/**
 * Seed demo resources
 */
async function seedResources() {
  const existingResources = await resourceRepository.findAll();
  if (existingResources.length > 0) {
    console.log('Resources already exist, skipping...');
    return;
  }

  const users = await userRepository.findAll();
  const editor = users.find(u => u.role === 'editor');

  if (!editor) {
    console.warn('No users found for resource seeding');
    return;
  }

  const demoResources = [
    {
      title: 'Community Guidelines',
      description: 'Richtlinien für die Community-Nutzung und Verhaltensregeln.',
      type: 'file',
      categoryId: null,
      tags: ['guidelines', 'community', 'rules'],
      visibility: 'member',
      isFeatured: true,
      createdByUserId: editor.id,
      versions: [
        {
          versionLabel: 'v1.0',
          changelog: 'Initial version',
          fileKeyOrUrl: 'data:text/plain;base64,V2lsbGtvb21tZW4gaW4gZGVyIENvbW11bml0eSE=',
          mimeType: 'text/plain',
          sizeBytes: 100,
          createdAt: new Date().toISOString()
        }
      ],
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      title: 'API Documentation',
      description: 'Vollständige API-Dokumentation für Entwickler.',
      type: 'link',
      categoryId: null,
      tags: ['api', 'documentation', 'developer'],
      visibility: 'member',
      isFeatured: false,
      createdByUserId: editor.id,
      versions: [
        {
          versionLabel: 'v1.0',
          changelog: 'Initial version',
          fileKeyOrUrl: 'https://api.undbauen.de/docs',
          mimeType: 'text/html',
          sizeBytes: 0,
          createdAt: new Date().toISOString()
        }
      ],
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      title: 'Design System',
      description: 'Unser Design System mit Komponenten und Richtlinien.',
      type: 'file',
      categoryId: null,
      tags: ['design', 'ui', 'components'],
      visibility: 'public',
      isFeatured: true,
      createdByUserId: editor.id,
      versions: [
        {
          versionLabel: 'v1.0',
          changelog: 'Initial version',
          fileKeyOrUrl: 'data:text/plain;base64,RGVzaWduIFN5c3RlbSBHdWlkZWxpbmVz',
          mimeType: 'text/plain',
          sizeBytes: 200,
          createdAt: new Date().toISOString()
        }
      ],
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  for (const resource of demoResources) {
    await resourceRepository.create(resource);
  }
  console.log('✅ Seeded resources');
}

/**
 * Seed demo knowledge items
 */
async function seedKnowledge() {
  const existingKnowledge = await knowledgeRepository.findAll();
  if (existingKnowledge.length > 0) {
    console.log('Knowledge items already exist, skipping...');
    return;
  }

  const users = await userRepository.findAll();
  const editor = users.find(u => u.role === 'editor');
  const moderator = users.find(u => u.role === 'moderator');

  if (!editor || !moderator) {
    console.warn('No users found for knowledge seeding');
    return;
  }

  const demoKnowledge = [
    {
      title: 'Wie erstelle ich ein Ticket?',
      summary: 'Eine Schritt-für-Schritt-Anleitung zur Erstellung eines Tickets in der Ideenbox.',
      type: 'guide',
      tags: ['tickets', 'how-to', 'getting-started'],
      links: [
        { title: 'Ticket-Beispiele', url: '/app/tickets.html' }
      ],
      status: 'published',
      createdByUserId: editor.id,
      reviewedByUserId: moderator.id,
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      title: 'FAQ: Häufig gestellte Fragen',
      summary: 'Antworten auf die häufigsten Fragen zur Plattform.',
      type: 'faq',
      tags: ['faq', 'help', 'questions'],
      links: [],
      status: 'published',
      createdByUserId: editor.id,
      reviewedByUserId: moderator.id,
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      title: 'Best Practices für Forum-Posts',
      summary: 'Tipps und Tricks für das Erstellen von guten Forum-Posts.',
      type: 'article',
      tags: ['forum', 'best-practices', 'content'],
      links: [],
      status: 'reviewed',
      createdByUserId: editor.id,
      reviewedByUserId: moderator.id,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      title: 'Tutorial: Erste Schritte',
      summary: 'Ein umfassendes Tutorial für neue Benutzer.',
      type: 'tutorial',
      tags: ['tutorial', 'getting-started', 'onboarding'],
      links: [],
      status: 'draft',
      createdByUserId: editor.id,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  for (const item of demoKnowledge) {
    await knowledgeRepository.create(item);
  }
  console.log('✅ Seeded knowledge items');
}

/**
 * Seed demo public pages
 */
async function seedPublicPages() {
  const existingPages = await pageRepository.findAll();
  const landingPage = existingPages.find(p => p.slug === 'landing');
  
  if (landingPage) {
    console.log('Landing page already exists, skipping...');
    return;
  }

  const users = await userRepository.findAll();
  const editor = users.find(u => u.role === 'editor');

  if (!editor) {
    console.warn('No users found for page seeding');
    return;
  }

  const landingPageData = {
    slug: 'landing',
    status: 'published',
    publishedVersionId: 1,
    sections: [
      {
        id: 'hero',
        type: 'hero',
        title: 'Hero Section',
        heroText: 'Willkommen bei …undbauen',
        heroImage: '',
        visibility: 'public',
        order: 0
      },
      {
        id: 'mission',
        type: 'mission',
        title: 'Unsere Mission',
        subtitle: 'Gemeinsam bauen wir die Zukunft',
        content: 'Wir sind eine Community von Innovatoren, Entwicklern und Visionären, die gemeinsam an spannenden Projekten arbeiten.',
        visibility: 'public',
        order: 1
      },
      {
        id: 'features',
        type: 'features',
        title: 'Features',
        features: [
          { title: 'Community', description: 'Tausche dich mit Gleichgesinnten aus' },
          { title: 'Events', description: 'Nimm an spannenden Events teil' },
          { title: 'Knowledge Base', description: 'Lerne von der Community' }
        ],
        visibility: 'public',
        order: 2
      }
    ],
    versions: [
      {
        pageId: 'landing',
        versionNumber: 1,
        createdByUserId: editor.id,
        snapshotJson: JSON.stringify([
          {
            id: 'hero',
            type: 'hero',
            title: 'Hero Section',
            heroText: 'Willkommen bei …undbauen',
            heroImage: '',
            visibility: 'public',
            order: 0
          }
        ]),
        createdAt: new Date().toISOString()
      }
    ],
    updatedAt: new Date().toISOString()
  };

  await pageRepository.create(landingPageData);
  console.log('✅ Seeded public pages');
}

/**
 * Clear all demo data (for testing)
 */
export async function clearDemoData() {
  console.log('🗑️ Clearing demo data...');
  
  try {
    // Get all items and delete them one by one
    const tickets = await ticketRepository.findAll();
    for (const ticket of tickets) {
      await ticketRepository.delete(ticket.id);
    }
    
    const notifications = await notificationRepository.findAll();
    for (const notification of notifications) {
      await notificationRepository.delete(notification.id);
    }
    
    const reports = await reportRepository.findAll();
    for (const report of reports) {
      await reportRepository.delete(report.id);
    }
    
    const resources = await resourceRepository.findAll();
    for (const resource of resources) {
      await resourceRepository.delete(resource.id);
    }
    
    const knowledge = await knowledgeRepository.findAll();
    for (const item of knowledge) {
      await knowledgeRepository.delete(item.id);
    }
    
    console.log('✅ Demo data cleared!');
    return true;
  } catch (error) {
    console.error('❌ Error clearing demo data:', error);
    return false;
  }
}

