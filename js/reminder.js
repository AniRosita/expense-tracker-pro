// ================= SMART EXPENSE REMINDER =================

const saveReminderBtn=document.getElementById("saveReminderBtn");
const reminderPopup=document.getElementById("reminderPopup");
const reminderMessage=document.getElementById("reminderMessage");
const acceptReminderBtn=document.getElementById("acceptReminderBtn");
const skipReminderBtn=document.getElementById("skipReminderBtn");

let currentReminder=null;


// ================= SAVE REMINDER =================

if(saveReminderBtn){

saveReminderBtn.addEventListener("click",()=>{

const name=document.getElementById("reminderName").value;
const amount=document.getElementById("reminderAmount").value;
const category=document.getElementById("reminderCategory").value;
const type=document.getElementById("reminderType").value;
const time=document.getElementById("reminderTime").value;

if(name===""||amount===""||time===""){
alert("Please fill reminder details");
return;
}

const reminder={
id:Date.now(),
name:name,
amount:Number(amount),
category:category,
type:type,
time:time,
lastAdded:""
};

let reminders=JSON.parse(
localStorage.getItem("expenseReminders")
)||[];

reminders.push(reminder);

localStorage.setItem(
"expenseReminders",
JSON.stringify(reminders)
);

alert("Reminder Saved Successfully 🔔");

document.getElementById("reminderName").value="";
document.getElementById("reminderAmount").value="";

});

}
// ================= NOTIFICATION =================

if("Notification" in window){

if(Notification.permission!=="granted"){

Notification.requestPermission();

}

}


// ================= CHECK REMINDER =================

function checkReminder(){

let reminders=JSON.parse(
localStorage.getItem("expenseReminders")
)||[];


const now=new Date();


const currentTime=
now.getHours()
.toString()
.padStart(2,"0")
+":"
+
now.getMinutes()
.toString()
.padStart(2,"0");


const today=
now.toISOString()
.split("T")[0];


reminders.forEach((reminder)=>{


if(
currentTime === reminder.time &&
reminder.lastAdded !== today
){

showReminder(reminder);

}


});


}


// ================= SHOW POPUP =================

function showReminder(reminder){

currentReminder=reminder;


reminderMessage.innerHTML=
`
Did you spend ₹${reminder.amount}
for ${reminder.name}?
`;


if(reminderPopup){

reminderPopup.style.display="block";

}


if(Notification.permission==="granted"){

new Notification(
"Expense Reminder 🔔",
{
body:
`Add ₹${reminder.amount} ${reminder.name} expense?`
}
);

}


}


/// ================= ACCEPT REMINDER =================

if(acceptReminderBtn){

acceptReminderBtn.addEventListener("click",()=>{

if(currentReminder){

if(typeof addReminderExpense==="function"){

addReminderExpense(currentReminder);

}

let reminders=JSON.parse(
localStorage.getItem("expenseReminders")
)||[];

reminders=reminders.map((item)=>{

if(item.id===currentReminder.id){

item.lastAdded=
new Date()
.toISOString()
.split("T")[0];

}

return item;

});

localStorage.setItem(
"expenseReminders",
JSON.stringify(reminders)
);

if(currentReminder.type==="onetime"){

reminders=reminders.filter(
item=>item.id!==currentReminder.id
);

localStorage.setItem(
"expenseReminders",
JSON.stringify(reminders)
);

}

}

if(reminderPopup){

reminderPopup.style.display="none";

}

});

}
// ================= SKIP REMINDER =================

if(skipReminderBtn){

skipReminderBtn.addEventListener("click",()=>{

if(reminderPopup){

reminderPopup.style.display="none";

}

});

}


// ================= AUTO CHECK =================

setInterval(
checkReminder,
60000
);


// ================= FIRST LOAD =================

checkReminder();