import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Search items
router.get('/', async (req, res) => {
  try {
    const { q, status, category, location, date_from, date_to, limit = 20, offset = 0 } = req.query;

    let query = `
      SELECT i.*, p.full_name as owner_name 
      FROM items i 
      JOIN profiles p ON i.user_id = p.id 
      WHERE i.is_active = true
    `;
    
    const params = [];
    let paramCount = 1;

    // Text search
    if (q) {
      query += ` AND (i.title ILIKE $${paramCount} OR i.description ILIKE $${paramCount})`;
      params.push(`%${q}%`);
      paramCount++;
    }

    // Status filter
    if (status) {
      query += ` AND i.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    // Category filter
    if (category) {
      query += ` AND i.category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    // Location filter
    if (location) {
      query += ` AND i.location ILIKE $${paramCount}`;
      params.push(`%${location}%`);
      paramCount++;
    }

    // Date range filter
    if (date_from) {
      query += ` AND i.date_lost_found >= $${paramCount}`;
      params.push(date_from);
      paramCount++;
    }

    if (date_to) {
      query += ` AND i.date_lost_found <= $${paramCount}`;
      params.push(date_to);
      paramCount++;
    }

    query += ` ORDER BY i.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) 
      FROM items i 
      WHERE i.is_active = true
    `;
    
    const countParams = [];
    let countParamCount = 1;

    if (q) {
      countQuery += ` AND (i.title ILIKE $${countParamCount} OR i.description ILIKE $${countParamCount})`;
      countParams.push(`%${q}%`);
      countParamCount++;
    }

    if (status) {
      countQuery += ` AND i.status = $${countParamCount}`;
      countParams.push(status);
      countParamCount++;
    }

    if (category) {
      countQuery += ` AND i.category = $${countParamCount}`;
      countParams.push(category);
      countParamCount++;
    }

    if (location) {
      countQuery += ` AND i.location ILIKE $${countParamCount}`;
      countParams.push(`%${location}%`);
      countParamCount++;
    }

    if (date_from) {
      countQuery += ` AND i.date_lost_found >= $${countParamCount}`;
      countParams.push(date_from);
      countParamCount++;
    }

    if (date_to) {
      countQuery += ` AND i.date_lost_found <= $${countParamCount}`;
      countParams.push(date_to);
      countParamCount++;
    }

    const countResult = await pool.query(countQuery, countParams);

    res.json({
      items: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;
