// ======================================================
// ================= EXPENSE TRACKER SERVER ==============
// ======================================================

const express = require("express");
const mysql = require("mysql2");
const path = require("path");
const cors = require("cors");

const app = express();


// ======================================================
// ================= PORT ================================
// ======================================================

const PORT = process.env.PORT || 5000;


// ======================================================
// ================= CORS ================================
// ======================================================

app.use(cors({
    origin: [
        "https://expense-tracker-pro-production-9a0b.up.railway.app",
        "https://expense-tracker-pro-production-99eb.up.railway.app",
        "http://localhost:5000",
        "http://127.0.0.1:5000"
    ],
    methods: [
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "OPTIONS"
    ],
    allowedHeaders: [
        "Content-Type",
        "Authorization"
    ]
}));


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
// ================= STATIC FILES ========================
// ======================================================

app.use(
    express.static(__dirname)
);


// ======================================================
// ================= MYSQL CONFIG ========================
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
        )

};


// ======================================================
// ================= MYSQL CONNECTION ====================
// ======================================================

const db =
    mysql.createConnection(dbConfig);


db.connect((err) => {

    if (err) {

        console.error(
            "❌ MySQL Connection Error:",
            err.message
        );

        return;

    }

    console.log(
        "MySQL Connected ✅"
    );

    console.log(
        "Database:",
        dbConfig.database
    );

});


// ======================================================
// ================= HOME ROUTE ==========================
// ======================================================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "index.html"
        )
    );

});


// ======================================================
// ================= STATUS API ==========================
// ======================================================

app.get("/api/status", (req, res) => {

    db.query(
        "SELECT 1 AS test",
        (err) => {

            if (err) {

                return res.status(500).json({

                    success: false,

                    server: "running",

                    mysql: "disconnected",

                    error:
                        err.message

                });

            }

            res.json({

                success: true,

                server: "running",

                mysql: "connected",

                database:
                    dbConfig.database,

                message:
                    "Expense Tracker API is working ✅"

            });

        }
    );

});


// ======================================================
// ================= TEST MYSQL ==========================
// ======================================================

app.get("/api/test-db", (req, res) => {

    db.query(
        "SELECT DATABASE() AS database_name",
        (err, result) => {

            if (err) {

                console.error(
                    "Database Test Error:",
                    err
                );

                return res.status(500).json({

                    success: false,

                    error:
                        err.message

                });

            }

            res.json({

                success: true,

                database:
                    result[0].database_name

            });

        }
    );

});


// ======================================================
// ================= LOGIN FUNCTION ======================
// ======================================================

