/* Audit Log Repository */

import { StorageRepository } from './storageRepository.js';

export class AuditLogRepository extends StorageRepository {
  constructor() {
    super('auditLogs');
  }

  /**
   * Find audit logs by actor
   * @param {string} userId
   * @returns {Promise<Array>}
   */
  async findByActor(userId) {
    return this.findAll({ actorUserId: userId });
  }

  /**
   * Find audit logs by entity
   * @param {string} entityType
   * @param {string} entityId
   * @returns {Promise<Array>}
   */
  async findByEntity(entityType, entityId) {
    return this.findAll({ entityType, entityId });
  }

  /**
   * Find audit logs by action type
   * @param {string} actionType
   * @returns {Promise<Array>}
   */
  async findByActionType(actionType) {
    return this.findAll({ actionType });
  }

  /**
   * Get recent audit logs
   * @param {number} limit
   * @returns {Promise<Array>}
   */
  async findRecent(limit = 100) {
    const all = await this.findAll();
    return all
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  }
}

export const auditLogRepository = new AuditLogRepository();


