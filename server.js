// ======================================================
// ============== EXPENSE TRACKER PRO SERVER ============
// ======================================================

const express = require("express");
const mysql = require("mysql2");
const path = require("path");
const nodemailer = require("nodemailer");

const app = express();

// ======================================================
// ================= PORT ================================
// ======================================================

const PORT = Number(process.env.PORT) || 5000;

// ======================================================
// ================= CORS ================================
// ======================================================

// Frontend Railway URL
const allowedOrigins = [
    "https://expense-tracker-pro-production-98cf.up.railway.app"
];

// CORS middleware
app.use((req, res, next) => {

    const origin = req.headers.origin;

    // Allow requests without Origin
    if (!origin) {
        return next();
    }

    // Allow registered frontend
    if (allowedOrigins.includes(origin)) {

        res.header(
            "Access-Control-Allow-Origin",
            origin
        );

        res.header(
            "Vary",
            "Origin"
        );

        res.header(
            "Access-Control-Allow-Credentials",
            "true"
        );

        res.header(
            "Access-Control-Allow-Methods",
            "GET,POST,PUT,DELETE,OPTIONS"
        );

        res.header(
            "Access-Control-Allow-Headers",
            "Content-Type, Authorization"
        );

    } else {

        console.log(
            "❌ CORS blocked:",
            origin
        );

    }

    // IMPORTANT:
    // Express 5 compatible OPTIONS handling
    if (req.method === "OPTIONS") {

        if (allowedOrigins.includes(origin)) {

            return res.sendStatus(204);

        }

        return res.sendStatus(403);
    }

    next();
});

// ======================================================
// ================= BODY PARSER =========================
// ======================================================

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);

// ======================================================
// ================= STATIC FILES ========================
// ======================================================

app.use(
    express.static(__dirname)
);

// ======================================================
// ================= MYSQL CONNECTION ====================
// ======================================================

let db;

try {

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
            "Rosi@2006",

        database:
            process.env.MYSQLDATABASE ||
            process.env.MYSQL_DATABASE ||
            "expense_tracker",

        port:
            Number(
                process.env.MYSQLPORT ||
                process.env.MYSQL_PORT ||
                3306
            ),

        waitForConnections: true,

        connectionLimit: 10,

        queueLimit: 0,

        enableKeepAlive: true,

        keepAliveInitialDelay: 0
    };

    console.log("======================================");
    console.log("MYSQL CONFIG");
    console.log("Host:", dbConfig.host);
    console.log("Port:", dbConfig.port);
    console.log("Database:", dbConfig.database);
    console.log("User:", dbConfig.user);
    console.log("======================================");

    db = mysql.createPool(dbConfig);

} catch (error) {

    console.error(
        "❌ MySQL Pool Creation Error:",
        error.message
    );

}

// ======================================================
// ================= TEST MYSQL ==========================
// ======================================================

if (db) {

    db.query(
        "SELECT DATABASE() AS database_name",
        (err, result) => {

            if (err) {

                console.error(
                    "❌ MySQL Connection Failed:",
                    err.message
                );

            } else {

                console.log("======================================");
                console.log("MySQL Connected ✅");
                console.log(
                    "Database:",
                    result[0]?.database_name
                );
                console.log("======================================");

            }

        }
    );

}

// ======================================================
// ================= EMAIL CONFIG ========================
// ======================================================

const transporter =
    nodemailer.createTransport({

        service: "gmail",

        auth: {

            user:
                process.env.EMAIL_USER,

            pass:
                process.env.EMAIL_PASS

        }

    });

// ======================================================
// ================= OTP STORAGE =========================
// ======================================================

const resetOTPs = new Map();

// ======================================================
// ================= GENERATE OTP ========================
// ======================================================

function generateOTP() {

    return Math.floor(
        100000 +
        Math.random() * 900000
    ).toString();

}

// ======================================================
// ================= DATABASE CHECK ======================
// ======================================================

function checkDatabase(req, res, next) {

    if (!db) {

        return res.status(500).json({

            success: false,

            message:
                "MySQL connection is not available"

        });

    }

    next();
}

