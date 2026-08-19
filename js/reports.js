// ======================================================
// ================= REPORT INITIALIZATION ===============
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

const API_BASE =
    "https://YOUR-RAILWAY-DOMAIN";


// ======================================================
// ================= CHART THEME =========================
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
// ================= PAGE LOAD ============================
// ======================================================

window.addEventListener(
    "DOMContentLoaded",
    () => {

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

        if (typeof Swal !== "undefined") {

            Swal.fire({

                icon: "warning",

                title: "Login Required",

                text: "Please login first."

            });

        } else {

            alert("Please login first.");

        }


        window.location.href =
            "index.html";

        return;

    }


    try {

        // ==================================================
        // ================= EXPENSE ========================
        // ==================================================

        const expenseRes =
            await fetch(

                `${API_BASE}/expenses/${encodeURIComponent(email)}`

            );


        if (!expenseRes.ok) {

            throw new Error(
                "Expense API Error: " +
                expenseRes.status
            );

        }


        const expenseData =
            await expenseRes.json();


        if (expenseData.success) {

            allExpenses =
                expenseData.expenses || [];

        } else {

            allExpenses = [];

        }


        // ==================================================
        // ================= INCOME =========================
        // ==================================================

        const incomeRes =
            await fetch(

                `${API_BASE}/income/${encodeURIComponent(email)}`

            );


        if (!incomeRes.ok) {

            throw new Error(
                "Income API Error: " +
                incomeRes.status
            );

        }


        const incomeData =
            await incomeRes.json();


        if (incomeData.success) {

            allIncome =
                incomeData.income || [];

        } else {

            allIncome = [];

        }


        // ==================================================
        // ================= LOAD FILTERS ===================
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


    }

    catch (error) {

        console.error(
            "Report Load Error:",
            error
        );


        if (typeof Swal !== "undefined") {

            Swal.fire({

                icon: "error",

                title: "Report Error",

                text:
                    "Unable to load report. Please try again."

            });

        } else {

            alert(
                "Unable to load report."
            );

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


    if (!reportYear) return;


    const years =
        new Set();


    // ================= EXPENSE YEARS ====================

    allExpenses.forEach(
        expense => {

            if (expense.date) {

                const year =
                    String(
                        expense.date
                    ).substring(0, 4);


                if (year) {

                    years.add(year);

                }

            }

        }
    );


    // ================= INCOME YEARS =====================

    allIncome.forEach(
        income => {

            const date =
                income.date ||
                income.created_at;


            if (date) {

                const year =
                    String(date)
                        .substring(0, 4);


                if (year) {

                    years.add(year);

                }

            }

        }
    );


    reportYear.innerHTML = "";


    const sortedYears =
        [...years].sort();


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


            reportYear.appendChild(
                option
            );

        }
    );


    if (sortedYears.length > 0) {

        reportYear.value =
            sortedYears[
                sortedYears.length - 1
            ];

    }

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


    const months =
        new Set();


    // ================= EXPENSE MONTHS ===================

    allExpenses.forEach(
        expense => {

            if (!expense.date) return;


            const date =
                String(
                    expense.date
                );


            if (
                date.startsWith(
                    selectedYear
                )
            ) {

                months.add(
                    date.substring(5, 7)
                );

            }

        }
    );


    // ================= INCOME MONTHS ====================

    allIncome.forEach(
        income => {

            const date =
                income.date ||
                income.created_at;


            if (!date) return;


            const dateString =
                String(date);


            if (
                dateString.startsWith(
                    selectedYear
                )
            ) {

                months.add(
                    dateString.substring(5, 7)
                );

            }

        }
    );


    reportMonth.innerHTML = "";


    const sortedMonths =
        [...months].sort();


    sortedMonths.forEach(
        month => {

            const monthName =
                new Date(
                    `${selectedYear}-${month}-01`
                ).toLocaleString(
                    "en-US",
                    {
                        month: "long"
                    }
                );


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                month;


            option.textContent =
                monthName;


            reportMonth.appendChild(
                option
            );

        }
    );


    if (sortedMonths.length > 0) {

        reportMonth.value =
            sortedMonths[
                sortedMonths.length - 1
            ];

    }

}


// ======================================================
// ================= FILTER EVENTS =======================
// ======================================================

