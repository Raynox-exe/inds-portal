const bcrypt = require('bcryptjs');
const db = require('./config/db');

async function seed() {
    try {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await db.query("INSERT IGNORE INTO users (full_name, email, password, role) VALUES (?, ?, ?, 'admin')", 
            ['INDS Administrator', 'admin@inds.org.ng', hashedPassword]);
        console.log('Admin account seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding admin:', err);
        process.exit(1);
    }
}

seed();