app.use(
    "/api",
    checkDatabase
);

app.use(
    "/expenses",
    checkDatabase
);

app.use(
    "/income",
    checkDatabase
);

app.use(
    "/trash",
    checkDatabase
);

// ======================================================
// ================= HOME ROUTE ==========================
// ======================================================

app.get(
    "/",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "index.html"
            )
        );

    }
);

// ======================================================
// ================= STATUS API ==========================
// ======================================================

app.get(
    "/api/status",
    (req, res) => {

        db.query(
            "SELECT DATABASE() AS database_name",
            (err, result) => {

                if (err) {

                    return res.status(500).json({

                        success: false,

                        server: "running",

                        mysql: "disconnected",

                        error:
                            err.message

                    });

                }

                return res.json({

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

    }
);

// ======================================================
// ================= TEST DATABASE =======================
// ======================================================

app.get(
    "/api/test-db",
    (req, res) => {

        db.query(
            "SELECT DATABASE() AS database_name",
            (err, result) => {

                if (err) {

                    return res.status(500).json({

                        success: false,

                        error:
                            err.message

                    });

                }

                return res.json({

                    success: true,

                    database:
                        result[0]?.database_name

                });

            }
        );

    }
);

// ======================================================
// ================= REGISTER ============================
// ======================================================

function registerUser(req, res) {

    const name =
        String(
            req.body.name || ""
        )
        .trim();

    const email =
        String(
            req.body.email || ""
        )
        .trim()
        .toLowerCase();

    const password =
        String(
            req.body.password || ""
        )
        .trim();

    console.log("======================================");
    console.log("REGISTER REQUEST");
    console.log("Name:", name);
    console.log("Email:", email);
    console.log("======================================");

    if (!name || !email || !password) {

        return res.status(400).json({

            success: false,

            message:
                "All fields are required"

        });

    }

    // Gmail validation
    if (
        !/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email)
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Only Gmail addresses are allowed"

        });

    }

    // 6 digit password
    if (
        !/^\d{6}$/.test(password)
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Password must contain exactly 6 digits"

        });

    }

    const sql = `
        INSERT INTO users
        (
            name,
            email,
            password
        )
        VALUES (?, ?, ?)
    `;

    db.query(
        sql,
        [
            name,
            email,
            password
        ],
        (err, result) => {

            if (err) {

                console.error(
                    "❌ REGISTER DATABASE ERROR:",
                    err.message
                );

                if (
                    err.code === "ER_DUP_ENTRY"
                ) {

                    return res.status(409).json({

                        success: false,

                        message:
                            "Email already exists"

                    });

                }

                return res.status(500).json({

                    success: false,

                    message:
                        "Database error",

                    error:
                        err.message

                });

            }

            console.log(
                "✅ User registered:",
                email
            );

            return res.status(201).json({

                success: true,

                message:
                    "Registration successful",

                userId:
                    result.insertId

            });

        }
    );
}

// ======================================================
// ================= REGISTER ROUTES =====================
// ======================================================

app.post(
    "/api/register",
    registerUser
);

app.post(
    "/register",
    registerUser
);

// ======================================================
// ================= LOGIN ===============================
// ======================================================

