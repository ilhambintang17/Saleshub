const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./backend/db');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/dashboard', require('./backend/routes/dashboard'));
app.use('/api/sales-persons', require('./backend/routes/salesPersons'));
app.use('/api/variants', require('./backend/routes/variants'));
app.use('/api/brands', require('./backend/routes/brands'));
app.use('/api/categories', require('./backend/routes/categories'));
app.use('/api/payments', require('./backend/routes/payments'));
app.use('/api/status-payments', require('./backend/routes/statusPayments'));
app.use('/api/products', require('./backend/routes/products'));
app.use('/api/outlets', require('./backend/routes/outlets'));
app.use('/api/outlet-stocks', require('./backend/routes/outletStocks'));
app.use('/api/orders', require('./backend/routes/orders'));

// Init DB
async function initDB() {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Database connected');
    conn.release();
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    console.log('Retrying in 3 seconds...');
    setTimeout(initDB, 3000);
  }
}

// SPA fallback
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 SalesHub server running at http://localhost:${PORT}`);
  initDB();
});
