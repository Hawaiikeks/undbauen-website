/* Tool Repository: Repository for Tool Hub data */

import { api } from '../apiClient.js';

class ToolRepository {
  /**
   * Find all tools
   * @returns {Promise<Array>}
   */
  async findAll() {
    return api.listTools() || [];
  }

  /**
   * Find tool by ID
   * @param {string} id - Tool ID
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    return api.getTool(id) || null;
  }

  /**
   * Find tools by visibility
   * @param {string} visibility - 'member' or 'public'
   * @returns {Promise<Array>}
   */
  async findByVisibility(visibility) {
    const all = await this.findAll();
    return all.filter(tool => tool.visibility === visibility || tool.visibility === 'public');
  }

  /**
   * Find all visible tools (sorted by order)
   * @returns {Promise<Array>}
   */
  async findVisible() {
    const all = await this.findAll();
    return all
      .filter(tool => tool.visibility === 'member' || tool.visibility === 'public')
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  /**
   * Create a new tool (admin only)
   * @param {Object} toolData - Tool data
   * @returns {Promise<Object>}
   */
  async create(toolData) {
    return api.adminCreateTool(toolData);
  }

  /**
   * Update a tool (admin only)
   * @param {string} id - Tool ID
   * @param {Object} toolData - Updated tool data
   * @returns {Promise<Object>}
   */
  async update(id, toolData) {
    return api.adminUpdateTool(id, toolData);
  }

  /**
   * Delete a tool (admin only)
   * @param {string} id - Tool ID
   * @returns {Promise<Object>}
   */
  async delete(id) {
    return api.adminDeleteTool(id);
  }

  /**
   * Update tool order (admin only)
   * @param {Array<{id: string, order: number}>} orderUpdates
   * @returns {Promise<Object>}
   */
  async updateOrder(orderUpdates) {
    return api.adminUpdateToolOrder(orderUpdates);
  }
}

export const toolRepository = new ToolRepository();
