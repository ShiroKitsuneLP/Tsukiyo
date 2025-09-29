// Import necessary modules
const path = require('path');

// Import database connection
const { db } = require(path.join(__dirname, './../database/db'));

// Import schema setup function
const { setupSchema } = require(path.join(__dirname, './../database/schema'));

// Function to drop a specific table
function dropTable(tableName) {
    db.exec(`DROP TABLE IF EXISTS ${tableName};`);

    console.log(`[Database] Table '${tableName}' dropped successfully.`);
}

// Function to reset Database (drops all tables)
function resetTable() {
    db.exec(`DROP TABLE IF EXISTS spotify_accounts;`);
    db.exec(`DROP TABLE IF EXISTS toggles;`);

    console.log('[Database] All tables dropped successfully.');
}

// Check for command line arguments
const drop = process.argv.includes('--drop');
const reset = process.argv.includes('--reset');
const setup = process.argv.includes('--setup');

// Check if at least one argument is provided
if (!drop && !reset && !setup) {
    console.error('[Error] Please provide at least one argument: --drop, --reset or --setup');
    process.exit(1);
}

// Database management operations
try {
    if (drop) {
        const tableName = process.argv[3];

        if (!tableName) {
            console.error('[Error] Please provide a table name to drop. Usage: <table_name>');
            process.exit(1);
        }

        dropTable(tableName);

        db.close();
        process.exit(0);
    }

    if (reset) {
        resetTable();

        db.close();
        process.exit(0);
    }

    if (setup) {
        setupSchema();

        db.close();
        process.exit(0);
    }
} catch (error) {
    console.error(`[Error] ${error.message}`);
    db.close();
    process.exit(1);
}