document.addEventListener(
    "change",
    function (event) {


        if (
            event.target.id ===
            "reportYear"
        ) {

            loadAvailableMonths();

            generateReport();

        }


        if (
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


    // ==================================================
    // ================= EXPENSE FILTER =================
    // ==================================================

    const monthExpenses =
        allExpenses.filter(
            expense => {

                if (!expense.date) {

                    return false;

                }


                return String(
                    expense.date
                ).substring(0, 7)
                    === selectedMonth;

            }
        );


    // ==================================================
    // ================= INCOME FILTER ==================
    // ==================================================

    const monthIncome =
        allIncome.filter(
            income => {

                const date =
                    income.date ||
                    income.created_at;


                if (!date) {

                    return false;

                }


                return String(date)
                    .substring(0, 7)
                    === selectedMonth;

            }
        );


    // ==================================================
    // ================= TOTALS =========================
    // ==================================================

    const totalExpense =
        monthExpenses.reduce(
            (sum, item) => {

                return sum +
                    Number(
                        item.amount || 0
                    );

            },
            0
        );


    const totalIncome =
        monthIncome.reduce(
            (sum, item) => {

                return sum +
                    Number(
                        item.amount || 0
                    );

            },
            0
        );


    const balance =
        totalIncome -
        totalExpense;


    // ==================================================
    // ================= FORMAT CURRENCY ===============
    // ==================================================

    function currency(value) {

        if (
            typeof formatCurrency ===
            "function"
        ) {

            return formatCurrency(
                value
            );

        }


        return (
            "₹" +
            Number(value || 0)
                .toLocaleString(
                    "en-IN",
                    {
                        minimumFractionDigits: 2
                    }
                )
        );

    }


    // ==================================================
    // ================= UPDATE CARDS ===================
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
            currency(totalIncome);

    }


    if (reportExpense) {

        reportExpense.innerText =
            currency(totalExpense);

    }


    if (reportBalance) {

        reportBalance.innerText =
            currency(balance);

    }


    if (totalSavings) {

        totalSavings.innerText =
            currency(balance);

    }


    // ==================================================
    // ================= HIGHEST EXPENSE ================
    // ==================================================

    const highestExpense =
        monthExpenses.length > 0

            ? Math.max(
                ...monthExpenses.map(
                    item =>
                        Number(
                            item.amount || 0
                        )
                )
            )

            : 0;


    const highestExpenseElement =
        document.getElementById(
            "highestExpense"
        );


    if (highestExpenseElement) {

        highestExpenseElement.innerText =
            currency(highestExpense);

    }


    // ==================================================
    // ================= TOP CATEGORY ===================
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


    let topCategory = "-";

    let maxCount = 0;


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


    if (topCategoryElement) {

        topCategoryElement.innerText =
            topCategory;

    }


    // ==================================================
    // ================= TRANSACTIONS ===================
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
    // ================= FINANCIAL SCORE ================
    // ==================================================

    let score = 100;


    if (totalIncome > 0) {

        score =
            Math.max(
                0,
                Math.round(
                    100 -
                    (
                        totalExpense /
                        totalIncome
                    ) * 100
                )
            );

    }


    const financialScore =
        document.getElementById(
            "financialScore"
        );


    if (financialScore) {

        financialScore.innerText =
            score + "/100";

    }


    // ==================================================
    // ================= SMART SUGGESTION ===============
    // ==================================================

    const suggestion =
        document.getElementById(
            "smartSuggestion"
        );


    if (suggestion) {

        if (score >= 80) {

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
    // ================= LOAD CHARTS =====================
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


    if (!canvas) return;


    if (pieChart) {

        pieChart.destroy();

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
                Number(
                    expense.amount || 0
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


    if (labels.length === 0) {

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

                        maintainAspectRatio: false,

                        cutout: "72%",

                        plugins: {

                            legend: {

                                position: "bottom",

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

                    maintainAspectRatio: false,

                    cutout: "68%",

                    animation: {

                        animateRotate: true,

                        duration: 1200

                    },

                    plugins: {

                        legend: {

                            position: "bottom",

                            labels: {

                                color:
                                    getChartTextColor(),

                                font: {

                                    size: 12,

                                    weight: "bold"

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
                                            context.dataset.data
                                                .reduce(
                                                    (
                                                        a,
                                                        b
                                                    ) =>
                                                        a +
                                                        b,
                                                    0
                                                );


                                        const value =
                                            context.raw;


                                        const percent =
                                            (
                                                value /
                                                total *
                                                100
                                            ).toFixed(1);


                                        return (
                                            context.label +
                                            " : ₹" +
                                            Number(
                                                value
                                            ).toLocaleString(
                                                "en-IN"
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


    if (!canvas) return;


    if (monthlyChart) {

        monthlyChart.destroy();

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

        monthName =
            monthSelect
                .options[
                    monthSelect.selectedIndex
                ]
                .text;

    }


    const ctx =
        canvas.getContext("2d");


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
                            totalExpense
                        ],

                        backgroundColor:
                            gradient,

                        borderRadius: 15,

                        borderSkipped:
                            false,

                        barThickness: 70

                    }]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    animation: {

                        duration: 1500,

                        easing:
                            "easeOutQuart"

                    },

                    plugins: {

                        legend: {

                            display: false

                        },

                        tooltip: {

                            callbacks: {

                                label:
                                    function (
                                        context
                                    ) {

                                        return (
                                            "Expense : ₹" +
                                            Number(
                                                context.raw
                                            ).toLocaleString(
                                                "en-IN"
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
                                    function (
                                        value
                                    ) {

                                        if (
                                            value >=
                                            10000000
                                        ) {

                                            return (
                                                "₹" +
                                                (
                                                    value /
                                                    10000000
                                                ).toFixed(
                                                    1
                                                ) +
                                                "Cr"
                                            );

                                        }


                                        if (
                                            value >=
                                            100000
                                        ) {

                                            return (
                                                "₹" +
                                                (
                                                    value /
                                                    100000
                                                ).toFixed(
                                                    1
                                                ) +
                                                "L"
                                            );

                                        }


                                        if (
                                            value >=
                                            1000
                                        ) {

                                            return (
                                                "₹" +
                                                (
                                                    value /
                                                    1000
                                                ).toFixed(
                                                    1
                                                ) +
                                                "K"
                                            );

                                        }


                                        return (
                                            "₹" +
                                            value
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
// ================= SAVING TREND ========================
// ======================================================

function loadSavingTrendChart() {

    const canvas =
        document.getElementById(
            "savingTrendChart"
        );


    if (!canvas) return;


    if (savingChart) {

        savingChart.destroy();

    }


    const monthData = {};


    // ================= INCOME ===========================

    allIncome.forEach(
        income => {

            const date =
                income.date ||
                income.created_at;


            if (!date) return;


            const month =
                String(date)
                    .substring(0, 7);


            if (!monthData[month]) {

                monthData[month] = {

                    income: 0,

                    expense: 0

                };

            }


            monthData[month].income +=
                Number(
                    income.amount || 0
                );

        }
    );


    // ================= EXPENSE ==========================

    allExpenses.forEach(
        expense => {

            if (!expense.date) return;


            const month =
                String(expense.date)
                    .substring(0, 7);


            if (!monthData[month]) {

                monthData[month] = {

                    income: 0,

                    expense: 0

                };

            }


            monthData[month].expense +=
                Number(
                    expense.amount || 0
                );

        }
    );


    // ================= LAST 3 MONTHS ====================

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


            labels.push(

                new Date(
                    month + "-01"
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


    if (values.length === 0) {

        labels.push(
            "No Data"
        );

        values.push(0);

    }


    const ctx =
        canvas.getContext("2d");


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


    const maxValue =
        Math.max(
            ...values
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

                    animation: {

                        duration: 1500

                    },

                    plugins: {

                        legend: {

                            display: false

                        },

                        tooltip: {

                            callbacks: {

                                label:
                                    function (
                                        context
                                    ) {

                                        return (
                                            " Saving : ₹" +
                                            Number(
                                                context.raw
                                            ).toLocaleString(
                                                "en-IN"
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

                                    weight:
                                        "bold"

                                }

                            }

                        },

                        y: {

                            beginAtZero: true,

                            suggestedMax:
                                maxValue > 0
                                    ? Math.ceil(
                                        maxValue /
                                        1000
                                    ) * 1000 + 2000
                                    : 5000,

                            grid: {

                                color:
                                    getChartGridColor()

                            },

                            ticks: {

                                color:
                                    getChartTextColor(),

                                callback:
                                    function (
                                        value
                                    ) {

                                        if (
                                            value >=
                                            10000000
                                        ) {

                                            return (
                                                "₹" +
                                                (
                                                    value /
                                                    10000000
                                                ).toFixed(
                                                    1
                                                ) +
                                                "Cr"
                                            );

                                        }


                                        if (
                                            value >=
                                            100000
                                        ) {

                                            return (
                                                "₹" +
                                                (
                                                    value /
                                                    100000
                                                ).toFixed(
                                                    1
                                                ) +
                                                "L"
                                            );

                                        }


                                        if (
                                            value >=
                                            1000
                                        ) {

                                            return (
                                                "₹" +
                                                (
                                                    value /
                                                    1000
                                                ).toFixed(
                                                    1
                                                ) +
                                                "K"
                                            );

                                        }


                                        return (
                                            "₹" +
                                            value
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


    if (!canvas) return;


    if (incomeExpenseChart) {

        incomeExpenseChart.destroy();

    }


    const ctx =
        canvas.getContext("2d");


    const values = [

        totalIncome,

        totalExpense

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

                        borderSkipped:
                            false,

                        barThickness: 38

                    }]

                },

                options: {

                    indexAxis: "y",

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    animation: {

                        duration: 1400,

                        easing:
                            "easeOutQuart"

                    },

                    plugins: {

                        legend: {

                            display: false

                        },

                        tooltip: {

                            callbacks: {

                                label:
                                    function (
                                        context
                                    ) {

                                        return (
                                            " ₹" +
                                            Number(
                                                context.raw
                                            ).toLocaleString(
                                                "en-IN"
                                            )
                                        );

                                    }

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
                                    function (
                                        value
                                    ) {

                                        return (
                                            "₹" +
                                            Number(
                                                value
                                            ).toLocaleString(
                                                "en-IN"
                                            )
                                        );

                                    }

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