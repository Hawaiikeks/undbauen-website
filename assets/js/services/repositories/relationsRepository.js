/* Relations Repository: Repository for Knowledge Item Relations */

import { storageAdapter as api } from '../storageAdapter.js';

class RelationsRepository {
  /**
   * Find all relations
   * @returns {Promise<Array>}
   */
  async findAll() {
    return api.listRelations();
  }

  /**
   * Find relations FROM a specific item
   * @param {string} itemId - Source item ID
   * @returns {Promise<Array>}
   */
  async findByFromItem(itemId) {
    return api.getRelationsFrom(itemId);
  }

  /**
   * Find relations TO a specific item (backlinks)
   * @param {string} itemId - Target item ID
   * @returns {Promise<Array>}
   */
  async findByToItem(itemId) {
    return api.getRelationsTo(itemId);
  }

  /**
   * Find both outgoing and incoming relations for an item
   * @param {string} itemId - Item ID
   * @returns {Promise<Object>} - { outgoing: [], incoming: [] }
   */
  async findForItem(itemId) {
    const outgoing = await this.findByFromItem(itemId);
    const incoming = await this.findByToItem(itemId);
    return { outgoing, incoming };
  }

  /**
   * Create a new relation
   * @param {Object} data - { fromItemId, toItemId, relationType }
   * @returns {Promise<Object>}
   */
  async create(data) {
    return api.createRelation(data);
  }

  /**
   * Delete a relation
   * @param {string} id - Relation ID
   * @returns {Promise<Object>}
   */
  async delete(id) {
    return api.deleteRelation(id);
  }

  /**
   * Check if a relation exists between two items
   * @param {string} fromId - Source item ID
   * @param {string} toId - Target item ID
   * @returns {Promise<boolean>}
   */
  async exists(fromId, toId) {
    const relations = await this.findByFromItem(fromId);
    return relations.some(r => r.toItemId === toId);
  }
}

export const relationsRepository = new RelationsRepository();




