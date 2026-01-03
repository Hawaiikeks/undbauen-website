/* Base Repository: Interface/Abstract Base for all repositories */

/**
 * Base Repository Interface
 * All repositories must implement these methods
 */
export class BaseRepository {
  constructor(storageKey) {
    this.storageKey = storageKey;
  }

  /**
   * Find all entities matching filter
   * @param {Object} filter - Filter criteria
   * @returns {Promise<Array>}
   */
  async findAll(filter = {}) {
    throw new Error('findAll must be implemented');
  }

  /**
   * Find entity by ID
   * @param {string} id - Entity ID
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    throw new Error('findById must be implemented');
  }

  /**
   * Create new entity
   * @param {Object} data - Entity data
   * @returns {Promise<Object>}
   */
  async create(data) {
    throw new Error('create must be implemented');
  }

  /**
   * Update entity
   * @param {string} id - Entity ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object>}
   */
  async update(id, data) {
    throw new Error('update must be implemented');
  }

  /**
   * Delete entity
   * @param {string} id - Entity ID
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    throw new Error('delete must be implemented');
  }

  /**
   * Count entities matching filter
   * @param {Object} filter - Filter criteria
   * @returns {Promise<number>}
   */
  async count(filter = {}) {
    throw new Error('count must be implemented');
  }
}


