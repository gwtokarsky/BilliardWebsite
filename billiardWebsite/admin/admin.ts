//import { Decimal } from 'decimal.js';


const { Pool } = require('pg');
require('dotenv').config();
//get turf.js
const turf = require('@turf/turf');
var readline = require('readline');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});


async function main() {
    console.log(pool);

    let client;
    try {
        client = await pool.connect();
        await client.query('SET search_path TO kaiden');
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

    //get input from user
    let input = readline.createInterface({  
        input: process.stdin,  
        output: process.stdout  
    });

    while (input != 'q') {
        switch (input) {
            // case 'c':
            //     const corners = process.argv.slice(3, 7);
            //     createCover(corners, points);
            //     break;
            case 'r':
                let rInput = prompt("Enter the points of the region:") || "";
                let rCornersString = rInput.split(" ");
                try{
                    //make 2d array of corners
                    let rCorners = [];
                    for (let i = 0; i < rCornersString.length; i+=2) {
                        rCorners.push([parseInt(rCornersString[i]), parseInt(rCornersString[i+1])]);
                    }
                    rInput = prompt("Enter the number of points for each cover in the region:") || "";
                    let rPoints = parseInt(rInput);
                    createRegion(rCorners, rPoints, client);
                    break;
                } catch (error) {
                    if (error instanceof TypeError){
                        console.log("Invalid input");
                        break;
                    }
                }
            // case 'a':
            //     const regionId = process.argv[3];
            //     const coverId = process.argv[4];
            //     addCoverToRegion(regionId, coverId);
            //     break;
            // case 'e':
            //     const coverId = process.argv[3];
            //     const corners = process.argv.slice(4, 8);
            //     editCover(coverId, corners);
            //     break;
            // case 'g':
            //     const point = process.argv.slice(3, 5);
            //     getCoverInfoFromPoint(point);
            //     break;
            // case 'o':
            //     const coverId = process.argv[3];
            //     completeCover(coverId);
            //     break;
            case 'q':
                client.end();
                break;
            default:
                console.log("Invalid input");
                break;
        }
    }       
}

async function createRegion(corners:any, points:number, client:any) {
    try {
        let polygon = turf.polygon([corners]);
        const regionInsert = await client.query("INSERT INTO regions DEFAULT VALUES RETURNING id;");
        const regionId = regionInsert.rows[0].id;
        return regionId;
    } catch (error) {
        console.error('Error creating region:', error);
        throw error; // Rethrow the error to be handled by the caller
    } finally {
        if (client) {
            client.release(); // Release the client back to the pool
        }
    }
}

// Takes 4 corner in order top left, top right, bottom right, bottom left
// Inserts each of these into table has_corner with the position of the corner
// and the cover_id. Also takes a points value and inserts that into the covers table
async function createCover(corners:any, points:number, client:any) {
    try {
        const ids = client.query("SELECT id FROM regions;");
        for (let i = 0; i < ids.rows.length; i++) {
            const c = client.query("SELECT cornerx, cornery FROM region_has_corner WHERE region_id = $1 ORDER BY position;", [ids.rows[i].id]);
            console.log(c.rows);
        }
        // const coverInsert = await client.query("INSERT INTO covers (points) VALUES ($1) RETURNING id;", [points]);
        // const coverId = coverInsert.rows[0].id;
        // for (let i = 0; i < corners.length; i++) {
        //     const corner = corners[i];
        //     await client.query("INSERT INTO has_corner (cover_id, corner_number, pos) VALUES ($1, $2, $3);", [coverId, corner, i]);
        // }
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