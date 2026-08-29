// ======================================================
// ============== EXPENSE TRACKER PRO SERVER ============
// ============== BREVO OTP VERSION =====================
// ======================================================

"use strict";

const express = require("express");
const mysql = require("mysql2");
const path = require("path");

const app = express();

// ======================================================
// PORT
// ======================================================

const PORT = Number(process.env.PORT) || 5000;

// ======================================================
// CORS
// ======================================================

const allowedOrigins = [
    "https://expense-tracker-pro-production-98cf.up.railway.app",
    "https://expense-tracker-pro-production-b745.up.railway.app",
    "https://expense-tracker-pro-production-99eb.up.railway.app",
    "http://localhost:5000",
    "http://127.0.0.1:5000"
];

app.use((req, res, next) => {
    const origin = req.headers.origin;

    if (origin && allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Credentials", "true");
    }

    res.setHeader("Vary", "Origin");

    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );

    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );

    if (req.method === "OPTIONS") {
        return res.status(204).end();
    }

    next();
});

// ======================================================
// BODY PARSER
// ======================================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======================================================
// STATIC FILES
// ======================================================

app.use(express.static(__dirname));

// ======================================================
// MYSQL CONFIG
// ======================================================

const dbConfig = {
    host:
        process.env.MYSQLHOST ||
        process.env.MYSQL_HOST ||
        "localhost",

    user:
        process.env.MYSQLUSER ||
        process.env.MYSQL_USER ||
        "root",

    password:
        process.env.MYSQLPASSWORD ||
        process.env.MYSQL_PASSWORD ||
        "",

    database:
        process.env.MYSQLDATABASE ||
        process.env.MYSQL_DATABASE ||
        "expense_tracker",

    port: Number(
        process.env.MYSQLPORT ||
        process.env.MYSQL_PORT ||
        3306
    ),

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true
};

console.log("======================================");
console.log("MYSQL CONFIG");
console.log("Host:", dbConfig.host);
console.log("Port:", dbConfig.port);
console.log("Database:", dbConfig.database);
console.log("User:", dbConfig.user);
console.log("======================================");

// ======================================================
// MYSQL POOL
// ======================================================

const db = mysql.createPool(dbConfig);

// ======================================================
// BREVO CONFIG
// ======================================================

const BREVO_API_KEY = process.env.BREVO_API_KEY;

const BREVO_FROM_EMAIL =
    process.env.BREVO_FROM_EMAIL;

const BREVO_FROM_NAME =
    process.env.BREVO_FROM_NAME ||
    "Expense Tracker Pro";

console.log("======================================");
console.log("BREVO EMAIL CONFIG");

console.log(
    "Brevo API Key:",
    BREVO_API_KEY ? "configured OK" : "MISSING"
);

console.log(
    "Brevo From Email:",
    BREVO_FROM_EMAIL || "MISSING"
);

console.log(
    "Brevo From Name:",
    BREVO_FROM_NAME
);

console.log("======================================");

// ======================================================
// HELPERS
// ======================================================

function normalizeEmail(email) {
    return String(email || "")
        .trim()
        .toLowerCase();
}

function generateOTP() {
    return Math.floor(
        100000 + Math.random() * 900000
    ).toString();
}

// ======================================================
// VALIDATION
// ======================================================

const gmailRegex =
    /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

const passwordRegex =
    /^\d{6}$/;

// ======================================================
// CREATE REQUIRED TABLES
// ======================================================

