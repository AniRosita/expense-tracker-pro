// ======================================================
// ================ EXPENSE TRACKER PRO =================
// =================== DASHBOARD JS ======================
// ==================== FINAL VERSION ====================
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
        /^\d{4}-\d{2}-\d{2}$/
            .test(str)
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

    const date =
        new Date(str);

    if (
        isNaN(
            date.getTime()
        )
    ) {
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
                this.value ===
                "Others"
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
        !Number.isFinite(
            amount
        ) ||
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
                            email:
                                email,

                            name:
                                name,

                            source:
                                name,

                            amount:
                                amount,

                            date:
                                date
                        })
                }
            );

        if (
            result &&
            result.success ===
                true
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
        !Number.isFinite(
            amount
        ) ||
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
                            email:
                                email,

                            name:
                                name,

                            amount:
                                amount,

                            category:
                                category,

                            date:
                                date
                        })
                }
            );

        if (
            result &&
            result.success ===
                true
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

    if (!expenseList)
        return;

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
                !Number.isFinite(
                    amount
                ) ||
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
                !Number.isFinite(
                    amount
                ) ||
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
// ================= EXCEL AUTO MAPPER ==================
// ===================== FINAL ===========================
// ======================================================

function normalizeExcelHeader(value) {

    return String(value ?? "")
        .replace(/^\uFEFF/, "")
        .trim()
        .toLowerCase()
        .replace(/[₹$€£]/g, "")
        .replace(/[\(\)\[\]\{\}:]/g, " ")
        .replace(/[_\-\/]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}


// ======================================================
// ============== HEADER KEYWORD MATCH =================
// ======================================================

function headerMatches(header, keywords) {

    const normalized =
        normalizeExcelHeader(header);

    return keywords.some(keyword => {

        const k =
            normalizeExcelHeader(keyword);

        return (
            normalized === k ||
            normalized.includes(k) ||
            k.includes(normalized)
        );
    });
}


// ======================================================
// ============== FIND COLUMN AUTOMATICALLY =============
// ======================================================

function findExcelColumn(row, type) {

    const keys =
        Object.keys(row);

    if (!keys.length) {
        return null;
    }

    // ==================================================
    // NAME / DESCRIPTION
    // ==================================================

    if (type === "name") {

        const exactPriority = [
            "description",
            "expense name",
            "expense",
            "item name",
            "item",
            "name",
            "particulars",
            "particular",
            "details",
            "transaction name",
            "transaction",
            "title",
            "expense description"
        ];

        // Exact / strongest match first
        for (const wanted of exactPriority) {

            const found =
                keys.find(key =>
                    normalizeExcelHeader(key) ===
                    normalizeExcelHeader(wanted)
                );

            if (found !== undefined) {
                return found;
            }
        }

        // Smart partial match
        const keywords = [
            "description",
            "expense name",
            "item name",
            "particular",
            "details",
            "transaction name",
            "expense description",
            "item",
            "title"
        ];

        const found =
            keys.find(key =>
                headerMatches(
                    key,
                    keywords
                )
            );

        if (found !== undefined) {
            return found;
        }
    }


    // ==================================================
    // AMOUNT
    // ==================================================

    if (type === "amount") {

        const exactPriority = [
            "amount",
            "amount rs",
            "amount inr",
            "amount ₹",
            "amount rs.",
            "amount rupees",
            "expense amount",
            "cost",
            "price",
            "spent",
            "spending",
            "paid",
            "payment amount",
            "expense cost",
            "expense value",
            "total"
        ];

        for (const wanted of exactPriority) {

            const found =
                keys.find(key =>
                    normalizeExcelHeader(key) ===
                    normalizeExcelHeader(wanted)
                );

            if (found !== undefined) {
                return found;
            }
        }

        // Smart amount detection
        const amountKeywords = [
            "amount",
            "cost",
            "price",
            "spent",
            "spending",
            "paid",
            "payment amount",
            "expense cost",
            "expense value",
            "total"
        ];

        const found =
            keys.find(key =>
                headerMatches(
                    key,
                    amountKeywords
                )
            );

        if (found !== undefined) {
            return found;
        }
    }


    // ==================================================
    // CATEGORY
    // ==================================================

    if (type === "category") {

        const exactPriority = [
            "category",
            "expense category",
            "category name",
            "expense type",
            "type"
        ];

        for (const wanted of exactPriority) {

            const found =
                keys.find(key =>
                    normalizeExcelHeader(key) ===
                    normalizeExcelHeader(wanted)
                );

            if (found !== undefined) {
                return found;
            }
        }

        const categoryKeywords = [
            "category",
            "expense category",
            "expense type"
        ];

        const found =
            keys.find(key =>
                headerMatches(
                    key,
                    categoryKeywords
                )
            );

        if (found !== undefined) {
            return found;
        }
    }


    // ==================================================
    // DATE
    // ==================================================

    if (type === "date") {

        const exactPriority = [
            "date",
            "expense date",
            "transaction date",
            "purchase date",
            "payment date",
            "created date",
            "expense day"
        ];

        for (const wanted of exactPriority) {

            const found =
                keys.find(key =>
                    normalizeExcelHeader(key) ===
                    normalizeExcelHeader(wanted)
                );

            if (found !== undefined) {
                return found;
            }
        }

        const dateKeywords = [
            "date",
            "expense date",
            "transaction date",
            "purchase date",
            "payment date",
            "created date",
            "day"
        ];

        const found =
            keys.find(key =>
                headerMatches(
                    key,
                    dateKeywords
                )
            );

        if (found !== undefined) {
            return found;
        }
    }


    // ==================================================
    // PAYMENT METHOD
    // ==================================================

    if (type === "paymentMethod") {

        const exactPriority = [
            "payment method",
            "payment",
            "method",
            "mode",
            "payment mode",
            "paid by",
            "payment type"
        ];

        for (const wanted of exactPriority) {

            const found =
                keys.find(key =>
                    normalizeExcelHeader(key) ===
                    normalizeExcelHeader(wanted)
                );

            if (found !== undefined) {
                return found;
            }
        }

        const paymentKeywords = [
            "payment method",
            "payment mode",
            "paid by",
            "payment type",
            "mode"
        ];

        const found =
            keys.find(key =>
                headerMatches(
                    key,
                    paymentKeywords
                )
            );

        if (found !== undefined) {
            return found;
        }
    }


    return null;
}


// ======================================================
// ================= GET EXCEL VALUE ====================
// ======================================================

function getAutoExcelValue(row, type) {

    const column =
        findExcelColumn(
            row,
            type
        );

    if (!column) {
        return "";
    }

    return row[column];
}


// ======================================================
// ================= PARSE AMOUNT ========================
// ======================================================

function parseExcelAmount(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return NaN;
    }

    // Excel numeric cell
    if (
        typeof value === "number"
    ) {

        return Number.isFinite(value)
            ? value
            : NaN;
    }

    // Some Excel libraries may return object
    if (
        typeof value === "object"
    ) {

        if (
            value.v !== undefined
        ) {

            return parseExcelAmount(
                value.v
            );
        }

        if (
            value.value !== undefined
        ) {

            return parseExcelAmount(
                value.value
            );
        }

        if (
            value.result !== undefined
        ) {

            return parseExcelAmount(
                value.result
            );
        }
    }

    let text =
        String(value)
            .trim();

    if (!text) {
        return NaN;
    }

    // Remove currency symbols
    text =
        text
            .replace(
                /₹/gi,
                ""
            )
            .replace(
                /rs\.?/gi,
                ""
            )
            .replace(
                /inr/gi,
                ""
            )
            .replace(
                /rupees?/gi,
                ""
            )
            .trim();

    // Remove commas
    text =
        text.replace(
            /,/g,
            ""
        );

    // Handle brackets: (500) = -500
    let negative =
        false;

    if (
        /^\(.*\)$/.test(text)
    ) {

        negative = true;

        text =
            text
                .slice(1, -1)
                .trim();
    }

    // Find numeric value
    const match =
        text.match(
            /-?\d+(?:\.\d+)?/
        );

    if (!match) {
        return NaN;
    }

    let number =
        Number(
            match[0]
        );

    if (!Number.isFinite(number)) {
        return NaN;
    }

    if (negative) {
        number =
            Math.abs(number) * -1;
    }

    return number;
}


// ======================================================
// ================= PARSE EXCEL DATE ===================
// ======================================================

function parseExcelDate(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "";
    }


    // ==================================================
    // Excel serial date
    // ==================================================

    if (
        typeof value === "number" &&
        Number.isFinite(value)
    ) {

        // Excel date serial
        if (
            value > 1 &&
            value < 100000
        ) {

            const excelDate =
                new Date(
                    Date.UTC(
                        1899,
                        11,
                        30
                    ) +
                    value *
                    86400000
                );

            if (
                !isNaN(
                    excelDate.getTime()
                )
            ) {

                return (
                    excelDate
                        .getUTCFullYear() +
                    "-" +
                    String(
                        excelDate
                            .getUTCMonth() + 1
                    ).padStart(2, "0") +
                    "-" +
                    String(
                        excelDate
                            .getUTCDate()
                    ).padStart(2, "0")
                );
            }
        }
    }


    // ==================================================
    // JavaScript Date
    // ==================================================

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


    // ==================================================
    // Object date
    // ==================================================

    if (
        typeof value === "object"
    ) {

        if (
            value.v !== undefined
        ) {

            return parseExcelDate(
                value.v
            );
        }

        if (
            value.value !== undefined
        ) {

            return parseExcelDate(
                value.value
            );
        }
    }


    // ==================================================
    // Normal string date
    // ==================================================

    return normalizeDate(
        value
    );
}


