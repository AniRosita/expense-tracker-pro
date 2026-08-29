// ======================================================
// ============== EXPENSE TRACKER PRO ===================
// =============== SMART EXPENSE REMINDER ===============
// ======================================================

"use strict";

// ======================================================
// ================= API CONFIG ==========================
// ======================================================

const REMINDER_API_BASE =
    "https://expense-tracker-pro-production-b745.up.railway.app";

console.log(
    "Reminder API Base:",
    REMINDER_API_BASE
);

// ======================================================
// ================= DOM ELEMENTS ========================
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

// ======================================================
// ================= GLOBAL STATE ========================
// ======================================================

let currentReminder = null;

let reminderCheckRunning = false;

let lastShownReminderKey = "";

// ======================================================
// ================= FORMAT REMINDER MONEY ==============
// ======================================================

function formatReminderAmount(amount) {

    const value =
        Number(amount) || 0;

    if (
        typeof window.formatCurrency ===
        "function"
    ) {

        try {

            return window.formatCurrency(
                value
            );

        } catch (error) {

            console.warn(
                "Global formatCurrency failed:",
                error
            );
        }
    }

    return (
        "₹" +
        value.toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )
    );
}

// ======================================================
// ================= API REQUEST =========================
// ======================================================

async function reminderApiRequest(
    endpoint,
    options = {}
) {

    const url =
        REMINDER_API_BASE +
        endpoint;

    console.log(
        "Reminder API Request:",
        options.method || "GET",
        url
    );

    const response =
        await fetch(
            url,
            {
                ...options,

                headers: {

                    "Content-Type":
                        "application/json",

                    "Accept":
                        "application/json",

                    ...(options.headers || {})
                }
            }
        );

    const responseText =
        await response.text();

    let data = {};

    try {

        data =
            responseText
                ? JSON.parse(
                    responseText
                )
                : {};

    } catch (error) {

        console.error(
            "Invalid Reminder API JSON:",
            responseText
        );

        data = {

            success: false,

            message:
                responseText ||
                "Invalid server response"

        };
    }

    console.log(
        "Reminder API Response:",
        response.status,
        data
    );

    if (!response.ok) {

        throw new Error(
            data.message ||
            `Server Error (${response.status})`
        );
    }

    return data;
}

// ======================================================
// ================= SAVE REMINDER =======================
// ======================================================

