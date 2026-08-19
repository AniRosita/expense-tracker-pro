const express = require("express");
const mysql = require("mysql2");
const path = require("path");

const app = express();


// ======================================================
// ================= MIDDLEWARE ==========================
// ======================================================

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);


// ======================================================
// ================= CORS ================================
// ======================================================

app.use((req, res, next) => {

    res.setHeader(
        "Access-Control-Allow-Origin",
        "https://expense-tracker-pro-production-9a0b.up.railway.app"
    );

    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
    );

    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type"
    );

    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }

    next();

});


// ======================================================
// ================= STATIC FILES ========================
// ======================================================

app.use(
    express.static(__dirname)
);


// ======================================================
// ================= MYSQL CONNECTION ====================
// ======================================================

// Railway MySQL variables

const dbConfig = {

    host: process.env.MYSQLHOST,

    port: Number(process.env.MYSQLPORT),

    user: process.env.MYSQLUSER,

    password: process.env.MYSQLPASSWORD,

    database: process.env.MYSQLDATABASE,

    waitForConnections: true,

    connectionLimit: 10,

    queueLimit: 0

};


console.log(
    "Connecting to MySQL..."
);

console.log(
    "MySQL Host:",
    dbConfig.host
);

console.log(
    "MySQL Port:",
    dbConfig.port
);

console.log(
    "MySQL Database:",
    dbConfig.database
);


// ======================================================
// ================= MYSQL POOL ==========================
// ======================================================

const db =
    mysql.createPool(
        dbConfig
    );


// ======================================================
// ================= MYSQL TEST ==========================
// ======================================================

db.query(
    "SELECT 1 AS connected",
    (err) => {

        if (err) {

            console.error(
                "MySQL Connection Failed ❌"
            );

            console.error(
                err
            );

            return;

        }

        console.log(
            "MySQL Connected Successfully ✅"
        );

    }
);


// ======================================================
// ================= HOME ================================
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
// ================= REGISTER ============================
// ======================================================

app.post(
    "/register",
    (req, res) => {

        const {
            name,
            email,
            password
        } = req.body;


        if (
            !name ||
            !email ||
            !password
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "All fields are required"

            });

        }


        const checkSql = `

            SELECT *
            FROM users
            WHERE email = ?

        `;


        db.query(
            checkSql,
            [email],
            (err, result) => {

                if (err) {

                    console.error(
                        "Register Check Error:",
                        err
                    );

                    return res.status(500).json({

                        success: false,

                        message:
                            "Database Error"

                    });

                }


                if (
                    result.length > 0
                ) {

                    return res.json({

                        success: false,

                        message:
                            "You already have an account. Please login."

                    });

                }


                const insertSql = `

                    INSERT INTO users
                    (
                        name,
                        email,
                        password
                    )

                    VALUES (?, ?, ?)

                `;


                db.query(
                    insertSql,
                    [
                        name,
                        email,
                        password
                    ],
                    (err, result) => {

                        if (err) {

                            console.error(
                                "Register Insert Error:",
                                err
                            );

                            return res.status(500).json({

                                success: false,

                                message:
                                    "Registration Failed"

                            });

                        }


                        return res.json({

                            success: true,

                            message:
                                "Registration Successful",

                            id:
                                result.insertId

                        });

                    }
                );

            }
        );

    }
);


// ======================================================
// ================= LOGIN ===============================
// ======================================================

app.post(
    "/login",
    (req, res) => {

        const {
            email,
            password
        } = req.body;


        if (
            !email ||
            !password
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Email and password are required"

            });

        }


        const sql = `

            SELECT *
            FROM users

            WHERE email = ?
            AND password = ?

        `;


        db.query(
            sql,
            [
                email,
                password
            ],
            (err, result) => {

                if (err) {

                    console.error(
                        "Login Error:",
                        err
                    );

                    return res.status(500).json({

                        success: false,

                        message:
                            "Database Error"

                    });

                }


                if (
                    result.length > 0
                ) {

                    return res.json({

                        success: true,

                        message:
                            "Login Successful",

                        user:
                            result[0]

                    });

                }


                return res.json({

                    success: false,

                    message:
                        "Invalid Email or Password"

                });

            }
        );

    }
);


