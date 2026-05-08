const express = require('express');
const router = express.Router();
const pool = require('../db');
const { getLocalDate } = require('../db');
const { v4: uuidv4 } = require('uuid');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Categories WHERE deleted_at IS NULL ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const id = uuidv4();
    const { name, description } = req.body;
    const now = getLocalDate();
    await pool.query('INSERT INTO Categories (id_category, name, description, created_at, created_by) VALUES (?, ?, ?, ?, ?)', [id, name, description || '', now, 'admin']);
    const [rows] = await pool.query('SELECT * FROM Categories WHERE id_category = ?', [id]);
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    const now = getLocalDate();
    await pool.query('UPDATE Categories SET name = ?, description = ?, updated_at = ?, updated_by = ? WHERE id_category = ?', [name, description || '', now, 'admin', req.params.id]);
    const [rows] = await pool.query('SELECT * FROM Categories WHERE id_category = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const now = getLocalDate();
    await pool.query('UPDATE Categories SET deleted_at = ?, deleted_by = ? WHERE id_category = ?', [now, 'admin', req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
