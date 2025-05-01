/*
 * These functions below are for various webpage functionalities. 
 * Each function serves to process data on the frontend:
 *      - Before sending requests to the backend.
 *      - After receiving responses from the backend.
 * 
 * To tailor them to your specific needs,
 * adjust or expand these functions to match both your 
 *   backend endpoints 
 * and 
 *   HTML structure.
 * 
 */


// This function checks the database connection and updates its status on the frontend.
async function checkDbConnection() {
    const statusElem = document.getElementById('dbStatus');
    const loadingGifElem = document.getElementById('loadingGif');

    const response = await fetch('/check-db-connection', {
        method: "GET"
    });

    // Hide the loading GIF once the response is received.
    loadingGifElem.style.display = 'none';
    // Display the statusElem's text in the placeholder.
    statusElem.style.display = 'inline';

    response.text()
    .then((text) => {
        statusElem.textContent = text;
    })
    .catch((error) => {
        statusElem.textContent = 'connection timed out';  // Adjust error handling if required.
    });
}

// Fetches data from the demotable and displays it.
async function fetchAndDisplayUsers() {
    const tableElement = document.getElementById('donationTable');
    const tableBody = tableElement.querySelector('tbody');

    const tableElementType = document.getElementById('donationtypeTable');
    const tableBodyType = tableElementType.querySelector('tbody');

    const response = await fetch('/donationtable', {
        method: 'GET'
    });

    const responseType = await fetch('/donationtypetable', {
        method: 'GET'
    });

    const responseData = await response.json();
    const demotableContent = responseData.data;

    const responseTypeData = await responseType.json();
    const typetableContent = responseTypeData.data;


    // Always clear old, already fetched data before new fetching process.
    if (tableBody) {
        tableBody.innerHTML = '';
    }


    if (tableBodyType) {
        tableBodyType.innerHTML = '';
    }

    demotableContent.forEach(user => {
        const row = tableBody.insertRow();
        user.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });

    typetableContent.forEach(user => {
        const row = tableBodyType.insertRow();
        user.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });
}

async function fetchAndDisplayWorkers() {
    const tableElement = document.getElementById('workerTable');
    const tableBody = tableElement.querySelector('tbody');
    const selectElement = document.getElementById('workerSelect');
    
    const response = await fetch('/workers', {
        method: 'GET'
    });
    
    const responseData = await response.json();
    const workers = responseData.data;
    
    if (tableBody) {
        tableBody.innerHTML = '';
    }
    
    workers.forEach(worker => {
        const row = tableBody.insertRow();
        // worker_id, name, phoneNumber, postal_code
        worker.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
        
    });
}

async function checkPhoneUniqueness() {
    const phoneNumber = document.getElementById('phoneNumber').value;
    const workerId = document.getElementById('workerSelect').value;
    const phoneErrorElement = document.getElementById('phoneError');

    if (!phoneNumber) {
        phoneErrorElement.textContent = "empty phone num";
        return true;
    }
    
    const response = await fetch('/check-phone-unique', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            phoneNumber,
            workerId
        })
    });

    const responseData = await response.json();
    
    if (!responseData.isUnique) {
        phoneErrorElement.textContent = "This phone number is already in use";
        return false;
    } else {
        phoneErrorElement.textContent = "";
        return true;
    }
}

async function updateWorker(event) {
    event.preventDefault();
    const workerId = document.getElementById('workerSelect').value;
    const name = document.getElementById('workerName').value;
    const phoneNumber = document.getElementById('phoneNumber').value;
    const postalCode = document.getElementById('postalCode').value;
    const messageElement = document.getElementById('updateResultMsg');

    const isUnique = await checkPhoneUniqueness();
    if (!isUnique) {
        messageElement.textContent = "Given Phone Number already in use";
        messageElement.className = "error-message";
        return;
    }
    
    const response = await fetch('/update-worker', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            workerId,
            name,
            phoneNumber,
            postalCode
        })
    });
    
    const responseData = await response.json();
    
    if (responseData.success) {
        messageElement.textContent = "Worker updated successfully!";
        messageElement.className = "success-message";
        fetchTableData(); 
    } else {
        messageElement.textContent = responseData.message || "Error while updating worker";
        messageElement.className = "error-message";
    }
}

function setupProjectionForm() {
    const projectionForm = document.getElementById('projectionForm');
    const projectionButton = projectionForm.querySelector('button');
    
    projectionButton.addEventListener('click', fetchProjection);
}

