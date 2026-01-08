/**
 * Profiles Routes
 * Profile Management
 */

import express from 'express';
import pool from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { body, handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

/**
 * GET /api/profiles/members
 * List all members (public info only)
 */
router.get('/members', async (req, res) => {
  try {
    const { search, limit = 100, offset = 0 } = req.query;

    let query = `
      SELECT u.id, u.email, u.first_name, u.last_name,
             p.company, p.position, p.location, p.avatar_url, p.tags,
             COUNT(*) OVER() as total_count
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE u.status = 'active'
    `;
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (
        u.first_name ILIKE $${paramCount} OR 
        u.last_name ILIKE $${paramCount} OR 
        u.email ILIKE $${paramCount} OR
        p.company ILIKE $${paramCount} OR
        p.position ILIKE $${paramCount}
      )`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY u.first_name, u.last_name LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const result = await pool.query(query, params);
    
    // Get total from first row (Window Function returns same value for all rows)
    const total = result.rows.length > 0 ? parseInt(result.rows[0].total_count || '0', 10) : 0;

    res.json({
      members: result.rows.map(member => ({
        id: member.id,
        email: member.email,
        firstName: member.first_name,
        lastName: member.last_name,
        company: member.company,
        position: member.position,
        location: member.location,
        avatarUrl: member.avatar_url,
        tags: member.tags || []
      })),
      total,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10)
    });
  } catch (error) {
    console.error('List members error:', error);
    res.status(500).json({ error: 'Failed to list members' });
  }
});

/**
 * GET /api/profiles/members/:email
 * Get member profile by email (public)
 */
router.get('/members/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const result = await pool.query(
      `SELECT u.id, u.email, u.first_name, u.last_name,
              p.bio, p.company, p.position, p.location, p.website, p.avatar_url, p.tags
       FROM users u
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE u.email = $1 AND u.status = 'active'`,
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const member = result.rows[0];

    res.json({
      id: member.id,
      email: member.email,
      firstName: member.first_name,
      lastName: member.last_name,
      profile: {
        bio: member.bio,
        company: member.company,
        position: member.position,
        location: member.location,
        website: member.website,
        avatarUrl: member.avatar_url,
        tags: member.tags || []
      }
    });
  } catch (error) {
    console.error('Get member profile error:', error);
    res.status(500).json({ error: 'Failed to get member profile' });
  }
});

/**
 * GET /api/profiles/me
 * Get current user's profile
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.status,
              p.bio, p.company, p.position, p.location, p.website, p.avatar_url, p.tags
       FROM users u
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE u.id = $1`,
      [req.user.id]
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
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

/**
 * PUT /api/profiles/me
 * Update current user's profile
 */
router.put('/me', authenticate, [
  body('firstName').optional().trim().isLength({ min: 1, max: 100 }),
  body('lastName').optional().trim().isLength({ min: 1, max: 100 }),
  body('bio').optional().trim().isLength({ max: 2000 }),
  body('company').optional().trim().isLength({ max: 255 }),
  body('position').optional().trim().isLength({ max: 255 }),
  body('location').optional().trim().isLength({ max: 255 }),
  body('website').optional().trim().isURL().withMessage('Invalid website URL'),
  body('avatarUrl').optional().trim().isURL().withMessage('Invalid avatar URL'),
  body('tags').optional().isArray(),
  handleValidationErrors
], async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      bio,
      company,
      position,
      location,
      website,
      avatarUrl,
      tags
    } = req.body;

    // Update user table
    if (firstName || lastName) {
      const updateFields = [];
      const updateValues = [];
      let paramCount = 0;

      if (firstName) {
        updateFields.push(`first_name = $${++paramCount}`);
        updateValues.push(firstName);
      }
      if (lastName) {
        updateFields.push(`last_name = $${++paramCount}`);
        updateValues.push(lastName);
      }

      updateValues.push(req.user.id);
      await pool.query(
        `UPDATE users SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${++paramCount}`,
        updateValues
      );
    }

    // Update or insert profile
    const profileResult = await pool.query(
      'SELECT user_id FROM profiles WHERE user_id = $1',
      [req.user.id]
    );

    if (profileResult.rows.length === 0) {
      // Insert new profile
      await pool.query(
        `INSERT INTO profiles (user_id, bio, company, position, location, website, avatar_url, tags)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [req.user.id, bio || null, company || null, position || null, location || null, website || null, avatarUrl || null, tags || []]
      );
    } else {
      // Update existing profile
      const updateFields = [];
      const updateValues = [];
      let paramCount = 0;

      if (bio !== undefined) {
        updateFields.push(`bio = $${++paramCount}`);
        updateValues.push(bio);
      }
      if (company !== undefined) {
        updateFields.push(`company = $${++paramCount}`);
        updateValues.push(company);
      }
      if (position !== undefined) {
        updateFields.push(`position = $${++paramCount}`);
        updateValues.push(position);
      }
      if (location !== undefined) {
        updateFields.push(`location = $${++paramCount}`);
        updateValues.push(location);
      }
      if (website !== undefined) {
        updateFields.push(`website = $${++paramCount}`);
        updateValues.push(website);
      }
      if (avatarUrl !== undefined) {
        updateFields.push(`avatar_url = $${++paramCount}`);
        updateValues.push(avatarUrl);
      }
      if (tags !== undefined) {
        updateFields.push(`tags = $${++paramCount}`);
        updateValues.push(tags);
      }

      if (updateFields.length > 0) {
        updateValues.push(req.user.id);
        await pool.query(
          `UPDATE profiles SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE user_id = $${++paramCount}`,
          updateValues
        );
      }
    }

    // Get updated profile
    const result = await pool.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.status,
              p.bio, p.company, p.position, p.location, p.website, p.avatar_url, p.tags
       FROM users u
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE u.id = $1`,
      [req.user.id]
    );

    const user = result.rows[0];

    res.json({
      success: true,
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
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;


