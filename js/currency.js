// ======================================================
// ============== EXPENSE TRACKER PRO ===================
// ================= CURRENCY SYSTEM =====================
// ============== GLOBAL CURRENCY VERSION ================
// ======================================================

"use strict";

// ======================================================
// ================= API CONFIG ==========================
// ======================================================

const CURRENCY_API_BASE =
    "https://expense-tracker-pro-production-b745.up.railway.app";


// ======================================================
// ================= EXCHANGE RATES ======================
// ======================================================

// Base currency = INR
// All expense/income values are stored as INR.
// These rates convert INR -> selected currency.
//
// NOTE:
// These are fixed rates.
// Live exchange rates can be added later.

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
// ================= CURRENCY NAMES ======================
// ======================================================

const currencyNames = {

    INR: "Indian Rupee",

    USD: "US Dollar",

    EUR: "Euro",

    GBP: "British Pound"

};


// ======================================================
// ================= USER EMAIL ==========================
// ======================================================

function getCurrencyUserEmail() {

    return (
        localStorage.getItem("userEmail") ||
        ""
    ).trim().toLowerCase();

}


// ======================================================
// ================= GET SAVED CURRENCY ==================
// ======================================================

function getSavedCurrency() {

    const saved =
        localStorage.getItem(
            "selectedCurrency"
        );

    if (
        saved &&
        currencySymbols[saved]
    ) {

        return saved;

    }

    return "INR";

}


// ======================================================
// ================= GET USER CURRENCY ===================
// ======================================================

function getUserCurrency() {

    // ------------------------------------------
    // FIRST: selectedCurrency
    // ------------------------------------------

    const savedCurrency =
        getSavedCurrency();

    if (
        savedCurrency &&
        currencySymbols[savedCurrency]
    ) {

        return savedCurrency;

    }


    // ------------------------------------------
    // SECOND: old profileData compatibility
    // ------------------------------------------

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


    // ------------------------------------------
    // DEFAULT
    // ------------------------------------------

    return "INR";

}


// ======================================================
// ================= SET USER CURRENCY ===================
// ======================================================

function setUserCurrency(currency) {

    currency =
        String(
            currency || "INR"
        )
        .trim()
        .toUpperCase();


    if (
        !currencySymbols[currency]
    ) {

        currency = "INR";

    }


    // ------------------------------------------
    // Save globally
    // ------------------------------------------

    localStorage.setItem(
        "selectedCurrency",
        currency
    );


    // ------------------------------------------
    // Update old profileData
    // ------------------------------------------

    try {

        const profile =
            JSON.parse(
                localStorage.getItem(
                    "profileData"
                )
            ) || {};

        profile.currency =
            currency;

        localStorage.setItem(
            "profileData",
            JSON.stringify(profile)
        );

    } catch {

        // Ignore old profileData errors

    }


    console.log(
        "Currency changed to:",
        currency
    );


    // ------------------------------------------
    // Refresh current page
    // ------------------------------------------

    refreshCurrencyDisplay();

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

    const selectedCurrency =
        currencySymbols[currency]
            ? currency
            : "INR";

    const rate =
        exchangeRates[
            selectedCurrency
        ] || 1;

    return value * rate;

}


// ======================================================
// ================= FORMAT CURRENCY =====================
// ======================================================

