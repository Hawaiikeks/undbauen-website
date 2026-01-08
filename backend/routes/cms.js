/**
 * CMS Routes
 * Monthly Updates & Publications Management
 */

import express from 'express';
import pool from '../config/database.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { body, param, query, handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

/**
 * GET /api/cms/updates
 * List monthly updates (public)
 */
router.get('/updates', [
  query('published').optional().isBoolean(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  handleValidationErrors
], async (req, res) => {
  try {
    const { published = 'true', limit = 50, offset = 0 } = req.query;
    const isPublished = published === 'true';

    let query = `
      SELECT id, month, title, subtitle, hero_image_url, editorial_text,
             is_published, created_at, published_at
      FROM monthly_updates
      WHERE is_draft = false
    `;

    const params = [];
    let paramCount = 0;

    if (isPublished) {
      query += ` AND is_published = true`;
    }

    query += ` ORDER BY month DESC, created_at DESC
              LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const result = await pool.query(query, params);

    res.json({
      updates: result.rows.map(update => ({
        id: update.id,
        month: update.month,
        title: update.title,
        subtitle: update.subtitle,
        heroImageUrl: update.hero_image_url,
        editorialText: update.editorial_text,
        isPublished: update.is_published,
        createdAt: update.created_at,
        publishedAt: update.published_at
      }))
    });
  } catch (error) {
    console.error('List updates error:', error);
    res.status(500).json({ error: 'Failed to list updates' });
  }
});

/**
 * GET /api/cms/updates/:id
 * Get update by ID (public)
 */
router.get('/updates/:id', param('id').isUUID(), handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT id, month, title, subtitle, hero_image_url, editorial_text,
              highlights, takeaways, quotes, resources, participants,
              is_published, created_at, updated_at, published_at
       FROM monthly_updates
       WHERE id = $1 AND is_draft = false`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Update not found' });
    }

    const update = result.rows[0];

    res.json({
      id: update.id,
      month: update.month,
      title: update.title,
      subtitle: update.subtitle,
      heroImageUrl: update.hero_image_url,
      editorialText: update.editorial_text,
      highlights: update.highlights || [],
      takeaways: update.takeaways || [],
      quotes: update.quotes || [],
      resources: update.resources || [],
      participants: update.participants || [],
      isPublished: update.is_published,
      createdAt: update.created_at,
      updatedAt: update.updated_at,
      publishedAt: update.published_at
    });
  } catch (error) {
    console.error('Get update error:', error);
    res.status(500).json({ error: 'Failed to get update' });
  }
});

/**
 * GET /api/cms/publications
 * List publications (public)
 */
router.get('/publications', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, authors, type, url, note, created_at FROM publications ORDER BY created_at DESC'
    );

    res.json({
      publications: result.rows.map(pub => ({
        id: pub.id,
        title: pub.title,
        authors: pub.authors,
        type: pub.type,
        url: pub.url,
        note: pub.note,
        createdAt: pub.created_at
      }))
    });
  } catch (error) {
    console.error('List publications error:', error);
    res.status(500).json({ error: 'Failed to list publications' });
  }
});

/**
 * POST /api/cms/updates
 * Create monthly update (admin only)
 */
router.post('/updates', authenticate, requireAdmin, [
  body('month').matches(/^\d{4}-\d{2}$/).withMessage('Month must be in format YYYY-MM'),
  body('title').trim().notEmpty().isLength({ max: 255 }),
  body('subtitle').optional().trim().isLength({ max: 255 }),
  body('heroImageUrl').optional().trim().isURL(),
  body('editorialText').optional().trim(),
  body('highlights').optional().isArray(),
  body('takeaways').optional().isArray(),
  body('quotes').optional().isArray(),
  body('resources').optional().isArray(),
  body('participants').optional().isArray(),
  body('isPublished').optional().isBoolean(),
  body('isDraft').optional().isBoolean(),
  handleValidationErrors
], async (req, res) => {
  try {
    const {
      month,
      title,
      subtitle,
      heroImageUrl,
      editorialText,
      highlights,
      takeaways,
      quotes,
      resources,
      participants,
      isPublished = false,
      isDraft = true
    } = req.body;

    const result = await pool.query(
      `INSERT INTO monthly_updates 
       (month, title, subtitle, hero_image_url, editorial_text,
        highlights, takeaways, quotes, resources, participants,
        is_published, is_draft, created_by, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING id, month, title, created_at`,
      [
        month,
        title,
        subtitle || null,
        heroImageUrl || null,
        editorialText || null,
        JSON.stringify(highlights || []),
        JSON.stringify(takeaways || []),
        JSON.stringify(quotes || []),
        JSON.stringify(resources || []),
        participants || [],
        isPublished,
        isDraft,
        req.user.id,
        isPublished ? new Date() : null
      ]
    );

    res.status(201).json({
      success: true,
      update: {
        id: result.rows[0].id,
        month: result.rows[0].month,
        title: result.rows[0].title,
        createdAt: result.rows[0].created_at
      }
    });
  } catch (error) {
    console.error('Create update error:', error);
    res.status(500).json({ error: 'Failed to create update' });
  }
});

/**
 * PUT /api/cms/updates/:id
 * Update monthly update (admin only)
 */
