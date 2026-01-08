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
      (item.body && item.body.toLowerCase().includes(queryLower)) ||
      (item.tags && item.tags.some(tag => tag.toLowerCase().includes(queryLower)))
    );
  }

  /**
   * Filter by topics
   * @param {Array<string>} topicIds - Array of topic IDs
   * @returns {Promise<Array>}
   */
  async findByTopics(topicIds) {
    const all = await this.findAll();
    if (!topicIds || topicIds.length === 0) return all;
    return all.filter(item => 
      item.topics && item.topics.some(topicId => topicIds.includes(topicId))
    );
  }

  /**
   * Filter by tags
   * @param {Array<string>} tags - Array of tags
   * @returns {Promise<Array>}
   */
  async findByTags(tags) {
    const all = await this.findAll();
    if (!tags || tags.length === 0) return all;
    const tagsLower = tags.map(t => t.toLowerCase());
    return all.filter(item =>
      item.tags && item.tags.some(tag => tagsLower.includes(tag.toLowerCase()))
    );
  }

  /**
   * Filter by type
   * @param {string} type - Knowledge item type
   * @returns {Promise<Array>}
   */
  async findByType(type) {
    const all = await this.findAll();
    return all.filter(item => item.type === type);
  }

  /**
   * Complex filter with multiple criteria
   * @param {Object} filters - { topics, tags, type, search }
   * @returns {Promise<Array>}
   */
  async filter(filters) {
    let results = await this.findAll();

    // Filter by status (only published for members)
    results = results.filter(item => item.status === 'published');

    // Filter by topics
    if (filters.topics && filters.topics.length > 0) {
      results = results.filter(item =>
        item.topics && item.topics.some(topicId => filters.topics.includes(topicId))
      );
    }

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      const tagsLower = filters.tags.map(t => t.toLowerCase());
      results = results.filter(item =>
        item.tags && item.tags.some(tag => tagsLower.includes(tag.toLowerCase()))
      );
    }

    // Filter by type
    if (filters.type && filters.type !== 'all') {
      results = results.filter(item => item.type === filters.type);
    }

    // Filter by search query
    if (filters.search) {
      const queryLower = filters.search.toLowerCase();
      results = results.filter(item =>
        (item.title && item.title.toLowerCase().includes(queryLower)) ||
        (item.summary && item.summary.toLowerCase().includes(queryLower)) ||
        (item.body && item.body.toLowerCase().includes(queryLower)) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(queryLower)))
      );
    }

    return results;
  }

  /**
   * Get all unique tags from all knowledge items
   * @returns {Promise<Array<string>>}
   */
  async getAllTags() {
    const all = await this.findAll();
    const tagSet = new Set();
    all.forEach(item => {
      if (item.tags) {
        item.tags.forEach(tag => tagSet.add(tag));
      }
    });
    return Array.from(tagSet).sort();
  }
}

export const knowledgeRepository = new KnowledgeRepository();
