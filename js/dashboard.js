// ================= LOGIN CHECK =================

if (!localStorage.getItem("userEmail")) {
    window.location.href = "index.html";
}


// ================= LOGOUT =================

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener("click", () => {

        localStorage.removeItem("userEmail");

        window.location.href = "index.html";

    });

}


// ================= BUTTONS =================

const addExpenseBtn =
    document.getElementById("addExpenseBtn");

const addIncomeBtn =
    document.getElementById("addIncomeBtn");


// ================= CUSTOM CATEGORY =================

const expenseCategory =
    document.getElementById("expenseCategory");

const customCategory =
    document.getElementById("customCategory");


if (expenseCategory) {

    expenseCategory.addEventListener("change", function () {

        if (this.value === "Others") {

            customCategory.style.display = "block";

        } else {

            customCategory.style.display = "none";

            customCategory.value = "";

        }

    });

}


// ================= ELEMENTS =================

const expenseList =
    document.getElementById("expenseList");

const totalExpense =
    document.getElementById("totalExpense");

const totalIncome =
    document.getElementById("totalIncome");

const totalBalance =
    document.getElementById("totalBalance");


// ================= SEARCH & FILTER =================

const searchExpense =
    document.getElementById("searchExpense");

const filterType =
    document.getElementById("transactionFilter");


// ================= EDIT POPUP =================

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


// ================= DATA =================

let expenses = [];

let income = 0;

window.allIncome = [];


// ================= LOAD EXPENSES FROM MYSQL =================

async function loadExpenses() {

    const email =
        localStorage.getItem("userEmail");

    try {

        const response = await fetch(
            "http://localhost:5000/expenses/" + email
        );

        const data =
            await response.json();

        if (data.success) {

            expenses = data.expenses || [];

            console.log(
                "Expense Data:",
                expenses
            );

        }

    } catch (error) {

        console.log(error);

        alert("Unable to load expenses");

    }

}


// ================= LOAD INCOME FROM MYSQL =================

async function loadIncome() {

    const email =
        localStorage.getItem("userEmail");

    try {

        const response = await fetch(
            "http://localhost:5000/income/" + email
        );

        const data =
            await response.json();

        if (data.success) {

            window.allIncome =
                data.income || [];

            console.log(
                "Income Data:",
                window.allIncome
            );

        }

    } catch (error) {

        console.log(error);

    }

}
// ================= ADD INCOME =================

if (addIncomeBtn) {

    addIncomeBtn.addEventListener("click", async () => {

        const incomeSource =
            document.getElementById("incomeName").value.trim();

        const amount =
            document.getElementById("incomeAmount").value;

        const incomeDate =
            document.getElementById("incomeDate").value;


        // ================= VALIDATION =================

        if (
            incomeSource === "" ||
            amount === "" ||
            incomeDate === ""
        ) {

            alert("Please fill all income fields");

            return;

        }


        if (Number(amount) <= 0) {

            alert("Please enter a valid income amount");

            return;

        }


        try {

            const response = await fetch(
                "http://localhost:5000/add-income",
                {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        email:
                            localStorage.getItem("userEmail"),

                        source:
                            incomeSource,

                        amount:
                            Number(amount),

                        date:
                            incomeDate

                    })

                }
            );


            const data =
                await response.json();


            if (data.success) {

                alert(
                    "Income Added Successfully ✅"
                );


                // ================= CLEAR INPUTS =================

                document.getElementById(
                    "incomeName"
                ).value = "";

                document.getElementById(
                    "incomeAmount"
                ).value = "";

                document.getElementById(
                    "incomeDate"
                ).value = "";


                // ================= RELOAD DATA =================

                await loadIncome();

                await loadExpenses();

                displayExpenses();

                calculateTotals();


            } else {

                alert(
                    data.message ||
                    "Unable to add income"
                );

            }

        } catch (error) {

            console.error(error);

            alert("Server Error");

        }

    });

}
// ================= ADD EXPENSE =================

