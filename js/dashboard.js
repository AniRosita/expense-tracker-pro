```javascript
// ======================================================
// ================ EXPENSE TRACKER PRO =================
// =================== DASHBOARD JS =====================
// ======================================================

"use strict";

// ======================================================
// ================= API CONFIG ==========================
// ======================================================

const API_BASE =
    "https://expense-tracker-pro-production-b745.up.railway.app";

console.log("Dashboard API:", API_BASE);

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

// ======================================================
// ================= DOM ELEMENTS ========================
// ======================================================

const menuBtn =
    document.getElementById("menuBtn");

const sideMenu =
    document.querySelector(".side-menu");

const themeBtn =
    document.getElementById("themeBtn");

const logoutBtn =
    document.getElementById("logoutBtn");

const addIncomeBtn =
    document.getElementById("addIncomeBtn");

const addExpenseBtn =
    document.getElementById("addExpenseBtn");

const expenseList =
    document.getElementById("expenseList");

const totalExpense =
    document.getElementById("totalExpense");

const totalIncome =
    document.getElementById("totalIncome");

const totalBalance =
    document.getElementById("totalBalance");

const searchExpense =
    document.getElementById("searchExpense");

const filterType =
    document.getElementById("transactionFilter");

// ======================================================
// ================= EDIT EXPENSE =======================
// ======================================================

const editPopup =
    document.getElementById("editPopup");

const editIndex =
    document.getElementById("editIndex");

const editName =
    document.getElementById("editName");

const editAmount =
    document.getElementById("editAmount");

const editCategory =
    document.getElementById("editCategory");

const editDate =
    document.getElementById("editDate");

const updateExpenseBtn =
    document.getElementById("updateExpenseBtn");

const closeEditBtn =
    document.getElementById("closeEditBtn");

// ======================================================
// ================= EDIT INCOME =========================
// ======================================================

const editIncomePopup =
    document.getElementById("editIncomePopup");

const editIncomeId =
    document.getElementById("editIncomeId");

const editIncomeSource =
    document.getElementById("editIncomeSource");

const editIncomeAmount =
    document.getElementById("editIncomeAmount");

const editIncomeDate =
    document.getElementById("editIncomeDate");

const updateIncomeBtn =
    document.getElementById("updateIncomeBtn");

const closeIncomeEditBtn =
    document.getElementById("closeIncomeEditBtn");

// ======================================================
// ================= CATEGORY ============================
// ======================================================

const expenseCategory =
    document.getElementById("expenseCategory");

const customCategory =
    document.getElementById("customCategory");

// ======================================================
// ================= EXCEL IMPORT ========================
// ======================================================

const importExpenseBtn =
    document.getElementById("importExpenseBtn");

const expenseFileInput =
    document.getElementById("expenseFileInput");

// ======================================================
// ================= API HELPER ==========================
// ======================================================

async function apiRequest(endpoint, options = {}) {

    const url =
        API_BASE + endpoint;

    console.log(
        "API Request:",
        options.method || "GET",
        url
    );

    try {

        const response =
            await fetch(url, {
                ...options,

                headers: {
                    "Content-Type":
                        "application/json",

                    "Accept":
                        "application/json",

                    ...(options.headers || {})
                }
            });

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
            "API Response:",
            response.status,
            data
        );

        if (!response.ok) {

            throw new Error(
                data.message ||
                `Server returned ${response.status}`
            );

        }

        return data;

    } catch (error) {

        console.error(
            "API Request Error:",
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
// ================= THEME ===============================
// ======================================================

function loadSavedTheme() {

    const savedTheme =
        localStorage.getItem("theme");

    if (savedTheme === "light") {

        document.body.classList.add(
            "light-mode"
        );

    } else {

        document.body.classList.remove(
            "light-mode"
        );
    }
}

function updateThemeButton() {

    if (!themeBtn) return;

    if (
        document.body.classList.contains(
            "light-mode"
        )
    ) {

        themeBtn.innerHTML =
            "🌙 Dark Mode";

    } else {

        themeBtn.innerHTML =
            "☀️ Light Mode";
    }
}

loadSavedTheme();
updateThemeButton();

if (themeBtn) {

    themeBtn.addEventListener(
        "click",
        () => {

            document.body.classList.toggle(
                "light-mode"
            );

            const isLight =
                document.body.classList.contains(
                    "light-mode"
                );

            localStorage.setItem(
                "theme",
                isLight
                    ? "light"
                    : "dark"
            );

            updateThemeButton();
        }
    );
}

// ======================================================
// ================= SIDEBAR =============================
// ======================================================

if (menuBtn && sideMenu) {

    menuBtn.addEventListener(
        "click",
        () => {

            sideMenu.classList.toggle(
                "active"
            );
        }
    );
}

// ======================================================
// ================= LOGOUT ===============================
// ======================================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        () => {

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
// ================= CATEGORY =============================
// ======================================================

if (expenseCategory) {

    expenseCategory.addEventListener(
        "change",
        function () {

            if (this.value === "Others") {

                if (customCategory) {

                    customCategory.style.display =
                        "block";
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
// ================= LOAD EXPENSES ========================
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
                encodeURIComponent(email)
            );

        console.log(
            "Expense API DATA:",
            data
        );

        if (
            data &&
            data.success === true &&
            Array.isArray(data.expenses)
        ) {

            expenses =
                data.expenses;

        } else if (
            Array.isArray(data)
        ) {

            expenses =
                data;

        } else {

            expenses = [];

            console.warn(
                "No expenses returned:",
                data
            );
        }

        console.log(
            "Expenses Loaded:",
            expenses
        );

    } catch (error) {

        console.error(
            "Load Expenses Error:",
            error
        );

        expenses = [];
    }
}

// ======================================================
// ================= LOAD INCOME ==========================
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
                encodeURIComponent(email)
            );

        console.log(
            "Income API DATA:",
            data
        );

        if (
            data &&
            data.success === true &&
            Array.isArray(data.income)
        ) {

            allIncome =
                data.income;

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
            "Load Income Error:",
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

if (addIncomeBtn) {

    addIncomeBtn.addEventListener(
        "click",
        async () => {

            const sourceInput =
                document.getElementById(
                    "incomeName"
                );

            const amountInput =
                document.getElementById(
                    "incomeAmount"
                );

            const dateInput =
                document.getElementById(
                    "incomeDate"
                );

            const source =
                sourceInput
                    ? sourceInput.value.trim()
                    : "";

            const amount =
                amountInput
                    ? Number(amountInput.value)
                    : 0;

            const date =
                dateInput
                    ? dateInput.value
                    : "";

            if (
                !source ||
                amount <= 0 ||
                !date
            ) {

                alert(
                    "Please fill all income fields correctly."
                );

                return;
            }

            const email =
                localStorage.getItem(
                    "userEmail"
                );

            if (!email) {

                alert(
                    "User email not found. Please login again."
                );

                return;
            }

            try {

                const data =
                    await apiRequest(
                        "/income",
                        {
                            method: "POST",

                            body:
                                JSON.stringify({

                                    email:
                                        email,

                                    name:
                                        source,

                                    source:
                                        source,

                                    amount:
                                        amount,

                                    date:
                                        date
                                })
                        }
                    );

                if (data.success) {

                    alert(
                        "Income Added Successfully ✅"
                    );

                    if (sourceInput)
                        sourceInput.value = "";

                    if (amountInput)
                        amountInput.value = "";

                    if (dateInput)
                        dateInput.value = "";

                    await refreshDashboard();

                } else {

                    alert(
                        data.message ||
                        "Unable to add income."
                    );
                }

            } catch (error) {

                alert(
                    "Unable to add income: " +
                    error.message
                );
            }
        }
    );
}

// ======================================================
// ================= ADD EXPENSE =========================
// ======================================================

if (addExpenseBtn) {

    addExpenseBtn.addEventListener(
        "click",
        async () => {

            const nameInput =
                document.getElementById(
                    "expenseName"
                );

            const amountInput =
                document.getElementById(
                    "expenseAmount"
                );

            const categoryInput =
                document.getElementById(
                    "expenseCategory"
                );

            const customInput =
                document.getElementById(
                    "customCategory"
                );

            const dateInput =
                document.getElementById(
                    "expenseDate"
                );

            const name =
                nameInput
                    ? nameInput.value.trim()
                    : "";

            const amount =
                amountInput
                    ? Number(amountInput.value)
                    : 0;

            let category =
                categoryInput
                    ? categoryInput.value.trim()
                    : "";

            const date =
                dateInput
                    ? dateInput.value
                    : "";

            if (category === "Others") {

                category =
                    customInput
                        ? customInput.value.trim()
                        : "";
            }

            if (
                !name ||
                amount <= 0 ||
                !category ||
                !date
            ) {

                alert(
                    "Please fill all expense fields correctly."
                );

                return;
            }

            const email =
                localStorage.getItem(
                    "userEmail"
                );

            if (!email) {

                alert(
                    "User email not found. Please login again."
                );

                return;
            }

            try {

                const data =
                    await apiRequest(
                        "/expenses",
                        {
                            method: "POST",

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

                if (data.success) {

                    alert(
                        "Expense Added Successfully ✅"
                    );

                    if (nameInput)
                        nameInput.value = "";

                    if (amountInput)
                        amountInput.value = "";

                    if (dateInput)
                        dateInput.value = "";

                    if (customInput) {

                        customInput.value = "";

                        customInput.style.display =
                            "none";
                    }

                    await refreshDashboard();

                } else {

                    alert(
                        data.message ||
                        "Unable to add expense."
                    );
                }

            } catch (error) {

                alert(
                    "Unable to add expense: " +
                    error.message
                );
            }
        }
    );
}

// ======================================================
// ================= DISPLAY TRANSACTIONS ================
// ======================================================

function displayTransactions() {

    if (!expenseList) return;

    expenseList.innerHTML = "";

    const searchText =
        searchExpense
            ? String(
                searchExpense.value || ""
            )
                .toLowerCase()
                .trim()
            : "";

    const selectedType =
        filterType
            ? String(
                filterType.value || "all"
            )
                .toLowerCase()
            : "all";

    const transactions = [];

    // ==================================================
    // EXPENSES
    // ==================================================

    expenses.forEach(item => {

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
                Number(item.amount) || 0,

            category:
                item.category ||
                "Others",

            date:
                normalizeDate(
                    item.date
                )
        });
    });

    // ==================================================
    // INCOME
    // ==================================================

    allIncome.forEach(item => {

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
                Number(item.amount) || 0,

            category:
                "Income",

            date:
                normalizeDate(
                    item.date
                )
        });
    });

    // ==================================================
    // SORT
    // ==================================================

    transactions.sort(
        (a, b) => {

            return (
                new Date(
                    b.date || 0
                ) -
                new Date(
                    a.date || 0
                )
            );
        }
    );

    let visibleCount = 0;

    // ==================================================
    // DISPLAY
    // ==================================================

    transactions.forEach(
        transaction => {

            const searchMatch =

                String(
                    transaction.name
                )
                    .toLowerCase()
                    .includes(
                        searchText
                    )

                ||

                String(
                    transaction.category
                )
                    .toLowerCase()
                    .includes(
                        searchText
                    );

            const typeMatch =

                selectedType === "all" ||
                transaction.type ===
                    selectedType;

            if (
                !searchMatch ||
                !typeMatch
            ) {

                return;
            }

            visibleCount++;

            const row =
                document.createElement(
                    "tr"
                );

            const amountDisplay =

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

            let buttons = "";

            if (
                transaction.type ===
                "expense"
            ) {

                buttons = `

                    <button
                        class="edit-btn"
                        onclick="editExpenseById(${Number(transaction.id)})">
                        Edit
                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteExpenseById(${Number(transaction.id)})">
                        Delete
                    </button>

                `;

            } else {

                buttons = `

                    <button
                        class="edit-btn"
                        onclick="editIncomeById(${Number(transaction.id)})">
                        Edit
                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteIncomeById(${Number(transaction.id)})">
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
                    ${amountDisplay}
                </td>

                <td>
                    ${escapeHTML(
                        transaction.category
                    )}
                </td>

                <td>
                    ${transaction.date || "-"}
                </td>

                <td>
                    ${buttons}
                </td>

            `;

            expenseList.appendChild(
                row
            );
        }
    );

    if (visibleCount === 0) {

        const row =
            document.createElement(
                "tr"
            );

        row.innerHTML = `

            <td
                colspan="6"
                style="text-align:center;padding:25px;"
            >
                No transactions found.
            </td>

        `;

        expenseList.appendChild(
            row
        );
    }
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
// ================= SEARCH ===============================
// ======================================================

if (searchExpense) {

    searchExpense.addEventListener(
        "input",
        displayTransactions
    );
}

// ======================================================
// ================= FILTER ===============================
// ======================================================

if (filterType) {

    filterType.addEventListener(
        "change",
        displayTransactions
    );
}

// ======================================================
// ================= EDIT EXPENSE =========================
// ======================================================

function editExpenseById(id) {

    const item =
        expenses.find(
            expense =>
                Number(expense.id) ===
                Number(id)
        );

    if (!item) {

        alert(
            "Expense not found."
        );

        return;
    }

    if (editIndex)
        editIndex.value =
            item.id;

    if (editName)
        editName.value =
            item.name || "";

    if (editAmount)
        editAmount.value =
            item.amount || "";

    if (editCategory)
        editCategory.value =
            item.category || "";

    if (editDate)
        editDate.value =
            normalizeDate(
                item.date
            );

    if (editPopup)
        editPopup.style.display =
            "block";
}

window.editExpenseById =
    editExpenseById;

// ======================================================
// ================= CLOSE EXPENSE EDIT =================
// ======================================================

if (closeEditBtn) {

    closeEditBtn.addEventListener(
        "click",
        () => {

            if (editPopup) {

                editPopup.style.display =
                    "none";
            }
        }
    );
}

// ======================================================
// ================= UPDATE EXPENSE ======================
// ======================================================

if (updateExpenseBtn) {

    updateExpenseBtn.addEventListener(
        "click",
        async () => {

            const id =
                editIndex
                    ? editIndex.value
                    : "";

            const name =
                editName
                    ? editName.value.trim()
                    : "";

            const amount =
                editAmount
                    ? Number(
                        editAmount.value
                    )
                    : 0;

            const category =
                editCategory
                    ? editCategory.value.trim()
                    : "";

            const date =
                editDate
                    ? editDate.value
                    : "";

            if (
                !id ||
                !name ||
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

                const data =
                    await apiRequest(
                        "/expenses/" + id,
                        {
                            method: "PUT",

                            body:
                                JSON.stringify({

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

                if (data.success) {

                    alert(
                        "Expense Updated Successfully ✅"
                    );

                    if (editPopup)
                        editPopup.style.display =
                            "none";

                    await refreshDashboard();

                } else {

                    alert(
                        data.message ||
                        "Expense update failed."
                    );
                }

            } catch (error) {

                alert(
                    "Update failed: " +
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
            expense =>
                Number(expense.id) ===
                Number(id)
        );

    if (!item) {

        alert(
            "Expense not found."
        );

        return;
    }

    const confirmed =
        confirm(
            "Are you sure you want to delete this expense?\n\n" +
            (item.name || "Expense") +
            " - " +
            formatCurrency(item.amount)
        );

    if (!confirmed) return;

    try {

        const data =
            await apiRequest(
                "/expenses/" + id,
                {
                    method: "DELETE"
                }
            );

        if (data.success) {

            alert(
                "Expense deleted successfully 🗑️"
            );

            await refreshDashboard();

        } else {

            alert(
                data.message ||
                "Expense delete failed."
            );
        }

    } catch (error) {

        alert(
            "Delete failed: " +
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
            income =>
                Number(income.id) ===
                Number(id)
        );

    if (!item) {

        alert(
            "Income not found."
        );

        return;
    }

    if (editIncomeId)
        editIncomeId.value =
            item.id;

    if (editIncomeSource)
        editIncomeSource.value =
            item.name ||
            item.source ||
            "Income";

    if (editIncomeAmount)
        editIncomeAmount.value =
            item.amount || "";

    if (editIncomeDate)
        editIncomeDate.value =
            normalizeDate(
                item.date
            );

    if (editIncomePopup)
        editIncomePopup.style.display =
            "block";
}

window.editIncomeById =
    editIncomeById;

// ======================================================
// ================= CLOSE INCOME EDIT ==================
// ======================================================

if (closeIncomeEditBtn) {

    closeIncomeEditBtn.addEventListener(
        "click",
        () => {

            if (editIncomePopup) {

                editIncomePopup.style.display =
                    "none";
            }
        }
    );
}

// ======================================================
// ================= UPDATE INCOME =======================
// ======================================================

if (updateIncomeBtn) {

    updateIncomeBtn.addEventListener(
        "click",
        async () => {

            const id =
                editIncomeId
                    ? editIncomeId.value
                    : "";

            const amount =
                editIncomeAmount
                    ? Number(
                        editIncomeAmount.value
                    )
                    : 0;

            const date =
                editIncomeDate
                    ? editIncomeDate.value
                    : "";

            if (
                !id ||
                amount <= 0 ||
                !date
            ) {

                alert(
                    "Please fill all income fields correctly."
                );

                return;
            }

            try {

                const data =
                    await apiRequest(
                        "/income/" + id,
                        {
                            method: "PUT",

                            body:
                                JSON.stringify({

                                    amount:
                                        amount,

                                    date:
                                        date
                                })
                        }
                    );

                if (data.success) {

                    alert(
                        "Income Updated Successfully ✅"
                    );

                    if (editIncomePopup)
                        editIncomePopup.style.display =
                            "none";

                    await refreshDashboard();

                } else {

                    alert(
                        data.message ||
                        "Income update failed."
                    );
                }

            } catch (error) {

                alert(
                    "Income update failed: " +
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
            income =>
                Number(income.id) ===
                Number(id)
        );

    if (!item) {

        alert(
            "Income not found."
        );

        return;
    }

    const confirmed =
        confirm(
            "Are you sure you want to delete this income?\n\n" +
            formatCurrency(item.amount)
        );

    if (!confirmed) return;

    try {

        const data =
            await apiRequest(
                "/income/" + id,
                {
                    method: "DELETE"
                }
            );

        if (data.success) {

            alert(
                "Income deleted successfully 🗑️"
            );

            await refreshDashboard();

        } else {

            alert(
                data.message ||
                "Income delete failed."
            );
        }

    } catch (error) {

        alert(
            "Income delete failed: " +
            error.message
        );
    }
}

window.deleteIncomeById =
    deleteIncomeById;

// ======================================================
// ================= DATE NORMALIZER ====================
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
        Object.prototype.toString.call(value) ===
        "[object Date]"
    ) {

        if (isNaN(value.getTime())) {
            return "";
        }

        return formatDateObject(value);
    }

    const stringValue =
        String(value).trim();

    // YYYY-MM-DD
    if (
        /^\d{4}-\d{2}-\d{2}$/.test(
            stringValue
        )
    ) {

        return stringValue;
    }

    // DD/MM/YYYY or DD-MM-YYYY
    let match =
        stringValue.match(
            /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/
        );

    if (match) {

        const day =
            match[1].padStart(2, "0");

        const month =
            match[2].padStart(2, "0");

        const year =
            match[3];

        return (
            year +
            "-" +
            month +
            "-" +
            day
        );
    }

    // MM/DD/YYYY
    match =
        stringValue.match(
            /^(\d{1,2})[\/](\d{1,2})[\/](\d{4})$/
        );

    if (match) {

        const first =
            Number(match[1]);

        const second =
            Number(match[2]);

        const year =
            match[3];

        if (
            first <= 12 &&
            second <= 31
        ) {

            return (
                year +
                "-" +
                String(first).padStart(2, "0") +
                "-" +
                String(second).padStart(2, "0")
            );
        }
    }

    // ISO / datetime
    const parsed =
        new Date(stringValue);

    if (!isNaN(parsed.getTime())) {

        return formatDateObject(parsed);
    }

    return "";
}

// ======================================================
// ================= DATE OBJECT FORMAT =================
// ======================================================

function formatDateObject(date) {

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return (
        year +
        "-" +
        month +
        "-" +
        day
    );
}

// ======================================================
// ================= EXCEL DATE ==========================
// ======================================================

function excelSerialToDate(serial) {

    try {

        const number =
            Number(serial);

        if (
            !Number.isFinite(number) ||
            number <= 0
        ) {

            return "";
        }

        // Excel date epoch
        const excelEpoch =
            new Date(
                Date.UTC(
                    1899,
                    11,
                    30
                )
            );

        const date =
            new Date(
                excelEpoch.getTime() +
                number *
                24 *
                60 *
                60 *
                1000
            );

        if (
            isNaN(date.getTime())
        ) {

            return "";
        }

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

    } catch {

        return "";
    }
}

// ======================================================
// ================= EXCEL VALUE HELPER =================
// ======================================================

function getExcelValue(row, possibleNames) {

    if (!row || typeof row !== "object") {
        return "";
    }

    const keys =
        Object.keys(row);

    for (
        const wanted of possibleNames
    ) {

        const wantedClean =
            String(wanted)
                .trim()
                .toLowerCase()
                .replace(
                    /[^a-z0-9]/g,
                    ""
                );

        for (
            const actualKey of keys
        ) {

            const actualClean =
                String(actualKey)
                    .trim()
                    .toLowerCase()
                    .replace(
                        /[^a-z0-9]/g,
                        ""
                    );

            if (
                actualClean ===
                wantedClean
            ) {

                return row[actualKey];
            }
        }
    }

    return "";
}

// ======================================================
// ================= EXCEL DATE PARSER ==================
// ======================================================

function parseExcelDate(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return "";
    }

    // Excel number
    if (
        typeof value === "number"
    ) {

        return excelSerialToDate(
            value
        );
    }

    const stringValue =
        String(value).trim();

    // Numeric Excel serial
    if (
        /^\d+(\.\d+)?$/.test(
            stringValue
        )
    ) {

        const numberValue =
            Number(stringValue);

        if (
            numberValue > 1 &&
            numberValue < 100000
        ) {

            const result =
                excelSerialToDate(
                    numberValue
                );

            if (result) {
                return result;
            }
        }
    }

    return normalizeDate(
        stringValue
    );
}

// ======================================================
// ================= EXCEL IMPORT BUTTON ================
// ======================================================

if (
    importExpenseBtn &&
    expenseFileInput
) {

    importExpenseBtn.addEventListener(
        "click",
        () => {

            expenseFileInput.click();
        }
    );
}

// ======================================================
// ================= PROCESS EXCEL =======================
// ======================================================

if (expenseFileInput) {

    expenseFileInput.addEventListener(
        "change",
        async function () {

            const file =
                this.files &&
                this.files[0];

            if (!file) return;

            let importedCount = 0;
            let skippedCount = 0;

            try {

                // ==================================================
                // CHECK XLSX
                // ==================================================

                if (
                    typeof XLSX ===
                    "undefined"
                ) {

                    alert(
                        "Excel library not loaded.\n\nPlease check XLSX script in dashboard.html."
                    );

                    return;
                }

                // ==================================================
                // READ FILE
                // ==================================================

                console.log(
                    "Reading Excel:",
                    file.name
                );

                const buffer =
                    await file.arrayBuffer();

                const workbook =
                    XLSX.read(
                        buffer,
                        {
                            type: "array",
                            cellDates: false
                        }
                    );

                if (
                    !workbook.SheetNames ||
                    workbook.SheetNames.length === 0
                ) {

                    alert(
                        "No worksheet found."
                    );

                    return;
                }

                const sheetName =
                    workbook.SheetNames[0];

                const worksheet =
                    workbook.Sheets[
                        sheetName
                    ];

                // IMPORTANT:
                // header: 1 first read raw rows
                const rawRows =
                    XLSX.utils.sheet_to_json(
                        worksheet,
                        {
                            header: 1,
                            defval: "",
                            raw: true
                        }
                    );

                console.log(
                    "Raw Excel Rows:",
                    rawRows
                );

                if (
                    rawRows.length < 2
                ) {

                    alert(
                        "No data found in Excel file."
                    );

                    return;
                }

                // ==================================================
                // CREATE NORMALIZED OBJECTS
                // ==================================================

                const headers =
                    rawRows[0].map(
                        header =>
                            String(
                                header
                            ).trim()
                    );

                console.log(
                    "Excel Headers:",
                    headers
                );

                const rows =
                    rawRows
                        .slice(1)
                        .map(
                            rowArray => {

                                const obj = {};

                                headers.forEach(
                                    (
                                        header,
                                        index
                                    ) => {

                                        obj[
                                            header
                                        ] =
                                            rowArray[
                                                index
                                            ] ?? "";
                                    }
                                );

                                return obj;
                            }
                        )
                        .filter(
                            row =>
                                Object.values(
                                    row
                                ).some(
                                    value =>
                                        String(
                                            value
                                        ).trim() !== ""
                                )
                        );

                console.log(
                    "Normalized Excel Rows:",
                    rows
                );

                if (
                    rows.length === 0
                ) {

                    alert(
                        "No valid data rows found."
                    );

                    return;
                }

                // ==================================================
                // USER EMAIL
                // ==================================================

                const email =
                    localStorage.getItem(
                        "userEmail"
                    );

                if (!email) {

                    alert(
                        "User email not found. Please login again."
                    );

                    return;
                }

                // ==================================================
                // PROCESS ROWS
                // ==================================================

                for (
                    let i = 0;
                    i < rows.length;
                    i++
                ) {

                    const row =
                        rows[i];

                    console.log(
                        `Processing Excel Row ${i + 1}:`,
                        row
                    );

                    try {

                        // ==========================================
                        // NAME
                        // ==========================================

                        const rawName =
                            getExcelValue(
                                row,
                                [
                                    "Name",
                                    "Expense",
                                    "Expense Name",
                                    "ExpenseName",
                                    "Description",
                                    "Title",
                                    "Item",
                                    "Particulars"
                                ]
                            );

                        // ==========================================
                        // AMOUNT
                        // ==========================================

                        const rawAmount =
                            getExcelValue(
                                row,
                                [
                                    "Amount",
                                    "Expense Amount",
                                    "ExpenseAmount",
                                    "Value",
                                    "Price",
                                    "Cost"
                                ]
                            );

                        // ==========================================
                        // CATEGORY
                        // ==========================================

                        const rawCategory =
                            getExcelValue(
                                row,
                                [
                                    "Category",
                                    "Type",
                                    "Expense Category"
                                ]
                            );

                        // ==========================================
                        // DATE
                        // ==========================================

                        const rawDate =
                            getExcelValue(
                                row,
                                [
                                    "Date",
                                    "Expense Date",
                                    "ExpenseDate",
                                    "Transaction Date",
                                    "TransactionDate"
                                ]
                            );

                        // ==========================================
                        // CLEAN NAME
                        // ==========================================

                        const name =
                            String(
                                rawName ?? ""
                            ).trim();

                        // ==========================================
                        // CLEAN AMOUNT
                        // ==========================================

                        let amountString =
                            String(
                                rawAmount ?? ""
                            ).trim();

                        amountString =
                            amountString
                                .replace(
                                    /₹/g,
                                    ""
                                )
                                .replace(
                                    /Rs\.?/gi,
                                    ""
                                )
                                .replace(
                                    /INR/gi,
                                    ""
                                )
                                .replace(
                                    /,/g,
                                    ""
                                )
                                .replace(
                                    /\s/g,
                                    ""
                                );

                        const amount =
                            Number(
                                amountString
                            );

                        // ==========================================
                        // CLEAN CATEGORY
                        // ==========================================

                        const category =
                            String(
                                rawCategory ?? ""
                            ).trim() ||
                            "Others";

                        // ==========================================
                        // CLEAN DATE
                        // ==========================================

                        const date =
                            parseExcelDate(
                                rawDate
                            );

                        // ==========================================
                        // DEBUG
                        // ==========================================

                        console.log(
                            `Excel Row ${i + 1} Parsed:`,
                            {
                                name,
                                amount,
                                category,
                                rawDate,
                                date
                            }
                        );

                        // ==========================================
                        // VALIDATION
                        // ==========================================

                        if (!name) {

                            console.warn(
                                `❌ Row ${i + 1} skipped: Name missing`,
                                row
                            );

                            skippedCount++;
                            continue;
                        }

                        if (
                            !Number.isFinite(
                                amount
                            ) ||
                            amount <= 0
                        ) {

                            console.warn(
                                `❌ Row ${i + 1} skipped: Invalid amount`,
                                {
                                    rawAmount,
                                    amount,
                                    row
                                }
                            );

                            skippedCount++;
                            continue;
                        }

                        if (!date) {

                            console.warn(
                                `❌ Row ${i + 1} skipped: Invalid date`,
                                {
                                    rawDate,
                                    row
                                }
                            );

                            skippedCount++;
                            continue;
                        }

                        // ==========================================
                        // SEND TO RAILWAY
                        // ==========================================

                        const result =
                            await apiRequest(
                                "/expenses",
                                {
                                    method: "POST",

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

                        console.log(
                            `Excel Row ${i + 1} Server Result:`,
                            result
                        );

                        // ==========================================
                        // SUCCESS
                        // ==========================================

                        if (
                            result &&
                            result.success === true
                        ) {

                            importedCount++;

                            console.log(
                                `✅ Excel Row ${i + 1} imported successfully`
                            );

                        } else {

                            skippedCount++;

                            console.error(
                                `❌ Excel Row ${i + 1} rejected by server:`,
                                result
                            );
                        }

                    } catch (rowError) {

                        skippedCount++;

                        console.error(
                            `❌ Excel Row ${i + 1} error:`,
                            rowError
                        );
                    }
                }

                // ==================================================
                // REFRESH
                // ==================================================

                await refreshDashboard();

                // ==================================================
                // SUMMARY
                // ==================================================

                const summary = {

                    totalRows:
                        rows.length,

                    imported:
                        importedCount,

                    skipped:
                        skippedCount
                };

                console.log(
                    "Excel Import Summary:",
                    summary
                );

                // ==================================================
                // RESULT
                // ==================================================

                if (
                    importedCount > 0
                ) {

                    alert(

                        "Excel Import Completed ✅\n\n" +

                        "Imported: " +
                        importedCount +
                        "\n" +

                        "Skipped: " +
                        skippedCount

                    );

                } else {

                    alert(

                        "Excel Import Failed ❌\n\n" +

                        "Imported: 0\n" +

                        "Skipped: " +
                        skippedCount +
                        "\n\n" +

                        "Required Excel columns:\n" +
                        "Name, Amount, Category, Date"

                    );
                }

            } catch (error) {

                console.error(
                    "Excel Import Error:",
                    error
                );

                alert(
                    "Unable to import Excel file.\n\n" +
                    error.message
                );

            } finally {

                this.value = "";
            }
        }
    );
}

// ======================================================
// ================= CURRENT MONTH TOTALS ===============
// ======================================================

function calculateTotals() {

    const now =
        new Date();

    const currentMonth =
        now.getMonth();

    const currentYear =
        now.getFullYear();

    let expenseTotal = 0;

    // ==================================================
    // EXPENSE TOTAL
    // ==================================================

    expenses.forEach(
        item => {

            const normalized =
                normalizeDate(
                    item.date
                );

            if (!normalized) return;

            const date =
                new Date(
                    normalized +
                    "T00:00:00"
                );

            if (
                !isNaN(
                    date.getTime()
                ) &&
                date.getMonth() ===
                    currentMonth &&
                date.getFullYear() ===
                    currentYear
            ) {

                expenseTotal +=
                    Number(
                        item.amount
                    ) || 0;
            }
        }
    );

    // ==================================================
    // INCOME TOTAL
    // ==================================================

    let incomeTotal = 0;

    allIncome.forEach(
        item => {

            const normalized =
                normalizeDate(
                    item.date
                );

            if (!normalized) return;

            const date =
                new Date(
                    normalized +
                    "T00:00:00"
                );

            if (
                !isNaN(
                    date.getTime()
                ) &&
                date.getMonth() ===
                    currentMonth &&
                date.getFullYear() ===
                    currentYear
            ) {

                incomeTotal +=
                    Number(
                        item.amount
                    ) || 0;
            }
        }
    );

    // ==================================================
    // BALANCE
    // ==================================================

    const balance =
        incomeTotal -
        expenseTotal;

    // ==================================================
    // UI
    // ==================================================

    if (totalExpense) {

        totalExpense.textContent =
            formatCurrency(
                expenseTotal
            );
    }

    if (totalIncome) {

        totalIncome.textContent =
            formatCurrency(
                incomeTotal
            );
    }

    if (totalBalance) {

        totalBalance.textContent =
            formatCurrency(
                balance
            );
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

// ======================================================
// ================= REFRESH DASHBOARD ==================
// ======================================================

async function refreshDashboard() {

    console.log(
        "Refreshing dashboard..."
    );

    await Promise.all([
        loadExpenses(),
        loadIncome()
    ]);

    displayTransactions();

    calculateTotals();

    console.log(
        "Dashboard refreshed successfully ✅"
    );
}

// ======================================================
// ================= INITIALIZE ==========================
// ======================================================

let dashboardInitialized =
    false;

async function initializeDashboard() {

    if (
        dashboardInitialized
    ) {

        return;
    }

    dashboardInitialized =
        true;

    try {

        console.log(
            "Loading dashboard data..."
        );

        await refreshDashboard();

        console.log(
            "Dashboard data loaded successfully ✅"
        );

    } catch (error) {

        console.error(
            "Dashboard Initialization Error:",
            error
        );
    }
}

// ======================================================
// ================= DOM READY ============================
// ======================================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeDashboard
    );

} else {

    initializeDashboard();
}

// ======================================================
// ================= GLOBAL FUNCTIONS ===================
// ======================================================

window.loadExpenses =
    loadExpenses;

window.loadIncome =
    loadIncome;

window.displayTransactions =
    displayTransactions;

window.calculateTotals =
    calculateTotals;

window.refreshDashboard =
    refreshDashboard;

window.editExpenseById =
    editExpenseById;

window.deleteExpenseById =
    deleteExpenseById;

window.editIncomeById =
    editIncomeById;

window.deleteIncomeById =
    deleteIncomeById;

window.formatCurrency =
    formatCurrency;

// ======================================================
// ================= READY ===============================
// ======================================================

console.log(
    "Dashboard JS Loaded Successfully ✅"
);

console.log(
    "Dashboard JS Ready 🚀"
);
```