async function createRequiredTables() {

    const usersSQL = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL
        )
    `;

    const expensesSQL = `
        CREATE TABLE IF NOT EXISTS expenses (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            category VARCHAR(100) NOT NULL,
            date DATE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    const incomeSQL = `
        CREATE TABLE IF NOT EXISTS income (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            date DATE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    const historySQL = `
        CREATE TABLE IF NOT EXISTS deleted_history (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            original_id INT,
            type VARCHAR(50) NOT NULL,
            name VARCHAR(255),
            amount DECIMAL(10,2),
            category VARCHAR(100),
            date DATE,
            deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    const passwordResetSQL = `
        CREATE TABLE IF NOT EXISTS password_resets (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            otp VARCHAR(10) NOT NULL,
            expires_at DATETIME NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_password_reset_email (email)
        )
    `;

    await db.promise().query(usersSQL);
    console.log("users table ready");

    await db.promise().query(expensesSQL);
    console.log("expenses table ready");

    await db.promise().query(incomeSQL);
    console.log("income table ready");

    await db.promise().query(historySQL);
    console.log("deleted_history table ready");

    await db.promise().query(passwordResetSQL);
    console.log("password_resets table ready");
}

// ======================================================
// DATABASE INIT
// ======================================================

let databaseReady = false;

async function initializeDatabase() {

    try {

        const [result] =
            await db.promise().query(
                "SELECT DATABASE() AS database_name"
            );

        console.log("======================================");
        console.log("MySQL Connected");
        console.log(
            "Database:",
            result[0]?.database_name
        );
        console.log("======================================");

        await createRequiredTables();

        databaseReady = true;

        console.log("======================================");
        console.log("DATABASE READY");
        console.log("======================================");

    } catch (error) {

        databaseReady = false;

        console.error(
            "MySQL Connection Failed:",
            error.message
        );

        setTimeout(
            initializeDatabase,
            5000
        );
    }
}

// ======================================================
// DATABASE MIDDLEWARE
// ======================================================

function checkDatabase(req, res, next) {

    if (!databaseReady) {

        return res.status(503).json({
            success: false,
            message:
                "Database is not ready yet. Please try again."
        });
    }

    next();
}

// ======================================================
// HOME
// ======================================================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "index.html")
    );
});

// ======================================================
// STATUS
// ======================================================

app.get("/api/status", async (req, res) => {

    try {

        const [result] =
            await db.promise().query(
                "SELECT DATABASE() AS database_name"
            );

        res.json({
            success: true,
            server: "running",
            mysql: "connected",
            database:
                result[0]?.database_name,
            databaseReady,
            message:
                "Expense Tracker API is working"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            server: "running",
            mysql: "disconnected",
            databaseReady: false,
            error: error.message
        });
    }
});

// ======================================================
// CORS TEST
// ======================================================

app.get("/api/cors-test", (req, res) => {

    res.json({
        success: true,
        message: "CORS is working",
        origin:
            req.headers.origin || null
    });
});

// ======================================================
// DB TEST
// ======================================================

