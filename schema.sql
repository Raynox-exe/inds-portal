-- INDS Platform Database Schema

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'editor', 'author', 'researcher', 'subscriber') DEFAULT 'researcher',
    status ENUM('active', 'suspended', 'banned') DEFAULT 'active',
    bio TEXT,
    profile_pic VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS journals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    volume_no INT,
    issue_no INT,
    publication_year INT,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id INT,
    category_id INT,
    journal_id INT,
    status ENUM('draft', 'pending', 'published', 'rejected') DEFAULT 'draft',
    views INT DEFAULT 0,
    file_path VARCHAR(255), -- For PDF manuscripts
    published_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (journal_id) REFERENCES journals(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    article_id INT NOT NULL,
    user_id INT,
    user_name VARCHAR(100), -- For guest comments or cached name
    content TEXT NOT NULL,
    status ENUM('approved', 'pending', 'flagged') DEFAULT 'approved',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    transaction_id VARCHAR(100) NOT NULL UNIQUE,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'NGN',
    plan_name VARCHAR(100),
    status ENUM('success', 'pending', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert default admin user (Password: Admin@123)
-- Hash: $2a$10$7pL0Rz9f1x3K3z.k9Wn9u.vE.V/S8f9A0W9lFvE8U.V8zGfW9lFvE
-- Note: Replace with actual hash in production
INSERT IGNORE INTO users (full_name, email, password, role) 
VALUES ('System Admin', 'admin@inds.org.ng', '$2a$10$7pL0Rz9f1x3K3z.k9Wn9u.vE.V/S8f9A0W9lFvE8U.V8zGfW9lFvE', 'admin');

-- Insert initial categories
INSERT IGNORE INTO categories (name, description) VALUES 
('Environmental Science', 'Research related to the ecology and environment of the Niger Delta.'),
('Socio-Economics', 'Studies on the economic and social welfare of the region.'),
('Policy & Governance', 'Analyses of governance structures and regional policies.');

-- Insert initial Journal issue
INSERT IGNORE INTO journals (name, volume_no, issue_no, publication_year, status)
VALUES ("September - 2024 Issue", 12, 1, 2024, 'published');

CREATE TABLE IF NOT EXISTS submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    subject_area VARCHAR(100),
    abstract TEXT,
    author_name VARCHAR(255),
    author_email VARCHAR(255),
    author_institute VARCHAR(255),
    contact_number VARCHAR(50),
    country VARCHAR(100),
    co_authors TEXT,
    file_path VARCHAR(255) NOT NULL,
    status ENUM('pending', 'under_review', 'accepted', 'rejected') DEFAULT 'pending',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
