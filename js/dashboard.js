// ======================================================
// ================ EXPENSE TRACKER PRO =================
// =================== DASHBOARD JS ======================
// ==================== FINAL VERSION ====================
// ==================== AUTO EXCEL ========================
// ======================================================

"use strict";

// ======================================================
// ================= API CONFIG ==========================
// ======================================================

const API_BASE =
    "https://expense-tracker-pro-production-b745.up.railway.app";

console.log("======================================");
console.log("Dashboard JS Loaded");
console.log("API:", API_BASE);
console.log("======================================");

// ======================================================
// ================= LOGIN CHECK =========================
// ======================================================

const userEmail =
    localStorage.getItem("userEmail");

if (!userEmail) {
    window.location.href = "index.html";
}

// ======================================================
// ================= GLOBAL DATA =========================
// ======================================================

let expenses = [];
let allIncome = [];

window.allIncome = allIncome;

let dashboardInitialized = false;
let dashboardLoading = false;

// ======================================================
// ================= DOM HELPER ==========================
// ======================================================

function $(id) {
    return document.getElementById(id);
}

// ======================================================
// ================= DOM ELEMENTS ========================
// ======================================================

const menuBtn = $("menuBtn");
const sideMenu = $("sideMenu");
const themeBtn = $("themeBtn");
const logoutBtn = $("logoutBtn");

const addIncomeBtn = $("addIncomeBtn");
const addExpenseBtn = $("addExpenseBtn");

const expenseList = $("expenseList");

const totalExpense = $("totalExpense");
const totalIncome = $("totalIncome");
const totalBalance = $("totalBalance");

const searchExpense = $("searchExpense");
const transactionFilter = $("transactionFilter");

const expenseCategory = $("expenseCategory");
const customCategory = $("customCategory");

const importExpenseBtn = $("importExpenseBtn");
const expenseFileInput = $("expenseFileInput");

const exportExpenseBtn = $("exportExpenseBtn");

// ======================================================
// ================= API REQUEST =========================
// ======================================================

async function apiRequest(endpoint, options = {}) {

    const url = API_BASE + endpoint;

    console.log(
        "➡️ API:",
        options.method || "GET",
        url
    );

    const fetchOptions = {
        method: options.method || "GET",

        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    };

    if (options.body !== undefined) {
        fetchOptions.body = options.body;
    }

    try {

        const response =
            await fetch(url, fetchOptions);

        const text =
            await response.text();

        let data = {};

        try {

            data =
                text
                    ? JSON.parse(text)
                    : {};

        } catch {

            data = {
                success: false,
                message:
                    text ||
                    "Invalid server response"
            };
        }

        console.log(
            "⬅️ API:",
            response.status,
            data
        );

        if (!response.ok) {

            throw new Error(
                data.message ||
                `Server error ${response.status}`
            );
        }

        return data;

    } catch (error) {

        console.error(
            "❌ API ERROR:",
            error
        );

        throw error;
    }
}

// ======================================================
// ================= FORMAT CURRENCY =====================
// ======================================================

function formatCurrency(amount) {

    const value =
        Number(amount) || 0;

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

window.formatCurrency =
    formatCurrency;

// ======================================================
// ================= DATE NORMALIZER =====================
// ======================================================

function normalizeDate(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "";
    }

    if (value instanceof Date) {

        if (isNaN(value.getTime())) {
            return "";
        }

        return (
            value.getFullYear() +
            "-" +
            String(
                value.getMonth() + 1
            ).padStart(2, "0") +
            "-" +
            String(
                value.getDate()
            ).padStart(2, "0")
        );
    }

    const str =
        String(value)
            .trim();

    if (
        /^\d{4}-\d{2}-\d{2}$/.test(str)
    ) {
        return str;
    }

    let match =
        str.match(
            /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
        );

    if (match) {

        return (
            match[3] +
            "-" +
            match[2].padStart(2, "0") +
            "-" +
            match[1].padStart(2, "0")
        );
    }

    match =
        str.match(
            /^(\d{1,2})-(\d{1,2})-(\d{4})$/
        );

    if (match) {

        return (
            match[3] +
            "-" +
            match[2].padStart(2, "0") +
            "-" +
            match[1].padStart(2, "0")
        );
    }

    match =
        str.match(
            /^(\d{1,2})\/(\d{1,2})\/(\d{2})$/
        );

    if (match) {

        let year =
            Number(match[3]);

        year =
            year < 50
                ? 2000 + year
                : 1900 + year;

        return (
            year +
            "-" +
            match[2].padStart(2, "0") +
            "-" +
            match[1].padStart(2, "0")
        );
    }

    // DD.MM.YYYY
    match =
        str.match(
            /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/
        );

    if (match) {

        return (
            match[3] +
            "-" +
            match[2].padStart(2, "0") +
            "-" +
            match[1].padStart(2, "0")
        );
    }

    const date =
        new Date(str);

    if (isNaN(date.getTime())) {
        return "";
    }

    return (
        date.getFullYear() +
        "-" +
        String(
            date.getMonth() + 1
        ).padStart(2, "0") +
        "-" +
        String(
            date.getDate()
        ).padStart(2, "0")
    );
}

// ======================================================
// ================= ESCAPE HTML =========================
// ======================================================

