// ======================================================
// ================= EXPENSE REPORT ======================
// ======================================================

"use strict";

// ======================================================
// ================= DATA ================================
// ======================================================

let allExpenses = [];
let allIncome = [];

let pieChart = null;
let monthlyChart = null;
let savingChart = null;
let incomeExpenseChart = null;


// ======================================================
// ================= API BASE URL ========================
// ======================================================

// Railway Backend URL
const API_BASE =
    "https://expense-tracker-pro-production-b745.up.railway.app";


// ======================================================
// ================= LOGIN CHECK =========================
// ======================================================

function checkReportLogin() {

    const email =
        localStorage.getItem("userEmail");

    if (!email) {

        if (typeof Swal !== "undefined") {

            Swal.fire({
                icon: "warning",
                title: "Login Required",
                text: "Please login first."
            });

        } else {

            alert("Please login first.");

        }

        window.location.href = "index.html";

        return false;
    }

    return true;
}


// ======================================================
// ================= CHART COLORS ========================
// ======================================================

function getChartTextColor() {

    return document.body.classList.contains("dark-mode")
        ? "#ffffff"
        : "#374151";

}


function getChartGridColor() {

    return document.body.classList.contains("dark-mode")
        ? "rgba(255,255,255,0.15)"
        : "rgba(0,0,0,0.1)";

}


// ======================================================
// ================= CURRENCY =============================
// ======================================================

function reportCurrency(value) {

    const amount =
        Number(value) || 0;

    if (typeof formatCurrency === "function") {

        return formatCurrency(amount);

    }

    return (
        "₹" +
        amount.toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )
    );

}


// ======================================================
// ================= SAFE DATE ============================
// ======================================================

function getDateString(value) {

    if (!value) {
        return "";
    }

    // MySQL date / datetime
    if (value instanceof Date) {

        if (isNaN(value.getTime())) {
            return "";
        }

        return value.toISOString().substring(0, 10);

    }

    const stringValue =
        String(value).trim();

    if (!stringValue) {
        return "";
    }

    return stringValue.substring(0, 10);

}


// ======================================================
// ================= PAGE LOAD ============================
// ======================================================

window.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "======================================"
        );

        console.log(
            "Reports Page Loading..."
        );

        console.log(
            "Report API:",
            API_BASE
        );

        console.log(
            "User:",
            localStorage.getItem("userEmail")
        );

        console.log(
            "======================================"
        );


        if (!checkReportLogin()) {
            return;
        }

        loadReportData();

    }
);


// ======================================================
// ================= LOAD REPORT DATA ====================
// ======================================================

