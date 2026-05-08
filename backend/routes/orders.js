const express = require('express');
const router = express.Router();
const pool = require('../db');
const { getLocalDate } = require('../db');
const { v4: uuidv4 } = require('uuid');

// GET all orders with joins
router.get('/', async (req, res) => {
  try {
    let query = `
      SELECT ord.*, o.name_outlet, p.name as payment_name, sp.name as status_name
      FROM Orders ord
      LEFT JOIN Outlets o ON ord.outlet_id = o.id_outlet
      LEFT JOIN Payments p ON ord.payment_id = p.id_payment
      LEFT JOIN Status_payments sp ON ord.status_id = sp.id_status_payment
      WHERE ord.deleted_at IS NULL
    `;
    const params = [];
    if (req.query.outlet_id) {
      query += ' AND ord.outlet_id = ?';
      params.push(req.query.outlet_id);
    }
    if (req.query.status_id) {
      query += ' AND ord.status_id = ?';
      params.push(req.query.status_id);
    }
    query += ' ORDER BY ord.date DESC, ord.created_at DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT ord.*, o.name_outlet, p.name as payment_name, sp.name as status_name
      FROM Orders ord
      LEFT JOIN Outlets o ON ord.outlet_id = o.id_outlet
      LEFT JOIN Payments p ON ord.payment_id = p.id_payment
      LEFT JOIN Status_payments sp ON ord.status_id = sp.id_status_payment
      WHERE ord.id_order = ? AND ord.deleted_at IS NULL
    `, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    // Get order products
    const [items] = await pool.query(`
      SELECT op.*, pr.name as product_name
      FROM Order_products op
      LEFT JOIN Products pr ON op.product__id = pr.id_product
      WHERE op.order_id = ? AND op.deleted_at IS NULL
    `, [req.params.id]);
    rows[0].items = items;
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const id = uuidv4();
    const { date, outlet_id, payment_id, status_id, items } = req.body;
    const now = getLocalDate();
    const orderDate = date || now;

    // Look up actual product prices from DB and calculate total
    let total = 0;
    const resolvedItems = [];
    if (items && items.length > 0) {
      for (const item of items) {
        const qty = Number(item.qty) || 0;
        let price = Number(item.price) || 0;
        // Always look up the real price from the database
        if (item.product_id) {
          const [prodRows] = await pool.query('SELECT price FROM Products WHERE id_product = ? AND deleted_at IS NULL', [item.product_id]);
          if (prodRows.length > 0 && prodRows[0].price != null) {
            price = Number(prodRows[0].price);
          }
        }
        total += qty * price;
        resolvedItems.push({ product_id: item.product_id, qty, price });
      }
    }

    await pool.query(
      'INSERT INTO Orders (id_order, date, total, status_id, payment_id, outlet_id, created_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, orderDate, total, status_id || null, payment_id || null, outlet_id || null, now, 'admin']
    );

    // Insert order products with verified prices
    if (resolvedItems.length > 0) {
      for (const item of resolvedItems) {
        const opId = uuidv4();
        await pool.query(
          'INSERT INTO Order_products (id_order_product, qty, price, product__id, order_id, created_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [opId, item.qty, item.price, item.product_id, id, now, 'admin']
        );
      }
    }

    const [rows] = await pool.query('SELECT * FROM Orders WHERE id_order = ?', [id]);
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { date, outlet_id, payment_id, status_id, items } = req.body;
    const now = getLocalDate();

    // Look up actual product prices from DB and calculate total
    let total = 0;
    const resolvedItems = [];
    if (items && items.length > 0) {
      for (const item of items) {
        const qty = Number(item.qty) || 0;
        let price = Number(item.price) || 0;
        // Always look up the real price from the database
        if (item.product_id) {
          const [prodRows] = await pool.query('SELECT price FROM Products WHERE id_product = ? AND deleted_at IS NULL', [item.product_id]);
          if (prodRows.length > 0 && prodRows[0].price != null) {
            price = Number(prodRows[0].price);
          }
        }
        total += qty * price;
        resolvedItems.push({ product_id: item.product_id, qty, price });
      }
    }

    await pool.query(
      'UPDATE Orders SET date = ?, total = ?, status_id = ?, payment_id = ?, outlet_id = ?, updated_at = ?, updated_by = ? WHERE id_order = ?',
      [date || now, total, status_id || null, payment_id || null, outlet_id || null, now, 'admin', req.params.id]
    );

    // Re-create order items with verified prices
    if (items !== undefined) {
      await pool.query('UPDATE Order_products SET deleted_at = ?, deleted_by = ? WHERE order_id = ? AND deleted_at IS NULL', [now, 'admin', req.params.id]);
      if (resolvedItems.length > 0) {
        for (const item of resolvedItems) {
          const opId = uuidv4();
          await pool.query(
            'INSERT INTO Order_products (id_order_product, qty, price, product__id, order_id, created_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [opId, item.qty, item.price, item.product_id, req.params.id, now, 'admin']
          );
        }
      }
    }

    const [rows] = await pool.query('SELECT * FROM Orders WHERE id_order = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const now = getLocalDate();
    await pool.query('UPDATE Orders SET deleted_at = ?, deleted_by = ? WHERE id_order = ?', [now, 'admin', req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