function formatCurrency(
    amount,
    currency = null
) {

    const selectedCurrency =
        currency &&
        currencySymbols[currency]
            ? currency
            : getUserCurrency();


    const convertedAmount =
        convertCurrency(
            amount,
            selectedCurrency
        );


    const symbol =
        currencySymbols[
            selectedCurrency
        ] || "₹";


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
// ============== FORMAT NUMBER ONLY ====================
// ======================================================

function formatCurrencyNumber(
    amount,
    currency = null
) {

    const selectedCurrency =
        currency &&
        currencySymbols[currency]
            ? currency
            : getUserCurrency();


    const convertedAmount =
        convertCurrency(
            amount,
            selectedCurrency
        );


    return convertedAmount.toLocaleString(
        "en-IN",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );

}


// ======================================================
// ================= GET SYMBOL ==========================
// ======================================================

function getCurrencySymbol(
    currency = null
) {

    const selectedCurrency =
        currency &&
        currencySymbols[currency]
            ? currency
            : getUserCurrency();

    return (
        currencySymbols[
            selectedCurrency
        ] || "₹"
    );

}


// ======================================================
// ================= GET NAME ============================
// ======================================================

function getCurrencyName(
    currency = null
) {

    const selectedCurrency =
        currency &&
        currencyNames[currency]
            ? currency
            : getUserCurrency();

    return (
        currencyNames[
            selectedCurrency
        ] || "Indian Rupee"
    );

}


// ======================================================
// ================= UPDATE ELEMENT ======================
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
// ============== UPDATE CURRENCY SYMBOLS ================
// ======================================================

function updateCurrencySymbols() {

    const symbol =
        getCurrencySymbol();


    document
        .querySelectorAll(
            "[data-currency-symbol]"
        )
        .forEach(
            element => {

                element.textContent =
                    symbol;

            }
        );

}


// ======================================================
// ============== UPDATE CURRENCY ELEMENTS ==============
// ======================================================

function updateCurrencyElements() {

    document
        .querySelectorAll(
            "[data-currency]"
        )
        .forEach(
            element => {

                const amount =
                    Number(
                        element.getAttribute(
                            "data-amount"
                        )
                    ) || 0;


                element.textContent =
                    formatCurrency(
                        amount
                    );

            }
        );


    updateCurrencySymbols();

}


// ======================================================
// ============== REFRESH DASHBOARD =====================
// ======================================================

function refreshCurrencyDisplay() {

    console.log(
        "Refreshing currency display..."
    );

    console.log(
        "Selected Currency:",
        getUserCurrency()
    );


    // ------------------------------------------
    // Dashboard totals
    // ------------------------------------------

    if (
        typeof calculateTotals ===
        "function"
    ) {

        calculateTotals();

    }


    // ------------------------------------------
    // Transactions
    // ------------------------------------------

    if (
        typeof displayTransactions ===
        "function"
    ) {

        displayTransactions();

    }


    // ------------------------------------------
    // Reports
    // ------------------------------------------

    if (
        typeof generateReport ===
        "function"
    ) {

        generateReport();

    }


    if (
        typeof updateReports ===
        "function"
    ) {

        updateReports();

    }


    // ------------------------------------------
    // Charts
    // ------------------------------------------

    if (
        typeof updateCharts ===
        "function"
    ) {

        updateCharts();

    }


    if (
        typeof renderCharts ===
        "function"
    ) {

        renderCharts();

    }


    // ------------------------------------------
    // Generic currency elements
    // ------------------------------------------

    updateCurrencyElements();


    console.log(
        "Currency display refreshed ✅"
    );

}


// ======================================================
// ================= LOAD PROFILE CURRENCY ===============
// ======================================================

async function loadUserCurrency() {

    const email =
        getCurrencyUserEmail();


    if (!email) {

        console.log(
            "No logged-in user. Currency = INR"
        );

        return "INR";

    }


    try {

        const response =
            await fetch(
                CURRENCY_API_BASE +
                "/api/profile/" +
                encodeURIComponent(email)
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load profile currency"
            );

        }


        const data =
            await response.json();


        if (
            data.success &&
            data.profile &&
            currencySymbols[
                data.profile.currency
            ]
        ) {

            const currency =
                data.profile.currency;


            // Save globally

            localStorage.setItem(
                "selectedCurrency",
                currency
            );


            // Keep profileData compatible

            try {

                const oldProfile =
                    JSON.parse(
                        localStorage.getItem(
                            "profileData"
                        )
                    ) || {};


                oldProfile.currency =
                    currency;


                localStorage.setItem(
                    "profileData",
                    JSON.stringify(
                        oldProfile
                    )
                );

            } catch {

                // Ignore

            }


            console.log(
                "Currency loaded from server:",
                currency
            );


            refreshCurrencyDisplay();


            return currency;

        }

    } catch (error) {

        console.warn(
            "Currency API load failed:",
            error.message
        );

    }


    return getUserCurrency();

}


// ======================================================
// ================= GLOBAL FUNCTIONS ====================
// ======================================================

window.getUserCurrency =
    getUserCurrency;

window.setUserCurrency =
    setUserCurrency;

window.getCurrencySymbol =
    getCurrencySymbol;

window.getCurrencyName =
    getCurrencyName;

window.convertCurrency =
    convertCurrency;

window.formatCurrency =
    formatCurrency;

window.formatCurrencyNumber =
    formatCurrencyNumber;

window.updateCurrencyElement =
    updateCurrencyElement;

window.updateCurrencySymbols =
    updateCurrencySymbols;

window.updateCurrencyElements =
    updateCurrencyElements;

window.refreshCurrencyDisplay =
    refreshCurrencyDisplay;

window.loadUserCurrency =
    loadUserCurrency;


// ======================================================
// ================= INITIAL LOAD ========================
// ======================================================

console.log(
    "======================================"
);

console.log(
    "Currency System Loaded Successfully ✅"
);

console.log(
    "Current Currency:",
    getUserCurrency()
);

console.log(
    "Symbol:",
    getCurrencySymbol()
);

console.log(
    "======================================"
);


// ======================================================
// ================= DOM READY ===========================
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        updateCurrencyElements();

        loadUserCurrency();

    }
);