async function fetchProjection() {    
    const selectedColumns = [];
    const checkboxes = document.querySelectorAll('input[name="columns"]:checked');
    
    checkboxes.forEach((checkbox) => {
        selectedColumns.push(checkbox.value);
    });
    
    if (selectedColumns.length === 0) {
        alert("Select at least one column.");
        return;
    }

    const response = await fetch('/disasters/projection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedColumns }),
    });

    const data = await response.json();

    if (data.data) {
        updateResultsTable(selectedColumns, data.data);
    }
}

function updateResultsTable(columns, rows) {
    //clearing
    const tableHeader = document.getElementById("tableHeader");
    const tableBody = document.getElementById("resultsTable").getElementsByTagName("tbody")[0];
    tableHeader.innerHTML = "";
    tableBody.innerHTML = "";

    columns.forEach((column) => {
        const th = document.createElement("th");
        th.textContent = column;
        tableHeader.appendChild(th);
    });

    rows.forEach((row) => {
        const tr = document.createElement("tr");
        columns.forEach((column) => {
            const td = document.createElement("td");
            td.textContent = row[column] || "N/A";
            tr.appendChild(td);
        });
        tableBody.appendChild(tr);
    });
}


async function fetchReliefCenters(event) {
    event.preventDefault();
    
    const capacityThreshold = document.getElementById('capacityThreshold').value;
    const tableElement = document.getElementById('reliefCenterTable');
    const tableBody = tableElement.querySelector('tbody');
    const messageElement = document.getElementById('reliefCenterResultMsg');
    
    tableBody.innerHTML = '';
    // messageElement.textContent = '';
    
    const response = await fetch('/relief-centers', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            capacityThreshold: capacityThreshold
        })
    });
    
    const responseData = await response.json();
    
    if (responseData.success) {
        const centers = responseData.data;
        
        if (centers.length === 0) {
            messageElement.textContent = "No relief centers found with capacity above " + capacityThreshold;
            return;
        }
        
        centers.forEach(center => {
            const row = tableBody.insertRow();
            // name, location, capacity
            center.forEach((field, index) => {
                const cell = row.insertCell(index);
                cell.textContent = field;
        });
        }); // ERROR HERE
    } else {
        messageElement.textContent = "Error fetching relief centers: " + (responseData.message || "Unknown error");
    }
}



// This function resets or initializes the demotable.
async function resetDemotable() {
    const response = await fetch("/initiate-demotable", {
        method: 'POST'
    });
    const responseData = await response.json();

    if (responseData.success) {
        const messageElement = document.getElementById('resetResultMsg');
        messageElement.textContent = "demotable initiated successfully!";
        fetchTableData();
    } else {
        alert("Error initiating table!");
    }
}


