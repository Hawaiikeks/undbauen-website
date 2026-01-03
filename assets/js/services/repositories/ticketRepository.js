/* Ticket Repository */

import { StorageRepository } from './storageRepository.js';

export class TicketRepository extends StorageRepository {
  constructor() {
    super('tickets');
  }

  /**
   * Find tickets by user ID
   * @param {string} userId
   * @returns {Promise<Array>}
   */
  async findByUserId(userId) {
    return this.findAll({ createdByUserId: userId });
  }

  /**
   * Find tickets by status
   * @param {string} status
   * @returns {Promise<Array>}
   */
  async findByStatus(status) {
    return this.findAll({ status });
  }

  /**
   * Find tickets assigned to user
   * @param {string} userId
   * @returns {Promise<Array>}
   */
  async findByAssignedTo(userId) {
    return this.findAll({ assignedToUserId: userId });
  }
}

export const ticketRepository = new TicketRepository();


