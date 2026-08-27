// ======================================================
// ================= EXPENSE TRACKER PRO =================
// ================= DASHBOARD JS ========================
// ======================================================

"use strict";

console.log("Dashboard JS Loaded Successfully ✅");

// ======================================================
// ================= LOGIN CHECK =========================
// ======================================================

const loggedInEmail =
    localStorage.getItem("userEmail");

if (!loggedInEmail) {

    window.location.href = "index.html";

}

// ======================================================
// ================= API BASE ============================
// ======================================================

// Railway Backend

const API_BASE =
    "https://expense-tracker-pro-production-b745.up.railway.app";

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
// ================= EXPENSE EDIT ========================
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
// ================= INCOME EDIT =========================
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
// ================= DATA ================================
// ======================================================

let expenses = [];

window.allIncome = [];

// ======================================================
// ================= API HELPER ==========================
// ======================================================

async function apiRequest(
    endpoint,
    options = {}
) {

    const url =
        API_BASE + endpoint;

    console.log(
        "API Request:",
        options.method || "GET",
        url
    );

    try {

        const response =
            await fetch(
                url,
                {
                    ...options,

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json",

                        ...(options.headers || {})

                    }

                }
            );

        const text =
            await response.text();

        let data = {};

        try {

            data =
                text
                    ? JSON.parse(text)
                    : {};

        } catch (jsonError) {

            console.error(
                "Invalid JSON response:",
                text
            );

            throw new Error(
                `Server returned invalid response (${response.status})`
            );

        }

        console.log(
            "API Response:",
            response.status,
            data
        );

        if (!response.ok) {

            throw new Error(
                data.message ||
                `Request failed (${response.status})`
            );

        }

        return data;

    } catch (error) {

        console.error(
            "API Request Error:",
            endpoint,
            error
        );

        throw error;

    }

}

// ======================================================
// ================= SIDEBAR =============================
// ======================================================