async function insertDonationtable(event) {
    event.preventDefault();

    const idValue = document.getElementById('insertId').value;
    const typeValue = document.getElementById('insertType').value;
    const quantityValue = document.getElementById('insertQuantity').value;
    const dateValue = document.getElementById('insertDate').value;

    const response = await fetch('/insert-donationtable', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: idValue,
            type: typeValue,
            quantity: quantityValue,
            date: dateValue
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('insertResultMsg');

    if (responseData.success) {
        messageElement.textContent = "Data inserted successfully!";
        fetchTableData();
    } else {
        messageElement.textContent = "Error inserting data!";
    }
}

// Inserts new records into the demotable.
async function deleteFromDonationTypeTable(event) {
    event.preventDefault();

    const typeValue = document.getElementById('deleteType').value;
    const dateValue = document.getElementById('deleteDate').value;

    const response = await fetch('/delete-donationtypetable', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            type: typeValue,
            date: dateValue
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('deleteResultMsg');

    if (responseData.success) {
        messageElement.textContent = "Data deleted successfully!";
        fetchTableData();
    } else {
        messageElement.textContent = "Error deleting data!";
    }
}

// Updates names in the demotable.
async function updateNameDemotable(event) {
    event.preventDefault();

    const oldNameValue = document.getElementById('updateOldName').value;
    const newNameValue = document.getElementById('updateNewName').value;

    const response = await fetch('/update-name-demotable', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            oldName: oldNameValue,
            newName: newNameValue
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('updateNameResultMsg');

    if (responseData.success) {
        messageElement.textContent = "Name updated successfully!";
        fetchTableData();
    } else {
        messageElement.textContent = "Error updating name!";
    }
}

// Counts rows in the demotable.
// Modify the function accordingly if using different aggregate functions or procedures.
async function countDemotable() {
    const response = await fetch("/count-demotable", {
        method: 'GET'
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('countResultMsg');

    if (responseData.success) {
        const tupleCount = responseData.count;
        messageElement.textContent = `The number of tuples in demotable: ${tupleCount}`;
    } else {
        alert("Error in count demotable!");
    }
}

// just to push
async function selectionDonationTable(event) {
    event.preventDefault();

    let queryParams = new URLSearchParams();


    document.querySelectorAll("#filterContainer .filter-row").forEach((row, index) => {
        let column = row.querySelector(".column")?.value;
        let value = row.querySelector(".value")?.value;
        let logicOperator = row.querySelector(".operator")?.value;
        console.log("index", index, column, value, logicOperator)

        queryParams.append(`column${index}`, column);
        queryParams.append(`value${index}`, value);
        if (index < document.querySelectorAll(".filter-row").length - 1) {
            queryParams.append(`operator${index}`, logicOperator);
        }
    });

    console.log(queryParams.toString());
    let url = `/donationtypetable-selection?${queryParams.toString()}`;
    console.log("this is the url", url)

    await fetch(url, {
        method: "GET"
    })
    .then((res => res.json()))
    .then((data) => {
        console.log(data)
        const tableBodyType = document.getElementById("donationtypeTableTwo").querySelector("tbody");

        if (tableBodyType) {
            tableBodyType.innerHTML = "";
        }

        data.data.forEach((rows) => {
            const row = tableBodyType.insertRow();
            Object.values(rows).forEach((val, idx) => {
                const cell = row.insertCell(idx);
                cell.textContent = val;
            });
        });
    })
    .catch((err) => console.log("error with selection (frontend after request): ", err));
}


async function addCondition() {
    const container = document.getElementById("filterContainer");
    const newRow = document.createElement("div");
    newRow.className = "filter-row";
    newRow.innerHTML = `
        <select class="column">
            <option value="donation_id">donation_id</option>
            <option value="type">type</option>
            <option value="quantity">quantity</option>
            <option value="date_received">date_received</option>
        </select>
        =
        <input type="text" class="value" placeholder="Enter value">

        <select class="operator">
            <option value="AND">AND</option>
            <option value="OR">OR</option>
        </select>

        <button type="button" class="removeCondition">Remove</button>
    `;
    container.appendChild(newRow);

    newRow.querySelector(".removeCondition").addEventListener("click", function() {
        newRow.remove();
    });
};

async function fetchAndDisplayDisasterCounts(event) {
    event.preventDefault();
    const tableElement = document.getElementById('disasterCountTable');
    const tableBody = tableElement.querySelector('tbody');
    const resultMsg = document.getElementById('disasterCountResultMsg');
    
    try {
        const response = await fetch('/disasters/count-by-type', {
            method: 'GET'
        });
        
        const responseData = await response.json();
        
        if (responseData.success) {
            const disasterCounts = responseData.data;
            
        
            if (tableBody) {
                tableBody.innerHTML = '';
            }
            
            
            disasterCounts.forEach(count => {
                const row = tableBody.insertRow();
                const typeCell = row.insertCell(0);
                const countCell = row.insertCell(1);
                
                typeCell.textContent = count[0]; 
                countCell.textContent = count[1]; 
            });
            
            resultMsg.textContent = '';
        } else {
            resultMsg.textContent = 'Failed to fetch disaster counts';
        }
    } catch (error) {
        console.error('Error:', error);
        resultMsg.textContent = 'An error occurred while fetching disaster counts';
    }
}

async function fetchDonationTypesAboveThreshold(event) {
    event.preventDefault();
    
    const threshold = document.getElementById('donationThreshold').value;
    const tableElement = document.getElementById('donationThresholdTable');
    const tableBody = tableElement.querySelector('tbody');
    const resultMsg = document.getElementById('donationThresholdResultMsg');
    //countcountDonationTypesAboveThreshold(threshold)-above-threshold
    try {
        const response = await fetch('/donations/count-above-threshold', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ threshold })
        });
        
        const responseData = await response.json();
        
        if (responseData.success) {
            const donationCounts = responseData.data;
            
            
            if (tableBody) {
                tableBody.innerHTML = '';
            }
            
            if (donationCounts.length === 0) {
                resultMsg.textContent = `No donation types found with count above ${threshold}`;
                return;
            }
            
            
            donationCounts.forEach(count => {
                const row = tableBody.insertRow();
                const typeCell = row.insertCell(0);
                const countCell = row.insertCell(1);
                
                typeCell.textContent = count[0]; 
                countCell.textContent = count[1]; 
            });
            
            resultMsg.textContent = '';
        } else {
            resultMsg.textContent = responseData.message || 'Failed to fetch donation counts';
        }
    } catch (error) {
        console.error('Error:', error);
        resultMsg.textContent = 'An error occurred while fetching donation counts';
    }
}

async function fetchAndDisplayTopDonations(event) {
    event.preventDefault();
    const tableElement = document.getElementById('topDonationsTable');
    const tableBody = tableElement.querySelector('tbody');
    const resultMsg = document.getElementById('topDonationsResultMsg');
    
    try {
        console.log('sending request')
        const response = await fetch('/donations/top-by-donor', {
            method: 'GET'
        });
        
        const responseData = await response.json();
        
        if (responseData.success) {
            const topDonations = responseData.data;
            
            
            if (tableBody) {
                tableBody.innerHTML = '';
            }
            
            if (topDonations.length === 0) {
                resultMsg.textContent = 'No top donations found';
                return;
            }
            
            
            console.log(topDonations)
            topDonations.forEach(donation => {
                const row = tableBody.insertRow();
                
                donation.forEach((field, index) => {
                    const cell = row.insertCell(index);
                    cell.textContent = field;
                });
            });
            
            resultMsg.textContent = '';
        } else {
            resultMsg.textContent = responseData.message || 'Failed to fetch top donations';
        }
    } catch (error) {
        console.error('Error:', error);
        resultMsg.textContent = 'An error occurred while fetching top donations';
    }
}

async function fetchAndDisplayAllTypesDonors(event) {
    event.preventDefault();

    const tableElement = document.getElementById('allTypesDonorsTable');
    const tableBody = tableElement.querySelector('tbody');
    const resultMsg = document.getElementById('allTypesDonorsResultMsg');
    
    try {
        const response = await fetch('/donors/all-types', {
            method: 'GET'
        });
        
        const responseData = await response.json();
        
        if (responseData.success) {
            const donors = responseData.data;
            
            
            if (tableBody) {
                tableBody.innerHTML = '';
            }
            
            if (donors.length === 0) {
                resultMsg.textContent = 'No donors found who have donated all types';
                return;
            }
            
            
            donors.forEach(donor => {
                const row = tableBody.insertRow();
                
                
                donor.forEach((field, index) => {
                    const cell = row.insertCell(index);
                    cell.textContent = field;
                });
            });
            
            resultMsg.textContent = '';
        } else {
            resultMsg.textContent = responseData.message || 'Failed to fetch donors with all types';
        }
    } catch (error) {
        console.error('Error:', error);
        resultMsg.textContent = 'An error occurred while fetching donors with all types';
    }
}



// ---------------------------------------------------------------
// Initializes the webpage functionalities.
// Add or remove event listeners based on the desired functionalities.
window.onload = function() {
    checkDbConnection();
    fetchTableData();
    // document.getElementById("resetDemotable").addEventListener("click", resetDemotable);
    document.getElementById("insertDonationtable").addEventListener("submit", insertDonationtable);
    document.getElementById("deleteDonationtable").addEventListener("submit", deleteFromDonationTypeTable);
    document.getElementById("filterDonationTable").addEventListener("submit", selectionDonationTable);
    // document.getElementById("updataNameDemotable").addEventListener("submit", updateNameDemotable);
    // document.getElementById("countDemotable").addEventListener("click", countDemotable);
    document.getElementById("addCondition").addEventListener("click", addCondition);
    document.getElementById('phoneNumber').addEventListener('blur', checkPhoneUniqueness);
    document.getElementById('updateWorkerForm').addEventListener('submit', updateWorker);
    setupProjectionForm();
    document.getElementById('reliefCenterJoinForm').addEventListener('submit', fetchReliefCenters);
    document.getElementById("countDisastersBtn").addEventListener("click", fetchAndDisplayDisasterCounts);
    document.getElementById("donationThresholdForm").addEventListener("submit", fetchDonationTypesAboveThreshold);
    document.getElementById("topDonationsBtn").addEventListener("click", fetchAndDisplayTopDonations);
    document.getElementById("allTypesDonorsBtn").addEventListener("click", fetchAndDisplayAllTypesDonors);
};

// General function to refresh the displayed table data. 
// You can invoke this after any table-modifying operation to keep consistency.
function fetchTableData() {
    fetchAndDisplayUsers();
    fetchAndDisplayWorkers();
}
