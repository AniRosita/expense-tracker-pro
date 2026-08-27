// ================= DELETE HISTORY / TRASH =================

let historyData = [];


// ================= LOGIN CHECK =================

const email = localStorage.getItem("userEmail");

if (!email) {
    window.location.href = "index.html";
}


// ================= LOAD SAVED THEME =================

function loadTheme() {

    const savedTheme =
        localStorage.getItem("theme");

    if (savedTheme === "light") {

        document.body.classList.add("light-mode");

    } else {

        document.body.classList.remove("light-mode");

    }

}

// ================= LOAD TRASH FROM MYSQL =================

async function loadHistory() {

    try {

        const response =
            await fetch(
                "/trash/" +
                encodeURIComponent(email)
            );

        if (!response.ok) {

            throw new Error(
                "Trash API Error: " +
                response.status
            );

        }

        const data =
            await response.json();

        if (data.success) {

            historyData =
                data.trash || [];

            showHistory();

        } else {

            showNoHistory();

        }

    } catch (error) {

        console.error(
            "Trash Load Error:",
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
                        Please check the server connection.
                    </p>

                </div>

            `;

        }

    }

}


// ================= SHOW NO HISTORY =================

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


// ================= SHOW HISTORY =================

function showHistory() {

    const box =
        document.getElementById(
            "historyList"
        );

    if (!box) return;

    box.innerHTML = "";


    // ================= TYPE FILTER =================

    const typeSelect =
        document.getElementById(
            "historyType"
        );

    const selectedType =
        typeSelect
            ? typeSelect.value.toLowerCase()
            : "all";


    // ================= DATE FILTER =================

    const dateSelect =
        document.getElementById(
            "dateFilter"
        );

    const selectedDate =
        dateSelect
            ? dateSelect.value
            : "all";


    // ================= FILTER DATA =================

    let data =
        historyData.filter(item => {

            const itemType =
                String(
                    item.transaction_type || ""
                ).toLowerCase();


            // TYPE FILTER

            if (
                selectedType !== "all" &&
                itemType !== selectedType
            ) {

                return false;

            }


            // DATE FILTER

            if (
                selectedDate === "all"
            ) {

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


            // LAST 30 DAYS

            if (
                selectedDate === "month"
            ) {

                return days <= 30;

            }


            // OLDER RECORDS

            if (
                selectedDate === "old"
            ) {

                return days > 30;

            }


            return true;

        });


    // ================= NO RESULTS =================

    if (data.length === 0) {

        showNoHistory();

        return;

    }


    // ================= DISPLAY RECORDS =================

    data.forEach(item => {


        // ================= DELETED DATE =================

        const deletedDate =
            new Date(
                item.deleted_at
            );


        // ================= DAYS LEFT =================

        let daysLeft = 60;


        if (
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


        // ================= ORIGINAL DATE =================

        const originalDate =
            item.date
                ? new Date(
                    item.date
                  ).toLocaleDateString(
                    "en-IN"
                  )
                : "-";


        // ================= DELETED DATE TEXT =================

        const deletedDateText =
            !isNaN(
                deletedDate.getTime()
            )
                ? deletedDate.toLocaleDateString(
                    "en-IN"
                  )
                : "-";


        // ================= TYPE =================

        const typeText =
            String(
                item.transaction_type ||
                "unknown"
            ).toUpperCase();


        // ================= AMOUNT =================

        const amount =
            Number(
                item.amount || 0
            ).toLocaleString(
                "en-IN"
            );


        // ================= CREATE CARD =================

        const card =
            document.createElement(
                "div"
            );

        card.className =
            "history-item";


        card.innerHTML = `

            <div>

                <h3>
                    ${item.name || "Income"}
                </h3>


                <p>
                    <strong>Type:</strong>
                    ${typeText}
                </p>


                <p>
                    <strong>Amount:</strong>
                    ₹${amount}
                </p>


                <p>
                    <strong>Category:</strong>
                    ${item.category || "-"}
                </p>


                <p>
                    <strong>Original Date:</strong>
                    ${originalDate}
                </p>


                <p>
                    <strong>Deleted On:</strong>
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
                    onclick="restoreItem(${item.id})"
                >

                    ♻️ Restore

                </button>

            </div>

        `;


        box.appendChild(
            card
        );

    });

}


// ================= RESTORE ITEM =================

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


    if (!result.isConfirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                "/trash/restore/" + id,
                {
                    method: "POST"
                }
            );


        const data =
            await response.json();


        if (!response.ok || !data.success) {

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


        // Reload Trash

        loadHistory();


    } catch (error) {

        console.error(
            "Restore Error:",
            error
        );


        Swal.fire({

            title:
                "Restore Failed",

            text:
                error.message,

            icon:
                "error"

        });

    }

}


// ================= FILTER EVENTS =================

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


// ================= DASHBOARD =================

function goDashboard() {

    window.location.href =
        "dashboard.html";

}


// ================= APPLY THEME =================

loadTheme();


// ================= AUTO REFRESH =================

// Refresh every minute so remaining days stay updated.

setInterval(() => {

    loadTheme();

    showHistory();

}, 60000);


// ================= START =================

loadHistory();
document.addEventListener("DOMContentLoaded", () => {

    loadTheme();

});
