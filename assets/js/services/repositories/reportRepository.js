/* Report Repository */

import { StorageRepository } from './storageRepository.js';

export class ReportRepository extends StorageRepository {
  constructor() {
    super('reports');
  }

  /**
   * Find reports by status
   * @param {string} status
   * @returns {Promise<Array>}
   */
  async findByStatus(status) {
    return this.findAll({ status });
  }

  /**
   * Find reports by target
   * @param {string} targetType
   * @param {string} targetId
   * @returns {Promise<Array>}
   */
  async findByTarget(targetType, targetId) {
    return this.findAll({ targetType, targetId });
  }

  /**
   * Find pending reports
   * @returns {Promise<Array>}
   */
  async findPending() {
    return this.findAll({ status: 'pending' });
  }
}

export const reportRepository = new ReportRepository();