app.get("/api/test-db", async (req, res) => {

    try {

        const [result] =
            await db.promise().query(
                "SELECT DATABASE() AS database_name"
            );

        res.json({
            success: true,
            database:
                result[0]?.database_name
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ======================================================
// REGISTER
// ======================================================

async function registerUser(req, res) {

    try {

        const name =
            String(req.body.name || "").trim();

        const email =
            normalizeEmail(req.body.email);

        const password =
            String(req.body.password || "").trim();

        if (!name || !email || !password) {

            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (!gmailRegex.test(email)) {

            return res.status(400).json({
                success: false,
                message:
                    "Only Gmail addresses are allowed"
            });
        }

        if (!passwordRegex.test(password)) {

            return res.status(400).json({
                success: false,
                message:
                    "Password must contain exactly 6 digits"
            });
        }

        const [result] =
            await db.promise().query(
                `
                INSERT INTO users
                (name, email, password)
                VALUES (?, ?, ?)
                `,
                [
                    name,
                    email,
                    password
                ]
            );

        console.log(
            "USER REGISTERED:",
            email
        );

        res.status(201).json({
            success: true,
            message:
                "Registration successful",
            userId:
                result.insertId
        });

    } catch (error) {

        console.error(
            "REGISTER DATABASE ERROR:",
            error.message
        );

        if (error.code === "ER_DUP_ENTRY") {

            return res.status(409).json({
                success: false,
                message:
                    "Email already exists"
            });
        }

        res.status(500).json({
            success: false,
            message: "Database error",
            error: error.message
        });
    }
}

app.post(
    "/api/register",
    checkDatabase,
    registerUser
);

app.post(
    "/register",
    checkDatabase,
    registerUser
);

// ======================================================
// LOGIN
// ======================================================

async function loginUser(req, res) {

    try {

        const email =
            normalizeEmail(req.body.email);

        const password =
            String(req.body.password || "").trim();

        console.log("======================================");
        console.log("LOGIN REQUEST");
        console.log("Email:", email);
        console.log("======================================");

        if (!email || !password) {

            return res.status(400).json({
                success: false,
                message:
                    "Email and password are required"
            });
        }

        const [results] =
            await db.promise().query(
                `
                SELECT id, name, email, password
                FROM users
                WHERE LOWER(TRIM(email)) = ?
                LIMIT 1
                `,
                [email]
            );

        if (!results.length) {

            return res.status(401).json({
                success: false,
                message:
                    "Invalid email or password"
            });
        }

        const user = results[0];

        if (
            String(user.password) !==
            String(password)
        ) {

            return res.status(401).json({
                success: false,
                message:
                    "Invalid email or password"
            });
        }

        console.log(
            "LOGIN SUCCESS:",
            email
        );

        res.json({
            success: true,
            message:
                "Login successful",

            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {

        console.error(
            "LOGIN DATABASE ERROR:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Database error",
            error: error.message
        });
    }
}

app.post(
    "/api/login",
    checkDatabase,
    loginUser
);

app.post(
    "/login",
    checkDatabase,
    loginUser
);

// ======================================================
// GET USER
// ======================================================

app.get(
    "/api/user/:email",
    checkDatabase,
    async (req, res) => {

        try {

            const email =
                normalizeEmail(
                    decodeURIComponent(
                        req.params.email
                    )
                );

            const [results] =
                await db.promise().query(
                    `
                    SELECT id, name, email
                    FROM users
                    WHERE LOWER(TRIM(email)) = ?
                    LIMIT 1
                    `,
                    [email]
                );

            if (!results.length) {

                return res.status(404).json({
                    success: false,
                    message:
                        "User not found"
                });
            }

            res.json({
                success: true,
                user: results[0]
            });

        } catch (error) {

            res.status(500).json({
                success: false,
                message: "Database error",
                error: error.message
            });
        }
    }
);

// ======================================================
// EXPENSES GET
// ======================================================

app.get(
    "/expenses/:email",
    checkDatabase,
    async (req, res) => {

        try {

            const email =
                normalizeEmail(
                    decodeURIComponent(
                        req.params.email
                    )
                );

            console.log(
                "GET EXPENSES:",
                email
            );

            const [results] =
                await db.promise().query(
                    `
                    SELECT
                        id,
                        email,
                        name,
                        amount,
                        category,
                        date
                    FROM expenses
                    WHERE LOWER(TRIM(email)) = ?
                    ORDER BY date DESC, id DESC
                    `,
                    [email]
                );

            res.json({
                success: true,
                expenses: results
            });

        } catch (error) {

            console.error(
                "GET EXPENSE ERROR:",
                error.message
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to load expenses",
                error:
                    error.message
            });
        }
    }
);

// ======================================================
// EXPENSE POST
// ======================================================

app.post(
    "/expenses",
    checkDatabase,
    async (req, res) => {

        try {

            const email =
                normalizeEmail(
                    req.body.email
                );

            const name =
                String(
                    req.body.name || ""
                ).trim();

            const amount =
                Number(req.body.amount);

            const category =
                String(
                    req.body.category || ""
                ).trim();

            const date =
                String(
                    req.body.date || ""
                ).trim();

            if (
                !email ||
                !name ||
                !Number.isFinite(amount) ||
                !category ||
                !date
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Email, name, amount, category and date are required"
                });
            }

            const [result] =
                await db.promise().query(
                    `
                    INSERT INTO expenses
                    (email, name, amount, category, date)
                    VALUES (?, ?, ?, ?, ?)
                    `,
                    [
                        email,
                        name,
                        amount,
                        category,
                        date
                    ]
                );

            console.log(
                "EXPENSE SAVED:",
                result.insertId,
                email
            );

            res.json({
                success: true,
                message:
                    "Expense added successfully",
                expenseId:
                    result.insertId
            });

        } catch (error) {

            console.error(
                "ADD EXPENSE ERROR:",
                error.message
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to add expense",
                error:
                    error.message
            });
        }
    }
);

// ======================================================
// EXPENSE PUT
// ======================================================

app.put(
    "/expenses/:id",
    checkDatabase,
    async (req, res) => {

        try {

            const id =
                Number(req.params.id);

            const name =
                String(
                    req.body.name || ""
                ).trim();

            const amount =
                Number(req.body.amount);

            const category =
                String(
                    req.body.category || ""
                ).trim();

            const date =
                String(
                    req.body.date || ""
                ).trim();

            if (
                !id ||
                !name ||
                !Number.isFinite(amount) ||
                !category ||
                !date
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "All expense fields are required"
                });
            }

            const [result] =
                await db.promise().query(
                    `
                    UPDATE expenses
                    SET
                        name = ?,
                        amount = ?,
                        category = ?,
                        date = ?
                    WHERE id = ?
                    `,
                    [
                        name,
                        amount,
                        category,
                        date,
                        id
                    ]
                );

            res.json({
                success: true,
                message:
                    "Expense updated successfully",
                affectedRows:
                    result.affectedRows
            });

        } catch (error) {

            console.error(
                "UPDATE EXPENSE ERROR:",
                error.message
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to update expense",
                error:
                    error.message
            });
        }
    }
);

// ======================================================
// EXPENSE DELETE
// ======================================================

app.delete(
    "/expenses/:id",
    checkDatabase,
    async (req, res) => {

        try {

            const id =
                Number(req.params.id);

            const [rows] =
                await db.promise().query(
                    `
                    SELECT *
                    FROM expenses
                    WHERE id = ?
                    LIMIT 1
                    `,
                    [id]
                );

            if (!rows.length) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Expense not found"
                });
            }

            const expense = rows[0];

            await db.promise().query(
                `
                INSERT INTO deleted_history
                (
                    email,
                    original_id,
                    type,
                    name,
                    amount,
                    category,
                    date
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
                `,
                [
                    expense.email,
                    expense.id,
                    "expense",
                    expense.name,
                    expense.amount,
                    expense.category,
                    expense.date
                ]
            );

            const [result] =
                await db.promise().query(
                    "DELETE FROM expenses WHERE id = ?",
                    [id]
                );

            res.json({
                success: true,
                message:
                    "Expense deleted successfully",
                affectedRows:
                    result.affectedRows
            });

        } catch (error) {

            console.error(
                "DELETE EXPENSE ERROR:",
                error.message
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to delete expense",
                error:
                    error.message
            });
        }
    }
);

