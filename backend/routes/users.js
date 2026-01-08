/**
 * Users Routes
 * User Management (Admin only)
 */

import express from 'express';
import pool from '../config/database.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validateUUID } from '../middleware/validation.js';

const router = express.Router();

/**
 * GET /api/users
 * List all users (admin only)
 */
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { search, role, status, limit = 100, offset = 0 } = req.query;

    let query = `
      SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.status, 
             u.created_at, u.last_login,
             p.company, p.position, p.location,
             COUNT(*) OVER() as total_count
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (u.email ILIKE $${paramCount} OR u.first_name ILIKE $${paramCount} OR u.last_name ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (role) {
      paramCount++;
      query += ` AND u.role = $${paramCount}`;
      params.push(role);
    }

    if (status) {
      paramCount++;
      query += ` AND u.status = $${paramCount}`;
      params.push(status);
    }

    query += ` ORDER BY u.created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const result = await pool.query(query, params);

    // Get total from first row (Window Function returns same value for all rows)
    const total = result.rows.length > 0 ? parseInt(result.rows[0].total_count || '0', 10) : 0;

    res.json({
      users: result.rows.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        status: user.status,
        company: user.company,
        position: user.position,
        location: user.location,
        createdAt: user.created_at,
        lastLogin: user.last_login
      })),
      total,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10)
    });
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ error: 'Failed to list users' });
  }
});

/**
 * GET /api/users/:id
 * Get user by ID (admin only)
 */
router.get('/:id', authenticate, requireAdmin, validateUUID, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.status, 
              u.created_at, u.last_login,
              p.bio, p.company, p.position, p.location, p.website, p.avatar_url, p.tags
       FROM users u
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE u.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      status: user.status,
      profile: {
        bio: user.bio,
        company: user.company,
        position: user.position,
        location: user.location,
        website: user.website,
        avatarUrl: user.avatar_url,
        tags: user.tags || []
      },
      createdAt: user.created_at,
      lastLogin: user.last_login
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

/**
 * PATCH /api/users/:id/role
 * Update user role (admin only)
 */
router.patch('/:id/role', authenticate, requireAdmin, validateUUID, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['member', 'admin', 'moderator'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Don't allow changing own role
    if (id === req.user.id) {
      return res.status(400).json({ error: 'Cannot change your own role' });
    }

    const result = await pool.query(
      'UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, role',
      [role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: result.rows[0].id,
        role: result.rows[0].role
      }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

/**
 * PATCH /api/users/:id/status
 * Update user status (admin only)
 */
router.patch('/:id/status', authenticate, requireAdmin, validateUUID, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Don't allow changing own status
    if (id === req.user.id) {
      return res.status(400).json({ error: 'Cannot change your own status' });
    }

    const result = await pool.query(
      'UPDATE users SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, status',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: result.rows[0].id,
        status: result.rows[0].status
      }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

/**
 * DELETE /api/users/:id
 * Delete user (admin only)
 */
router.delete('/:id', authenticate, requireAdmin, validateUUID, async (req, res) => {
  try {
    const { id } = req.params;

    // Don't allow deleting yourself
    if (id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Delete user (CASCADE will handle related records)
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;


