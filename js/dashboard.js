// ======================================================
// ================ EXPENSE TRACKER PRO =================
// =================== DASHBOARD JS ======================
// ============== FINAL AUTO EXCEL VERSION ===============
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

// ======================================================
// ================= API REQUEST =========================
// ======================================================

async function apiRequest(endpoint, options = {}) {

    const url =
        API_BASE + endpoint;

    console.log(
        "➡️ API:",
        options.method || "GET",
        url
    );

    const fetchOptions = {
        method:
            options.method || "GET",

        headers: {
            "Content-Type":
                "application/json",

            "Accept":
                "application/json"
        }
    };

    if (
        options.body !== undefined
    ) {
        fetchOptions.body =
            options.body;
    }

    try {

        const response =
            await fetch(
                url,
                fetchOptions
            );

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

    if (
        value instanceof Date
    ) {

        if (
            isNaN(
                value.getTime()
            )
        ) {
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
        /^\d{4}-\d{1,2}-\d{1,2}$/
            .test(str)
    ) {

        const parts =
            str.split("-");

        return (
            parts[0] +
            "-" +
            String(parts[1]).padStart(2, "0") +
            "-" +
            String(parts[2]).padStart(2, "0")
        );
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

    match =
        str.match(
            /^(\d{1,2})-(\d{1,2})-(\d{2})$/
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

    const parsed =
        new Date(str);

    if (
        isNaN(
            parsed.getTime()
        )
    ) {
        return "";
    }

    return (
        parsed.getFullYear() +
        "-" +
        String(
            parsed.getMonth() + 1
        ).padStart(2, "0") +
        "-" +
        String(
            parsed.getDate()
        ).padStart(2, "0")
    );
}

window.normalizeDate =
    normalizeDate;

// ======================================================
// ================= ESCAPE HTML =========================
// ======================================================

function escapeHTML(value) {

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
// ================= THEME ===============================
// ======================================================

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

function loadTheme() {

    const theme =
        localStorage.getItem(
            "theme"
        );

    if (
        theme === "light"
    ) {

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

if (
    menuBtn &&
    sideMenu
) {

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
            sideMenu.classList.contains(
                "active"
            ) &&
            !sideMenu.contains(
                event.target
            ) &&
            !menuBtn.contains(
                event.target
            )
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

            if (
                this.value === "Others"
            ) {

                if (customCategory) {

                    customCategory.style.display =
                        "block";

                    customCategory.focus();
                }

            } else {

                if (customCategory) {

                    customCategory.style.display =
                        "none";

                    customCategory.value =
                        "";
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
        localStorage.getItem(
            "userEmail"
        );

    if (!email) {

        expenses = [];

        return;
    }

    try {

        const data =
            await apiRequest(
                "/expenses/" +
                encodeURIComponent(
                    email
                )
            );

        console.log(
            "Expenses API Response:",
            data
        );

        if (
            data &&
            Array.isArray(
                data.expenses
            )
        ) {

            expenses =
                data.expenses;

        } else if (
            data &&
            Array.isArray(
                data.data
            )
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
        localStorage.getItem(
            "userEmail"
        );

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
                encodeURIComponent(
                    email
                )
            );

        console.log(
            "Income API Response:",
            data
        );

        if (
            data &&
            Array.isArray(
                data.income
            )
        ) {

            allIncome =
                data.income;

        } else if (
            data &&
            Array.isArray(
                data.data
            )
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
        Number(
            amountInput.value
        );

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
        localStorage.getItem(
            "userEmail"
        );

    if (!email) {

        alert(
            "Login session expired. Please login again."
        );

        window.location.href =
            "index.html";

        return;
    }

    if (addIncomeBtn) {

        addIncomeBtn.disabled =
            true;

        addIncomeBtn.textContent =
            "Adding...";
    }

    try {

        const result =
            await apiRequest(
                "/income",
                {
                    method:
                        "POST",

                    body:
                        JSON.stringify({
                            email,
                            name,
                            source:
                                name,
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

            nameInput.value =
                "";

            amountInput.value =
                "";

            dateInput.value =
                "";

            await refreshDashboard();

        } else {

            alert(
                result?.message ||
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

            addIncomeBtn.disabled =
                false;

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
        Number(
            amountInput.value
        );

    let category =
        categoryInput.value.trim();

    const date =
        dateInput.value;

    if (
        category === "Others"
    ) {

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
        localStorage.getItem(
            "userEmail"
        );

    if (!email) {

        alert(
            "Login session expired. Please login again."
        );

        window.location.href =
            "index.html";

        return;
    }

    if (addExpenseBtn) {

        addExpenseBtn.disabled =
            true;

        addExpenseBtn.textContent =
            "Adding...";
    }

    try {

        const result =
            await apiRequest(
                "/expenses",
                {
                    method:
                        "POST",

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

            nameInput.value =
                "";

            amountInput.value =
                "";

            dateInput.value =
                "";

            categoryInput.value =
                "Food";

            if (customInput) {

                customInput.value =
                    "";

                customInput.style.display =
                    "none";
            }

            await refreshDashboard();

        } else {

            alert(
                result?.message ||
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

            addExpenseBtn.disabled =
                false;

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

    expenseList.innerHTML =
        "";

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

    expenses.forEach(
        item => {

            transactions.push({

                type:
                    "expense",

                id:
                    item.id,

                name:
                    item.name ||
                    item.description ||
                    "Expense",

                amount:
                    Number(
                        item.amount
                    ) || 0,

                category:
                    item.category ||
                    "Others",

                date:
                    normalizeDate(
                        item.date
                    )
            });
        }
    );

    allIncome.forEach(
        item => {

            transactions.push({

                type:
                    "income",

                id:
                    item.id,

                name:
                    item.name ||
                    item.source ||
                    "Income",

                amount:
                    Number(
                        item.amount
                    ) || 0,

                category:
                    "Income",

                date:
                    normalizeDate(
                        item.date
                    )
            });
        }
    );

    transactions.sort(
        (a, b) => {

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

            return dateB -
                dateA;
        }
    );

    let count = 0;

    transactions.forEach(
        transaction => {

            const matchesSearch =
                !search ||
                String(
                    transaction.name
                )
                    .toLowerCase()
                    .includes(search) ||
                String(
                    transaction.category
                )
                    .toLowerCase()
                    .includes(search);

            const matchesFilter =
                filter === "all" ||
                filter ===
                    transaction.type;

            if (
                !matchesSearch ||
                !matchesFilter
            ) {
                return;
            }

            count++;

            const row =
                document.createElement(
                    "tr"
                );

            const amount =
                transaction.type ===
                    "income"
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

            expenseList.appendChild(
                row
            );
        }
    );

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
            normalizeDate(
                item.date
            );

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
                        "/expenses/" +
                        id,
                        {
                            method:
                                "PUT",

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
                        result?.message ||
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
            formatCurrency(
                item.amount
            )
        )
    ) {
        return;
    }

    try {

        const result =
            await apiRequest(
                "/expenses/" +
                id,
                {
                    method:
                        "DELETE"
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
                result?.message ||
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
            normalizeDate(
                item.date
            );

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
                        "/income/" +
                        id,
                        {
                            method:
                                "PUT",

                            body:
                                JSON.stringify({
                                    name:
                                        source,

                                    source:
                                        source,

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
                        result?.message ||
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
            formatCurrency(
                item.amount
            )
        )
    ) {
        return;
    }

    try {

        const result =
            await apiRequest(
                "/income/" +
                id,
                {
                    method:
                        "DELETE"
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
                result?.message ||
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

    allIncome.forEach(
        item => {

            const date =
                normalizeDate(
                    item.date
                );

            if (!date) return;

            const d =
                new Date(
                    date +
                    "T00:00:00"
                );

            if (
                d.getMonth() ===
                    currentMonth &&
                d.getFullYear() ===
                    currentYear
            ) {

                incomeTotal +=
                    Number(
                        item.amount
                    ) || 0;
            }
        }
    );

    expenses.forEach(
        item => {

            const date =
                normalizeDate(
                    item.date
                );

            if (!date) return;

            const d =
                new Date(
                    date +
                    "T00:00:00"
                );

            if (
                d.getMonth() ===
                    currentMonth &&
                d.getFullYear() ===
                    currentYear
            ) {

                expenseTotal +=
                    Number(
                        item.amount
                    ) || 0;
            }
        }
    );

    const balance =
        incomeTotal -
        expenseTotal;

    if (totalIncome) {

        totalIncome.textContent =
            formatCurrency(
                incomeTotal
            );
    }

    if (totalExpense) {

        totalExpense.textContent =
            formatCurrency(
                expenseTotal
            );
    }

    if (totalBalance) {

        totalBalance.textContent =
            formatCurrency(
                balance
            );
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
            balance <=
                incomeTotal * 0.1
        ) {

            warning.textContent =
                "⚠️ Your remaining balance is low.";

            warning.style.display =
                "block";

        } else {

            warning.textContent =
                "";

            warning.style.display =
                "none";
        }
    }

    console.log(
        "Current Month Totals:",
        {
            income:
                incomeTotal,

            expense:
                expenseTotal,

            balance:
                balance
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

    dashboardLoading =
        true;

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

        dashboardLoading =
            false;
    }
}

window.refreshDashboard =
    refreshDashboard;

// ======================================================
// ============ EXCEL UNIVERSAL HELPERS =================
// ======================================================

function excelCellToText(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    if (
        typeof value === "object"
    ) {

        if (
            value.v !== undefined
        ) {
            return excelCellToText(
                value.v
            );
        }

        if (
            value.value !== undefined
        ) {
            return excelCellToText(
                value.value
            );
        }

        if (
            value.result !== undefined
        ) {
            return excelCellToText(
                value.result
            );
        }
    }

    return String(value)
        .trim();
}

function isExcelRowEmpty(row) {

    if (!Array.isArray(row)) {
        return true;
    }

    return row.every(
        cell =>
            excelCellToText(
                cell
            ) === ""
    );
}

// ======================================================
// ============ NORMALIZE EXCEL HEADER ==================
// ======================================================

function normalizeExcelHeader(value) {

    return String(
        value ?? ""
    )
        .replace(
            /^\uFEFF/,
            ""
        )
        .trim()
        .toLowerCase()
        .replace(
            /[₹$€£]/g,
            ""
        )
        .replace(
            /[_\-\/\\]+/g,
            " "
        )
        .replace(
            /[\(\)\[\]\{\}:#]+/g,
            " "
        )
        .replace(
            /\s+/g,
            " "
        )
        .trim();
}

// ======================================================
// ============ HEADER SCORE =============================
// ======================================================

function scoreExcelHeader(
    header,
    type
) {

    const h =
        normalizeExcelHeader(
            header
        );

    if (!h) return 0;

    const groups = {

        name: [
            "description",
            "expense description",
            "expense name",
            "expense item",
            "item name",
            "item",
            "name",
            "particular",
            "particulars",
            "details",
            "transaction name",
            "transaction details",
            "transaction",
            "title",
            "narration",
            "remarks",
            "purpose",
            "activity",
            "product",
            "service"
        ],

        amount: [
            "amount",
            "amount rs",
            "amount inr",
            "amount rupees",
            "amount ₹",
            "expense amount",
            "expense cost",
            "expense value",
            "cost",
            "price",
            "spent",
            "spending",
            "paid",
            "payment amount",
            "payment value",
            "total amount",
            "total",
            "value",
            "debit",
            "withdrawal",
            "charge",
            "charges",
            "money"
        ],

        category: [
            "category",
            "expense category",
            "category name",
            "expense type",
            "type",
            "group",
            "class",
            "classification",
            "nature"
        ],

        date: [
            "date",
            "expense date",
            "transaction date",
            "purchase date",
            "payment date",
            "created date",
            "expense day",
            "day",
            "datetime",
            "date time",
            "timestamp"
        ],

        paymentMethod: [
            "payment method",
            "payment mode",
            "paid by",
            "payment type",
            "method",
            "mode",
            "payment",
            "paid through",
            "paid via"
        ]
    };

    const list =
        groups[type] || [];

    let score = 0;

    for (
        const wanted of list
    ) {

        const w =
            normalizeExcelHeader(
                wanted
            );

        if (
            h === w
        ) {

            score =
                Math.max(
                    score,
                    100
                );

        } else if (
            h.includes(w) ||
            w.includes(h)
        ) {

            score =
                Math.max(
                    score,
                    75
                );
        }
    }

    return score;
}

// ======================================================
// ============ LOOKS LIKE AMOUNT =======================
// ======================================================

function looksLikeAmount(value) {

    if (
        typeof value ===
        "number"
    ) {

        return Number.isFinite(
            value
        );
    }

    const text =
        excelCellToText(
            value
        );

    if (!text) {
        return false;
    }

    let cleaned =
        text
            .replace(
                /₹|\$|€|£/g,
                ""
            )
            .replace(
                /\b(?:rs|inr|usd|eur|gbp|rupees?)\b/gi,
                ""
            )
            .replace(
                /,/g,
                ""
            )
            .replace(
                /\s/g,
                ""
            )
            .replace(
                /[()]/g,
                ""
            );

    return /^-?\d+(?:\.\d+)?$/
        .test(cleaned);
}

// ======================================================
// ============ LOOKS LIKE DATE ==========================
// ======================================================

function looksLikeDate(value) {

    if (
        value instanceof Date &&
        !isNaN(
            value.getTime()
        )
    ) {
        return true;
    }

    if (
        typeof value ===
            "number" &&
        Number.isFinite(value)
    ) {

        return (
            value >= 20000 &&
            value <= 100000
        );
    }

    const text =
        excelCellToText(
            value
        );

    if (!text) {
        return false;
    }

    if (
        /^\d{4}[-\/]\d{1,2}[-\/]\d{1,2}/
            .test(text)
    ) {
        return true;
    }

    if (
        /^\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}$/
            .test(text)
    ) {
        return true;
    }

    if (
        /^\d{1,2}\s+[A-Za-z]{3,12}\s+\d{2,4}$/
            .test(text)
    ) {
        return true;
    }

    if (
        /^[A-Za-z]{3,12}\s+\d{1,2},?\s+\d{2,4}$/
            .test(text)
    ) {
        return true;
    }

    const parsed =
        new Date(text);

    return (
        !isNaN(
            parsed.getTime()
        ) &&
        /\d/.test(text)
    );
}

// ======================================================
// ============ VALUE BASED COLUMN INFERENCE =============
// ======================================================

function inferExcelColumn(
    matrix,
    type,
    usedColumns
) {

    if (
        !Array.isArray(matrix) ||
        !matrix.length
    ) {
        return null;
    }

    let bestIndex =
        null;

    let bestScore =
        -Infinity;

    const sample =
        matrix.slice(
            0,
            Math.min(
                matrix.length,
                40
            )
        );

    const width =
        Math.max(
            ...sample.map(
                row =>
                    Array.isArray(row)
                        ? row.length
                        : 0
            ),
            0
        );

    for (
        let col = 0;
        col < width;
        col++
    ) {

        if (
            usedColumns.has(
                col
            )
        ) {
            continue;
        }

        const values =
            sample
                .map(
                    row =>
                        row &&
                        row[col]
                )
                .filter(
                    value =>
                        excelCellToText(
                            value
                        ) !== ""
                );

        if (
            !values.length
        ) {
            continue;
        }

        let score = 0;

        if (
            type ===
            "amount"
        ) {

            const matches =
                values.filter(
                    looksLikeAmount
                ).length;

            score =
                (
                    matches /
                    values.length
                ) * 100;

            if (
                matches >= 2
            ) {
                score += 15;
            }
        }

        if (
            type ===
            "date"
        ) {

            const matches =
                values.filter(
                    looksLikeDate
                ).length;

            score =
                (
                    matches /
                    values.length
                ) * 100;

            if (
                matches >= 2
            ) {
                score += 15;
            }
        }

        if (
            type ===
            "name"
        ) {

            const matches =
                values.filter(
                    value => {

                        const text =
                            excelCellToText(
                                value
                            );

                        return (
                            /[A-Za-z]/.test(
                                text
                            ) &&
                            !looksLikeDate(
                                value
                            ) &&
                            !looksLikeAmount(
                                value
                            )
                        );
                    }
                ).length;

            score =
                (
                    matches /
                    values.length
                ) * 100;

            const first =
                excelCellToText(
                    sample[0]?.[col]
                );

            if (
                /^(s\.?\s*no|serial|sl|id|number|no\.?)$/i
                    .test(first)
            ) {

                score -= 70;
            }
        }

        if (
            type ===
            "category"
        ) {

            const matches =
                values.filter(
                    value => {

                        const text =
                            excelCellToText(
                                value
                            );

                        return (
                            /[A-Za-z]/.test(
                                text
                            ) &&
                            !looksLikeDate(
                                value
                            ) &&
                            !looksLikeAmount(
                                value
                            )
                        );
                    }
                ).length;

            score =
                (
                    matches /
                    values.length
                ) * 70;

            const unique =
                new Set(
                    values.map(
                        value =>
                            excelCellToText(
                                value
                            ).toLowerCase()
                    )
                );

            if (
                unique.size <=
                Math.max(
                    10,
                    values.length * 0.7
                )
            ) {

                score += 20;
            }
        }

        if (
            type ===
            "paymentMethod"
        ) {

            const matches =
                values.filter(
                    value =>
                        /upi|cash|card|bank|transfer|online|wallet|net banking|credit|debit|cheque|check|gpay|google pay|phonepe|paytm/i
                            .test(
                                excelCellToText(
                                    value
                                )
                            )
                ).length;

            score =
                (
                    matches /
                    values.length
                ) * 100;
        }

        if (
            score >
            bestScore
        ) {

            bestScore =
                score;

            bestIndex =
                col;
        }
    }

    const minimum =
        type === "name" ||
        type === "category"
            ? 30
            : 50;

    return (
        bestScore >= minimum
            ? bestIndex
            : null
    );
}
// ======================================================
// ================ EXPENSE TRACKER PRO =================
// =================== DASHBOARD JS ======================
// ==================== PART 2 ===========================
// ======================================================

// ======================================================
// ================= DATE PARSER =========================
// ======================================================

function parseExcelDate(value) {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "";
    }

    // Excel serial date
    if (
        typeof value === "number" &&
        Number.isFinite(value)
    ) {
        const date = new Date(
            Date.UTC(
                1899,
                11,
                30
            ) +
            value * 86400000
        );

        if (!isNaN(date.getTime())) {
            return (
                date.getUTCFullYear() +
                "-" +
                String(
                    date.getUTCMonth() + 1
                ).padStart(2, "0") +
                "-" +
                String(
                    date.getUTCDate()
                ).padStart(2, "0")
            );
        }
    }

    // JavaScript Date object
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

    let text = String(value).trim();

    if (!text) {
        return "";
    }

    // Remove time from ISO datetime
    text = text
        .replace(
            /T\d{1,2}:\d{2}(?::\d{2})?.*$/,
            ""
        )
        .trim();

    // YYYY-MM-DD or YYYY/MM/DD
    let match = text.match(
        /^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/
    );

    if (match) {
        return (
            Number(match[1]) +
            "-" +
            String(
                Number(match[2])
            ).padStart(2, "0") +
            "-" +
            String(
                Number(match[3])
            ).padStart(2, "0")
        );
    }

    // DD/MM/YYYY
    match = text.match(
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
    );

    if (match) {
        return (
            match[3] +
            "-" +
            String(
                Number(match[2])
            ).padStart(2, "0") +
            "-" +
            String(
                Number(match[1])
            ).padStart(2, "0")
        );
    }

    // DD-MM-YYYY
    match = text.match(
        /^(\d{1,2})-(\d{1,2})-(\d{4})$/
    );

    if (match) {
        return (
            match[3] +
            "-" +
            String(
                Number(match[2])
            ).padStart(2, "0") +
            "-" +
            String(
                Number(match[1])
            ).padStart(2, "0")
        );
    }

    // DD/MM/YY
    match = text.match(
        /^(\d{1,2})\/(\d{1,2})\/(\d{2})$/
    );

    if (match) {
        let year = Number(match[3]);

        year =
            year < 50
                ? 2000 + year
                : 1900 + year;

        return (
            year +
            "-" +
            String(
                Number(match[2])
            ).padStart(2, "0") +
            "-" +
            String(
                Number(match[1])
            ).padStart(2, "0")
        );
    }

    // DD-MM-YY
    match = text.match(
        /^(\d{1,2})-(\d{1,2})-(\d{2})$/
    );

    if (match) {
        let year = Number(match[3]);

        year =
            year < 50
                ? 2000 + year
                : 1900 + year;

        return (
            year +
            "-" +
            String(
                Number(match[2])
            ).padStart(2, "0") +
            "-" +
            String(
                Number(match[1])
            ).padStart(2, "0")
        );
    }

    // General date parsing
    const parsed = new Date(text);

    if (!isNaN(parsed.getTime())) {
        return (
            parsed.getFullYear() +
            "-" +
            String(
                parsed.getMonth() + 1
            ).padStart(2, "0") +
            "-" +
            String(
                parsed.getDate()
            ).padStart(2, "0")
        );
    }

    return "";
}

window.parseExcelDate = parseExcelDate;
// ======================================================
// ================= EXCEL IMPORT ========================
// ======================================================

async function importExpensesFromExcel(file) {

    if (!file) {
        alert("Please select an Excel file.");
        return;
    }

    if (typeof XLSX === "undefined") {
        alert(
            "Excel library is not loaded.\n\n" +
            "Please check XLSX script in dashboard.html."
        );
        return;
    }

    const email =
        localStorage.getItem("userEmail");

    if (!email) {
        alert(
            "Login session expired. Please login again."
        );

        window.location.href = "index.html";
        return;
    }

    try {

        console.log("📊 Reading Excel file:", file.name);

        const buffer =
            await file.arrayBuffer();

        const workbook =
            XLSX.read(buffer, {
                type: "array",
                cellDates: true
            });

        if (
            !workbook.SheetNames ||
            workbook.SheetNames.length === 0
        ) {
            alert("Excel file has no sheets.");
            return;
        }

        const sheetName =
            workbook.SheetNames[0];

        const worksheet =
            workbook.Sheets[sheetName];

        const matrix =
            XLSX.utils.sheet_to_json(
                worksheet,
                {
                    header: 1,
                    defval: "",
                    raw: true
                }
            );

        if (
            !matrix ||
            matrix.length < 2
        ) {
            alert(
                "Excel file does not contain enough data."
            );
            return;
        }

        console.log(
            "Excel rows:",
            matrix
        );

        // ----------------------------------------------
        // FIND HEADER ROW
        // ----------------------------------------------

        let headerRowIndex = 0;
        let headerScore = -1;

        matrix
            .slice(
                0,
                Math.min(matrix.length, 10)
            )
            .forEach(
                (row, index) => {

                    if (
                        !Array.isArray(row)
                    ) return;

                    let score = 0;

                    row.forEach(
                        cell => {

                            score +=
                                Math.max(
                                    scoreExcelHeader(
                                        cell,
                                        "name"
                                    ),
                                    scoreExcelHeader(
                                        cell,
                                        "amount"
                                    ),
                                    scoreExcelHeader(
                                        cell,
                                        "category"
                                    ),
                                    scoreExcelHeader(
                                        cell,
                                        "date"
                                    )
                                );
                        }
                    );

                    if (
                        score >
                        headerScore
                    ) {

                        headerScore =
                            score;

                        headerRowIndex =
                            index;
                    }
                }
            );

        const headers =
            matrix[headerRowIndex]
                .map(
                    cell =>
                        normalizeExcelHeader(
                            excelCellToText(
                                cell
                            )
                        )
                );

        console.log(
            "Detected headers:",
            headers
        );

        // ----------------------------------------------
        // FIND COLUMNS USING HEADER
        // ----------------------------------------------

        const usedColumns =
            new Set();

        function findHeaderColumn(type) {

            let bestColumn = null;
            let bestScore = 0;

            headers.forEach(
                (header, index) => {

                    if (
                        usedColumns.has(index)
                    ) {
                        return;
                    }

                    const score =
                        scoreExcelHeader(
                            header,
                            type
                        );

                    if (
                        score >
                        bestScore
                    ) {

                        bestScore =
                            score;

                        bestColumn =
                            index;
                    }
                }
            );

            if (
                bestColumn !== null &&
                bestScore >= 50
            ) {

                usedColumns.add(
                    bestColumn
                );

                return bestColumn;
            }

            return null;
        }

        let nameColumn =
            findHeaderColumn("name");

        let amountColumn =
            findHeaderColumn("amount");

        let categoryColumn =
            findHeaderColumn("category");

        let dateColumn =
            findHeaderColumn("date");

        // ----------------------------------------------
        // VALUE BASED FALLBACK
        // ----------------------------------------------

        if (
            nameColumn === null
        ) {

            nameColumn =
                inferExcelColumn(
                    matrix.slice(
                        headerRowIndex + 1
                    ),
                    "name",
                    usedColumns
                );

            if (
                nameColumn !== null
            ) {
                usedColumns.add(
                    nameColumn
                );
            }
        }

        if (
            amountColumn === null
        ) {

            amountColumn =
                inferExcelColumn(
                    matrix.slice(
                        headerRowIndex + 1
                    ),
                    "amount",
                    usedColumns
                );

            if (
                amountColumn !== null
            ) {
                usedColumns.add(
                    amountColumn
                );
            }
        }

        if (
            categoryColumn === null
        ) {

            categoryColumn =
                inferExcelColumn(
                    matrix.slice(
                        headerRowIndex + 1
                    ),
                    "category",
                    usedColumns
                );

            if (
                categoryColumn !== null
            ) {
                usedColumns.add(
                    categoryColumn
                );
            }
        }

        if (
            dateColumn === null
        ) {

            dateColumn =
                inferExcelColumn(
                    matrix.slice(
                        headerRowIndex + 1
                    ),
                    "date",
                    usedColumns
                );
        }

        console.log(
            "Excel column mapping:",
            {
                nameColumn,
                amountColumn,
                categoryColumn,
                dateColumn
            }
        );

        // ----------------------------------------------
        // VALIDATION
        // ----------------------------------------------

        if (
            nameColumn === null ||
            amountColumn === null
        ) {

            alert(
                "Could not identify Expense Name and Amount columns.\n\n" +
                "Your Excel should contain columns like:\n" +
                "Name | Amount | Category | Date"
            );

            return;
        }

        // ----------------------------------------------
        // CONVERT ROWS
        // ----------------------------------------------

        const importedExpenses = [];

        for (
            let i =
                headerRowIndex + 1;
            i < matrix.length;
            i++
        ) {

            const row =
                matrix[i];

            if (
                isExcelRowEmpty(row)
            ) {
                continue;
            }

            const rawName =
                row[nameColumn];

            const rawAmount =
                row[amountColumn];

            const rawCategory =
                categoryColumn !== null
                    ? row[categoryColumn]
                    : "";

            const rawDate =
                dateColumn !== null
                    ? row[dateColumn]
                    : "";

            const name =
                excelCellToText(
                    rawName
                ).trim();

            // ------------------------------------------
            // AMOUNT
            // ------------------------------------------

            let amountText =
                excelCellToText(
                    rawAmount
                );

            amountText =
                amountText
                    .replace(
                        /₹|\$|€|£/g,
                        ""
                    )
                    .replace(
                        /\b(?:rs|inr|usd|eur|gbp|rupees?)\b/gi,
                        ""
                    )
                    .replace(
                        /,/g,
                        ""
                    )
                    .replace(
                        /\s/g,
                        ""
                    )
                    .replace(
                        /[()]/g,
                        ""
                    );

            const amount =
                Number(
                    amountText
                );

            // ------------------------------------------
            // CATEGORY
            // ------------------------------------------

            let category =
                excelCellToText(
                    rawCategory
                ).trim();

            if (!category) {
                category = "Others";
            }

            // ------------------------------------------
            // DATE
            // ------------------------------------------

            let date =
                parseExcelDate(
                    rawDate
                );

            // If Excel has no date, use today
            if (!date) {

                const today =
                    new Date();

                date =
                    today.getFullYear() +
                    "-" +
                    String(
                        today.getMonth() + 1
                    ).padStart(2, "0") +
                    "-" +
                    String(
                        today.getDate()
                    ).padStart(2, "0");
            }

            // ------------------------------------------
            // SKIP INVALID ROW
            // ------------------------------------------

            if (
                !name ||
                !Number.isFinite(amount) ||
                amount <= 0
            ) {

                console.warn(
                    "Skipped invalid Excel row:",
                    i + 1,
                    row
                );

                continue;
            }

            importedExpenses.push({
                email,
                name,
                amount,
                category,
                date
            });
        }

        console.log(
            "Valid expenses found:",
            importedExpenses
        );

        if (
            importedExpenses.length === 0
        ) {

            alert(
                "No valid expenses found in the Excel file."
            );

            return;
        }

        // ----------------------------------------------
        // CONFIRM IMPORT
        // ----------------------------------------------

        const confirmed =
            confirm(
                importedExpenses.length +
                " expense(s) found.\n\n" +
                "Do you want to import them?"
            );

        if (!confirmed) {
            return;
        }

        // ----------------------------------------------
        // IMPORT TO DATABASE
        // ----------------------------------------------

        let successCount = 0;
        let failedCount = 0;

        for (
            const expense of
            importedExpenses
        ) {

            try {

                const result =
                    await apiRequest(
                        "/expenses",
                        {
                            method:
                                "POST",

                            body:
                                JSON.stringify(
                                    expense
                                )
                        }
                    );

                if (
                    result &&
                    result.success === true
                ) {

                    successCount++;

                } else {

                    failedCount++;

                    console.error(
                        "Import failed:",
                        result
                    );
                }

            } catch (error) {

                failedCount++;

                console.error(
                    "Import row failed:",
                    expense,
                    error
                );
            }
        }

        // ----------------------------------------------
        // REFRESH DASHBOARD
        // ----------------------------------------------

        await refreshDashboard();

        if (
            expenseFileInput
        ) {

            expenseFileInput.value =
                "";
        }

        alert(
            "Excel Import Completed ✅\n\n" +
            "Successfully imported: " +
            successCount +
            "\nFailed: " +
            failedCount
        );

    } catch (error) {

        console.error(
            "❌ Excel Import Error:",
            error
        );

        alert(
            "Excel import failed.\n\n" +
            error.message
        );
    }
}


// ======================================================
// ================= IMPORT BUTTON =======================
// ======================================================

if (
    importExpenseBtn &&
    expenseFileInput
) {

    importExpenseBtn.addEventListener(
        "click",
        function () {

            expenseFileInput.click();
        }
    );

    expenseFileInput.addEventListener(
        "change",
        async function () {

            const file =
                this.files &&
                this.files[0];

            if (!file) {
                return;
            }

            await importExpensesFromExcel(
                file
            );
        }
    );
}

window.importExpensesFromExcel =
    importExpensesFromExcel;


// ======================================================
// ================= INITIAL LOAD ========================
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        if (
            dashboardInitialized
        ) {
            return;
        }

        dashboardInitialized =
            true;

        console.log(
            "🚀 Dashboard initializing..."
        );

        await refreshDashboard();

        console.log(
            "✅ Dashboard initialized"
        );
    }
);