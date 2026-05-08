const express = require('express');
const router = express.Router();
const pool = require('../db');
const { getLocalDate } = require('../db');
const { v4: uuidv4 } = require('uuid');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Variants WHERE deleted_at IS NULL ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Variants WHERE id_variant = ? AND deleted_at IS NULL', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const id = uuidv4();
    const { name, description } = req.body;
    const now = getLocalDate();
    await pool.query('INSERT INTO Variants (id_variant, name, description, created_at, created_by) VALUES (?, ?, ?, ?, ?)', [id, name, description || '', now, 'admin']);
    const [rows] = await pool.query('SELECT * FROM Variants WHERE id_variant = ?', [id]);
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    const now = getLocalDate();
    await pool.query('UPDATE Variants SET name = ?, description = ?, updated_at = ?, updated_by = ? WHERE id_variant = ?', [name, description || '', now, 'admin', req.params.id]);
    const [rows] = await pool.query('SELECT * FROM Variants WHERE id_variant = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const now = getLocalDate();
    await pool.query('UPDATE Variants SET deleted_at = ?, deleted_by = ? WHERE id_variant = ?', [now, 'admin', req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
