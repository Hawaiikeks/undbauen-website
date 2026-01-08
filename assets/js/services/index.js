/**
 * Services Barrel Export
 *
 * Central export point for all services.
 * Simplifies imports: import { api, monitoring } from './services/index.js'
 *
 * @module services/index
 */

// Core Services
export { api } from './apiClient.js';
export { storageAdapter } from './storageAdapter.js';

// Security & Validation
export * from './security.js';
export * from './validation.js';
export * from './passwordHash.js';
export * from './rateLimiter.js';

// Error Handling & Monitoring
export { errorHandler, handleError, wrapAsync, ErrorCategory } from './errorHandler.js';
export { monitoring } from './monitoring.js';

// Routing & Auth
export * from './router.js';
export * from './authGuard.js';

// Utilities
export * from './logger.js';
export * from './metaTags.js';
export { offlineManager } from './offlineManager.js';

// Repositories
export { ticketRepository } from './repositories/ticketRepository.js';
export { userRepository } from './repositories/userRepository.js';
export { resourceRepository } from './repositories/resourceRepository.js';
export { knowledgeRepository } from './repositories/knowledgeRepository.js';
export { pageRepository } from './repositories/pageRepository.js';
export { reportRepository } from './repositories/reportRepository.js';
export { auditLogRepository } from './repositories/auditLogRepository.js';
export { notificationRepository } from './repositories/notificationRepository.js';