function loginUser(req, res) {

    const {
        email,
        password
    } = req.body;


    if (!email || !password) {

        return res.status(400).json({

            success: false,

            message:
                "Email and password are required"

        });

    }


    const sql = `

        SELECT
            id,
            name,
            email,
            password

        FROM users

        WHERE email = ?

        LIMIT 1

    `;


    db.query(
        sql,
        [email],
        (err, results) => {

            if (err) {

                console.error(
                    "❌ Login Database Error:",
                    err
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


            res.json({

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

// Main route used by auth.js
app.post(
    "/login",
    loginUser
);


// Compatibility route
app.post(
    "/api/login",
    loginUser
);


// ======================================================
// ================= REGISTER FUNCTION ===================
// ======================================================

function registerUser(req, res) {

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
                    "❌ Register Database Error:",
                    err
                );


                if (
                    err.code ===
                    "ER_DUP_ENTRY"
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


            res.json({

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

// Main route used by register.js
app.post(
    "/register",
    registerUser
);


// Compatibility route
app.post(
    "/api/register",
    registerUser
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
            );


        db.query(

            `

            SELECT
                id,
                name,
                email

            FROM users

            WHERE email = ?

            LIMIT 1

            `,

            [email],

            (err, results) => {

                if (err) {

                    console.error(
                        "Get User Error:",
                        err
                    );

                    return res.status(500).json({

                        success: false,

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


                res.json({

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
            );


        console.log(
            "GET EXPENSES:",
            email
        );


        const sql = `

            SELECT
                id,
                email,
                name,
                amount,
                category,
                date

            FROM expenses

            WHERE email = ?

            ORDER BY date DESC, id DESC

        `;


        db.query(
            sql,
            [email],
            (err, results) => {

                if (err) {

                    console.error(
                        "❌ Get Expenses Error:",
                        err
                    );

                    return res.status(500).json({

                        success: false,

                        message:
                            "Unable to load expenses",

                        error:
                            err.message

                    });

                }


                console.log(
                    "Expenses found:",
                    results.length
                );


                res.json({

                    success: true,

                    expenses:
                        results

                });

            }
        );

    }
);


// ======================================================
// ================= ADD EXPENSE ========================
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
                        "❌ Add Expense Error:",
                        err
                    );

                    return res.status(500).json({

                        success: false,

                        message:
                            "Unable to add expense",

                        error:
                            err.message

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
                        "❌ Update Expense Error:",
                        err
                    );

                    return res.status(500).json({

                        success: false,

                        error:
                            err.message

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
            DELETE FROM expenses
            WHERE id = ?
            `,

            [id],

            (err, result) => {

                if (err) {

                    console.error(
                        "❌ Delete Expense Error:",
                        err
                    );

                    return res.status(500).json({

                        success: false,

                        error:
                            err.message

                    });

                }


                res.json({

                    success: true,

                    message:
                        "Expense deleted successfully",

                    affectedRows:
                        result.affectedRows

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


        console.log(
            "GET INCOME:",
            email
        );


        const sql = `

            SELECT
                id,
                email,
                amount,
                date

            FROM income

            WHERE email = ?

            ORDER BY date DESC, id DESC

        `;


        db.query(
            sql,
            [email],
            (err, results) => {

                if (err) {

                    console.error(
                        "❌ Get Income Error:",
                        err
                    );

                    return res.status(500).json({

                        success: false,

                        message:
                            "Unable to load income",

                        error:
                            err.message

                    });

                }


                console.log(
                    "Income found:",
                    results.length
                );


                res.json({

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


        const sql = `

            INSERT INTO income
            (
                email,
                amount,
                date
            )

            VALUES (?, ?, ?)

        `;


        db.query(
            sql,
            [
                email,
                amount,
                date
            ],
            (err, result) => {

                if (err) {

                    console.error(
                        "❌ Add Income Error:",
                        err
                    );

                    return res.status(500).json({

                        success: false,

                        message:
                            "Unable to add income",

                        error:
                            err.message

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


        const sql = `

            UPDATE income

            SET
                amount = ?,
                date = ?

            WHERE id = ?

        `;


        db.query(
            sql,
            [
                amount,
                date,
                id
            ],
            (err, result) => {

                if (err) {

                    console.error(
                        "❌ Update Income Error:",
                        err
                    );

                    return res.status(500).json({

                        success: false,

                        error:
                            err.message

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
            DELETE FROM income
            WHERE id = ?
            `,

            [id],

            (err, result) => {

                if (err) {

                    console.error(
                        "❌ Delete Income Error:",
                        err
                    );

                    return res.status(500).json({

                        success: false,

                        error:
                            err.message

                    });

                }


                res.json({

                    success: true,

                    message:
                        "Income deleted successfully",

                    affectedRows:
                        result.affectedRows

                });

            }
        );

    }
);


// ======================================================
// ================= GET ALL USER DATA ==================
// ======================================================

app.get(
    "/api/data/:email",
    (req, res) => {

        const email =
            decodeURIComponent(
                req.params.email
            );


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

            WHERE email = ?

            ORDER BY date DESC, id DESC

            `,

            [email],

            (expenseErr, expenses) => {

                if (expenseErr) {

                    console.error(
                        "Data Expense Error:",
                        expenseErr
                    );

                    return res.status(500).json({

                        success: false,

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

                    WHERE email = ?

                    ORDER BY date DESC, id DESC

                    `,

                    [email],

                    (incomeErr, income) => {

                        if (incomeErr) {

                            console.error(
                                "Data Income Error:",
                                incomeErr
                            );

                            return res.status(500).json({

                                success: false,

                                error:
                                    incomeErr.message

                            });

                        }


                        res.json({

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
// ================= 404 HANDLER =========================
// ======================================================

app.use(
    (req, res) => {

        res.status(404).json({

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
            "❌ Server Error:",
            err
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
// ================= START SERVER ========================
// ======================================================

app.listen(
    PORT,
    () => {

        console.log(
            "======================================"
        );

        console.log(
            "Expense Tracker Server Started 🚀"
        );

        console.log(
            "MySQL + Express Backend Ready ✅"
        );

        console.log(
            "Server running on port " +
            PORT
        );

        console.log(
            "Local URL: http://localhost:" +
            PORT
        );

        console.log(
            "Status URL: http://localhost:" +
            PORT +
            "/api/status"
        );

        console.log(
            "======================================"
        );

    }
);