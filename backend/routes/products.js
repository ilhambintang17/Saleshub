const express = require('express');
const router = express.Router();
const pool = require('../db');
const { getLocalDate } = require('../db');
const { v4: uuidv4 } = require('uuid');

// GET all products with joins
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, v.name as variant_name, b.name as brand_name,
        GROUP_CONCAT(c.name) as category_names,
        GROUP_CONCAT(c.id_category) as category_ids
      FROM Products p
      LEFT JOIN Variants v ON p.variant_id = v.id_variant
      LEFT JOIN Brands b ON p.brand_id = b.id_brand
      LEFT JOIN Product_categories pc ON pc.product_id = p.id_product AND pc.deleted_at IS NULL
      LEFT JOIN Categories c ON pc.category_id = c.id_category AND c.deleted_at IS NULL
      WHERE p.deleted_at IS NULL
      GROUP BY p.id_product
      ORDER BY p.created_at DESC
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, v.name as variant_name, b.name as brand_name
      FROM Products p
      LEFT JOIN Variants v ON p.variant_id = v.id_variant
      LEFT JOIN Brands b ON p.brand_id = b.id_brand
      WHERE p.id_product = ? AND p.deleted_at IS NULL
    `, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    // Get categories
    const [cats] = await pool.query(`
      SELECT c.* FROM Product_categories pc
      JOIN Categories c ON pc.category_id = c.id_category
      WHERE pc.product_id = ? AND pc.deleted_at IS NULL AND c.deleted_at IS NULL
    `, [req.params.id]);
    rows[0].categories = cats;
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const id = uuidv4();
    const { name, price, qty, variant_id, brand_id, category_ids } = req.body;
    const now = getLocalDate();
    await pool.query(
      'INSERT INTO Products (id_product, name, price, qty, variant_id, brand_id, created_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, price || 0, qty || 0, variant_id || null, brand_id || null, now, 'admin']
    );
    // Insert categories
    if (category_ids && category_ids.length > 0) {
      for (const catId of category_ids) {
        const pcId = uuidv4();
        await pool.query(
          'INSERT INTO Product_categories (id_product_category, product_id, category_id, created_at, created_by) VALUES (?, ?, ?, ?, ?)',
          [pcId, id, catId, now, 'admin']
        );
      }
    }
    const [rows] = await pool.query('SELECT * FROM Products WHERE id_product = ?', [id]);
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, price, qty, variant_id, brand_id, category_ids } = req.body;
    const now = getLocalDate();
    await pool.query(
      'UPDATE Products SET name = ?, price = ?, qty = ?, variant_id = ?, brand_id = ?, updated_at = ?, updated_by = ? WHERE id_product = ?',
      [name, price || 0, qty || 0, variant_id || null, brand_id || null, now, 'admin', req.params.id]
    );
    // Update categories: soft-delete old, insert new
    if (category_ids !== undefined) {
      await pool.query('UPDATE Product_categories SET deleted_at = ?, deleted_by = ? WHERE product_id = ? AND deleted_at IS NULL', [now, 'admin', req.params.id]);
      if (category_ids && category_ids.length > 0) {
        for (const catId of category_ids) {
          const pcId = uuidv4();
          await pool.query(
            'INSERT INTO Product_categories (id_product_category, product_id, category_id, created_at, created_by) VALUES (?, ?, ?, ?, ?)',
            [pcId, req.params.id, catId, now, 'admin']
          );
        }
      }
    }
    const [rows] = await pool.query('SELECT * FROM Products WHERE id_product = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const now = getLocalDate();
    await pool.query('UPDATE Products SET deleted_at = ?, deleted_by = ? WHERE id_product = ?', [now, 'admin', req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
