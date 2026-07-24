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

const addExpenseBtn = document.getElementById("addExpenseBtn");
const addIncomeBtn = document.getElementById("addIncomeBtn");
// ================= CUSTOM CATEGORY =================

const expenseCategory = document.getElementById("expenseCategory");
const customCategory = document.getElementById("customCategory");


if(expenseCategory){

    expenseCategory.addEventListener("change", function(){

        if(this.value === "Others"){

            customCategory.style.display = "block";

        } else {

            customCategory.style.display = "none";
            customCategory.value = "";

        }

    });

}

// ================= ELEMENTS =================

const expenseList = document.getElementById("expenseList");

const totalExpense = document.getElementById("totalExpense");
const totalIncome = document.getElementById("totalIncome");
const totalBalance = document.getElementById("totalBalance");

// Search & Filter

const searchExpense = document.getElementById("searchExpense");
const filterCategory = document.getElementById("filterCategory");

// Edit Popup

const editPopup = document.getElementById("editPopup");

const editIndex = document.getElementById("editIndex");
const editName = document.getElementById("editName");
const editAmount = document.getElementById("editAmount");
const editCategory = document.getElementById("editCategory");
const editDate = document.getElementById("editDate");

const updateExpenseBtn =
document.getElementById("updateExpenseBtn");

const closeEditBtn =
document.getElementById("closeEditBtn");

// ================= LOCAL STORAGE =================

let expenses = JSON.parse(
    localStorage.getItem("expenses")
) || [];

let income = Number(
    localStorage.getItem("income")
) || 0;

// ================= ADD INCOME =================
if(addIncomeBtn){

addIncomeBtn.addEventListener("click", () => {

    const incomeSource =
    document.getElementById("incomeName").value;

    const amount =
    document.getElementById("incomeAmount").value;

    if (
        incomeSource === "" ||
        amount === ""
    ) {

        alert("Please fill all income fields");
        return;

    }

    income += Number(amount);

    localStorage.setItem(
        "income",
        income
    );

    displayExpenses();

    document.getElementById("incomeName").value = "";
    document.getElementById("incomeAmount").value = "";

});
}

// ================= ADD EXPENSE =================

if(addExpenseBtn){

addExpenseBtn.addEventListener("click", () => {


    const name =
    document.getElementById("expenseName").value;

    const amount =
    document.getElementById("expenseAmount").value;

    const categorySelect =
document.getElementById("expenseCategory");

const customCategory =
document.getElementById("customCategory");

let category =
categorySelect.value;

if(category === "Others"){

    category =
    customCategory.value.trim();

}

    const date =
    document.getElementById("expenseDate").value;

    if (
        name === "" ||
        amount === "" ||
        date === ""
    ) {

        alert("Please fill all fields");
        return;

    }

    const expense = {

        name: name,
        amount: Number(amount),
        category: category,
        date: date

    };

    expenses.push(expense);

    localStorage.setItem(
        "expenses",
        JSON.stringify(expenses)
    );

    displayExpenses();

    document.getElementById("expenseName").value = "";
    document.getElementById("expenseAmount").value = "";
    document.getElementById("expenseDate").value = "";

});
}

// ================= DISPLAY EXPENSE =================

function displayExpenses() {

    if(!expenseList) return;

    expenseList.innerHTML = "";

    let searchText = "";
    let selectedCategory = "All";

    if (searchExpense) {

        searchText =
        searchExpense.value.toLowerCase();

    }

    if (filterCategory) {

        selectedCategory =
        filterCategory.value;

    }

    expenses.forEach((expense, index) => {

        let matchSearch =
        expense.name.toLowerCase().includes(searchText) ||
        expense.category.toLowerCase().includes(searchText);

        let matchCategory =
        selectedCategory === "All" ||
        expense.category === selectedCategory;

        if (matchSearch && matchCategory) {

            expenseList.innerHTML += `

            <tr>

                <td>${expense.name}</td>

                <td>${formatCurrency(expense.amount)}</td>

                <td>${expense.category}</td>

                <td>${expense.date}</td>

                <td>

                    <button
                    class="edit-btn"
                    onclick="editExpense(${index})">
                    Edit
                    </button>

                    <button
                    class="delete-btn"
                    onclick="deleteExpense(${index})">
                    Delete
                    </button>

                </td>

            </tr>

            `;

        }

    });

    let total = 0;

    expenses.forEach((expense) => {

        total += Number(expense.amount);

    });

    let balance = income - total;

    totalIncome.innerText =
    formatCurrency(income);
 
    totalExpense.innerText =
    formatCurrency(total);
 
    totalBalance.innerText =
    formatCurrency(balance);

    // LOW BALANCE REMINDER

    // LOW BALANCE REMINDER

let profileData =
JSON.parse(localStorage.getItem("profileData")) || {};

let minimumBalance =
Number(profileData.minimumBalance) || 0;

if (
    minimumBalance > 0 &&
    balance < minimumBalance &&
    balance > 0
){

        const reminderShown =
        localStorage.getItem(
            "lowBalanceAlert"
        );

        if (!reminderShown) {
           
            alert(
    `⚠️ Warning! Your balance is below ₹${minimumBalance}`
);

            localStorage.setItem(
                "lowBalanceAlert",
                "true"
            );

        }

    } else {

        localStorage.removeItem(
            "lowBalanceAlert"
        );

    }

}
// ================= SEARCH EVENT =================

if (searchExpense) {

    searchExpense.addEventListener(
        "input",
        () => {
            if(expenseList){
    displayExpenses();
}
        }
    );

}

