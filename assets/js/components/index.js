/**
 * Components Barrel Export
 *
 * Central export point for all components.
 * Simplifies imports: import { toast, sidebar } from './components/index.js'
 *
 * @module components/index
 */

// UI Components
export { toast } from './toast.js';
export { initSidebar, updateBadges, renderSidebar, getNavigationItems } from './sidebar.js';
export { breadcrumbs } from './breadcrumbs.js';
export { richTextEditor } from './richTextEditor.js';
export { chartRenderer } from './chartRenderer.js';
export { avatarGenerator } from './avatarGenerator.js';

// Modals & Forms
export { confirmModal } from './confirmModal.js';
export { successModal } from './successModal.js';
export { reportModal } from './reportModal.js';
export { memberModal } from './memberModal.js';
export { ticketWizard, showTicketWizard } from './ticketWizard.js';

// Utilities
export { createSkeleton } from './skeleton.js';
export { renderErrorState } from './emptyStates.js';
export { initGlobalErrorBoundary } from './errorBoundary.js';
export { formValidator } from './formValidator.js';
export { focusTrap } from './focusTrap.js';
export { createProgressBar, updateProgressBar, removeProgressBar } from './progressBar.js';
export { createPasswordStrengthIndicator, calculatePasswordStrength } from './passwordStrength.js';

// Features
export { notificationBell } from './notificationBell.js';
export { search } from './search.js';
export { lazyLoad } from './lazyLoad.js';
export { optimizedImage } from './optimizedImage.js';
export { parallax } from './parallax.js';
export { heroAnimation } from './heroAnimation.js';
export { hoverCard } from './hoverCard.js';
export { scrollNavigation } from './scrollNavigation.js';
export { onboarding } from './onboarding.js';
export { messageFeatures } from './messageFeatures.js';
export { sectionEditor } from './sectionEditor.js';
export { icons, getIcon } from './icons.js';




