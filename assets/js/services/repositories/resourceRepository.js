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

  /**
   * Find resources by category
   * @param {string} categoryId - Category ID
   * @returns {Promise<Array>}
   */
  async findByCategory(categoryId) {
    const all = await this.findAll();
    return all.filter(res => res.categoryId === categoryId);
  }

  /**
   * Find featured resources
   * @returns {Promise<Array>}
   */
  async findFeatured() {
    const all = await this.findAll();
    return all.filter(res => res.isFeatured === true);
  }

  /**
   * Find resources by type
   * @param {string} type - Resource type (file|link|tool|template|video|collection)
   * @returns {Promise<Array>}
   */
  async findByType(type) {
    const all = await this.findAll();
    return all.filter(res => res.type === type);
  }

  /**
   * Complex filter with multiple criteria
   * @param {Object} filters - { categoryId, type, tags, context, search }
   * @returns {Promise<Array>}
   */
  async filter(filters) {
    let results = await this.findAll();

    // Filter by category
    if (filters.categoryId) {
      results = results.filter(res => res.categoryId === filters.categoryId);
    }

    // Filter by type
    if (filters.type && filters.type !== 'all') {
      results = results.filter(res => res.type === filters.type);
    }

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      const tagsLower = filters.tags.map(t => t.toLowerCase());
      results = results.filter(res =>
        res.tags && res.tags.some(tag => tagsLower.includes(tag.toLowerCase()))
      );
    }

    // Filter by context (event/post)
    if (filters.context) {
      results = results.filter(res =>
        res.contextRefs && res.contextRefs.some(ref => ref.id === filters.context)
      );
    }

    // Filter by search query
    if (filters.search) {
      const queryLower = filters.search.toLowerCase();
      results = results.filter(res =>
        (res.title && res.title.toLowerCase().includes(queryLower)) ||
        (res.description && res.description.toLowerCase().includes(queryLower)) ||
        (res.tags && res.tags.some(tag => tag.toLowerCase().includes(queryLower)))
      );
    }

    return results;
  }

  /**
   * Get all unique tags from all resources
   * @returns {Promise<Array<string>>}
   */
  async getAllTags() {
    const all = await this.findAll();
    const tagSet = new Set();
    all.forEach(res => {
      if (res.tags) {
        res.tags.forEach(tag => tagSet.add(tag));
      }
    });
    return Array.from(tagSet).sort();
  }

  /**
   * Search resources
   * @param {string} query - Search query
   * @returns {Promise<Array>}
   */
  async search(query) {
    const all = await this.findAll();
    const queryLower = query.toLowerCase();
    return all.filter(res =>
      (res.title && res.title.toLowerCase().includes(queryLower)) ||
      (res.description && res.description.toLowerCase().includes(queryLower)) ||
      (res.tags && res.tags.some(tag => tag.toLowerCase().includes(queryLower)))
    );
  }
}

export const resourceRepository = new ResourceRepository();
