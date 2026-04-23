const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initDB() {
    console.log('Connecting to online database at:', process.env.DB_HOST);
    
    try {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306,
            multipleStatements: true
        });

        console.log('Connected! Reading schema.sql...');
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log('Executing schema on online server...');
        await conn.query(schema);
        console.log('✅ Tables initialized successfully on the online database!');

        await conn.end();
        process.exit(0);
    } catch (err) {
        console.error('❌ Error initializing database:', err.message);
        if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('Please check your DB credentials in .env');
        }
        process.exit(1);
    }
}

initDB();
