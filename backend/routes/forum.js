/**
 * Forum Routes
 * Forum Threads & Posts Management
 */

import express from 'express';
import pool from '../config/database.js';
import { authenticate, requireAdmin, requireModerator } from '../middleware/auth.js';
import { body, param, query, handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

/**
 * GET /api/forum/categories
 * List all forum categories
 */
router.get('/categories', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, description, icon, order_index FROM forum_categories ORDER BY order_index ASC, name ASC'
    );

    res.json({
      categories: result.rows.map(cat => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        orderIndex: cat.order_index
      }))
    });
  } catch (error) {
    console.error('List categories error:', error);
    res.status(500).json({ error: 'Failed to list categories' });
  }
});

/**
 * GET /api/forum/threads
 * List forum threads
 */
router.get('/threads', [
  query('categoryId').optional().isUUID(),
  query('search').optional().trim(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  handleValidationErrors
], async (req, res) => {
  try {
    const { categoryId, search, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT t.id, t.title, t.content, t.is_pinned, t.is_locked,
             t.likes_count, t.replies_count, t.views_count,
             t.last_reply_at, t.created_at,
             c.id as category_id, c.name as category_name,
             u.id as author_id, u.first_name as author_first_name, u.last_name as author_last_name,
             u.email as author_email
      FROM forum_threads t
      LEFT JOIN forum_categories c ON t.category_id = c.id
      LEFT JOIN users u ON t.author_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (categoryId) {
      paramCount++;
      query += ` AND t.category_id = $${paramCount}`;
      params.push(categoryId);
    }

    if (search) {
      paramCount++;
      query += ` AND (t.title ILIKE $${paramCount} OR t.content ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY t.is_pinned DESC, t.last_reply_at DESC NULLS LAST, t.created_at DESC
              LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const result = await pool.query(query, params);

    res.json({
      threads: result.rows.map(thread => ({
        id: thread.id,
        title: thread.title,
        content: thread.content,
        isPinned: thread.is_pinned,
        isLocked: thread.is_locked,
        likesCount: thread.likes_count,
        repliesCount: thread.replies_count,
        viewsCount: thread.views_count,
        lastReplyAt: thread.last_reply_at,
        createdAt: thread.created_at,
        category: thread.category_id ? {
          id: thread.category_id,
          name: thread.category_name
        } : null,
        author: thread.author_id ? {
          id: thread.author_id,
          firstName: thread.author_first_name,
          lastName: thread.author_last_name,
          email: thread.author_email
        } : null
      }))
    });
  } catch (error) {
    console.error('List threads error:', error);
    res.status(500).json({ error: 'Failed to list threads' });
  }
});

/**
 * GET /api/forum/threads/:id
 * Get forum thread by ID
 */
router.get('/threads/:id', param('id').isUUID(), handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;

    // Increment views
    await pool.query(
      'UPDATE forum_threads SET views_count = views_count + 1 WHERE id = $1',
      [id]
    );

    const result = await pool.query(
      `SELECT t.id, t.title, t.content, t.is_pinned, t.is_locked,
              t.likes_count, t.replies_count, t.views_count,
              t.last_reply_at, t.created_at, t.updated_at,
              c.id as category_id, c.name as category_name,
              u.id as author_id, u.first_name as author_first_name, 
              u.last_name as author_last_name, u.email as author_email
       FROM forum_threads t
       LEFT JOIN forum_categories c ON t.category_id = c.id
       LEFT JOIN users u ON t.author_id = u.id
       WHERE t.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    const thread = result.rows[0];

    res.json({
      id: thread.id,
      title: thread.title,
      content: thread.content,
      isPinned: thread.is_pinned,
      isLocked: thread.is_locked,
      likesCount: thread.likes_count,
      repliesCount: thread.replies_count,
      viewsCount: thread.views_count,
      lastReplyAt: thread.last_reply_at,
      createdAt: thread.created_at,
      updatedAt: thread.updated_at,
      category: thread.category_id ? {
        id: thread.category_id,
        name: thread.category_name
      } : null,
      author: thread.author_id ? {
        id: thread.author_id,
        firstName: thread.author_first_name,
        lastName: thread.author_last_name,
        email: thread.author_email
      } : null
    });
  } catch (error) {
    console.error('Get thread error:', error);
    res.status(500).json({ error: 'Failed to get thread' });
  }
});

/**
 * GET /api/forum/threads/:id/posts
 * Get thread posts
 */
router.get('/threads/:id/posts', param('id').isUUID(), [
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  handleValidationErrors
], async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const result = await pool.query(
      `SELECT p.id, p.content, p.likes_count, p.created_at, p.updated_at,
              u.id as author_id, u.first_name as author_first_name,
              u.last_name as author_last_name, u.email as author_email,
              pr.avatar_url as author_avatar_url
       FROM forum_posts p
       LEFT JOIN users u ON p.author_id = u.id
       LEFT JOIN profiles pr ON u.id = pr.user_id
       WHERE p.thread_id = $1
       ORDER BY p.created_at ASC
       LIMIT $2 OFFSET $3`,
      [id, parseInt(limit, 10), parseInt(offset, 10)]
    );

    res.json({
      posts: result.rows.map(post => ({
        id: post.id,
        content: post.content,
        likesCount: post.likes_count,
        createdAt: post.created_at,
        updatedAt: post.updated_at,
        author: post.author_id ? {
          id: post.author_id,
          firstName: post.author_first_name,
          lastName: post.author_last_name,
          email: post.author_email,
          avatarUrl: post.author_avatar_url
        } : null
      }))
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Failed to get posts' });
  }
});

/**
 * POST /api/forum/threads
 * Create forum thread (requires auth)
 */
router.post('/threads', authenticate, [
  body('title').trim().notEmpty().isLength({ min: 3, max: 255 }),
  body('content').trim().notEmpty().isLength({ min: 10 }),
  body('categoryId').optional().isUUID(),
  handleValidationErrors
], async (req, res) => {
  try {
    const { title, content, categoryId } = req.body;

    const result = await pool.query(
      `INSERT INTO forum_threads (title, content, category_id, author_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, content, created_at`,
      [title, content, categoryId || null, req.user.id]
    );

    res.status(201).json({
      success: true,
      thread: {
        id: result.rows[0].id,
        title: result.rows[0].title,
        content: result.rows[0].content,
        createdAt: result.rows[0].created_at
      }
    });
  } catch (error) {
    console.error('Create thread error:', error);
    res.status(500).json({ error: 'Failed to create thread' });
  }
});

/**
 * POST /api/forum/threads/:id/posts
 * Reply to thread (requires auth)
 */
router.post('/threads/:id/posts', authenticate, param('id').isUUID(), [
  body('content').trim().notEmpty().isLength({ min: 1 }),
  handleValidationErrors
], async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    // Check if thread exists and is not locked
    const threadResult = await pool.query(
      'SELECT id, is_locked FROM forum_threads WHERE id = $1',
      [id]
    );

    if (threadResult.rows.length === 0) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    if (threadResult.rows[0].is_locked) {
      return res.status(403).json({ error: 'Thread is locked' });
    }

    // Create post
    const postResult = await pool.query(
      `INSERT INTO forum_posts (thread_id, author_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, content, created_at`,
      [id, req.user.id, content]
    );

    // Update thread replies count and last_reply_at
    await pool.query(
      `UPDATE forum_threads 
       SET replies_count = replies_count + 1,
           last_reply_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [id]
    );

    res.status(201).json({
      success: true,
      post: {
        id: postResult.rows[0].id,
        content: postResult.rows[0].content,
        createdAt: postResult.rows[0].created_at
      }
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

/**
 * DELETE /api/forum/posts/:id
 * Delete post (requires auth - own post or admin)
 */
router.delete('/posts/:id', authenticate, param('id').isUUID(), handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;

    // Get post
    const postResult = await pool.query(
      'SELECT id, thread_id, author_id FROM forum_posts WHERE id = $1',
      [id]
    );

    if (postResult.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = postResult.rows[0];

    // Check permission
    if (post.author_id !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'moderator') {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    // Delete post
    await pool.query('DELETE FROM forum_posts WHERE id = $1', [id]);

    // Update thread replies count
    await pool.query(
      `UPDATE forum_threads 
       SET replies_count = GREATEST(replies_count - 1, 0),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [post.thread_id]
    );

    res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

/**
 * POST /api/forum/threads/:id/like
 * Like/unlike thread (requires auth)
 */
router.post('/threads/:id/like', authenticate, param('id').isUUID(), handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if thread exists
    const threadResult = await pool.query(
      'SELECT id, likes_count FROM forum_threads WHERE id = $1',
      [id]
    );

    if (threadResult.rows.length === 0) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    // For simplicity, we'll just increment likes (in production, track individual likes)
    await pool.query(
      'UPDATE forum_threads SET likes_count = likes_count + 1 WHERE id = $1',
      [id]
    );

    res.json({ success: true, message: 'Thread liked' });
  } catch (error) {
    console.error('Like thread error:', error);
    res.status(500).json({ error: 'Failed to like thread' });
  }
});

/**
 * PATCH /api/forum/threads/:id/pin
 * Pin/unpin thread (admin only)
 */
router.patch('/threads/:id/pin', authenticate, requireAdmin, param('id').isUUID(), [
  body('isPinned').isBoolean(),
  handleValidationErrors
], async (req, res) => {
  try {
    const { id } = req.params;
    const { isPinned } = req.body;

    const result = await pool.query(
      'UPDATE forum_threads SET is_pinned = $1 WHERE id = $2 RETURNING id, is_pinned',
      [isPinned, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    res.json({
      success: true,
      thread: {
        id: result.rows[0].id,
        isPinned: result.rows[0].is_pinned
      }
    });
  } catch (error) {
    console.error('Pin thread error:', error);
    res.status(500).json({ error: 'Failed to pin thread' });
  }
});

/**
 * PATCH /api/forum/threads/:id/lock
 * Lock/unlock thread (admin/moderator only)
 */
router.patch('/threads/:id/lock', authenticate, requireModerator, param('id').isUUID(), [
  body('isLocked').isBoolean(),
  handleValidationErrors
], async (req, res) => {
  try {
    const { id } = req.params;
    const { isLocked } = req.body;

    const result = await pool.query(
      'UPDATE forum_threads SET is_locked = $1 WHERE id = $2 RETURNING id, is_locked',
      [isLocked, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    res.json({
      success: true,
      thread: {
        id: result.rows[0].id,
        isLocked: result.rows[0].is_locked
      }
    });
  } catch (error) {
    console.error('Lock thread error:', error);
    res.status(500).json({ error: 'Failed to lock thread' });
  }
});

/**
 * DELETE /api/forum/threads/:id
 * Delete thread (admin only)
 */
router.delete('/threads/:id', authenticate, requireAdmin, param('id').isUUID(), handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM forum_threads WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    res.json({ success: true, message: 'Thread deleted' });
  } catch (error) {
    console.error('Delete thread error:', error);
    res.status(500).json({ error: 'Failed to delete thread' });
  }
});

export default router;






