// ======================================================
// ================= CURRENCY SYSTEM =====================
// ======================================================

// Base currency = INR
// Dashboard data is stored in INR.
// Display currency is selected from profileData.

// ======================================================
// ================= EXCHANGE RATES ======================
// ======================================================

const exchangeRates = {

    INR: 1,

    USD: 0.012,

    EUR: 0.011,

    GBP: 0.0095

};


// ======================================================
// ================= CURRENCY SYMBOLS ====================
// ======================================================

const currencySymbols = {

    INR: "₹",

    USD: "$",

    EUR: "€",

    GBP: "£"

};


// ======================================================
// ================= GET USER CURRENCY ===================
// ======================================================

function getUserCurrency() {

    try {

        const profile =
            JSON.parse(
                localStorage.getItem(
                    "profileData"
                )
            );

        if (
            profile &&
            profile.currency &&
            currencySymbols[
                profile.currency
            ]
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
// ================= CONVERT CURRENCY ====================
// ======================================================

function convertCurrency(
    amount,
    currency
) {

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
// ================= UPDATE ELEMENT =====================
// ======================================================

function updateCurrencyElement(
    elementId,
    amount
) {

    const element =
        document.getElementById(
            elementId
        );

    if (element) {

        element.textContent =
            formatCurrency(
                amount
            );

    }

}


// ======================================================
// ============== REFRESH DASHBOARD =====================
// ======================================================

function refreshCurrencyDisplay() {

    // Dashboard gets real data from MySQL.
    // Therefore we DO NOT read old localStorage
    // income/expenses data here.

    if (
        typeof calculateTotals ===
        "function"
    ) {

        calculateTotals();

    }

    if (
        typeof displayTransactions ===
        "function"
    ) {

        displayTransactions();

    }

}


// ======================================================
// ================= GLOBAL FUNCTIONS ===================
// ======================================================

window.getUserCurrency =
    getUserCurrency;

window.convertCurrency =
    convertCurrency;

window.formatCurrency =
    formatCurrency;

window.updateCurrencyElement =
    updateCurrencyElement;

window.refreshCurrencyDisplay =
    refreshCurrencyDisplay;


// ======================================================
// ================= READY ===============================
// ======================================================

console.log(
    "Currency System Loaded Successfully ✅"
);

console.log(
    "Selected Currency:",
    getUserCurrency()
);