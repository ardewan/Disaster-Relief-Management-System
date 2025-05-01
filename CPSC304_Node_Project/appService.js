const oracledb = require('oracledb');
const loadEnvFile = require('./utils/envUtil');

const envVariables = loadEnvFile('./.env');

// Database configuration setup. Ensure your .env file has the required database credentials.
const dbConfig = {
    user: envVariables.ORACLE_USER,
    password: envVariables.ORACLE_PASS,
    connectString: `${envVariables.ORACLE_HOST}:${envVariables.ORACLE_PORT}/${envVariables.ORACLE_DBNAME}`,
    poolMin: 1,
    poolMax: 3,
    poolIncrement: 1,
    poolTimeout: 60
};

// initialize connection pool
async function initializeConnectionPool() {
    try {
        await oracledb.createPool(dbConfig);
        console.log('Connection pool started');
    } catch (err) {
        console.error('Initialization error: ' + err.message);
    }
}

async function closePoolAndExit() {
    console.log('\nTerminating');
    try {
        await oracledb.getPool().close(10); // 10 seconds grace period for connections to finish
        console.log('Pool closed');
        process.exit(0);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

initializeConnectionPool();

process
    .once('SIGTERM', closePoolAndExit)
    .once('SIGINT', closePoolAndExit);


// ----------------------------------------------------------
// Wrapper to manage OracleDB actions, simplifying connection handling.
async function withOracleDB(action) {
    let connection;
    try {
        connection = await oracledb.getConnection(); // Gets a connection from the default pool 
        return await action(connection);
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}


// ----------------------------------------------------------
// Core functions for database operations
// Modify these functions, especially the SQL queries, based on your project's requirements and design.
async function testOracleConnection() {
    return await withOracleDB(async (connection) => {
        return true;
    }).catch(() => {
        return false;
    });
}

async function fetchDonationtableFromDb() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM Donation');
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function fetchDonationTypetableFromDb() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM DonationType');
        return result.rows;
    }).catch(() => {
        return [];
    });
}

// async function initiateDemotable() {
//     return await withOracleDB(async (connection) => {
//         try {
//             await connection.execute(`DROP TABLE DonationTable`);
//             await connection.execute(`DROP TABLE DonationType`);
//         } catch(err) {
//             console.log('Table might not exist, proceeding to create...');
//         }

//         await connection.execute(`
//             CREATE TABLE DonationType (
//                 type VARCHAR(255),
//                 date_received DATE,
//                 expiry_date DATE,
//                 PRIMARY KEY (type, date_received)
//             )
//         `);

//         await connection.execute(`
//             CREATE TABLE DonationTable (
//                 donation_id INTEGER PRIMARY KEY,
//                 type VARCHAR(255),
//                 quantity INTEGER,
//                 date_received DATE,
//                 FOREIGN KEY (type, date_received) REFERENCES DonationType(type, date_received) ON DELETE SET NULL
//             )
//         `);

//         return true;
//     }).catch(() => {
//         return false;
//     });
// }

async function insertDonationTable(id, type, quantity, date) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO Donation (donation_id, type, quantity, date_received) VALUES (:donation_id, :type, :quantity, :date_received)`,
            [id, type, quantity, date],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function updateNameDemotable(oldName, newName) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `UPDATE DEMOTABLE SET name=:newName where name=:oldName`,
            [newName, oldName],
            { autoCommit: true }
        );

        return true;
    }).catch(() => {
        return false;
    });
}

async function deleteFromDonationTypeTable(type, date) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `DELETE FROM DonationType WHERE type = :type AND date_received = :date_received`,
            [type, date],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function selectionDonationtableFromDb(whereClause, values) {
    return await withOracleDB(async (connection) => {
        const query = `SELECT * FROM Donation ${whereClause ? `WHERE ${whereClause}` : ''}`

        const result = await connection.execute(
            query,
            values,
            { autoCommit: true }
        );

        console.log(result.rows)

        return result.rows;
    }).catch(() => {
        return false;
    });
}

async function countDemotable() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT Count(*) FROM DEMOTABLE');
        return result.rows[0][0];
    }).catch(() => {
        return -1;
    });
}

// Manan's function

async function fetchAllWorkers() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM Worker');
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function isPhoneNumberUnique(phoneNumber, workerId) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT COUNT(*) FROM Worker 
             WHERE phoneNumber = :phoneNumber 
             AND worker_id <> :workerId`,
            [phoneNumber, workerId]
        );
        
        return result.rows[0][0] === 0;
    }).catch((err) => {
        console.error("Error checking phone number uniqueness:", err);
        return false;
    });
}

