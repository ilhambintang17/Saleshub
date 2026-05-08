const express = require('express');
const router = express.Router();
const pool = require('../db');
const { getLocalDate } = require('../db');
const { v4: uuidv4 } = require('uuid');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT o.*, sp.name as sales_person_name
      FROM Outlets o
      LEFT JOIN Sales_person sp ON o.sales_person_id = sp.id_sales_person
      WHERE o.deleted_at IS NULL
      ORDER BY o.created_at DESC
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT o.*, sp.name as sales_person_name
      FROM Outlets o
      LEFT JOIN Sales_person sp ON o.sales_person_id = sp.id_sales_person
      WHERE o.id_outlet = ? AND o.deleted_at IS NULL
    `, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const id = uuidv4();
    const { name_outlet, name_owner, location, number_phone, sales_person_id } = req.body;
    const now = getLocalDate();
    await pool.query(
      'INSERT INTO Outlets (id_outlet, name_outlet, name_owner, location, number_phone, sales_person_id, created_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name_outlet, name_owner, location, number_phone, sales_person_id || null, now, 'admin']
    );
    const [rows] = await pool.query('SELECT * FROM Outlets WHERE id_outlet = ?', [id]);
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { name_outlet, name_owner, location, number_phone, sales_person_id } = req.body;
    const now = getLocalDate();
    await pool.query(
      'UPDATE Outlets SET name_outlet = ?, name_owner = ?, location = ?, number_phone = ?, sales_person_id = ?, updated_at = ?, updated_by = ? WHERE id_outlet = ?',
      [name_outlet, name_owner, location, number_phone, sales_person_id || null, now, 'admin', req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM Outlets WHERE id_outlet = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const now = getLocalDate();
    await pool.query('UPDATE Outlets SET deleted_at = ?, deleted_by = ? WHERE id_outlet = ?', [now, 'admin', req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
