DROP TABLE Independent;
DROP TABLE Organization;
DROP TABLE Make;
DROP TABLE documentsAidsFor;
DROP TABLE Recipient;
DROP TABLE RecipientInfo;
DROP TABLE Tracks;
DROP TABLE Donation;
DROP TABLE DonationType;
DROP TABLE Aids;
DROP TABLE Disaster;
DROP TABLE ResponseImpact;
DROP TABLE Manages;
DROP TABLE DistributionRecord;
DROP TABLE AssignedTo;
DROP TABLE ReliefCenter;
DROP TABLE CenterCapacity;
DROP TABLE CenterLocation;
DROP TABLE Role;
DROP TABLE Volunteer;
DROP TABLE TrainingLevel;
DROP TABLE Employee;
DROP TABLE JobTitle;
DROP TABLE Worker;
DROP TABLE Location;
DROP TABLE Donor;
DROP TABLE DonorContact;
DROP TABLE TransferMethod;

CREATE TABLE Location (
    postal_code VARCHAR(255) PRIMARY KEY,
    city VARCHAR(255)
);

CREATE TABLE Worker (
    worker_id INTEGER PRIMARY KEY,
    name VARCHAR(255),
    phoneNumber VARCHAR(255) UNIQUE NOT NULL,
    postal_code VARCHAR(255) NOT NULL,
    FOREIGN KEY (postal_code) REFERENCES Location(postal_code) ON DELETE CASCADE
);

CREATE TABLE JobTitle (
    job_title VARCHAR(255) PRIMARY KEY,
    salary REAL
);

CREATE TABLE Employee (
    worker_id INTEGER PRIMARY KEY,
    job_title VARCHAR(255),
    FOREIGN KEY (worker_id) REFERENCES Worker(worker_id) ON DELETE CASCADE,
    FOREIGN KEY (job_title) REFERENCES JobTitle(job_title) ON DELETE CASCADE
);

CREATE TABLE TrainingLevel (
    training_status VARCHAR(255) PRIMARY KEY,
    skill_level VARCHAR(255)
);

CREATE TABLE Volunteer (
    worker_id INTEGER PRIMARY KEY,
    totalHours REAL,
    training_status VARCHAR(255),
    FOREIGN KEY (worker_id) REFERENCES Worker(worker_id) ON DELETE CASCADE,
    FOREIGN KEY (training_status) REFERENCES TrainingLevel(training_status)
);

CREATE TABLE Role (
    role VARCHAR(255) PRIMARY KEY,
    shift_start VARCHAR(255),
    shift_end VARCHAR(255)
);

CREATE TABLE CenterLocation (
    location VARCHAR(255) PRIMARY KEY,
    area_served VARCHAR(255)
);

CREATE TABLE CenterCapacity (
    name VARCHAR(255),
    location VARCHAR(255),
    capacity INTEGER,
    PRIMARY KEY (name, location),
    FOREIGN KEY (location) REFERENCES CenterLocation(location)
);

CREATE TABLE ReliefCenter (
    center_id INTEGER PRIMARY KEY,
    name VARCHAR(255),
    location VARCHAR(255),
    FOREIGN KEY (name, location) REFERENCES CenterCapacity(name, location)
);

CREATE TABLE AssignedTo (
    worker_id INTEGER PRIMARY KEY,
    center_id INTEGER,
    role VARCHAR(255),
    FOREIGN KEY (worker_id) REFERENCES Worker(worker_id) ON DELETE CASCADE,
    FOREIGN KEY (center_id) REFERENCES ReliefCenter(center_id),
    FOREIGN KEY (role) REFERENCES Role(role)
);

CREATE TABLE DistributionRecord (
    distribution_id INTEGER PRIMARY KEY,
    quantity INTEGER,
    status VARCHAR(255)
);

CREATE TABLE Manages (
    distribution_id INTEGER,
    center_id INTEGER,
    priority_level VARCHAR(255),
    PRIMARY KEY (distribution_id, center_id),
    FOREIGN KEY (distribution_id) REFERENCES DistributionRecord(distribution_id) ON DELETE CASCADE,
    FOREIGN KEY (center_id) REFERENCES ReliefCenter(center_id)
);

