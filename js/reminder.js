// ======================================================
// =============== SMART EXPENSE REMINDER ===============
// ======================================================

const saveReminderBtn =
    document.getElementById("saveReminderBtn");

const reminderPopup =
    document.getElementById("reminderPopup");

const reminderMessage =
    document.getElementById("reminderMessage");

const acceptReminderBtn =
    document.getElementById("acceptReminderBtn");

const skipReminderBtn =
    document.getElementById("skipReminderBtn");

let currentReminder = null;


// ======================================================
// ================= SAVE REMINDER =======================
// ======================================================

if (saveReminderBtn) {

    saveReminderBtn.addEventListener("click", () => {

        const name =
            document.getElementById("reminderName")?.value.trim();

        const amount =
            document.getElementById("reminderAmount")?.value;

        const category =
            document.getElementById("reminderCategory")?.value ||
            "Others";

        const type =
            document.getElementById("reminderType")?.value ||
            "daily";

        const time =
            document.getElementById("reminderTime")?.value;


        if (
            !name ||
            !amount ||
            !time
        ) {

            alert("Please fill reminder details");

            return;

        }


        if (Number(amount) <= 0) {

            alert("Please enter a valid amount");

            return;

        }


        const reminder = {

            id: Date.now(),

            name: name,

            amount: Number(amount),

            category: category,

            type: type,

            time: time,

            lastAdded: ""

        };


        let reminders =
            JSON.parse(
                localStorage.getItem(
                    "expenseReminders"
                )
            ) || [];


        reminders.push(reminder);


        localStorage.setItem(
            "expenseReminders",
            JSON.stringify(reminders)
        );


        alert(
            "Reminder Saved Successfully 🔔"
        );


        const nameInput =
            document.getElementById("reminderName");

        const amountInput =
            document.getElementById("reminderAmount");


        if (nameInput) {

            nameInput.value = "";

        }


        if (amountInput) {

            amountInput.value = "";

        }

    });

}


// ======================================================
// ================= NOTIFICATION ========================
// ======================================================

if ("Notification" in window) {

    if (
        Notification.permission === "default"
    ) {

        Notification.requestPermission();

    }

}


// ======================================================
// ================= CHECK REMINDER =====================
// ======================================================

function checkReminder() {

    let reminders =
        JSON.parse(
            localStorage.getItem(
                "expenseReminders"
            )
        ) || [];


    const now = new Date();


    const currentTime =

        String(
            now.getHours()
        ).padStart(2, "0")

        +

        ":" +

        String(
            now.getMinutes()
        ).padStart(2, "0");


    const today =

        now.getFullYear() +
        "-" +
        String(
            now.getMonth() + 1
        ).padStart(2, "0") +
        "-" +
        String(
            now.getDate()
        ).padStart(2, "0");


    reminders.forEach(
        reminder => {

            if (
                currentTime === reminder.time &&
                reminder.lastAdded !== today
            ) {

                showReminder(reminder);

            }

        }
    );

}


// ======================================================
// ================= SHOW REMINDER ======================
// ======================================================

function showReminder(reminder) {

    currentReminder = reminder;


    if (reminderMessage) {

        reminderMessage.innerHTML =

            `
            Did you spend
            ₹${Number(reminder.amount).toFixed(2)}
            for
            <b>${reminder.name}</b>?
            `;

    }


    if (reminderPopup) {

        reminderPopup.style.display =
            "block";

    }


    if (
        "Notification" in window &&
        Notification.permission === "granted"
    ) {

        try {

            new Notification(
                "Expense Reminder 🔔",
                {

                    body:
                        `Add ₹${reminder.amount} ${reminder.name} expense?`

                }
            );

        } catch (error) {

            console.error(
                "Notification Error:",
                error
            );

        }

    }

}


// ======================================================
// ============ ADD REMINDER EXPENSE TO API =============
// ======================================================