// ======================================================
// INCOME GET
// ======================================================

app.get(
    "/income/:email",
    checkDatabase,
    async (req, res) => {

        try {

            const email =
                normalizeEmail(
                    decodeURIComponent(
                        req.params.email
                    )
                );

            const [results] =
                await db.promise().query(
                    `
                    SELECT
                        id,
                        email,
                        amount,
                        date
                    FROM income
                    WHERE LOWER(TRIM(email)) = ?
                    ORDER BY date DESC, id DESC
                    `,
                    [email]
                );

            res.json({
                success: true,
                income: results
            });

        } catch (error) {

            console.error(
                "GET INCOME ERROR:",
                error.message
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to load income",
                error:
                    error.message
            });
        }
    }
);

// ======================================================
// INCOME POST
// ======================================================

app.post(
    "/income",
    checkDatabase,
    async (req, res) => {

        try {

            const email =
                normalizeEmail(
                    req.body.email
                );

            const amount =
                Number(req.body.amount);

            const date =
                String(
                    req.body.date || ""
                ).trim();

            if (
                !email ||
                !Number.isFinite(amount) ||
                !date
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Email, amount and date are required"
                });
            }

            const [result] =
                await db.promise().query(
                    `
                    INSERT INTO income
                    (email, amount, date)
                    VALUES (?, ?, ?)
                    `,
                    [
                        email,
                        amount,
                        date
                    ]
                );

            console.log(
                "INCOME SAVED:",
                result.insertId,
                email
            );

            res.json({
                success: true,
                message:
                    "Income added successfully",
                incomeId:
                    result.insertId
            });

        } catch (error) {

            console.error(
                "ADD INCOME ERROR:",
                error.message
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to add income",
                error:
                    error.message
            });
        }
    }
);

// ======================================================
// INCOME PUT
// ======================================================

app.put(
    "/income/:id",
    checkDatabase,
    async (req, res) => {

        try {

            const id =
                Number(req.params.id);

            const amount =
                Number(req.body.amount);

            const date =
                String(
                    req.body.date || ""
                ).trim();

            if (
                !id ||
                !Number.isFinite(amount) ||
                !date
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Amount and date are required"
                });
            }

            const [result] =
                await db.promise().query(
                    `
                    UPDATE income
                    SET
                        amount = ?,
                        date = ?
                    WHERE id = ?
                    `,
                    [
                        amount,
                        date,
                        id
                    ]
                );

            res.json({
                success: true,
                message:
                    "Income updated successfully",
                affectedRows:
                    result.affectedRows
            });

        } catch (error) {

            console.error(
                "UPDATE INCOME ERROR:",
                error.message
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to update income",
                error:
                    error.message
            });
        }
    }
);