async function updateWorker(workerId, name, phoneNumber, postalCode) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `UPDATE Worker 
             SET name = :name, 
                 phoneNumber = :phoneNumber, 
                 postal_code = :postalCode
             WHERE worker_id = :workerId`,
            [name, phoneNumber, postalCode, workerId],
            { autoCommit: true }
        );
        // let updateQueries = [];
        // let updateValues = {};

        // for (const [key, value] of Object.entries(updates)) {
        //     updateQueries.push(`${key} = :${key}`);
        //     updateValues[key] = value;
        // }

        // for (const [key, value] of Object.entries(updates)) {
        //     if (value !== undefined && value !== null && value !== '') {
        //         updateQueries.push(`${key} = :${key}`);
        //         updateValues[key] = value;
        //     }
        // }

        // if (updateQueries.length === 0) {
        //     return false;
        // }

        // updateValues.workerId = workerId; 

        // const sqlQuery = `UPDATE Worker SET ${updateQueries.join(", ")} WHERE worker_id = :workerId`;
        // console.log("Executing SQL:", sqlQuery);
        // console.log("Values:", updateValues);

        // const result = await connection.execute(sqlQuery, updateValues, { autoCommit: true });

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch((error) => {
        console.error("Error updating worker:", error);
        return false;
    });
}

async function fetchProjectedDisasters(selectedColumns) {
    if (!selectedColumns.length) {
        return [];
    }

    return await withOracleDB(async (connection) => {
        const sqlQuery = `SELECT ${selectedColumns.join(", ")} FROM Disaster`;
        const result = await connection.execute(sqlQuery);
        
        return result.rows.map(row => {
            const rowObject = {};
            selectedColumns.forEach((column, index) => {
                rowObject[column] = row[index];
            });
            return rowObject;
        });
    }).catch((error) => {
        console.error("Error in projection:", error);
        return [];
    });
}

async function fetchReliefCentersAboveCapacity(capacityThreshold) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT rc.name, rc.location, cc.capacity
             FROM ReliefCenter rc, CenterCapacity cc
             WHERE rc.name = cc.name 
             AND rc.location = cc.location 
             AND cc.capacity > :threshold`,
            [capacityThreshold]
        );
        return result.rows;
    }).catch((error) => {
        console.error("Error fetching relief centers:", error);
        return [];
    });
}

async function countDisastersByType() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT type, COUNT(*) as count 
             FROM Disaster 
             GROUP BY type`
        );
        return result.rows;
    }).catch((err) => {
        console.error('Error counting disasters by type:', err);
        return [];
    });
}

async function countDonationTypesAboveThreshold(threshold) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT type, COUNT(*) as count 
             FROM Donation
             GROUP BY type 
             HAVING COUNT(*) > :threshold`,
            [threshold]
        );
        return result.rows;
    }).catch((err) => {
        console.error('Error counting donation types above threshold:', err);
        return [];
    });
}

async function findTopDonationsByDonor() {
    return await withOracleDB(async (connection) => {
        
        const result = await connection.execute(
            `SELECT d.type, AVG(d.quantity) as avg_quantity
            FROM Donation d
            GROUP BY d.type
            HAVING AVG(d.quantity) > (SELECT AVG(quantity) FROM Donation)`
        );
        return result.rows;
    }).catch((err) => {
        console.error('Error finding top donations by donor:', err);
        return [];
    });
}

async function findDonorsWithAllTypes() {
    return await withOracleDB(async (connection) => {
        
        const result = await connection.execute(
            `SELECT D.donor_id, D.name
            FROM Donor D
            WHERE NOT EXISTS (
                SELECT 1
                FROM DonationType DT
                WHERE NOT EXISTS (
                    SELECT 1
                    FROM Make M
                    JOIN Donation Don ON M.donation_id = Don.donation_id
                    WHERE M.donor_id = D.donor_id
                      AND Don.type = DT.type
                )
            )`
        );
        return result.rows;
    }).catch((err) => {
        console.error('Error finding donors with all types:', err);
        return [];
    });
}

module.exports = {
    testOracleConnection,
    fetchDonationtableFromDb,
    fetchDonationTypetableFromDb,
    // initiateDemotable, 
    insertDonationTable, 
    updateNameDemotable, 
    countDemotable,
    deleteFromDonationTypeTable,
    selectionDonationtableFromDb,
    fetchAllWorkers,
    isPhoneNumberUnique,
    updateWorker,
    fetchProjectedDisasters,
    fetchReliefCentersAboveCapacity,
    countDisastersByType,
    countDonationTypesAboveThreshold,
    findTopDonationsByDonor,
    findDonorsWithAllTypes,
};