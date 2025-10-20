import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Create item (lost or found)
router.post('/', authenticate, [
  body('title').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('category').trim().notEmpty(),
  body('status').isIn(['lost', 'found']),
  body('location').trim().notEmpty(),
  body('date_lost_found').isDate()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, category, status, location, date_lost_found, image_url, reward_offered } = req.body;

    const result = await pool.query(
      `INSERT INTO items (user_id, title, description, category, status, location, date_lost_found, image_url, reward_offered)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [req.user.id, title, description, category, status, location, date_lost_found, image_url, reward_offered || 0]
    );

    // Add to item history
    await pool.query(
      'INSERT INTO item_history (item_id, action, performed_by, details) VALUES ($1, $2, $3, $4)',
      [result.rows[0].id, `Item reported as ${status}`, req.user.id, `Created by ${req.user.full_name}`]
    );

    // Broadcast new item notification to all connected users
    const io = req.app.get('io');
    if (io) {
      io.emit('new_item', {
        id: result.rows[0].id,
        title: result.rows[0].title,
        category: result.rows[0].category,
        status: result.rows[0].status,
        location: result.rows[0].location,
        owner_name: req.user.full_name,
        created_at: result.rows[0].created_at
      });
    }

    res.status(201).json({ message: 'Item created', item: result.rows[0] });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// Get all items (with filters)
router.get('/', async (req, res) => {
  try {
    const { status, category, limit = 20, offset = 0 } = req.query;
    
    let query = 'SELECT i.*, p.full_name as owner_name FROM items i JOIN profiles p ON i.user_id = p.id WHERE i.is_active = true';
    const params = [];
    let paramCount = 1;

    if (status) {
      query += ` AND i.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (category) {
      query += ` AND i.category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    query += ` ORDER BY i.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    
    res.json({ items: result.rows, count: result.rowCount });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// Get single item
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, p.full_name as owner_name, p.email as owner_email, p.phone as owner_phone 
       FROM items i 
       JOIN profiles p ON i.user_id = p.id 
       WHERE i.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

// Update item
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { title, description, category, status, location, date_lost_found, image_url, reward_offered } = req.body;

    // Check if user owns the item
    const checkOwner = await pool.query('SELECT user_id FROM items WHERE id = $1', [req.params.id]);
    
    if (checkOwner.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (checkOwner.rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const result = await pool.query(
      `UPDATE items 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           category = COALESCE($3, category),
           status = COALESCE($4, status),
           location = COALESCE($5, location),
           date_lost_found = COALESCE($6, date_lost_found),
           image_url = COALESCE($7, image_url),
           reward_offered = COALESCE($8, reward_offered)
       WHERE id = $9
       RETURNING *`,
      [title, description, category, status, location, date_lost_found, image_url, reward_offered, req.params.id]
    );

    await pool.query(
      'INSERT INTO item_history (item_id, action, performed_by, details) VALUES ($1, $2, $3, $4)',
      [req.params.id, 'Item updated', req.user.id, 'Item details updated']
    );

    res.json({ message: 'Item updated', item: result.rows[0] });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// Delete item
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const checkOwner = await pool.query('SELECT user_id FROM items WHERE id = $1', [req.params.id]);
    
    if (checkOwner.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (checkOwner.rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await pool.query('UPDATE items SET is_active = false WHERE id = $1', [req.params.id]);

    await pool.query(
      'INSERT INTO item_history (item_id, action, performed_by, details) VALUES ($1, $2, $3, $4)',
      [req.params.id, 'Item deleted', req.user.id, 'Item marked as inactive']
    );

    // Broadcast item deletion to all connected users
    const io = req.app.get('io');
    if (io) {
      io.emit('item_deleted', { id: parseInt(req.params.id) });
    }

    res.json({ message: 'Item deleted' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// Get user's items
router.get('/user/my-items', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM items WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );

    res.json({ items: result.rows });
  } catch (error) {
    console.error('Get user items error:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

export default router;
