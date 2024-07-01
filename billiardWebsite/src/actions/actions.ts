
"use server";
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');
import { cookies, headers } from 'next/headers';



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
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error; // Rethrow the error to be handled by the caller
    } finally {
        if (client) {
            client.release(); // Release the client back to the pool
        }
    }
}


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

export async function getCoversWithCorners () {
    let client;
    try {
        client = await pool.connect();
        await client.query('SET search_path TO kaiden');
        const query =  `SELECT 
                            covers.id AS cover_id, 
                            covers.points AS cover_points, 
                            JSON_AGG((cornerx, cornery) ORDER BY position) AS corners,
                            EXISTS (SELECT 1 FROM user_claimed_cover WHERE cover_id = covers.id) AS claimed,
                            EXISTS (SELECT 1 FROM user_completed_cover WHERE cover_id = covers.id) AS completed,
                            claimant.username,
                            claimant.info,
                            claimant.logo
                        FROM 
                            covers
                        JOIN 
                            has_corner ON covers.id = has_corner.cover_id
                        LEFT JOIN 
                            (SELECT cover_id, username, info, logo 
                            FROM user_completed_cover
                            JOIN users ON user_completed_cover.user_id = users.id) AS claimant
                        ON 
                            covers.id = claimant.cover_id
                        GROUP BY 
                            covers.id, covers.points, claimant.username, claimant.info, claimant.logo
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

export async function setLogoForUser(user_id: string, logo: string) {
    let client;
    //validate session cookie
    if (!await validateSessionCookie(user_id)) {
        return false;
    }
    try {
        client = await pool.connect();
        await client.query('SET search_path TO kaiden');

        const query = `UPDATE users SET logo = $1 WHERE id = $2;`;
        await client.query(query, [logo, user_id]);
    } catch (error) {
        console.error('Error setting logo for user:', error);
    } finally {
        if (client) {
            client.release(); // Release the client back to the pool
        }
    }
}


export async function addUser(username: string, info:string, password: string) {
    let client;
    try {
        client = await pool.connect();
        await client.query('SET search_path TO kaiden');

        // Hash the password
        const hashedPassword = await hashPassword(password);

        // Insert the user into the database
        const query = `INSERT INTO users (username, info, password) VALUES ($1, $2, $3);`;
        await client.query(query, [username, info, hashedPassword]);

        console.log('User added successfully');
    } catch (error) {
        console.error('Error adding user:', error);
        throw error; // Rethrow the error to be handled by the caller
    } finally {
        if (client) {
            client.release(); // Release the client back to the pool
        }
    }
}

export async function getUser(username: string) {
    let client;
    try {
        client = await pool.connect();
        await client.query('SET search_path TO kaiden');

        const query = `SELECT * FROM users WHERE username = $1;`;
        const res = await client.query(query, [username]);

        if (res.rowCount === 0) {
            return null;
        }

        return res.rows[0];
    } catch (error) {
        console.error('Error getting user:', error);
        throw error; // Rethrow the error to be handled by the caller
    } finally {
        if (client) {
            client.release(); // Release the client back to the pool
        }
    }
}

async function hashPassword(password: string): Promise<string> {
    // Use a secure hashing algorithm, such as bcrypt, to hash the password
    // Here's an example using bcryptjs library
    const saltRounds = 10; // Number of salt rounds to use for hashing

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
}

export async function checkIfUserExists(username: string): Promise<boolean> {
    let client;
    try {
        client = await pool.connect();
        await client.query('SET search_path TO kaiden');

        const query = `SELECT * FROM users WHERE username = $1;`;
        const res = await client.query(query, [username]);

        if (res.rowCount === 0) {
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error checking if user exists:', error);
    } finally {
        if (client) {
            client.release(); // Release the client back to the pool
        }
    }
    return false;
}


export async function loginUser(username: string, password: string): Promise<boolean> {
    let client;
    try {
        client = await pool.connect();
        await client.query('SET search_path TO kaiden');

        const query = `SELECT * FROM users WHERE username = $1;`;
        const res = await client.query(query, [username]);

        if (res.rowCount === 0) {
            return false;
        }

        const user = res.rows[0];
        const hashedPassword = user.password;

        // Compare the hashed password with the provided password
        const isPasswordCorrect = await bcrypt.compare(password, hashedPassword);

        if (isPasswordCorrect) {
            // Generate a session token
            const sessionToken = generateSessionToken();

            // Store the session token in the database
            const deleteQuery = `DELETE FROM sessions WHERE user_id = $1;`;
            await client.query(deleteQuery, [user.id]);
            const insertQuery = `INSERT INTO sessions (user_id, session_id, ip_address, login_date) VALUES ($1, $2, $3, NOW());`;
            await client.query(insertQuery, [user.id, sessionToken, IP()]);
            console.log('User logged in successfully');

            //set the cookie to expire in 1 day
            cookies().set('session_token', sessionToken, { httpOnly: true, secure: true, expires: new Date(Date.now() + 86400000) });

            return true;
        }

        return false;
    } catch (error) {
        console.error('Error logging in user:', error);
        throw error; // Rethrow the error to be handled by the caller
    } finally {
        if (client) {
            client.release(); // Release the client back to the pool
        }
    }
}

function generateSessionToken(): string {
    // Generate a random session token using a secure algorithm
    // Here's an example using the uuid library
    const sessionToken = uuid.v4();
    return sessionToken;
}


//User claiming a cover. A user cannot claim more than 3 covers total. Must use session cookie to validate user
export async function claimCover(cover_id: number, user_id:string) {
    if (!await validateSessionCookie(user_id)) {
        return false;
    }
    let client;
    try {
        client = await pool.connect();
        await client.query('SET search_path TO kaiden');

        // Check if the user has already claimed a covers
        const coversQuery = `SELECT * FROM user_claimed_cover WHERE user_id = $1;`;
        const coversRes = await client.query(coversQuery, [user_id]);

        if (coversRes.rowCount >= 1) {
            return false;
        }

        // Insert the user claimed cover into the database
        const insertQuery = `INSERT INTO user_claimed_cover (user_id, cover_id) VALUES ($1, $2);`;
        await client.query(insertQuery, [user_id, cover_id]);

        return true;
    } catch (error) {
        console.error('Error claiming cover:', error);
        throw error; // Rethrow the error to be handled by the caller
    } finally {
        if (client) {
            client.release(); // Release the client back to the pool
        }
    }
}


async function validateSessionCookie(user_id: string) {
    let client;
    try {
        client = await pool.connect();
        await client.query('SET search_path TO kaiden');

        const cookieStore = cookies();
        const session_cookie = cookieStore.get('session_token');
        if (!session_cookie || session_cookie === undefined || session_cookie === null) {
            console.log('No session cookie found');
            return false;
        }
        const ip = IP();


        const query = `SELECT * FROM sessions WHERE user_id = $1 AND session_id = $2;`;
        const res = await client.query(query, [user_id, session_cookie.value]);

        if (res.rowCount === 0) {
            return false;
        }

        const session = res.rows[0];
        if (session.ip_address !== ip) {
            return false;
        }
        //make sure session is not expired
        const login_date = session.login_date;
        //get both current date and time,
        const currentDate = new Date();
        //get the expiration date and time
        const sessionExpiration = new Date(login_date);
        //add 1 day to the expiration date
        sessionExpiration.setDate(sessionExpiration.getDate() + 1);
        if (currentDate > sessionExpiration) {
            //delete the session from the sessions table
            const deleteQuery = `DELETE FROM sessions WHERE user_id = $1 AND session_id = $2;`;
            await client.query(deleteQuery, [user_id, session_cookie]);
            return false;
        }

        

        return true;
    } catch (error) {
        console.error('Error validating session cookie:', error);
        return false;
    } finally {
        if (client) {
            client.release(); // Release the client back to the pool
        }
    }
}

function IP() {
    const FALLBACK_IP_ADDRESS = '0.0.0.0'
    const forwardedFor = headers().get('x-forwarded-for')
   
    if (forwardedFor) {
      return forwardedFor.split(',')[0] ?? FALLBACK_IP_ADDRESS
    }
   
    return headers().get('x-real-ip') ?? FALLBACK_IP_ADDRESS
}

export async function getUsernameFromId(user_id: string) {
    let client;
    try {
        client = await pool.connect();
        await client.query('SET search_path TO kaiden');

        const query = `SELECT username FROM users WHERE id = $1;`;
        const res = await client.query(query, [user_id]);

        if (res.rowCount === 0) {
            return null;
        }

        return res.rows[0].username;
    } catch (error) {
        console.error('Error getting username from id:', error);
        throw error; // Rethrow the error to be handled by the caller
    } finally {
        if (client) {
            client.release(); // Release the client back to the pool
        }
    }
}

export async function hasClaimant(cover_id: number) {
    let client;
    try {
        client = await pool.connect();
        await client.query('SET search_path TO kaiden');

        const query = `SELECT * FROM user_claimed_cover WHERE cover_id = $1;`;
        const res = await client.query(query, [cover_id]);

        if (res.rowCount === 0) {
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error getting claimant:', error);
        return false;
    } finally {
        if (client) {
            client.release(); // Release the client back to the pool
        }
    }
}

export async function isComplete(cover_id: number) {
    let client;
    try {
        client = await pool.connect();
        await client.query('SET search_path TO kaiden');

        const query = `SELECT * FROM user_completed_cover WHERE cover_id = $1;`;
        const res = await client.query(query, [cover_id]);

        if (res.rowCount === 0) {
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error getting claimant:', error);
        return false;
    } finally {
        if (client) {
            client.release(); // Release the client back to the pool
        }
    }
}

export async function completeCoverRequest(cover_id: number, user_id: string) {
    if (!await validateSessionCookie(user_id)) {
        return false;
    }
    let client;
    try {
        client = await pool.connect();
        await client.query('SET search_path TO kaiden');

        // Check if the user has already completed the cover
        const completedCoverQuery = `SELECT * FROM user_completed_cover WHERE cover_id = $2;`;
        const completedCoverRes = await client.query(completedCoverQuery, [user_id, cover_id]);

        if (completedCoverRes.rowCount >= 1) {
            return false;
        }

        // Insert the user completed cover into the database
        const insertQuery = `INSERT INTO user_completed_cover (user_id, cover_id) VALUES ($1, $2);`;
        await client.query(insertQuery, [user_id, cover_id]);

        return true;
    } catch (error) {
        console.error('Error completing cover:', error);
        throw error; // Rethrow the error to be handled by the caller
    } finally {
        if (client) {
            client.release(); // Release the client back to the pool
        }
    }
}

export async function deleteAllSessionsForUser(user_id: string) {
    let client;
    try {
        client = await pool.connect();
        await client.query('SET search_path TO kaiden');

        const query = `DELETE FROM sessions WHERE user_id = $1;`;
        await client.query(query, [user_id]);
    } catch (error) {
        console.error('Error deleting all sessions for user:', error);
    } finally {
        if (client) {
            client.release(); // Release the client back to the pool
        }
    }
}

export async function getClaimedCoversForUser(user_id: string) {
    let client;
    try {
        client = await pool.connect();
        await client.query('SET search_path TO kaiden');

        const query = ` SELECT c.points, JSON_AGG((cornerx, cornery) ORDER BY position) AS corners 
                        FROM covers c
                        JOIN has_corner hc ON c.id = hc.cover_id
                        JOIN user_claimed_cover ucc ON c.id = ucc.cover_id
                        WHERE ucc.user_id = $1
                        GROUP BY c.id;`;
        const res = await client.query(query, [user_id]);

        return res.rows;
    } catch (error) {
        console.error('Error getting claimed covers for user:', error);
        return [];
    } finally {
        if (client) {
            client.release(); // Release the client back to the pool
        }
    }
}

export async function getLeaderboard() {
    let client;
    try {
        client = await pool.connect();
        await client.query('SET search_path TO kaiden');

        const query = `SELECT username, info as name, SUM(points) AS total_points
                        FROM users
                        JOIN user_completed_cover ON users.id = user_completed_cover.user_id
                        JOIN covers ON user_completed_cover.cover_id = covers.id
                        GROUP BY username, name
                        ORDER BY total_points DESC;`;
        const res = await client.query(query);
        return res.rows;
    } catch (error) {
        console.error('Error getting leaderboard:', error);
        return [];
    } finally {
        if (client) {
            client.release(); // Release the client back to the pool
        }
    }
}

export async function getMostRecentCompletionData() {
    let client;
    try {
        client = await pool.connect();
        await client.query('SET search_path TO kaiden');

        const query = `SELECT username, info as name, completion_date as date
                        FROM users
                        JOIN user_completed_cover ON users.id = user_completed_cover.user_id
                        ORDER BY completion_date DESC`;
        const res = await client.query(query);
        return res.rows;
    } catch (error) {
        console.error('Error getting most recent completion data:', error);
        return null;
    } finally {
        if (client) {
            client.release(); // Release the client back to the pool
        }
    }
}

export async function getCompletedCoversForUser(user_id: string) {
    let client;
    try {
        client = await pool.connect();
        await client.query('SET search_path TO kaiden');

        const query = ` SELECT completion_date, c.points, JSON_AGG((cornerx, cornery) ORDER BY position) AS corners 
                        FROM covers c
                        JOIN has_corner hc ON c.id = hc.cover_id
                        JOIN user_completed_cover ucc ON c.id = ucc.cover_id
                        WHERE ucc.user_id = $1
                        GROUP BY c.id, completion_date, c.points
                        ORDER BY completion_date DESC;`;
        const res = await client.query(query, [user_id]);
        return res.rows;
    } catch (error) {
        console.error('Error getting completed covers for user:', error);
        return [];
    } finally {
        if (client) {
            client.release(); // Release the client back to the pool
        }
    }
}

export async function getUserPoints(user_id: string) {
    let client;
    try {
        client = await pool.connect();
        await client.query('SET search_path TO kaiden');

        const query = `SELECT SUM(points) AS total_points
                        FROM user_completed_cover
                        JOIN covers ON user_completed_cover.cover_id = covers.id
                        WHERE user_id = $1;`;
        const res = await client.query(query, [user_id]);

        if (res.rowCount === 0) {
            return 0;
        }

        return res.rows[0].total_points;
    } catch (error) {
        console.error('Error getting user points:', error);
        return 0;
    } finally {
        if (client) {
            client.release(); // Release the client back to the pool
        }
    }
}

export async function getAllClaimants(cover_id: number) {
    let client;
    try {
        client = await pool.connect();
        await client.query('SET search_path TO kaiden');

        const query = `SELECT username, info as name
                        FROM users
                        JOIN user_claimed_cover ON users.id = user_claimed_cover.user_id
                        WHERE cover_id = $1;`;
        const res = await client.query(query, [cover_id]);
        return res.rows;
    } catch (error) {
        console.error('Error getting claimants:', error);
        return [];
    } finally {
        if (client) {
            client.release(); // Release the client back to the pool
        }
    }
}

export async function updateInfoForUser(user_id: string, info: string) {
    if (!await validateSessionCookie(user_id)) {
        return false;
    }
    let client;
    try {
        client = await pool.connect();
        await client.query('SET search_path TO kaiden');

        const query = `UPDATE users SET info = $1 WHERE id = $2;`;
        await client.query(query, [info, user_id]);
    } catch (error) {
        console.error('Error updating info for user:', error);
        return false;
    } finally {
        if (client) {
            client.release(); // Release the client back to the pool
        }
    }
}

export async function getLogoForUser(user_id: string) {
    let client;
    try {
        client = await pool.connect();
        await client.query('SET search_path TO kaiden');

        const query = `SELECT logo FROM users WHERE id = $1;`;
        const res = await client.query(query, [user_id]);

        if (res.rowCount === 0) {
            return null;
        }

        return res.rows[0].logo;
    } catch (error) {
        console.error('Error getting logo for user:', error);
        return null;
    } finally {
        if (client) {
            client.release(); // Release the client back to the pool
        }
    }
}

export async function getInfoForUser(user_id: string) {
    let client;
    try {
        client = await pool.connect();
        await client.query('SET search_path TO kaiden');

        const query = `SELECT info FROM users WHERE id = $1;`;
        const res = await client.query(query, [user_id]);

        if (res.rowCount === 0) {
            return null;
        }

        return res.rows[0].info;
    } catch (error) {
        console.error('Error getting info for user:', error);
        return null;
    } finally {
        if (client) {
            client.release(); // Release the client back to the pool
        }
    }
}