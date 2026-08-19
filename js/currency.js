// ======================================================
// ================= CURRENCY SYSTEM =====================
// ======================================================

// ================= EXCHANGE RATES ======================
// Base currency = INR

const exchangeRates = {

    INR: 1,

    USD: 0.012,

    EUR: 0.011,

    GBP: 0.0095

};


// ================= CURRENCY SYMBOLS ====================

const currencySymbols = {

    INR: "₹",

    USD: "$",

    EUR: "€",

    GBP: "£"

};


// ======================================================
// ================= GET USER CURRENCY ==================
// ======================================================

function getUserCurrency() {

    try {

        const profile =
            JSON.parse(
                localStorage.getItem("profileData")
            );

        if (
            profile &&
            profile.currency &&
            currencySymbols[profile.currency]
        ) {

            return profile.currency;

        }

    } catch (error) {

        console.error(
            "Currency Profile Error:",
            error
        );

    }

    return "INR";

}


// ======================================================
// ================= CONVERT CURRENCY ===================
// ======================================================

function convertCurrency(amount, currency) {

    const value =
        Number(amount) || 0;

    const rate =
        exchangeRates[currency] || 1;

    return value * rate;

}


// ======================================================
// ================= FORMAT CURRENCY ====================
// ======================================================

function formatCurrency(amount) {

    const currency =
        getUserCurrency();

    const symbol =
        currencySymbols[currency] || "₹";

    const convertedAmount =
        convertCurrency(
            amount,
            currency
        );

    return (
        symbol +
        convertedAmount.toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )
    );

}


// ======================================================
// ============== UPDATE SINGLE ELEMENT ================
// ======================================================

function updateCurrencyElement(
    elementId,
    amount
) {

    const element =
        document.getElementById(elementId);

    if (element) {

        element.innerText =
            formatCurrency(amount);

    }

}


// ======================================================
// ============== UPDATE LOCAL STORAGE DATA =============
// ======================================================
// This function is kept for old pages which still use
// localStorage. Dashboard now uses MySQL and its own
// calculateTotals() function.

function updateCurrencyDisplay() {

    let income = 0;

    let totalExpense = 0;


    try {

        income =
            Number(
                localStorage.getItem("income")
            ) || 0;


        const expenses =
            JSON.parse(
                localStorage.getItem("expenses")
            ) || [];


        if (Array.isArray(expenses)) {

            totalExpense =
                expenses.reduce(
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

        }

    } catch (error) {

        console.error(
            "Local Currency Update Error:",
            error
        );

    }


    const balance =
        income -
        totalExpense;


    updateCurrencyElement(
        "totalIncome",
        income
    );


    updateCurrencyElement(
        "totalExpense",
        totalExpense
    );


    updateCurrencyElement(
        "totalBalance",
        balance
    );

}


// ======================================================
// ============== REFRESH CURRENCY DISPLAY ==============
// ======================================================

function refreshCurrencyDisplay() {

    updateCurrencyDisplay();

}


// ======================================================
// ================= NO AUTO UPDATE =====================
// ======================================================
// Dashboard uses MySQL data.
// Therefore we DO NOT automatically overwrite
// dashboard totals with localStorage data.
