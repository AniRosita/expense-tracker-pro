// ================= CURRENCY CONVERTER =================


// Default exchange rates (Base INR)

const exchangeRates = {

    INR: 1,

    USD: 0.012,

    EUR: 0.011,

    GBP: 0.0095

};



// Currency symbols

const currencySymbols = {

    INR:"₹",

    USD:"$",

    EUR:"€",

    GBP:"£"

};




// Convert Amount

function convertCurrency(amount, currency){

    let rate = exchangeRates[currency] || 1;

    return Number(amount) * rate;

}




// Get Selected Currency

function getUserCurrency(){

    let profile = JSON.parse(
        localStorage.getItem("profileData")
    );


    if(profile && profile.currency){

        return profile.currency;

    }


    return "INR";

}




// Format Currency

function formatCurrency(amount){


    let currency = getUserCurrency();


    let symbol = currencySymbols[currency];


    let convertedAmount = convertCurrency(
        amount,
        currency
    );


    return symbol + Number(convertedAmount).toFixed(2);


}




// Update All Money Values

function updateCurrencyDisplay(){


    let income =
    Number(localStorage.getItem("income")) || 0;



    let expenses =
    JSON.parse(localStorage.getItem("expenses")) || [];



    let totalExpense = expenses.reduce(
        (sum,item)=>sum + Number(item.amount),
        0
    );



    let balance = income - totalExpense;



    let incomeBox =
    document.getElementById("totalIncome");


    let expenseBox =
    document.getElementById("totalExpense");


    let balanceBox =
    document.getElementById("totalBalance");



    if(incomeBox){

        incomeBox.innerText =
        formatCurrency(income);

    }



    if(expenseBox){

        expenseBox.innerText =
        formatCurrency(totalExpense);

    }



    if(balanceBox){

        balanceBox.innerText =
        formatCurrency(balance);

    }



}



// Run Automatically

document.addEventListener(
"DOMContentLoaded",
()=>{

    updateCurrencyDisplay();

});