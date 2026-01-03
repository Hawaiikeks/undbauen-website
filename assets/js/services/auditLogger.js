/* Audit Logger: Service for logging critical actions */

import { auditLogRepository } from './repositories/auditLogRepository.js';
import { api } from './apiClient.js';

/**
 * Log an audit event
 * @param {string} actionType - Type of action (e.g., 'ticket.status_change', 'report.action', 'user.ban')
 * @param {string} entityType - Type of entity (e.g., 'ticket', 'report', 'user')
 * @param {string} entityId - ID of the entity
 * @param {Object} metaJson - Additional metadata
 * @returns {Promise<Object>}
 */
export async function logAuditEvent(actionType, entityType, entityId, metaJson = {}) {
  const user = api.me();
  if (!user) {
    console.warn('Cannot log audit event: user not logged in');
    return null;
  }

  const auditLog = {
    actorUserId: user.id,
    actionType,
    entityType,
    entityId,
    metaJson,
    createdAt: new Date().toISOString()
  };

  try {
    return await auditLogRepository.create(auditLog);
  } catch (error) {
    console.error('Error logging audit event:', error);
    return null;
  }
}

/**
 * Log ticket status change
 * @param {string} ticketId
 * @param {string} oldStatus
 * @param {string} newStatus
 * @returns {Promise<Object>}
 */
export async function logTicketStatusChange(ticketId, oldStatus, newStatus) {
  return logAuditEvent(
    'ticket.status_change',
    'ticket',
    ticketId,
    { oldStatus, newStatus }
  );
}

/**
 * Log report action
 * @param {string} reportId
 * @param {string} action - 'dismiss', 'remove', 'warn', 'mute', 'ban'
 * @param {Object} details
 * @returns {Promise<Object>}
 */
export async function logReportAction(reportId, action, details = {}) {
  return logAuditEvent(
    'report.action',
    'report',
    reportId,
    { action, ...details }
  );
}

/**
 * Log publish action
 * @param {string} entityType - 'page', 'resource', 'knowledge'
 * @param {string} entityId
 * @param {Object} details
 * @returns {Promise<Object>}
 */
export async function logPublishAction(entityType, entityId, details = {}) {
  return logAuditEvent(
    'publish',
    entityType,
    entityId,
    details
  );
}

/**
 * Log user action
 * @param {string} userId
 * @param {string} action - 'mute', 'ban', 'role_change', 'status_change'
 * @param {Object} details
 * @returns {Promise<Object>}
 */
export async function logUserAction(userId, action, details = {}) {
  return logAuditEvent(
    `user.${action}`,
    'user',
    userId,
    details
  );
}


