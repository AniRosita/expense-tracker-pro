// ======================================================
// ============== SMART EXPENSE REMINDER ================
// ======================================================

document.addEventListener("DOMContentLoaded", function () {

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


    // ==================================================
    // ============== GET REMINDERS =====================
    // ==================================================

    function getReminders() {

        try {

            const saved =
                localStorage.getItem("expenseReminders");

            if (!saved) {
                return [];
            }

            const reminders =
                JSON.parse(saved);

            return Array.isArray(reminders)
                ? reminders
                : [];

        } catch (error) {

            console.error(
                "Reminder Load Error:",
                error
            );

            return [];

        }

    }


    // ==================================================
    // ============== SAVE REMINDERS ====================
    // ==================================================

    function saveReminders(reminders) {

        try {

            localStorage.setItem(
                "expenseReminders",
                JSON.stringify(reminders)
            );

            return true;

        } catch (error) {

            console.error(
                "Reminder Save Error:",
                error
            );

            return false;

        }

    }


    // ==================================================
    // ============== SAVE REMINDER =====================
    // ==================================================

    if (saveReminderBtn) {

        saveReminderBtn.addEventListener(
            "click",
            function () {

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
                        ? categoryInput.value
                        : "Others";

                const type =
                    typeInput
                        ? typeInput.value
                        : "daily";

                const time =
                    timeInput
                        ? timeInput.value
                        : "";


                // ==========================================
                // VALIDATION
                // ==========================================

                if (
                    name === "" ||
                    amount <= 0 ||
                    time === ""
                ) {

                    alert(
                        "Please fill all reminder details correctly."
                    );

                    return;

                }


                // ==========================================
                // CREATE REMINDER
                // ==========================================

                const reminder = {

                    id:
                        Date.now(),

                    name:
                        name,

                    amount:
                        amount,

                    category:
                        category || "Others",

                    type:
                        type,

                    time:
                        time,

                    lastAdded:
                        ""

                };


                // ==========================================
                // GET OLD REMINDERS
                // ==========================================

                const reminders =
                    getReminders();


                // ==========================================
                // ADD NEW REMINDER
                // ==========================================

                reminders.push(
                    reminder
                );


                // ==========================================
                // SAVE
                // ==========================================

                const saved =
                    saveReminders(
                        reminders
                    );


                if (!saved) {

                    alert(
                        "Unable to save reminder."
                    );

                    return;

                }


                // ==========================================
                // SUCCESS
                // ==========================================

                alert(
                    "Reminder Saved Successfully 🔔"
                );


                // ==========================================
                // CLEAR FORM
                // ==========================================

                if (nameInput) {

                    nameInput.value = "";

                }

                if (amountInput) {

                    amountInput.value = "";

                }

                if (timeInput) {

                    timeInput.value = "";

                }


                console.log(
                    "Reminder Saved:",
                    reminder
                );

                console.log(
                    "All Reminders:",
                    getReminders()
                );

            }
        );

    } else {

        console.error(
            "saveReminderBtn not found"
        );

    }


    // ==================================================
    // ============== NOTIFICATION PERMISSION ===========
    // ==================================================

    if (
        "Notification" in window
    ) {

        if (
            Notification.permission ===
            "default"
        ) {

            Notification.requestPermission()
                .then(
                    permission => {

                        console.log(
                            "Notification Permission:",
                            permission
                        );

                    }
                )
                .catch(
                    error => {

                        console.error(
                            "Notification Permission Error:",
                            error
                        );

                    }
                );

        }

    }


    // ==================================================
    // ============== SHOW REMINDER =====================
    // ==================================================

    function showReminder(reminder) {

        currentReminder =
            reminder;


        if (reminderMessage) {

            reminderMessage.innerHTML =
                `
                Did you spend
                ₹${Number(reminder.amount).toFixed(2)}
                for
                <strong>${reminder.name}</strong>?
                `;

        }


        if (reminderPopup) {

            reminderPopup.style.display =
                "block";

        }


        // ==============================================
        // BROWSER NOTIFICATION
        // ==============================================

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


    // ==================================================
    // ============== CHECK REMINDER ====================
    // ==================================================

    function checkReminder() {

        const reminders =
            getReminders();

        if (
            reminders.length === 0
        ) {

            return;

        }


        const now =
            new Date();


        const currentTime =
            String(
                now.getHours()
            ).padStart(2, "0")
            +
            ":"
            +
            String(
                now.getMinutes()
            ).padStart(2, "0");


        const today =
            now.getFullYear()
            +
            "-"
            +
            String(
                now.getMonth() + 1
            ).padStart(2, "0")
            +
            "-"
            +
            String(
                now.getDate()
            ).padStart(2, "0");


        reminders.forEach(
            reminder => {

                if (
                    reminder.time ===
                    currentTime
                    &&
                    reminder.lastAdded !==
                    today
                ) {

                    showReminder(
                        reminder
                    );

                }

            }
        );

    }


    // ==================================================
    // ============== ACCEPT REMINDER ===================
    // ==================================================

    if (acceptReminderBtn) {

        acceptReminderBtn.addEventListener(
            "click",
            async function () {

                if (!currentReminder) {

                    return;

                }


                // ==========================================
                // ADD EXPENSE
                // ==========================================

                if (
                    typeof addReminderExpense ===
                    "function"
                ) {

                    try {

                        await addReminderExpense(
                            currentReminder
                        );

                    } catch (error) {

                        console.error(
                            "Reminder Expense Error:",
                            error
                        );

                    }

                } else {

                    console.warn(
                        "addReminderExpense() not found"
                    );

                }


                // ==========================================
                // UPDATE REMINDER
                // ==========================================

                let reminders =
                    getReminders();


                const today =
                    new Date()
                        .toISOString()
                        .split("T")[0];


                reminders =
                    reminders.map(
                        item => {

                            if (
                                Number(item.id) ===
                                Number(
                                    currentReminder.id
                                )
                            ) {

                                item.lastAdded =
                                    today;

                            }

                            return item;

                        }
                    );


                // ==========================================
                // ONE TIME REMINDER
                // ==========================================

                if (
                    currentReminder.type ===
                    "onetime"
                ) {

                    reminders =
                        reminders.filter(
                            item =>
                                Number(item.id) !==
                                Number(
                                    currentReminder.id
                                )
                        );

                }


                saveReminders(
                    reminders
                );


                // ==========================================
                // CLOSE POPUP
                // ==========================================

                if (reminderPopup) {

                    reminderPopup.style.display =
                        "none";

                }


                currentReminder =
                    null;


                alert(
                    "Reminder completed ✅"
                );

            }
        );

    }


    // ==================================================
    // ============== SKIP REMINDER =====================
    // ==================================================

    if (skipReminderBtn) {

        skipReminderBtn.addEventListener(
            "click",
            function () {

                if (reminderPopup) {

                    reminderPopup.style.display =
                        "none";

                }

                currentReminder =
                    null;

            }
        );

    }


    // ==================================================
    // ============== AUTO CHECK ========================
    // ==================================================

    checkReminder();


    setInterval(
        checkReminder,
        60000
    );


    console.log(
        "Smart Reminder System Ready 🔔"
    );

});