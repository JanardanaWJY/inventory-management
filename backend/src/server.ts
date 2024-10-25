import express from 'express';
import mariadb from 'mariadb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import moment from 'moment';

const app = express();
app.use(cors());
const port = 8080;

const pool = mariadb.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'inventory_management',
  connectionLimit: 5
});

interface User {
  id: number;
  Password: string;
  Last_Login_Date?: Date;
  Name: string;
}

interface Product {
  product_sn: string;
  purchase_date: string;
  name: string;
  price: number;
  vendor: string;
  description: string;
}

interface Rental {
  product_sn: string;
  start_date: string;
  transaction_type: number;
  end_date: string | null;
  qty: number;
  description: string;
}

pool.getConnection()
  .then(conn => {
    console.log('Connected to MariaDB');
    conn.release();
  })
  .catch(err => {
    console.error('Error connecting to MariaDB:', err);
  });

const validateName = (name: string) => /^[a-zA-Z0-9_ ]+$/.test(name);
const validatePassword = (password: string) => /^[a-zA-Z0-9_]{8,}$/.test(password);

app.use(express.json());

app.post('/register', async (req, res) => {
  const { name, password } = req.body;

  if (!validateName(name)) {
    return res.status(400).send('Name can only contain letters, numbers, spaces, and underscores.');
  }

  if (!validatePassword(password)) {
    return res.status(400).send('Password must be at least 8 characters long and contain only letters, numbers, and underscores.');
  }

  try {
    const conn = await pool.getConnection();
    const checkUserSql = 'SELECT * FROM users WHERE BINARY Name = ?';
    const results = await conn.query(checkUserSql, [name]) as User[];

    if (results.length > 0) {
      conn.release();
      return res.status(409).send('User already exists');
    }

    const hashedPassword = bcrypt.hashSync(password, 8);
    const insertUserSql = 'INSERT INTO users (Name, Password) VALUES (?, ?)';
    await conn.query(insertUserSql, [name, hashedPassword]);
    conn.release();

    res.status(201).send('User registered successfully');
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send('Server error');
  }
});

app.post('/login', async (req, res) => {
  const { name, password } = req.body;

  try {
    const conn = await pool.getConnection();
    const sql = 'SELECT * FROM users WHERE BINARY Name = ?';
    const results = await conn.query(sql, [name]) as User[];
    conn.release();

    if (results.length === 0) {
      return res.status(404).send('User not found');
    }

    const user = results[0];
    const passwordIsValid = bcrypt.compareSync(password, user.Password);

    if (!passwordIsValid) {
      return res.status(401).send('Invalid password');
    }

    const lastLoginDate = new Date();
    const updateSql = 'UPDATE users SET Last_Login_Date = ? WHERE id = ?';
    await conn.query(updateSql, [lastLoginDate, user.id]);

    const token = jwt.sign({ id: user.id }, 'your_jwt_secret', { expiresIn: 86400 });
    res.status(200).send({ auth: true, token });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).send('Server error');
  }
});

app.get('/products', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const sql = 'SELECT * FROM products';
    const results = await conn.query(sql) as Product[];
    conn.release();
    res.status(200).send(results);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send('Server error');
  }
});

app.post('/products', async (req, res) => {
  const { product_sn, purchase_date, name, price, vendor, description } = req.body;
  
  const formattedPurchaseDate = moment(purchase_date).format('YYYY-MM-DD HH:mm:ss');
  
  try {
    const conn = await pool.getConnection();
    const sql = 'INSERT INTO products (product_sn, purchase_date, name, price, vendor, description) VALUES (?, ?, ?, ?, ?, ?)';
    await conn.query(sql, [product_sn, formattedPurchaseDate, name, price, vendor, description]);
    conn.release();
    res.status(201).send('Product added successfully');
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).send('Server error');
  }
});

app.put('/products/:product_sn', async (req, res) => {
  const { product_sn } = req.params;
  const { purchase_date, name, price, vendor, description } = req.body;
  
  const formattedPurchaseDate = moment(purchase_date).format('YYYY-MM-DD HH:mm:ss');
  
  try {
    const conn = await pool.getConnection();
    const sql = 'UPDATE products SET purchase_date = ?, name = ?, price = ?, vendor = ?, description = ? WHERE product_sn = ?';
    await conn.query(sql, [formattedPurchaseDate, name, price, vendor, description, product_sn]);
    conn.release();
    res.status(200).send('Product updated successfully');
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).send('Server error');
  }
});

app.delete('/products/:product_sn', async (req, res) => {
  const { product_sn } = req.params;
  try {
    const conn = await pool.getConnection();
    const sql = 'DELETE FROM products WHERE product_sn = ?';
    await conn.query(sql, [product_sn]);
    conn.release();
    res.status(200).send('Product and related rentals deleted successfully');
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).send('Server error');
  }
});

app.get('/rentals/:product_sn', async (req, res) => {
  const { product_sn } = req.params;
  try {
    const conn = await pool.getConnection();
    const sql = 'SELECT * FROM rentals WHERE product_sn = ?';
    const results = await conn.query(sql, [product_sn]) as Rental[];
    conn.release();
    res.status(200).send(results);
  } catch (error) {
    console.error('Error fetching rentals:', error);
    res.status(500).send('Server error');
  }
});

app.post('/rentals', async (req, res) => {
  const { product_sn, start_date, transaction_type, end_date, qty, description } = req.body;

  const formattedStartDate = moment(start_date).format('YYYY-MM-DD HH:mm:ss');
  const formattedEndDate = end_date ? moment(end_date).format('YYYY-MM-DD HH:mm:ss') : null;

  try {
    const conn = await pool.getConnection();
    const sql = 'INSERT INTO rentals (product_sn, start_date, transaction_type, end_date, qty, description) VALUES (?, ?, ?, ?, ?, ?)';
    await conn.query(sql, [product_sn, formattedStartDate, transaction_type, formattedEndDate, qty, description]);
    conn.release();
    res.status(201).send('Rental record added successfully');
  } catch (error) {
    console.error('Error adding rental record:', error);
    res.status(500).send('Server error');
  }
});

app.put('/rentals/:product_sn/:start_date', async (req, res) => {
  const { product_sn, start_date } = req.params;
  const { transaction_type, end_date, qty, description } = req.body;

  const formattedStartDate = moment(start_date).format('YYYY-MM-DD HH:mm:ss');
  const formattedEndDate = end_date ? moment(end_date).format('YYYY-MM-DD HH:mm:ss') : null;

  try {
    const conn = await pool.getConnection();
    const sql = 'UPDATE rentals SET transaction_type = ?, end_date = ?, qty = ?, description = ? WHERE product_sn = ? AND start_date = ?';
    await conn.query(sql, [transaction_type, formattedEndDate, qty, description, product_sn, formattedStartDate]);
    conn.release();
    res.status(200).send('Rental record updated successfully');
  } catch (error) {
    console.error('Error updating rental record:', error);
    res.status(500).send('Server error');
  }
});

app.delete('/rentals/:product_sn/:start_date', async (req, res) => {
  const { product_sn, start_date } = req.params;

  const formattedStartDate = moment(start_date).format('YYYY-MM-DD HH:mm:ss');
  
  try {
    const conn = await pool.getConnection();
    const sql = 'DELETE FROM rentals WHERE product_sn = ? AND start_date = ?';
    await conn.query(sql, [product_sn, formattedStartDate]);
    conn.release();
    res.status(200).send('Rental record deleted successfully');
  } catch (error) {
    console.error('Error deleting rental record:', error);
    res.status(500).send('Server error');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
