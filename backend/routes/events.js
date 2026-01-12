/**
 * Events Routes
 * Events & Bookings Management
 */

import express from 'express';
import pool from '../config/database.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { body, param, handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

/**
 * GET /api/events
 * List all events
 */
router.get('/', async (req, res) => {
  try {
    const { upcoming, limit = 100, offset = 0 } = req.query;

    let query = `
      SELECT e.id, e.title, e.description, e.start_date, e.end_date, 
             e.location, e.max_participants,
             u.first_name as creator_first_name, u.last_name as creator_last_name,
             COUNT(eb.id) as bookings_count
      FROM events e
      LEFT JOIN users u ON e.created_by = u.id
      LEFT JOIN event_bookings eb ON e.id = eb.event_id AND eb.status = 'confirmed'
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (upcoming === 'true') {
      query += ` AND e.start_date >= CURRENT_TIMESTAMP`;
    }

    // Optimized: Use Window Function for total count
    query = query.replace('SELECT e.id, e.title', 'SELECT e.id, e.title, COUNT(*) OVER() as total_count');
    query += ` GROUP BY e.id, u.first_name, u.last_name
              ORDER BY e.start_date ASC
              LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const result = await pool.query(query, params);
    
    // Get total from first row (Window Function returns same value for all rows)
    const total = result.rows.length > 0 ? parseInt(result.rows[0].total_count || '0', 10) : 0;

    res.json({
      events: result.rows.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        startDate: event.start_date,
        endDate: event.end_date,
        location: event.location,
        maxParticipants: event.max_participants,
        creator: {
          firstName: event.creator_first_name,
          lastName: event.creator_last_name
        },
        bookingsCount: parseInt(event.bookings_count, 10)
      })),
      total,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10)
    });
  } catch (error) {
    console.error('List events error:', error);
    res.status(500).json({ error: 'Failed to list events' });
  }
});

/**
 * GET /api/events/:id
 * Get event by ID
 */
router.get('/:id', param('id').isUUID(), handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT e.id, e.title, e.description, e.start_date, e.end_date, 
              e.location, e.max_participants, e.created_at,
              u.id as creator_id, u.first_name as creator_first_name, u.last_name as creator_last_name,
              COUNT(eb.id) as bookings_count
       FROM events e
       LEFT JOIN users u ON e.created_by = u.id
       LEFT JOIN event_bookings eb ON e.id = eb.event_id AND eb.status = 'confirmed'
       WHERE e.id = $1
       GROUP BY e.id, u.id, u.first_name, u.last_name`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const event = result.rows[0];

    res.json({
      id: event.id,
      title: event.title,
      description: event.description,
      startDate: event.start_date,
      endDate: event.end_date,
      location: event.location,
      maxParticipants: event.max_participants,
      createdAt: event.created_at,
      creator: {
        id: event.creator_id,
        firstName: event.creator_first_name,
        lastName: event.creator_last_name
      },
      bookingsCount: parseInt(event.bookings_count, 10)
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Failed to get event' });
  }
});

/**
 * POST /api/events/:id/book
 * Book an event
 */
router.post('/:id/book', authenticate, param('id').isUUID(), handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if event exists
    const eventResult = await pool.query(
      'SELECT id, max_participants, start_date FROM events WHERE id = $1',
      [id]
    );

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const event = eventResult.rows[0];

    // Check if event is in the past
    if (new Date(event.start_date) < new Date()) {
      return res.status(400).json({ error: 'Cannot book past events' });
    }

    // Check if already booked
    const existingBooking = await pool.query(
      'SELECT id FROM event_bookings WHERE event_id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existingBooking.rows.length > 0) {
      return res.status(400).json({ error: 'Already booked this event' });
    }

    // Check if event is full
    if (event.max_participants) {
      const bookingsCount = await pool.query(
        'SELECT COUNT(*) FROM event_bookings WHERE event_id = $1 AND status = $2',
        [id, 'confirmed']
      );
      const count = parseInt(bookingsCount.rows[0].count, 10);
      if (count >= event.max_participants) {
        return res.status(400).json({ error: 'Event is full' });
      }
    }

    // Create booking
    const bookingResult = await pool.query(
      'INSERT INTO event_bookings (event_id, user_id, status) VALUES ($1, $2, $3) RETURNING id',
      [id, userId, 'confirmed']
    );

    res.status(201).json({
      success: true,
      booking: {
        id: bookingResult.rows[0].id,
        eventId: id,
        userId
      }
    });
  } catch (error) {
    console.error('Book event error:', error);
    res.status(500).json({ error: 'Failed to book event' });
  }
});

/**
 * DELETE /api/events/:id/book
 * Cancel event booking
 */
router.delete('/:id/book', authenticate, param('id').isUUID(), handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      'DELETE FROM event_bookings WHERE event_id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ success: true, message: 'Booking cancelled' });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

/**
 * GET /api/events/:id/participants
 * Get event participants
 */
router.get('/:id/participants', param('id').isUUID(), handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT u.id, u.email, u.first_name, u.last_name,
              p.company, p.position, p.avatar_url
       FROM event_bookings eb
       JOIN users u ON eb.user_id = u.id
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE eb.event_id = $1 AND eb.status = 'confirmed'
       ORDER BY eb.created_at ASC`,
      [id]
    );

    res.json({
      participants: result.rows.map(p => ({
        id: p.id,
        email: p.email,
        firstName: p.first_name,
        lastName: p.last_name,
        company: p.company,
        position: p.position,
        avatarUrl: p.avatar_url
      }))
    });
  } catch (error) {
    console.error('Get participants error:', error);
    res.status(500).json({ error: 'Failed to get participants' });
  }
});

