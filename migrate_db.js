const fs = require('fs');
const path = require('path');
const db = require('./config/db');

async function migrate() {
    console.log('Starting migration to online database...');
    try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        // Split by semicolon, but handle potential issues with semicolons inside strings
        // This is a simple splitter for standard schema files
        const queries = schema.split(';').filter(q => q.trim().length > 0);
        
        for (let query of queries) {
            console.log(`Executing query: ${query.substring(0, 50)}...`);
            await db.query(query);
        }
        
        console.log('SUCCESS: Online database schema is fully updated!');
        process.exit(0);
    } catch (err) {
        console.error('MIGRATION FAILED:', err);
        process.exit(1);
    }
}

migrate();