// ======================================================
// ================= EXCEL IMPORT ========================
// ================= AUTO MAPPING ========================
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

            if (!file) {
                return;
            }


            // ==================================================
            // XLSX CHECK
            // ==================================================

            if (
                typeof XLSX ===
                "undefined"
            ) {

                alert(
                    "Excel library not loaded."
                );

                this.value =
                    "";

                return;
            }


            // ==================================================
            // LOGIN CHECK
            // ==================================================

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


                // ==================================================
                // READ EXCEL
                // ==================================================

                const buffer =
                    await file.arrayBuffer();

                const workbook =
                    XLSX.read(
                        buffer,
                        {
                            type:
                                "array",

                            cellDates:
                                true
                        }
                    );


                if (
                    !workbook.SheetNames ||
                    workbook.SheetNames.length === 0
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


                // ==================================================
                // CONVERT TO JSON
                // ==================================================

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


                // ==================================================
                // DETECT HEADERS
                // ==================================================

                const headers =
                    Object.keys(
                        rows[0]
                    );

                console.log(
                    "📋 Excel Headers:",
                    headers
                );


                // ==================================================
                // AUTO MAP COLUMNS
                // ==================================================

                const mapping = {

                    name:
                        findExcelColumn(
                            rows[0],
                            "name"
                        ),

                    amount:
                        findExcelColumn(
                            rows[0],
                            "amount"
                        ),

                    category:
                        findExcelColumn(
                            rows[0],
                            "category"
                        ),

                    date:
                        findExcelColumn(
                            rows[0],
                            "date"
                        ),

                    paymentMethod:
                        findExcelColumn(
                            rows[0],
                            "paymentMethod"
                        )
                };


                console.log(
                    "🧠 AUTO COLUMN MAPPING:",
                    mapping
                );


                // ==================================================
                // REQUIRED COLUMN CHECK
                // ==================================================

                if (
                    !mapping.name ||
                    !mapping.amount ||
                    !mapping.date
                ) {

                    alert(
                        "Excel columns could not be detected automatically.\n\n" +
                        "Detected columns:\n" +
                        headers.join(", ") +
                        "\n\n" +
                        "Required:\n" +
                        "Description/Name\n" +
                        "Amount\n" +
                        "Date"
                    );

                    return;
                }


                // ==================================================
                // PROCESS EACH ROW
                // ==================================================

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
                        `🔄 Processing Excel row ${rowNumber}:`,
                        row
                    );


                    // ==================================================
                    // NAME
                    // ==================================================

                    const rawName =
                        getAutoExcelValue(
                            row,
                            "name"
                        );

                    const name =
                        String(
                            rawName ?? ""
                        )
                        .trim();


                    // ==================================================
                    // AMOUNT
                    // ==================================================

                    const rawAmount =
                        getAutoExcelValue(
                            row,
                            "amount"
                        );

                    const amount =
                        parseExcelAmount(
                            rawAmount
                        );


                    // ==================================================
                    // CATEGORY
                    // ==================================================

                    const rawCategory =
                        getAutoExcelValue(
                            row,
                            "category"
                        );

                    let category =
                        String(
                            rawCategory ?? ""
                        )
                        .trim();

                    if (!category) {

                        category =
                            "Others";
                    }


                    // ==================================================
                    // DATE
                    // ==================================================

                    const rawDate =
                        getAutoExcelValue(
                            row,
                            "date"
                        );

                    const date =
                        parseExcelDate(
                            rawDate
                        );


                    // ==================================================
                    // PAYMENT METHOD
                    // ==================================================

                    const rawPaymentMethod =
                        getAutoExcelValue(
                            row,
                            "paymentMethod"
                        );

                    const paymentMethod =
                        String(
                            rawPaymentMethod ?? ""
                        )
                        .trim();


                    // ==================================================
                    // DEBUG
                    // ==================================================

                    console.log(
                        `📋 Row ${rowNumber} AUTO-MAPPED:`,
                        {
                            name,
                            rawAmount,
                            amount,
                            category,
                            rawDate,
                            date,
                            paymentMethod
                        }
                    );


                    // ==================================================
                    // VALIDATE NAME
                    // ==================================================

                    if (!name) {

                        skipped++;

                        errors.push(
                            `Row ${rowNumber}: Name/Description missing`
                        );

                        console.warn(
                            `⚠️ Row ${rowNumber}: Name missing`
                        );

                        continue;
                    }


                    // ==================================================
                    // VALIDATE AMOUNT
                    // ==================================================

                    if (
                        !Number.isFinite(amount) ||
                        amount <= 0
                    ) {

                        skipped++;

                        errors.push(
                            `Row ${rowNumber}: Invalid amount (${rawAmount})`
                        );

                        console.warn(
                            `⚠️ Row ${rowNumber}: Invalid amount`,
                            rawAmount
                        );

                        continue;
                    }


                    // ==================================================
                    // VALIDATE DATE
                    // ==================================================

                    if (!date) {

                        skipped++;

                        errors.push(
                            `Row ${rowNumber}: Invalid date (${rawDate})`
                        );

                        console.warn(
                            `⚠️ Row ${rowNumber}: Invalid date`,
                            rawDate
                        );

                        continue;
                    }


                    // ==================================================
                    // SEND TO RAILWAY
                    // ==================================================

                    try {

                        const payload = {

                            email:
                                email,

                            name:
                                name,

                            amount:
                                amount,

                            category:
                                category,

                            date:
                                date
                        };


                        // Add payment method only
                        // if Excel contains it

                        if (
                            paymentMethod
                        ) {

                            payload.paymentMethod =
                                paymentMethod;
                        }


                        console.log(
                            `🚀 Sending row ${rowNumber}:`,
                            payload
                        );


                        const result =
                            await apiRequest(
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


                        console.log(
                            `⬅️ Row ${rowNumber} API response:`,
                            result
                        );


                        if (
                            result &&
                            result.success === true
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

                        console.error(
                            `❌ Row ${rowNumber} API error:`,
                            error
                        );
                    }
                }


                // ==================================================
                // REFRESH DASHBOARD
                // ==================================================

                await refreshDashboard();


                // ==================================================
                // RESULT
                // ==================================================

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
                    errors.length > 0
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
            once:
                true
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