/**
 * POST /api/events
 * Create event (admin only)
 */
router.post('/', authenticate, requireAdmin, [
  body('title').trim().notEmpty().isLength({ max: 255 }),
  body('description').optional().trim(),
  body('startDate').isISO8601(),
  body('endDate').optional().isISO8601(),
  body('location').optional().trim().isLength({ max: 255 }),
  body('maxParticipants').optional().isInt({ min: 1 }),
  handleValidationErrors
], async (req, res) => {
  try {
    const { title, description, startDate, endDate, location, maxParticipants } = req.body;

    const result = await pool.query(
      `INSERT INTO events (title, description, start_date, end_date, location, max_participants, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, title, description, start_date, end_date, location, max_participants, created_at`,
      [title, description || null, startDate, endDate || null, location || null, maxParticipants || null, req.user.id]
    );

    res.status(201).json({
      success: true,
      event: {
        id: result.rows[0].id,
        title: result.rows[0].title,
        description: result.rows[0].description,
        startDate: result.rows[0].start_date,
        endDate: result.rows[0].end_date,
        location: result.rows[0].location,
        maxParticipants: result.rows[0].max_participants,
        createdAt: result.rows[0].created_at
      }
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

/**
 * PUT /api/events/:id
 * Update event (admin only)
 */
router.put('/:id', authenticate, requireAdmin, param('id').isUUID(), [
  body('title').optional().trim().notEmpty().isLength({ max: 255 }),
  body('description').optional().trim(),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  body('location').optional().trim().isLength({ max: 255 }),
  body('maxParticipants').optional().isInt({ min: 1 }),
  handleValidationErrors
], async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, startDate, endDate, location, maxParticipants } = req.body;

    const updateFields = [];
    const updateValues = [];
    let paramCount = 0;

    if (title !== undefined) {
      updateFields.push(`title = $${++paramCount}`);
      updateValues.push(title);
    }
    if (description !== undefined) {
      updateFields.push(`description = $${++paramCount}`);
      updateValues.push(description);
    }
    if (startDate !== undefined) {
      updateFields.push(`start_date = $${++paramCount}`);
      updateValues.push(startDate);
    }
    if (endDate !== undefined) {
      updateFields.push(`end_date = $${++paramCount}`);
      updateValues.push(endDate);
    }
    if (location !== undefined) {
      updateFields.push(`location = $${++paramCount}`);
      updateValues.push(location);
    }
    if (maxParticipants !== undefined) {
      updateFields.push(`max_participants = $${++paramCount}`);
      updateValues.push(maxParticipants);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(id);

    const result = await pool.query(
      `UPDATE events SET ${updateFields.join(', ')} WHERE id = $${++paramCount} RETURNING *`,
      updateValues
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({
      success: true,
      event: result.rows[0]
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

/**
 * DELETE /api/events/:id
 * Delete event (admin only)
 */
router.delete('/:id', authenticate, requireAdmin, param('id').isUUID(), handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM events WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ success: true, message: 'Event deleted' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

export default router;