function escapeHTML(value) {

    return String(
        value ?? ""
    )
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ======================================================
// ================= THEME ===============================
// ======================================================

function loadTheme() {

    const theme =
        localStorage.getItem("theme");

    if (theme === "light") {

        document.body.classList.add(
            "light-mode"
        );

    } else {

        document.body.classList.remove(
            "light-mode"
        );
    }

    updateThemeButton();
}

function updateThemeButton() {

    if (!themeBtn) return;

    const light =
        document.body.classList.contains(
            "light-mode"
        );

    themeBtn.innerHTML =
        light
            ? "🌙 Dark Mode"
            : "☀️ Light Mode";
}

if (themeBtn) {

    themeBtn.addEventListener(
        "click",
        function () {

            document.body.classList.toggle(
                "light-mode"
            );

            const light =
                document.body.classList.contains(
                    "light-mode"
                );

            localStorage.setItem(
                "theme",
                light
                    ? "light"
                    : "dark"
            );

            updateThemeButton();
        }
    );
}

loadTheme();

// ======================================================
// ================= SIDEBAR =============================
// ======================================================

if (menuBtn && sideMenu) {

    menuBtn.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            sideMenu.classList.toggle(
                "active"
            );
        }
    );
}

document.addEventListener(
    "click",
    function (event) {

        if (
            sideMenu &&
            menuBtn &&
            sideMenu.classList.contains("active") &&
            !sideMenu.contains(event.target) &&
            !menuBtn.contains(event.target)
        ) {

            sideMenu.classList.remove(
                "active"
            );
        }
    }
);

// ======================================================
// ================= LOGOUT ==============================
// ======================================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        function () {

            localStorage.removeItem(
                "userEmail"
            );

            localStorage.removeItem(
                "userName"
            );

            sessionStorage.removeItem(
                "resetEmail"
            );

            window.location.href =
                "index.html";
        }
    );
}

// ======================================================
// ================= CATEGORY ============================
// ======================================================

if (expenseCategory) {

    expenseCategory.addEventListener(
        "change",
        function () {

            if (this.value === "Others") {

                if (customCategory) {

                    customCategory.style.display =
                        "block";

                    customCategory.focus();
                }

            } else {

                if (customCategory) {

                    customCategory.style.display =
                        "none";

                    customCategory.value = "";
                }
            }
        }
    );
}

// ======================================================
// ================= LOAD EXPENSES =======================
// ======================================================

async function loadExpenses() {

    const email =
        localStorage.getItem("userEmail");

    if (!email) {

        expenses = [];

        return;
    }

    try {

        const data =
            await apiRequest(
                "/expenses/" +
                encodeURIComponent(email)
            );

        console.log(
            "Expenses API Response:",
            data
        );

        if (
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

        } else if (
            Array.isArray(data)
        ) {

            expenses =
                data;

        } else {

            expenses = [];
        }

        console.log(
            "Expenses Loaded:",
            expenses
        );

    } catch (error) {

        console.error(
            "Load expenses failed:",
            error
        );

        expenses = [];
    }
}

window.loadExpenses =
    loadExpenses;

// ======================================================
// ================= LOAD INCOME =========================
// ======================================================

async function loadIncome() {

    const email =
        localStorage.getItem("userEmail");

    if (!email) {

        allIncome = [];

        window.allIncome =
            allIncome;

        return;
    }

    try {

        const data =
            await apiRequest(
                "/income/" +
                encodeURIComponent(email)
            );

        console.log(
            "Income API Response:",
            data
        );

        if (
            data &&
            Array.isArray(data.income)
        ) {

            allIncome =
                data.income;

        } else if (
            data &&
            Array.isArray(data.data)
        ) {

            allIncome =
                data.data;

        } else if (
            Array.isArray(data)
        ) {

            allIncome =
                data;

        } else {

            allIncome = [];
        }

        window.allIncome =
            allIncome;

        console.log(
            "Income Loaded:",
            allIncome
        );

    } catch (error) {

        console.error(
            "Load income failed:",
            error
        );

        allIncome = [];

        window.allIncome =
            allIncome;
    }
}

// ======================================================
// ================= ADD INCOME ==========================
// ======================================================

async function addIncome() {

    console.log(
        "🟢 ADD INCOME CLICKED"
    );

    const nameInput =
        $("incomeName");

    const amountInput =
        $("incomeAmount");

    const dateInput =
        $("incomeDate");

    if (
        !nameInput ||
        !amountInput ||
        !dateInput
    ) {

        alert(
            "Income form elements not found."
        );

        return;
    }

    const name =
        nameInput.value.trim();

    const amount =
        Number(amountInput.value);

    const date =
        dateInput.value;

    if (!name) {

        alert(
            "Please enter income source."
        );

        nameInput.focus();

        return;
    }

    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        alert(
            "Please enter a valid income amount."
        );

        amountInput.focus();

        return;
    }

    if (!date) {

        alert(
            "Please select income date."
        );

        dateInput.focus();

        return;
    }

    const email =
        localStorage.getItem("userEmail");

    if (!email) {

        alert(
            "Login session expired. Please login again."
        );

        window.location.href =
            "index.html";

        return;
    }

    if (addIncomeBtn) {

        addIncomeBtn.disabled = true;
        addIncomeBtn.textContent =
            "Adding...";
    }

    try {

        const result =
            await apiRequest(
                "/income",
                {
                    method: "POST",

                    body:
                        JSON.stringify({
                            email,
                            name,
                            source: name,
                            amount,
                            date
                        })
                }
            );

        if (
            result &&
            result.success === true
        ) {

            alert(
                "Income Added Successfully ✅"
            );

            nameInput.value = "";
            amountInput.value = "";
            dateInput.value = "";

            await refreshDashboard();

        } else {

            alert(
                result.message ||
                "Income could not be added."
            );
        }

    } catch (error) {

        console.error(
            "❌ Add income error:",
            error
        );

        alert(
            "Unable to add income.\n\n" +
            error.message
        );

    } finally {

        if (addIncomeBtn) {

            addIncomeBtn.disabled = false;
            addIncomeBtn.textContent =
                "Add Income";
        }
    }
}

