// ======================================================
// ================= DASHBOARD ===========================
// ======================================================


// ======================================================
// ================= LOGIN CHECK =========================
// ======================================================

if (!localStorage.getItem("userEmail")) {

    window.location.href = "index.html";

}


// ======================================================
// ================= API BASE ============================
// ======================================================

// Same Railway service + localhost compatible
const API_BASE = "";


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
// ================= EDIT EXPENSE ELEMENTS ==============
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
// ================= EDIT INCOME ELEMENTS ===============
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
// ================= CUSTOM CATEGORY =====================
// ======================================================

const expenseCategory =
    document.getElementById("expenseCategory");

const customCategory =
    document.getElementById("customCategory");


// ======================================================
// ================= IMPORT ELEMENTS ====================
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
// ================= SIDEBAR =============================
// ======================================================

if (menuBtn && sideMenu) {

    menuBtn.addEventListener("click", () => {

        sideMenu.classList.toggle("active");

    });

}


// ======================================================
// ================= THEME ===============================
// ======================================================

function loadSavedTheme() {

    const savedTheme =
        localStorage.getItem("theme");

    if (savedTheme === "light") {

        document.body.classList.add("light-mode");

    } else {

        document.body.classList.remove("light-mode");

    }

}


function updateThemeButton() {

    if (!themeBtn) {

        return;

    }

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

        return;

    }

    try {

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

        if (data.success) {

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

        return;

    }

    try {

        const response =
            await fetch(
                API_BASE +
                "/income/" +
                encodeURIComponent(email)
            );

        if (!response.ok) {

            throw new Error(
                "Income API Error: " +
                response.status
            );

        }

        const data =
            await response.json();

        if (data.success) {

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
                    ? incomeAmountInput.value
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
                    "Please fill all income fields"
                );

                return;

            }


            if (
                Number(amount) <= 0
            ) {

                alert(
                    "Please enter a valid income amount"
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

                // IMPORTANT:
                // server.js uses POST /income

                const response =
                    await fetch(
                        API_BASE +
                        "/income",
                        {

                            method:
                                "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    email:
                                        email,

                                    amount:
                                        Number(amount),

                                    date:
                                        date

                                })

                        }
                    );


                const data =
                    await response.json();


                console.log(
                    "Add Income Response:",
                    data
                );


                if (
                    data.success
                ) {

                    alert(
                        "Income Added Successfully ✅"
                    );


                    if (incomeNameInput) {

                        incomeNameInput.value =
                            "";

                    }

                    if (incomeAmountInput) {

                        incomeAmountInput.value =
                            "";

                    }

                    if (incomeDateInput) {

                        incomeDateInput.value =
                            "";

                    }


                    await loadIncome();

                    await loadExpenses();

                    displayTransactions();

                    calculateTotals();

                } else {

                    alert(
                        data.message ||
                        "Unable to add income"
                    );

                }

            } catch (error) {

                console.error(
                    "Add Income Error:",
                    error
                );

                alert(
                    "Server Error. Please try again."
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
                    ? amountInput.value
                    : "";


            let category =
                categorySelect
                    ? categorySelect.value
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
                        "Please enter custom category"
                    );

                    return;

                }

            }


            if (
                name === "" ||
                amount === "" ||
                date === ""
            ) {

                alert(
                    "Please fill all expense fields"
                );

                return;

            }


            if (
                Number(amount) <= 0
            ) {

                alert(
                    "Please enter a valid expense amount"
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

                // IMPORTANT:
                // server.js uses POST /expenses

                const response =
                    await fetch(
                        API_BASE +
                        "/expenses",
                        {

                            method:
                                "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    email:
                                        email,

                                    name:
                                        name,

                                    amount:
                                        Number(amount),

                                    category:
                                        category,

                                    date:
                                        date

                                })

                        }
                    );


                const data =
                    await response.json();


                console.log(
                    "Add Expense Response:",
                    data
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


                    if (customCategoryInput) {

                        customCategoryInput.value =
                            "";

                        customCategoryInput.style.display =
                            "none";

                    }


                    await loadExpenses();

                    await loadIncome();

                    displayTransactions();

                    calculateTotals();

                } else {

                    alert(
                        data.message ||
                        "Unable to add expense"
                    );

                }

            } catch (error) {

                console.error(
                    "Add Expense Error:",
                    error
                );

                alert(
                    "Server Error. Please try again."
                );

            }

        }
    );

}


// ======================================================
// ================= DISPLAY TRANSACTIONS ================
// ======================================================