CREATE TABLE ResponseImpact (
    impact_level VARCHAR(255) PRIMARY KEY,
    response_time VARCHAR(255)
);

CREATE TABLE Disaster (
    disaster_id INTEGER PRIMARY KEY,
    type VARCHAR(255),
    totalAffected INTEGER,
    totalDamages INTEGER
);

CREATE TABLE Aids (
    center_id INTEGER,
    disaster_id INTEGER,
    impact_level VARCHAR(255),
    PRIMARY KEY (center_id, disaster_id, impact_level),
    FOREIGN KEY (center_id) REFERENCES ReliefCenter(center_id),
    FOREIGN KEY (disaster_id) REFERENCES Disaster(disaster_id),
    FOREIGN KEY (impact_level) REFERENCES ResponseImpact(impact_level)
);

CREATE TABLE DonationType (
    type VARCHAR(255),
    date_received VARCHAR(255),
    expiry_date VARCHAR(255),
    PRIMARY KEY (type, date_received)
);

CREATE TABLE Donation (
    donation_id INTEGER PRIMARY KEY,
    type VARCHAR(255),
    quantity INTEGER,
    date_received VARCHAR(255),
    FOREIGN KEY (type, date_received) REFERENCES DonationType(type, date_received) ON DELETE CASCADE
);

CREATE TABLE TransferMethod (
    transfer_method VARCHAR(255) PRIMARY KEY,
    eta VARCHAR(255)
);

CREATE TABLE Tracks (
    distribution_id INTEGER,
    donation_id INTEGER,
    transfer_method VARCHAR(255),
    PRIMARY KEY (distribution_id, donation_id),
    FOREIGN KEY (distribution_id) REFERENCES DistributionRecord(distribution_id) ON DELETE CASCADE,
    FOREIGN KEY (donation_id) REFERENCES Donation(donation_id) ON DELETE CASCADE,
    FOREIGN KEY (transfer_method) REFERENCES TransferMethod(transfer_method)
);

CREATE TABLE RecipientInfo (
    name VARCHAR(255),
    phoneNumber VARCHAR(255),
    age INTEGER,
    PRIMARY KEY (name, phoneNumber)
);

CREATE TABLE Recipient (
    recipient_id INTEGER PRIMARY KEY,
    name VARCHAR(255),
    phoneNumber VARCHAR(255),
    FOREIGN KEY (name, phoneNumber) REFERENCES RecipientInfo(name, phoneNumber)
);

CREATE TABLE documentsAidsFor (
    recipient_id INTEGER,
    distribution_id INTEGER,
    aid_type VARCHAR(255), 
    PRIMARY KEY (recipient_id, distribution_id),
    FOREIGN KEY (recipient_id) REFERENCES Recipient(recipient_id) ON DELETE CASCADE,
    FOREIGN KEY (distribution_id) REFERENCES DistributionRecord(distribution_id) ON DELETE CASCADE
);

CREATE TABLE DonorContact (
    phoneNumber VARCHAR(255),
    name VARCHAR(255),
    donation_frequency VARCHAR(255),
    PRIMARY KEY (phoneNumber, name)
);

CREATE TABLE Donor (
    donor_id INTEGER PRIMARY KEY,
    phoneNumber VARCHAR(255),
    name VARCHAR(255),
    FOREIGN KEY (phoneNumber, name) REFERENCES DonorContact(phoneNumber, name)
);

CREATE TABLE Make (
    donation_id INTEGER PRIMARY KEY,
    donor_id INTEGER,
    significance INTEGER,
    FOREIGN KEY (donation_id) REFERENCES Donation(donation_id) ON DELETE CASCADE,
    FOREIGN KEY (donor_id) REFERENCES Donor(donor_id) ON DELETE CASCADE
);

CREATE TABLE Organization (
    donor_id INTEGER PRIMARY KEY,
    taxNumber INTEGER,
    FOREIGN KEY (donor_id) REFERENCES Donor(donor_id)
);

CREATE TABLE Independent (
    donor_id INTEGER PRIMARY KEY,
    paymentMethod VARCHAR(255),
    FOREIGN KEY (donor_id) REFERENCES Donor(donor_id) ON DELETE CASCADE
);

