/* Categories Repository: Repository for Resource Categories */

import { storageAdapter as api } from '../storageAdapter.js';
import { resourceRepository } from './resourceRepository.js';

class CategoriesRepository {
  /**
   * Find all categories
   * @returns {Promise<Array>}
   */
  async findAll() {
    return api.listResourceCategories();
  }

  /**
   * Find a category by ID
   * @param {string} id - Category ID
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    return api.getResourceCategory(id);
  }

  /**
   * Find only top-level categories (no parent)
   * @returns {Promise<Array>}
   */
  async findTopLevel() {
    return api.listTopLevelCategories();
  }

  /**
   * Find child categories of a parent
   * @param {string} parentId - Parent category ID
   * @returns {Promise<Array>}
   */
  async findChildren(parentId) {
    return api.listChildCategories(parentId);
  }

  /**
   * Count resources in a category
   * @param {string} categoryId - Category ID
   * @returns {Promise<number>}
   */
  async countResources(categoryId) {
    const resources = await resourceRepository.findByCategory(categoryId);
    return resources.length;
  }

  /**
   * Get category with resource count
   * @param {string} categoryId - Category ID
   * @returns {Promise<Object>} - Category with resourceCount property
   */
  async getCategoryWithCount(categoryId) {
    const category = await this.findById(categoryId);
    if (!category) return null;
    
    const resourceCount = await this.countResources(categoryId);
    return { ...category, resourceCount };
  }

  /**
   * Get all categories sorted by order with resource counts
   * @returns {Promise<Array>}
   */
  async findAllWithCounts() {
    const categories = await this.findAll();
    const categoriesWithCounts = await Promise.all(
      categories.map(async (cat) => {
        const count = await this.countResources(cat.id);
        return { ...cat, resourceCount: count };
      })
    );
    return categoriesWithCounts.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  /**
   * Get last updated date of resources in a category
   * @param {string} categoryId - Category ID
   * @returns {Promise<string|null>} - ISO date string
   */
  async getLastUpdated(categoryId) {
    const resources = await resourceRepository.findByCategory(categoryId);
    if (resources.length === 0) return null;
    
    const sorted = resources.sort((a, b) => 
      new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
    );
    return sorted[0].updatedAt || sorted[0].createdAt;
  }
}

export const categoriesRepository = new CategoriesRepository();


