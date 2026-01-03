/* Resource Repository: Repository for Resource data */

import { StorageRepository } from './storageRepository.js';

class ResourceRepository extends StorageRepository {
  constructor() {
    super('resources');
  }

  /**
   * Find resources by visibility
   * @param {string} visibility - 'member' or 'public'
   * @returns {Promise<Array>}
   */
  async findByVisibility(visibility) {
    return this.findAll({ visibility });
  }
}

export const resourceRepository = new ResourceRepository();
