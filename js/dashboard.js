// ======================================================
// ================ EXPENSE TRACKER PRO =================
// =================== DASHBOARD JS ======================
// ============== NO LOCALSTORAGE VERSION ===============
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
// ================= DOM HELPER ==========================
// ======================================================

function $(id) {
    return document.getElementById(id);
}

// ======================================================
// ================= LOGIN CHECK ==========================
// ======================================================

function getUserEmail() {
    const userEmail =
        localStorage.getItem("userEmail") ||
        sessionStorage.getItem("userEmail");

    if (userEmail && userEmail.trim()) {
        return userEmail.trim().toLowerCase();
    }

    const userData =
        localStorage.getItem("user") ||
        sessionStorage.getItem("user");

    if (userData) {
        try {
            const user = JSON.parse(userData);

            if (user && user.email) {
                return String(user.email)
                    .trim()
                    .toLowerCase();
            }
        } catch (error) {
            console.error(
                "Invalid user session data:",
                error
            );
        }
    }

    console.error("No logged-in user found.");
    return null;
}
// ======================================================
// ================= GLOBAL DATA =========================
// ======================================================

let expenses = [];
let allIncome = [];

window.expenses = expenses;
window.allIncome = allIncome;

let dashboardInitialized = false;
let dashboardLoading = false;

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
        const response = await fetch(url, fetchOptions);
        const text = await response.text();

        let data = {};

        try {
            data = text ? JSON.parse(text) : {};
        } catch (parseError) {
            console.warn(
                "Server returned non-JSON response:",
                text
            );

            data = {
                success: false,
                message: text || "Invalid server response"
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
        console.error("❌ API ERROR:", error);
        throw error;
    }
}

window.apiRequest = apiRequest;

// ======================================================
// ================= FORMAT CURRENCY =====================
// ========== USE GLOBAL CURRENCY SYSTEM =================
// ======================================================

function formatDashboardCurrency(amount) {
    const value = Number(amount) || 0;

    // Use currency.js global formatter if available
    if (
        typeof window.formatCurrency === "function" &&
        window.formatCurrency !== formatDashboardCurrency
    ) {
        return window.formatCurrency(value);
    }

    // Fallback - INR
    return (
        "₹" +
        value.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })
    );
}

window.formatDashboardCurrency = formatDashboardCurrency;

// ======================================================
// ================= NORMALIZE DATE ======================
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
            String(value.getMonth() + 1).padStart(2, "0") +
            "-" +
            String(value.getDate()).padStart(2, "0")
        );
    }

    const str = String(value).trim();

    if (!str) {
        return "";
    }

    // YYYY-MM-DD
    let match = str.match(
        /^(\d{4})-(\d{1,2})-(\d{1,2})/
    );

    if (match) {
        return (
            match[1] +
            "-" +
            String(match[2]).padStart(2, "0") +
            "-" +
            String(match[3]).padStart(2, "0")
        );
    }

    // YYYY/MM/DD
    match = str.match(
        /^(\d{4})\/(\d{1,2})\/(\d{1,2})/
    );

    if (match) {
        return (
            match[1] +
            "-" +
            String(match[2]).padStart(2, "0") +
            "-" +
            String(match[3]).padStart(2, "0")
        );
    }

    // DD/MM/YYYY
    match = str.match(
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
    );

    if (match) {
        return (
            match[3] +
            "-" +
            String(match[2]).padStart(2, "0") +
            "-" +
            String(match[1]).padStart(2, "0")
        );
    }

    // DD-MM-YYYY
    match = str.match(
        /^(\d{1,2})-(\d{1,2})-(\d{4})$/
    );

    if (match) {
        return (
            match[3] +
            "-" +
            String(match[2]).padStart(2, "0") +
            "-" +
            String(match[1]).padStart(2, "0")
        );
    }

    // DD/MM/YY
    match = str.match(
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
            String(match[2]).padStart(2, "0") +
            "-" +
            String(match[1]).padStart(2, "0")
        );
    }

    // DD-MM-YY
    match = str.match(
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
            String(match[2]).padStart(2, "0") +
            "-" +
            String(match[1]).padStart(2, "0")
        );
    }

    const parsed = new Date(str);

    if (!isNaN(parsed.getTime())) {
        return (
            parsed.getFullYear() +
            "-" +
            String(parsed.getMonth() + 1).padStart(2, "0") +
            "-" +
            String(parsed.getDate()).padStart(2, "0")
        );
    }

    return "";
}