if (addExpenseBtn) {

    addExpenseBtn.addEventListener("click", async () => {

        const name =
            document.getElementById("expenseName").value.trim();

        const amount =
            document.getElementById("expenseAmount").value;

        const categorySelect =
            document.getElementById("expenseCategory");

        const customCategoryInput =
            document.getElementById("customCategory");

        let category =
            categorySelect.value;


        // ================= CUSTOM CATEGORY =================

        if (category === "Others") {

            category =
                customCategoryInput.value.trim();

            if (category === "") {

                alert("Please enter custom category");

                return;

            }

        }


        const date =
            document.getElementById("expenseDate").value;


        // ================= VALIDATION =================

        if (
            name === "" ||
            amount === "" ||
            date === ""
        ) {

            alert("Please fill all expense fields");

            return;

        }


        if (Number(amount) <= 0) {

            alert("Please enter a valid expense amount");

            return;

        }


        // ================= EXPENSE OBJECT =================

        const expense = {

            name: name,

            amount: Number(amount),

            category: category,

            date: date

        };


        try {

            const response = await fetch(
                "http://localhost:5000/add-expense",
                {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        email:
                            localStorage.getItem("userEmail"),

                        name:
                            expense.name,

                        amount:
                            expense.amount,

                        category:
                            expense.category,

                        date:
                            expense.date

                    })

                }
            );


            const data =
                await response.json();


            if (data.success) {

                alert(
                    "Expense Added Successfully ✅"
                );


                // ================= CLEAR INPUTS =================

                document.getElementById(
                    "expenseName"
                ).value = "";

                document.getElementById(
                    "expenseAmount"
                ).value = "";

                document.getElementById(
                    "expenseDate"
                ).value = "";


                if (customCategoryInput) {

                    customCategoryInput.value = "";

                    customCategoryInput.style.display =
                        "none";

                }


                if (categorySelect) {

                    categorySelect.value = "Food";

                }


                // ================= RELOAD DATA =================

                await loadExpenses();

                await loadIncome();

                displayExpenses();

                calculateTotals();


            } else {

                alert(
                    data.message ||
                    "Unable to add expense"
                );

            }

        } catch (error) {

            console.error(error);

            alert("Server Error");

        }

    });

}
// ================= DISPLAY TRANSACTIONS =================

function displayExpenses() {

    if (!expenseList) return;

    expenseList.innerHTML = "";


    // ================= SEARCH =================

    const searchText = searchExpense
        ? searchExpense.value.toLowerCase().trim()
        : "";


    // ================= FILTER =================

    const selectedType = filterType
        ? filterType.value.toLowerCase()
        : "all";


    // ================= COMBINE TRANSACTIONS =================

    let transactions = [];


    // ================= EXPENSES =================

    expenses.forEach(item => {

        transactions.push({

            type: "Expense",

            id: item.id,

            name: item.name,

            amount: Number(item.amount),

            category: item.category,

            date: item.date

        });

    });


    // ================= INCOME =================

    if (window.allIncome) {

        window.allIncome.forEach(item => {

            transactions.push({

                type: "Income",

                id: item.id,

                name: item.source,

                amount: Number(item.amount),

                category: "Income",

                date: item.date || item.created_at

            });

        });

    }


    // ================= SORT BY DATE =================

    transactions.sort((a, b) => {

        return new Date(b.date) - new Date(a.date);

    });


    // ================= DISPLAY =================

    transactions.forEach(transaction => {


        const transactionType =
            transaction.type.toLowerCase();


        // ================= SEARCH MATCH =================

        const matchSearch =

            String(transaction.name || "")
                .toLowerCase()
                .includes(searchText)

            ||

            String(transaction.category || "")
                .toLowerCase()
                .includes(searchText);


        // ================= TYPE FILTER =================

        const matchType =

            selectedType === "all"

            ||

            transactionType === selectedType;


        if (!matchSearch || !matchType) {

            return;

        }


        // ================= AMOUNT =================

        const amountDisplay =

            transaction.type === "Income"

                ? "+" + formatCurrency(transaction.amount)

                : "-" + formatCurrency(transaction.amount);


        // ================= TABLE =================

        expenseList.innerHTML += `

            <tr>

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

                    ${
                        transaction.type === "Expense"

                        ?

                        `

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

                        `

                        :

                        `

                        <button
                            class="delete-btn"
                            onclick="deleteIncomeById(${transaction.id})">

                            Delete

                        </button>

                        `
                    }

                </td>

            </tr>

        `;

    });

}


// ================= SEARCH EVENT =================

if (searchExpense) {

    searchExpense.addEventListener("input", () => {

        displayExpenses();

    });

}