router.put('/updates/:id', authenticate, requireAdmin, param('id').isUUID(), [
  body('month').optional().matches(/^\d{4}-\d{2}$/),
  body('title').optional().trim().notEmpty().isLength({ max: 255 }),
  body('subtitle').optional().trim().isLength({ max: 255 }),
  body('heroImageUrl').optional().trim().isURL(),
  body('editorialText').optional().trim(),
  body('highlights').optional().isArray(),
  body('takeaways').optional().isArray(),
  body('quotes').optional().isArray(),
  body('resources').optional().isArray(),
  body('participants').optional().isArray(),
  body('isPublished').optional().isBoolean(),
  body('isDraft').optional().isBoolean(),
  handleValidationErrors
], async (req, res) => {
  try {
    const { id } = req.params;
    const {
      month,
      title,
      subtitle,
      heroImageUrl,
      editorialText,
      highlights,
      takeaways,
      quotes,
      resources,
      participants,
      isPublished,
      isDraft
    } = req.body;

    const updateFields = [];
    const updateValues = [];
    let paramCount = 0;

    if (month !== undefined) {
      updateFields.push(`month = $${++paramCount}`);
      updateValues.push(month);
    }
    if (title !== undefined) {
      updateFields.push(`title = $${++paramCount}`);
      updateValues.push(title);
    }
    if (subtitle !== undefined) {
      updateFields.push(`subtitle = $${++paramCount}`);
      updateValues.push(subtitle);
    }
    if (heroImageUrl !== undefined) {
      updateFields.push(`hero_image_url = $${++paramCount}`);
      updateValues.push(heroImageUrl);
    }
    if (editorialText !== undefined) {
      updateFields.push(`editorial_text = $${++paramCount}`);
      updateValues.push(editorialText);
    }
    if (highlights !== undefined) {
      updateFields.push(`highlights = $${++paramCount}`);
      updateValues.push(JSON.stringify(highlights));
    }
    if (takeaways !== undefined) {
      updateFields.push(`takeaways = $${++paramCount}`);
      updateValues.push(JSON.stringify(takeaways));
    }
    if (quotes !== undefined) {
      updateFields.push(`quotes = $${++paramCount}`);
      updateValues.push(JSON.stringify(quotes));
    }
    if (resources !== undefined) {
      updateFields.push(`resources = $${++paramCount}`);
      updateValues.push(JSON.stringify(resources));
    }
    if (participants !== undefined) {
      updateFields.push(`participants = $${++paramCount}`);
      updateValues.push(participants);
    }
    if (isPublished !== undefined) {
      updateFields.push(`is_published = $${++paramCount}`);
      updateValues.push(isPublished);
      if (isPublished) {
        updateFields.push(`published_at = CURRENT_TIMESTAMP`);
      }
    }
    if (isDraft !== undefined) {
      updateFields.push(`is_draft = $${++paramCount}`);
      updateValues.push(isDraft);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(id);

    const result = await pool.query(
      `UPDATE monthly_updates SET ${updateFields.join(', ')} WHERE id = $${++paramCount} RETURNING *`,
      updateValues
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Update not found' });
    }

    res.json({
      success: true,
      update: result.rows[0]
    });
  } catch (error) {
    console.error('Update update error:', error);
    res.status(500).json({ error: 'Failed to update update' });
  }
});

/**
 * GET /api/cms/updates/drafts/all
 * Get all updates including drafts (admin only)
 */
router.get('/updates/drafts/all', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, month, title, subtitle, is_published, is_draft, 
              created_at, updated_at, published_at
       FROM monthly_updates
       ORDER BY created_at DESC`
    );

    res.json({
      updates: result.rows.map(update => ({
        id: update.id,
        month: update.month,
        title: update.title,
        subtitle: update.subtitle,
        isPublished: update.is_published,
        isDraft: update.is_draft,
        createdAt: update.created_at,
        updatedAt: update.updated_at,
        publishedAt: update.published_at
      }))
    });
  } catch (error) {
    console.error('Get all updates error:', error);
    res.status(500).json({ error: 'Failed to get updates' });
  }
});

/**
 * DELETE /api/cms/updates/:id
 * Delete monthly update (admin only)
 */
router.delete('/updates/:id', authenticate, requireAdmin, param('id').isUUID(), handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM monthly_updates WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Update not found' });
    }

    res.json({ success: true, message: 'Update deleted' });
  } catch (error) {
    console.error('Delete update error:', error);
    res.status(500).json({ error: 'Failed to delete update' });
  }
});

/**
 * POST /api/cms/publications
 * Create publication (admin only)
 */
router.post('/publications', authenticate, requireAdmin, [
  body('title').trim().notEmpty().isLength({ max: 255 }),
  body('authors').optional().trim().isLength({ max: 255 }),
  body('type').optional().trim().isLength({ max: 50 }),
  body('url').optional().trim().isURL(),
  body('note').optional().trim(),
  handleValidationErrors
], async (req, res) => {
  try {
    const { title, authors, type, url, note } = req.body;

    const result = await pool.query(
      `INSERT INTO publications (title, authors, type, url, note, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, title, created_at`,
      [title, authors || null, type || null, url || null, note || null, req.user.id]
    );

    res.status(201).json({
      success: true,
      publication: {
        id: result.rows[0].id,
        title: result.rows[0].title,
        createdAt: result.rows[0].created_at
      }
    });
  } catch (error) {
    console.error('Create publication error:', error);
    res.status(500).json({ error: 'Failed to create publication' });
  }
});

/**
 * DELETE /api/cms/publications/:id
 * Delete publication (admin only)
 */
router.delete('/publications/:id', authenticate, requireAdmin, param('id').isUUID(), handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM publications WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Publication not found' });
    }

    res.json({ success: true, message: 'Publication deleted' });
  } catch (error) {
    console.error('Delete publication error:', error);
    res.status(500).json({ error: 'Failed to delete publication' });
  }
});

export default router;