INSERT INTO Location (postal_code, city) VALUES ('10000', 'vancouver');
INSERT INTO Location (postal_code, city) VALUES ('10001', 'new york');
INSERT INTO Location (postal_code, city) VALUES ('10002', 'toronto');
INSERT INTO Location (postal_code, city) VALUES ('10003', 'dallas');
INSERT INTO Location (postal_code, city) VALUES ('10004', 'chicago');

INSERT INTO Worker (worker_id, name, phoneNumber, postal_code) VALUES (1, 'john', '111-111-1111', '10000');
INSERT INTO Worker (worker_id, name, phoneNumber, postal_code) VALUES (2, 'joe', '222-222-2222', '10001');
INSERT INTO Worker (worker_id, name, phoneNumber, postal_code) VALUES (3, 'ayush', '333-333-3333', '10002');
INSERT INTO Worker (worker_id, name, phoneNumber, postal_code) VALUES (4, 'manan', '444-444-4444', '10003');
INSERT INTO Worker (worker_id, name, phoneNumber, postal_code) VALUES (5, 'arav', '555-555-5555', '10004');

INSERT INTO JobTitle (job_title, salary) VALUES ('doctor 1', 8000);
INSERT INTO JobTitle (job_title, salary) VALUES ('doctor 2', 8000);
INSERT INTO JobTitle (job_title, salary) VALUES ('doctor 3', 8000);
INSERT INTO JobTitle (job_title, salary) VALUES ('cleaner', 8000);
INSERT INTO JobTitle (job_title, salary) VALUES ('engineer', 10000);

INSERT INTO Employee (worker_id, job_title) VALUES (1, 'cleaner');
INSERT INTO Employee (worker_id, job_title) VALUES (2, 'engineer');
INSERT INTO Employee (worker_id, job_title) VALUES (3, 'doctor 1');
INSERT INTO Employee (worker_id, job_title) VALUES (4, 'doctor 2');
INSERT INTO Employee (worker_id, job_title) VALUES (5, 'doctor 3');

INSERT INTO TrainingLevel (training_status, skill_level) VALUES ('learning', 'beginner');
INSERT INTO TrainingLevel (training_status, skill_level) VALUES ('certified', 'advanced');
INSERT INTO TrainingLevel (training_status, skill_level) VALUES ('not started', 'beginner');
INSERT INTO TrainingLevel (training_status, skill_level) VALUES ('practicing', 'moderate');
INSERT INTO TrainingLevel (training_status, skill_level) VALUES ('not certified', 'beginner');

INSERT INTO Volunteer (worker_id, totalHours, training_status) VALUES (1, 40, 'certified');
INSERT INTO Volunteer (worker_id, totalHours, training_status) VALUES (2, 40, 'certified');
INSERT INTO Volunteer (worker_id, totalHours, training_status) VALUES (3, 30, 'not certified');
INSERT INTO Volunteer (worker_id, totalHours, training_status) VALUES (4, 20, 'not certified');
INSERT INTO Volunteer (worker_id, totalHours, training_status) VALUES (5, 60, 'certified');

INSERT INTO Role (role, shift_start, shift_end) VALUES ('manager', '2025-03-01', '2025-03-05');
INSERT INTO Role (role, shift_start, shift_end) VALUES ('volunteer', '2025-03-01', '2025-03-07');
INSERT INTO Role (role, shift_start, shift_end) VALUES ('coordinator', '2025-03-01', '2025-03-06');
INSERT INTO Role (role, shift_start, shift_end) VALUES ('planner', '2025-03-01', '2025-03-03');
INSERT INTO Role (role, shift_start, shift_end) VALUES ('clerk', '2025-03-01', '2025-03-04');

INSERT INTO CenterLocation (location, area_served) VALUES ('toronto', 'asia');
INSERT INTO CenterLocation (location, area_served) VALUES ('vancouver', 'south america');
INSERT INTO CenterLocation (location, area_served) VALUES ('dallas', 'north america');

