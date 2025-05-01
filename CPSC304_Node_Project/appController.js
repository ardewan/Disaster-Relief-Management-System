const express = require('express');
const appService = require('./appService');

const router = express.Router();

// ----------------------------------------------------------
// API endpoints
// Modify or extend these routes based on your project's needs.
router.get('/check-db-connection', async (req, res) => {
    const isConnect = await appService.testOracleConnection();
    if (isConnect) {
        res.send('connected');
    } else {
        res.send('unable to connect');
    }
});

router.get('/donationtable', async (req, res) => {
    const tableContent = await appService.fetchDonationtableFromDb();
    res.json({data: tableContent});
});

router.get('/donationtypetable', async (req, res) => {
    const tableContent = await appService.fetchDonationTypetableFromDb();
    res.json({data: tableContent});
});

router.get('/donationtypetable-selection', async (req, res) => {
    let conditions = [];
    let values = [];

    let idx = 0;
    while (req.query[`column${idx}`] && req.query[`value${idx}`]) {
        let attribute = req.query[`column${idx}`];
        let value = req.query[`value${idx}`];
        let operator = req.query[`operator${idx}`];

        conditions.push(`${attribute} = :value${idx}`);
        values.push(value);

        if (operator) {
            conditions.push(operator)
        }
        idx++;
    }


    const whereClause = conditions.join(' ');

    const tableContent = await appService.selectionDonationtableFromDb(whereClause, values);
    res.json({data: tableContent});
});

// i dont think this is even used
// router.post("/initiate-demotable", async (req, res) => {
//     const initiateResult = await appService.initiateDemotable();
//     if (initiateResult) {
//         res.json({ success: true });
//     } else {
//         res.status(500).json({ success: false });
//     }
// });

router.post("/insert-donationtable", async (req, res) => {
    const { id, type, quantity, date } = req.body;
    const insertResult = await appService.insertDonationTable(id, type, quantity, date);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/delete-donationtypetable", async (req, res) => {
    const { type, date } = req.body;
    console.log("Heres type and date", type, date)
    const insertResult = await appService.deleteFromDonationTypeTable(type, date);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/update-name-demotable", async (req, res) => {
    const { oldName, newName } = req.body;
    const updateResult = await appService.updateNameDemotable(oldName, newName);
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.get('/count-demotable', async (req, res) => {
    const tableCount = await appService.countDemotable();
    if (tableCount >= 0) {
        res.json({ 
            success: true,  
            count: tableCount
        });
    } else {
        res.status(500).json({ 
            success: false, 
            count: tableCount
        });
    }
});


// Manan's functions
router.get('/workers', async (req, res) => {
    try {
        const workers = await appService.fetchAllWorkers();
        res.json({ success: true, data: workers });
    } catch (error) {
        console.error('Error', error);
        res.status(500).json({ success: false, message: "Failed to fetch workers" });
    }
});

router.post('/check-phone-unique', async (req, res) => {
    const { phoneNumber, workerId } = req.body;
    
    try {
        const isUnique = await appService.isPhoneNumberUnique(phoneNumber, workerId);
        res.json({ success: true, isUnique });
    } catch (error) {
        console.error('Error checking phone uniqueness:', error);
        res.status(500).json({ success: false, message: "Failed to verify phone uniqueness" });
    }
});

router.post('/update-worker', async (req, res) => {
    const { workerId, name, phoneNumber, postalCode } = req.body;
    try {
        const isUnique = await appService.isPhoneNumberUnique(phoneNumber, workerId);
        if (!isUnique) {
            return res.json({ 
                success: false, 
                message: "Phone number already exists for another worker" 
            });
        }

        //const updates = { name, phoneNumber, postalCode };
        const updateSuccess = await appService.updateWorker(workerId, name, phoneNumber, postalCode);
        
        if (updateSuccess) {
            res.json({ success: true });
        } else {
            res.status(500).json({ success: false });
        }
        
    } catch (error) {
        console.error('Error updating worker:', error);
        res.status(500).json({ 
            success: false, 
            message: "An error occurred while updating the worker" 
        });
    }
});

router.post('/disasters/projection', async (req, res) => {
    const { selectedColumns } = req.body;

    if (!selectedColumns || selectedColumns.length === 0) {
        return res.status(400).json({ error: "No columns selected" });
    }

    const disasters = await appService.fetchProjectedDisasters(selectedColumns);
    res.json({ data: disasters });
});

router.post('/relief-centers', async (req, res) => {
    try {
        const { capacityThreshold } = req.body;
        
        if (!capacityThreshold || isNaN(capacityThreshold)) {
            return res.status(400).json({
                success: false,
                message: "Invalid capacity threshold value"
            });
        }
        
        const centers = await appService.fetchReliefCentersAboveCapacity(capacityThreshold);
        res.json({ success: true, data: centers });
    } catch (error) {
        console.error('Error fetching relief centers:', error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch relief centers" 
        });
    }
});

router.get('/disasters/count-by-type', async (req, res) => {
    try {
        const disasterCounts = await appService.countDisastersByType();
        res.json({ 
            success: true, 
            data: disasterCounts 
        });
    } catch (error) {
        console.error('Error fetching disaster counts:', error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch disaster counts" 
        });
    }
});


router.post('/donations/count-above-threshold', async (req, res) => {
    try {
        const { threshold } = req.body;
        
        if (!threshold || isNaN(threshold) || threshold < 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid threshold value"
            });
        }
        
        const donationCounts = await appService.countDonationTypesAboveThreshold(threshold);
        res.json({ 
            success: true, 
            data: donationCounts 
        });
    } catch (error) {
        console.error('Error fetching donation counts:', error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch donation counts" 
        });
    }
});

router.get('/donations/top-by-donor', async (req, res) => {
    try {
        const topDonations = await appService.findTopDonationsByDonor();
        res.json({ 
            success: true, 
            data: topDonations 
        });
    } catch (error) {
        console.error('Error fetching top donations:', error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch top donations" 
        });
    }
});


router.get('/donors/all-types', async (req, res) => {
    try {
        const donors = await appService.findDonorsWithAllTypes();
        res.json({ success: true, data: donors });
    } catch (error) {
        console.error('Error fetching donors with all types:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch donors with all types' });
    }
});


module.exports = router;