// ======================================================
// INCOME DELETE
// ======================================================

app.delete(
    "/income/:id",
    checkDatabase,
    async (req, res) => {

        try {

            const id =
                Number(req.params.id);

            const [rows] =
                await db.promise().query(
                    `
                    SELECT *
                    FROM income
                    WHERE id = ?
                    LIMIT 1
                    `,
                    [id]
                );

            if (!rows.length) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Income not found"
                });
            }

            const income = rows[0];

            await db.promise().query(
                `
                INSERT INTO deleted_history
                (
                    email,
                    original_id,
                    type,
                    name,
                    amount,
                    category,
                    date
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
                `,
                [
                    income.email,
                    income.id,
                    "income",
                    null,
                    income.amount,
                    null,
                    income.date
                ]
            );

            const [result] =
                await db.promise().query(
                    "DELETE FROM income WHERE id = ?",
                    [id]
                );

            res.json({
                success: true,
                message:
                    "Income deleted successfully",
                affectedRows:
                    result.affectedRows
            });

        } catch (error) {

            console.error(
                "DELETE INCOME ERROR:",
                error.message
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to delete income",
                error:
                    error.message
            });
        }
    }
);

// ======================================================
// TRASH GET
// ======================================================

app.get(
    "/trash/:email",
    checkDatabase,
    async (req, res) => {

        try {

            const email =
                normalizeEmail(
                    decodeURIComponent(
                        req.params.email
                    )
                );

            const [results] =
                await db.promise().query(
                    `
                    SELECT
                        id,
                        email,
                        original_id,
                        type,
                        name,
                        amount,
                        category,
                        date,
                        deleted_at
                    FROM deleted_history
                    WHERE LOWER(TRIM(email)) = ?
                    ORDER BY deleted_at DESC, id DESC
                    `,
                    [email]
                );

            res.json({
                success: true,
                trash: results
            });

        } catch (error) {

            res.status(500).json({
                success: false,
                message:
                    "Unable to load delete history",
                error:
                    error.message
            });
        }
    }
);

// ======================================================
// TRASH RESTORE
// ======================================================

app.post(
    "/trash/restore/:id",
    checkDatabase,
    async (req, res) => {

        try {

            const id =
                Number(req.params.id);

            const [rows] =
                await db.promise().query(
                    `
                    SELECT *
                    FROM deleted_history
                    WHERE id = ?
                    LIMIT 1
                    `,
                    [id]
                );

            if (!rows.length) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Deleted record not found"
                });
            }

            const item = rows[0];

            if (item.type === "expense") {

                const [result] =
                    await db.promise().query(
                        `
                        INSERT INTO expenses
                        (email, name, amount, category, date)
                        VALUES (?, ?, ?, ?, ?)
                        `,
                        [
                            item.email,
                            item.name,
                            item.amount,
                            item.category,
                            item.date
                        ]
                    );

                await db.promise().query(
                    "DELETE FROM deleted_history WHERE id = ?",
                    [id]
                );

                return res.json({
                    success: true,
                    message:
                        "Expense restored successfully",
                    expenseId:
                        result.insertId
                });
            }

            if (item.type === "income") {

                const [result] =
                    await db.promise().query(
                        `
                        INSERT INTO income
                        (email, amount, date)
                        VALUES (?, ?, ?)
                        `,
                        [
                            item.email,
                            item.amount,
                            item.date
                        ]
                    );

                await db.promise().query(
                    "DELETE FROM deleted_history WHERE id = ?",
                    [id]
                );

                return res.json({
                    success: true,
                    message:
                        "Income restored successfully",
                    incomeId:
                        result.insertId
                });
            }

            return res.status(400).json({
                success: false,
                message:
                    "Unknown history record type"
            });

        } catch (error) {

            console.error(
                "RESTORE ERROR:",
                error.message
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to restore record",
                error:
                    error.message
            });
        }
    }
);

// ======================================================
// TRASH CLEANUP
// ======================================================