window.normalizeDate = normalizeDate;

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

window.escapeHTML = escapeHTML;


// ======================================================
// ================= SIDEBAR =============================
// ======================================================

if (menuBtn && sideMenu) {
    menuBtn.addEventListener(
        "click",
        function (event) {
            event.stopPropagation();
            sideMenu.classList.toggle("active");
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
            sideMenu.classList.remove("active");
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
            sessionStorage.removeItem("userEmail");
            sessionStorage.removeItem("userName");
            sessionStorage.removeItem("theme");
            sessionStorage.removeItem("resetEmail");

            window.location.href = "index.html";
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
                    customCategory.style.display = "block";
                    customCategory.focus();
                }
            } else {
                if (customCategory) {
                    customCategory.style.display = "none";
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
    const email = getUserEmail();

    if (!email) {
        return;
    }

    try {
        const data = await apiRequest(
            "/expenses/" +
            encodeURIComponent(email)
        );

        if (data && Array.isArray(data.expenses)) {
            expenses = data.expenses;
        } else if (data && Array.isArray(data.data)) {
            expenses = data.data;
        } else if (Array.isArray(data)) {
            expenses = data;
        } else {
            expenses = [];
        }

        window.expenses = expenses;

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
        window.expenses = expenses;
    }
}

window.loadExpenses = loadExpenses;

// ======================================================
// ================= LOAD INCOME =========================
// ======================================================

async function loadIncome() {
    const email = getUserEmail();

    if (!email) {
        return;
    }

    try {
        const data = await apiRequest(
            "/income/" +
            encodeURIComponent(email)
        );

        if (data && Array.isArray(data.income)) {
            allIncome = data.income;
        } else if (data && Array.isArray(data.data)) {
            allIncome = data.data;
        } else if (Array.isArray(data)) {
            allIncome = data;
        } else {
            allIncome = [];
        }

        window.allIncome = allIncome;

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
        window.allIncome = allIncome;
    }
}

window.loadIncome = loadIncome;

// ======================================================
// ================= ADD INCOME ==========================
// ======================================================

async function addIncome() {
    const nameInput = $("incomeName");
    const amountInput = $("incomeAmount");
    const dateInput = $("incomeDate");

    if (
        !nameInput ||
        !amountInput ||
        !dateInput
    ) {
        alert("Income form elements not found.");
        return;
    }

    const name = nameInput.value.trim();
    const amount = Number(amountInput.value);
    const date = dateInput.value;

    if (!name) {
        alert("Please enter income source.");
        nameInput.focus();
        return;
    }

    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {
        alert("Please enter a valid income amount.");
        amountInput.focus();
        return;
    }

    if (!date) {
        alert("Please select income date.");
        dateInput.focus();
        return;
    }

    const email = getUserEmail();

    if (!email) {
        return;
    }

    if (addIncomeBtn) {
        addIncomeBtn.disabled = true;
        addIncomeBtn.textContent = "Adding...";
    }

    try {
        const result = await apiRequest(
            "/income",
            {
                method: "POST",
                body: JSON.stringify({
                    email: email,
                    name: name,
                    source: name,
                    amount: amount,
                    date: date
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
                result?.message ||
                "Income could not be added."
            );
        }
    } catch (error) {
        console.error(
            "Add income error:",
            error
        );

        alert(
            "Unable to add income.\n\n" +
            error.message
        );
    } finally {
        if (addIncomeBtn) {
            addIncomeBtn.disabled = false;
            addIncomeBtn.textContent = "Add Income";
        }
    }
}

if (addIncomeBtn) {
    addIncomeBtn.addEventListener(
        "click",
        addIncome
    );
}

window.addIncome = addIncome;

// ======================================================
// ================= ADD EXPENSE =========================
// ======================================================

async function addExpense() {
    const nameInput = $("expenseName");
    const amountInput = $("expenseAmount");
    const categoryInput = $("expenseCategory");
    const customInput = $("customCategory");
    const dateInput = $("expenseDate");

    if (
        !nameInput ||
        !amountInput ||
        !categoryInput ||
        !dateInput
    ) {
        alert("Expense form elements not found.");
        return;
    }

    const name = nameInput.value.trim();
    const amount = Number(amountInput.value);
    const date = dateInput.value;

    let category =
        categoryInput.value.trim();

    if (category === "Others") {
        category = customInput
            ? customInput.value.trim()
            : "";
    }

    if (!name) {
        alert("Please enter expense name.");
        nameInput.focus();
        return;
    }

    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {
        alert("Please enter a valid expense amount.");
        amountInput.focus();
        return;
    }

    if (!category) {
        alert("Please select expense category.");
        return;
    }

    if (!date) {
        alert("Please select expense date.");
        dateInput.focus();
        return;
    }

    const email = getUserEmail();

    if (!email) {
        return;
    }

    if (addExpenseBtn) {
        addExpenseBtn.disabled = true;
        addExpenseBtn.textContent = "Adding...";
    }

    try {
        const result = await apiRequest(
            "/expenses",
            {
                method: "POST",
                body: JSON.stringify({
                    email: email,
                    name: name,
                    amount: amount,
                    category: category,
                    date: date
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
                customInput.style.display = "none";
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
            "Add expense error:",
            error
        );

        alert(
            "Unable to add expense.\n\n" +
            error.message
        );
    } finally {
        if (addExpenseBtn) {
            addExpenseBtn.disabled = false;
            addExpenseBtn.textContent = "Add Expense";
        }
    }
}

if (addExpenseBtn) {
    addExpenseBtn.addEventListener(
        "click",
        addExpense
    );
}

window.addExpense = addExpense;

// ======================================================
// ============== DISPLAY TRANSACTIONS ===================
// ======================================================

function displayTransactions() {
    if (!expenseList) {
        return;
    }

    expenseList.innerHTML = "";

    const search = searchExpense
        ? String(searchExpense.value || "")
            .toLowerCase()
            .trim()
        : "";

    const filter = transactionFilter
        ? transactionFilter.value
        : "all";

    const transactions = [];

    // ==================================================
    // EXPENSES
    // ==================================================

    expenses.forEach(
        function (item) {
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
        }
    );

    // ==================================================
    // INCOME
    // ==================================================

    allIncome.forEach(
        function (item) {
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
        }
    );

    // ==================================================
    // SORT NEWEST FIRST
    // ==================================================

    transactions.sort(
        function (a, b) {
            const dateA = a.date
                ? new Date(
                    a.date + "T00:00:00"
                ).getTime()
                : 0;

            const dateB = b.date
                ? new Date(
                    b.date + "T00:00:00"
                ).getTime()
                : 0;

            return dateB - dateA;
        }
    );

    let count = 0;

    // ==================================================
    // DISPLAY
    // ==================================================

    transactions.forEach(
        function (transaction) {
            const transactionName =
                String(transaction.name || "");

            const transactionCategory =
                String(transaction.category || "");

            const matchesSearch =
                !search ||
                transactionName
                    .toLowerCase()
                    .includes(search) ||
                transactionCategory
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

            const numericId =
                Number(transaction.id);

            if (
                transaction.type === "expense"
            ) {
                actions = `
                    <button
                        type="button"
                        class="edit-btn"
                        onclick="editExpenseById(${numericId})"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="delete-btn"
                        onclick="deleteExpenseById(${numericId})"
                    >
                        Delete
                    </button>
                `;
            } else {
                actions = `
                    <button
                        type="button"
                        class="edit-btn"
                        onclick="editIncomeById(${numericId})"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="delete-btn"
                        onclick="deleteIncomeById(${numericId})"
                    >
                        Delete
                    </button>
                `;
            }

            row.innerHTML = `
                <td>
                    ${
                        transaction.type === "income"
                            ? "Income"
                            : "Expense"
                    }
                </td>

                <td>
                    ${escapeHTML(transaction.name)}
                </td>

                <td>
                    ${amount}
                </td>

                <td>
                    ${escapeHTML(transaction.category)}
                </td>

                <td>
                    ${transaction.date || "-"}
                </td>

                <td>
                    ${actions}
                </td>
            `;

            expenseList.appendChild(row);
        }
    );

    if (count === 0) {
        expenseList.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    style="text-align: center; padding: 25px;"
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
    const item = expenses.find(
        function (x) {
            return Number(x.id) === Number(id);
        }
    );

    if (!item) {
        alert("Expense not found.");
        return;
    }

    if ($("editIndex")) {
        $("editIndex").value = item.id;
    }

    if ($("editName")) {
        $("editName").value =
            item.name ||
            item.description ||
            "";
    }

    if ($("editAmount")) {
        $("editAmount").value =
            item.amount || "";
    }

    if ($("editCategory")) {
        $("editCategory").value =
            item.category ||
            "Others";
    }

    if ($("editDate")) {
        $("editDate").value =
            normalizeDate(item.date);
    }

    const popup = $("editPopup");

    if (popup) {
        popup.style.display = "block";
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
                popup.style.display = "none";
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
                    ? $("editName").value.trim()
                    : "";

            const amount =
                $("editAmount")
                    ? Number($("editAmount").value)
                    : 0;

            const category =
                $("editCategory")
                    ? $("editCategory").value.trim()
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

            updateExpenseBtn.disabled = true;
            updateExpenseBtn.textContent = "Updating...";

            try {
                const result =
                    await apiRequest(
                        "/expenses/" +
                        encodeURIComponent(id),
                        {
                            method: "PUT",
                            body: JSON.stringify({
                                name: name,
                                amount: amount,
                                category: category,
                                date: date
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
            } finally {
                updateExpenseBtn.disabled = false;
                updateExpenseBtn.textContent = "Update Expense";
            }
        }
    );
}

// ======================================================
// ================= DELETE EXPENSE ======================
// ======================================================

async function deleteExpenseById(id) {
    const item = expenses.find(
        function (x) {
            return Number(x.id) === Number(id);
        }
    );

    if (!item) {
        alert("Expense not found.");
        return;
    }

    const itemName =
        item.name ||
        item.description ||
        "Expense";

    const confirmed =
        confirm(
            "Delete this expense?\n\n" +
            itemName +
            "\n" +
            formatCurrency(item.amount)
        );

    if (!confirmed) {
        return;
    }

    try {
        const result =
            await apiRequest(
                "/expenses/" +
                encodeURIComponent(id),
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
    const item = allIncome.find(
        function (x) {
            return Number(x.id) === Number(id);
        }
    );

    if (!item) {
        alert("Income not found.");
        return;
    }

    if ($("editIncomeId")) {
        $("editIncomeId").value =
            item.id;
    }

    if ($("editIncomeSource")) {
        $("editIncomeSource").value =
            item.name ||
            item.source ||
            "";
    }

    if ($("editIncomeAmount")) {
        $("editIncomeAmount").value =
            item.amount || "";
    }

    if ($("editIncomeDate")) {
        $("editIncomeDate").value =
            normalizeDate(item.date);
    }

    const popup =
        $("editIncomePopup");

    if (popup) {
        popup.style.display = "block";
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
                    ? $("editIncomeSource").value.trim()
                    : "";

            const amount =
                $("editIncomeAmount")
                    ? Number($("editIncomeAmount").value)
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

            updateIncomeBtn.disabled = true;
            updateIncomeBtn.textContent = "Updating...";

            try {
                const result =
                    await apiRequest(
                        "/income/" +
                        encodeURIComponent(id),
                        {
                            method: "PUT",
                            body: JSON.stringify({
                                name: source,
                                source: source,
                                amount: amount,
                                date: date
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
            } finally {
                updateIncomeBtn.disabled = false;
                updateIncomeBtn.textContent = "Update Income";
            }
        }
    );
}

// ======================================================
// ================= DELETE INCOME =======================
// ======================================================

async function deleteIncomeById(id) {
    const item = allIncome.find(
        function (x) {
            return Number(x.id) === Number(id);
        }
    );

    if (!item) {
        alert("Income not found.");
        return;
    }

    const itemName =
        item.name ||
        item.source ||
        "Income";

    const confirmed =
        confirm(
            "Delete this income?\n\n" +
            itemName +
            "\n" +
            formatCurrency(item.amount)
        );

    if (!confirmed) {
        return;
    }

    try {
        const result =
            await apiRequest(
                "/income/" +
                encodeURIComponent(id),
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
    const now = new Date();

    const currentMonth =
        now.getMonth();

    const currentYear =
        now.getFullYear();

    let incomeTotal = 0;
    let expenseTotal = 0;

    // ==================================================
    // CURRENT MONTH INCOME
    // ==================================================

    allIncome.forEach(
        function (item) {
            const date =
                normalizeDate(item.date);

            if (!date) {
                return;
            }

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
        }
    );

    // ==================================================
    // CURRENT MONTH EXPENSE
    // ==================================================

    expenses.forEach(
        function (item) {
            const date =
                normalizeDate(item.date);

            if (!date) {
                return;
            }

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
        }
    );

    const balance =
        incomeTotal - expenseTotal;

    // ==================================================
    // UPDATE UI
    // ==================================================

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

    // ==================================================
    // BALANCE WARNING
    // ==================================================

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

    return {
        income: incomeTotal,
        expense: expenseTotal,
        balance: balance
    };
}

window.calculateTotals =
    calculateTotals;

// ======================================================
// ================= REFRESH DASHBOARD ==================
// ======================================================

async function refreshDashboard() {
    if (dashboardLoading) {
        return;
    }

    dashboardLoading = true;

    try {
        await Promise.all([
            loadExpenses(),
            loadIncome()
        ]);

        displayTransactions();
        calculateTotals();

        console.log(
            "Dashboard refreshed ✅"
        );
    } catch (error) {
        console.error(
            "Dashboard refresh error:",
            error
        );
    } finally {
        dashboardLoading = false;
    }
}

window.refreshDashboard =
    refreshDashboard;

// ======================================================
// ================= EXCEL HELPERS =======================
// ======================================================

function excelCellToText(value) {
    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    if (typeof value === "object") {
        if (value.v !== undefined) {
            return excelCellToText(value.v);
        }

        if (value.value !== undefined) {
            return excelCellToText(value.value);
        }

        if (value.result !== undefined) {
            return excelCellToText(value.result);
        }
    }

    return String(value).trim();
}

function isExcelRowEmpty(row) {
    if (!Array.isArray(row)) {
        return true;
    }

    return row.every(
        function (cell) {
            return excelCellToText(cell) === "";
        }
    );
}

// ======================================================
// ================= EXCEL HEADER ========================
// ======================================================

function normalizeExcelHeader(value) {
    return String(value ?? "")
        .replace(/^\uFEFF/, "")
        .trim()
        .toLowerCase()
        .replace(/[₹$€£]/g, "")
        .replace(/[_\-\/\\]+/g, " ")
        .replace(/[\(\)\[\]\{\}:#]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function scoreExcelHeader(
    header,
    type
) {
    const h =
        normalizeExcelHeader(header);

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
        ]
    };

    const list =
        groups[type] || [];

    let score = 0;

    list.forEach(
        function (wanted) {
            const w =
                normalizeExcelHeader(
                    wanted
                );

            if (h === w) {
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
    );

    return score;
}

// ======================================================
// ================= EXCEL DATE ==========================
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
        const date =
            new Date(
                Date.UTC(
                    1899,
                    11,
                    30
                ) +
                value * 86400000
            );

        if (
            !isNaN(
                date.getTime()
            )
        ) {
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

    if (value instanceof Date) {
        return normalizeDate(value);
    }

    const text =
        String(value).trim();

    if (!text) {
        return "";
    }

    // YYYY-MM-DD / YYYY/MM/DD
    let match =
        text.match(
            /^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/
        );

    if (match) {
        return (
            match[1] +
            "-" +
            String(match[2]).padStart(2, "0") +
            "-" +
            String(match[3]).padStart(2, "0")
        );
    }

    // DD/MM/YYYY
    match =
        text.match(
            /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
        );

    if (match) {
        return (
            match[3] +
            "-" +
            String(match[2]).padStart(2, "0") +
            "-" +
            String(match[1]).padStart(2, "0")
        );
    }

    // DD-MM-YYYY
    match =
        text.match(
            /^(\d{1,2})-(\d{1,2})-(\d{4})$/
        );

    if (match) {
        return (
            match[3] +
            "-" +
            String(match[2]).padStart(2, "0") +
            "-" +
            String(match[1]).padStart(2, "0")
        );
    }

    // DD/MM/YY
    match =
        text.match(
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
            String(match[2]).padStart(2, "0") +
            "-" +
            String(match[1]).padStart(2, "0")
        );
    }

    // DD-MM-YY
    match =
        text.match(
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
            String(match[2]).padStart(2, "0") +
            "-" +
            String(match[1]).padStart(2, "0")
        );
    }

    const parsed =
        new Date(text);

    if (!isNaN(parsed.getTime())) {
        return normalizeDate(parsed);
    }

    return "";
}

window.parseExcelDate =
    parseExcelDate;

// ======================================================
// ================= EXCEL IMPORT ========================
// ======================================================

async function importExpensesFromExcel(file) {
    if (!file) {
        alert(
            "Please select an Excel file."
        );
        return;
    }

    if (typeof XLSX === "undefined") {
        alert(
            "Excel library is not loaded."
        );
        return;
    }

    const email =
        getUserEmail();

    if (!email) {
        return;
    }

    try {
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
                "Excel file has no sheets."
            );
            return;
        }

        const worksheet =
            workbook.Sheets[
                workbook.SheetNames[0]
            ];

        const matrix =
            XLSX.utils.sheet_to_json(
                worksheet,
                {
                    header: 1,
                    defval: "",
                    raw: true
                }
            );

        if (matrix.length < 2) {
            alert(
                "Excel file does not contain enough data."
            );
            return;
        }

        // ==================================================
        // HEADER DETECTION
        // ==================================================

        let headerRowIndex = 0;
        let headerScore = -1;

        matrix
            .slice(
                0,
                Math.min(
                    matrix.length,
                    10
                )
            )
            .forEach(
                function (row, index) {
                    let score = 0;

                    if (
                        Array.isArray(row)
                    ) {
                        row.forEach(
                            function (cell) {
                                score += Math.max(
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
                    }

                    if (
                        score > headerScore
                    ) {
                        headerScore = score;
                        headerRowIndex = index;
                    }
                }
            );

        const headers =
            matrix[
                headerRowIndex
            ].map(
                function (cell) {
                    return normalizeExcelHeader(cell);
                }
            );

        // ==================================================
        // COLUMN FINDER
        // ==================================================

        function findColumn(type) {
            let best = null;
            let bestScore = 0;

            headers.forEach(
                function (header, index) {
                    const score =
                        scoreExcelHeader(
                            header,
                            type
                        );

                    if (
                        score > bestScore
                    ) {
                        bestScore = score;
                        best = index;
                    }
                }
            );

            return best;
        }

        const nameColumn =
            findColumn("name");

        const amountColumn =
            findColumn("amount");

        const categoryColumn =
            findColumn("category");

        const dateColumn =
            findColumn("date");

        if (
            nameColumn === null ||
            amountColumn === null
        ) {
            alert(
                "Could not identify Name and Amount columns.\n\n" +
                "Use:\nName | Amount | Category | Date"
            );
            return;
        }

        // ==================================================
        // CONVERT DATA
        // ==================================================

        const importedExpenses = [];

        for (
            let i = headerRowIndex + 1;
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

            const name =
                excelCellToText(
                    row[nameColumn]
                );

            let amountText =
                excelCellToText(
                    row[amountColumn]
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
                    .trim();

            const amount =
                Number(amountText);

            let category =
                categoryColumn !== null
                    ? excelCellToText(
                        row[categoryColumn]
                    )
                    : "Others";

            if (!category) {
                category = "Others";
            }

            let date =
                dateColumn !== null
                    ? parseExcelDate(
                        row[dateColumn]
                    )
                    : "";

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

            if (
                !name ||
                !Number.isFinite(amount) ||
                amount <= 0
            ) {
                continue;
            }

            importedExpenses.push({
                email: email,
                name: name.trim(),
                amount: amount,
                category: category.trim(),
                date: date
            });
        }

        if (
            !importedExpenses.length
        ) {
            alert(
                "No valid expenses found."
            );
            return;
        }

        const confirmed =
            confirm(
                importedExpenses.length +
                " expense(s) found.\n\n" +
                "Import them?"
            );

        if (!confirmed) {
            return;
        }

        if (importExpenseBtn) {
            importExpenseBtn.disabled = true;
            importExpenseBtn.textContent = "Importing...";
        }

        let successCount = 0;
        let failedCount = 0;

        for (
            const expense of importedExpenses
        ) {
            try {
                const result =
                    await apiRequest(
                        "/expenses",
                        {
                            method: "POST",
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
                }
            } catch (error) {
                console.error(
                    "Import row failed:",
                    error
                );

                failedCount++;
            }
        }

        await refreshDashboard();

        if (expenseFileInput) {
            expenseFileInput.value = "";
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
            "Excel import error:",
            error
        );

        alert(
            "Excel import failed.\n\n" +
            error.message
        );
    } finally {
        if (importExpenseBtn) {
            importExpenseBtn.disabled = false;
            importExpenseBtn.textContent = "Import Excel";
        }
    }
}

window.importExpensesFromExcel =
    importExpensesFromExcel;

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

// ======================================================
// ================= INITIAL LOAD ========================
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {
        if (dashboardInitialized) {
            return;
        }

        dashboardInitialized = true;

        console.log(
            "🚀 Dashboard initializing..."
        );

        await refreshDashboard();

        console.log(
            "✅ Dashboard initialized"
        );
    }
);
// ======================================================
// ============== DASHBOARD PROFILE LETTER ==============
// ======================================================

function loadDashboardProfileLetter() {

    const profileLetter = $("profileLetter");

    if (!profileLetter) {
        return;
    }

    let name = "";

    // Get saved user name
    const userName =
        localStorage.getItem("userName") ||
        sessionStorage.getItem("userName");

    if (userName && userName.trim()) {
        name = userName.trim();
    }

    // If name not available, use email
    if (!name) {
        const email = getUserEmail();

        if (email) {
            name = email.split("@")[0];
        }
    }

    if (!name) {
        name = "User";
    }

    // Show first letter only
    profileLetter.textContent =
        name.charAt(0).toUpperCase();

    profileLetter.style.display = "flex";
}

// Load after dashboard DOM is ready
document.addEventListener(
    "DOMContentLoaded",
    function () {
        loadDashboardProfileLetter();
    }
);