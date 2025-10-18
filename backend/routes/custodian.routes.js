import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all custodian locations
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM custodians WHERE is_active = true ORDER BY name'
    );

    res.json({ custodians: result.rows });
  } catch (error) {
    console.error('Get custodians error:', error);
    res.status(500).json({ error: 'Failed to fetch custodians' });
  }
});

// Create drop-off request
router.post('/dropoff', authenticate, [
  body('item_id').isInt(),
  body('custodian_id').isInt(),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { item_id, custodian_id, notes } = req.body;

    const result = await pool.query(
      `INSERT INTO dropoff_requests (finder_id, item_id, custodian_id, notes, status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING *`,
      [req.user.id, item_id, custodian_id, notes]
    );

    res.status(201).json({ message: 'Drop-off request created', request: result.rows[0] });
  } catch (error) {
    console.error('Create dropoff request error:', error);
    res.status(500).json({ error: 'Failed to create drop-off request' });
  }
});

// Create pickup request
router.post('/pickup', authenticate, [
  body('item_id').isInt(),
  body('custodian_id').isInt(),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { item_id, custodian_id, notes } = req.body;

    // Generate verification code
    const verification_code = Math.random().toString(36).substring(2, 8).toUpperCase();

    const result = await pool.query(
      `INSERT INTO pickup_requests (owner_id, item_id, custodian_id, notes, status, verification_code)
       VALUES ($1, $2, $3, $4, 'pending', $5)
       RETURNING *`,
      [req.user.id, item_id, custodian_id, notes, verification_code]
    );

    res.status(201).json({ 
      message: 'Pickup request created', 
      request: result.rows[0],
      verification_code 
    });
  } catch (error) {
    console.error('Create pickup request error:', error);
    res.status(500).json({ error: 'Failed to create pickup request' });
  }
});

// Get user's drop-off requests
router.get('/dropoff/my-requests', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT dr.*, c.name as custodian_name, c.location, i.title as item_title
       FROM dropoff_requests dr
       JOIN custodians c ON dr.custodian_id = c.id
       JOIN items i ON dr.item_id = i.id
       WHERE dr.finder_id = $1
       ORDER BY dr.created_at DESC`,
      [req.user.id]
    );

    res.json({ requests: result.rows });
  } catch (error) {
    console.error('Get dropoff requests error:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// Get user's pickup requests
router.get('/pickup/my-requests', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT pr.*, c.name as custodian_name, c.location, i.title as item_title
       FROM pickup_requests pr
       JOIN custodians c ON pr.custodian_id = c.id
       JOIN items i ON pr.item_id = i.id
       WHERE pr.owner_id = $1
       ORDER BY pr.created_at DESC`,
      [req.user.id]
    );

    res.json({ requests: result.rows });
  } catch (error) {
    console.error('Get pickup requests error:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

export default router;