if (saveReminderBtn) {

    saveReminderBtn.addEventListener(
        "click",
        () => {

            const nameInput =
                document.getElementById(
                    "reminderName"
                );

            const amountInput =
                document.getElementById(
                    "reminderAmount"
                );

            const categoryInput =
                document.getElementById(
                    "reminderCategory"
                );

            const typeInput =
                document.getElementById(
                    "reminderType"
                );

            const timeInput =
                document.getElementById(
                    "reminderTime"
                );

            const name =
                nameInput
                    ? nameInput.value.trim()
                    : "";

            const amount =
                amountInput
                    ? Number(
                        amountInput.value
                    )
                    : 0;

            const category =
                categoryInput
                    ? categoryInput.value ||
                      "Others"
                    : "Others";

            const type =
                typeInput
                    ? typeInput.value ||
                      "onetime"
                    : "onetime";

            const time =
                timeInput
                    ? timeInput.value
                    : "";

            // ==================================================
            // VALIDATION
            // ==================================================

            if (
                !name ||
                !time
            ) {

                alert(
                    "Please fill reminder details."
                );

                return;
            }

            if (
                !Number.isFinite(amount) ||
                amount <= 0
            ) {

                alert(
                    "Please enter a valid amount."
                );

                return;
            }

            // ==================================================
            // VALID REMINDER TYPES
            // ==================================================

            const validTypes = [
                "onetime",
                "daily",
                "Daily",
                "weekly",
                "Weekly",
                "monthly",
                "Monthly"
            ];

            if (
                !validTypes.includes(type)
            ) {

                alert(
                    "Invalid reminder type."
                );

                return;
            }

            // ==================================================
            // NORMALIZE TYPE
            // ==================================================

            let normalizedType =
                String(type)
                    .toLowerCase();

            if (
                normalizedType ===
                "daily"
            ) {

                normalizedType = "daily";

            } else if (
                normalizedType ===
                "weekly"
            ) {

                normalizedType = "weekly";

            } else if (
                normalizedType ===
                "monthly"
            ) {

                normalizedType = "monthly";

            } else {

                normalizedType = "onetime";
            }

            // ==================================================
            // CREATE REMINDER
            // ==================================================

            const reminder = {

                id:
                    Date.now(),

                name:
                    name,

                amount:
                    amount,

                category:
                    category,

                type:
                    normalizedType,

                time:
                    time,

                lastAdded:
                    "",

                lastShown:
                    ""

            };

            // ==================================================
            // GET OLD REMINDERS
            // ==================================================

            let reminders = [];

            try {

                reminders =
                    JSON.parse(
                        localStorage.getItem(
                            "expenseReminders"
                        )
                    ) || [];

                if (
                    !Array.isArray(
                        reminders
                    )
                ) {

                    reminders = [];
                }

            } catch (error) {

                console.error(
                    "Reminder Storage Error:",
                    error
                );

                reminders = [];
            }

            // ==================================================
            // SAVE
            // ==================================================

            reminders.push(
                reminder
            );

            localStorage.setItem(
                "expenseReminders",
                JSON.stringify(
                    reminders
                )
            );

            console.log(
                "Reminder Saved:",
                reminder
            );

            alert(
                "Reminder Saved Successfully 🔔"
            );

            // ==================================================
            // CLEAR FORM
            // ==================================================

            if (nameInput) {

                nameInput.value = "";

            }

            if (amountInput) {

                amountInput.value = "";

            }

            if (timeInput) {

                timeInput.value = "";

            }

        }
    );
}

// ======================================================
// ================= NOTIFICATION ========================
// ======================================================

async function requestNotificationPermission() {

    if (
        !("Notification" in window)
    ) {

        return;
    }

    try {

        if (
            Notification.permission ===
            "default"
        ) {

            const permission =
                await Notification.requestPermission();

            console.log(
                "Notification Permission:",
                permission
            );
        }

    } catch (error) {

        console.error(
            "Notification Permission Error:",
            error
        );
    }
}

requestNotificationPermission();

// ======================================================
// ================= TODAY DATE ==========================
// ======================================================

function getTodayDate() {

    const now =
        new Date();

    return (

        now.getFullYear() +

        "-" +

        String(
            now.getMonth() + 1
        ).padStart(2, "0") +

        "-" +

        String(
            now.getDate()
        ).padStart(2, "0")

    );
}

// ======================================================
// ================= CURRENT TIME ========================
// ======================================================

function getCurrentTime() {

    const now =
        new Date();

    return (

        String(
            now.getHours()
        ).padStart(2, "0") +

        ":" +

        String(
            now.getMinutes()
        ).padStart(2, "0")

    );
}

// ======================================================
// ================= REMINDER KEY ========================
// ======================================================

function getReminderKey(
    reminder
) {

    return (

        String(
            reminder.id
        ) +

        "_" +

        getTodayDate() +

        "_" +

        String(
            reminder.time
        )

    );
}

// ======================================================
// ============== CHECK REMINDER FREQUENCY ==============
// ======================================================

