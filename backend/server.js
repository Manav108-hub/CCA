const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const fs = require('fs');
const mysqldump = require('mysqldump');
const jwt = require('jsonwebtoken');


const app = express();
const port = process.env.PORT || 8000;

//Set up ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const publicDirectory = path.join(__dirname, '/public');
app.use(express.static(publicDirectory));

//Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: false }));
// Parse JSON request body
app.use(express.json());

//Connect MySQL
const pool = mysql.createPool({
    host: 'mysql',
    user: 'root',
    password: 'password',
    database: 'ganjababydb',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Function to create users table
function createUsersTable() {
    // Read the contents of user.sql file
    const sqlFilePath = path.join(__dirname, 'database', 'user.sql');
    fs.readFile(sqlFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading user.sql:', err);
            return;
        }

        // Execute the SQL commands to create the table
        pool.query(data, (err, results) => {
            if (err) {
                console.error('Error creating users table:', err);
                return;
            }
            console.log('Users table created successfully');
        });
    });
}

// Call the function to create users table when the application starts
createUsersTable();

// Function to create users table
function createProductTable() {
    // Read the contents of user.sql file
    const sqlFilePathProd = path.join(__dirname, 'database', 'product.sql');
    fs.readFile(sqlFilePathProd, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading product.sql:', err);
            return;
        }

        // Execute the SQL commands to create the table
        pool.query(data, (err, results) => {
            if (err) {
                console.error('Error creating product table:', err);
                return;
            }
            console.log('Product table created successfully');
        });
    });
}

// Call the function to create users table when the application starts
createProductTable();


app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));
app.get('/shop', (req, res) => {
    res.render('shop');
})
app.get('/shopre', (req, res) => {
    res.render('shopre');
})

app.post('/products', (req, res) => {
  // Extract data from the request body
  const { product_id, name, brand, application, model_no, dimensions, capacity, material, no_of_hydraulic_cylinder, price, image_url } = req.body;

  // Create a new product object
  const newProduct = {
    product_id,
    name,
    brand,
    application,
    model_no,
    dimensions,
    capacity,
    material,
    no_of_hydraulic_cylinder,
    price,
    image_url
  };

  // Insert the new product into the database
  pool.query('INSERT INTO products SET ?', newProduct, (error, results) => {
    if (error) {
      console.error('Error inserting product:', error);
      return res.status(500).json({ error: 'Failed to create product' });
    }
    console.log('Product created successfully');
    res.status(201).json({ message: 'Product created successfully', productId: results.insertId });
  });
});

// Define route to fetch and display products
app.get('/products', (req, res) => {
  // Query products from database
  pool.query('SELECT * FROM products', (error, results, fields) => {
    if (error) {
      console.error('Error querying database: ' + error.stack);
      res.status(500).send('Internal Server Error');
      return;
    }
    // Render product.ejs template with product data
    res.render('shop', { products: results });
  });
});


// Endpoint to create user table
app.get('/user-table', (req, res) => {
  // Read the SQL file
  fs.readFile(path.join(__dirname, '/database/user.sql'), 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading SQL file:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    // Execute the SQL query
    pool.query(data, (err, results) => {
      if (err) {
        console.error('Error executing SQL query:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      res.json({ message: 'User table created successfully' });
    });
  });
});

// Endpoint to create user table
app.get('/product-table', (req, res) => {
  // Read the SQL file
  fs.readFile(path.join(__dirname, '/database/product.sql'), 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading SQL file:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    // Execute the SQL query
    pool.query(data, (err, results) => {
      if (err) {
        console.error('Error executing SQL query:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      res.json({ message: 'Product table created successfully' });
    });
  });
});

app.post('/api/v1/create-user', (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({
            error: "Username, email and password are required"
        });   
    }
    pool.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, password], (err, results) => {
        if (err) {
            console.error('Error creating user:', err);
            return res.status(500).json({
                error: 'Internal Server Error'
            });
        }
        res.status(201).json({
            message: 'User created successfully', userId: results.insertId
        });
    });
});


// Endpoint to generate and download SQL dump
app.get('/api/v1/backup-db', (req, res) => {
    const dumpPath = path.join(__dirname, 'database', 'backup.sql');
    // Generate SQL dump
    mysqldump({
        connection: {
            host: 'mysql',
            user: 'root',
            password: 'password',
            database: 'mydatabase'
        },
        dumpToFile: dumpPath
    })
    .then(() => {
        // Send the SQL dump file to the client
        res.download(dumpPath, 'backup.sql', (err) => {
            if (err) {
                console.error('Error sending SQL dump:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            // Delete the SQL dump file after sending
            fs.unlinkSync(dumpPath);
        });
    })
    .catch((err) => {
        console.error('Error generating SQL dump:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    });
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});