// ================= FILTER EVENT =================

if (filterCategory) {

    filterCategory.addEventListener(
        "change",
        () => {
            displayExpenses();
        }
    );

}

// ================= DELETE EXPENSE =================

function deleteExpense(index) {

    expenses.splice(index, 1);

    localStorage.setItem(
        "expenses",
        JSON.stringify(expenses)
    );

    displayExpenses();

}

// ================= EDIT EXPENSE =================

function editExpense(index) {

    const expense = expenses[index];

    editIndex.value = index;
    editName.value = expense.name;
    editAmount.value = expense.amount;
    editCategory.value = expense.category;
    editDate.value = expense.date;

    editPopup.style.display = "block";

}

// ================= UPDATE EXPENSE =================

if(updateExpenseBtn){

updateExpenseBtn.addEventListener("click", () => {

    const index = editIndex.value;

    expenses[index] = {

        name: editName.value,
        amount: Number(editAmount.value),
        category: editCategory.value,
        date: editDate.value

    };

    localStorage.setItem(
        "expenses",
        JSON.stringify(expenses)
    );

    displayExpenses();

    editPopup.style.display = "none";

    alert(
        "Expense Updated Successfully ✅"
    );

});
}

// ================= CLOSE EDIT =================
if(closeEditBtn){

closeEditBtn.addEventListener("click", () => {

    editPopup.style.display = "none";

});
}

// ================= REMINDER AUTO ADD SUPPORT =================

function addReminderExpense(reminder) {

    const today = new Date();

    const date =
    today.toISOString().split("T")[0];

    const expense = {

        name: reminder.name,
        amount: Number(reminder.amount),
        category: reminder.category,
        date: date

    };

    expenses.push(expense);

    localStorage.setItem(
        "expenses",
        JSON.stringify(expenses)
    );

    if(expenseList){
    displayExpenses();
}

    alert(
        reminder.name +
        " expense added successfully 🔥"
    );

}

// ================= DAILY EXPENSE REMINDER =================

window.addEventListener("load", () => {

    const today =
    new Date().toDateString();

    const lastReminder =
    localStorage.getItem(
        "lastReminderDate"
    );

    if (lastReminder !== today) {

        setTimeout(() => {

            alert(
                "📝 Don't forget to add today's expenses!"
            );

            localStorage.setItem(
                "lastReminderDate",
                today
            );

        }, 1500);

    }

});

// ================= INITIAL LOAD =================

displayExpenses();

const menuBtn = document.getElementById("menuBtn");
const sideMenu = document.getElementById("sideMenu");

if(menuBtn && sideMenu){

    menuBtn.addEventListener("click",()=>{

        sideMenu.classList.toggle("active");

    });


    // outside click close

    document.addEventListener("click",(e)=>{

        if(
            !sideMenu.contains(e.target) &&
            !menuBtn.contains(e.target)
        ){

            sideMenu.classList.remove("active");

        }

    });

}

// ================= USER PROFILE DISPLAY =================

const profileCircle = document.getElementById("profileCircle");
const profileImage = document.getElementById("profileImage");

const savedImage = localStorage.getItem("profileImage");

const savedProfile = JSON.parse(
    localStorage.getItem("profileData")
);


if(profileImage && savedImage){

    profileImage.src = savedImage;
    profileImage.style.display = "block";

}


else if(profileCircle && savedProfile && savedProfile.name){

    profileCircle.innerHTML =
    savedProfile.name.charAt(0).toUpperCase();

}
// ================= THEME TOGGLE =================

const themeBtn = document.getElementById("themeBtn");

if(localStorage.getItem("theme") === "light"){

    document.body.classList.add("light-mode");

}

if(themeBtn){

themeBtn.addEventListener("click",()=>{

    document.body.classList.toggle("light-mode");

    if(document.body.classList.contains("light-mode")){

        localStorage.setItem("theme","light");

    }
    else{

        localStorage.setItem("theme","dark");

    }

});

}
function loadDemoData(){

let demoExpenses = [
{
name:"Food",
amount:250,
category:"Food",
date:"2026-07-01"
},
{
name:"Travel",
amount:500,
category:"Travel",
date:"2026-07-02"
},
{
name:"Shopping",
amount:1200,
category:"Shopping",
date:"2026-07-03"
}
];


expenses.push(...demoExpenses);


localStorage.setItem(
"expenses",
JSON.stringify(expenses)
);


displayExpenses();


alert("Demo Data Added Successfully ✅");

}
// ================= IMPORT CSV & EXCEL =================

const importExpenseBtn =
document.getElementById("importExpenseBtn");

const expenseFileInput =
document.getElementById("expenseFileInput");

if(importExpenseBtn && expenseFileInput){

    importExpenseBtn.addEventListener("click",()=>{

        expenseFileInput.click();

    });

    expenseFileInput.addEventListener("change",function(){

        const file = this.files[0];

        if(!file) return;

        const reader = new FileReader();

        reader.onload = function(e){

            const data = new Uint8Array(e.target.result);

            const workbook =
            XLSX.read(data,{type:"array"});

            const sheetName =
            workbook.SheetNames[0];

            const worksheet =
            workbook.Sheets[sheetName];

            const importedExpenses =
            XLSX.utils.sheet_to_json(worksheet);

            expenses.push(...importedExpenses);

            localStorage.setItem(
                "expenses",
                JSON.stringify(expenses)
            );

            displayExpenses();

            alert(
                "Expenses Imported Successfully ✅"
            );

        };

        reader.readAsArrayBuffer(file);

    });

}