async function loadReportData() {

    const email =
        localStorage.getItem("userEmail");

    if (!email) {

        checkReportLogin();

        return;

    }


    try {

        console.log(
            "Loading report data..."
        );


        // ==================================================
        // ================= EXPENSE ========================
        // ==================================================

        const expenseUrl =
            API_BASE +
            "/expenses/" +
            encodeURIComponent(
                email.trim().toLowerCase()
            );


        console.log(
            "Expense API URL:",
            expenseUrl
        );


        const expenseRes =
            await fetch(
                expenseUrl,
                {
                    method: "GET",
                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        console.log(
            "Expense API Status:",
            expenseRes.status
        );


        if (!expenseRes.ok) {

            const errorText =
                await expenseRes.text();

            console.error(
                "Expense API Error Response:",
                errorText
            );

            throw new Error(
                "Expense API Error: " +
                expenseRes.status
            );

        }


        const expenseData =
            await expenseRes.json();


        console.log(
            "FULL EXPENSE API DATA:",
            expenseData
        );


        // ==================================================
        // HANDLE EXPENSE RESPONSE
        // ==================================================

        if (
            Array.isArray(
                expenseData
            )
        ) {

            allExpenses =
                expenseData;

        }

        else if (
            expenseData &&
            Array.isArray(
                expenseData.expenses
            )
        ) {

            allExpenses =
                expenseData.expenses;

        }

        else if (
            expenseData &&
            Array.isArray(
                expenseData.data
            )
        ) {

            allExpenses =
                expenseData.data;

        }

        else {

            allExpenses = [];

        }


        console.log(
            "Expenses loaded:",
            allExpenses
        );

        console.log(
            "Expense Count:",
            allExpenses.length
        );


        // ==================================================
        // ================= INCOME =========================
        // ==================================================

        const incomeUrl =
            API_BASE +
            "/income/" +
            encodeURIComponent(
                email.trim().toLowerCase()
            );


        console.log(
            "Income API URL:",
            incomeUrl
        );


        const incomeRes =
            await fetch(
                incomeUrl,
                {
                    method: "GET",
                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        console.log(
            "Income API Status:",
            incomeRes.status
        );


        if (!incomeRes.ok) {

            const errorText =
                await incomeRes.text();

            console.error(
                "Income API Error Response:",
                errorText
            );

            throw new Error(
                "Income API Error: " +
                incomeRes.status
            );

        }


        const incomeData =
            await incomeRes.json();


        console.log(
            "FULL INCOME API DATA:",
            incomeData
        );


        // ==================================================
        // HANDLE INCOME RESPONSE
        // ==================================================

        if (
            Array.isArray(
                incomeData
            )
        ) {

            allIncome =
                incomeData;

        }

        else if (
            incomeData &&
            Array.isArray(
                incomeData.income
            )
        ) {

            allIncome =
                incomeData.income;

        }

        else if (
            incomeData &&
            Array.isArray(
                incomeData.data
            )
        ) {

            allIncome =
                incomeData.data;

        }

        else {

            allIncome = [];

        }


        console.log(
            "Income loaded:",
            allIncome
        );

        console.log(
            "Income Count:",
            allIncome.length
        );


        // ==================================================
        // ================= FILTERS ========================
        // ==================================================

        loadAvailableYears();

        loadAvailableMonths();


        // ==================================================
        // ================= GENERATE =======================
        // ==================================================

        generateReport();


        console.log(
            "Reports loaded successfully ✅"
        );


        console.log(
            "======================================"
        );

    }


    catch (error) {

        console.error(
            "======================================"
        );

        console.error(
            "REPORT LOAD ERROR:",
            error
        );

        console.error(
            "======================================"
        );


        allExpenses = [];

        allIncome = [];


        if (
            typeof Swal !== "undefined"
        ) {

            Swal.fire({

                icon: "error",

                title: "Report Error",

                text:
                    "Unable to load report data. Please check the server connection."

            });

        }

    }

}


// ======================================================
// ================= YEAR DROPDOWN =======================
// ======================================================

function loadAvailableYears() {

    const reportYear =
        document.getElementById(
            "reportYear"
        );


    if (!reportYear) {
        return;
    }


    reportYear
        .querySelectorAll(".dynamic-year")
        .forEach(
            option => option.remove()
        );


    const years =
        new Set();


    // EXPENSE YEARS

    allExpenses.forEach(
        expense => {

            const date =
                getDateString(
                    expense.date ||
                    expense.created_at
                );


            if (!date) {
                return;
            }


            const year =
                date.substring(
                    0,
                    4
                );


            if (
                /^\d{4}$/.test(year)
            ) {

                years.add(year);

            }

        }
    );


    // INCOME YEARS

    allIncome.forEach(
        income => {

            const date =
                getDateString(
                    income.date ||
                    income.created_at
                );


            if (!date) {
                return;
            }


            const year =
                date.substring(
                    0,
                    4
                );


            if (
                /^\d{4}$/.test(year)
            ) {

                years.add(year);

            }

        }
    );


    reportYear.innerHTML = "";


    const sortedYears =
        Array.from(years)
            .sort(
                (a, b) =>
                    Number(a) -
                    Number(b)
            );


    if (
        sortedYears.length === 0
    ) {

        const currentYear =
            String(
                new Date()
                    .getFullYear()
            );


        const option =
            document.createElement(
                "option"
            );


        option.value =
            currentYear;

        option.textContent =
            currentYear;

        reportYear.appendChild(
            option
        );

        reportYear.value =
            currentYear;

        return;

    }


    sortedYears.forEach(
        year => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                year;

            option.textContent =
                year;

            option.classList.add(
                "dynamic-year"
            );

            reportYear.appendChild(
                option
            );

        }
    );


    reportYear.value =
        sortedYears[
            sortedYears.length - 1
        ];

}


// ======================================================
// ================= MONTH DROPDOWN ======================
// ======================================================

function loadAvailableMonths() {

    const reportYear =
        document.getElementById(
            "reportYear"
        );

    const reportMonth =
        document.getElementById(
            "reportMonth"
        );


    if (
        !reportYear ||
        !reportMonth
    ) {
        return;
    }


    const selectedYear =
        reportYear.value;


    if (!selectedYear) {
        return;
    }


    const months =
        new Set();


    // EXPENSE MONTHS

    allExpenses.forEach(
        expense => {

            const date =
                getDateString(
                    expense.date ||
                    expense.created_at
                );


            if (!date) {
                return;
            }


            if (
                date.substring(0, 4) ===
                selectedYear
            ) {

                const month =
                    date.substring(
                        5,
                        7
                    );


                if (
                    /^\d{2}$/.test(month)
                ) {

                    months.add(month);

                }

            }

        }
    );


    // INCOME MONTHS

    allIncome.forEach(
        income => {

            const date =
                getDateString(
                    income.date ||
                    income.created_at
                );


            if (!date) {
                return;
            }


            if (
                date.substring(0, 4) ===
                selectedYear
            ) {

                const month =
                    date.substring(
                        5,
                        7
                    );


                if (
                    /^\d{2}$/.test(month)
                ) {

                    months.add(month);

                }

            }

        }
    );


    reportMonth.innerHTML = "";


    const sortedMonths =
        Array.from(months)
            .sort();


    if (
        sortedMonths.length === 0
    ) {

        const currentMonth =
            String(
                new Date()
                    .getMonth() + 1
            ).padStart(
                2,
                "0"
            );


        const option =
            document.createElement(
                "option"
            );


        option.value =
            currentMonth;


        option.textContent =
            new Date(
                Number(selectedYear),
                Number(currentMonth) - 1,
                1
            ).toLocaleString(
                "en-US",
                {
                    month: "long"
                }
            );


        reportMonth.appendChild(
            option
        );


        reportMonth.value =
            currentMonth;


        return;

    }


    sortedMonths.forEach(
        month => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                month;


            option.textContent =
                new Date(
                    Number(selectedYear),
                    Number(month) - 1,
                    1
                ).toLocaleString(
                    "en-US",
                    {
                        month: "long"
                    }
                );


            reportMonth.appendChild(
                option
            );

        }
    );


    reportMonth.value =
        sortedMonths[
            sortedMonths.length - 1
        ];

}


// ======================================================
// ================= FILTER EVENTS =======================
// ======================================================

document.addEventListener(
    "change",
    function (event) {

        if (
            event.target &&
            event.target.id ===
            "reportYear"
        ) {

            loadAvailableMonths();

            generateReport();

        }


        if (
            event.target &&
            event.target.id ===
            "reportMonth"
        ) {

            generateReport();

        }

    }
);


// ======================================================
// ================= GENERATE REPORT =====================
// ======================================================

function generateReport() {

    const yearElement =
        document.getElementById(
            "reportYear"
        );

    const monthElement =
        document.getElementById(
            "reportMonth"
        );


    if (
        !yearElement ||
        !monthElement
    ) {
        return;
    }


    const year =
        yearElement.value;

    const month =
        monthElement.value;


    if (
        !year ||
        !month
    ) {
        return;
    }


    const selectedMonth =
        `${year}-${month}`;


    console.log(
        "Generating report for:",
        selectedMonth
    );


    // ==================================================
    // EXPENSE FILTER
    // ==================================================

    const monthExpenses =
        allExpenses.filter(
            expense => {

                const date =
                    getDateString(
                        expense.date ||
                        expense.created_at
                    );


                return (
                    date &&
                    date.substring(0, 7) ===
                    selectedMonth
                );

            }
        );


    // ==================================================
    // INCOME FILTER
    // ==================================================

    const monthIncome =
        allIncome.filter(
            income => {

                const date =
                    getDateString(
                        income.date ||
                        income.created_at
                    );


                return (
                    date &&
                    date.substring(0, 7) ===
                    selectedMonth
                );

            }
        );


    console.log(
        "Month Expenses:",
        monthExpenses
    );

    console.log(
        "Month Income:",
        monthIncome
    );


    // ==================================================
    // TOTAL EXPENSE
    // ==================================================

    const totalExpense =
        monthExpenses.reduce(
            (sum, item) => {

                return (
                    sum +
                    (
                        Number(
                            item.amount
                        ) || 0
                    )
                );

            },
            0
        );


    // ==================================================
    // TOTAL INCOME
    // ==================================================

    const totalIncome =
        monthIncome.reduce(
            (sum, item) => {

                return (
                    sum +
                    (
                        Number(
                            item.amount
                        ) || 0
                    )
                );

            },
            0
        );


    // ==================================================
    // BALANCE
    // ==================================================

    const balance =
        totalIncome -
        totalExpense;


    // ==================================================
    // UPDATE CARDS
    // ==================================================

    const reportIncome =
        document.getElementById(
            "reportIncome"
        );

    const reportExpense =
        document.getElementById(
            "reportExpense"
        );

    const reportBalance =
        document.getElementById(
            "reportBalance"
        );

    const totalSavings =
        document.getElementById(
            "totalSavings"
        );


    if (reportIncome) {

        reportIncome.innerText =
            reportCurrency(
                totalIncome
            );

    }


    if (reportExpense) {

        reportExpense.innerText =
            reportCurrency(
                totalExpense
            );

    }


    if (reportBalance) {

        reportBalance.innerText =
            reportCurrency(
                balance
            );

    }


    if (totalSavings) {

        totalSavings.innerText =
            reportCurrency(
                balance
            );

    }


    // ==================================================
    // HIGHEST EXPENSE
    // ==================================================

    let highestExpense = 0;


    monthExpenses.forEach(
        item => {

            const amount =
                Number(
                    item.amount
                ) || 0;


            if (
                amount >
                highestExpense
            ) {

                highestExpense =
                    amount;

            }

        }
    );


    const highestExpenseElement =
        document.getElementById(
            "highestExpense"
        );


    if (
        highestExpenseElement
    ) {

        highestExpenseElement.innerText =
            reportCurrency(
                highestExpense
            );

    }


    // ==================================================
    // TOP CATEGORY
    // ==================================================

    const categoryCount = {};


    monthExpenses.forEach(
        expense => {

            const category =
                expense.category ||
                "Others";


            categoryCount[category] =
                (
                    categoryCount[category] ||
                    0
                ) + 1;

        }
    );


    let topCategory =
        "-";

    let maxCount =
        0;


    Object.keys(
        categoryCount
    ).forEach(
        category => {

            if (
                categoryCount[category] >
                maxCount
            ) {

                maxCount =
                    categoryCount[category];

                topCategory =
                    category;

            }

        }
    );


    const topCategoryElement =
        document.getElementById(
            "topCategory"
        );


    if (
        topCategoryElement
    ) {

        topCategoryElement.innerText =
            topCategory;

    }


    // ==================================================
    // TRANSACTIONS
    // ==================================================

    const transactions =
        document.getElementById(
            "reportTransactions"
        );


    if (transactions) {

        transactions.innerText =
            monthExpenses.length;

    }


    // ==================================================
    // FINANCIAL SCORE
    // ==================================================

    let score = 100;


    if (totalIncome > 0) {

        score =
            Math.max(
                0,
                Math.min(
                    100,
                    Math.round(
                        100 -
                        (
                            totalExpense /
                            totalIncome
                        ) * 100
                    )
                )
            );

    }


    if (
        totalIncome === 0 &&
        totalExpense > 0
    ) {

        score = 0;

    }


    const financialScore =
        document.getElementById(
            "financialScore"
        );


    if (financialScore) {

        financialScore.innerText =
            score +
            "/100";

    }


    // ==================================================
    // SMART SUGGESTION
    // ==================================================

    const suggestion =
        document.getElementById(
            "smartSuggestion"
        );


    if (suggestion) {

        if (
            totalIncome === 0 &&
            totalExpense === 0
        ) {

            suggestion.innerText =
                "No transactions for this month.";

        }

        else if (score >= 80) {

            suggestion.innerText =
                "Excellent saving habit 🏆";

        }

        else if (score >= 60) {

            suggestion.innerText =
                "Good financial control 👍";

        }

        else if (score >= 40) {

            suggestion.innerText =
                "Reduce unnecessary expenses ⚠️";

        }

        else {

            suggestion.innerText =
                "High spending detected 🚨";

        }

    }


    // ==================================================
    // CHARTS
    // ==================================================

    loadExpensePieChart(
        monthExpenses
    );

    loadMonthlyExpenseChart(
        totalExpense
    );

    loadSavingTrendChart();

    loadIncomeExpenseChart(
        totalIncome,
        totalExpense
    );

}


// ======================================================
// ================= EXPENSE PIE CHART ===================
// ======================================================

function loadExpensePieChart(
    monthExpenses
) {

    const canvas =
        document.getElementById(
            "expensePieChart"
        );


    if (
        !canvas ||
        typeof Chart === "undefined"
    ) {
        return;
    }


    if (pieChart) {

        pieChart.destroy();

        pieChart = null;

    }


    const categoryTotal = {};


    monthExpenses.forEach(
        expense => {

            const category =
                expense.category ||
                "Others";


            categoryTotal[category] =
                (
                    categoryTotal[category] ||
                    0
                ) +
                (
                    Number(
                        expense.amount
                    ) || 0
                );

        }
    );


    const labels =
        Object.keys(
            categoryTotal
        );


    const values =
        Object.values(
            categoryTotal
        );


    if (
        labels.length === 0
    ) {

        pieChart =
            new Chart(
                canvas,
                {

                    type: "doughnut",

                    data: {

                        labels: [
                            "No Expense"
                        ],

                        datasets: [{

                            data: [1],

                            backgroundColor: [
                                "#6b7280"
                            ],

                            borderWidth: 0

                        }]

                    },

                    options: {

                        responsive: true,

                        maintainAspectRatio:
                            false,

                        cutout: "72%",

                        plugins: {

                            legend: {

                                position:
                                    "bottom",

                                labels: {

                                    color:
                                        getChartTextColor()

                                }

                            }

                        }

                    }

                }
            );

        return;

    }


    pieChart =
        new Chart(
            canvas,
            {

                type: "doughnut",

                data: {

                    labels: labels,

                    datasets: [{

                        data: values,

                        backgroundColor: [

                            "#6366F1",
                            "#22C55E",
                            "#F59E0B",
                            "#EF4444",
                            "#06B6D4",
                            "#EC4899",
                            "#8B5CF6",
                            "#14B8A6"

                        ],

                        borderWidth: 2,

                        borderColor:
                            "#111827",

                        hoverOffset: 20

                    }]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    cutout: "68%",

                    plugins: {

                        legend: {

                            position:
                                "bottom",

                            labels: {

                                color:
                                    getChartTextColor(),

                                font: {

                                    size: 12,

                                    weight:
                                        "bold"

                                },

                                padding: 15

                            }

                        },

                        tooltip: {

                            callbacks: {

                                label:
                                    function (
                                        context
                                    ) {

                                        const total =
                                            context.dataset.data.reduce(
                                                (a, b) =>
                                                    a + b,
                                                0
                                            );


                                        const value =
                                            Number(
                                                context.raw
                                            ) || 0;


                                        const percent =
                                            total > 0
                                                ? (
                                                    value /
                                                    total *
                                                    100
                                                ).toFixed(1)
                                                : "0.0";


                                        return (
                                            context.label +
                                            " : " +
                                            reportCurrency(
                                                value
                                            ) +
                                            " (" +
                                            percent +
                                            "%)"
                                        );

                                    }

                            }

                        }

                    }

                }

            }
        );

}


// ======================================================
// ================= MONTHLY EXPENSE CHART ==============
// ======================================================

function loadMonthlyExpenseChart(
    totalExpense
) {

    const canvas =
        document.getElementById(
            "monthlyExpenseChart"
        );


    if (
        !canvas ||
        typeof Chart === "undefined"
    ) {
        return;
    }


    if (monthlyChart) {

        monthlyChart.destroy();

        monthlyChart = null;

    }


    const monthSelect =
        document.getElementById(
            "reportMonth"
        );


    let monthName =
        "Month";


    if (
        monthSelect &&
        monthSelect.selectedIndex >= 0
    ) {

        const option =
            monthSelect.options[
                monthSelect.selectedIndex
            ];


        if (option) {

            monthName =
                option.text;

        }

    }


    const ctx =
        canvas.getContext("2d");


    if (!ctx) {
        return;
    }


    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            350
        );


    gradient.addColorStop(
        0,
        "#8B5CF6"
    );


    gradient.addColorStop(
        1,
        "#6366F1"
    );


    monthlyChart =
        new Chart(
            ctx,
            {

                type: "bar",

                data: {

                    labels: [
                        monthName
                    ],

                    datasets: [{

                        label:
                            "This Month Expense",

                        data: [
                            Number(
                                totalExpense
                            ) || 0
                        ],

                        backgroundColor:
                            gradient,

                        borderRadius:
                            15,

                        borderSkipped:
                            false,

                        barThickness:
                            70

                    }]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        legend: {

                            display:
                                false

                        },

                        tooltip: {

                            callbacks: {

                                label:
                                    function (
                                        context
                                    ) {

                                        return (
                                            "Expense : " +
                                            reportCurrency(
                                                context.raw
                                            )
                                        );

                                    }

                            }

                        }

                    },

                    scales: {

                        x: {

                            grid: {
                                display: false
                            },

                            ticks: {

                                color:
                                    getChartTextColor(),

                                font: {

                                    size: 13,

                                    weight:
                                        "bold"

                                }

                            }

                        },

                        y: {

                            beginAtZero: true,

                            suggestedMax:
                                totalExpense > 0
                                    ? totalExpense * 1.25
                                    : 1000,

                            grid: {

                                color:
                                    getChartGridColor()

                            },

                            ticks: {

                                color:
                                    getChartTextColor(),

                                callback:
                                    value =>
                                        formatAxisValue(
                                            value
                                        )

                            }

                        }

                    }

                }

            }
        );

}


