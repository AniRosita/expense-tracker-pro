// ======================================================
// ================= EXPENSE PAGE ========================
// ======================================================

"use strict";

// ======================================================
// ================= LOGIN CHECK =========================
// ======================================================

if (!localStorage.getItem("userEmail")) {
    window.location.href = "index.html";
}


// ======================================================
// ================= API BASE URL ========================
// ======================================================

// Same Railway website + backend
// Example:
// https://expense-tracker-pro-production-b745.up.railway.app
//
// Relative API URL will automatically use the current domain.

const API_BASE = "";


// ======================================================
// ================= DATA ================================
// ======================================================

let expenses = [];


// ======================================================
// ================= ELEMENTS ============================
// ======================================================

const monthFilter =
    document.getElementById("monthFilter");

const yearFilter =
    document.getElementById("yearFilter");

const history =
    document.getElementById("expenseHistory");

const totalExpense =
    document.getElementById("totalExpense");

const amountType =
    document.getElementById("amountFilter");

const amountValue =
    document.getElementById("amountValue");


// ======================================================
// ================= PAGINATION ==========================
// ======================================================

const recordsPerPage = 50;

let currentPage = 1;

let filteredExpenses = [];


// ======================================================
// ================= SAFE EMAIL ===========================
// ======================================================

function getUserEmail() {

    const email =
        localStorage.getItem("userEmail");

    if (!email) {

        window.location.href =
            "index.html";

        return null;
    }

    return email
        .trim()
        .toLowerCase();
}


// ======================================================
// ================= LOAD EXPENSES =======================
// ======================================================

async function loadExpensesFromDatabase() {

    const email =
        getUserEmail();

    if (!email) {
        return false;
    }

    try {

        console.log(
            "======================================"
        );

        console.log(
            "Loading expenses from Railway MySQL..."
        );

        const url =
            `${API_BASE}/expenses/${encodeURIComponent(email)}`;

        console.log(
            "Expense API URL:",
            url
        );

        const response =
            await fetch(url, {

                method: "GET",

                headers: {
                    "Accept": "application/json"
                }

            });

        console.log(
            "Expense API Status:",
            response.status
        );


        // ==================================================
        // RESPONSE CHECK
        // ==================================================

        if (!response.ok) {

            let errorMessage =
                `Expense API Error: ${response.status}`;

            try {

                const errorData =
                    await response.json();

                if (errorData.message) {

                    errorMessage =
                        errorData.message;

                }

            } catch {

                // Ignore JSON parse error

            }

            console.error(
                errorMessage
            );

            throw new Error(
                errorMessage
            );
        }


        // ==================================================
        // JSON DATA
        // ==================================================

        const data =
            await response.json();

        console.log(
            "Expense API Data:",
            data
        );


        // ==================================================
        // SAVE DATA
        // ==================================================

        if (
            data.success &&
            Array.isArray(data.expenses)
        ) {

            expenses =
                data.expenses;

            console.log(
                "Expenses Loaded Successfully ✅",
                expenses
            );

        } else {

            expenses = [];

            console.log(
                data.message ||
                "No expenses found"
            );

        }


        console.log(
            "======================================"
        );


        return true;


    } catch (error) {

        console.error(
            "Expense Page Load Error:",
            error
        );


        expenses = [];


        if (history) {

            history.innerHTML = `

                <div style="
                    text-align:center;
                    padding:30px;
                ">

                    <h3>
                        Unable to load expenses
                    </h3>

                    <p>
                        Please check the server connection.
                    </p>

                    <button
                        type="button"
                        onclick="loadExpensesAndRefresh()"
                    >
                        Retry
                    </button>

                </div>

            `;

        }


        return false;
    }

}


// ======================================================
// ================= RETRY LOAD ==========================
// ======================================================

async function loadExpensesAndRefresh() {

    if (history) {

        history.innerHTML = `

            <div style="
                text-align:center;
                padding:30px;
            ">

                <h3>
                    Loading expenses...
                </h3>

            </div>

        `;

    }


    const loaded =
        await loadExpensesFromDatabase();


    if (loaded) {

        loadYearList();

        currentPage = 1;

        showExpense();

    }

}


