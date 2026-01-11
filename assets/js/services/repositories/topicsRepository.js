/* Topics Repository: Repository for Knowledge Topics (controlled vocabulary) */

import { storageAdapter as api } from '../storageAdapter.js';

class TopicsRepository {
  /**
   * Find all topics
   * @returns {Promise<Array>}
   */
  async findAll() {
    return api.listTopics();
  }

  /**
   * Find a topic by ID
   * @param {string} id - Topic ID
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    return api.getTopic(id);
  }

  /**
   * Find multiple topics by IDs
   * @param {Array<string>} ids - Array of topic IDs
   * @returns {Promise<Array>}
   */
  async findByIds(ids) {
    const allTopics = await this.findAll();
    return allTopics.filter(topic => ids.includes(topic.id));
  }

  /**
   * Find topics by label (partial match)
   * @param {string} query - Search query
   * @returns {Promise<Array>}
   */
  async search(query) {
    const allTopics = await this.findAll();
    const queryLower = query.toLowerCase();
    return allTopics.filter(topic => 
      topic.label.toLowerCase().includes(queryLower) ||
      (topic.description && topic.description.toLowerCase().includes(queryLower))
    );
  }

  /**
   * Get topics sorted by order
   * @returns {Promise<Array>}
   */
  async findAllSorted() {
    const topics = await this.findAll();
    return topics.sort((a, b) => (a.order || 0) - (b.order || 0));
  }
}

export const topicsRepository = new TopicsRepository();