// ======================================================
// ================= SAVING TREND ========================
// ======================================================

function loadSavingTrendChart() {

    const canvas =
        document.getElementById(
            "savingTrendChart"
        );


    if (
        !canvas ||
        typeof Chart === "undefined"
    ) {
        return;
    }


    if (savingChart) {

        savingChart.destroy();

        savingChart = null;

    }


    const monthData = {};


    allIncome.forEach(
        income => {

            const date =
                getDateString(
                    income.date ||
                    income.created_at
                );


            if (!date) {
                return;
            }


            const month =
                date.substring(
                    0,
                    7
                );


            if (!monthData[month]) {

                monthData[month] = {
                    income: 0,
                    expense: 0
                };

            }


            monthData[month].income +=
                Number(
                    income.amount
                ) || 0;

        }
    );


    allExpenses.forEach(
        expense => {

            const date =
                getDateString(
                    expense.date ||
                    expense.created_at
                );


            if (!date) {
                return;
            }


            const month =
                date.substring(
                    0,
                    7
                );


            if (!monthData[month]) {

                monthData[month] = {
                    income: 0,
                    expense: 0
                };

            }


            monthData[month].expense +=
                Number(
                    expense.amount
                ) || 0;

        }
    );


    const months =
        Object.keys(
            monthData
        )
        .sort()
        .slice(-3);


    const labels = [];
    const values = [];


    months.forEach(
        month => {

            const saving =
                monthData[month].income -
                monthData[month].expense;


            const parts =
                month.split("-");


            labels.push(
                new Date(
                    Number(parts[0]),
                    Number(parts[1]) - 1,
                    1
                ).toLocaleString(
                    "en-US",
                    {
                        month: "short"
                    }
                )
            );


            values.push(
                saving
            );

        }
    );


    if (
        values.length === 0
    ) {

        labels.push(
            "No Data"
        );

        values.push(0);

    }


    const ctx =
        canvas.getContext(
            "2d"
        );


    if (!ctx) {
        return;
    }


    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            350
        );


    gradient.addColorStop(
        0,
        "rgba(34,197,94,0.45)"
    );


    gradient.addColorStop(
        1,
        "rgba(34,197,94,0)"
    );


    savingChart =
        new Chart(
            ctx,
            {

                type: "line",

                data: {

                    labels: labels,

                    datasets: [{

                        label:
                            "Monthly Saving",

                        data: values,

                        borderColor:
                            "#22C55E",

                        backgroundColor:
                            gradient,

                        fill: true,

                        tension: 0.4,

                        pointRadius: 7,

                        pointHoverRadius: 10,

                        pointBackgroundColor:
                            "#22C55E",

                        pointBorderColor:
                            "#ffffff",

                        pointBorderWidth: 3

                    }]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        legend: {
                            display: false
                        },

                        tooltip: {

                            callbacks: {

                                label:
                                    context =>
                                        " Saving : " +
                                        reportCurrency(
                                            context.raw
                                        )

                            }

                        }

                    },

                    scales: {

                        x: {

                            grid: {
                                display: false
                            },

                            ticks: {

                                color:
                                    getChartTextColor(),

                                font: {
                                    weight: "bold"
                                }

                            }

                        },

                        y: {

                            beginAtZero: true,

                            grid: {

                                color:
                                    getChartGridColor()

                            },

                            ticks: {

                                color:
                                    getChartTextColor(),

                                callback:
                                    value =>
                                        formatAxisValue(
                                            value
                                        )

                            }

                        }

                    }

                }

            }
        );

}