function loginUser(req, res) {

    const email =
        String(
            req.body.email || ""
        )
        .trim()
        .toLowerCase();

    const password =
        String(
            req.body.password || ""
        )
        .trim();

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

    db.query(
        `
        SELECT
            id,
            name,
            email,
            password
        FROM users
        WHERE LOWER(email) = ?
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

                    message:
                        "Database error",

                    error:
                        err.message

                });

            }

            if (
                !results ||
                results.length === 0
            ) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Invalid email or password"

                });

            }

            const user =
                results[0];

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

            return res.json({

                success: true,

                message:
                    "Login successful",

                user: {

                    id:
                        user.id,

                    name:
                        user.name,

                    email:
                        user.email

                }

            });

        }
    );
}

// ======================================================
// ================= LOGIN ROUTES ========================
// ======================================================

app.post(
    "/api/login",
    loginUser
);

app.post(
    "/login",
    loginUser
);

// ======================================================
// ================= GET USER ============================
// ======================================================

app.get(
    "/api/user/:email",
    (req, res) => {

        const email =
            decodeURIComponent(
                req.params.email
            )
            .trim()
            .toLowerCase();

        db.query(
            `
            SELECT
                id,
                name,
                email
            FROM users
            WHERE LOWER(email) = ?
            LIMIT 1
            `,
            [email],
            (err, results) => {

                if (err) {

                    return res.status(500).json({

                        success: false,

                        message:
                            "Database error",

                        error:
                            err.message

                    });

                }

                if (
                    results.length === 0
                ) {

                    return res.status(404).json({

                        success: false,

                        message:
                            "User not found"

                    });

                }

                return res.json({

                    success: true,

                    user:
                        results[0]

                });

            }
        );

    }
);

// ======================================================
// ================= GET EXPENSES ========================
// ======================================================

app.get(
    "/expenses/:email",
    (req, res) => {

        const email =
            decodeURIComponent(
                req.params.email
            )
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
            WHERE LOWER(email) = ?
            ORDER BY date DESC, id DESC
            `,
            [email],
            (err, results) => {

                if (err) {

                    console.error(
                        "❌ Get Expenses Error:",
                        err.message
                    );

                    return res.status(500).json({

                        success: false,

                        message:
                            "Unable to load expenses",

                        error:
                            err.message

                    });

                }

                return res.json({

                    success: true,

                    expenses:
                        results

                });

            }
        );

    }
);

// ======================================================
// ================= ADD EXPENSE =========================
// ======================================================

app.post(
    "/expenses",
    (req, res) => {

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
            (
                email,
                name,
                amount,
                category,
                date
            )
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

                    console.error(
                        "❌ Add Expense Error:",
                        err.message
                    );

                    return res.status(500).json({

                        success: false,

                        message:
                            "Unable to add expense",

                        error:
                            err.message

                    });

                }

                return res.json({

                    success: true,

                    message:
                        "Expense added successfully",

                    expenseId:
                        result.insertId

                });

            }
        );

    }
);

// ======================================================
// ================= UPDATE EXPENSE ======================
// ======================================================

app.put(
    "/expenses/:id",
    (req, res) => {

        const id =
            req.params.id;

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
            ],
            (err, result) => {

                if (err) {

                    return res.status(500).json({

                        success: false,

                        message:
                            "Unable to update expense",

                        error:
                            err.message

                    });

                }

                return res.json({

                    success: true,

                    message:
                        "Expense updated successfully",

                    affectedRows:
                        result.affectedRows

                });

            }
        );

    }
);

// ======================================================
// ================= DELETE EXPENSE ======================
// ======================================================

app.delete(
    "/expenses/:id",
    (req, res) => {

        const id =
            req.params.id;

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
            WHERE id = ?
            LIMIT 1
            `,
            [id],
            (selectErr, results) => {

                if (selectErr) {

                    return res.status(500).json({

                        success: false,

                        message:
                            "Unable to find expense",

                        error:
                            selectErr.message

                    });

                }

                if (
                    results.length === 0
                ) {

                    return res.status(404).json({

                        success: false,

                        message:
                            "Expense not found"

                    });

                }

                const expense =
                    results[0];

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
                            `
                            DELETE FROM expenses
                            WHERE id = ?
                            `,
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

                                return res.json({

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

    }
);

// ======================================================
// ================= GET INCOME ==========================
// ======================================================

app.get(
    "/income/:email",
    (req, res) => {

        const email =
            decodeURIComponent(
                req.params.email
            )
            .trim()
            .toLowerCase();

        db.query(
            `
            SELECT
                id,
                email,
                amount,
                date
            FROM income
            WHERE LOWER(email) = ?
            ORDER BY date DESC, id DESC
            `,
            [email],
            (err, results) => {

                if (err) {

                    return res.status(500).json({

                        success: false,

                        message:
                            "Unable to load income",

                        error:
                            err.message

                    });

                }

                return res.json({

                    success: true,

                    income:
                        results

                });

            }
        );

    }
);

// ======================================================
// ================= ADD INCOME ==========================
// ======================================================

app.post(
    "/income",
    (req, res) => {

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
            (
                email,
                amount,
                date
            )
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

                        error:
                            err.message

                    });

                }

                return res.json({

                    success: true,

                    message:
                        "Income added successfully",

                    incomeId:
                        result.insertId

                });

            }
        );

    }
);

// ======================================================
// ================= UPDATE INCOME =======================
// ======================================================

app.put(
    "/income/:id",
    (req, res) => {

        const id =
            req.params.id;

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
            SET
                amount = ?,
                date = ?
            WHERE id = ?
            `,
            [
                amount,
                date,
                id
            ],
            (err, result) => {

                if (err) {

                    return res.status(500).json({

                        success: false,

                        message:
                            "Unable to update income",

                        error:
                            err.message

                    });

                }

                return res.json({

                    success: true,

                    message:
                        "Income updated successfully",

                    affectedRows:
                        result.affectedRows

                });

            }
        );

    }
);

