/* Notification Repository */

import { StorageRepository } from './storageRepository.js';

export class NotificationRepository extends StorageRepository {
  constructor() {
    super('notifications');
  }

  /**
   * Find notifications for user
   * @param {string} userId
   * @returns {Promise<Array>}
   */
  async findByUserId(userId) {
    return this.findAll({ userId });
  }

  /**
   * Find unread notifications for user
   * @param {string} userId
   * @returns {Promise<Array>}
   */
  async findUnreadByUserId(userId) {
    const all = await this.findAll({ userId });
    return all.filter(n => !n.isRead);
  }

  /**
   * Mark notification as read
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async markAsRead(id) {
    return this.update(id, { isRead: true });
  }

  /**
   * Mark all notifications as read for user
   * @param {string} userId
   * @returns {Promise<number>}
   */
  async markAllAsRead(userId) {
    const unread = await this.findUnreadByUserId(userId);
    const promises = unread.map(n => this.markAsRead(n.id));
    await Promise.all(promises);
    return unread.length;
  }

  /**
   * Get unread count for user
   * @param {string} userId
   * @returns {Promise<number>}
   */
  async getUnreadCount(userId) {
    const unread = await this.findUnreadByUserId(userId);
    return unread.length;
  }
}

export const notificationRepository = new NotificationRepository();


