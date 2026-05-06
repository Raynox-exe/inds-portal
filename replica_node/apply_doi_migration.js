const fs = require('fs');
const path = require('path');
// Load .env explicitly from this directory
require('dotenv').config({ path: path.join(__dirname, '.env') });
const db = require('./config/db');

async function runMigration() {
    console.log('--- STARTING DOI MIGRATION TO AIVEN ---');
    try {
        const sqlPath = path.join(__dirname, 'add_doi_fields.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        // Split by semicolon and filter empty lines
        const queries = sql.split(';').map(q => q.trim()).filter(q => q.length > 0);
        
        for (let query of queries) {
            console.log(`Executing: ${query.substring(0, 50)}...`);
            await db.query(query);
        }
        
        console.log('--- SUCCESS: DOI Fields added to Aiven database ---');
        process.exit(0);
    } catch (err) {
        console.error('--- MIGRATION FAILED ---');
        console.error(err);
        process.exit(1);
    }
}

runMigration();
