"use server";
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

export async function getUsers() {
    let client;
    try {
        client = await pool.connect();
        await client.query('SET search_path TO kaiden');
        await client.query("INSERT INTO users (password, info, total_points) VALUES ('Alice', 'kaiden', 0);");
        const res = await client.query('SELECT * FROM users;');
        console.log(res.rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error; // Rethrow the error to be handled by the caller
    } finally {
        if (client) {
            client.release(); // Release the client back to the pool
        }
    }
}