function displayTransactions() {

    if (!expenseList) {

        return;

    }


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
            ? filterType.value.toLowerCase()
            : "all";


    let transactions = [];


    // ==================================================
    // EXPENSES
    // ==================================================

    expenses.forEach(
        item => {

            transactions.push({

                type:
                    "Expense",

                id:
                    item.id,

                name:
                    item.name,

                amount:
                    Number(
                        item.amount
                    ) || 0,

                category:
                    item.category ||
                    "Others",

                date:
                    item.date

            });

        }
    );


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

                    // Current database does not
                    // contain source column.

                    name:
                        "Income",

                    amount:
                        Number(
                            item.amount
                        ) || 0,

                    category:
                        "Income",

                    date:
                        item.date

                });

            }
        );

    }


    // ==================================================
    // SORT BY DATE
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
    // DISPLAY
    // ==================================================

    transactions.forEach(
        transaction => {

            const transactionType =
                transaction.type
                    .toLowerCase();


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

                selectedType ===
                    "all"

                ||

                transactionType ===
                    selectedType;


            if (
                !matchSearch ||
                !matchType
            ) {

                return;

            }


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
            // EXPENSE BUTTONS
            // ==================================================

            if (
                transaction.type ===
                "Expense"
            ) {

                actionButtons = `

                    <button
                        class="edit-btn"
                        onclick="editExpenseById(${transaction.id})">

                        Edit

                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteExpenseById(${transaction.id})">

                        Delete

                    </button>

                `;

            }


            // ==================================================
            // INCOME BUTTON
            // ==================================================

            if (
                transaction.type ===
                "Income"
            ) {

                actionButtons = `

                    <button
                        class="edit-btn"
                        onclick="editIncomeById(${transaction.id})">

                        Edit

                    </button>

                `;

            }


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${transaction.type}
                </td>

                <td>
                    ${transaction.name}
                </td>

                <td>
                    ${amountDisplay}
                </td>

                <td>
                    ${transaction.category}
                </td>

                <td>
                    ${transaction.date || "-"}
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

}


// ======================================================
// ================= SEARCH ==============================
// ======================================================

if (searchExpense) {

    searchExpense.addEventListener(
        "input",
        () => {

            displayTransactions();

        }
    );

}


// ======================================================
// ================= FILTER ==============================
// ======================================================

if (filterType) {

    filterType.addEventListener(
        "change",
        () => {

            displayTransactions();

        }
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
            "Expense not found"
        );

        return;

    }


    if (editIndex) {

        editIndex.value =
            expenseItem.id;

    }


    if (editName) {

        editName.value =
            expenseItem.name || "";

    }


    if (editAmount) {

        editAmount.value =
            expenseItem.amount || "";

    }


    if (editCategory) {

        editCategory.value =
            expenseItem.category || "";

    }


    if (editDate) {

        editDate.value =
            expenseItem.date || "";

    }


    if (editPopup) {

        editPopup.style.display =
            "block";

    }

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
                    "Please fill all expense fields correctly"
                );

                return;

            }


            try {

                // server.js:
                // PUT /expenses/:id

                const response =
                    await fetch(
                        API_BASE +
                        "/expenses/" +
                        id,
                        {

                            method:
                                "PUT",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

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


                const data =
                    await response.json();


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


                    await loadExpenses();

                    await loadIncome();

                    displayTransactions();

                    calculateTotals();

                } else {

                    alert(
                        data.message ||
                        "Expense Update Failed"
                    );

                }

            } catch (error) {

                console.error(
                    "Update Expense Error:",
                    error
                );

                alert(
                    "Server Error. Please try again."
                );

            }

        }
    );

}


// ======================================================
// ================= DELETE EXPENSE ======================
// ================= MOVE TO HISTORY =====================
// ======================================================

async function deleteExpenseById(id) {

    const expenseItem =
        expenses.find(
            item =>
                Number(item.id) === Number(id)
        );

    if (!expenseItem) {

        alert("Expense not found");

        return;

    }


    // ================= CONFIRM DELETE =================

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this expense?\n\n" +
            expenseItem.name +
            " - " +
            formatCurrency(
                Number(expenseItem.amount)
            ) +
            "\n\n" +
            "This record will be kept in Delete History for 60 days."
        );


    if (!confirmDelete) {

        return;

    }


    try {

        const response =
            await fetch(
                API_BASE +
                "/expenses/" +
                id,
                {
                    method: "DELETE",

                    headers: {
                        "Content-Type":
                            "application/json"
                    }
                }
            );


        const data =
            await response.json();


        console.log(
            "Delete Expense Response:",
            data
        );


        if (data.success) {

            alert(
                "Expense moved to Delete History 🗑️\n\n" +
                "You can restore it within 60 days."
            );


            // ================= RELOAD DATA =================

            await loadExpenses();

            await loadIncome();


            // ================= REFRESH DASHBOARD =================

            displayTransactions();

            calculateTotals();


        } else {

            alert(
                data.message ||
                "Expense Delete Failed"
            );

        }


    } catch (error) {

        console.error(
            "Delete Expense Error:",
            error
        );


        alert(
            "Server Error. Please try again."
        );

    }

}