// ======================================================
// ================= DELETE INCOME =======================
// ======================================================

app.delete(
    "/income/:id",
    (req, res) => {

        const id =
            req.params.id;

        db.query(
            `
            SELECT
                id,
                email,
                amount,
                date
            FROM income
            WHERE id = ?
            LIMIT 1
            `,
            [id],
            (selectErr, results) => {

                if (selectErr) {

                    return res.status(500).json({

                        success: false,

                        message:
                            "Unable to find income",

                        error:
                            selectErr.message

                    });

                }

                if (
                    results.length === 0
                ) {

                    return res.status(404).json({

                        success: false,

                        message:
                            "Income not found"

                    });

                }

                const income =
                    results[0];

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
                            `
                            DELETE FROM income
                            WHERE id = ?
                            `,
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

                                return res.json({

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

    }
);

// ======================================================
// ================= GET DELETE HISTORY =================
// ======================================================

app.get(
    "/trash/:email",
    (req, res) => {

        const email =
            decodeURIComponent(
                req.params.email
            )
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
            WHERE LOWER(email) = ?
            ORDER BY deleted_at DESC, id DESC
            `,
            [email],
            (err, results) => {

                if (err) {

                    console.error(
                        "❌ Get Trash Error:",
                        err.message
                    );

                    return res.status(500).json({

                        success: false,

                        message:
                            "Unable to load delete history",

                        error:
                            err.message

                    });

                }

                return res.json({

                    success: true,

                    trash:
                        results

                });

            }
        );

    }
);

// ======================================================
// ================= RESTORE TRASH =======================
// ======================================================

app.post(
    "/trash/restore/:id",
    (req, res) => {

        const id =
            req.params.id;

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
                date
            FROM deleted_history
            WHERE id = ?
            LIMIT 1
            `,
            [id],
            (selectErr, results) => {

                if (selectErr) {

                    return res.status(500).json({

                        success: false,

                        message:
                            "Unable to find deleted record",

                        error:
                            selectErr.message

                    });

                }

                if (
                    results.length === 0
                ) {

                    return res.status(404).json({

                        success: false,

                        message:
                            "Deleted record not found"

                    });

                }

                const item =
                    results[0];

                // -----------------------------
                // RESTORE EXPENSE
                // -----------------------------

                if (
                    item.type === "expense"
                ) {

                    db.query(
                        `
                        INSERT INTO expenses
                        (
                            email,
                            name,
                            amount,
                            category,
                            date
                        )
                        VALUES (?, ?, ?, ?, ?)
                        `,
                        [
                            item.email,
                            item.name,
                            item.amount,
                            item.category,
                            item.date
                        ],
                        (insertErr, insertResult) => {

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
                                `
                                DELETE FROM deleted_history
                                WHERE id = ?
                                `,
                                [id],
                                (deleteErr) => {

                                    if (deleteErr) {

                                        return res.status(500).json({

                                            success: false,

                                            message:
                                                "Expense restored but history removal failed",

                                            error:
                                                deleteErr.message

                                        });

                                    }

                                    return res.json({

                                        success: true,

                                        message:
                                            "Expense restored successfully",

                                        expenseId:
                                            insertResult.insertId

                                    });

                                }
                            );

                        }
                    );

                    return;
                }

                // -----------------------------
                // RESTORE INCOME
                // -----------------------------

                if (
                    item.type === "income"
                ) {

                    db.query(
                        `
                        INSERT INTO income
                        (
                            email,
                            amount,
                            date
                        )
                        VALUES (?, ?, ?)
                        `,
                        [
                            item.email,
                            item.amount,
                            item.date
                        ],
                        (insertErr, insertResult) => {

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
                                `
                                DELETE FROM deleted_history
                                WHERE id = ?
                                `,
                                [id],
                                (deleteErr) => {

                                    if (deleteErr) {

                                        return res.status(500).json({

                                            success: false,

                                            message:
                                                "Income restored but history removal failed",

                                            error:
                                                deleteErr.message

                                        });

                                    }

                                    return res.json({

                                        success: true,

                                        message:
                                            "Income restored successfully",

                                        incomeId:
                                            insertResult.insertId

                                    });

                                }
                            );

                        }
                    );

                    return;
                }

                return res.status(400).json({

                    success: false,

                    message:
                        "Unknown history record type"

                });

            }
        );

    }
);

// ======================================================
// ================= CLEAN HISTORY =======================
// ======================================================

app.delete(
    "/trash/cleanup",
    (req, res) => {

        db.query(
            `
            DELETE FROM deleted_history
            WHERE deleted_at <
            NOW() - INTERVAL 60 DAY
            `,
            (err, result) => {

                if (err) {

                    return res.status(500).json({

                        success: false,

                        message:
                            "Unable to clean old history",

                        error:
                            err.message

                    });

                }

                return res.json({

                    success: true,

                    message:
                        "Old deleted records cleaned successfully",

                    deletedRows:
                        result.affectedRows

                });

            }
        );

    }
);

// ======================================================
// ================= ALL USER DATA =======================
// ======================================================

app.get(
    "/api/data/:email",
    (req, res) => {

        const email =
            decodeURIComponent(
                req.params.email
            )
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
            WHERE LOWER(email) = ?
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
                    WHERE LOWER(email) = ?
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

                        return res.json({

                            success: true,

                            expenses:
                                expenses,

                            income:
                                income

                        });

                    }
                );

            }
        );

    }
);

