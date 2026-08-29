// ======================================================
// ================= EXPENSE PAGE ========================
// ============== RAILWAY MYSQL + IMPORT =================
// ======================================================

"use strict";

// ======================================================
// ================= API BASE URL ========================
// ======================================================

const API_BASE =
    "https://expense-tracker-pro-production-b745.up.railway.app";

// ======================================================
// ================= LOGIN CHECK =========================
// ======================================================

function getUserEmail() {

    const email =
        localStorage.getItem("userEmail");

    if (!email) {

        window.location.href =
            "index.html";

        return null;
    }

    return email.trim().toLowerCase();
}

// ======================================================
// ================= DATA ================================
// ======================================================

let expenses = [];
let filteredExpenses = [];

// ======================================================
// ================= ELEMENTS ============================
// ======================================================

let monthFilter;
let yearFilter;
let history;
let totalExpense;
let amountType;
let amountValue;

// ======================================================
// ================= PAGINATION ==========================
// ======================================================

const recordsPerPage = 50;
let currentPage = 1;

// ======================================================
// ================= INITIALIZE ELEMENTS =================
// ======================================================

function initializeElements() {

    monthFilter =
        document.getElementById("monthFilter");

    yearFilter =
        document.getElementById("yearFilter");

    history =
        document.getElementById("expenseHistory");

    totalExpense =
        document.getElementById("totalExpense");

    amountType =
        document.getElementById("amountFilter");

    amountValue =
        document.getElementById("amountValue");
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

        console.log("======================================");
        console.log("Loading expenses from Railway MySQL...");
        console.log("User Email:", email);

        const url =
            `${API_BASE}/expenses/${encodeURIComponent(email)}`;

        console.log("Expense API URL:", url);

        const response =
            await fetch(
                url,
                {
                    method: "GET",
                    headers: {
                        "Accept": "application/json"
                    }
                }
            );

        console.log(
            "Expense API Status:",
            response.status
        );

        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "Expense API Error:",
                errorText
            );

            throw new Error(
                `Expense API Error: ${response.status}`
            );
        }

        const data =
            await response.json();

        console.log(
            "Expense API Data:",
            data
        );

        // Support multiple backend response formats

        if (
            Array.isArray(data)
        ) {

            expenses =
                data;

        } else if (
            data &&
            Array.isArray(data.expenses)
        ) {

            expenses =
                data.expenses;

        } else if (
            data &&
            Array.isArray(data.data)
        ) {

            expenses =
                data.data;

        } else {

            expenses = [];

        }

        console.log(
            "Expenses Loaded Successfully:",
            expenses
        );

        console.log(
            "Expense Count:",
            expenses.length
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

                </div>
            `;
        }

        return false;
    }
}

// ======================================================
// ================= RETRY ==============================
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

    yearFilter
        .querySelectorAll(".dynamic-year")
        .forEach(
            option => option.remove()
        );

    const years =
        new Set();

    expenses.forEach(
        item => {

            if (!item.date) {
                return;
            }

            const date =
                new Date(item.date);

            if (!isNaN(date.getTime())) {

                years.add(
                    date.getFullYear()
                );
            }
        }
    );

    Array.from(years)
        .sort(
            (a, b) => a - b
        )
        .forEach(
            year => {

                const option =
                    document.createElement(
                        "option"
                    );

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
            }
        );
}

// ======================================================
// ================= FILTER ==============================
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
        expenses.filter(
            item => {

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
                    month === "all" ||
                    Number(month) === itemMonth;

                const matchYear =
                    year === "all" ||
                    Number(year) === itemYear;

                let matchAmount = true;

                if (
                    amountType &&
                    amountType.value === "below" &&
                    amount > 0
                ) {

                    matchAmount =
                        Number(item.amount) < amount;
                }

                if (
                    amountType &&
                    amountType.value === "above" &&
                    amount > 0
                ) {

                    matchAmount =
                        Number(item.amount) > amount;
                }

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
            }
        );
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

    if (!dateValue) {
        return "Invalid date";
    }

    const date =
        new Date(dateValue);

    if (isNaN(date.getTime())) {
        return "Invalid date";
    }

    return (
        `${date.getDate()} ` +
        `${date.toLocaleString("default", {
            month: "long"
        })} ` +
        `${date.getFullYear()}`
    );
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
    // TOTAL
    // ==================================================

    let total = 0;

    filteredExpenses.forEach(
        item => {

            total +=
                Number(item.amount) || 0;
        }
    );

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
        currentPage = totalPages;
    }

    if (currentPage < 1) {
        currentPage = 1;
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

    let html = "";

    pageExpenses.forEach(
        item => {

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
                    item.date ||
                    item.created_at
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
        }
    );

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

    if (totalPages <= 1) {
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

function setupFilterEvents() {

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
}

// ======================================================
// ================= IMPORT UI ===========================
// ======================================================

function setupImportUI() {

    const buttons =
        document.querySelector(".buttons");

    if (!buttons) {
        return;
    }

    if (
        document.getElementById(
            "importExcel"
        )
    ) {
        return;
    }

    const importButton =
        document.createElement(
            "button"
        );

    importButton.id =
        "importExcel";

    importButton.type =
        "button";

    
    const fileInput =
        document.createElement(
            "input"
        );

    fileInput.type =
        "file";

    fileInput.id =
        "expenseFileInput";

    fileInput.accept =
        ".xlsx,.xls,.csv";

    fileInput.style.display =
        "none";

    buttons.appendChild(
        importButton
    );

    document.body.appendChild(
        fileInput
    );

    importButton.addEventListener(
        "click",
        () => {

            fileInput.value = "";

            fileInput.click();
        }
    );

    fileInput.addEventListener(
        "change",
        handleExpenseImport
    );
}

// ======================================================
// ================= NORMALIZE IMPORT ROW ================
// ======================================================

function normalizeImportRow(row) {

    const result = {};

    Object.keys(row || {})
        .forEach(
            key => {

                const cleanKey =
                    String(key)
                        .trim()
                        .toLowerCase()
                        .replace(/[\s_-]+/g, "");

                result[cleanKey] =
                    row[key];
            }
        );

    return result;
}

// ======================================================
// ================= GET IMPORT VALUE ====================
// ======================================================

function getImportValue(
    row,
    possibleKeys
) {

    for (
        const key of possibleKeys
    ) {

        if (
            row[key] !== undefined &&
            row[key] !== null &&
            String(row[key]).trim() !== ""
        ) {

            return row[key];
        }
    }

    return "";
}

// ======================================================
// ================= DATE CONVERTER ======================
// ======================================================

function convertImportDate(value) {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return "";
    }

    // ==================================================
    // EXCEL SERIAL DATE
    // ==================================================

    if (
        typeof value === "number" &&
        typeof XLSX !== "undefined" &&
        XLSX.SSF &&
        typeof XLSX.SSF.parse_date_code === "function"
    ) {

        const parsed =
            XLSX.SSF.parse_date_code(
                value
            );

        if (parsed) {

            const month =
                String(parsed.m)
                    .padStart(2, "0");

            const day =
                String(parsed.d)
                    .padStart(2, "0");

            return (
                `${parsed.y}-${month}-${day}`
            );
        }
    }

    // ==================================================
    // DATE OBJECT
    // ==================================================

    if (value instanceof Date) {

        if (!isNaN(value.getTime())) {

            return (
                `${value.getFullYear()}-` +
                `${String(value.getMonth() + 1).padStart(2, "0")}-` +
                `${String(value.getDate()).padStart(2, "0")}`
            );
        }
    }

    const stringValue =
        String(value).trim();

    // ==================================================
    // YYYY-MM-DD
    // ==================================================

    if (
        /^\d{4}-\d{1,2}-\d{1,2}$/
            .test(stringValue)
    ) {

        const parts =
            stringValue.split("-");

        return (
            `${parts[0]}-` +
            `${String(parts[1]).padStart(2, "0")}-` +
            `${String(parts[2]).padStart(2, "0")}`
        );
    }

    // ==================================================
    // DD/MM/YYYY
    // ==================================================

    if (
        /^\d{1,2}\/\d{1,2}\/\d{4}$/
            .test(stringValue)
    ) {

        const parts =
            stringValue.split("/");

        return (
            `${parts[2]}-` +
            `${String(parts[1]).padStart(2, "0")}-` +
            `${String(parts[0]).padStart(2, "0")}`
        );
    }

    // ==================================================
    // DD-MM-YYYY
    // ==================================================

    if (
        /^\d{1,2}-\d{1,2}-\d{4}$/
            .test(stringValue)
    ) {

        const parts =
            stringValue.split("-");

        return (
            `${parts[2]}-` +
            `${String(parts[1]).padStart(2, "0")}-` +
            `${String(parts[0]).padStart(2, "0")}`
        );
    }

    // ==================================================
    // NORMAL DATE STRING
    // ==================================================

    const parsedDate =
        new Date(stringValue);

    if (
        !isNaN(
            parsedDate.getTime()
        )
    ) {

        return (
            `${parsedDate.getFullYear()}-` +
            `${String(parsedDate.getMonth() + 1).padStart(2, "0")}-` +
            `${String(parsedDate.getDate()).padStart(2, "0")}`
        );
    }

    return "";
}

// ======================================================
// ================= DUPLICATE KEY ======================
// ======================================================

function createExpenseDuplicateKey(
    expense
) {

    const email =
        String(
            expense.email || ""
        )
            .trim()
            .toLowerCase();

    const name =
        String(
            expense.name || ""
        )
            .trim()
            .toLowerCase();

    const amount =
        Number(
            expense.amount
        ).toFixed(2);

    const category =
        String(
            expense.category || ""
        )
            .trim()
            .toLowerCase();

    const date =
        String(
            expense.date || ""
        )
            .trim();

    return [
        email,
        name,
        amount,
        category,
        date
    ].join("|");
}

// ======================================================
// ================= IMPORT FILE =========================
// ======================================================

async function handleExpenseImport(event) {

    const file =
        event.target.files?.[0];

    if (!file) {
        return;
    }

    const email =
        getUserEmail();

    if (!email) {
        return;
    }

    if (
        typeof XLSX ===
        "undefined"
    ) {

        alert(
            "Excel library not loaded."
        );

        return;
    }

    try {

        console.log("======================================");
        console.log("IMPORT STARTED");
        console.log("File:", file.name);
        console.log("User:", email);

        // ==================================================
        // READ FILE
        // ==================================================

        const buffer =
            await file.arrayBuffer();

        const workbook =
            XLSX.read(
                buffer,
                {
                    type: "array",
                    cellDates: true
                }
            );

        if (
            !workbook.SheetNames.length
        ) {

            alert(
                "No worksheet found."
            );

            return;
        }

        const firstSheet =
            workbook.Sheets[
                workbook.SheetNames[0]
            ];

        const rows =
            XLSX.utils.sheet_to_json(
                firstSheet,
                {
                    defval: ""
                }
            );

        console.log(
            "Imported Rows:",
            rows
        );

        if (!rows.length) {

            alert(
                "The selected file is empty."
            );

            return;
        }

        // ==================================================
        // LOAD EXISTING DATABASE DATA
        // ==================================================

        const loaded =
            await loadExpensesFromDatabase();

        if (!loaded) {

            alert(
                "Unable to load existing expenses. Import cancelled."
            );

            return;
        }

        const existingKeys =
            new Set(
                expenses.map(
                    createExpenseDuplicateKey
                )
            );

        const importKeys =
            new Set();

        const validRows = [];

        let duplicateCount = 0;
        let invalidCount = 0;

        // ==================================================
        // PROCESS EACH ROW
        // ==================================================

        rows.forEach(
            rawRow => {

                const row =
                    normalizeImportRow(
                        rawRow
                    );

                const name =
                    String(
                        getImportValue(
                            row,
                            [
                                "name",
                                "expensename",
                                "expense",
                                "description",
                                "title"
                            ]
                        )
                    ).trim();

                const amountRaw =
                    getImportValue(
                        row,
                        [
                            "amount",
                            "expenseamount",
                            "price",
                            "cost"
                        ]
                    );

                const category =
                    String(
                        getImportValue(
                            row,
                            [
                                "category",
                                "type",
                                "expensecategory"
                            ]
                        ) ||
                        "Others"
                    ).trim();

                const date =
                    convertImportDate(
                        getImportValue(
                            row,
                            [
                                "date",
                                "expensedate",
                                "transactiondate",
                                "day"
                            ]
                        )
                    );

                const amount =
                    Number(
                        String(amountRaw)
                            .replace(/₹/g, "")
                            .replace(/,/g, "")
                            .trim()
                    );

                // ==================================================
                // VALIDATION
                // ==================================================

                if (
                    !name ||
                    !Number.isFinite(amount) ||
                    amount < 0 ||
                    !date
                ) {

                    invalidCount++;

                    return;
                }

                const expense = {

                    email,

                    name,

                    amount,

                    category,

                    date

                };

                const duplicateKey =
                    createExpenseDuplicateKey(
                        expense
                    );

                if (
                    existingKeys.has(
                        duplicateKey
                    )
                ) {

                    duplicateCount++;

                    return;
                }

                if (
                    importKeys.has(
                        duplicateKey
                    )
                ) {

                    duplicateCount++;

                    return;
                }

                importKeys.add(
                    duplicateKey
                );

                validRows.push(
                    expense
                );
            }
        );

        console.log(
            "Valid rows:",
            validRows.length
        );

        console.log(
            "Duplicates:",
            duplicateCount
        );

        console.log(
            "Invalid:",
            invalidCount
        );

        // ==================================================
        // NOTHING TO IMPORT
        // ==================================================

        if (!validRows.length) {

            alert(
                `Import completed.\n\n` +
                `New records: 0\n` +
                `Duplicates skipped: ${duplicateCount}\n` +
                `Invalid rows skipped: ${invalidCount}`
            );

            return;
        }

        // ==================================================
        // SAVE TO RAILWAY MYSQL
        // ==================================================

        let savedCount = 0;
        let failedCount = 0;

        for (
            const expense of validRows
        ) {

            try {

                const response =
                    await fetch(
                        `${API_BASE}/expenses`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type":
                                    "application/json",
                                "Accept":
                                    "application/json"
                            },
                            body:
                                JSON.stringify(
                                    expense
                                )
                        }
                    );

                const data =
                    await response.json();

                if (
                    response.ok &&
                    data &&
                    data.success
                ) {

                    savedCount++;

                } else {

                    failedCount++;

                    console.error(
                        "IMPORT SAVE FAILED:",
                        expense,
                        data
                    );
                }

            } catch (error) {

                failedCount++;

                console.error(
                    "IMPORT REQUEST ERROR:",
                    error
                );
            }
        }

        // ==================================================
        // RELOAD DATABASE
        // ==================================================

        await loadExpensesFromDatabase();

        loadYearList();

        currentPage = 1;

        showExpense();

        console.log("======================================");
        console.log("IMPORT FINISHED");
        console.log("Saved:", savedCount);
        console.log("Duplicates:", duplicateCount);
        console.log("Invalid:", invalidCount);
        console.log("Failed:", failedCount);
        console.log("======================================");

        alert(
            `Import completed successfully.\n\n` +
            `New records saved: ${savedCount}\n` +
            `Duplicates skipped: ${duplicateCount}\n` +
            `Invalid rows skipped: ${invalidCount}\n` +
            `Failed: ${failedCount}`
        );

    } catch (error) {

        console.error(
            "IMPORT ERROR:",
            error
        );

        alert(
            "Unable to import file.\n\n" +
            error.message
        );
    }
}

// ======================================================
// ================= PDF DOWNLOAD ========================
// ======================================================

function setupPDF() {

    const pdfBtn =
        document.getElementById(
            "downloadPdf"
        );

    if (!pdfBtn) {
        return;
    }

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

            pdf.setFontSize(18);

            pdf.text(
                "Expense Tracker Report",
                20,
                20
            );

            let y = 35;

            filterExpenses();

            if (
                filteredExpenses.length ===
                0
            ) {

                pdf.setFontSize(12);

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

                    const name =
                        String(
                            item.name ||
                            "Expense"
                        );

                    const amount =
                        formatExpenseAmount(
                            item.amount
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

                    pdf.setFontSize(10);

                    pdf.text(
                        `${name} | ${amount} | ${category} | ${date}`,
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

function setupExcel() {

    const excelBtn =
        document.getElementById(
            "downloadExcel"
        );

    if (!excelBtn) {
        return;
    }

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

function setupViewReport() {

    const reportBtn =
        document.getElementById(
            "viewReport"
        );

    if (!reportBtn) {
        return;
    }

    reportBtn.onclick =
        function () {

            window.location.href =
                "reports.html";
        };
}

// ======================================================
// ================= DASHBOARD ===========================
// ======================================================

function goDashboard() {

    window.location.href =
        "dashboard.html";
}

// ======================================================
// ================= THEME ===============================
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
// ================= INITIAL LOAD ========================
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

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
            API_BASE
        );

        console.log(
            "======================================"
        );

        initializeElements();

        loadSavedTheme();

        setupFilterEvents();

        setupPDF();

        setupExcel();

        setupViewReport();

        setupImportUI();

        const loaded =
            await loadExpensesFromDatabase();

        if (loaded) {

            loadYearList();

            currentPage = 1;

            showExpense();

            console.log(
                "Expense Page Loaded Successfully ✅"
            );
        }
    }
);

// ======================================================
// ================= GLOBAL FUNCTIONS ====================
// ======================================================

window.loadExpensesAndRefresh =
    loadExpensesAndRefresh;

window.goDashboard =
    goDashboard;

window.showExpense =
    showExpense;