if (addIncomeBtn) {

    addIncomeBtn.addEventListener(
        "click",
        addIncome
    );
}

window.addIncome =
    addIncome;

// ======================================================
// ================= ADD EXPENSE =========================
// ======================================================

async function addExpense() {

    console.log(
        "🟢 ADD EXPENSE CLICKED"
    );

    const nameInput =
        $("expenseName");

    const amountInput =
        $("expenseAmount");

    const categoryInput =
        $("expenseCategory");

    const customInput =
        $("customCategory");

    const dateInput =
        $("expenseDate");

    if (
        !nameInput ||
        !amountInput ||
        !categoryInput ||
        !dateInput
    ) {

        alert(
            "Expense form elements not found."
        );

        return;
    }

    const name =
        nameInput.value.trim();

    const amount =
        Number(amountInput.value);

    let category =
        categoryInput.value.trim();

    const date =
        dateInput.value;

    if (category === "Others") {

        category =
            customInput
                ? customInput.value.trim()
                : "";
    }

    if (!name) {

        alert(
            "Please enter expense name."
        );

        nameInput.focus();

        return;
    }

    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        alert(
            "Please enter a valid expense amount."
        );

        amountInput.focus();

        return;
    }

    if (!category) {

        alert(
            "Please select expense category."
        );

        return;
    }

    if (!date) {

        alert(
            "Please select expense date."
        );

        dateInput.focus();

        return;
    }

    const email =
        localStorage.getItem("userEmail");

    if (!email) {

        alert(
            "Login session expired. Please login again."
        );

        window.location.href =
            "index.html";

        return;
    }

    if (addExpenseBtn) {

        addExpenseBtn.disabled = true;
        addExpenseBtn.textContent =
            "Adding...";
    }

    try {

        const result =
            await apiRequest(
                "/expenses",
                {
                    method: "POST",

                    body:
                        JSON.stringify({
                            email,
                            name,
                            amount,
                            category,
                            date
                        })
                }
            );

        if (
            result &&
            result.success === true
        ) {

            alert(
                "Expense Added Successfully ✅"
            );

            nameInput.value = "";
            amountInput.value = "";
            dateInput.value = "";

            categoryInput.value = "Food";

            if (customInput) {

                customInput.value = "";

                customInput.style.display =
                    "none";
            }

            await refreshDashboard();

        } else {

            alert(
                result.message ||
                "Expense could not be added."
            );
        }

    } catch (error) {

        console.error(
            "❌ Add expense error:",
            error
        );

        alert(
            "Unable to add expense.\n\n" +
            error.message
        );

    } finally {

        if (addExpenseBtn) {

            addExpenseBtn.disabled = false;
            addExpenseBtn.textContent =
                "Add Expense";
        }
    }
}

if (addExpenseBtn) {

    addExpenseBtn.addEventListener(
        "click",
        addExpense
    );
}

window.addExpense =
    addExpense;

// ======================================================
// ============== DISPLAY TRANSACTIONS ==================
// ======================================================