if (
    menuBtn &&
    sideMenu
) {

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
// ================= THEME ===============================
// ======================================================

function loadSavedTheme() {

    const savedTheme =
        localStorage.getItem("theme");

    if (
        savedTheme === "light"
    ) {

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
// ================= LOGOUT ==============================
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

        console.error(
            "User email not found"
        );

        expenses = [];

        return;

    }

    try {

        const data =
            await apiRequest(
                "/expenses/" +
                encodeURIComponent(email)
            );

        if (
            data.success
        ) {

            expenses =
                Array.isArray(
                    data.expenses
                )
                    ? data.expenses
                    : [];

            console.log(
                "Expenses Loaded:",
                expenses
            );

        } else {

            expenses = [];

            console.error(
                data.message ||
                "Unable to load expenses"
            );

        }

    } catch (error) {

        console.error(
            "Load Expenses Error:",
            error
        );

        expenses = [];

    }

}

// ======================================================
// ================= LOAD INCOME =========================
// ======================================================

async function loadIncome() {

    const email =
        localStorage.getItem(
            "userEmail"
        );

    if (!email) {

        window.allIncome = [];

        return;

    }

    try {

        const data =
            await apiRequest(
                "/income/" +
                encodeURIComponent(email)
            );

        if (
            data.success
        ) {

            window.allIncome =
                Array.isArray(
                    data.income
                )
                    ? data.income
                    : [];

            console.log(
                "Income Loaded:",
                window.allIncome
            );

        } else {

            window.allIncome = [];

            console.error(
                data.message ||
                "Unable to load income"
            );

        }

    } catch (error) {

        console.error(
            "Load Income Error:",
            error
        );

        window.allIncome = [];

    }

}

// ======================================================
// ================= ADD INCOME ==========================
// ======================================================

if (addIncomeBtn) {

    addIncomeBtn.addEventListener(
        "click",
        async () => {

            const incomeNameInput =
                document.getElementById(
                    "incomeName"
                );

            const incomeAmountInput =
                document.getElementById(
                    "incomeAmount"
                );

            const incomeDateInput =
                document.getElementById(
                    "incomeDate"
                );

            const source =
                incomeNameInput
                    ? incomeNameInput.value.trim()
                    : "";

            const amount =
                incomeAmountInput
                    ? incomeAmountInput.value.trim()
                    : "";

            const date =
                incomeDateInput
                    ? incomeDateInput.value
                    : "";

            if (
                source === "" ||
                amount === "" ||
                date === ""
            ) {

                alert(
                    "Please fill all income fields."
                );

                return;

            }

            const numericAmount =
                Number(amount);

            if (
                !Number.isFinite(
                    numericAmount
                ) ||
                numericAmount <= 0
            ) {

                alert(
                    "Please enter a valid income amount."
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

                addIncomeBtn.disabled =
                    true;

                const data =
                    await apiRequest(
                        "/income",
                        {
                            method: "POST",

                            body:
                                JSON.stringify({

                                    email:
                                        email,

                                    amount:
                                        numericAmount,

                                    date:
                                        date

                                })

                        }
                    );

                if (
                    data.success
                ) {

                    alert(
                        "Income Added Successfully ✅"
                    );

                    if (
                        incomeNameInput
                    ) {

                        incomeNameInput.value =
                            "";

                    }

                    if (
                        incomeAmountInput
                    ) {

                        incomeAmountInput.value =
                            "";

                    }

                    if (
                        incomeDateInput
                    ) {

                        incomeDateInput.value =
                            "";

                    }

                    await refreshDashboard();

                } else {

                    alert(
                        data.message ||
                        "Unable to add income."
                    );

                }

            } catch (error) {

                console.error(
                    "Add Income Error:",
                    error
                );

                alert(
                    error.message ||
                    "Server Error. Please try again."
                );

            } finally {

                addIncomeBtn.disabled =
                    false;

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

            const categorySelect =
                document.getElementById(
                    "expenseCategory"
                );

            const customCategoryInput =
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
                    ? amountInput.value.trim()
                    : "";

            let category =
                categorySelect
                    ? categorySelect.value.trim()
                    : "";

            const date =
                dateInput
                    ? dateInput.value
                    : "";

            if (
                category === "Others"
            ) {

                category =
                    customCategoryInput
                        ? customCategoryInput.value.trim()
                        : "";

                if (
                    category === ""
                ) {

                    alert(
                        "Please enter custom category."
                    );

                    return;

                }

            }

            if (
                name === "" ||
                amount === "" ||
                category === "" ||
                date === ""
            ) {

                alert(
                    "Please fill all expense fields."
                );

                return;

            }

            const numericAmount =
                Number(amount);

            if (
                !Number.isFinite(
                    numericAmount
                ) ||
                numericAmount <= 0
            ) {

                alert(
                    "Please enter a valid expense amount."
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

                addExpenseBtn.disabled =
                    true;

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
                                        numericAmount,

                                    category:
                                        category,

                                    date:
                                        date

                                })

                        }
                    );

                if (
                    data.success
                ) {

                    alert(
                        "Expense Added Successfully ✅"
                    );

                    if (nameInput) {

                        nameInput.value =
                            "";

                    }

                    if (amountInput) {

                        amountInput.value =
                            "";

                    }

                    if (dateInput) {

                        dateInput.value =
                            "";

                    }

                    if (
                        customCategoryInput
                    ) {

                        customCategoryInput.value =
                            "";

                        customCategoryInput.style.display =
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

                console.error(
                    "Add Expense Error:",
                    error
                );

                alert(
                    error.message ||
                    "Server Error. Please try again."
                );

            } finally {

                addExpenseBtn.disabled =
                    false;

            }

        }
    );

}

// ======================================================
// ================= DISPLAY TRANSACTIONS ===============
// ======================================================

function displayTransactions() {

    if (!expenseList) return;

    expenseList.innerHTML =
        "";

    const searchText =
        searchExpense
            ? searchExpense.value
                .toLowerCase()
                .trim()
            : "";

    const selectedType =
        filterType
            ? filterType.value
                .toLowerCase()
            : "all";

    const transactions =
        [];

    // ==================================================
    // EXPENSES
    // ==================================================

    if (
        Array.isArray(expenses)
    ) {

        expenses.forEach(
            item => {

                transactions.push({

                    type:
                        "Expense",

                    id:
                        item.id,

                    name:
                        item.name ||
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

    }

    // ==================================================
    // INCOME
    // ==================================================

    if (
        Array.isArray(
            window.allIncome
        )
    ) {

        window.allIncome.forEach(
            item => {

                transactions.push({

                    type:
                        "Income",

                    id:
                        item.id,

                    name:
                        item.name ||
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

    }

    // ==================================================
    // SORT
    // ==================================================

    transactions.sort(
        (a, b) => {

            return (
                new Date(b.date) -
                new Date(a.date)
            );

        }
    );

    // ==================================================
    // EMPTY
    // ==================================================

    let visibleCount =
        0;

    // ==================================================
    // DISPLAY
    // ==================================================

    transactions.forEach(
        transaction => {

            const transactionType =
                transaction.type.toLowerCase();

            const matchSearch =

                String(
                    transaction.name ||
                    ""
                )
                    .toLowerCase()
                    .includes(
                        searchText
                    )

                ||

                String(
                    transaction.category ||
                    ""
                )
                    .toLowerCase()
                    .includes(
                        searchText
                    );

            const matchType =

                selectedType === "all"

                ||

                transactionType ===
                    selectedType;

            if (
                !matchSearch ||
                !matchType
            ) {

                return;

            }

            visibleCount++;

            let amountDisplay;

            if (
                transaction.type ===
                "Income"
            ) {

                amountDisplay =
                    "+" +
                    formatCurrency(
                        transaction.amount
                    );

            } else {

                amountDisplay =
                    "-" +
                    formatCurrency(
                        transaction.amount
                    );

            }

            let actionButtons =
                "";

            // ==================================================
            // EXPENSE ACTIONS
            // ==================================================

            if (
                transaction.type ===
                "Expense"
            ) {

                actionButtons = `

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

            }

            // ==================================================
            // INCOME ACTIONS
            // ==================================================

            if (
                transaction.type ===
                "Income"
            ) {

                actionButtons = `

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

            const row =
                document.createElement(
                    "tr"
                );

            row.innerHTML = `

                <td>
                    ${escapeHTML(
                        transaction.type
                    )}
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
                    ${escapeHTML(
                        transaction.date ||
                        "-"
                    )}
                </td>

                <td>
                    ${actionButtons}
                </td>

            `;

            expenseList.appendChild(
                row
            );

        }
    );

    // ==================================================
    // EMPTY MESSAGE
    // ==================================================

    if (
        visibleCount === 0
    ) {

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

if (filterType) {

    filterType.addEventListener(
        "change",
        displayTransactions
    );

}

// ======================================================
// ================= EDIT EXPENSE ========================
// ======================================================

function editExpenseById(id) {

    const expenseItem =
        expenses.find(
            item =>
                Number(item.id) ===
                Number(id)
        );

    if (!expenseItem) {

        alert(
            "Expense not found."
        );

        return;

    }

    if (editIndex) {

        editIndex.value =
            expenseItem.id;

    }

    if (editName) {

        editName.value =
            expenseItem.name ||
            "";

    }

    if (editAmount) {

        editAmount.value =
            expenseItem.amount ||
            "";

    }

    if (editCategory) {

        editCategory.value =
            expenseItem.category ||
            "";

    }

    if (editDate) {

        editDate.value =
            normalizeDate(
                expenseItem.date
            );

    }

    if (editPopup) {

        editPopup.style.display =
            "block";

    }

}

window.editExpenseById =
    editExpenseById;

// ======================================================
// ================= CLOSE EDIT ==========================
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
                    "Please fill all expense fields correctly."
                );

                return;

            }

            try {

                updateExpenseBtn.disabled =
                    true;

                const data =
                    await apiRequest(
                        "/expenses/" +
                        encodeURIComponent(id),
                        {

                            method:
                                "PUT",

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

                if (
                    data.success
                ) {

                    alert(
                        "Expense Updated Successfully ✅"
                    );

                    if (editPopup) {

                        editPopup.style.display =
                            "none";

                    }

                    await refreshDashboard();

                } else {

                    alert(
                        data.message ||
                        "Expense Update Failed."
                    );

                }

            } catch (error) {

                console.error(
                    "Update Expense Error:",
                    error
                );

                alert(
                    error.message ||
                    "Server Error."
                );

            } finally {

                updateExpenseBtn.disabled =
                    false;

            }

        }
    );

}

// ======================================================
// ================= DELETE EXPENSE ======================
// ======================================================

async function deleteExpenseById(id) {

    const expenseItem =
        expenses.find(
            item =>
                Number(item.id) ===
                Number(id)
        );

    if (!expenseItem) {

        alert(
            "Expense not found."
        );

        return;

    }

    const confirmDelete =
        confirm(

            "Are you sure you want to delete this expense?\n\n" +

            (
                expenseItem.name ||
                "Expense"
            ) +

            " - " +

            formatCurrency(
                Number(
                    expenseItem.amount
                )
            ) +

            "\n\nThis record will be kept in Delete History for 60 days."

        );

    if (!confirmDelete) {

        return;

    }

    try {

        const data =
            await apiRequest(
                "/expenses/" +
                encodeURIComponent(id),
                {
                    method:
                        "DELETE"
                }
            );

        if (
            data.success
        ) {

            alert(
                "Expense moved to Delete History 🗑️"
            );

            await refreshDashboard();

        } else {

            alert(
                data.message ||
                "Expense Delete Failed."
            );

        }

    } catch (error) {

        console.error(
            "Delete Expense Error:",
            error
        );

        alert(
            error.message ||
            "Server Error."
        );

    }

}

window.deleteExpenseById =
    deleteExpenseById;

// ======================================================
// ================= EDIT INCOME =========================
// ======================================================

function editIncomeById(id) {

    const incomeItem =
        window.allIncome.find(
            item =>
                Number(item.id) ===
                Number(id)
        );

    if (!incomeItem) {

        alert(
            "Income not found."
        );

        return;

    }

    if (editIncomeId) {

        editIncomeId.value =
            incomeItem.id;

    }

    if (editIncomeSource) {

        editIncomeSource.value =
            incomeItem.name ||
            "Income";

    }

    if (editIncomeAmount) {

        editIncomeAmount.value =
            incomeItem.amount ||
            "";

    }

    if (editIncomeDate) {

        editIncomeDate.value =
            normalizeDate(
                incomeItem.date
            );

    }

    if (editIncomePopup) {

        editIncomePopup.style.display =
            "block";

    }

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

            if (
                editIncomePopup
            ) {

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

                updateIncomeBtn.disabled =
                    true;

                const data =
                    await apiRequest(
                        "/income/" +
                        encodeURIComponent(id),
                        {

                            method:
                                "PUT",

                            body:
                                JSON.stringify({

                                    amount:
                                        amount,

                                    date:
                                        date

                                })

                        }
                    );

                if (
                    data.success
                ) {

                    alert(
                        "Income Updated Successfully ✅"
                    );

                    if (
                        editIncomePopup
                    ) {

                        editIncomePopup.style.display =
                            "none";

                    }

                    await refreshDashboard();

                } else {

                    alert(
                        data.message ||
                        "Income Update Failed."
                    );

                }

            } catch (error) {

                console.error(
                    "Update Income Error:",
                    error
                );

                alert(
                    error.message ||
                    "Server Error."
                );

            } finally {

                updateIncomeBtn.disabled =
                    false;

            }

        }
    );

}

// ======================================================
// ================= DELETE INCOME =======================
// ======================================================

async function deleteIncomeById(id) {

    const incomeItem =
        window.allIncome.find(
            item =>
                Number(item.id) ===
                Number(id)
        );

    if (!incomeItem) {

        alert(
            "Income not found."
        );

        return;

    }

    const confirmDelete =
        confirm(

            "Are you sure you want to delete this income?\n\n" +

            formatCurrency(
                Number(
                    incomeItem.amount
                )
            )

        );

    if (!confirmDelete) {

        return;

    }

    try {

        const data =
            await apiRequest(
                "/income/" +
                encodeURIComponent(id),
                {

                    method:
                        "DELETE"

                }
            );

        if (
            data.success
        ) {

            alert(
                "Income deleted successfully 🗑️"
            );

            await refreshDashboard();

        } else {

            alert(
                data.message ||
                "Income Delete Failed."
            );

        }

    } catch (error) {

        console.error(
            "Delete Income Error:",
            error
        );

        alert(
            error.message ||
            "Server Error."
        );

    }

}

window.deleteIncomeById =
    deleteIncomeById;

// ======================================================
// ================= CURRENT MONTH TOTALS ===============
// ======================================================

function calculateTotals() {

    const today =
        new Date();

    const currentMonth =
        today.getMonth();

    const currentYear =
        today.getFullYear();

    // ==================================================
    // EXPENSE
    // ==================================================

    const expenseTotal =
        expenses.reduce(
            (
                total,
                item
            ) => {

                const date =
                    parseDate(
                        item.date
                    );

                if (
                    date &&
                    date.getMonth() ===
                        currentMonth &&
                    date.getFullYear() ===
                        currentYear
                ) {

                    return (
                        total +
                        (
                            Number(
                                item.amount
                            ) || 0
                        )
                    );

                }

                return total;

            },
            0
        );

    // ==================================================
    // INCOME
    // ==================================================

    const incomeTotal =
        window.allIncome.reduce(
            (
                total,
                item
            ) => {

                const date =
                    parseDate(
                        item.date
                    );

                if (
                    date &&
                    date.getMonth() ===
                        currentMonth &&
                    date.getFullYear() ===
                        currentYear
                ) {

                    return (
                        total +
                        (
                            Number(
                                item.amount
                            ) || 0
                        )
                    );

                }

                return total;

            },
            0
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
// ================= FORMAT CURRENCY =====================
// ======================================================

function formatCurrency(
    amount
) {

    const value =
        Number(amount) || 0;

    return (
        "₹" +
        value.toLocaleString(
            "en-IN",
            {

                minimumFractionDigits:
                    2,

                maximumFractionDigits:
                    2

            }
        )
    );

}

window.formatCurrency =
    formatCurrency;

// ======================================================
// ================= EXCEL IMPORT ========================
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
// ================= EXCEL FILE CHANGE ==================
// ======================================================

if (expenseFileInput) {

    expenseFileInput.addEventListener(
        "change",
        async function () {

            const file =
                this.files[0];

            if (!file) {

                return;

            }

            let importedCount =
                0;

            let failedCount =
                0;

            try {

                // ==================================================
                // XLSX CHECK
                // ==================================================

                if (
                    typeof XLSX ===
                    "undefined"
                ) {

                    alert(
                        "Excel library not loaded. Please add SheetJS XLSX script."
                    );

                    return;

                }

                // ==================================================
                // EMAIL CHECK
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
                // READ FILE
                // ==================================================

                const arrayBuffer =
                    await file.arrayBuffer();

                const workbook =
                    XLSX.read(
                        arrayBuffer,
                        {
                            type:
                                "array"
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

                const sheetName =
                    workbook.SheetNames[0];

                const worksheet =
                    workbook.Sheets[
                        sheetName
                    ];

                const importedData =
                    XLSX.utils.sheet_to_json(
                        worksheet,
                        {
                            defval:
                                ""
                        }
                    );

                console.log(
                    "Excel Rows:",
                    importedData
                );

                if (
                    importedData.length ===
                    0
                ) {

                    alert(
                        "No data found in selected Excel file."
                    );

                    return;

                }

                // ==================================================
                // PROCESS ROWS
                // ==================================================

                for (
                    let index = 0;
                    index < importedData.length;
                    index++
                ) {

                    const row =
                        importedData[index];

                    console.log(
                        `Processing Excel Row ${index + 1}:`,
                        row
                    );

                    // ==================================================
                    // NAME
                    // ==================================================

                    const name =
                        getExcelValue(
                            row,
                            [
                                "Name",
                                "name",
                                "Expense",
                                "expense",
                                "Description",
                                "description"
                            ]
                        );

                    // ==================================================
                    // AMOUNT
                    // ==================================================

                    const rawAmount =
                        getExcelValue(
                            row,
                            [
                                "Amount",
                                "amount",
                                "Price",
                                "price"
                            ]
                        );

                    const amount =
                        Number(
                            String(
                                rawAmount
                            )
                                .replace(
                                    /,/g,
                                    ""
                                )
                                .replace(
                                    /₹/g,
                                    ""
                                )
                                .trim()
                        );

                    // ==================================================
                    // CATEGORY
                    // ==================================================

                    const category =
                        getExcelValue(
                            row,
                            [
                                "Category",
                                "category",
                                "Type",
                                "type"
                            ]
                        ) ||
                        "Others";

                    // ==================================================
                    // DATE
                    // ==================================================

                    let date =
                        getExcelValue(
                            row,
                            [
                                "Date",
                                "date"
                            ]
                        );

                    date =
                        convertExcelDate(
                            date
                        );

                    // ==================================================
                    // VALIDATION
                    // ==================================================

                    if (
                        !name ||
                        !Number.isFinite(
                            amount
                        ) ||
                        amount <= 0 ||
                        !date
                    ) {

                        failedCount++;

                        console.error(
                            `❌ Excel Row ${index + 1} skipped`,
                            {
                                name,
                                amount,
                                category,
                                date
                            }
                        );

                        continue;

                    }

                    // ==================================================
                    // SEND TO BACKEND
                    // ==================================================

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
                                                String(
                                                    name
                                                ),

                                            amount:
                                                amount,

                                            category:
                                                String(
                                                    category
                                                ),

                                            date:
                                                date

                                        })

                                }
                            );

                        console.log(
                            `Excel Row ${index + 1} Response:`,
                            result
                        );

                        if (
                            result.success
                        ) {

                            importedCount++;

                        } else {

                            failedCount++;

                            console.error(
                                `❌ Backend rejected row ${index + 1}:`,
                                result
                            );

                        }

                    } catch (rowError) {

                        failedCount++;

                        console.error(
                            `❌ Excel Row ${index + 1} Error:`,
                            rowError
                        );

                    }

                }

                // ==================================================
                // REFRESH
                // ==================================================

                await refreshDashboard();

                // ==================================================
                // RESULT
                // ==================================================

                alert(

                    "Excel Import Completed ✅\n\n" +

                    "Successfully imported: " +
                    importedCount +

                    "\nFailed/Skipped: " +
                    failedCount

                );

                console.log(
                    "Excel Import Summary:",
                    {

                        totalRows:
                            importedData.length,

                        imported:
                            importedCount,

                        failed:
                            failedCount

                    }
                );

            } catch (error) {

                console.error(
                    "Excel Import Error:",
                    error
                );

                alert(
                    error.message ||
                    "Unable to import Excel file."
                );

            } finally {

                this.value =
                    "";

            }

        }
    );

}

// ======================================================
// ================= EXCEL VALUE HELPER =================
// ======================================================

function getExcelValue(
    row,
    keys
) {

    for (
        const key of keys
    ) {

        if (
            Object.prototype.hasOwnProperty.call(
                row,
                key
            )
        ) {

            const value =
                row[key];

            if (
                value !==
                    undefined &&
                value !==
                    null &&
                String(value).trim() !==
                    ""
            ) {

                return value;

            }

        }

    }

    return "";

}

// ======================================================
// ================= EXCEL DATE ==========================
// ======================================================

function convertExcelDate(
    value
) {

    if (
        value ===
            undefined ||
        value ===
            null ||
        value ===
            ""
    ) {

        return "";

    }

    // ==================================================
    // EXCEL SERIAL NUMBER
    // ==================================================

    if (
        typeof value ===
        "number"
    ) {

        if (
            typeof XLSX !==
            "undefined" &&
            XLSX.SSF &&
            XLSX.SSF.parse_date_code
        ) {

            const parsed =
                XLSX.SSF.parse_date_code(
                    value
                );

            if (parsed) {

                return (

                    String(
                        parsed.y
                    ) +

                    "-" +

                    String(
                        parsed.m
                    ).padStart(
                        2,
                        "0"
                    ) +

                    "-" +

                    String(
                        parsed.d
                    ).padStart(
                        2,
                        "0"
                    )

                );

            }

        }

    }

    const stringValue =
        String(
            value
        ).trim();

    // ==================================================
    // YYYY-MM-DD
    // ==================================================

    if (
        /^\d{4}-\d{2}-\d{2}$/.test(
            stringValue
        )
    ) {

        return stringValue;

    }

    // ==================================================
    // DD/MM/YYYY
    // ==================================================

    let match =
        stringValue.match(
            /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
        );

    if (match) {

        return (

            match[3] +
            "-" +
            match[2].padStart(
                2,
                "0"
            ) +
            "-" +
            match[1].padStart(
                2,
                "0"
            )

        );

    }

    // ==================================================
    // DD-MM-YYYY
    // ==================================================

    match =
        stringValue.match(
            /^(\d{1,2})-(\d{1,2})-(\d{4})$/
        );

    if (match) {

        return (

            match[3] +
            "-" +
            match[2].padStart(
                2,
                "0"
            ) +
            "-" +
            match[1].padStart(
                2,
                "0"
            )

        );

    }

    // ==================================================
    // NORMAL DATE
    // ==================================================

    const parsedDate =
        new Date(
            stringValue
        );

    if (
        !isNaN(
            parsedDate.getTime()
        )
    ) {

        return (

            parsedDate
                .getFullYear() +

            "-" +

            String(
                parsedDate.getMonth() + 1
            ).padStart(
                2,
                "0"
            ) +

            "-" +

            String(
                parsedDate.getDate()
            ).padStart(
                2,
                "0"
            )

        );

    }

    return "";

}

// ======================================================
// ================= DATE PARSER =========================
// ======================================================

function parseDate(
    value
) {

    if (
        !value
    ) {

        return null;

    }

    const stringValue =
        String(
            value
        ).trim();

    // YYYY-MM-DD

    const match =
        stringValue.match(
            /^(\d{4})-(\d{2})-(\d{2})/
        );

    if (match) {

        const year =
            Number(
                match[1]
            );

        const month =
            Number(
                match[2]
            ) - 1;

        const day =
            Number(
                match[3]
            );

        const date =
            new Date(
                year,
                month,
                day
            );

        if (
            !isNaN(
                date.getTime()
            )
        ) {

            return date;

        }

    }

    const date =
        new Date(
            stringValue
        );

    if (
        isNaN(
            date.getTime()
        )
    ) {

        return null;

    }

    return date;

}

// ======================================================
// ================= NORMALIZE DATE ======================
// ======================================================

function normalizeDate(
    value
) {

    if (
        !value
    ) {

        return "";

    }

    const date =
        parseDate(
            value
        );

    if (
        !date
    ) {

        return String(
            value
        );

    }

    return (

        date.getFullYear() +
        "-" +
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        ) +
        "-" +
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        )

    );

}

// ======================================================
// ================= HTML SECURITY =======================
// ======================================================

function escapeHTML(
    value
) {

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

        console.log(
            "Dashboard already initialized."
        );

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
// ================= GLOBAL FUNCTIONS ====================
// ======================================================

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

window.calculateTotals =
    calculateTotals;

window.loadExpenses =
    loadExpenses;

window.loadIncome =
    loadIncome;

window.refreshDashboard =
    refreshDashboard;

// ======================================================
// ================= COMPLETE ============================
// ======================================================

console.log(
    "Dashboard JS Ready 🚀"
);