CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL, -- Added name column
    brand VARCHAR(100) NOT NULL,
    application TEXT,
    model_no VARCHAR(50),
    dimensions VARCHAR(100),
    capacity VARCHAR(50),
    material VARCHAR(100),
    no_of_hydraulic_cylinder VARCHAR(20),
    price DECIMAL(10, 2) NOT NULL,
    image_url TEXT
);
