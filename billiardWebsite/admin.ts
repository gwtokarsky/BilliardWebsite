import { Decimal } from 'decimal.js';


const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});


async function main() {

    let client;
    try {
        client = await pool.connect();
    } catch (error) {
        console.error('Error connecting to database:', error);
    } finally {
        if (client) {
            client.release(); // Release the client back to the pool
        }
    }


    console.log("c to create a new cover, r to create a new region, a to add a cover to a region,")
    console.log("e to edit a cover boundaries (used for partial cover completion),")
    console.log("g to get cover info from point, o to complete a cover, q to quit");
}

// Takes 4 corner in order top left, top right, bottom right, bottom left
// Inserts each of these into table has_corner with the position of the corner
// and the cover_id. Also takes a points value and inserts that into the covers table
async function createCover(corners:Array<Decimal>, points:number) {
    let client;
    try {
        client = await pool.connect();
        await client.query('SET search_path TO kaiden');
        const coverInsert = await client.query("INSERT INTO covers (points) VALUES ($1) RETURNING id;", [points]);
        const coverId = coverInsert.rows[0].id;
        for (let i = 0; i < corners.length; i++) {
            const corner = corners[i];
            await client.query("INSERT INTO has_corner (cover_id, corner_number, pos) VALUES ($1, $2, $3);", [coverId, corner, i]);
        }
    } catch (error) {
        console.error('Error creating cover:', error);
        throw error; // Rethrow the error to be handled by the caller
    } finally {
        if (client) {
            client.release(); // Release the client back to the pool
        }
    }
}

function getCoverInfoFromPoint() {

}

// Call the main function to execute the database connection setup
main();