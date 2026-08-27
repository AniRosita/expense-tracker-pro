// ======================================================
// ============== EXPENSE TRACKER PRO SERVER ============
// ======================================================

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
    "https://expense-tracker-pro-production-b745.up.railway.app"
];

app.use((req, res, next) => {

    const origin = req.headers.origin;

    if (origin && allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
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

    res.setHeader(
        "Access-Control-Allow-Credentials",
        "true"
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

const db = mysql.createPool(dbConfig);

// ======================================================
// MYSQL CONNECTION TEST
// ======================================================

db.query(
    "SELECT DATABASE() AS database_name",
    (err, result) => {

        if (err) {

            console.error(
                "❌ MySQL Connection Failed:",
                err.message
            );

        } else {

            console.log("MySQL Connected ✅");

            console.log(
                "Database:",
                result[0]?.database_name
            );

            createRequiredTables();
        }
    }
);

// ======================================================
// CREATE REQUIRED TABLES
// ======================================================

function createRequiredTables() {

    // --------------------------------------------------
    // USERS
    // --------------------------------------------------

    const usersSQL = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL
        )
    `;

    db.query(usersSQL, (err) => {

        if (err) {
            console.error(
                "❌ Users table error:",
                err.message
            );
        } else {
            console.log("✅ users table ready");
        }

    });

    // --------------------------------------------------
    // EXPENSES
    // --------------------------------------------------

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

    db.query(expensesSQL, (err) => {

        if (err) {
            console.error(
                "❌ Expenses table error:",
                err.message
            );
        } else {
            console.log("✅ expenses table ready");
        }

    });

    // --------------------------------------------------
    // INCOME
    // --------------------------------------------------

    const incomeSQL = `
        CREATE TABLE IF NOT EXISTS income (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            date DATE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    db.query(incomeSQL, (err) => {

        if (err) {
            console.error(
                "❌ Income table error:",
                err.message
            );
        } else {
            console.log("✅ income table ready");
        }

    });

    // --------------------------------------------------
    // DELETED HISTORY
    // --------------------------------------------------

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

    db.query(historySQL, (err) => {

        if (err) {
            console.error(
                "❌ Deleted history table error:",
                err.message
            );
        } else {
            console.log("✅ deleted_history table ready");
        }

    });

    // --------------------------------------------------
    // PASSWORD RESETS
    // --------------------------------------------------

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

    db.query(passwordResetSQL, (err) => {

        if (err) {

            console.error(
                "❌ PASSWORD RESETS TABLE ERROR:",
                err.message
            );

        } else {

            console.log(
                "✅ password_resets table ready"
            );

        }

    });
}

// ======================================================
// DATABASE CHECK
// ======================================================

function checkDatabase(req, res, next) {

    db.query("SELECT 1", (err) => {

        if (err) {

            return res.status(500).json({

                success: false,
                message: "MySQL connection unavailable",
                error: err.message

            });

        }

        next();

    });
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

app.get("/api/status", (req, res) => {

    db.query(
        "SELECT DATABASE() AS database_name",
        (err, result) => {

            if (err) {

                return res.status(500).json({

                    success: false,
                    server: "running",
                    mysql: "disconnected",
                    error: err.message

                });

            }

            res.json({

                success: true,
                server: "running",
                mysql: "connected",

                database:
                    result[0]?.database_name,

                message:
                    "Expense Tracker API is working ✅"

            });

        }
    );

});

// ======================================================
// CORS TEST
// ======================================================

app.get("/api/cors-test", (req, res) => {

    res.json({

        success: true,
        message: "CORS is working ✅",
        origin: req.headers.origin || null

    });

});

// ======================================================
// DB TEST
// ======================================================

app.get("/api/test-db", (req, res) => {

    db.query(
        "SELECT DATABASE() AS database_name",
        (err, result) => {

            if (err) {

                return res.status(500).json({

                    success: false,
                    error: err.message

                });

            }

            res.json({

                success: true,

                database:
                    result[0]?.database_name

            });

        }
    );

});

// ======================================================
// VALIDATION
// ======================================================

const gmailRegex =
    /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

const passwordRegex =
    /^\d{6}$/;

// ======================================================
// REGISTER
// ======================================================

function registerUser(req, res) {

    const name =
        String(req.body.name || "").trim();

    const email =
        String(req.body.email || "")
            .trim()
            .toLowerCase();

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

    db.query(
        `
        INSERT INTO users
        (name, email, password)
        VALUES (?, ?, ?)
        `,
        [name, email, password],
        (err, result) => {

            if (err) {

                console.error(
                    "❌ REGISTER DATABASE ERROR:",
                    err.message
                );

                if (err.code === "ER_DUP_ENTRY") {

                    return res.status(409).json({

                        success: false,
                        message:
                            "Email already exists"

                    });

                }

                return res.status(500).json({

                    success: false,
                    message: "Database error",
                    error: err.message

                });

            }

            console.log(
                "✅ User registered:",
                email
            );

            res.status(201).json({

                success: true,
                message:
                    "Registration successful",

                userId:
                    result.insertId

            });

        }
    );
}

app.post("/api/register", registerUser);
app.post("/register", registerUser);

// ======================================================
// LOGIN
// ======================================================

function loginUser(req, res) {

    const email =
        String(req.body.email || "")
            .trim()
            .toLowerCase();

    const password =
        String(req.body.password || "").trim();

    if (!email || !password) {

        return res.status(400).json({

            success: false,
            message:
                "Email and password are required"

        });

    }

    db.query(
        `
        SELECT id, name, email, password
        FROM users
        WHERE LOWER(email)=?
        LIMIT 1
        `,
        [email],
        (err, results) => {

            if (err) {

                console.error(
                    "❌ LOGIN DATABASE ERROR:",
                    err.message
                );

                return res.status(500).json({

                    success: false,
                    message: "Database error",
                    error: err.message

                });

            }

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

        }
    );
}

app.post("/api/login", loginUser);
app.post("/login", loginUser);

// ======================================================
// GET USER
// ======================================================

app.get("/api/user/:email", (req, res) => {

    const email =
        decodeURIComponent(req.params.email)
            .trim()
            .toLowerCase();

    db.query(
        `
        SELECT id, name, email
        FROM users
        WHERE LOWER(email)=?
        LIMIT 1
        `,
        [email],
        (err, results) => {

            if (err) {

                return res.status(500).json({

                    success: false,
                    message: "Database error",
                    error: err.message

                });

            }

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

        }
    );
});

// ======================================================
// EXPENSES GET
// ======================================================

app.get("/expenses/:email", (req, res) => {

    const email =
        decodeURIComponent(req.params.email)
            .trim()
            .toLowerCase();

    db.query(
        `
        SELECT id, email, name, amount, category, date
        FROM expenses
        WHERE LOWER(email)=?
        ORDER BY date DESC, id DESC
        `,
        [email],
        (err, results) => {

            if (err) {

                return res.status(500).json({

                    success: false,
                    message:
                        "Unable to load expenses",
                    error: err.message

                });

            }

            res.json({

                success: true,
                expenses: results

            });

        }
    );
});

// ======================================================
// EXPENSES POST
// ======================================================

app.post("/expenses", (req, res) => {

    const {
        email,
        name,
        amount,
        category,
        date
    } = req.body;

    if (
        !email ||
        !name ||
        amount === undefined ||
        !category ||
        !date
    ) {

        return res.status(400).json({

            success: false,
            message:
                "Email, name, amount, category and date are required"

        });

    }

    db.query(
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
        ],
        (err, result) => {

            if (err) {

                return res.status(500).json({

                    success: false,
                    message:
                        "Unable to add expense",
                    error: err.message

                });

            }

            res.json({

                success: true,
                message:
                    "Expense added successfully",

                expenseId:
                    result.insertId

            });

        }
    );
});

// ======================================================
// EXPENSES PUT
// ======================================================

app.put("/expenses/:id", (req, res) => {

    const {
        name,
        amount,
        category,
        date
    } = req.body;

    if (
        !name ||
        amount === undefined ||
        !category ||
        !date
    ) {

        return res.status(400).json({

            success: false,
            message:
                "All expense fields are required"

        });

    }

    db.query(
        `
        UPDATE expenses
        SET name=?, amount=?, category=?, date=?
        WHERE id=?
        `,
        [
            name,
            amount,
            category,
            date,
            req.params.id
        ],
        (err, result) => {

            if (err) {

                return res.status(500).json({

                    success: false,
                    message:
                        "Unable to update expense",
                    error: err.message

                });

            }

            res.json({

                success: true,
                message:
                    "Expense updated successfully",

                affectedRows:
                    result.affectedRows

            });

        }
    );
});

// ======================================================
// EXPENSES DELETE
// ======================================================

app.delete("/expenses/:id", (req, res) => {

    const id = req.params.id;

    db.query(
        "SELECT * FROM expenses WHERE id=? LIMIT 1",
        [id],
        (err, results) => {

            if (err) {

                return res.status(500).json({

                    success: false,
                    message:
                        "Unable to find expense",
                    error: err.message

                });

            }

            if (!results.length) {

                return res.status(404).json({

                    success: false,
                    message:
                        "Expense not found"

                });

            }

            const expense = results[0];

            db.query(
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
                ],
                (historyErr) => {

                    if (historyErr) {

                        return res.status(500).json({

                            success: false,
                            message:
                                "Unable to save deleted expense history",
                            error:
                                historyErr.message

                        });

                    }

                    db.query(
                        "DELETE FROM expenses WHERE id=?",
                        [id],
                        (deleteErr, result) => {

                            if (deleteErr) {

                                return res.status(500).json({

                                    success: false,
                                    message:
                                        "Unable to delete expense",
                                    error:
                                        deleteErr.message

                                });

                            }

                            res.json({

                                success: true,

                                message:
                                    "Expense deleted and saved to history successfully",

                                affectedRows:
                                    result.affectedRows

                            });

                        }
                    );

                }
            );

        }
    );
});

// ======================================================
// INCOME GET
// ======================================================

app.get("/income/:email", (req, res) => {

    const email =
        decodeURIComponent(req.params.email)
            .trim()
            .toLowerCase();

    db.query(
        `
        SELECT id, email, amount, date
        FROM income
        WHERE LOWER(email)=?
        ORDER BY date DESC, id DESC
        `,
        [email],
        (err, results) => {

            if (err) {

                return res.status(500).json({

                    success: false,
                    message:
                        "Unable to load income",
                    error: err.message

                });

            }

            res.json({

                success: true,
                income: results

            });

        }
    );
});

// ======================================================
// INCOME POST
// ======================================================

app.post("/income", (req, res) => {

    const {
        email,
        amount,
        date
    } = req.body;

    if (
        !email ||
        amount === undefined ||
        !date
    ) {

        return res.status(400).json({

            success: false,
            message:
                "Email, amount and date are required"

        });

    }

    db.query(
        `
        INSERT INTO income
        (email, amount, date)
        VALUES (?, ?, ?)
        `,
        [
            email,
            amount,
            date
        ],
        (err, result) => {

            if (err) {

                return res.status(500).json({

                    success: false,
                    message:
                        "Unable to add income",
                    error: err.message

                });

            }

            res.json({

                success: true,
                message:
                    "Income added successfully",

                incomeId:
                    result.insertId

            });

        }
    );
});

// ======================================================
// INCOME PUT
// ======================================================

app.put("/income/:id", (req, res) => {

    const {
        amount,
        date
    } = req.body;

    if (
        amount === undefined ||
        !date
    ) {

        return res.status(400).json({

            success: false,
            message:
                "Amount and date are required"

        });

    }

    db.query(
        `
        UPDATE income
        SET amount=?, date=?
        WHERE id=?
        `,
        [
            amount,
            date,
            req.params.id
        ],
        (err, result) => {

            if (err) {

                return res.status(500).json({

                    success: false,
                    message:
                        "Unable to update income",
                    error: err.message

                });

            }

            res.json({

                success: true,
                message:
                    "Income updated successfully",

                affectedRows:
                    result.affectedRows

            });

        }
    );
});

// ======================================================
// INCOME DELETE
// ======================================================

app.delete("/income/:id", (req, res) => {

    const id = req.params.id;

    db.query(
        "SELECT * FROM income WHERE id=? LIMIT 1",
        [id],
        (err, results) => {

            if (err) {

                return res.status(500).json({

                    success: false,
                    message:
                        "Unable to find income",
                    error: err.message

                });

            }

            if (!results.length) {

                return res.status(404).json({

                    success: false,
                    message:
                        "Income not found"

                });

            }

            const income = results[0];

            db.query(
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
                ],
                (historyErr) => {

                    if (historyErr) {

                        return res.status(500).json({

                            success: false,
                            message:
                                "Unable to save deleted income history",
                            error:
                                historyErr.message

                        });

                    }

                    db.query(
                        "DELETE FROM income WHERE id=?",
                        [id],
                        (deleteErr, result) => {

                            if (deleteErr) {

                                return res.status(500).json({

                                    success: false,
                                    message:
                                        "Unable to delete income",
                                    error:
                                        deleteErr.message

                                });

                            }

                            res.json({

                                success: true,

                                message:
                                    "Income deleted and saved to history successfully",

                                affectedRows:
                                    result.affectedRows

                            });

                        }
                    );

                }
            );

        }
    );
});

// ======================================================
// TRASH GET
// ======================================================

app.get("/trash/:email", (req, res) => {

    const email =
        decodeURIComponent(req.params.email)
            .trim()
            .toLowerCase();

    db.query(
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
        WHERE LOWER(email)=?
        ORDER BY deleted_at DESC, id DESC
        `,
        [email],
        (err, results) => {

            if (err) {

                return res.status(500).json({

                    success: false,
                    message:
                        "Unable to load delete history",
                    error: err.message

                });

            }

            res.json({

                success: true,
                trash: results

            });

        }
    );
});

// ======================================================
// TRASH RESTORE
// ======================================================

app.post("/trash/restore/:id", (req, res) => {

    const id = req.params.id;

    db.query(
        "SELECT * FROM deleted_history WHERE id=? LIMIT 1",
        [id],
        (err, results) => {

            if (err) {

                return res.status(500).json({

                    success: false,
                    message:
                        "Unable to find deleted record",
                    error: err.message

                });

            }

            if (!results.length) {

                return res.status(404).json({

                    success: false,
                    message:
                        "Deleted record not found"

                });

            }

            const item = results[0];

            if (item.type === "expense") {

                db.query(
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
                    ],
                    (insertErr, result) => {

                        if (insertErr) {

                            return res.status(500).json({

                                success: false,
                                message:
                                    "Unable to restore expense",
                                error:
                                    insertErr.message

                            });

                        }

                        db.query(
                            "DELETE FROM deleted_history WHERE id=?",
                            [id],
                            () => {

                                res.json({

                                    success: true,
                                    message:
                                        "Expense restored successfully",

                                    expenseId:
                                        result.insertId

                                });

                            }
                        );

                    }
                );

                return;
            }

            if (item.type === "income") {

                db.query(
                    `
                    INSERT INTO income
                    (email, amount, date)
                    VALUES (?, ?, ?)
                    `,
                    [
                        item.email,
                        item.amount,
                        item.date
                    ],
                    (insertErr, result) => {

                        if (insertErr) {

                            return res.status(500).json({

                                success: false,
                                message:
                                    "Unable to restore income",
                                error:
                                    insertErr.message

                            });

                        }

                        db.query(
                            "DELETE FROM deleted_history WHERE id=?",
                            [id],
                            () => {

                                res.json({

                                    success: true,
                                    message:
                                        "Income restored successfully",

                                    incomeId:
                                        result.insertId

                                });

                            }
                        );

                    }
                );

                return;
            }

            res.status(400).json({

                success: false,
                message:
                    "Unknown history record type"

            });

        }
    );
});

// ======================================================
// TRASH CLEANUP
// ======================================================

app.delete("/trash/cleanup", (req, res) => {

    db.query(
        `
        DELETE FROM deleted_history
        WHERE deleted_at < NOW() - INTERVAL 60 DAY
        `,
        (err, result) => {

            if (err) {

                return res.status(500).json({

                    success: false,
                    message:
                        "Unable to clean old history",
                    error: err.message

                });

            }

            res.json({

                success: true,

                message:
                    "Old deleted records cleaned successfully",

                deletedRows:
                    result.affectedRows

            });

        }
    );
});

// ======================================================
// ALL USER DATA
// ======================================================

app.get("/api/data/:email", (req, res) => {

    const email =
        decodeURIComponent(req.params.email)
            .trim()
            .toLowerCase();

    db.query(
        `
        SELECT
            id,
            email,
            name,
            amount,
            category,
            date
        FROM expenses
        WHERE LOWER(email)=?
        ORDER BY date DESC, id DESC
        `,
        [email],
        (expenseErr, expenses) => {

            if (expenseErr) {

                return res.status(500).json({

                    success: false,
                    message:
                        "Unable to load expenses",
                    error:
                        expenseErr.message

                });

            }

            db.query(
                `
                SELECT
                    id,
                    email,
                    amount,
                    date
                FROM income
                WHERE LOWER(email)=?
                ORDER BY date DESC, id DESC
                `,
                [email],
                (incomeErr, income) => {

                    if (incomeErr) {

                        return res.status(500).json({

                            success: false,
                            message:
                                "Unable to load income",
                            error:
                                incomeErr.message

                        });

                    }

                    res.json({

                        success: true,
                        expenses,
                        income

                    });

                }
            );

        }
    );
});

// ======================================================
// RESEND CONFIG
// ======================================================

const RESEND_API_KEY =
    process.env.RESEND_API_KEY;

console.log("======================================");
console.log("EMAIL CONFIG");

if (RESEND_API_KEY) {

    console.log(
        "Resend API Key: configured ✅"
    );

} else {

    console.log(
        "Resend API Key: MISSING ❌"
    );

}

console.log("======================================");

// ======================================================
// OTP GENERATOR
// ======================================================

function generateOTP() {

    return Math.floor(
        100000 +
        Math.random() * 900000
    ).toString();

}

// ======================================================
// SEND OTP EMAIL
// ======================================================

async function sendOTPEmail(
    email,
    userName,
    otp
) {

    if (!RESEND_API_KEY) {

        throw new Error(
            "RESEND_API_KEY is missing in Railway Variables"
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
        "https://api.resend.com/emails",
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json",

                "Authorization":
                    `Bearer ${RESEND_API_KEY}`
            },

            body: JSON.stringify({

                from:
                    "Expense Tracker Pro <onboarding@resend.dev>",

                to: [email],

                subject:
                    "Expense Tracker Pro - Password Reset OTP",

                html

            })
        }
    );

    const data =
        await response.json();

    if (!response.ok) {

        console.error(
            "❌ Resend API Error:",
            data
        );

        throw new Error(
            data?.message ||
            data?.error ||
            "Resend email failed"
        );

    }

    console.log(
        "✅ Resend Email ID:",
        data.id
    );

    return data;
}

// ======================================================
// FORGOT PASSWORD
// ======================================================

async function forgotPassword(req, res) {

    const email =
        String(req.body.email || "")
            .trim()
            .toLowerCase();

    console.log(
        "📧 Forgot Password:",
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

    // --------------------------------------------------
    // CHECK USER
    // --------------------------------------------------

    db.query(
        `
        SELECT id, name, email
        FROM users
        WHERE LOWER(email)=?
        LIMIT 1
        `,
        [email],
        async (err, results) => {

            if (err) {

                console.error(
                    "❌ FORGOT PASSWORD DATABASE ERROR:",
                    err.message
                );

                return res.status(500).json({

                    success: false,
                    message:
                        "Database error",
                    error:
                        err.message

                });

            }

            if (!results.length) {

                return res.status(404).json({

                    success: false,
                    message:
                        "Email not registered"

                });

            }

            const user = results[0];

            const otp =
                generateOTP();

            const expiresAt =
                new Date(
                    Date.now() +
                    10 * 60 * 1000
                );

            console.log(
                "🔢 Generated OTP for:",
                email
            );

            // --------------------------------------------------
            // DELETE OLD OTP
            // --------------------------------------------------

            db.query(
                `
                DELETE FROM password_resets
                WHERE LOWER(email)=?
                `,
                [email],
                async (deleteErr) => {

                    if (deleteErr) {

                        console.error(
                            "❌ OTP DELETE ERROR:",
                            deleteErr.message
                        );

                        return res.status(500).json({

                            success: false,
                            message:
                                "Unable to prepare OTP",
                            error:
                                deleteErr.message

                        });

                    }

                    // --------------------------------------------------
                    // INSERT NEW OTP
                    // --------------------------------------------------

                    db.query(
                        `
                        INSERT INTO password_resets
                        (email, otp, expires_at)
                        VALUES (?, ?, ?)
                        `,
                        [
                            email,
                            otp,
                            expiresAt
                        ],
                        async (insertErr, result) => {

                            if (insertErr) {

                                console.error(
                                    "❌ OTP INSERT ERROR:",
                                    insertErr.message
                                );

                                return res.status(500).json({

                                    success: false,
                                    message:
                                        "Unable to save OTP",
                                    error:
                                        insertErr.message

                                });

                            }

                            console.log(
                                "✅ OTP SAVED IN DATABASE"
                            );

                            console.log(
                                "OTP ID:",
                                result.insertId
                            );

                            console.log(
                                "OTP Email:",
                                email
                            );

                            try {

                                console.log(
                                    "📤 Sending OTP through Resend..."
                                );

                                await sendOTPEmail(
                                    email,
                                    user.name,
                                    otp
                                );

                                console.log(
                                    "✅ OTP sent successfully:",
                                    email
                                );

                                res.json({

                                    success: true,

                                    message:
                                        "OTP sent successfully to your email"

                                });

                            } catch (error) {

                                console.error(
                                    "❌ Email Error:",
                                    error.message
                                );

                                // Email failed -> remove OTP
                                db.query(
                                    `
                                    DELETE FROM password_resets
                                    WHERE id=?
                                    `,
                                    [result.insertId]
                                );

                                return res.status(500).json({

                                    success: false,

                                    message:
                                        "Unable to send OTP email",

                                    error:
                                        error.message

                                });

                            }

                        }
                    );

                }
            );

        }
    );
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

function verifyResetOTP(req, res) {

    const email =
        String(req.body.email || "")
            .trim()
            .toLowerCase();

    const otp =
        String(req.body.otp || "")
            .trim();

    console.log(
        "🔐 Verifying OTP..."
    );

    console.log(
        "Email:",
        email
    );

    console.log(
        "OTP received:",
        otp
    );

    if (!email || !otp) {

        return res.status(400).json({

            success: false,
            message:
                "Email and OTP are required"

        });

    }

    db.query(
        `
        SELECT
            id,
            email,
            otp,
            expires_at
        FROM password_resets
        WHERE LOWER(email)=?
        ORDER BY id DESC
        LIMIT 1
        `,
        [email],
        (err, results) => {

            if (err) {

                console.error(
                    "❌ VERIFY OTP DATABASE ERROR:",
                    err.message
                );

                return res.status(500).json({

                    success: false,
                    message:
                        "Database error",
                    error:
                        err.message

                });

            }

            console.log(
                "OTP rows found:",
                results.length
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

            if (
                Date.now() >
                expiresAt
            ) {

                db.query(
                    `
                    DELETE FROM password_resets
                    WHERE id=?
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
                "✅ OTP VERIFIED:",
                email
            );

            res.json({

                success: true,

                message:
                    "OTP verified successfully"

            });

        }
    );
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

function resetPassword(req, res) {

    const email =
        String(req.body.email || "")
            .trim()
            .toLowerCase();

    const otp =
        String(req.body.otp || "")
            .trim();

    const newPassword =
        String(req.body.newPassword || "")
            .trim();

    console.log(
        "🔑 Reset Password:",
        email
    );

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

    if (!passwordRegex.test(newPassword)) {

        return res.status(400).json({

            success: false,
            message:
                "Password must contain exactly 6 digits"

        });

    }

    db.query(
        `
        SELECT
            id,
            email,
            otp,
            expires_at
        FROM password_resets
        WHERE LOWER(email)=?
        ORDER BY id DESC
        LIMIT 1
        `,
        [email],
        (otpErr, results) => {

            if (otpErr) {

                console.error(
                    "❌ RESET OTP DATABASE ERROR:",
                    otpErr.message
                );

                return res.status(500).json({

                    success: false,
                    message:
                        "Database error",
                    error:
                        otpErr.message

                });

            }

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

                db.query(
                    `
                    DELETE FROM password_resets
                    WHERE id=?
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

            // --------------------------------------------------
            // UPDATE PASSWORD
            // --------------------------------------------------

            db.query(
                `
                UPDATE users
                SET password=?
                WHERE LOWER(email)=?
                LIMIT 1
                `,
                [
                    newPassword,
                    email
                ],
                (err, result) => {

                    if (err) {

                        console.error(
                            "❌ RESET PASSWORD DATABASE ERROR:",
                            err.message
                        );

                        return res.status(500).json({

                            success: false,
                            message:
                                "Unable to reset password",
                            error:
                                err.message

                        });

                    }

                    if (
                        result.affectedRows === 0
                    ) {

                        return res.status(404).json({

                            success: false,
                            message:
                                "User not found"

                        });

                    }

                    // --------------------------------------------------
                    // DELETE USED OTP
                    // --------------------------------------------------

                    db.query(
                        `
                        DELETE FROM password_resets
                        WHERE id=?
                        `,
                        [resetData.id],
                        () => {

                            console.log(
                                "✅ PASSWORD RESET SUCCESS:",
                                email
                            );

                            res.json({

                                success: true,

                                message:
                                    "Password reset successfully"

                            });

                        }
                    );

                }
            );

        }
    );
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
            "❌ SERVER ERROR:",
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
    () => {

        console.log(
            "======================================"
        );

        console.log(
            "Expense Tracker Server Started 🚀"
        );

        console.log(
            "Express Backend Ready ✅"
        );

        console.log(
            "Server running on port:",
            PORT
        );

        console.log(
            "Resend Email API ready 📧"
        );

        console.log(
            "======================================"
        );

    }
);