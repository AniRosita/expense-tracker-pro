// ======================================================
// ============== DELETE HISTORY / TRASH ===============
// ======================================================

let historyData = [];


// ======================================================
// ================= API BASE ===========================
// ======================================================

const API_BASE =
    "https://expense-tracker-pro-production-b745.up.railway.app";


// ======================================================
// ================= LOGIN CHECK ========================
// ======================================================

const email = localStorage.getItem("userEmail");

if (!email) {
    window.location.href = "index.html";
}


// ======================================================
// ================= LOAD THEME =========================
// ======================================================

function loadTheme() {

    const savedTheme =
        localStorage.getItem("theme");

    if (savedTheme === "light") {

        document.body.classList.add("light-mode");

    } else {

        document.body.classList.remove("light-mode");

    }
}


// ======================================================
// ================= LOAD TRASH =========================
// ======================================================

async function loadHistory() {

    if (!email) return;

    try {

        console.log(
            "➡️ Trash API:",
            `${API_BASE}/trash/${encodeURIComponent(email)}`
        );

        const response =
            await fetch(
                `${API_BASE}/trash/${encodeURIComponent(email)}`,
                {
                    method: "GET",
                    headers: {
                        "Accept": "application/json"
                    }
                }
            );


        console.log(
            "⬅️ Trash API Status:",
            response.status
        );


        const data =
            await response.json();


        console.log(
            "🗑 Trash API Response:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.message ||
                `Trash API Error: ${response.status}`
            );

        }


        if (data.success) {

            historyData =
                Array.isArray(data.trash)
                    ? data.trash
                    : [];


            console.log(
                "🗑 Deleted Records:",
                historyData
            );


            showHistory();

        } else {

            historyData = [];

            showNoHistory();

        }

    } catch (error) {

        console.error(
            "❌ Trash Load Error:",
            error
        );


        const box =
            document.getElementById(
                "historyList"
            );


        if (box) {

            box.innerHTML = `

                <div class="no-history">

                    <h3>
                        Unable to load Delete History
                    </h3>

                    <p>
                        ${error.message || "Server connection failed."}
                    </p>

                    <button
                        onclick="loadHistory()"
                        style="
                            margin-top:15px;
                            padding:10px 20px;
                            border:none;
                            border-radius:8px;
                            cursor:pointer;
                        "
                    >
                        🔄 Retry
                    </button>

                </div>

            `;

        }

    }

}


// ======================================================
// ================= NO HISTORY =========================
// ======================================================

function showNoHistory() {

    const box =
        document.getElementById(
            "historyList"
        );


    if (!box) return;


    box.innerHTML = `

        <div class="no-history">

            <h3>
                No History Found
            </h3>

            <p>
                Deleted records will appear here.
            </p>

        </div>

    `;

}


// ======================================================
// ================= SHOW HISTORY =======================
// ======================================================

