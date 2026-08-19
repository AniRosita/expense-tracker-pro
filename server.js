const express = require("express");
const mysql = require("mysql2");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.static(__dirname));


// ================= MYSQL CONNECTION =================

const db = mysql.createConnection({

    host: "localhost",

    user: "root",

    password: "Rosi@2006",

    database: "expense_tracker"

});


db.connect((err) => {

    if (err) {

        console.log(
            "Database Connection Failed ❌"
        );

        console.log(err);

    } else {

        console.log(
            "MySQL Connected ✅"
        );

    }

});


// ================= HOME =================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "index.html")
    );

});


// ================= REGISTER =================

app.post("/register", (req, res) => {

    const {
        name,
        email,
        password
    } = req.body;


    const checkSql =
        "SELECT * FROM users WHERE email=?";


    db.query(
        checkSql,
        [email],
        (err, result) => {

            if (err) {

                return res.status(500).json({

                    success: false,

                    message:
                        "Database Error"

                });

            }


            if (result.length > 0) {

                return res.json({

                    success: false,

                    message:
                        "You already have an account. Please login."

                });

            }


            const insertSql = `
                INSERT INTO users
                (name, email, password)
                VALUES (?, ?, ?)
            `;


            db.query(
                insertSql,
                [
                    name,
                    email,
                    password
                ],
                (err) => {

                    if (err) {

                        return res.status(500).json({

                            success: false,

                            message:
                                "Registration Failed"

                        });

                    }


                    return res.json({

                        success: true,

                        message:
                            "Registration Successful"

                    });

                }
            );

        }
    );

});


// ================= LOGIN =================

