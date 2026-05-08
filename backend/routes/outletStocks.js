const express = require('express');
const router = express.Router();
const pool = require('../db');
const { getLocalDate } = require('../db');
const { v4: uuidv4 } = require('uuid');

// GET all stocks, optionally filter by outlet_id
router.get('/', async (req, res) => {
  try {
    let query = `
      SELECT os.*, o.name_outlet, p.name as product_name, v.name as variant_name
      FROM Outlet_stocks os
      LEFT JOIN Outlets o ON os.outlet_id = o.id_outlet
      LEFT JOIN Products p ON os.product_id = p.id_product
      LEFT JOIN Variants v ON p.variant_id = v.id_variant
      WHERE os.deleted_at IS NULL
    `;
    const params = [];
    if (req.query.outlet_id) {
      query += ' AND os.outlet_id = ?';
      params.push(req.query.outlet_id);
    }
    query += ' ORDER BY os.created_at DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const id = uuidv4();
    const { retail_qty, retail_price, outlet_id, product_id } = req.body;
    const now = getLocalDate();
    await pool.query(
      'INSERT INTO Outlet_stocks (id_outlet_stock, retail_qty, retail_price, outlet_id, product_id, created_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, retail_qty || 0, retail_price || 0, outlet_id, product_id, now, 'admin']
    );
    const [rows] = await pool.query('SELECT * FROM Outlet_stocks WHERE id_outlet_stock = ?', [id]);
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { retail_qty, retail_price, product_id } = req.body;
    const now = getLocalDate();
    await pool.query(
      'UPDATE Outlet_stocks SET retail_qty = ?, retail_price = ?, product_id = ?, updated_at = ?, updated_by = ? WHERE id_outlet_stock = ?',
      [retail_qty, retail_price, product_id, now, 'admin', req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM Outlet_stocks WHERE id_outlet_stock = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const now = getLocalDate();
    await pool.query('UPDATE Outlet_stocks SET deleted_at = ?, deleted_by = ? WHERE id_outlet_stock = ?', [now, 'admin', req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
