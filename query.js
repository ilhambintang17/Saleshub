const mysql = require('mysql2/promise');

async function main() {
  const pool = mysql.createPool({
    host: '127.0.0.1', port: 3306, user: 'root', password: 'root', database: 'sales_db'
  });

  try {
    const [orders] = await pool.query('SELECT id_order, date, total, status_id FROM Orders');
    console.log('Orders:', orders);

    const [desc] = await pool.query('DESCRIBE Order_products');
    console.log('Order_products Columns:', desc);
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}

main();