// ======================================================
// ================= YEAR LIST ===========================
// ======================================================

function loadYearList() {

    if (!yearFilter) {
        return;
    }


    // Remove previously generated years

    yearFilter
        .querySelectorAll(".dynamic-year")
        .forEach(option => {

            option.remove();

        });


    let years = [];


    expenses.forEach(item => {

        if (!item.date) {
            return;
        }


        const date =
            new Date(item.date);


        if (!isNaN(date.getTime())) {

            const year =
                date.getFullYear();


            if (!years.includes(year)) {

                years.push(year);

            }

        }

    });


    years.sort(
        (a, b) => a - b
    );


    years.forEach(year => {

        const option =
            document.createElement("option");


        option.value =
            year;


        option.innerText =
            year;


        option.classList.add(
            "dynamic-year"
        );


        yearFilter.appendChild(
            option
        );

    });

}


// ======================================================
// ================= FILTER FUNCTION =====================
// ======================================================

function filterExpenses() {

    const month =
        monthFilter
            ? monthFilter.value
            : "all";


    const year =
        yearFilter
            ? yearFilter.value
            : "all";


    const amount =
        Number(
            amountValue?.value || 0
        );


    filteredExpenses =
        expenses.filter(item => {

            if (!item.date) {
                return false;
            }


            const date =
                new Date(item.date);


            if (isNaN(date.getTime())) {
                return false;
            }


            const itemMonth =
                date.getMonth();


            const itemYear =
                date.getFullYear();


            const matchMonth =

                month === "all"

                ||

                Number(month) === itemMonth;


            const matchYear =

                year === "all"

                ||

                Number(year) === itemYear;


            let matchAmount =
                true;


            // BELOW

            if (
                amountType &&
                amountType.value === "below" &&
                amount > 0
            ) {

                matchAmount =
                    Number(item.amount) < amount;

            }


            // ABOVE

            if (
                amountType &&
                amountType.value === "above" &&
                amount > 0
            ) {

                matchAmount =
                    Number(item.amount) > amount;

            }


            // EXACT

            if (
                amountType &&
                (
                    amountType.value === "equal" ||
                    amountType.value === "equals"
                ) &&
                amount > 0
            ) {

                matchAmount =
                    Number(item.amount) === amount;

            }


            return (
                matchMonth &&
                matchYear &&
                matchAmount
            );

        });

}


// ======================================================
// ================= FORMAT AMOUNT =======================
// ======================================================

function formatExpenseAmount(amount) {

    const value =
        Number(amount) || 0;


    if (
        typeof formatCurrency ===
        "function"
    ) {

        return formatCurrency(value);

    }


    return (
        "₹" +
        value.toFixed(2)
    );

}


// ======================================================
// ================= ESCAPE HTML =========================
// ======================================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ======================================================
// ================= FORMAT DATE ==========================
// ======================================================

function formatExpenseDate(dateValue) {

    const date =
        new Date(dateValue);


    if (isNaN(date.getTime())) {

        return "Invalid date";

    }


    return `

        ${date.getDate()}

        ${date.toLocaleString(
            "default",
            {
                month: "long"
            }
        )}

        ${date.getFullYear()}

    `;

}


// ======================================================
// ================= SHOW EXPENSE ========================
// ======================================================