// ======================================================
// ================= INCOME VS EXPENSE ==================
// ======================================================

function loadIncomeExpenseChart(
    totalIncome,
    totalExpense
) {

    const canvas =
        document.getElementById(
            "incomeExpenseChart"
        );


    if (
        !canvas ||
        typeof Chart === "undefined"
    ) {
        return;
    }


    if (
        incomeExpenseChart
    ) {

        incomeExpenseChart.destroy();

        incomeExpenseChart = null;

    }


    const ctx =
        canvas.getContext(
            "2d"
        );


    if (!ctx) {
        return;
    }


    const values = [

        Number(totalIncome) || 0,

        Number(totalExpense) || 0

    ];


    const maxValue =
        Math.max(
            ...values
        );


    incomeExpenseChart =
        new Chart(
            ctx,
            {

                type: "bar",

                data: {

                    labels: [
                        "Income",
                        "Expense"
                    ],

                    datasets: [{

                        label:
                            "Amount",

                        data: values,

                        backgroundColor: [

                            "rgba(34,197,94,0.75)",

                            "rgba(239,68,68,0.75)"

                        ],

                        borderRadius: 18,

                        borderSkipped: false,

                        barThickness: 38

                    }]

                },

                options: {

                    indexAxis: "y",

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            display: false
                        },

                        tooltip: {

                            callbacks: {

                                label:
                                    context =>
                                        " " +
                                        reportCurrency(
                                            context.raw
                                        )

                            }

                        }

                    },

                    scales: {

                        x: {

                            beginAtZero: true,

                            suggestedMax:
                                maxValue > 0
                                    ? maxValue * 1.25
                                    : 1000,

                            grid: {

                                color:
                                    getChartGridColor()

                            },

                            ticks: {

                                color:
                                    getChartTextColor(),

                                callback:
                                    value =>
                                        formatAxisValue(
                                            value
                                        )

                            }

                        },

                        y: {

                            grid: {
                                display: false
                            },

                            ticks: {

                                color:
                                    getChartTextColor(),

                                font: {

                                    size: 14,

                                    weight:
                                        "bold"

                                }

                            }

                        }

                    }

                }

            }
        );

}


// ======================================================
// ================= AXIS VALUE FORMAT ==================
// ======================================================

function formatAxisValue(value) {

    const number =
        Number(value) || 0;


    if (
        number >= 10000000
    ) {

        return (
            "₹" +
            (
                number / 10000000
            ).toFixed(1) +
            "Cr"
        );

    }


    if (
        number >= 100000
    ) {

        return (
            "₹" +
            (
                number / 100000
            ).toFixed(1) +
            "L"
        );

    }


    if (
        number >= 1000
    ) {

        return (
            "₹" +
            (
                number / 1000
            ).toFixed(1) +
            "K"
        );

    }


    return (
        "₹" +
        number
    );

}