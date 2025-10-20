import express from 'express';
import pool from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public endpoint to get admin user info (for contacting admin)
router.get('/admin-user', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, full_name, email FROM profiles WHERE role = 'admin' LIMIT 1"
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Admin user not found' });
    }

    res.json({ admin: result.rows[0] });
  } catch (error) {
    console.error('Get admin user error:', error);
    res.status(500).json({ error: 'Failed to fetch admin user' });
  }
});

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// Get all users
router.get('/users', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, full_name, phone, role, is_verified, created_at FROM profiles ORDER BY created_at DESC'
    );

    res.json({ users: result.rows });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM profiles WHERE id = $1', [req.params.id]);
    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get all items (including inactive)
router.get('/items', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, p.full_name as owner_name 
       FROM items i 
       JOIN profiles p ON i.user_id = p.id 
       ORDER BY i.created_at DESC`
    );

    res.json({ items: result.rows });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// Delete item permanently
router.delete('/items/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM items WHERE id = $1', [req.params.id]);
    res.json({ message: 'Item deleted' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// Get system statistics
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await pool.query('SELECT COUNT(*) FROM profiles');
    const totalItems = await pool.query('SELECT COUNT(*) FROM items WHERE is_active = true');
    const lostItems = await pool.query('SELECT COUNT(*) FROM items WHERE status = \'lost\' AND is_active = true');
    const foundItems = await pool.query('SELECT COUNT(*) FROM items WHERE status = \'found\' AND is_active = true');
    const matchedItems = await pool.query('SELECT COUNT(*) FROM items WHERE status = \'matched\' AND is_active = true');
    const totalMessages = await pool.query('SELECT COUNT(*) FROM messages');

    res.json({
      stats: {
        total_users: parseInt(totalUsers.rows[0].count),
        total_items: parseInt(totalItems.rows[0].count),
        lost_items: parseInt(lostItems.rows[0].count),
        found_items: parseInt(foundItems.rows[0].count),
        matched_items: parseInt(matchedItems.rows[0].count),
        total_messages: parseInt(totalMessages.rows[0].count)
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Manage custodians
router.post('/custodians', async (req, res) => {
  try {
    const { name, location, address, phone, email, operating_hours } = req.body;

    const result = await pool.query(
      `INSERT INTO custodians (name, location, address, phone, email, operating_hours)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, location, address, phone, email, operating_hours]
    );

    res.status(201).json({ message: 'Custodian created', custodian: result.rows[0] });
  } catch (error) {
    console.error('Create custodian error:', error);
    res.status(500).json({ error: 'Failed to create custodian' });
  }
});

router.put('/custodians/:id', async (req, res) => {
  try {
    const { name, location, address, phone, email, operating_hours, is_active } = req.body;

    const result = await pool.query(
      `UPDATE custodians 
       SET name = COALESCE($1, name),
           location = COALESCE($2, location),
           address = COALESCE($3, address),
           phone = COALESCE($4, phone),
           email = COALESCE($5, email),
           operating_hours = COALESCE($6, operating_hours),
           is_active = COALESCE($7, is_active)
       WHERE id = $8
       RETURNING *`,
      [name, location, address, phone, email, operating_hours, is_active, req.params.id]
    );

    res.json({ message: 'Custodian updated', custodian: result.rows[0] });
  } catch (error) {
    console.error('Update custodian error:', error);
    res.status(500).json({ error: 'Failed to update custodian' });
  }
});

router.delete('/custodians/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM custodians WHERE id = $1', [req.params.id]);
    res.json({ message: 'Custodian deleted' });
  } catch (error) {
    console.error('Delete custodian error:', error);
    res.status(500).json({ error: 'Failed to delete custodian' });
  }
});

export default router;