function showExpense() {

    if (!history) {
        return;
    }


    filterExpenses();


    history.innerHTML =
        "";


    // ==================================================
    // TOTAL EXPENSE
    // ==================================================

    let total =
        0;


    filteredExpenses.forEach(item => {

        total +=
            Number(item.amount) || 0;

    });


    if (totalExpense) {

        totalExpense.innerText =
            formatExpenseAmount(total);

    }


    // ==================================================
    // PAGINATION
    // ==================================================

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                filteredExpenses.length /
                recordsPerPage
            )
        );


    if (currentPage > totalPages) {

        currentPage =
            totalPages;

    }


    if (currentPage < 1) {

        currentPage =
            1;

    }


    const startIndex =
        (currentPage - 1) *
        recordsPerPage;


    const endIndex =
        startIndex +
        recordsPerPage;


    const pageExpenses =
        filteredExpenses.slice(
            startIndex,
            endIndex
        );


    // ==================================================
    // NO DATA
    // ==================================================

    if (pageExpenses.length === 0) {

        history.innerHTML = `

            <div style="
                text-align:center;
                padding:30px;
            ">

                <h3>
                    No Expenses Found
                </h3>

            </div>

        `;


        createPagination();

        return;

    }


    // ==================================================
    // EXPENSE CARDS
    // ==================================================

    let html =
        "";


    pageExpenses.forEach(item => {

        const displayName =
            escapeHTML(
                item.name ||
                "Expense"
            );


        const displayCategory =
            escapeHTML(
                item.category ||
                "Others"
            );


        const displayAmount =
            formatExpenseAmount(
                item.amount
            );


        const displayDate =
            formatExpenseDate(
                item.date
            );


        html += `

            <div class="expense-card">

                <div class="line">

                    <h3>
                        ${displayName}
                    </h3>

                    <p>
                        ${displayAmount}
                    </p>

                </div>

                <p>
                    Category :
                    ${displayCategory}
                </p>

                <span>
                    ${displayDate}
                </span>

            </div>

        `;

    });


    history.innerHTML =
        html;


    // ==================================================
    // PAGINATION
    // ==================================================

    createPagination();

}


// ======================================================
// ================= PAGINATION ==========================
// ======================================================

function createPagination() {

    const oldPagination =
        document.getElementById(
            "pagination"
        );


    if (oldPagination) {

        oldPagination.remove();

    }


    const totalPages =
        Math.ceil(
            filteredExpenses.length /
            recordsPerPage
        );


    if (totalPages <= 1) {

        return;

    }


    const pagination =
        document.createElement("div");


    pagination.id =
        "pagination";


    pagination.style.textAlign =
        "center";


    pagination.style.marginTop =
        "20px";


    pagination.innerHTML = `

        <button
            id="prevBtn"
            type="button"
            ${currentPage <= 1 ? "disabled" : ""}
        >
            ◀ Previous
        </button>

        <span style="margin:0 15px;">

            Page
            ${currentPage}
            of
            ${totalPages}

        </span>

        <button
            id="nextBtn"
            type="button"
            ${currentPage >= totalPages ? "disabled" : ""}
        >
            Next ▶
        </button>

    `;


    history.after(
        pagination
    );


    const prevBtn =
        document.getElementById(
            "prevBtn"
        );


    const nextBtn =
        document.getElementById(
            "nextBtn"
        );


    // ==================================================
    // PREVIOUS
    // ==================================================

    if (prevBtn) {

        prevBtn.onclick =
            function () {

                if (currentPage > 1) {

                    currentPage--;

                    showExpense();

                    window.scrollTo({
                        top: 0,
                        behavior: "smooth"
                    });

                }

            };

    }


    // ==================================================
    // NEXT
    // ==================================================

    if (nextBtn) {

        nextBtn.onclick =
            function () {

                if (
                    currentPage <
                    totalPages
                ) {

                    currentPage++;

                    showExpense();

                    window.scrollTo({
                        top: 0,
                        behavior: "smooth"
                    });

                }

            };

    }

}


// ======================================================
// ================= FILTER EVENTS =======================
// ======================================================

if (monthFilter) {

    monthFilter.addEventListener(
        "change",
        () => {

            currentPage =
                1;

            showExpense();

        }
    );

}


if (yearFilter) {

    yearFilter.addEventListener(
        "change",
        () => {

            currentPage =
                1;

            showExpense();

        }
    );

}


if (amountType) {

    amountType.addEventListener(
        "change",
        () => {

            currentPage =
                1;

            showExpense();

        }
    );

}


if (amountValue) {

    amountValue.addEventListener(
        "input",
        () => {

            currentPage =
                1;

            showExpense();

        }
    );

}


// ======================================================
// ================= PDF DOWNLOAD ========================
// ======================================================

const pdfBtn =
    document.getElementById(
        "downloadPdf"
    );