function shouldShowReminder(
    reminder
) {

    if (!reminder) {

        return false;
    }

    const today =
        new Date();

    const todayDate =
        getTodayDate();

    const lastAdded =
        String(
            reminder.lastAdded || ""
        );

    const lastShown =
        String(
            reminder.lastShown || ""
        );

    const type =
        String(
            reminder.type || "onetime"
        ).toLowerCase();

    // ==================================================
    // ALREADY ADDED TODAY
    // ==================================================

    if (
        lastAdded ===
        todayDate
    ) {

        return false;
    }

    // ==================================================
    // ALREADY SHOWN TODAY
    // ==================================================

    if (
        lastShown ===
        todayDate
    ) {

        return false;
    }

    // ==================================================
    // ONE TIME
    // ==================================================

    if (
        type ===
        "onetime"
    ) {

        return (
            lastAdded === ""
        );
    }

    // ==================================================
    // DAILY
    // ==================================================

    if (
        type ===
        "daily"
    ) {

        return true;
    }

    // ==================================================
    // WEEKLY
    // ==================================================

    if (
        type ===
        "weekly"
    ) {

        if (!lastAdded) {

            return true;
        }

        const lastDate =
            new Date(
                lastAdded +
                "T00:00:00"
            );

        if (
            isNaN(
                lastDate.getTime()
            )
        ) {

            return true;
        }

        const diff =
            Math.floor(
                (
                    today.getTime() -
                    lastDate.getTime()
                ) /
                (
                    1000 *
                    60 *
                    60 *
                    24
                )
            );

        return (
            diff >= 7
        );
    }

    // ==================================================
    // MONTHLY
    // ==================================================

    if (
        type ===
        "monthly"
    ) {

        if (!lastAdded) {

            return true;
        }

        const lastDate =
            new Date(
                lastAdded +
                "T00:00:00"
            );

        if (
            isNaN(
                lastDate.getTime()
            )
        ) {

            return true;
        }

        return (

            today.getFullYear() >
                lastDate.getFullYear()

            ||

            (
                today.getFullYear() ===
                    lastDate.getFullYear()

                &&

                today.getMonth() >
                    lastDate.getMonth()
            )
        );
    }

    return false;
}

// ======================================================
// ================= CHECK REMINDER =====================
// ======================================================

function checkReminder() {

    if (
        reminderCheckRunning
    ) {

        return;
    }

    reminderCheckRunning =
        true;

    try {

        let reminders = [];

        try {

            reminders =
                JSON.parse(
                    localStorage.getItem(
                        "expenseReminders"
                    )
                ) || [];

            if (
                !Array.isArray(
                    reminders
                )
            ) {

                reminders = [];
            }

        } catch (error) {

            console.error(
                "Reminder Read Error:",
                error
            );

            reminders = [];
        }

        if (
            reminders.length === 0
        ) {

            return;
        }

        const currentTime =
            getCurrentTime();

        const today =
            getTodayDate();

        console.log(
            "Checking reminders:",
            currentTime
        );

        for (
            const reminder of reminders
        ) {

            if (!reminder) {

                continue;
            }

            const reminderTime =
                String(
                    reminder.time || ""
                ).trim();

            // ==================================================
            // INVALID TIME
            // ==================================================

            if (!reminderTime) {

                continue;
            }

            // ==================================================
            // IMPORTANT:
            // SHOW WHEN CURRENT TIME REACHES
            // OR PASSES REMINDER TIME
            // ==================================================

            if (
                currentTime <
                reminderTime
            ) {

                continue;
            }

            // ==================================================
            // CHECK FREQUENCY
            // ==================================================

            if (
                !shouldShowReminder(
                    reminder
                )
            ) {

                continue;
            }

            const reminderKey =
                getReminderKey(
                    reminder
                );

            // ==================================================
            // PREVENT DUPLICATE POPUP
            // ==================================================

            if (
                lastShownReminderKey ===
                reminderKey
            ) {

                continue;
            }

            lastShownReminderKey =
                reminderKey;

            // ==================================================
            // STORE LAST SHOWN
            // ==================================================

            const updatedReminders =
                reminders.map(
                    item => {

                        if (
                            Number(
                                item.id
                            ) ===
                            Number(
                                reminder.id
                            )
                        ) {

                            return {
                                ...item,
                                lastShown:
                                    today
                            };
                        }

                        return item;
                    }
                );

            localStorage.setItem(
                "expenseReminders",
                JSON.stringify(
                    updatedReminders
                )
            );

            // ==================================================
            // SHOW REMINDER
            // ==================================================

            showReminder(
                reminder
            );

            // One popup at a time
            break;
        }

    } catch (error) {

        console.error(
            "Check Reminder Error:",
            error
        );

    } finally {

        reminderCheckRunning =
            false;
    }
}

// ======================================================
// ================= SHOW REMINDER ======================
// ======================================================

