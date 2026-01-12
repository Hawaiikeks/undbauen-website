/**
 * Messages Routes
 * Private Messages Management
 */

import express from 'express';
import pool from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { body, param, handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

/**
 * GET /api/messages/threads
 * List message threads for current user (requires auth)
 */
router.get('/threads', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT ON (mt.id) 
              mt.id, mt.subject, mt.created_at, mt.updated_at,
              CASE 
                WHEN mtp.user_id = $1 THEN mtp.is_read
                ELSE true
              END as is_read,
              CASE 
                WHEN mtp.user_id = $1 THEN mtp.last_read_at
                ELSE NULL
              END as last_read_at,
              (SELECT content FROM messages m 
               WHERE m.thread_id = mt.id 
               ORDER BY m.created_at DESC LIMIT 1) as last_message,
              (SELECT created_at FROM messages m 
               WHERE m.thread_id = mt.id 
               ORDER BY m.created_at DESC LIMIT 1) as last_message_at,
              (SELECT COUNT(*) FROM messages m 
               WHERE m.thread_id = mt.id 
               AND m.sender_id != $1) as unread_count
       FROM message_threads mt
       JOIN message_thread_participants mtp ON mt.id = mtp.thread_id
       WHERE mtp.user_id = $1
       ORDER BY mt.id, mt.updated_at DESC`,
      [req.user.id]
    );

    res.json({
      threads: result.rows.map(thread => ({
        id: thread.id,
        subject: thread.subject,
        isRead: thread.is_read,
        lastReadAt: thread.last_read_at,
        lastMessage: thread.last_message,
        lastMessageAt: thread.last_message_at,
        unreadCount: parseInt(thread.unread_count, 10),
        createdAt: thread.created_at,
        updatedAt: thread.updated_at
      }))
    });
  } catch (error) {
    console.error('List threads error:', error);
    res.status(500).json({ error: 'Failed to list threads' });
  }
});

/**
 * GET /api/messages/threads/:id
 * Get thread details (requires auth)
 */
router.get('/threads/:id', authenticate, param('id').isUUID(), handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is participant
    const participantCheck = await pool.query(
      'SELECT thread_id FROM message_thread_participants WHERE thread_id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (participantCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized to access this thread' });
    }

    const result = await pool.query(
      `SELECT mt.id, mt.subject, mt.created_at, mt.updated_at,
              ARRAY_AGG(DISTINCT u.id) as participant_ids,
              ARRAY_AGG(DISTINCT u.email) as participant_emails
       FROM message_threads mt
       JOIN message_thread_participants mtp ON mt.id = mtp.thread_id
       JOIN users u ON mtp.user_id = u.id
       WHERE mt.id = $1
       GROUP BY mt.id, mt.subject, mt.created_at, mt.updated_at`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    const thread = result.rows[0];

    res.json({
      id: thread.id,
      subject: thread.subject,
      participants: thread.participant_ids.map((id, idx) => ({
        id,
        email: thread.participant_emails[idx]
      })),
      createdAt: thread.created_at,
      updatedAt: thread.updated_at
    });
  } catch (error) {
    console.error('Get thread error:', error);
    res.status(500).json({ error: 'Failed to get thread' });
  }
});

/**
 * GET /api/messages/threads/:id/messages
 * Get thread messages (requires auth)
 */
router.get('/threads/:id/messages', authenticate, param('id').isUUID(), handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is participant
    const participantCheck = await pool.query(
      'SELECT thread_id FROM message_thread_participants WHERE thread_id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (participantCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized to access this thread' });
    }

    const result = await pool.query(
      `SELECT m.id, m.content, m.created_at,
              u.id as sender_id, u.first_name as sender_first_name,
              u.last_name as sender_last_name, u.email as sender_email,
              p.avatar_url as sender_avatar_url
       FROM messages m
       LEFT JOIN users u ON m.sender_id = u.id
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE m.thread_id = $1
       ORDER BY m.created_at ASC`,
      [id]
    );

    res.json({
      messages: result.rows.map(msg => ({
        id: msg.id,
        content: msg.content,
        createdAt: msg.created_at,
        sender: msg.sender_id ? {
          id: msg.sender_id,
          firstName: msg.sender_first_name,
          lastName: msg.sender_last_name,
          email: msg.sender_email,
          avatarUrl: msg.sender_avatar_url
        } : null
      }))
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

/**
 * POST /api/messages/threads
 * Create new message thread (requires auth)
 */
router.post('/threads', authenticate, [
  body('subject').optional().trim().isLength({ max: 255 }),
  body('recipientEmail').isEmail().normalizeEmail(),
  body('content').trim().notEmpty().isLength({ min: 1 }),
  handleValidationErrors
], async (req, res) => {
  try {
    const { subject, recipientEmail, content } = req.body;

    // Get recipient user
    const recipientResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [recipientEmail.toLowerCase()]
    );

    if (recipientResult.rows.length === 0) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    const recipientId = recipientResult.rows[0].id;

    // Don't allow messaging yourself
    if (recipientId === req.user.id) {
      return res.status(400).json({ error: 'Cannot message yourself' });
    }

    // Create thread
    const threadResult = await pool.query(
      'INSERT INTO message_threads (subject, created_by) VALUES ($1, $2) RETURNING id',
      [subject || null, req.user.id]
    );

    const threadId = threadResult.rows[0].id;

    // Add participants
    await pool.query(
      'INSERT INTO message_thread_participants (thread_id, user_id) VALUES ($1, $2), ($1, $3)',
      [threadId, req.user.id, recipientId]
    );

    // Create first message
    const messageResult = await pool.query(
      'INSERT INTO messages (thread_id, sender_id, content) VALUES ($1, $2, $3) RETURNING id, content, created_at',
      [threadId, req.user.id, content]
    );

    // Update thread updated_at
    await pool.query(
      'UPDATE message_threads SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [threadId]
    );

    res.status(201).json({
      success: true,
      thread: {
        id: threadId,
        subject: subject || null
      },
      message: {
        id: messageResult.rows[0].id,
        content: messageResult.rows[0].content,
        createdAt: messageResult.rows[0].created_at
      }
    });
  } catch (error) {
    console.error('Create thread error:', error);
    res.status(500).json({ error: 'Failed to create thread' });
  }
});

/**
 * POST /api/messages/threads/:id/messages
 * Send message in thread (requires auth)
 */
router.post('/threads/:id/messages', authenticate, param('id').isUUID(), [
  body('content').trim().notEmpty().isLength({ min: 1 }),
  handleValidationErrors
], async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    // Check if user is participant
    const participantCheck = await pool.query(
      'SELECT thread_id FROM message_thread_participants WHERE thread_id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (participantCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized to send message in this thread' });
    }

    // Create message
    const messageResult = await pool.query(
      'INSERT INTO messages (thread_id, sender_id, content) VALUES ($1, $2, $3) RETURNING id, content, created_at',
      [id, req.user.id, content]
    );

    // Update thread updated_at
    await pool.query(
      'UPDATE message_threads SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );

    // Mark thread as unread for other participants
    await pool.query(
      `UPDATE message_thread_participants 
       SET is_read = false 
       WHERE thread_id = $1 AND user_id != $2`,
      [id, req.user.id]
    );

    res.status(201).json({
      success: true,
      message: {
        id: messageResult.rows[0].id,
        content: messageResult.rows[0].content,
        createdAt: messageResult.rows[0].created_at
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

/**
 * PATCH /api/messages/threads/:id/read
 * Mark thread as read (requires auth)
 */
router.patch('/threads/:id/read', authenticate, param('id').isUUID(), handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is participant
    const participantCheck = await pool.query(
      'SELECT thread_id FROM message_thread_participants WHERE thread_id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (participantCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized to access this thread' });
    }

    // Mark as read
    await pool.query(
      `UPDATE message_thread_participants 
       SET is_read = true, last_read_at = CURRENT_TIMESTAMP 
       WHERE thread_id = $1 AND user_id = $2`,
      [id, req.user.id]
    );

    res.json({ success: true, message: 'Thread marked as read' });
  } catch (error) {
    console.error('Mark thread read error:', error);
    res.status(500).json({ error: 'Failed to mark thread as read' });
  }
});

export default router;






