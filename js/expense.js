let expenses =
JSON.parse(localStorage.getItem("expenses")) || [];



const monthFilter =
document.getElementById("monthFilter");


const yearFilter =
document.getElementById("yearFilter");


const history =
document.getElementById("expenseHistory");


const totalExpense =
document.getElementById("totalExpense");


// AMOUNT FILTER

const amountType =
document.getElementById("amountFilter");


const amountValue =
document.getElementById("amountValue");





// YEAR CREATE

let years=[];


expenses.forEach(item=>{


let year =
new Date(item.date).getFullYear();


if(!years.includes(year)){

years.push(year);

}

});



years.forEach(year=>{


let option=document.createElement("option");

option.value=year;

option.innerText=year;


yearFilter.appendChild(option);


});







function showExpense(){


history.innerHTML="";


let total=0;



let month =
monthFilter.value;


let year =
yearFilter.value;



let filteredExpenses=[...expenses];





// MONTH + YEAR FILTER

filteredExpenses =
filteredExpenses.filter(item=>{


let date =
new Date(item.date);


let itemMonth =
date.getMonth();


let itemYear =
date.getFullYear();



return (

(month==="all" || month==itemMonth)

&&

(year==="all" || year==itemYear)

);


});






// CUSTOM AMOUNT FILTER


let amount =
Number(amountValue.value);



if(
amountType &&
amountType.value==="below"
&&
amount
){


filteredExpenses =
filteredExpenses.filter(item=>{


return Number(item.amount) < amount;


});


}




else if(

amountType &&
amountType.value==="above"

&&

amount

){


filteredExpenses =
filteredExpenses.filter(item=>{


return Number(item.amount) > amount;


});


}








// DISPLAY HISTORY


filteredExpenses.forEach((item)=>{


let date =
new Date(item.date);



let itemYear =
date.getFullYear();




total += Number(item.amount);




history.innerHTML +=`


<div class="expense-card">


<div class="line">


<h3>
${item.name}
</h3>


<p>
₹${item.amount}
</p>


</div>



<p>
Category : ${item.category}
</p>



<span>
${date.getDate()} 
${date.toLocaleString(
'default',
{
month:'long'
}
)}
 ${itemYear}
</span>



</div>


`;



});




totalExpense.innerText =
"₹"+total;



}







monthFilter.addEventListener(
"change",
showExpense
);


yearFilter.addEventListener(
"change",
showExpense
);



if(amountType){

amountType.addEventListener(
"change",
showExpense
);

}



if(amountValue){

amountValue.addEventListener(
"input",
showExpense
);

}









// PDF DOWNLOAD


document
.getElementById("downloadPdf")
.onclick=function(){


const {jsPDF}=window.jspdf;


let pdf=new jsPDF();



pdf.text(
"Expense Tracker Report",
20,
20
);



let y=40;



expenses.forEach(item=>{


pdf.text(

`${item.name} - ₹${item.amount} - ${item.category}`,

20,

y

);



y+=10;


});



pdf.save(
"Expense_Report.pdf"
);



};









// EXCEL DOWNLOAD


document
.getElementById("downloadExcel")
.onclick=function(){



let data = expenses.map(item=>{


return{


Name:item.name,

Amount:item.amount,

Category:item.category,

Date:item.date


};



});





let sheet =
XLSX.utils.json_to_sheet(data);



let book =
XLSX.utils.book_new();




XLSX.utils.book_append_sheet(

book,

sheet,

"Expenses"

);




XLSX.writeFile(

book,

"Expense_Report.xlsx"

);



};









// VIEW REPORT


document
.getElementById("viewReport")
.onclick=function(){


window.open(

"expense.html",

"_blank"

);


};








function goDashboard(){

window.location.href="dashboard.html";

}






showExpense();
// LOAD SAVED THEME

if(localStorage.getItem("theme") === "light"){

    document.body.classList.add("light-mode");

}