// ======================================================
// ================= ADD INCOME ==========================
// ======================================================

app.post(
    "/add-income",
    (req, res) => {

        const {
            email,
            source,
            amount,
            date
        } = req.body;


        if (
            !email ||
            !source ||
            !amount ||
            !date
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "All income fields are required"

            });

        }


        const sql = `

            INSERT INTO income
            (
                email,
                source,
                amount,
                date
            )

            VALUES (?, ?, ?, ?)

        `;


        db.query(
            sql,
            [
                email,
                source,
                amount,
                date
            ],
            (err, result) => {

                if (err) {

                    console.error(
                        "Income Add Error:",
                        err
                    );

                    return res.status(500).json({

                        success: false,

                        message:
                            "Income Add Failed"

                    });

                }


                return res.json({

                    success: true,

                    message:
                        "Income Added Successfully",

                    id:
                        result.insertId

                });

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
            );


        if (!email) {

            return res.status(400).json({

                success: false,

                message:
                    "Email is required"

            });

        }


        const sql = `

            SELECT *
            FROM income

            WHERE email = ?

            ORDER BY date DESC, id DESC

        `;


        db.query(
            sql,
            [email],
            (err, result) => {

                if (err) {

                    console.error(
                        "Income Fetch Error:",
                        err
                    );

                    return res.status(500).json({

                        success: false,

                        message:
                            "Database Error"

                    });

                }


                return res.json({

                    success: true,

                    income:
                        result || []

                });

            }
        );

    }
);


// ======================================================
// ================= UPDATE INCOME =======================
// ======================================================

app.put(
    "/update-income/:id",
    (req, res) => {

        const id =
            Number(
                req.params.id
            );

        const {
            source,
            amount,
            date
        } = req.body;


        if (
            !id ||
            !source ||
            !amount ||
            !date
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "All income fields are required"

            });

        }


        const sql = `

            UPDATE income

            SET
                source = ?,
                amount = ?,
                date = ?

            WHERE id = ?

        `;


        db.query(
            sql,
            [
                source,
                amount,
                date,
                id
            ],
            (err, result) => {

                if (err) {

                    console.error(
                        "Income Update Error:",
                        err
                    );

                    return res.status(500).json({

                        success: false,

                        message:
                            "Income Update Failed"

                    });

                }


                if (
                    result.affectedRows === 0
                ) {

                    return res.status(404).json({

                        success: false,

                        message:
                            "Income Not Found"

                    });

                }


                return res.json({

                    success: true,

                    message:
                        "Income Updated Successfully"

                });

            }
        );

    }
);


// ======================================================
// ================= ADD EXPENSE =========================
// ======================================================

app.post(
    "/add-expense",
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
            !amount ||
            !category ||
            !date
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "All expense fields are required"

            });

        }


        const sql = `

            INSERT INTO expenses
            (
                email,
                name,
                amount,
                category,
                date
            )

            VALUES (?, ?, ?, ?, ?)

        `;


        db.query(
            sql,
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
                        "Expense Add Error:",
                        err
                    );

                    return res.status(500).json({

                        success: false,

                        message:
                            "Failed to add expense"

                    });

                }


                return res.json({

                    success: true,

                    message:
                        "Expense Added Successfully",

                    id:
                        result.insertId

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
            );


        if (!email) {

            return res.status(400).json({

                success: false,

                message:
                    "Email is required"

            });

        }


        const sql = `

            SELECT
                id,
                email,
                name,
                amount,
                category,
                date,
                created_at

            FROM expenses

            WHERE email = ?

            ORDER BY date DESC, id DESC

        `;


        db.query(
            sql,
            [email],
            (err, result) => {

                if (err) {

                    console.error(
                        "Expense Fetch Error:",
                        err
                    );

                    return res.status(500).json({

                        success: false,

                        message:
                            "Database Error"

                    });

                }


                return res.json({

                    success: true,

                    expenses:
                        result || []

                });

            }
        );

    }
);


// ======================================================
// ================= UPDATE EXPENSE ======================
// ======================================================