INSERT INTO CenterCapacity (name, location, capacity) VALUES ('shelter 5', 'vancouver', 410);
INSERT INTO CenterCapacity (name, location, capacity) VALUES ('north shelter', 'toronto', 9);
INSERT INTO CenterCapacity (name, location, capacity) VALUES ('central shelter', 'dallas', 40);
INSERT INTO CenterCapacity (name, location, capacity) VALUES ('south shelter', 'dallas', 30);
INSERT INTO CenterCapacity (name, location, capacity) VALUES ('shelter 123', 'toronto', 40);

INSERT INTO ReliefCenter (center_id, name, location) VALUES (1, 'north shelter', 'toronto');
INSERT INTO ReliefCenter (center_id, name, location) VALUES (2, 'south shelter', 'dallas');
INSERT INTO ReliefCenter (center_id, name, location) VALUES (3, 'central shelter', 'dallas');
INSERT INTO ReliefCenter (center_id, name, location) VALUES (4, 'shelter 123', 'toronto');
INSERT INTO ReliefCenter (center_id, name, location) VALUES (5, 'shelter 5', 'vancouver');

INSERT INTO AssignedTo (worker_id, center_id, role) VALUES (1, 1, 'manager');
INSERT INTO AssignedTo (worker_id, center_id, role) VALUES (2, 1, 'volunteer');
INSERT INTO AssignedTo (worker_id, center_id, role) VALUES (3, 1, 'coordinator');
INSERT INTO AssignedTo (worker_id, center_id, role) VALUES (4, 2, 'planner');
INSERT INTO AssignedTo (worker_id, center_id, role) VALUES (5, 3, 'clerk');

INSERT INTO DistributionRecord (distribution_id, quantity, status) VALUES (1, 900, 'done');
INSERT INTO DistributionRecord (distribution_id, quantity, status) VALUES (2, 800, 'done');
INSERT INTO DistributionRecord (distribution_id, quantity, status) VALUES (3, 60, 'done');
INSERT INTO DistributionRecord (distribution_id, quantity, status) VALUES (4, 40, 'not done');
INSERT INTO DistributionRecord (distribution_id, quantity, status) VALUES (5, 310, 'done');

INSERT INTO Manages (distribution_id, center_id, priority_level) VALUES (1, 1, 'high');
INSERT INTO Manages (distribution_id, center_id, priority_level) VALUES (2, 2, 'low');
INSERT INTO Manages (distribution_id, center_id, priority_level) VALUES (3, 3, 'moderate');
INSERT INTO Manages (distribution_id, center_id, priority_level) VALUES (4, 4, 'high');
INSERT INTO Manages (distribution_id, center_id, priority_level) VALUES (5, 5, 'high');

INSERT INTO ResponseImpact (impact_level, response_time) VALUES ('high', '24 hours');
INSERT INTO ResponseImpact (impact_level, response_time) VALUES ('medium', '48 hours');
INSERT INTO ResponseImpact (impact_level, response_time) VALUES ('low', '72 hours');
INSERT INTO ResponseImpact (impact_level, response_time) VALUES ('critical', 'immediately');
INSERT INTO ResponseImpact (impact_level, response_time) VALUES ('moderate', '36 hours');

INSERT INTO Disaster (disaster_id, type, totalAffected, totalDamages) VALUES (1, 'earthquake', 10, 50);
INSERT INTO Disaster (disaster_id, type, totalAffected, totalDamages) VALUES (2, 'flood', 15, 300);
INSERT INTO Disaster (disaster_id, type, totalAffected, totalDamages) VALUES (3, 'hurricane', 5000, 20);
INSERT INTO Disaster (disaster_id, type, totalAffected, totalDamages) VALUES (4, 'wildfire', 2, 15);
INSERT INTO Disaster (disaster_id, type, totalAffected, totalDamages) VALUES (5, 'tornado', 7, 40);

INSERT INTO Aids (center_id, disaster_id, impact_level) VALUES (1, 1, 'high');
INSERT INTO Aids (center_id, disaster_id, impact_level) VALUES (2, 2, 'low');
INSERT INTO Aids (center_id, disaster_id, impact_level) VALUES (3, 3, 'low');
INSERT INTO Aids (center_id, disaster_id, impact_level) VALUES (4, 4, 'high');
INSERT INTO Aids (center_id, disaster_id, impact_level) VALUES (5, 5, 'high');

