"use server";

import exp from "constants";

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


// export async function get_regions() {
//     let res;
//     let client;
//     try {
//         client = await pool.connect();
//         await client.query('SET search_path TO kaiden');
//         res = await client.query(`SELECT * FROM region LEFT JOIN unfinished_region ON
//                                     region.id = unfinished_region.id LEFT JOIN 
//                                     region_has_corner ON region.id = region_has_corner.region_id ORDER BY region_has_corner.position ASC;`);
//     } catch (error) {
//         console.error('Error fetching regions:', error);
//         throw error; // Rethrow the error to be handled by the caller
//     } finally {
//         if (client) {
//             client.release(); // Release the client back to the pool
//         }
//     }

//     return res.rows;
// }


export async function get_region_corners(region_id: number) {
    let res;
    let client;
    try {
        client = await pool.connect();
        await client.query('SET search_path TO kaiden');
        res = await client.query(`SELECT cornerx, cornery FROM region_has_corner WHERE region_id = $1 ORDER BY position ASC;`, [region_id]);
    } catch (error) {
        console.error('Error fetching region corners:', error);
        throw error; // Rethrow the error to be handled by the caller
    } finally {
        if (client) {
            client.release(); // Release the client back to the pool
        }
    }

    return res.rows;
}



export async function getRegionsWithCorners() {
    let client;
    try {
        client = await pool.connect();
        await client.query('SET search_path TO kaiden');

        const query = ` SELECT 
                            region.id AS region_id, 
                            region.color AS region_color, 
                            JSON_AGG((cornerx, cornery) ORDER BY position) AS corners
                        FROM 
                            region
                        JOIN 
                            region_has_corner ON region.id = region_has_corner.region_id
                        GROUP BY 
                            region.id, region.color
                        ORDER BY 
                            region.id;`;
        
        const result = await client.query(query);
        return result.rows;
    } catch (error) {
        console.error('Error fetching regions with corners:', error);
        throw error; // Rethrow the error to be handled by the caller
    } finally {
        if (client) {
            client.release(); // Release the client back to the pool
        }
    }
}


export async function getCoversFromRegionWithCorners (region_id:number) {
    let client;
    try {
        client = await pool.connect();
        await client.query('SET search_path TO kaiden');
        const query = `SELECT 
                            covers.id AS cover_id, 
                            covers.points AS cover_points, 
                            JSON_AGG((cornerx, cornery) ORDER BY position) AS corners
                        FROM 
                            covers
                        JOIN 
                            has_corner ON covers.id = has_corner.cover_id
                        JOIN 
                            cover_in_region ON covers.id = cover_in_region.cover_id
                        WHERE 
                            cover_in_region.region_id = $1
                        GROUP BY 
                            covers.id, covers.points
                        ORDER BY 
                            covers.id;`;
        
        const result = await client.query(query, [region_id]);
        return result.rows;
    } catch (error) {
        console.error('Error fetching covers from region with corners:', error);
        throw error; // Rethrow the error to be handled by the caller
    } finally {
        if (client) {
            client.release(); // Release the client back to the pool
        }
    }

}

export async function getCoversWithCorners () {
    let client;
    try {
        client = await pool.connect();
        await client.query('SET search_path TO kaiden');
        const query = `SELECT 
                            covers.id AS cover_id, 
                            covers.points AS cover_points, 
                            JSON_AGG((cornerx, cornery) ORDER BY position) AS corners
                        FROM 
                            covers
                        JOIN 
                            has_corner ON covers.id = has_corner.cover_id
                        GROUP BY 
                            covers.id, covers.points
                        ORDER BY 
                            covers.id;`;
        
        const result = await client.query(query);
        return result.rows;
    } catch (error) {
        console.error('Error fetching covers with corners:', error);
        throw error; // Rethrow the error to be handled by the caller
    } finally {
        if (client) {
            client.release(); // Release the client back to the pool
        }
    }

}