// ================= MAKE FUNCTION GLOBAL =================

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
            "Income not found"
        );

        return;

    }


    if (editIncomeId) {

        editIncomeId.value =
            incomeItem.id;

    }


    // Current database has no source field.
    if (editIncomeSource) {

        editIncomeSource.value =
            "Income";

    }


    if (editIncomeAmount) {

        editIncomeAmount.value =
            incomeItem.amount || "";

    }


    if (editIncomeDate) {

        editIncomeDate.value =
            incomeItem.date || "";

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
                    "Please fill all income fields correctly"
                );

                return;

            }


            try {

                // server.js:
                // PUT /income/:id

                const response =
                    await fetch(
                        API_BASE +
                        "/income/" +
                        id,
                        {

                            method:
                                "PUT",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    amount:
                                        amount,

                                    date:
                                        date

                                })

                        }
                    );


                const data =
                    await response.json();


                if (
                    data.success
                ) {

                    alert(
                        "Income Updated Successfully ✅"
                    );


                    if (editIncomePopup) {

                        editIncomePopup.style.display =
                            "none";

                    }


                    await loadIncome();

                    await loadExpenses();

                    displayTransactions();

                    calculateTotals();

                } else {

                    alert(
                        data.message ||
                        "Income Update Failed"
                    );

                }

            } catch (error) {

                console.error(
                    "Income Update Error:",
                    error
                );

                alert(
                    "Server Error: " +
                    error.message
                );

            }

        }
    );

}


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
    // EXPENSE TOTAL
    // ==================================================

    const expenseTotal =
        expenses.reduce(
            (total, item) => {

                const itemDate =
                    new Date(
                        item.date
                    );


                if (
                    !isNaN(itemDate) &&
                    itemDate.getMonth() ===
                        currentMonth &&
                    itemDate.getFullYear() ===
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
    // INCOME TOTAL
    // ==================================================

    const incomeTotal =
        window.allIncome.reduce(
            (total, item) => {

                const itemDate =
                    new Date(
                        item.date
                    );


                if (
                    !isNaN(itemDate) &&
                    itemDate.getMonth() ===
                        currentMonth &&
                    itemDate.getFullYear() ===
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
    // UPDATE UI
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

function formatCurrency(amount) {

    const value =
        Number(amount) || 0;


    return "₹" +
        value.toLocaleString(
            "en-IN",
            {
                minimumFractionDigits:
                    2,

                maximumFractionDigits:
                    2
            }
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


if (expenseFileInput) {

    expenseFileInput.addEventListener(
        "change",
        async function () {

            const file =
                this.files[0];


            if (!file) {

                return;

            }


            try {

                if (
                    typeof XLSX ===
                    "undefined"
                ) {

                    alert(
                        "Excel library not loaded"
                    );

                    return;

                }


                const data =
                    await file.arrayBuffer();


                const workbook =
                    XLSX.read(
                        data,
                        {
                            type:
                                "array"
                        }
                    );


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


                if (
                    importedData.length ===
                    0
                ) {

                    alert(
                        "No data found in selected file."
                    );

                    return;

                }


                let importedCount =
                    0;


                const email =
                    localStorage.getItem(
                        "userEmail"
                    );


                for (
                    const row
                    of importedData
                ) {

                    const name =
                        row.Name ||
                        row.name ||
                        row.Expense ||
                        row.expense;


                    const amount =
                        Number(
                            row.Amount ||
                            row.amount
                        );


                    const category =
                        row.Category ||
                        row.category ||
                        "Others";


                    let date =
                        row.Date ||
                        row.date;


                    // Excel date conversion

                    if (
                        typeof date ===
                        "number"
                    ) {

                        const excelDate =
                            XLSX.SSF.parse_date_code(
                                date
                            );


                        if (excelDate) {

                            date =
                                `${excelDate.y}-${String(
                                    excelDate.m
                                ).padStart(
                                    2,
                                    "0"
                                )}-${String(
                                    excelDate.d
                                ).padStart(
                                    2,
                                    "0"
                                )}`;

                        }

                    }


                    if (
                        !name ||
                        amount <= 0 ||
                        !date
                    ) {

                        continue;

                    }


                    try {

                        // server.js:
                        // POST /expenses

                        const response =
                            await fetch(
                                API_BASE +
                                "/expenses",
                                {

                                    method:
                                        "POST",

                                    headers: {

                                        "Content-Type":
                                            "application/json"

                                    },

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
                                                String(
                                                    date
                                                )

                                        })

                                }
                            );


                        const result =
                            await response.json();


                        if (
                            result.success
                        ) {

                            importedCount++;

                        }

                    } catch (
                        rowError
                    ) {

                        console.error(
                            "Import Row Error:",
                            rowError
                        );

                    }

                }


                await loadExpenses();

                await loadIncome();

                displayTransactions();

                calculateTotals();


                alert(
                    importedCount +
                    " expense(s) imported successfully ✅"
                );


            } catch (error) {

                console.error(
                    "Import Error:",
                    error
                );

                alert(
                    "Unable to import the file."
                );

            }


            this.value =
                "";

        }
    );

}


// ======================================================
// ================= INITIAL LOAD ========================
// ======================================================

async function initializeDashboard() {

    try {

        console.log(
            "Loading dashboard data..."
        );


        await loadExpenses();

        await loadIncome();


        displayTransactions();

        calculateTotals();


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

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeDashboard();

    }
);