app.delete(
    "/trash/cleanup",
    checkDatabase,
    async (req, res) => {

        try {

            const [result] =
                await db.promise().query(
                    `
                    DELETE FROM deleted_history
                    WHERE deleted_at <
                    NOW() - INTERVAL 60 DAY
                    `
                );

            res.json({
                success: true,
                message:
                    "Old deleted records cleaned successfully",
                deletedRows:
                    result.affectedRows
            });

        } catch (error) {

            res.status(500).json({
                success: false,
                message:
                    "Unable to clean old history",
                error:
                    error.message
            });
        }
    }
);

// ======================================================
// ALL USER DATA
// ======================================================

app.get(
    "/api/data/:email",
    checkDatabase,
    async (req, res) => {

        try {

            const email =
                normalizeEmail(
                    decodeURIComponent(
                        req.params.email
                    )
                );

            const [expenses] =
                await db.promise().query(
                    `
                    SELECT
                        id,
                        email,
                        name,
                        amount,
                        category,
                        date
                    FROM expenses
                    WHERE LOWER(TRIM(email)) = ?
                    ORDER BY date DESC, id DESC
                    `,
                    [email]
                );

            const [income] =
                await db.promise().query(
                    `
                    SELECT
                        id,
                        email,
                        amount,
                        date
                    FROM income
                    WHERE LOWER(TRIM(email)) = ?
                    ORDER BY date DESC, id DESC
                    `,
                    [email]
                );

            res.json({
                success: true,
                expenses,
                income
            });

        } catch (error) {

            res.status(500).json({
                success: false,
                message:
                    "Unable to load user data",
                error:
                    error.message
            });
        }
    }
);

// ======================================================
// BREVO SEND OTP EMAIL
// ======================================================