function showHistory() {

    const box =
        document.getElementById(
            "historyList"
        );


    if (!box) return;


    // Clear old records

    box.innerHTML = "";


    // ==================================================
    // TYPE FILTER
    // ==================================================

    const typeSelect =
        document.getElementById(
            "historyType"
        );


    const selectedType =
        typeSelect
            ? String(typeSelect.value).toLowerCase()
            : "all";


    // ==================================================
    // DATE FILTER
    // ==================================================

    const dateSelect =
        document.getElementById(
            "dateFilter"
        );


    const selectedDate =
        dateSelect
            ? dateSelect.value
            : "all";


    // ==================================================
    // FILTER
    // ==================================================

    const data =
        historyData.filter(item => {

            const itemType =
                String(
                    item.type || ""
                ).toLowerCase();


            if (
                selectedType !== "all" &&
                itemType !== selectedType
            ) {

                return false;

            }


            if (
                selectedDate === "all"
            ) {

                return true;

            }


            if (!item.deleted_at) {

                return true;

            }


            const deletedDate =
                new Date(
                    item.deleted_at
                );


            if (
                isNaN(
                    deletedDate.getTime()
                )
            ) {

                return true;

            }


            const now =
                new Date();


            const difference =
                now - deletedDate;


            const days =
                difference /
                (1000 * 60 * 60 * 24);


            if (
                selectedDate === "month"
            ) {

                return days <= 30;

            }


            if (
                selectedDate === "old"
            ) {

                return days > 30;

            }


            return true;

        });


    // ==================================================
    // NO RESULTS
    // ==================================================

    if (
        data.length === 0
    ) {

        showNoHistory();

        return;

    }


    // ==================================================
    // DISPLAY
    // ==================================================

    data.forEach(item => {

        const deletedDate =
            item.deleted_at
                ? new Date(item.deleted_at)
                : null;


        // ==============================================
        // DAYS LEFT
        // ==============================================

        let daysLeft = 60;


        if (
            deletedDate &&
            !isNaN(
                deletedDate.getTime()
            )
        ) {

            const now =
                new Date();


            const difference =
                now - deletedDate;


            const daysPassed =
                Math.floor(
                    difference /
                    (1000 * 60 * 60 * 24)
                );


            daysLeft =
                Math.max(
                    0,
                    60 - daysPassed
                );

        }


        // ==============================================
        // ORIGINAL DATE
        // ==============================================

        let originalDate = "-";


        if (item.date) {

            const d =
                new Date(item.date);


            if (
                !isNaN(
                    d.getTime()
                )
            ) {

                originalDate =
                    d.toLocaleDateString(
                        "en-IN"
                    );

            }

        }


        // ==============================================
        // DELETED DATE
        // ==============================================

        let deletedDateText = "-";


        if (
            deletedDate &&
            !isNaN(
                deletedDate.getTime()
            )
        ) {

            deletedDateText =
                deletedDate.toLocaleDateString(
                    "en-IN"
                );

        }


        // ==============================================
        // TYPE
        // ==============================================

        const typeText =
            String(
                item.type ||
                "unknown"
            ).toUpperCase();


        // ==============================================
        // AMOUNT
        // ==============================================

        const amount =
            Number(
                item.amount || 0
            ).toLocaleString(
                "en-IN"
            );


        // ==============================================
        // CARD
        // ==============================================

        const card =
            document.createElement(
                "div"
            );


        card.className =
            "history-item";


        card.innerHTML = `

            <div>

                <h3>
                    ${escapeHTML(
                        item.name ||
                        (item.type === "income"
                            ? "Income"
                            : "Expense")
                    )}
                </h3>


                <p>

                    <strong>
                        Type:
                    </strong>

                    ${typeText}

                </p>


                <p>

                    <strong>
                        Amount:
                    </strong>

                    ₹${amount}

                </p>


                <p>

                    <strong>
                        Category:
                    </strong>

                    ${escapeHTML(
                        item.category || "-"
                    )}

                </p>


                <p>

                    <strong>
                        Original Date:
                    </strong>

                    ${originalDate}

                </p>


                <p>

                    <strong>
                        Deleted On:
                    </strong>

                    ${deletedDateText}

                </p>


                <p class="days-left">

                    🕒

                    <strong>
                        ${daysLeft} day(s) remaining
                    </strong>

                    before permanent deletion.

                </p>


                <button
                    class="restore-btn"
                    onclick="restoreItem(${Number(item.id)})"
                >

                    ♻️ Restore

                </button>


            </div>

        `;


        box.appendChild(card);

    });

}


// ======================================================
// ================= ESCAPE HTML =======================
// ======================================================

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ======================================================
// ================= RESTORE ITEM =======================
// ======================================================

async function restoreItem(id) {

    const result =
        await Swal.fire({

            title:
                "Restore this record?",

            text:
                "This record will be moved back to your Income/Expense list.",

            icon:
                "question",

            showCancelButton:
                true,

            confirmButtonText:
                "Yes, Restore",

            cancelButtonText:
                "Cancel"

        });


    if (
        !result.isConfirmed
    ) {

        return;

    }


    try {

        console.log(
            "➡️ Restore:",
            id
        );


        const response =
            await fetch(
                `${API_BASE}/trash/restore/${id}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                        "Accept":
                            "application/json"
                    }
                }
            );


        const data =
            await response.json();


        console.log(
            "⬅️ Restore Response:",
            data
        );


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Restore failed"
            );

        }


        await Swal.fire({

            title:
                "Restored! ♻️",

            text:
                data.message ||
                "Record restored successfully.",

            icon:
                "success",

            confirmButtonText:
                "OK"

        });


        await loadHistory();

    } catch (error) {

        console.error(
            "❌ Restore Error:",
            error
        );


        Swal.fire({

            title:
                "Restore Failed",

            text:
                error.message ||
                "Unable to restore record.",

            icon:
                "error"

        });

    }

}


// ======================================================
// ================= FILTER EVENTS ======================
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadTheme();


        const historyType =
            document.getElementById(
                "historyType"
            );


        if (historyType) {

            historyType.addEventListener(
                "change",
                showHistory
            );

        }


        const dateFilter =
            document.getElementById(
                "dateFilter"
            );


        if (dateFilter) {

            dateFilter.addEventListener(
                "change",
                showHistory
            );

        }


        loadHistory();

    }
);


// ======================================================
// ================= DASHBOARD ==========================
// ======================================================

function goDashboard() {

    window.location.href =
        "dashboard.html";

}


// ======================================================
// ================= AUTO REFRESH =======================
// ======================================================

setInterval(
    () => {

        loadTheme();

        loadHistory();

    },
    60000
);