app.put(
    "/update-expense/:id",
    (req, res) => {

        const id =
            Number(
                req.params.id
            );

        const {
            name,
            amount,
            category,
            date
        } = req.body;


        if (
            !id ||
            !name ||
            !amount ||
            !category ||
            !date
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "All expense fields are required"

            });

        }


        const sql = `

            UPDATE expenses

            SET
                name = ?,
                amount = ?,
                category = ?,
                date = ?

            WHERE id = ?

        `;


        db.query(
            sql,
            [
                name,
                amount,
                category,
                date,
                id
            ],
            (err, result) => {

                if (err) {

                    console.error(
                        "Expense Update Error:",
                        err
                    );

                    return res.status(500).json({

                        success: false,

                        message:
                            "Expense Update Failed"

                    });

                }


                if (
                    result.affectedRows === 0
                ) {

                    return res.status(404).json({

                        success: false,

                        message:
                            "Expense Not Found"

                    });

                }


                return res.json({

                    success: true,

                    message:
                        "Expense Updated Successfully"

                });

            }
        );

    }
);


// ======================================================
// ================= DELETE EXPENSE ======================
// ======================================================

app.delete(
    "/delete-expense/:id",
    (req, res) => {

        const id =
            Number(
                req.params.id
            );


        if (!id) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid expense ID"

            });

        }


        const sql = `

            DELETE FROM expenses

            WHERE id = ?

        `;


        db.query(
            sql,
            [id],
            (err, result) => {

                if (err) {

                    console.error(
                        "Expense Delete Error:",
                        err
                    );

                    return res.status(500).json({

                        success: false,

                        message:
                            "Expense Delete Failed"

                    });

                }


                if (
                    result.affectedRows === 0
                ) {

                    return res.status(404).json({

                        success: false,

                        message:
                            "Expense Not Found"

                    });

                }


                return res.json({

                    success: true,

                    message:
                        "Expense Deleted Successfully"

                });

            }
        );

    }
);


// ======================================================
// ================= IMPORT EXPENSES =====================
// ======================================================

app.post(
    "/import-expenses",
    (req, res) => {

        const expenses =
            req.body.expenses;


        if (
            !Array.isArray(expenses) ||
            expenses.length === 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "No expenses found"

            });

        }


        const values =
            expenses.map(
                exp => [

                    exp.email,

                    exp.name,

                    exp.amount,

                    exp.category,

                    exp.date

                ]
            );


        const sql = `

            INSERT INTO expenses
            (
                email,
                name,
                amount,
                category,
                date
            )

            VALUES ?

        `;


        db.query(
            sql,
            [values],
            (err, result) => {

                if (err) {

                    console.error(
                        "Expense Import Error:",
                        err
                    );

                    return res.status(500).json({

                        success: false,

                        message:
                            "Expense Import Failed"

                    });

                }


                return res.json({

                    success: true,

                    message:
                        "Expenses Imported Successfully",

                    inserted:
                        result.affectedRows

                });

            }
        );

    }
);


// ======================================================
// ================= API STATUS ==========================
// ======================================================

app.get(
    "/api/status",
    (req, res) => {

        db.query(
            "SELECT 1 AS connected",
            (err) => {

                if (err) {

                    console.error(
                        "Status Database Error:",
                        err
                    );

                    return res.status(500).json({

                        success: false,

                        message:
                            "Expense Tracker Server is running",

                        database:
                            "disconnected"

                    });

                }


                return res.json({

                    success: true,

                    message:
                        "Expense Tracker Server is running",

                    database:
                        "connected"

                });

            }
        );

    }
);


// ======================================================
// ================= 404 API =============================
// ======================================================

app.use(
    (req, res, next) => {

        if (
            req.path.startsWith("/api/") ||
            req.method !== "GET"
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "API route not found"

            });

        }

        next();

    }
);


// ======================================================
// ================= SERVER START ========================
// ======================================================

const PORT =
    process.env.PORT || 5000;


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
            `Server running on port ${PORT}`
        );

        console.log(
            `Environment: ${process.env.NODE_ENV || "production"}`
        );

        console.log(
            "======================================"
        );

    }
);