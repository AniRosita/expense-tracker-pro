const income =
Number(localStorage.getItem("income")) || 0;

const expenses =
JSON.parse(localStorage.getItem("expenses")) || [];

// ================= TOTAL EXPENSE =================

let totalExpense = 0;

expenses.forEach((expense) => {

    totalExpense += Number(expense.amount);

});

const balance = income - totalExpense;

// ================= BASIC REPORT =================

document.getElementById("reportIncome").innerText =
formatCurrency(income);

document.getElementById("reportExpense").innerText =
formatCurrency(totalExpense);

document.getElementById("reportBalance").innerText =
formatCurrency(balance);

document.getElementById("reportTransactions").innerText =
expenses.length;

document.getElementById("totalSavings").innerText =
formatCurrency(balance);


// ================= HIGHEST EXPENSE =================

let highestExpense = 0;

expenses.forEach((expense) => {

    if (Number(expense.amount) > highestExpense) {

        highestExpense =
        Number(expense.amount);

    }

});


document.getElementById("highestExpense").innerText =
formatCurrency(highestExpense);

// ================= MOST USED CATEGORY =================

const categoryCount = {};

expenses.forEach((expense) => {

    if (categoryCount[expense.category]) {

        categoryCount[expense.category]++;

    } else {

        categoryCount[expense.category] = 1;

    }

});

let topCategory = "-";
let maxCount = 0;

for (let category in categoryCount) {

    if (categoryCount[category] > maxCount) {

        maxCount = categoryCount[category];
        topCategory = category;

    }

}

document.getElementById("topCategory").innerText =
topCategory;

// ================= FINANCIAL SCORE =================

let score = 100;

if (income > 0) {

    const expensePercent =
    (totalExpense / income) * 100;

    score = Math.max(
        0,
        Math.round(100 - expensePercent)
    );

}

document.getElementById("financialScore").innerText =
score + "/100";

// ================= SMART SUGGESTION =================

let suggestion =
"Excellent Saving Habit 🏆";

if (score < 80) {

    suggestion =
    "Reduce unnecessary shopping and food expenses.";

}

if (score < 60) {

    suggestion =
    "Create a monthly budget and track every expense.";

}

if (score < 40) {

    suggestion =
    "High spending detected. Focus on savings immediately.";

}

document.getElementById("smartSuggestion").innerText =
suggestion;

// ================= PIE CHART =================

const categoryTotals = {};

expenses.forEach((expense) => {

    const category =
    expense.category || "Others";

    if (categoryTotals[category]) {

        categoryTotals[category] +=
        Number(expense.amount);

    } else {

        categoryTotals[category] =
        Number(expense.amount);

    }

});

const pieLabels =
Object.keys(categoryTotals);

const pieData =
Object.values(categoryTotals);

const pieCanvas =
document.getElementById("expensePieChart");

if (pieCanvas) {

    new Chart(pieCanvas, {

        type: "doughnut",

        data: {

            labels: pieLabels,

            datasets: [{

                data: pieData,

                backgroundColor: [

                    "#a855f7",
                    "#22c55e",
                    "#3b82f6",
                    "#f59e0b",
                    "#ef4444",
                    "#14b8a6",
                    "#ec4899"

                ]

            }]

        },

        options: {

            responsive: true,

            plugins: {

                legend: {

                    labels: {

                        color: "white"

                    }

                }

            }

        }

    });

}

// ================= MONTHLY CHART =================

const monthlyExpense = {};

expenses.forEach((expense) => {

    if (!expense.date) return;

    const date = new Date(expense.date);

const month =
date.toLocaleString("en-US",{
month:"short",
year:"numeric"
});

    if (monthlyExpense[month]) {

        monthlyExpense[month] +=
        Number(expense.amount);

    } else {

        monthlyExpense[month] =
        Number(expense.amount);

    }

});

const monthLabels =
Object.keys(monthlyExpense);

const monthAmounts =
Object.values(monthlyExpense).map(amount =>
    Number(
        convertCurrency(
            amount,
            getUserCurrency()
        )
    )
);

const monthlyCanvas =
document.getElementById("monthlyExpenseChart");

if (monthlyCanvas) {

    new Chart(monthlyCanvas, {

        type: "bar",

        data: {

            labels: monthLabels,

            datasets: [{

                label: "Monthly Expense",

                data: monthAmounts,

                backgroundColor:
                "#a855f7",

                borderRadius: 8

            }]

        },

        options: {

            responsive: true,

            scales: {

                x: {

                    ticks: {

                        color: "white"

                    }

                },

                y: {

                    ticks: {

                        color: "white"

                    }

                }

            },

            plugins: {

                legend: {

                    labels: {

                        color: "white"

                    }

                }

            }

        }

    });
}
    // ================= SAVING TREND CHART =================


// ================= SAVING TREND CHART =================


const monthlySaving = {};


expenses.forEach((expense)=>{

    if(!expense.date) return;


    const date = new Date(expense.date);

let month =
date.toLocaleString("en-US",{
month:"short",
year:"numeric"
});


    if(monthlySaving[month]){

        monthlySaving[month] += Number(expense.amount);

    }
    else{

        monthlySaving[month] = Number(expense.amount);

    }

});


let savingLabels = Object.keys(monthlySaving);


let savingData = [];

let totalSpent = 0;


savingLabels.forEach((month)=>{


    totalSpent += monthlySaving[month];


    let saving = income - totalSpent;


    savingData.push(

        Number(
            convertCurrency(
                saving,
                getUserCurrency()
            )
        )

    );


});
// Create Saving Trend Chart

const savingCanvas =
document.getElementById("savingTrendChart");

if(savingCanvas){

    new Chart(savingCanvas,{

        type:"bar",

        data:{

            labels:savingLabels,

            datasets:[{

                label:"Monthly Savings",

                data:savingData,

                borderColor:"#22c55e",

                backgroundColor:"rgba(34,197,94,0.2)",

                fill:true,

                tension:0.4

            }]

        },

        options:{

            responsive:true,

            plugins:{

                legend:{

                    labels:{

                        color:"white"

                    }

                }

            },

            scales:{

                x:{

                    ticks:{

                        color:"white"

                    }

                },

                y:{

                    ticks:{

                        color:"white"

                    }

                }

            }

        }

    });

}
// ================= INCOME VS EXPENSE CHART =================

const incomeExpenseCanvas =
document.getElementById("incomeExpenseChart");

if(incomeExpenseCanvas){

    new Chart(incomeExpenseCanvas,{

        type:"bar",

        data:{

            labels:["Income","Expense"],

            datasets:[{

                data:[
                    income,
                    totalExpense
                ],

                backgroundColor:[
                    "#22c55e",
                    "#ef4444"
                ],

                borderRadius:10

            }]

        },

        options:{

            responsive:true,

            plugins:{

                legend:{
                    display:false
                }

            },

            scales:{

                x:{
                    ticks:{
                        color:"white"
                    }
                },

                y:{
                    ticks:{
                        color:"white"
                    }
                }

            }

        }

    });

}
// LOAD SAVED THEME

if(localStorage.getItem("theme") === "light"){

    document.body.classList.add("light-mode");

}

    