// ================= TRANSACTION FILTER =================

if (filterType) {

    filterType.addEventListener("change", () => {

        displayExpenses();

    });

}
// ================= CALCULATE TOTALS =================

function calculateTotals() {

    let totalIncomeAmount = 0;

    let totalExpenseAmount = 0;


    // ================= TOTAL INCOME =================

    if (window.allIncome) {

        window.allIncome.forEach(item => {

            totalIncomeAmount +=
                Number(item.amount) || 0;

        });

    }


    // ================= TOTAL EXPENSE =================

    expenses.forEach(item => {

        totalExpenseAmount +=
            Number(item.amount) || 0;

    });


    // ================= BALANCE =================

    const balance =
        totalIncomeAmount - totalExpenseAmount;


    // ================= DISPLAY INCOME =================

    if (totalIncome) {

        totalIncome.innerText =
            formatCurrency(totalIncomeAmount);

    }


    // ================= DISPLAY EXPENSE =================

    if (totalExpense) {

        totalExpense.innerText =
            formatCurrency(totalExpenseAmount);

    }


    // ================= DISPLAY BALANCE =================

    if (totalBalance) {

        totalBalance.innerText =
            formatCurrency(balance);

    }


    console.log(
        "Total Income:",
        totalIncomeAmount
    );

    console.log(
        "Total Expense:",
        totalExpenseAmount
    );

    console.log(
        "Balance:",
        balance
    );

}
// ================= DELETE EXPENSE BY ID =================

async function deleteExpenseById(id) {

    if (!id) {
        alert("Invalid expense ID");
        return;
    }

    const confirmDelete =
        confirm("Are you sure you want to delete this expense?");

    if (!confirmDelete) {
        return;
    }

    try {

        const response = await fetch(
            "http://localhost:5000/delete-expense/" + id,
            {
                method: "DELETE"
            }
        );

        const data =
            await response.json();

        if (data.success) {

            alert("Expense Deleted Successfully ✅");

            await loadExpenses();

            displayExpenses();

            calculateTotals();

        } else {

            alert(
                data.message ||
                "Delete Failed"
            );

        }

    } catch (error) {

        console.error(error);

        alert("Server Error");

    }

}


// ================= DELETE INCOME BY ID =================

async function deleteIncomeById(id) {

    if (!id) {
        alert("Invalid income ID");
        return;
    }

    const confirmDelete =
        confirm("Are you sure you want to delete this income?");

    if (!confirmDelete) {
        return;
    }

    try {

        const response = await fetch(
            "http://localhost:5000/delete-income/" + id,
            {
                method: "DELETE"
            }
        );

        const data =
            await response.json();

        if (data.success) {

            alert("Income Deleted Successfully ✅");

            await loadIncome();

            displayExpenses();

            calculateTotals();

        } else {

            alert(
                data.message ||
                "Delete Failed"
            );

        }

    } catch (error) {

        console.error(error);

        alert("Server Error");

    }

}


// ================= EDIT EXPENSE BY ID =================

function editExpenseById(id) {

    if (!id) {

        alert("Invalid expense ID");

        return;

    }


    const expense =
        expenses.find(item =>
            Number(item.id) === Number(id)
        );


    if (!expense) {

        alert("Expense not found");

        return;

    }


    editIndex.value =
        expense.id;

    editName.value =
        expense.name;

    editAmount.value =
        expense.amount;

    editCategory.value =
        expense.category;

    editDate.value =
        expense.date;


    editPopup.style.display =
        "block";

}


// ================= CLOSE EDIT POPUP =================

if (closeEditBtn) {

    closeEditBtn.addEventListener("click", () => {

        editPopup.style.display =
            "none";

    });

}
// ================= UPDATE EXPENSE =================