// ======================================================
// ================= FORGOT PASSWORD ====================
// ======================================================

app.post(
    "/forgot-password",
    (req, res) => {

        const email =
            String(
                req.body.email || ""
            )
            .trim()
            .toLowerCase();

        if (!email) {

            return res.status(400).json({

                success: false,

                message:
                    "Email is required"

            });

        }

        db.query(
            `
            SELECT
                id,
                name,
                email
            FROM users
            WHERE LOWER(email) = ?
            LIMIT 1
            `,
            [email],
            async (err, results) => {

                if (err) {

                    return res.status(500).json({

                        success: false,

                        message:
                            "Database error",

                        error:
                            err.message

                    });

                }

                if (
                    results.length === 0
                ) {

                    return res.status(404).json({

                        success: false,

                        message:
                            "Email not registered"

                    });

                }

                const user =
                    results[0];

                const otp =
                    generateOTP();

                const expiresAt =
                    Date.now() +
                    10 * 60 * 1000;

                resetOTPs.set(
                    email,
                    {
                        otp,
                        expiresAt
                    }
                );

                try {

                    if (
                        !process.env.EMAIL_USER ||
                        !process.env.EMAIL_PASS
                    ) {

                        throw new Error(
                            "EMAIL_USER or EMAIL_PASS is missing"
                        );

                    }

                    await transporter.sendMail({

                        from:
                            `"Expense Tracker Pro" <${process.env.EMAIL_USER}>`,

                        to:
                            email,

                        subject:
                            "Expense Tracker Pro - Password Reset OTP",

                        html: `
                        <div style="
                            font-family:Arial;
                            max-width:500px;
                            margin:auto;
                            padding:25px;
                            background:#f5f5f5;
                            border-radius:15px;
                        ">

                            <h2>
                                Expense Tracker Pro
                            </h2>

                            <p>
                                Hello ${user.name},
                            </p>

                            <p>
                                Your password reset OTP is:
                            </p>

                            <div style="
                                font-size:32px;
                                font-weight:bold;
                                letter-spacing:8px;
                                text-align:center;
                                background:white;
                                padding:15px;
                                border-radius:10px;
                            ">
                                ${otp}
                            </div>

                            <p>
                                This OTP is valid for
                                <strong>10 minutes</strong>.
                            </p>

                            <p>
                                If you did not request this,
                                please ignore this email.
                            </p>

                        </div>
                        `

                    });

                    console.log(
                        "✅ OTP sent:",
                        email
                    );

                    return res.json({

                        success: true,

                        message:
                            "OTP sent successfully to your email"

                    });

                } catch (mailError) {

                    console.error(
                        "❌ Email Error:",
                        mailError.message
                    );

                    resetOTPs.delete(email);

                    return res.status(500).json({

                        success: false,

                        message:
                            "Unable to send OTP email",

                        error:
                            mailError.message

                    });

                }

            }
        );

    }
);

