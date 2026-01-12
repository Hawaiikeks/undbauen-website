/**
 * Pages Barrel Export
 *
 * Central export point for all page modules.
 * Simplifies imports: import { renderDashboard, renderForum } from './pages/index.js'
 *
 * @module pages/index
 */

// Main Pages
export { renderDashboard } from './dashboard.js';
export { renderEvents } from './events.js';
export { renderForum, performForumSearch } from './forum.js';
export { renderForumCategory } from './forumCategory.js';
export { renderForumThread } from './forumThread.js';
export { renderMessages } from './messages.js';
export { renderCompose } from './compose.js';
export { renderMembers } from './members.js';
export { renderMember } from './memberProfile.js';
export { renderMyProfile, renderProfileProgress, getAllAvailableTags } from './myProfile.js';
export { renderMonatsupdates } from './monatsupdates.js';
export { renderAdmin } from './admin.js';

// Admin Pages
export { renderResources } from './resources.js';
export { renderResourcesAdmin } from './resourcesAdmin.js';
export { renderKnowledge } from './knowledge.js';
export { renderKnowledgeAdmin } from './knowledgeAdmin.js';
export { renderPublicPagesEditor } from './publicPagesEditor.js';
export { renderTickets } from './tickets.js';
export { renderInbox } from './inbox.js';
export { renderReports } from './reports.js';
export { renderAudit } from './audit.js';