if (updateExpenseBtn) {

    updateExpenseBtn.addEventListener("click", async () => {

        const id =
            editIndex.value;

        const name =
            editName.value.trim();

        const amount =
            Number(editAmount.value);

        const category =
            editCategory.value;

        const date =
            editDate.value;


        // ================= VALIDATION =================

        if (
            !id ||
            name === "" ||
            !amount ||
            amount <= 0 ||
            !category ||
            !date
        ) {

            alert("Please fill all fields correctly");

            return;

        }


        try {

            const response = await fetch(
                "http://localhost:5000/update-expense/" + id,
                {

                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        name: name,

                        amount: amount,

                        category: category,

                        date: date

                    })

                }
            );


            const data =
                await response.json();


            if (data.success) {

                alert(
                    "Expense Updated Successfully ✅"
                );


                // ================= CLOSE POPUP =================

                editPopup.style.display =
                    "none";


                // ================= RELOAD DATA =================

                await loadExpenses();


                displayExpenses();

                calculateTotals();


            } else {

                alert(
                    data.message ||
                    "Update Failed"
                );

            }

        } catch (error) {

            console.error(error);

            alert("Server Error");

        }

    });

}
// ================= INITIAL LOAD =================

async function initializeDashboard() {

    try {

        // Load expenses from database
        await loadExpenses();

        // Load income from database
        await loadIncome();


        // Display combined history
        displayExpenses();


        // Calculate totals
        calculateTotals();


    } catch (error) {

        console.error(
            "Dashboard loading error:",
            error
        );

    }

}


// ================= START DASHBOARD =================

initializeDashboard();
// ================= IMPORT EXPENSE =================

const importExpenseBtn =
    document.getElementById("importExpenseBtn");

const expenseFileInput =
    document.getElementById("expenseFileInput");


// ================= OPEN FILE SELECTOR =================

if (importExpenseBtn && expenseFileInput) {

    importExpenseBtn.addEventListener("click", () => {

        expenseFileInput.click();

    });

}


// ================= PROCESS IMPORTED FILE =================

if (expenseFileInput) {

    expenseFileInput.addEventListener("change", async function () {

        const file = this.files[0];

        if (!file) {
            return;
        }


        try {

            // Read Excel / CSV file
            const data =
                await file.arrayBuffer();

            const workbook =
                XLSX.read(data, {
                    type: "array"
                });


            // Get first sheet
            const sheetName =
                workbook.SheetNames[0];

            const worksheet =
                workbook.Sheets[sheetName];


            // Convert sheet to JSON
            const importedData =
                XLSX.utils.sheet_to_json(
                    worksheet,
                    {
                        defval: ""
                    }
                );


            if (!importedData.length) {

                alert(
                    "No data found in the selected file."
                );

                return;

            }


            let importedCount = 0;


            // ================= IMPORT EACH ROW =================

            for (const row of importedData) {

                const name =
                    row.Name ||
                    row.name ||
                    row.Expense ||
                    row.expense ||
                    row.Spender ||
                    row.spender;

                const amount =
                    Number(
                        row.Amount ||
                        row.amount
                    );

                const category =
                    row.Category ||
                    row.category ||
                    "Others";

                const date =
                    row.Date ||
                    row.date;


                // ================= VALIDATE ROW =================

                if (
                    !name ||
                    !amount ||
                    amount <= 0 ||
                    !date
                ) {

                    continue;

                }


                // ================= SEND TO DATABASE =================

                const response =
                    await fetch(
                        "http://localhost:5000/add-expense",
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                email:
                                    localStorage.getItem(
                                        "userEmail"
                                    ),

                                name:
                                    String(name),

                                amount:
                                    amount,

                                category:
                                    String(category),

                                date:
                                    String(date)

                            })

                        }
                    );


                const result =
                    await response.json();


                if (result.success) {

                    importedCount++;

                }

            }


            // ================= RELOAD DATA =================

            await loadExpenses();

            await loadIncome();

            displayExpenses();

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


        // Reset file input
        this.value = "";

    });

}
// ================= THEME =================

const themeBtn =
    document.getElementById("themeBtn");


if (themeBtn) {

    themeBtn.addEventListener("click", () => {

        document.body.classList.toggle("dark-mode");


        // Save theme
        const isDark =
            document.body.classList.contains("dark-mode");

        localStorage.setItem(
            "darkMode",
            isDark ? "true" : "false"
        );

    });

}


// ================= LOAD SAVED THEME =================

if (
    localStorage.getItem("darkMode") === "true"
) {

    document.body.classList.add("dark-mode");

}


// ================= PROFILE IMAGE =================

const profileImage =
    document.getElementById("profileImage");


if (profileImage) {

    const savedProfileImage =
        localStorage.getItem("profileImage");

    if (savedProfileImage) {

        profileImage.src =
            savedProfileImage;

    } else {

        profileImage.src =
            "./assets/profile.png";

    }

}