if (pdfBtn) {

    pdfBtn.onclick =
        function () {

            if (
                typeof window.jspdf ===
                "undefined"
            ) {

                alert(
                    "PDF library not loaded"
                );

                return;
            }


            const { jsPDF } =
                window.jspdf;


            const pdf =
                new jsPDF();


            pdf.setFontSize(
                18
            );


            pdf.text(
                "Expense Tracker Report",
                20,
                20
            );


            let y =
                35;


            filterExpenses();


            if (
                filteredExpenses.length ===
                0
            ) {

                pdf.setFontSize(
                    12
                );

                pdf.text(
                    "No expenses found.",
                    20,
                    y
                );

                pdf.save(
                    "Expense_Report.pdf"
                );

                return;

            }


            filteredExpenses.forEach(
                item => {

                    if (y > 270) {

                        pdf.addPage();

                        y = 20;

                    }


                    const amount =
                        formatExpenseAmount(
                            item.amount
                        );


                    const name =
                        String(
                            item.name ||
                            "Expense"
                        );


                    const category =
                        String(
                            item.category ||
                            "Others"
                        );


                    const date =
                        String(
                            item.date ||
                            ""
                        );


                    const text =

                        `${name} | ${amount} | ${category} | ${date}`;


                    pdf.setFontSize(
                        10
                    );


                    pdf.text(
                        text,
                        20,
                        y
                    );


                    y +=
                        10;

                }
            );


            pdf.save(
                "Expense_Report.pdf"
            );

        };

}


// ======================================================
// ================= EXCEL DOWNLOAD ======================
// ======================================================

const excelBtn =
    document.getElementById(
        "downloadExcel"
    );


if (excelBtn) {

    excelBtn.onclick =
        function () {

            if (
                typeof XLSX ===
                "undefined"
            ) {

                alert(
                    "Excel library not loaded"
                );

                return;

            }


            filterExpenses();


            if (
                filteredExpenses.length ===
                0
            ) {

                alert(
                    "No expenses found to export."
                );

                return;

            }


            const data =
                filteredExpenses.map(
                    item => ({

                        Name:
                            item.name ||
                            "Expense",

                        Amount:
                            Number(
                                item.amount
                            ) || 0,

                        Category:
                            item.category ||
                            "Others",

                        Date:
                            item.date ||
                            ""

                    })
                );


            const sheet =
                XLSX.utils.json_to_sheet(
                    data
                );


            const book =
                XLSX.utils.book_new();


            XLSX.utils.book_append_sheet(
                book,
                sheet,
                "Expenses"
            );


            XLSX.writeFile(
                book,
                "Expense_Report.xlsx"
            );

        };

}


// ======================================================
// ================= VIEW REPORT =========================
// ======================================================

const reportBtn =
    document.getElementById(
        "viewReport"
    );


if (reportBtn) {

    reportBtn.onclick =
        function () {

            currentPage =
                1;

            showExpense();

        };

}


// ======================================================
// ================= DASHBOARD ============================
// ======================================================

function goDashboard() {

    window.location.href =
        "dashboard.html";

}


// ======================================================
// ================= LOAD SAVED THEME ====================
// ======================================================

function loadSavedTheme() {

    const savedTheme =
        localStorage.getItem(
            "theme"
        );


    document.body.classList.remove(
        "light-mode",
        "dark-mode"
    );


    if (
        savedTheme ===
        "light"
    ) {

        document.body.classList.add(
            "light-mode"
        );

    } else {

        document.body.classList.add(
            "dark-mode"
        );

    }

}


// ======================================================
// ================= INITIAL PAGE LOAD ===================
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        console.log(
            "======================================"
        );

        console.log(
            "Expense Page Loading..."
        );

        console.log(
            "User:",
            localStorage.getItem(
                "userEmail"
            )
        );

        console.log(
            "API Base:",
            API_BASE || "(same domain)"
        );

        console.log(
            "======================================"
        );


        loadSavedTheme();


        const loaded =
            await loadExpensesFromDatabase();


        if (loaded) {

            loadYearList();


            currentPage =
                1;


            showExpense();


            console.log(
                "Expense Page Loaded Successfully ✅"
            );

        }

    }
);