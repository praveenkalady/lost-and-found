import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Send message
router.post('/', authenticate, [
  body('receiver_id').isInt(),
  body('item_id').isInt(),
  body('message_text').trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { receiver_id, item_id, message_text } = req.body;

    const result = await pool.query(
      `INSERT INTO messages (sender_id, receiver_id, item_id, message_text, status)
       VALUES ($1, $2, $3, $4, 'sent')
       RETURNING *`,
      [req.user.id, receiver_id, item_id, message_text]
    );

    // Create notification for receiver
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, related_item_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [receiver_id, 'New Message', `You have a new message from ${req.user.full_name}`, 'message', item_id]
    );

    res.status(201).json({ message: 'Message sent', data: result.rows[0] });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get conversation
router.get('/conversation/:userId/:itemId', authenticate, async (req, res) => {
  try {
    const { userId, itemId } = req.params;

    const result = await pool.query(
      `SELECT m.*, 
              s.full_name as sender_name,
              r.full_name as receiver_name
       FROM messages m
       JOIN profiles s ON m.sender_id = s.id
       JOIN profiles r ON m.receiver_id = r.id
       WHERE m.item_id = $1 
       AND ((m.sender_id = $2 AND m.receiver_id = $3) 
            OR (m.sender_id = $3 AND m.receiver_id = $2))
       ORDER BY m.created_at ASC`,
      [itemId, req.user.id, userId]
    );

    res.json({ messages: result.rows });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// Get all user conversations
router.get('/conversations', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT ON (m.item_id, 
             CASE 
               WHEN m.sender_id = $1 THEN m.receiver_id 
               ELSE m.sender_id 
             END)
             m.*,
             CASE 
               WHEN m.sender_id = $1 THEN r.full_name 
               ELSE s.full_name 
             END as other_user_name,
             CASE 
               WHEN m.sender_id = $1 THEN m.receiver_id 
               ELSE m.sender_id 
             END as other_user_id,
             i.title as item_title
       FROM messages m
       JOIN profiles s ON m.sender_id = s.id
       JOIN profiles r ON m.receiver_id = r.id
       JOIN items i ON m.item_id = i.id
       WHERE m.sender_id = $1 OR m.receiver_id = $1
       ORDER BY m.item_id,
                CASE 
                  WHEN m.sender_id = $1 THEN m.receiver_id 
                  ELSE m.sender_id 
                END,
                m.created_at DESC`,
      [req.user.id]
    );

    res.json({ conversations: result.rows });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get notifications
router.get('/notifications', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );

    res.json({ notifications: result.rows });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', authenticate, async (req, res) => {
  try {
    await pool.query(
      'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification error:', error);
    res.status(500).json({ error: 'Failed to mark notification' });
  }
});

export default router;