app.post("/login", (req, res) => {

    const {
        email,
        password
    } = req.body;


    const sql = `
        SELECT *
        FROM users
        WHERE email=?
        AND password=?
    `;


    db.query(
        sql,
        [
            email,
            password
        ],
        (err, result) => {

            if (err) {

                return res.status(500).json({

                    success: false,

                    message:
                        "Database Error"

                });

            }


            if (result.length > 0) {

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

});


// ======================================================
// ================= INCOME SECTION =====================
// ======================================================


// ================= ADD INCOME =========================

app.post("/add-income", (req, res) => {

    const {
        email,
        source,
        amount,
        date
    } = req.body;


    const sql = `
        INSERT INTO income
        (email, source, amount, date)
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
        (err) => {

            if (err) {

                console.log(err);

                return res.status(500).json({

                    success: false,

                    message:
                        "Income Add Failed"

                });

            }


            res.json({

                success: true,

                message:
                    "Income Added Successfully"

            });

        }
    );

});


// ================= GET INCOME ==========================

app.get("/income/:email", (req, res) => {

    const email =
        req.params.email;


    const sql = `
        SELECT *
        FROM income
        WHERE email=?
        ORDER BY date DESC
    `;


    db.query(
        sql,
        [email],
        (err, result) => {

            if (err) {

                return res.status(500).json({

                    success: false,

                    message:
                        "Database Error"

                });

            }


            res.json({

                success: true,

                income:
                    result

            });

        }
    );

});


// ================= DELETE INCOME =======================
// IMPORTANT:
// Income is NOT permanently deleted immediately.
// It is first moved to deleted_history.
// Permanent deletion happens after 60 days.

app.delete(
    "/delete-income/:id",
    (req, res) => {

        const id =
            req.params.id;


        // ================= GET ORIGINAL INCOME =================

        const getSql = `
            SELECT *
            FROM income
            WHERE id=?
        `;


        db.query(
            getSql,
            [id],
            (err, result) => {

                if (err) {

                    console.log(err);

                    return res.status(500).json({

                        success: false,

                        message:
                            "Income Fetch Failed"

                    });

                }


                // ================= NOT FOUND =================

                if (result.length === 0) {

                    return res.status(404).json({

                        success: false,

                        message:
                            "Income Not Found"

                    });

                }


                const incomeData =
                    result[0];


                // ================= SAVE TO DELETE HISTORY =================

                const historySql = `
                    INSERT INTO deleted_history
                    (
                        email,
                        original_id,
                        type,
                        name,
                        amount,
                        category,
                        date,
                        deleted_at
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
                `;


                db.query(
                    historySql,
                    [
                        incomeData.email,

                        incomeData.id,

                        "income",

                        incomeData.source,

                        incomeData.amount,

                        "Income",

                        incomeData.date
                    ],
                    (historyErr) => {

                        if (historyErr) {

                            console.log(
                                "Delete History Error:",
                                historyErr
                            );

                            return res.status(500).json({

                                success: false,

                                message:
                                    "Unable to save deleted income"

                            });

                        }


                        // ================= DELETE FROM ACTIVE INCOME =================

                        const deleteSql = `
                            DELETE FROM income
                            WHERE id=?
                        `;


                        db.query(
                            deleteSql,
                            [id],
                            (deleteErr) => {

                                if (deleteErr) {

                                    console.log(
                                        "Income Delete Error:",
                                        deleteErr
                                    );

                                    return res.status(500).json({

                                        success: false,

                                        message:
                                            "Income Delete Failed"

                                    });

                                }


                                // ================= SUCCESS =================

                                res.json({

                                    success: true,

                                    message:
                                        "Income moved to Delete History"

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
// ================= EXPENSE SECTION ====================
// ======================================================


// ================= ADD EXPENSE =========================

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
            (err) => {

                if (err) {

                    console.log(err);

                    return res.status(500).json({

                        success: false,

                        message:
                            "Failed to add expense"

                    });

                }


                res.json({

                    success: true,

                    message:
                        "Expense Added Successfully"

                });

            }
        );

    }
);


// ================= GET EXPENSES ========================

app.get(
    "/expenses/:email",
    (req, res) => {

        const email =
            req.params.email;


        const sql = `
            SELECT *
            FROM expenses
            WHERE email=?
            ORDER BY date DESC
        `;


        db.query(
            sql,
            [email],
            (err, result) => {

                if (err) {

                    return res.status(500).json({

                        success: false,

                        message:
                            "Database Error"

                    });

                }


                res.json({

                    success: true,

                    expenses:
                        result

                });

            }
        );

    }
);


// ================= DELETE EXPENSE ======================

app.delete(
    "/delete-expense/:id",
    (req, res) => {

        const id =
            req.params.id;


        const sql =
            "DELETE FROM expenses WHERE id=?";


        db.query(
            sql,
            [id],
            (err) => {

                if (err) {

                    return res.status(500).json({

                        success: false,

                        message:
                            "Delete Failed"

                    });

                }


                res.json({

                    success: true,

                    message:
                        "Expense Deleted"

                });

            }
        );

    }
);


// ================= UPDATE EXPENSE ======================

app.put(
    "/update-expense/:id",
    (req, res) => {

        const id =
            req.params.id;


        const {
            name,
            amount,
            category,
            date
        } = req.body;


        const sql = `
            UPDATE expenses
            SET
                name=?,
                amount=?,
                category=?,
                date=?
            WHERE id=?
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
            (err) => {

                if (err) {

                    return res.status(500).json({

                        success: false,

                        message:
                            "Update Failed"

                    });

                }


                res.json({

                    success: true,

                    message:
                        "Expense Updated"

                });

            }
        );

    }
);


// ================= IMPORT EXPENSES =====================

app.post(
    "/import-expenses",
    (req, res) => {

        const expenses =
            req.body.expenses;


        if (
            !expenses ||
            expenses.length === 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "No expenses found"

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
            VALUES ?
        `;


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


        db.query(
            sql,
            [values],
            (err) => {

                if (err) {

                    console.log(err);

                    return res.status(500).json({

                        success: false,

                        message:
                            "Import Failed"

                    });

                }


                res.json({

                    success: true,

                    message:
                        "Expenses Imported Successfully"

                });

            }
        );

    }
);


// ======================================================
// ================= DELETE HISTORY ======================
// ======================================================


// ================= GET DELETE HISTORY ==================

app.get(
    "/delete-history/:email",
    (req, res) => {

        const email =
            req.params.email;


        const sql = `
            SELECT *
            FROM deleted_history
            WHERE email=?
            ORDER BY deleted_at DESC
        `;


        db.query(
            sql,
            [email],
            (err, result) => {

                if (err) {

                    console.log(err);

                    return res.status(500).json({

                        success: false,

                        message:
                            "History Load Failed"

                    });

                }


                res.json({

                    success: true,

                    history:
                        result

                });

            }
        );

    }
);


// ======================================================
// ============== AUTOMATIC 60-DAY CLEANUP ==============
// ======================================================


// ================= CLEAN OLD HISTORY ===================

function deleteOldHistory() {

    const sql = `
        DELETE FROM deleted_history
        WHERE deleted_at <=
        DATE_SUB(NOW(), INTERVAL 60 DAY)
    `;


    db.query(
        sql,
        (err, result) => {

            if (err) {

                console.log(
                    "60 Days Cleanup Failed ❌"
                );

                console.log(err);

                return;

            }


            if (
                result.affectedRows > 0
            ) {

                console.log(
                    result.affectedRows +
                    " old deleted record(s) permanently deleted 🗑️"
                );

            }

        }
    );

}


// ================= RUN CLEANUP ON SERVER START =================

deleteOldHistory();


// ================= RUN CLEANUP EVERY 24 HOURS =================

setInterval(
    deleteOldHistory,
    24 * 60 * 60 * 1000
);


// ======================================================
// ================= SERVER START ========================
// ======================================================

const PORT = 5000;


app.listen(
    PORT,
    () => {

        console.log(
            `Server running on port ${PORT}`
        );

    }
);