async function addReminderExpense(reminder) {

    const email =
        localStorage.getItem("userEmail");


    if (!email) {

        alert(
            "User email not found. Please login again."
        );

        return false;

    }


    // Current date

    const now = new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            now.getDate()
        ).padStart(2, "0");


    const date =
        `${year}-${month}-${day}`;


    try {

        console.log(
            "Adding reminder expense:",
            {
                email,
                name: reminder.name,
                amount: reminder.amount,
                category: reminder.category,
                date
            }
        );


        // IMPORTANT:
        // Your server.js uses POST /expenses

        const response =
            await fetch(
                "/expenses",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            email:
                                email,

                            name:
                                reminder.name,

                            amount:
                                Number(
                                    reminder.amount
                                ),

                            category:
                                reminder.category ||
                                "Others",

                            date:
                                date

                        })

                }
            );


        const data =
            await response.json();


        console.log(
            "Reminder Expense API Response:",
            data
        );


        if (!response.ok) {

            throw new Error(

                data.message ||
                `Server Error (${response.status})`

            );

        }


        if (!data.success) {

            throw new Error(

                data.message ||
                "Unable to add reminder expense"

            );

        }


        console.log(
            "Reminder expense added successfully ✅"
        );


        return true;


    } catch (error) {

        console.error(
            "Reminder Expense Error:",
            error
        );


        alert(
            "Reminder expense could not be added.\n\n" +
            error.message
        );


        return false;

    }

}


// ======================================================
// ================= ACCEPT REMINDER ====================
// ======================================================

if (acceptReminderBtn) {

    acceptReminderBtn.addEventListener(
        "click",
        async () => {

            if (!currentReminder) {

                return;

            }


            // Disable button while saving

            acceptReminderBtn.disabled =
                true;


            acceptReminderBtn.innerText =
                "Adding...";


            // ============================================
            // ADD TO MYSQL
            // ============================================

            const added =
                await addReminderExpense(
                    currentReminder
                );


            // ============================================
            // IF SUCCESS
            // ============================================

            if (added) {

                let reminders =
                    JSON.parse(
                        localStorage.getItem(
                            "expenseReminders"
                        )
                    ) || [];


                const today =

                    new Date()
                        .toISOString()
                        .split("T")[0];


                reminders =
                    reminders.map(
                        item => {

                            if (
                                item.id ===
                                currentReminder.id
                            ) {

                                item.lastAdded =
                                    today;

                            }

                            return item;

                        }
                    );


                // ========================================
                // ONE TIME REMINDER
                // ========================================

                if (
                    currentReminder.type ===
                    "onetime"
                ) {

                    reminders =
                        reminders.filter(
                            item =>
                                item.id !==
                                currentReminder.id
                        );

                }


                localStorage.setItem(
                    "expenseReminders",
                    JSON.stringify(
                        reminders
                    )
                );


                // ========================================
                // CLOSE POPUP
                // ========================================

                if (reminderPopup) {

                    reminderPopup.style.display =
                        "none";

                }


                alert(
                    "Expense Added Successfully ✅"
                );


                // ========================================
                // REFRESH DASHBOARD
                // ========================================

                if (
                    typeof loadExpenses ===
                    "function"
                ) {

                    await loadExpenses();

                }


                if (
                    typeof loadIncome ===
                    "function"
                ) {

                    await loadIncome();

                }


                if (
                    typeof displayTransactions ===
                    "function"
                ) {

                    displayTransactions();

                }


                if (
                    typeof calculateTotals ===
                    "function"
                ) {

                    calculateTotals();

                }


                currentReminder = null;

            }


            // ============================================
            // ENABLE BUTTON
            // ============================================

            acceptReminderBtn.disabled =
                false;


            acceptReminderBtn.innerText =
                "Add Expense";

        }
    );

}


// ======================================================
// ================= SKIP REMINDER ======================
// ======================================================

if (skipReminderBtn) {

    skipReminderBtn.addEventListener(
        "click",
        () => {

            if (reminderPopup) {

                reminderPopup.style.display =
                    "none";

            }


            currentReminder = null;

        }
    );

}


// ======================================================
// ================= AUTO CHECK =========================
// ======================================================

setInterval(
    checkReminder,
    60000
);


// ======================================================
// ================= FIRST CHECK ========================
// ======================================================

checkReminder();