INSERT INTO DonationType (type, date_received, expiry_date) VALUES ('clothes', '2025-03-01', '2026-03-01');
INSERT INTO DonationType (type, date_received, expiry_date) VALUES ('food', '2025-03-02', '2025-06-02');
INSERT INTO DonationType (type, date_received, expiry_date) VALUES ('supplies', '2025-03-03', '2026-03-03');
INSERT INTO DonationType (type, date_received, expiry_date) VALUES ('water', '2025-03-04', '2025-09-04');
INSERT INTO DonationType (type, date_received, expiry_date) VALUES ('tools', '2025-03-05', '2030-03-05');
INSERT INTO DonationType (type, date_received, expiry_date) VALUES ('food', '2024-04-02', '2025-06-02');
INSERT INTO DonationType (type, date_received, expiry_date) VALUES ('supplies', '2023-03-03', '2026-03-03');
INSERT INTO DonationType (type, date_received, expiry_date) VALUES ('water', '2025-03-01', '2025-09-04');
INSERT INTO DonationType (type, date_received, expiry_date) VALUES ('tools', '2024-03-05', '2030-03-05');


INSERT INTO Donation (donation_id, type, quantity, date_received) VALUES (1, 'clothes', 10, '2025-03-01');
INSERT INTO Donation (donation_id, type, quantity, date_received) VALUES (2, 'food', 500, '2025-03-02');
INSERT INTO Donation (donation_id, type, quantity, date_received) VALUES (3, 'supplies', 10, '2025-03-03');
INSERT INTO Donation (donation_id, type, quantity, date_received) VALUES (4, 'water', 10, '2025-03-04');
INSERT INTO Donation (donation_id, type, quantity, date_received) VALUES (5, 'tools', 15, '2025-03-05');
INSERT INTO Donation (donation_id, type, quantity, date_received) VALUES (6, 'food', 50, '2024-04-02');
INSERT INTO Donation (donation_id, type, quantity, date_received) VALUES (7, 'supplies', 10, '2023-03-03');
INSERT INTO Donation (donation_id, type, quantity, date_received) VALUES (8, 'water', 100, '2025-03-01');
INSERT INTO Donation (donation_id, type, quantity, date_received) VALUES (9, 'tools', 105, '2024-03-05');

INSERT INTO TransferMethod (transfer_method, eta) VALUES ('air', '48 hours');
INSERT INTO TransferMethod (transfer_method, eta) VALUES ('sea', '5 days');
INSERT INTO TransferMethod (transfer_method, eta) VALUES ('land', '3 days');
INSERT INTO TransferMethod (transfer_method, eta) VALUES ('rail', '2 days');
INSERT INTO TransferMethod (transfer_method, eta) VALUES ('express', '24 hours');

INSERT INTO Tracks (distribution_id, donation_id, transfer_method) VALUES (1, 1, 'air');
INSERT INTO Tracks (distribution_id, donation_id, transfer_method) VALUES (2, 2, 'sea');
INSERT INTO Tracks (distribution_id, donation_id, transfer_method) VALUES (3, 3, 'land');
INSERT INTO Tracks (distribution_id, donation_id, transfer_method) VALUES (4, 4, 'rail');
INSERT INTO Tracks (distribution_id, donation_id, transfer_method) VALUES (5, 5, 'express');

INSERT INTO RecipientInfo (name, phoneNumber, age) VALUES ('John Doe', '123-456-7890', 35);
INSERT INTO RecipientInfo (name, phoneNumber, age) VALUES ('Jane Smith', '234-567-8901', 42);
INSERT INTO RecipientInfo (name, phoneNumber, age) VALUES ('Bob Johnson', '345-678-9012', 28);
INSERT INTO RecipientInfo (name, phoneNumber, age) VALUES ('Alice Williams', '456-789-0123', 51);
INSERT INTO RecipientInfo (name, phoneNumber, age) VALUES ('Charlie Brown', '567-890-1234', 19);