function showReminder(
    reminder
) {

    currentReminder =
        reminder;

    if (
        reminderMessage
    ) {

        const safeName =
            escapeReminderHTML(
                reminder.name
            );

        reminderMessage.innerHTML =

            `Did you spend ` +

            `<b>${formatReminderAmount(
                reminder.amount
            )}</b>` +

            ` for ` +

            `<b>${safeName}</b>?`;
    }

    if (
        reminderPopup
    ) {

        reminderPopup.style.display =
            "block";
    }

    // ==================================================
    // BROWSER NOTIFICATION
    // ==================================================

    if (
        "Notification" in window &&
        Notification.permission ===
            "granted"
    ) {

        try {

            new Notification(
                "Expense Reminder 🔔",
                {

                    body:
                        `Add ${formatReminderAmount(
                            reminder.amount
                        )} ${reminder.name} expense?`
                }
            );

        } catch (error) {

            console.error(
                "Notification Error:",
                error
            );
        }
    }

    console.log(
        "Reminder Shown:",
        reminder
    );
}

// ======================================================
// ================= ESCAPE HTML ========================
// ======================================================

function escapeReminderHTML(
    value
) {

    return String(
        value ?? ""
    )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );
}

// ======================================================
// ============ ADD REMINDER EXPENSE TO API =============
// ======================================================

