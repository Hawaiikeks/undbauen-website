/* Knowledge Repository: Repository for KnowledgeItem data */

import { StorageRepository } from './storageRepository.js';

class KnowledgeRepository extends StorageRepository {
  constructor() {
    super('knowledge');
  }

  /**
   * Find all published knowledge items
   * @returns {Promise<Array>}
   */
  async findPublished() {
    const all = await this.findAll();
    return all.filter(item => item.status === 'published');
  }

  /**
   * Search knowledge items
   * @param {string} query - Search query
   * @returns {Promise<Array>}
   */
  async search(query) {
    const all = await this.findAll();
    const queryLower = query.toLowerCase();
    return all.filter(item => 
      (item.title && item.title.toLowerCase().includes(queryLower)) ||
      (item.summary && item.summary.toLowerCase().includes(queryLower)) ||
      (item.tags && item.tags.some(tag => tag.toLowerCase().includes(queryLower)))
    );
  }
}

export const knowledgeRepository = new KnowledgeRepository();
