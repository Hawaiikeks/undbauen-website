/* Page Repository */

import { StorageRepository } from './storageRepository.js';

export class PageRepository extends StorageRepository {
  constructor() {
    super('pages');
  }

  /**
   * Find page by slug
   * @param {string} slug
   * @returns {Promise<Object|null>}
   */
  async findBySlug(slug) {
    const pages = await this.findAll({ slug });
    return pages[0] || null;
  }

  /**
   * Get published page
   * @param {string} slug
   * @returns {Promise<Object|null>}
   */
  async getPublished(slug) {
    const page = await this.findBySlug(slug);
    if (!page || page.status !== 'published' || !page.publishedVersionId) {
      return null;
    }
    return page;
  }
}

export const pageRepository = new PageRepository();