async function addReminderExpense(
    reminder
) {

    // ==================================================
    // GET USER EMAIL
    // ==================================================

    const email =
        localStorage.getItem(
            "userEmail"
        ) ||
        sessionStorage.getItem(
            "userEmail"
        );

    if (!email) {

        alert(
            "User email not found. Please login again."
        );

        return false;
    }

    if (!reminder) {

        alert(
            "Reminder data not found."
        );

        return false;
    }

    // ==================================================
    // TODAY DATE
    // ==================================================

    const date =
        getTodayDate();

    // ==================================================
    // PREPARE DATA
    // ==================================================

    const payload = {

        email:
            email.trim().toLowerCase(),

        name:
            String(
                reminder.name || ""
            ).trim(),

        amount:
            Number(
                reminder.amount
            ),

        category:
            String(
                reminder.category ||
                "Others"
            ).trim() ||
            "Others",

        date:
            date
    };

    // ==================================================
    // VALIDATION
    // ==================================================

    if (
        !payload.name
    ) {

        throw new Error(
            "Reminder name is missing."
        );
    }

    if (
        !Number.isFinite(
            payload.amount
        ) ||
        payload.amount <= 0
    ) {

        throw new Error(
            "Reminder amount is invalid."
        );
    }

    console.log(
        "Adding Reminder Expense:",
        payload
    );

    try {

        // ==================================================
        // RAILWAY API
        // ==================================================

        const data =
            await reminderApiRequest(
                "/expenses",
                {

                    method:
                        "POST",

                    body:
                        JSON.stringify(
                            payload
                        )
                }
            );

        // ==================================================
        // SERVER SUCCESS
        // ==================================================

        if (
            data &&
            data.success === true
        ) {

            console.log(
                "Reminder expense added successfully ✅",
                data
            );

            return true;
        }

        throw new Error(

            data &&
            data.message

                ? data.message

                : "Unable to add reminder expense."

        );

    } catch (error) {

        console.error(
            "Reminder Expense API Error:",
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

if (
    acceptReminderBtn
) {

    acceptReminderBtn.addEventListener(
        "click",
        async () => {

            if (
                !currentReminder
            ) {

                return;
            }

            // ==================================================
            // DISABLE BUTTON
            // ==================================================

            acceptReminderBtn.disabled =
                true;

            const originalText =
                acceptReminderBtn.innerText;

            acceptReminderBtn.innerText =
                "Adding...";

            const reminderToAdd =
                currentReminder;

            // ==================================================
            // ADD TO MYSQL
            // ==================================================

            const added =
                await addReminderExpense(
                    reminderToAdd
                );

            // ==================================================
            // SUCCESS ONLY
            // ==================================================

            if (added) {

                let reminders = [];

                try {

                    reminders =
                        JSON.parse(
                            localStorage.getItem(
                                "expenseReminders"
                            )
                        ) || [];

                    if (
                        !Array.isArray(
                            reminders
                        )
                    ) {

                        reminders = [];
                    }

                } catch {

                    reminders = [];
                }

                const today =
                    getTodayDate();

                // ==================================================
                // UPDATE LAST ADDED
                // ==================================================

                reminders =
                    reminders.map(
                        item => {

                            if (
                                Number(
                                    item.id
                                ) ===
                                Number(
                                    reminderToAdd.id
                                )
                            ) {

                                return {
                                    ...item,
                                    lastAdded:
                                        today,
                                    lastShown:
                                        today
                                };
                            }

                            return item;
                        }
                    );

                // ==================================================
                // ONE TIME → DELETE
                // ==================================================

                if (
                    String(
                        reminderToAdd.type
                    ).toLowerCase() ===
                    "onetime"
                ) {

                    reminders =
                        reminders.filter(
                            item =>

                                Number(
                                    item.id
                                ) !==
                                Number(
                                    reminderToAdd.id
                                )
                        );
                }

                // ==================================================
                // SAVE REMINDERS
                // ==================================================

                localStorage.setItem(
                    "expenseReminders",
                    JSON.stringify(
                        reminders
                    )
                );

                // ==================================================
                // CLOSE POPUP
                // ==================================================

                if (
                    reminderPopup
                ) {

                    reminderPopup.style.display =
                        "none";
                }

                currentReminder =
                    null;

                lastShownReminderKey =
                    "";

                // ==================================================
                // SUCCESS MESSAGE
                // ==================================================

                alert(
                    "Expense Added Successfully ✅"
                );

                // ==================================================
                // REFRESH DASHBOARD
                // ==================================================

                if (
                    typeof window.refreshDashboard ===
                    "function"
                ) {

                    await window.refreshDashboard();

                } else {

                    if (
                        typeof window.loadExpenses ===
                        "function"
                    ) {

                        await window.loadExpenses();
                    }

                    if (
                        typeof window.loadIncome ===
                        "function"
                    ) {

                        await window.loadIncome();
                    }

                    if (
                        typeof window.displayTransactions ===
                        "function"
                    ) {

                        window.displayTransactions();
                    }

                    if (
                        typeof window.calculateTotals ===
                        "function"
                    ) {

                        window.calculateTotals();
                    }
                }
            }

            // ==================================================
            // ENABLE BUTTON
            // ==================================================

            acceptReminderBtn.disabled =
                false;

            acceptReminderBtn.innerText =
                originalText ||
                "Add Expense";

        }
    );
}

// ======================================================
// ================= SKIP REMINDER ======================
// ======================================================

if (
    skipReminderBtn
) {

    skipReminderBtn.addEventListener(
        "click",
        () => {

            if (
                reminderPopup
            ) {

                reminderPopup.style.display =
                    "none";
            }

            currentReminder =
                null;

            console.log(
                "Reminder skipped."
            );
        }
    );
}

// ======================================================
// ================= CLOSE POPUP ========================
// ======================================================

const closeReminderBtn =
    document.getElementById(
        "closeReminderBtn"
    );

if (
    closeReminderBtn
) {

    closeReminderBtn.addEventListener(
        "click",
        () => {

            if (
                reminderPopup
            ) {

                reminderPopup.style.display =
                    "none";
            }

            currentReminder =
                null;

        }
    );
}

// ======================================================
// ================= AUTO CHECK =========================
// ======================================================

// Check every 30 seconds
setInterval(
    checkReminder,
    30000
);

// ======================================================
// ================= FIRST CHECK ========================
// ======================================================

checkReminder();

// ======================================================
// ================= GLOBAL FUNCTIONS ===================
// ======================================================

window.checkReminder =
    checkReminder;

window.showReminder =
    showReminder;

window.addReminderExpense =
    addReminderExpense;

window.getTodayDate =
    getTodayDate;

console.log(
    "Smart Expense Reminder Loaded Successfully 🔔"
);