async function sendOTPEmail(
    email,
    userName,
    otp
) {

    if (!BREVO_API_KEY) {

        throw new Error(
            "BREVO_API_KEY is missing in Railway Variables"
        );
    }

    if (!BREVO_FROM_EMAIL) {

        throw new Error(
            "BREVO_FROM_EMAIL is missing in Railway Variables"
        );
    }

    const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Password Reset OTP</title>
</head>

<body style="
margin:0;
padding:30px;
background:#f5f5f5;
font-family:Arial,sans-serif;
">

<div style="
max-width:500px;
margin:auto;
background:white;
padding:30px;
border-radius:16px;
">

<h2 style="text-align:center;">
Expense Tracker Pro
</h2>

<p>
Hello ${userName || "User"},
</p>

<p>
Your password reset OTP is:
</p>

<div style="
font-size:34px;
font-weight:bold;
letter-spacing:8px;
text-align:center;
background:#f5f5f5;
padding:20px;
border-radius:12px;
margin:25px 0;
">

${otp}

</div>

<p>
This OTP is valid for
<strong>10 minutes</strong>.
</p>

<p>
If you did not request this password reset,
please ignore this email.
</p>

<hr>

<p style="
color:#777;
font-size:13px;
">

Expense Tracker Pro

</p>

</div>

</body>
</html>
`;

    const response = await fetch(
        "https://api.brevo.com/v3/smtp/email",
        {
            method: "POST",

            headers: {
                "accept": "application/json",
                "Content-Type": "application/json",
                "api-key": BREVO_API_KEY
            },

            body: JSON.stringify({

                sender: {
                    name: BREVO_FROM_NAME,
                    email: BREVO_FROM_EMAIL
                },

                to: [
                    {
                        email: email,
                        name: userName || "User"
                    }
                ],

                subject:
                    "Expense Tracker Pro - Password Reset OTP",

                htmlContent: html,

                textContent:
                    `Your Expense Tracker Pro password reset OTP is ${otp}. This OTP is valid for 10 minutes.`
            })
        }
    );

    const data =
        await response.json();

    if (!response.ok) {

        console.error(
            "Brevo API Error:",
            data
        );

        throw new Error(
            data?.message ||
            data?.code ||
            "Brevo email failed"
        );
    }

    console.log(
        "Brevo Email Sent:",
        data.messageId
    );

    return data;
}

// ======================================================
// FORGOT PASSWORD
// ======================================================

async function forgotPassword(req, res) {

    try {

        const email =
            normalizeEmail(
                req.body.email
            );

        console.log(
            "FORGOT PASSWORD REQUEST:",
            email
        );

        if (!email) {

            return res.status(400).json({
                success: false,
                message:
                    "Email is required"
            });
        }

        if (!gmailRegex.test(email)) {

            return res.status(400).json({
                success: false,
                message:
                    "Only Gmail addresses are allowed"
            });
        }

        const [users] =
            await db.promise().query(
                `
                SELECT id, name, email
                FROM users
                WHERE LOWER(TRIM(email)) = ?
                LIMIT 1
                `,
                [email]
            );

        if (!users.length) {

            return res.status(404).json({
                success: false,
                message:
                    "Email not registered"
            });
        }

        const user = users[0];

        const otp =
            generateOTP();

        const expiresAt =
            new Date(
                Date.now() + 10 * 60 * 1000
            );

        // Delete previous OTP
        await db.promise().query(
            `
            DELETE FROM password_resets
            WHERE LOWER(TRIM(email)) = ?
            `,
            [email]
        );

        // Save new OTP
        const [result] =
            await db.promise().query(
                `
                INSERT INTO password_resets
                (email, otp, expires_at)
                VALUES (?, ?, ?)
                `,
                [
                    email,
                    otp,
                    expiresAt
                ]
            );

        console.log(
            "OTP SAVED:",
            result.insertId,
            "FOR:",
            email
        );

        try {

            console.log(
                "Sending OTP through Brevo..."
            );

            await sendOTPEmail(
                email,
                user.name,
                otp
            );

            console.log(
                "OTP SENT SUCCESSFULLY:",
                email
            );

            res.json({
                success: true,
                message:
                    "OTP sent successfully to your email"
            });

        } catch (emailError) {

            console.error(
                "EMAIL ERROR:",
                emailError.message
            );

            await db.promise().query(
                `
                DELETE FROM password_resets
                WHERE id = ?
                `,
                [result.insertId]
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to send OTP email",
                error:
                    emailError.message
            });
        }

    } catch (error) {

        console.error(
            "FORGOT PASSWORD ERROR:",
            error.message
        );

        res.status(500).json({
            success: false,
            message:
                "Database error",
            error:
                error.message
        });
    }
}

app.post(
    "/forgot-password",
    checkDatabase,
    forgotPassword
);

app.post(
    "/api/forgot-password",
    checkDatabase,
    forgotPassword
);

// ======================================================
// VERIFY OTP
// ======================================================

async function verifyResetOTP(req, res) {

    try {

        const email =
            normalizeEmail(
                req.body.email
            );

        const otp =
            String(
                req.body.otp || ""
            ).trim();

        if (!email || !otp) {

            return res.status(400).json({
                success: false,
                message:
                    "Email and OTP are required"
            });
        }

        const [results] =
            await db.promise().query(
                `
                SELECT
                    id,
                    email,
                    otp,
                    expires_at
                FROM password_resets
                WHERE LOWER(TRIM(email)) = ?
                ORDER BY id DESC
                LIMIT 1
                `,
                [email]
            );

        if (!results.length) {

            return res.status(400).json({
                success: false,
                message:
                    "OTP not found. Please request a new OTP."
            });
        }

        const resetData =
            results[0];

        const expiresAt =
            new Date(
                resetData.expires_at
            ).getTime();

        if (Date.now() > expiresAt) {

            await db.promise().query(
                `
                DELETE FROM password_resets
                WHERE id = ?
                `,
                [resetData.id]
            );

            return res.status(400).json({
                success: false,
                message:
                    "OTP expired. Please request a new OTP."
            });
        }

        if (
            String(resetData.otp) !==
            String(otp)
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid OTP"
            });
        }

        console.log(
            "OTP VERIFIED:",
            email
        );

        res.json({
            success: true,
            message:
                "OTP verified successfully"
        });

    } catch (error) {

        console.error(
            "VERIFY OTP ERROR:",
            error.message
        );

        res.status(500).json({
            success: false,
            message:
                "Database error",
            error:
                error.message
        });
    }
}

app.post(
    "/verify-reset-otp",
    checkDatabase,
    verifyResetOTP
);

app.post(
    "/api/verify-reset-otp",
    checkDatabase,
    verifyResetOTP
);

// ======================================================
// RESET PASSWORD
// ======================================================

async function resetPassword(req, res) {

    try {

        const email =
            normalizeEmail(
                req.body.email
            );

        const otp =
            String(
                req.body.otp || ""
            ).trim();

        const newPassword =
            String(
                req.body.newPassword || ""
            ).trim();

        if (
            !email ||
            !otp ||
            !newPassword
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Email, OTP and new password are required"
            });
        }

        if (!gmailRegex.test(email)) {

            return res.status(400).json({
                success: false,
                message:
                    "Only Gmail addresses are allowed"
            });
        }

        if (
            !passwordRegex.test(
                newPassword
            )
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Password must contain exactly 6 digits"
            });
        }

        const [results] =
            await db.promise().query(
                `
                SELECT
                    id,
                    email,
                    otp,
                    expires_at
                FROM password_resets
                WHERE LOWER(TRIM(email)) = ?
                ORDER BY id DESC
                LIMIT 1
                `,
                [email]
            );

        if (!results.length) {

            return res.status(400).json({
                success: false,
                message:
                    "OTP not found. Please request a new OTP."
            });
        }

        const resetData =
            results[0];

        if (
            Date.now() >
            new Date(
                resetData.expires_at
            ).getTime()
        ) {

            await db.promise().query(
                `
                DELETE FROM password_resets
                WHERE id = ?
                `,
                [resetData.id]
            );

            return res.status(400).json({
                success: false,
                message:
                    "OTP expired. Please request a new OTP."
            });
        }

        if (
            String(resetData.otp) !==
            String(otp)
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid OTP"
            });
        }

        const [result] =
            await db.promise().query(
                `
                UPDATE users
                SET password = ?
                WHERE LOWER(TRIM(email)) = ?
                LIMIT 1
                `,
                [
                    newPassword,
                    email
                ]
            );

        if (
            result.affectedRows === 0
        ) {

            return res.status(404).json({
                success: false,
                message:
                    "User not found"
            });
        }

        await db.promise().query(
            `
            DELETE FROM password_resets
            WHERE id = ?
            `,
            [resetData.id]
        );

        console.log(
            "PASSWORD RESET SUCCESS:",
            email
        );

        res.json({
            success: true,
            message:
                "Password reset successfully"
        });

    } catch (error) {

        console.error(
            "RESET PASSWORD ERROR:",
            error.message
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to reset password",
            error:
                error.message
        });
    }
}

app.post(
    "/reset-password",
    checkDatabase,
    resetPassword
);

app.post(
    "/api/reset-password",
    checkDatabase,
    resetPassword
);

// ======================================================
// DEBUG USER DATA
// ======================================================

app.get(
    "/api/debug/user/:email",
    checkDatabase,
    async (req, res) => {

        try {

            const email =
                normalizeEmail(
                    decodeURIComponent(
                        req.params.email
                    )
                );

            const [users] =
                await db.promise().query(
                    `
                    SELECT id, name, email
                    FROM users
                    WHERE LOWER(TRIM(email)) = ?
                    `,
                    [email]
                );

            const [expenses] =
                await db.promise().query(
                    `
                    SELECT *
                    FROM expenses
                    WHERE LOWER(TRIM(email)) = ?
                    ORDER BY id DESC
                    `,
                    [email]
                );

            const [income] =
                await db.promise().query(
                    `
                    SELECT *
                    FROM income
                    WHERE LOWER(TRIM(email)) = ?
                    ORDER BY id DESC
                    `,
                    [email]
                );

            res.json({
                success: true,
                email,
                users,
                expenses,
                income,

                counts: {
                    users: users.length,
                    expenses: expenses.length,
                    income: income.length
                }
            });

        } catch (error) {

            res.status(500).json({
                success: false,
                error:
                    error.message
            });
        }
    }
);

// ======================================================
// 404
// ======================================================

app.use((req, res) => {

    console.log(
        "404:",
        req.method,
        req.originalUrl
    );

    res.status(404).json({
        success: false,
        message:
            "API route not found",
        route:
            req.originalUrl
    });
});

// ======================================================
// ERROR HANDLER
// ======================================================

app.use(
    (err, req, res, next) => {

        console.error(
            "SERVER ERROR:",
            err.message
        );

        res.status(500).json({
            success: false,
            message:
                "Internal Server Error",
            error:
                err.message
        });
    }
);

// ======================================================
// START SERVER
// ======================================================

app.listen(
    PORT,
    "0.0.0.0",
    async () => {

        console.log(
            "======================================"
        );

        console.log(
            "Expense Tracker Server Started"
        );

        console.log(
            "Express Backend Ready"
        );

        console.log(
            "Server running on port:",
            PORT
        );

        console.log(
            "======================================"
        );

        await initializeDatabase();
    }
);