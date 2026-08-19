// ================= DELETE HISTORY DATA =================

let historyData = [];


// ================= LOAD HISTORY FROM MYSQL =================

async function loadHistory() {

    const email =
        localStorage.getItem("userEmail");


    // ================= LOGIN CHECK =================

    if (!email) {

        window.location.href = "index.html";

        return;

    }


    try {

        const response =
            await fetch(
                "http://localhost:5000/delete-history/" +
                encodeURIComponent(email)
            );


        const data =
            await response.json();


        if (data.success) {

            historyData =
                data.history || [];

            showHistory();

        } else {

            showNoHistory();

        }


    } catch (error) {

        console.error(
            "History Load Error:",
            error
        );


        const box =
            document.getElementById("historyList");


        if (box) {

            box.innerHTML = `

                <div class="no-history">

                    <h3>
                        Unable to load Delete History
                    </h3>

                    <p>
                        Please make sure the server is running.
                    </p>

                </div>

            `;

        }

    }

}


// ================= SHOW NO HISTORY =================

function showNoHistory() {

    const box =
        document.getElementById("historyList");


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
        document.getElementById("historyList");


    if (!box) return;


    box.innerHTML = "";


    // ================= TYPE FILTER =================

    const typeSelect =
        document.getElementById("historyType");


    const selectedType =
        typeSelect
            ? typeSelect.value.toLowerCase()
            : "all";


    // ================= DATE FILTER =================

    const dateSelect =
        document.getElementById("dateFilter");


    const selectedDate =
        dateSelect
            ? dateSelect.value
            : "all";


    // ================= FILTER DATA =================

    let data =
        historyData.filter(item => {


            // ================= TYPE FILTER =================

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


            // ================= DATE FILTER =================

            if (
                selectedDate === "all"
            ) {

                return true;

            }


            const deletedDate =
                new Date(item.deleted_at);


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


            // ================= LAST 30 DAYS =================

            if (
                selectedDate === "month"
            ) {

                return days <= 30;

            }


            // ================= OLDER RECORDS =================

            if (
                selectedDate === "old"
            ) {

                return days > 30;

            }


            return true;

        });


    // ================= NO HISTORY =================

    if (data.length === 0) {

        showNoHistory();

        return;

    }


    // ================= DISPLAY RECORDS =================

    data.forEach(item => {


        // ================= DELETED DATE =================

        const deletedDate =
            new Date(item.deleted_at);


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
                  ).toLocaleDateString("en-IN")
                : "-";


        // ================= DELETED DATE TEXT =================

        const deletedDateText =
            !isNaN(
                deletedDate.getTime()
            )
                ? deletedDate.toLocaleDateString("en-IN")
                : "-";


        // ================= TYPE =================

        const typeText =
            String(
                item.type || "unknown"
            ).toUpperCase();


        // ================= AMOUNT =================

        const amount =
            Number(
                item.amount || 0
            ).toLocaleString("en-IN");


        // ================= CREATE HISTORY ITEM =================

        const card =
            document.createElement("div");


        card.className =
            "history-item";


        card.innerHTML = `

            <div>

                <h3>
                    ${item.name || "Unknown"}
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

            </div>

        `;


        box.appendChild(card);

    });

}


// ================= HISTORY TYPE FILTER =================

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


// ================= DATE FILTER =================

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


// ================= LOAD DASHBOARD THEME =================

function loadSavedTheme() {

    const savedTheme =
        localStorage.getItem("darkMode");


    if (
        savedTheme === "true"
    ) {

        document.body.classList.remove(
            "light-mode"
        );

        document.body.classList.add(
            "dark-mode"
        );

    } else {

        document.body.classList.remove(
            "dark-mode"
        );

        document.body.classList.add(
            "light-mode"
        );

    }

}


// ================= APPLY SAVED THEME =================

loadSavedTheme();


// ================= AUTO REFRESH =================

// Update remaining days every minute

setInterval(() => {

    showHistory();

}, 60000);


// ================= START =================

loadHistory();