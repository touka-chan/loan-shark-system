import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'rootadmin123456789',
    database: process.env.DB_NAME || 'finalproj_lmsdb',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test the connection
try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to the database pool');
    connection.release();
} catch (error) {
    console.error('❌ Database connection failed:', error.message);
}

export default pool;