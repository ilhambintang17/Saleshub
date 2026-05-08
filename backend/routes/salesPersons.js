const express = require('express');
const router = express.Router();
const pool = require('../db');
const { getLocalDate } = require('../db');
const { v4: uuidv4 } = require('uuid');

// GET all
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Sales_person WHERE deleted_at IS NULL ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET by id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Sales_person WHERE id_sales_person = ? AND deleted_at IS NULL', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST create
router.post('/', async (req, res) => {
  try {
    const id = uuidv4();
    const { name, number_phone } = req.body;
    const now = getLocalDate();
    await pool.query(
      'INSERT INTO Sales_person (id_sales_person, name, number_phone, created_at, created_by) VALUES (?, ?, ?, ?, ?)',
      [id, name, number_phone, now, 'admin']
    );
    const [rows] = await pool.query('SELECT * FROM Sales_person WHERE id_sales_person = ?', [id]);
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT update
router.put('/:id', async (req, res) => {
  try {
    const { name, number_phone } = req.body;
    const now = getLocalDate();
    await pool.query(
      'UPDATE Sales_person SET name = ?, number_phone = ?, updated_at = ?, updated_by = ? WHERE id_sales_person = ?',
      [name, number_phone, now, 'admin', req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM Sales_person WHERE id_sales_person = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE (soft)
router.delete('/:id', async (req, res) => {
  try {
    const now = getLocalDate();
    await pool.query('UPDATE Sales_person SET deleted_at = ?, deleted_by = ? WHERE id_sales_person = ?', [now, 'admin', req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
