const express = require('express');
const router = express.Router();
const pool = require('../db');

// Dashboard stats
router.get('/', async (req, res) => {
  try {
    const [[{ totalOutlets }]] = await pool.query('SELECT COUNT(*) as totalOutlets FROM Outlets WHERE deleted_at IS NULL');
    const [[{ totalProducts }]] = await pool.query('SELECT COUNT(*) as totalProducts FROM Products WHERE deleted_at IS NULL');
    // Use MySQL CURDATE() directly to avoid Node.js timezone issues
    const [[{ ordersToday }]] = await pool.query('SELECT COUNT(*) as ordersToday FROM Orders WHERE date = CURDATE() AND deleted_at IS NULL');
    const [[{ revenueToday }]] = await pool.query('SELECT CAST(COALESCE(SUM(total), 0) AS SIGNED) as revenueToday FROM Orders WHERE date = CURDATE() AND deleted_at IS NULL');

    // Recent orders
    const [recentOrders] = await pool.query(`
      SELECT ord.*, o.name_outlet, p.name as payment_name, sp.name as status_name
      FROM Orders ord
      LEFT JOIN Outlets o ON ord.outlet_id = o.id_outlet
      LEFT JOIN Payments p ON ord.payment_id = p.id_payment
      LEFT JOIN Status_payments sp ON ord.status_id = sp.id_status_payment
      WHERE ord.deleted_at IS NULL
      ORDER BY ord.date DESC, ord.created_at DESC
      LIMIT 10
    `);

    // Top products by order quantity
    const [topProducts] = await pool.query(`
      SELECT pr.name, CAST(COALESCE(SUM(op.qty), 0) AS SIGNED) as total_qty
      FROM Order_products op
      JOIN Products pr ON op.product__id = pr.id_product
      WHERE op.deleted_at IS NULL AND pr.deleted_at IS NULL
      GROUP BY pr.id_product, pr.name
      ORDER BY total_qty DESC
      LIMIT 5
    `);

    // Revenue last 7 days
    const [revenueTrend] = await pool.query(`
      SELECT DATE(date) as day, CAST(COALESCE(SUM(total), 0) AS SIGNED) as revenue
      FROM Orders
      WHERE date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND deleted_at IS NULL
      GROUP BY DATE(date)
      ORDER BY day ASC
    `);

    res.json({
      totalOutlets: Number(totalOutlets),
      totalProducts: Number(totalProducts),
      ordersToday: Number(ordersToday),
      revenueToday: Number(revenueToday),
      recentOrders,
      topProducts,
      revenueTrend
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