function displayTransactions() {

    if (!expenseList) return;

    expenseList.innerHTML = "";

    const search =
        searchExpense
            ? searchExpense.value
                .toLowerCase()
                .trim()
            : "";

    const filter =
        transactionFilter
            ? transactionFilter.value
            : "all";

    const transactions = [];

    expenses.forEach(item => {

        transactions.push({

            type: "expense",

            id: item.id,

            name:
                item.name ||
                item.description ||
                "Expense",

            amount:
                Number(item.amount) || 0,

            category:
                item.category ||
                "Others",

            date:
                normalizeDate(item.date)
        });
    });

    allIncome.forEach(item => {

        transactions.push({

            type: "income",

            id: item.id,

            name:
                item.name ||
                item.source ||
                "Income",

            amount:
                Number(item.amount) || 0,

            category: "Income",

            date:
                normalizeDate(item.date)
        });
    });

    transactions.sort((a, b) => {

        const dateA =
            a.date
                ? new Date(
                    a.date +
                    "T00:00:00"
                ).getTime()
                : 0;

        const dateB =
            b.date
                ? new Date(
                    b.date +
                    "T00:00:00"
                ).getTime()
                : 0;

        return dateB - dateA;
    });

    let count = 0;

    transactions.forEach(transaction => {

        const matchesSearch =
            !search ||
            String(transaction.name)
                .toLowerCase()
                .includes(search) ||
            String(transaction.category)
                .toLowerCase()
                .includes(search);

        const matchesFilter =
            filter === "all" ||
            filter === transaction.type;

        if (
            !matchesSearch ||
            !matchesFilter
        ) {
            return;
        }

        count++;

        const row =
            document.createElement("tr");

        const amount =
            transaction.type === "income"
                ? "+" +
                    formatCurrency(
                        transaction.amount
                    )
                : "-" +
                    formatCurrency(
                        transaction.amount
                    );

        let actions = "";

        if (
            transaction.type ===
            "expense"
        ) {

            actions = `
                <button
                    class="edit-btn"
                    onclick="editExpenseById(${Number(transaction.id)})"
                >
                    Edit
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteExpenseById(${Number(transaction.id)})"
                >
                    Delete
                </button>
            `;

        } else {

            actions = `
                <button
                    class="edit-btn"
                    onclick="editIncomeById(${Number(transaction.id)})"
                >
                    Edit
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteIncomeById(${Number(transaction.id)})"
                >
                    Delete
                </button>
            `;
        }

        row.innerHTML = `
            <td>
                ${
                    transaction.type ===
                    "income"
                        ? "Income"
                        : "Expense"
                }
            </td>

            <td>
                ${escapeHTML(
                    transaction.name
                )}
            </td>

            <td>
                ${amount}
            </td>

            <td>
                ${escapeHTML(
                    transaction.category
                )}
            </td>

            <td>
                ${
                    transaction.date ||
                    "-"
                }
            </td>

            <td>
                ${actions}
            </td>
        `;

        expenseList.appendChild(row);
    });

    if (count === 0) {

        expenseList.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    style="
                        text-align:center;
                        padding:25px;
                    "
                >
                    No transactions found.
                </td>
            </tr>
        `;
    }
}

window.displayTransactions =
    displayTransactions;

// ======================================================
// ================= SEARCH ==============================
// ======================================================

if (searchExpense) {

    searchExpense.addEventListener(
        "input",
        displayTransactions
    );
}

// ======================================================
// ================= FILTER ==============================
// ======================================================

if (transactionFilter) {

    transactionFilter.addEventListener(
        "change",
        displayTransactions
    );
}

// ======================================================
// ================= EDIT EXPENSE ========================
// ======================================================

function editExpenseById(id) {

    const item =
        expenses.find(
            x =>
                Number(x.id) ===
                Number(id)
        );

    if (!item) {

        alert(
            "Expense not found."
        );

        return;
    }

    if ($("editIndex"))
        $("editIndex").value =
            item.id;

    if ($("editName"))
        $("editName").value =
            item.name ||
            item.description ||
            "";

    if ($("editAmount"))
        $("editAmount").value =
            item.amount || "";

    if ($("editCategory"))
        $("editCategory").value =
            item.category ||
            "Others";

    if ($("editDate"))
        $("editDate").value =
            normalizeDate(item.date);

    const popup =
        $("editPopup");

    if (popup) {

        popup.style.display =
            "block";
    }
}

window.editExpenseById =
    editExpenseById;

// ======================================================
// ================= CLOSE EXPENSE EDIT =================
// ======================================================

const closeEditBtn =
    $("closeEditBtn");

if (closeEditBtn) {

    closeEditBtn.addEventListener(
        "click",
        function () {

            const popup =
                $("editPopup");

            if (popup) {

                popup.style.display =
                    "none";
            }
        }
    );
}

// ======================================================
// ================= UPDATE EXPENSE ======================
// ======================================================

const updateExpenseBtn =
    $("updateExpenseBtn");

if (updateExpenseBtn) {

    updateExpenseBtn.addEventListener(
        "click",
        async function () {

            const id =
                $("editIndex")
                    ? $("editIndex").value
                    : "";

            const name =
                $("editName")
                    ? $("editName")
                        .value
                        .trim()
                    : "";

            const amount =
                $("editAmount")
                    ? Number(
                        $("editAmount").value
                    )
                    : 0;

            const category =
                $("editCategory")
                    ? $("editCategory")
                        .value
                        .trim()
                    : "";

            const date =
                $("editDate")
                    ? $("editDate").value
                    : "";

            if (
                !id ||
                !name ||
                !Number.isFinite(amount) ||
                amount <= 0 ||
                !category ||
                !date
            ) {

                alert(
                    "Please fill all fields correctly."
                );

                return;
            }

            try {

                const result =
                    await apiRequest(
                        "/expenses/" + id,
                        {
                            method: "PUT",

                            body:
                                JSON.stringify({
                                    name,
                                    amount,
                                    category,
                                    date
                                })
                        }
                    );

                if (
                    result &&
                    result.success
                ) {

                    alert(
                        "Expense Updated Successfully ✅"
                    );

                    const popup =
                        $("editPopup");

                    if (popup) {
                        popup.style.display =
                            "none";
                    }

                    await refreshDashboard();

                } else {

                    alert(
                        result.message ||
                        "Update failed."
                    );
                }

            } catch (error) {

                console.error(
                    "Expense update error:",
                    error
                );

                alert(
                    "Expense update failed.\n\n" +
                    error.message
                );
            }
        }
    );
}

// ======================================================
// ================= DELETE EXPENSE ======================
// ======================================================

async function deleteExpenseById(id) {

    const item =
        expenses.find(
            x =>
                Number(x.id) ===
                Number(id)
        );

    if (!item) {

        alert(
            "Expense not found."
        );

        return;
    }

    if (
        !confirm(
            "Delete this expense?\n\n" +
            (
                item.name ||
                item.description ||
                "Expense"
            ) +
            "\n" +
            formatCurrency(item.amount)
        )
    ) {
        return;
    }

    try {

        const result =
            await apiRequest(
                "/expenses/" + id,
                {
                    method: "DELETE"
                }
            );

        if (
            result &&
            result.success
        ) {

            alert(
                "Expense Deleted Successfully 🗑️"
            );

            await refreshDashboard();

        } else {

            alert(
                result.message ||
                "Delete failed."
            );
        }

    } catch (error) {

        console.error(
            "Expense delete error:",
            error
        );

        alert(
            "Expense delete failed.\n\n" +
            error.message
        );
    }
}

window.deleteExpenseById =
    deleteExpenseById;

// ======================================================
// ================= EDIT INCOME =========================
// ======================================================

function editIncomeById(id) {

    const item =
        allIncome.find(
            x =>
                Number(x.id) ===
                Number(id)
        );

    if (!item) {

        alert(
            "Income not found."
        );

        return;
    }

    if ($("editIncomeId"))
        $("editIncomeId").value =
            item.id;

    if ($("editIncomeSource"))
        $("editIncomeSource").value =
            item.name ||
            item.source ||
            "";

    if ($("editIncomeAmount"))
        $("editIncomeAmount").value =
            item.amount || "";

    if ($("editIncomeDate"))
        $("editIncomeDate").value =
            normalizeDate(item.date);

    const popup =
        $("editIncomePopup");

    if (popup) {

        popup.style.display =
            "block";
    }
}

window.editIncomeById =
    editIncomeById;

// ======================================================
// ================= CLOSE INCOME EDIT ===================
// ======================================================

const closeIncomeEditBtn =
    $("closeIncomeEditBtn");

if (closeIncomeEditBtn) {

    closeIncomeEditBtn.addEventListener(
        "click",
        function () {

            const popup =
                $("editIncomePopup");

            if (popup) {

                popup.style.display =
                    "none";
            }
        }
    );
}

// ======================================================
// ================= UPDATE INCOME =======================
// ======================================================

const updateIncomeBtn =
    $("updateIncomeBtn");

if (updateIncomeBtn) {

    updateIncomeBtn.addEventListener(
        "click",
        async function () {

            const id =
                $("editIncomeId")
                    ? $("editIncomeId").value
                    : "";

            const source =
                $("editIncomeSource")
                    ? $("editIncomeSource")
                        .value
                        .trim()
                    : "";

            const amount =
                $("editIncomeAmount")
                    ? Number(
                        $("editIncomeAmount").value
                    )
                    : 0;

            const date =
                $("editIncomeDate")
                    ? $("editIncomeDate").value
                    : "";

            if (
                !id ||
                !source ||
                !Number.isFinite(amount) ||
                amount <= 0 ||
                !date
            ) {

                alert(
                    "Please fill all income fields correctly."
                );

                return;
            }

            try {

                const result =
                    await apiRequest(
                        "/income/" + id,
                        {
                            method: "PUT",

                            body:
                                JSON.stringify({
                                    name: source,
                                    source: source,
                                    amount,
                                    date
                                })
                        }
                    );

                if (
                    result &&
                    result.success
                ) {

                    alert(
                        "Income Updated Successfully ✅"
                    );

                    const popup =
                        $("editIncomePopup");

                    if (popup) {

                        popup.style.display =
                            "none";
                    }

                    await refreshDashboard();

                } else {

                    alert(
                        result.message ||
                        "Income update failed."
                    );
                }

            } catch (error) {

                console.error(
                    "Income update error:",
                    error
                );

                alert(
                    "Income update failed.\n\n" +
                    error.message
                );
            }
        }
    );
}

// ======================================================
// ================= DELETE INCOME =======================
// ======================================================

async function deleteIncomeById(id) {

    const item =
        allIncome.find(
            x =>
                Number(x.id) ===
                Number(id)
        );

    if (!item) {

        alert(
            "Income not found."
        );

        return;
    }

    if (
        !confirm(
            "Delete this income?\n\n" +
            (
                item.name ||
                item.source ||
                "Income"
            ) +
            "\n" +
            formatCurrency(item.amount)
        )
    ) {
        return;
    }

    try {

        const result =
            await apiRequest(
                "/income/" + id,
                {
                    method: "DELETE"
                }
            );

        if (
            result &&
            result.success
        ) {

            alert(
                "Income Deleted Successfully 🗑️"
            );

            await refreshDashboard();

        } else {

            alert(
                result.message ||
                "Income delete failed."
            );
        }

    } catch (error) {

        console.error(
            "Income delete error:",
            error
        );

        alert(
            "Income delete failed.\n\n" +
            error.message
        );
    }
}

window.deleteIncomeById =
    deleteIncomeById;

// ======================================================
// ================= CALCULATE TOTALS ====================
// ======================================================

function calculateTotals() {

    const now =
        new Date();

    const currentMonth =
        now.getMonth();

    const currentYear =
        now.getFullYear();

    let incomeTotal = 0;
    let expenseTotal = 0;

    allIncome.forEach(item => {

        const date =
            normalizeDate(item.date);

        if (!date) return;

        const d =
            new Date(
                date + "T00:00:00"
            );

        if (
            d.getMonth() === currentMonth &&
            d.getFullYear() === currentYear
        ) {

            incomeTotal +=
                Number(item.amount) || 0;
        }
    });

    expenses.forEach(item => {

        const date =
            normalizeDate(item.date);

        if (!date) return;

        const d =
            new Date(
                date + "T00:00:00"
            );

        if (
            d.getMonth() === currentMonth &&
            d.getFullYear() === currentYear
        ) {

            expenseTotal +=
                Number(item.amount) || 0;
        }
    });

    const balance =
        incomeTotal - expenseTotal;

    if (totalIncome) {

        totalIncome.textContent =
            formatCurrency(incomeTotal);
    }

    if (totalExpense) {

        totalExpense.textContent =
            formatCurrency(expenseTotal);
    }

    if (totalBalance) {

        totalBalance.textContent =
            formatCurrency(balance);
    }

    const warning =
        $("balanceWarning");

    if (warning) {

        if (balance < 0) {

            warning.textContent =
                "⚠️ Your expenses are higher than your income.";

            warning.style.display =
                "block";

        } else if (
            incomeTotal > 0 &&
            balance <= incomeTotal * 0.1
        ) {

            warning.textContent =
                "⚠️ Your remaining balance is low.";

            warning.style.display =
                "block";

        } else {

            warning.textContent = "";
            warning.style.display =
                "none";
        }
    }

    console.log(
        "Current Month Totals:",
        {
            income: incomeTotal,
            expense: expenseTotal,
            balance: balance
        }
    );
}

window.calculateTotals =
    calculateTotals;

// ======================================================
// ================= REFRESH DASHBOARD ==================
// ======================================================

async function refreshDashboard() {

    if (dashboardLoading) {

        console.log(
            "⏳ Dashboard refresh already running..."
        );

        return;
    }

    dashboardLoading = true;

    console.log(
        "🔄 Loading dashboard data..."
    );

    try {

        await Promise.all([
            loadExpenses(),
            loadIncome()
        ]);

        displayTransactions();

        calculateTotals();

        console.log(
            "Dashboard data loaded successfully ✅"
        );

    } catch (error) {

        console.error(
            "Refresh dashboard error:",
            error
        );

    } finally {

        dashboardLoading = false;
    }
}

window.refreshDashboard =
    refreshDashboard;
// ======================================================
// ============== EXCEL IMPORT - PART 2 =================
// ========== UNIVERSAL AUTO COLUMN MAPPING =============
// ======================================================

function normalizeExcelHeader(value) {

    return String(value ?? "")
        .replace(/^\uFEFF/, "")
        .trim()
        .toLowerCase()
        .replace(/[_\-\/]+/g, " ")
        .replace(/[()[\]{}:]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}


// ======================================================
// ============== COLUMN TYPE DETECTION =================
// ======================================================

function detectExcelColumnType(header) {

    const h = normalizeExcelHeader(header);

    // ---------- NAME ----------
    const nameWords = [
        "name",
        "expense",
        "expense name",
        "expense item",
        "item",
        "description",
        "expense description",
        "details",
        "detail",
        "particular",
        "particulars",
        "title",
        "transaction",
        "transaction name",
        "payment description",
        "merchant",
        "product",
        "purchase"
    ];

    // ---------- AMOUNT ----------
    const amountWords = [
        "amount",
        "expense amount",
        "cost",
        "price",
        "value",
        "total",
        "money",
        "spent",
        "spending",
        "expense cost",
        "expense value",
        "amount spent",
        "paid",
        "payment",
        "payment amount",
        "debit",
        "debit amount",
        "expense total"
    ];

    // ---------- CATEGORY ----------
    const categoryWords = [
        "category",
        "expense category",
        "expense type",
        "category name",
        "type",
        "group",
        "expense group",
        "class",
        "classification"
    ];

    // ---------- DATE ----------
    const dateWords = [
        "date",
        "expense date",
        "transaction date",
        "purchase date",
        "created date",
        "expense day",
        "day",
        "date of expense",
        "date of transaction",
        "payment date",
        "spent date"
    ];


    // Exact matches first
    if (nameWords.includes(h))
        return "name";

    if (amountWords.includes(h))
        return "amount";

    if (categoryWords.includes(h))
        return "category";

    if (dateWords.includes(h))
        return "date";


    // ---------- SMART NAME ----------
    if (
        h.includes("description") ||
        h.includes("particular") ||
        h.includes("merchant") ||
        h.includes("product") ||
        h.includes("expense name") ||
        h.includes("item name") ||
        h === "item"
    ) {
        return "name";
    }


    // ---------- SMART AMOUNT ----------
    if (
        h.includes("amount") ||
        h.includes("cost") ||
        h.includes("price") ||
        h.includes("spent") ||
        h.includes("spending") ||
        h.includes("paid") ||
        h.includes("payment") ||
        h.includes("debit") ||
        h.includes("total")
    ) {
        return "amount";
    }


    // ---------- SMART CATEGORY ----------
    if (
        h.includes("category") ||
        h.includes("expense type") ||
        h.includes("group") ||
        h.includes("classification")
    ) {
        return "category";
    }


    // ---------- SMART DATE ----------
    if (
        h.includes("date") ||
        h.includes("day")
    ) {
        return "date";
    }


    return null;
}


// ======================================================
// ============== AUTO MAP ALL COLUMNS ==================
// ======================================================

function autoMapExcelColumns(rows) {

    if (
        !rows ||
        !rows.length
    ) {
        return {
            name: null,
            amount: null,
            category: null,
            date: null
        };
    }


    const headers =
        Object.keys(rows[0]);


    const mapping = {
        name: null,
        amount: null,
        category: null,
        date: null
    };


    // ==================================================
    // PASS 1 - EXACT / STRONG DETECTION
    // ==================================================

    headers.forEach(header => {

        const type =
            detectExcelColumnType(
                header
            );

        if (
            type &&
            mapping[type] === null
        ) {
            mapping[type] = header;
        }
    });


    // ==================================================
    // PASS 2 - CONTENT BASED DETECTION
    // ==================================================

    headers.forEach(header => {

        if (
            Object.values(mapping)
                .includes(header)
        ) {
            return;
        }


        const values =
            rows
                .slice(0, 20)
                .map(
                    row =>
                        row[header]
                )
                .filter(
                    value =>
                        value !== null &&
                        value !== undefined &&
                        value !== ""
                );


        if (!values.length)
            return;


        // ----------------------------------------------
        // DATE COLUMN
        // ----------------------------------------------

        if (!mapping.date) {

            let dateCount = 0;

            values.forEach(value => {

                if (
                    parseExcelDate(value)
                ) {
                    dateCount++;
                }
            });


            if (
                dateCount >=
                Math.max(
                    1,
                    Math.ceil(
                        values.length *
                        0.7
                    )
                )
            ) {

                mapping.date =
                    header;

                return;
            }
        }


        // ----------------------------------------------
        // AMOUNT COLUMN
        // ----------------------------------------------

        if (!mapping.amount) {

            let amountCount = 0;

            values.forEach(value => {

                const parsed =
                    parseExcelAmount(
                        value
                    );

                if (
                    Number.isFinite(
                        parsed
                    ) &&
                    parsed > 0
                ) {
                    amountCount++;
                }
            });


            if (
                amountCount >=
                Math.max(
                    1,
                    Math.ceil(
                        values.length *
                        0.7
                    )
                )
            ) {

                mapping.amount =
                    header;

                return;
            }
        }
    });


    // ==================================================
    // PASS 3 - TEXT COLUMN FOR NAME
    // ==================================================

    if (!mapping.name) {

        const candidates =
            headers.filter(
                header =>
                    header !==
                        mapping.amount &&
                    header !==
                        mapping.date &&
                    header !==
                        mapping.category
            );


        let bestHeader = null;
        let bestScore = -1;


        candidates.forEach(header => {

            const values =
                rows
                    .slice(0, 20)
                    .map(
                        row =>
                            row[header]
                    )
                    .filter(
                        value =>
                            value !== null &&
                            value !== undefined &&
                            String(value)
                                .trim() !== ""
                    );


            if (!values.length)
                return;


            let textScore = 0;


            values.forEach(value => {

                const text =
                    String(value)
                        .trim();


                if (!text)
                    return;


                if (
                    !Number.isFinite(
                        parseExcelAmount(
                            value
                        )
                    )
                ) {
                    textScore += 1;
                }


                if (
                    text.length >= 2
                ) {
                    textScore += 0.5;
                }
            });


            if (
                textScore >
                bestScore
            ) {

                bestScore =
                    textScore;

                bestHeader =
                    header;
            }
        });


        if (bestHeader) {

            mapping.name =
                bestHeader;
        }
    }


    // ==================================================
    // PASS 4 - CATEGORY
    // ==================================================

    if (!mapping.category) {

        const candidates =
            headers.filter(
                header =>
                    header !==
                        mapping.name &&
                    header !==
                        mapping.amount &&
                    header !==
                        mapping.date
            );


        for (
            const header of candidates
        ) {

            const values =
                rows
                    .slice(0, 20)
                    .map(
                        row =>
                            String(
                                row[header] ??
                                ""
                            ).trim()
                    )
                    .filter(Boolean);


            if (!values.length)
                continue;


            // Category usually contains
            // repeated text values
            const unique =
                new Set(values);


            if (
                unique.size <=
                Math.max(
                    10,
                    values.length
                )
            ) {

                mapping.category =
                    header;

                break;
            }
        }
    }


    console.log(
        "🧠 AUTO COLUMN MAPPING:",
        mapping
    );


    return mapping;
}


// ======================================================
// ============== GET MAPPED VALUE ======================
// ======================================================

function getMappedExcelValue(
    row,
    mapping,
    type
) {

    const header =
        mapping[type];


    if (
        header &&
        Object.prototype.hasOwnProperty.call(
            row,
            header
        )
    ) {

        return row[header];
    }


    return "";
}


// ======================================================
// ============== IMPORT EXCEL ==========================
// ======================================================

if (
    importExpenseBtn &&
    expenseFileInput
) {

    importExpenseBtn.addEventListener(
        "click",
        function () {

            console.log(
                "📥 Excel import clicked"
            );

            expenseFileInput.click();
        }
    );
}


if (expenseFileInput) {

    expenseFileInput.addEventListener(
        "change",
        async function () {

            const file =
                this.files &&
                this.files[0];


            if (!file)
                return;


            if (
                typeof XLSX ===
                "undefined"
            ) {

                alert(
                    "Excel library not loaded."
                );

                this.value = "";

                return;
            }


            const email =
                localStorage.getItem(
                    "userEmail"
                );


            if (!email) {

                alert(
                    "Please login again."
                );

                window.location.href =
                    "index.html";

                return;
            }


            let imported = 0;
            let skipped = 0;

            const errors = [];


            try {

                console.log(
                    "📄 Reading Excel file:",
                    file.name
                );


                // ======================================
                // READ EXCEL
                // ======================================

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
                    !workbook.SheetNames ||
                    !workbook.SheetNames.length
                ) {

                    alert(
                        "No Excel sheet found."
                    );

                    return;
                }


                const sheet =
                    workbook.Sheets[
                        workbook.SheetNames[0]
                    ];


                const rows =
                    XLSX.utils.sheet_to_json(
                        sheet,
                        {
                            defval: "",
                            raw: true
                        }
                    );


                console.log(
                    "📊 Excel rows found:",
                    rows.length
                );


                if (!rows.length) {

                    alert(
                        "Excel file is empty."
                    );

                    return;
                }


                // ======================================
                // AUTO COLUMN MAPPING
                // ======================================

                const mapping =
                    autoMapExcelColumns(
                        rows
                    );


                console.log(
                    "📌 Final Excel Mapping:",
                    mapping
                );


                // ======================================
                // REQUIRED COLUMN CHECK
                // ======================================

                if (!mapping.name) {

                    alert(
                        "Could not automatically identify the expense/name column."
                    );

                    return;
                }


                if (!mapping.amount) {

                    alert(
                        "Could not automatically identify the amount column."
                    );

                    return;
                }


                if (!mapping.date) {

                    alert(
                        "Could not automatically identify the date column."
                    );

                    return;
                }


                // ======================================
                // PROCESS EVERY ROW
                // ======================================

                for (
                    let index = 0;
                    index < rows.length;
                    index++
                ) {

                    const row =
                        rows[index];


                    const rowNumber =
                        index + 2;


                    console.log(
                        `🔄 Processing row ${rowNumber}:`,
                        row
                    );


                    // ----------------------------------
                    // NAME
                    // ----------------------------------

                    const rawName =
                        getMappedExcelValue(
                            row,
                            mapping,
                            "name"
                        );


                    const name =
                        String(
                            rawName ??
                            ""
                        )
                            .trim();


                    // ----------------------------------
                    // AMOUNT
                    // ----------------------------------

                    const rawAmount =
                        getMappedExcelValue(
                            row,
                            mapping,
                            "amount"
                        );


                    const amount =
                        parseExcelAmount(
                            rawAmount
                        );


                    // ----------------------------------
                    // CATEGORY
                    // ----------------------------------

                    let rawCategory =
                        getMappedExcelValue(
                            row,
                            mapping,
                            "category"
                        );


                    let category =
                        String(
                            rawCategory ??
                            ""
                        )
                            .trim();


                    if (!category) {

                        category =
                            "Others";
                    }


                    // ----------------------------------
                    // DATE
                    // ----------------------------------

                    const rawDate =
                        getMappedExcelValue(
                            row,
                            mapping,
                            "date"
                        );


                    const date =
                        parseExcelDate(
                            rawDate
                        );


                    // ==================================
                    // DEBUG
                    // ==================================

                    console.log(
                        `📋 Row ${rowNumber} parsed:`,
                        {
                            name,
                            rawAmount,
                            amount,
                            category,
                            rawDate,
                            date
                        }
                    );


                    // ==================================
                    // VALIDATE NAME
                    // ==================================

                    if (!name) {

                        skipped++;

                        errors.push(
                            `Row ${rowNumber}: Name missing`
                        );

                        continue;
                    }


                    // ==================================
                    // VALIDATE AMOUNT
                    // ==================================

                    if (
                        !Number.isFinite(
                            amount
                        ) ||
                        amount <= 0
                    ) {

                        skipped++;

                        errors.push(
                            `Row ${rowNumber}: Invalid amount (${rawAmount})`
                        );

                        continue;
                    }


                    // ==================================
                    // VALIDATE DATE
                    // ==================================

                    if (!date) {

                        skipped++;

                        errors.push(
                            `Row ${rowNumber}: Invalid date (${rawDate})`
                        );

                        continue;
                    }


                    // ==================================
                    // SEND TO RAILWAY
                    // ==================================

                    try {

                        const result =
                            await apiRequest(
                                "/expenses",
                                {
                                    method: "POST",

                                    body:
                                        JSON.stringify({
                                            email,
                                            name,
                                            amount,
                                            category,
                                            date
                                        })
                                }
                            );


                        if (
                            result &&
                            result.success ===
                            true
                        ) {

                            imported++;

                            console.log(
                                `✅ Row ${rowNumber} imported`
                            );

                        } else {

                            skipped++;

                            errors.push(
                                `Row ${rowNumber}: ${
                                    result?.message ||
                                    "API rejected row"
                                }`
                            );
                        }


                    } catch (error) {

                        skipped++;

                        errors.push(
                            `Row ${rowNumber}: ${error.message}`
                        );
                    }
                }


                // ======================================
                // REFRESH DASHBOARD
                // ======================================

                await refreshDashboard();


                // ======================================
                // RESULT
                // ======================================

                console.log(
                    "======================================"
                );

                console.log(
                    "📊 EXCEL IMPORT RESULT"
                );

                console.log(
                    "Imported:",
                    imported
                );

                console.log(
                    "Skipped:",
                    skipped
                );

                console.log(
                    "Total:",
                    rows.length
                );

                console.log(
                    "Errors:",
                    errors
                );

                console.log(
                    "======================================"
                );


                let message =
                    "Excel Import Completed ✅\n\n" +
                    "Imported: " +
                    imported +
                    "\n" +
                    "Skipped: " +
                    skipped +
                    "\n" +
                    "Total Rows: " +
                    rows.length;


                if (
                    errors.length
                ) {

                    message +=
                        "\n\nFirst errors:\n" +
                        errors
                            .slice(0, 10)
                            .join("\n");
                }


                alert(
                    message
                );


            } catch (error) {

                console.error(
                    "❌ Excel import error:",
                    error
                );


                alert(
                    "Excel import failed.\n\n" +
                    error.message
                );


            } finally {

                this.value =
                    "";
            }
        }
    );
}


// ======================================================
// ================= PROFILE =============================
// ======================================================

function openProfile() {

    window.location.href =
        "profile.html";
}

window.openProfile =
    openProfile;


// ======================================================
// ================= INITIALIZE ==========================
// ======================================================

async function initializeDashboard() {

    if (
        dashboardInitialized
    ) {

        console.log(
            "⚠️ Dashboard already initialized. Skipping."
        );

        return;
    }


    dashboardInitialized =
        true;


    console.log(
        "🚀 Initializing Dashboard..."
    );


    await refreshDashboard();


    console.log(
        "✅ Dashboard Ready"
    );
}


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeDashboard,
        {
            once: true
        }
    );

} else {

    initializeDashboard();
}


// ======================================================
// ================= GLOBAL EXPORTS ======================
// ======================================================

window.loadExpenses =
    loadExpenses;

window.loadIncome =
    loadIncome;

window.addIncome =
    addIncome;

window.addExpense =
    addExpense;

window.displayTransactions =
    displayTransactions;

window.refreshDashboard =
    refreshDashboard;

window.calculateTotals =
    calculateTotals;


console.log(
    "======================================"
);

console.log(
    "✅ DASHBOARD JS READY"
);

console.log(
    "======================================"
);    