// ======================================================
// ================= VERIFY OTP ==========================
// ======================================================

app.post(
    "/verify-reset-otp",
    (req, res) => {

        const email =
            String(
                req.body.email || ""
            )
            .trim()
            .toLowerCase();

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

        const resetData =
            resetOTPs.get(email);

        if (!resetData) {

            return res.status(400).json({

                success: false,

                message:
                    "OTP not found. Please request a new OTP."

            });

        }

        if (
            Date.now() >
            resetData.expiresAt
        ) {

            resetOTPs.delete(email);

            return res.status(400).json({

                success: false,

                message:
                    "OTP expired. Please request a new OTP."

            });

        }

        if (
            resetData.otp !== otp
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid OTP"

            });

        }

        return res.json({

            success: true,

            message:
                "OTP verified successfully"

        });

    }
);

// ======================================================
// ================= RESET PASSWORD ======================
// ======================================================

app.post(
    "/reset-password",
    (req, res) => {

        const email =
            String(
                req.body.email || ""
            )
            .trim()
            .toLowerCase();

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

        if (
            !/^\d{6}$/.test(newPassword)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Password must contain exactly 6 digits"

            });

        }

        const resetData =
            resetOTPs.get(email);

        if (!resetData) {

            return res.status(400).json({

                success: false,

                message:
                    "OTP not found. Please request a new OTP."

            });

        }

        if (
            Date.now() >
            resetData.expiresAt
        ) {

            resetOTPs.delete(email);

            return res.status(400).json({

                success: false,

                message:
                    "OTP expired"

            });

        }

        if (
            resetData.otp !== otp
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid OTP"

            });

        }

        db.query(
            `
            UPDATE users
            SET password = ?
            WHERE LOWER(email) = ?
            LIMIT 1
            `,
            [
                newPassword,
                email
            ],
            (err, result) => {

                if (err) {

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

                resetOTPs.delete(email);

                return res.json({

                    success: true,

                    message:
                        "Password reset successfully"

                });

            }
        );

    }
);

// ======================================================
// ================= API 404 HANDLER ====================
// ======================================================

// IMPORTANT:
// Do NOT use app.use("*", ...)
// Express 5 rejects "*" routes.

app.use(
    (req, res) => {

        console.log(
            "404:",
            req.method,
            req.originalUrl
        );

        return res.status(404).json({

            success: false,

            message:
                "API route not found",

            route:
                req.originalUrl

        });

    }
);

// ======================================================
// ================= ERROR HANDLER =======================
// ======================================================

app.use(
    (err, req, res, next) => {

        console.error(
            "❌ SERVER ERROR:",
            err.message
        );

        return res.status(500).json({

            success: false,

            message:
                "Internal Server Error",

            error:
                err.message

        });

    }
);

// ======================================================
// ================= START SERVER ========================
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
            "======================================"
        );

    }
);