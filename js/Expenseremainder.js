// ================= SMART EXPENSE REMINDER =================


// Get elements

const saveReminderBtn = document.getElementById("saveReminderBtn");

const reminderPopup = document.getElementById("reminderPopup");

const reminderMessage = document.getElementById("reminderMessage");

const acceptReminderBtn = document.getElementById("acceptReminderBtn");

const skipReminderBtn = document.getElementById("skipReminderBtn");



let currentReminder = null;




// ================= SAVE REMINDER =================


saveReminderBtn.addEventListener("click",()=>{


    const name = document.getElementById("reminderName").value;

    const amount = document.getElementById("reminderAmount").value;

    const category = document.getElementById("reminderCategory").value;

    const type = document.getElementById("reminderType").value;

    const time = document.getElementById("reminderTime").value;



    if(name==="" || amount==="" || time===""){

        alert("Please fill reminder details");

        return;

    }



    const reminder = {

        name:name,

        amount:Number(amount),

        category:category,

        type:type,

        time:time,

        lastAdded:""

    };



    localStorage.setItem(
        "expenseReminder",
        JSON.stringify(reminder)
    );



    alert("Reminder saved successfully 🔔");



    document.getElementById("reminderName").value="";

    document.getElementById("reminderAmount").value="";

});







// ================= NOTIFICATION PERMISSION =================



if("Notification" in window){


    if(Notification.permission !== "granted"){

        Notification.requestPermission();

    }


}








// ================= CHECK REMINDER =================



function checkReminder(){



const reminder = JSON.parse(

localStorage.getItem("expenseReminder")

);



if(!reminder){

    return;

}



const now = new Date();



const currentTime =

now.getHours().toString().padStart(2,"0")
+
":"
+
now.getMinutes().toString().padStart(2,"0");




const today =

now.toISOString().split("T")[0];





if(

currentTime === reminder.time &&

reminder.lastAdded !== today

){



showReminder(reminder);



}





// Browser open panna pending check


if(

reminder.lastAdded !== today &&

localStorage.getItem("pendingReminder")==="true"

){


showReminder(reminder);


}




}








// ================= SHOW REMINDER =================


function showReminder(reminder){


currentReminder = reminder;



reminderMessage.innerHTML =

`Did you spend ₹${reminder.amount} for ${reminder.name}?`;



reminderPopup.style.display="block";




// Browser Notification


if(Notification.permission==="granted"){


new Notification("Expense Reminder 🔔",{

body:

`Add ₹${reminder.amount} ${reminder.name} expense?`

});


}



}







// ================= ACCEPT REMINDER =================



acceptReminderBtn.addEventListener("click",()=>{


if(currentReminder){



    if(typeof addReminderExpense === "function"){


        addReminderExpense(currentReminder);


    }



    let reminder = JSON.parse(

    localStorage.getItem("expenseReminder")

    );



    reminder.lastAdded =

    new Date().toISOString().split("T")[0];



    localStorage.setItem(

    "expenseReminder",

    JSON.stringify(reminder)

    );



}



reminderPopup.style.display="none";

localStorage.removeItem("pendingReminder");


});









// ================= SKIP REMINDER =================


skipReminderBtn.addEventListener("click",()=>{


localStorage.setItem(

"pendingReminder",

"true"

);



reminderPopup.style.display="none";


});








// Check every minute

setInterval(

checkReminder,

60000

);



// Page open check

checkReminder();