INSERT INTO Recipient (recipient_id, name, phoneNumber) VALUES (1, 'John Doe', '123-456-7890');
INSERT INTO Recipient (recipient_id, name, phoneNumber) VALUES (2, 'Jane Smith', '234-567-8901');
INSERT INTO Recipient (recipient_id, name, phoneNumber) VALUES (3, 'Bob Johnson', '345-678-9012');
INSERT INTO Recipient (recipient_id, name, phoneNumber) VALUES (4, 'Alice Williams', '456-789-0123');
INSERT INTO Recipient (recipient_id, name, phoneNumber) VALUES (5, 'Charlie Brown', '567-890-1234');

INSERT INTO documentsAidsFor (recipient_id, distribution_id, aid_type) VALUES (1, 1, 'emergency');
INSERT INTO documentsAidsFor (recipient_id, distribution_id, aid_type) VALUES (2, 2, 'food');
INSERT INTO documentsAidsFor (recipient_id, distribution_id, aid_type) VALUES (3, 3, 'medical');
INSERT INTO documentsAidsFor (recipient_id, distribution_id, aid_type) VALUES (4, 4, 'shelter');
INSERT INTO documentsAidsFor (recipient_id, distribution_id, aid_type) VALUES (5, 5, 'clothing');

INSERT INTO DonorContact (phoneNumber, name, donation_frequency) VALUES ('416-123-4567', 'John', 'Monthly');
INSERT INTO DonorContact (phoneNumber, name, donation_frequency) VALUES ('647-234-5678', 'Joe', 'Quarterly');
INSERT INTO DonorContact (phoneNumber, name, donation_frequency) VALUES ('416-345-6789', 'Ayush', 'Annually');
INSERT INTO DonorContact (phoneNumber, name, donation_frequency) VALUES ('647-456-7890', 'Manan', 'One-time');
INSERT INTO DonorContact (phoneNumber, name, donation_frequency) VALUES ('416-567-8901', 'Arav', 'Monthly');

INSERT INTO Donor (donor_id, phoneNumber, name) VALUES (1, '416-123-4567', 'John');
INSERT INTO Donor (donor_id, phoneNumber, name) VALUES (2, '647-234-5678', 'Joe');
INSERT INTO Donor (donor_id, phoneNumber, name) VALUES (3, '416-345-6789', 'Ayush');
INSERT INTO Donor (donor_id, phoneNumber, name) VALUES (4, '647-456-7890', 'Manan');
INSERT INTO Donor (donor_id, phoneNumber, name) VALUES (5, '416-567-8901', 'Arav');

INSERT INTO Make (donation_id, donor_id, significance) VALUES (1, 1, 5);
INSERT INTO Make (donation_id, donor_id, significance) VALUES (6, 1, 5);
INSERT INTO Make (donation_id, donor_id, significance) VALUES (7, 1, 5);
INSERT INTO Make (donation_id, donor_id, significance) VALUES (8, 1, 5);
INSERT INTO Make (donation_id, donor_id, significance) VALUES (9, 1, 5);
INSERT INTO Make (donation_id, donor_id, significance) VALUES (2, 2, 4);
INSERT INTO Make (donation_id, donor_id, significance) VALUES (3, 3, 3);
INSERT INTO Make (donation_id, donor_id, significance) VALUES (4, 4, 5);
INSERT INTO Make (donation_id, donor_id, significance) VALUES (5, 5, 2);

INSERT INTO Organization (donor_id, taxNumber) VALUES (1, 123);
INSERT INTO Organization (donor_id, taxNumber) VALUES (2, 321);
INSERT INTO Organization (donor_id, taxNumber) VALUES (3, 43124);
INSERT INTO Organization (donor_id, taxNumber) VALUES (4, 51353);
INSERT INTO Organization (donor_id, taxNumber) VALUES (5, 123412);

INSERT INTO Independent (donor_id, paymentMethod) VALUES (1, 'Credit Card');
INSERT INTO Independent (donor_id, paymentMethod) VALUES (2, 'Cash');
INSERT INTO Independent (donor_id, paymentMethod) VALUES (3, 'Cash');
INSERT INTO Independent (donor_id, paymentMethod) VALUES (4, 'Credit Card');
INSERT INTO Independent (donor_id, paymentMethod) VALUES (5, 'Cash');