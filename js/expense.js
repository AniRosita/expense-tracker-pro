// ======================================================
// ================= EXPENSE PAGE ========================
// ======================================================


// ======================================================
// ================= LOGIN CHECK =========================
// ======================================================

if (!localStorage.getItem("userEmail")) {

    window.location.href = "index.html";

}


// ======================================================
// ================= API BASE URL ========================
// ======================================================

// Railway + Localhost இரண்டிலும் வேலை செய்யும்
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
// ================= LOAD EXPENSES FROM MYSQL ============
// ======================================================

async function loadExpensesFromDatabase() {

    const email =
        localStorage.getItem("userEmail");


    if (!email) {

        window.location.href = "index.html";

        return;

    }


    try {

        console.log(
            "Loading expenses from MySQL..."
        );


        const response =
            await fetch(

                API_BASE +
                "/expenses/" +
                encodeURIComponent(email)

            );


        if (!response.ok) {

            throw new Error(
                "Expense API Error: " +
                response.status
            );

        }


        const data =
            await response.json();


        if (
            data.success &&
            Array.isArray(data.expenses)
        ) {

            expenses =
                data.expenses;


            console.log(
                "Expense Page - MySQL Data Loaded:",
                expenses
            );

        } else {

            expenses = [];


            console.log(
                data.message ||
                "No expenses found"
            );

        }


    } catch (error) {

        console.error(
            "Expense Page Load Error:",
            error
        );


        expenses = [];


        if (history) {

            history.innerHTML =
                "<h3>Unable to load expenses. Please check the server connection.</h3>";

        }

        return;

    }

}


// ======================================================
// ================= YEAR LIST ===========================
// ======================================================

function loadYearList() {

    if (!yearFilter) {

        return;

    }


    // Remove previously added dynamic years

    yearFilter
        .querySelectorAll(".dynamic-year")
        .forEach(option => {

            option.remove();

        });


    let years = [];


    expenses.forEach(item => {

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


            const date =
                new Date(item.date);


            if (
                isNaN(date.getTime())
            ) {

                return false;

            }


            const itemMonth =
                date.getMonth();


            const itemYear =
                date.getFullYear();


            // ================= MONTH =================

            const matchMonth =

                month === "all"

                ||

                Number(month) ===
                itemMonth;


            // ================= YEAR =================

            const matchYear =

                year === "all"

                ||

                Number(year) ===
                itemYear;


            // ================= AMOUNT =================

            let matchAmount = true;


            if (
                amountType &&
                amountType.value === "below" &&
                amount
            ) {

                matchAmount =
                    Number(item.amount) <
                    amount;

            }


            if (
                amountType &&
                amountType.value === "above" &&
                amount
            ) {

                matchAmount =
                    Number(item.amount) >
                    amount;

            }


            return (

                matchMonth &&

                matchYear &&

                matchAmount

            );

        });

}


// ======================================================
// ================= SHOW EXPENSE ========================
// ======================================================

function showExpense() {

    if (!history) {

        return;

    }


    filterExpenses();


    history.innerHTML = "";


    // ==================================================
    // ================= TOTAL ==========================
    // ==================================================

    let total = 0;


    filteredExpenses.forEach(item => {

        total +=
            Number(item.amount) || 0;

    });


    // ==================================================
    // ================= CURRENCY =======================
    // ==================================================

    if (totalExpense) {

        if (
            typeof formatCurrency ===
            "function"
        ) {

            totalExpense.innerText =
                formatCurrency(total);

        } else {

            totalExpense.innerText =
                "₹" +
                Number(total).toFixed(2);

        }

    }


    // ==================================================
    // ================= PAGINATION =====================
    // ==================================================

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
    // ================= EMPTY CHECK ====================
    // ==================================================

    if (
        pageExpenses.length === 0
    ) {

        history.innerHTML =
            "<h3>No Expenses Found</h3>";


        createPagination();


        return;

    }


    // ==================================================
    // ================= CREATE HTML ====================
    // ==================================================

    let html = "";


    pageExpenses.forEach(item => {


        const date =
            new Date(item.date);


        let displayAmount;


        if (
            typeof formatCurrency ===
            "function"
        ) {

            displayAmount =
                formatCurrency(
                    Number(item.amount) || 0
                );

        } else {

            displayAmount =
                "₹" +
                Number(item.amount || 0)
                    .toFixed(2);

        }


        html += `

        <div class="expense-card">

            <div class="line">

                <h3>
                    ${item.name || "Expense"}
                </h3>

                <p>
                    ${displayAmount}
                </p>

            </div>


            <p>
                Category :
                ${item.category || "Others"}
            </p>


            <span>

                ${date.getDate()}

                ${date.toLocaleString(
                    "default",
                    {
                        month: "long"
                    }
                )}

                ${date.getFullYear()}

            </span>


        </div>

        `;

    });


    history.innerHTML =
        html;


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


    if (
        totalPages <= 1
    ) {

        return;

    }


    const pagination =
        document.createElement(
            "div"
        );


    pagination.id =
        "pagination";


    pagination.style.textAlign =
        "center";


    pagination.style.marginTop =
        "20px";


    pagination.innerHTML = `

        <button id="prevBtn">
            ◀ Previous
        </button>


        <span style="margin:0 15px;">

            Page
            ${currentPage}
            of
            ${totalPages}

        </span>


        <button id="nextBtn">
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


    // ================= PREVIOUS =================

    if (prevBtn) {

        prevBtn.onclick =
            function () {

                if (
                    currentPage > 1
                ) {

                    currentPage--;

                    showExpense();

                }

            };

    }


    // ================= NEXT =================

    if (nextBtn) {

        nextBtn.onclick =
            function () {

                if (
                    currentPage <
                    totalPages
                ) {

                    currentPage++;

                    showExpense();

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

            currentPage = 1;

            showExpense();

        }
    );

}


if (yearFilter) {

    yearFilter.addEventListener(
        "change",
        () => {

            currentPage = 1;

            showExpense();

        }
    );

}


if (amountType) {

    amountType.addEventListener(
        "change",
        () => {

            currentPage = 1;

            showExpense();

        }
    );

}


if (amountValue) {

    amountValue.addEventListener(
        "input",
        () => {

            currentPage = 1;

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


            const {
                jsPDF
            } = window.jspdf;


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


            let y = 35;


            filterExpenses();


            filteredExpenses.forEach(
                item => {


                    if (y > 270) {

                        pdf.addPage();

                        y = 20;

                    }


                    let amount;


                    if (
                        typeof formatCurrency ===
                        "function"
                    ) {

                        amount =
                            formatCurrency(
                                Number(
                                    item.amount
                                ) || 0
                            );

                    } else {

                        amount =
                            "₹" +
                            Number(
                                item.amount || 0
                            ).toFixed(2);

                    }


                    pdf.text(

                        `${item.name} | ${amount} | ${item.category} | ${item.date}`,

                        20,

                        y

                    );


                    y += 10;

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


            const data =
                filteredExpenses.map(
                    item => ({

                        Name:
                            item.name,

                        Amount:
                            item.amount,

                        Category:
                            item.category,

                        Date:
                            item.date

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

            currentPage = 1;

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
        savedTheme === "light"
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
            "Expense Page Loading..."
        );


        // ================= THEME =================

        loadSavedTheme();


        // ================= MYSQL =================

        await loadExpensesFromDatabase();


        // ================= YEAR LIST =============

        loadYearList();


        // ================= RESET PAGE =============

        currentPage = 1;


        // ================= DISPLAY ================

        showExpense();


        console.log(
            "Expense Page Loaded Successfully ✅"
        );


    }
);