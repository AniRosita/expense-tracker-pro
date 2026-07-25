// ===================== LOAD DATA =====================

let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

const monthFilter = document.getElementById("monthFilter");
const yearFilter = document.getElementById("yearFilter");
const history = document.getElementById("expenseHistory");
const totalExpense = document.getElementById("totalExpense");

const amountType = document.getElementById("amountFilter");
const amountValue = document.getElementById("amountValue");


// ===================== PAGINATION =====================

const recordsPerPage = 50;

let currentPage = 1;

let filteredExpenses = [];


// ===================== YEAR LIST =====================

let years = [];

expenses.forEach(item=>{

    let date = new Date(item.date);

    if(!isNaN(date)){

        let year = date.getFullYear();

        if(!years.includes(year)){

            years.push(year);

        }

    }

});


years.sort((a,b)=>a-b);


years.forEach(year=>{

    let option = document.createElement("option");

    option.value = year;

    option.innerText = year;

    yearFilter.appendChild(option);

});



// ===================== FILTER FUNCTION =====================

function filterExpenses(){

    let month = monthFilter.value;

    let year = yearFilter.value;


    let amount =
    Number(amountValue?.value || 0);


    filteredExpenses = expenses.filter(item=>{


        let date = new Date(item.date);


        if(isNaN(date)) return false;


        let itemMonth = date.getMonth();

        let itemYear = date.getFullYear();



        let matchMonth =
        month==="all" ||
        Number(month)===itemMonth;



        let matchYear =
        year==="all" ||
        Number(year)===itemYear;



        let matchAmount = true;



        if(amountType && amountType.value==="below" && amount){

            matchAmount =
            Number(item.amount) < amount;

        }



        if(amountType && amountType.value==="above" && amount){

            matchAmount =
            Number(item.amount) > amount;

        }



        return (
            matchMonth &&
            matchYear &&
            matchAmount
        );


    });


}



// ===================== SHOW EXPENSE =====================

function showExpense(){


    filterExpenses();


    history.innerHTML="";


    let total = 0;


    filteredExpenses.forEach(item=>{

        total += Number(item.amount) || 0;

    });


    totalExpense.innerText = "₹"+total;



    let startIndex =
    (currentPage-1)*recordsPerPage;



    let endIndex =
    startIndex+recordsPerPage;



    let pageExpenses =
    filteredExpenses.slice(
        startIndex,
        endIndex
    );



    let html="";



    pageExpenses.forEach(item=>{


        let date = new Date(item.date);



        html += `

        <div class="expense-card">


            <div class="line">

                <h3>${item.name}</h3>

                <p>₹${item.amount}</p>

            </div>



            <p>
            Category : ${item.category}
            </p>



            <span>

            ${date.getDate()}
            ${date.toLocaleString(
            'default',
            {month:'long'}
            )}

            ${date.getFullYear()}

            </span>


        </div>


        `;


    });



    // FIXED EMPTY EXPENSE CHECK

    if(pageExpenses.length===0){

        history.innerHTML =
        "<h3>No Expenses Found</h3>";

    }else{

        history.innerHTML = html;

    }



    createPagination();


}
// ===================== PAGINATION =====================

function createPagination(){


    const oldPagination =
    document.getElementById("pagination");


    if(oldPagination){

        oldPagination.remove();

    }



    let totalPages =
    Math.ceil(
        filteredExpenses.length /
        recordsPerPage
    );



    if(totalPages <= 1){

        return;

    }



    let pagination =
    document.createElement("div");



    pagination.id="pagination";



    pagination.style.textAlign="center";

    pagination.style.marginTop="20px";



    pagination.innerHTML = `

        <button id="prevBtn">
        ◀ Previous
        </button>


        <span style="margin:0 15px;">

        Page ${currentPage}
        of
        ${totalPages}

        </span>


        <button id="nextBtn">
        Next ▶
        </button>

    `;



    history.after(pagination);




    document
    .getElementById("prevBtn")
    .onclick=function(){


        if(currentPage>1){

            currentPage--;

            showExpense();

        }


    };





    document
    .getElementById("nextBtn")
    .onclick=function(){


        if(currentPage<totalPages){

            currentPage++;

            showExpense();

        }


    };



}





// ===================== FILTER EVENTS =====================


monthFilter.addEventListener("change",()=>{


    currentPage=1;

    showExpense();


});





yearFilter.addEventListener("change",()=>{


    currentPage=1;

    showExpense();


});





if(amountType){


    amountType.addEventListener("change",()=>{


        currentPage=1;

        showExpense();


    });


}





if(amountValue){


    amountValue.addEventListener("input",()=>{


        currentPage=1;

        showExpense();


    });


}





// ===================== PDF DOWNLOAD =====================


const pdfBtn =
document.getElementById("downloadPdf");



if(pdfBtn){


pdfBtn.onclick=function(){


    const {jsPDF}=window.jspdf;



    let pdf=new jsPDF();



    pdf.setFontSize(18);



    pdf.text(
    "Expense Tracker Report",
    20,
    20
    );



    let y=35;



    filterExpenses();



    filteredExpenses.forEach(item=>{


        if(y>270){


            pdf.addPage();

            y=20;


        }



        pdf.text(

        `${item.name} | ₹${item.amount} | ${item.category} | ${item.date}`,

        20,

        y

        );



        y+=10;



    });



    pdf.save(
    "Expense_Report.pdf"
    );


};


}





// ===================== EXCEL DOWNLOAD =====================


const excelBtn =
document.getElementById("downloadExcel");



if(excelBtn){


excelBtn.onclick=function(){


    filterExpenses();



    let data =
    filteredExpenses.map(item=>({


        Name:item.name,

        Amount:item.amount,

        Category:item.category,

        Date:item.date


    }));



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


}
// ===================== VIEW REPORT =====================

const reportBtn =
document.getElementById("viewReport");


if(reportBtn){


reportBtn.onclick=function(){


    showExpense();


};


}





// ===================== DASHBOARD =====================


function goDashboard(){


    window.location.href="dashboard.html";


}






// ===================== LOAD PAGE =====================


showExpense();




// ===================== THEME =====================


if(localStorage.getItem("theme")==="light"){


    document.body.classList.add("light-mode");


}