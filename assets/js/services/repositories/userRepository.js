/* User Repository */

import { StorageRepository } from './storageRepository.js';

export class UserRepository extends StorageRepository {
  constructor() {
    super('users');
  }

  /**
   * Find user by email
   * @param {string} email
   * @returns {Promise<Object|null>}
   */
  async findByEmail(email) {
    const users = await this.findAll();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  /**
   * Find users by role
   * @param {string} role
   * @returns {Promise<Array>}
   */
  async findByRole(role) {
    return this.findAll({ role });
  }

  /**
   * Find users by status
   * @param {string} status
   * @returns {Promise<Array>}
   */
  async findByStatus(status) {
    return this.findAll({ status });
  }
}

export const userRepository = new UserRepository();


