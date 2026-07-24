// Load Profile Data

let userEmail = localStorage.getItem("userEmail");
if(!userEmail){

    window.location.href="index.html";
}
// Profile Image Load

const profileImg =
document.getElementById("profileImg");

const profileUpload =
document.getElementById("profileUpload");


let savedImage =
localStorage.getItem("profileImage");


const profileLetter = document.getElementById("profileLetter");


if(savedImage){

    profileImg.src = savedImage;
    profileImg.style.display="block";

    if(profileLetter)
    profileLetter.style.display="none";

}
else{

    profileImg.style.display="none";

    if(profileLetter){

        let name = 
        document.getElementById("profileName")?.value || "User";

        profileLetter.innerText =
        name.charAt(0).toUpperCase();

        profileLetter.style.display="flex";

    }

}



if(profileUpload){

profileUpload.addEventListener("change",function(){

    const reader = new FileReader();


    reader.onload = function(e){

        profileImg.src = e.target.result;


        localStorage.setItem(
            "profileImage",
            e.target.result
        );

    }


    reader.readAsDataURL(this.files[0]);


});

}

document.getElementById("profileEmail").value = userEmail;



let savedProfile = JSON.parse(localStorage.getItem("profileData"));



if(savedProfile){


document.getElementById("profileName").value =
savedProfile.name || "";


document.getElementById("profileCountry").value =
savedProfile.country || "";


document.getElementById("profileCurrency").value =
savedProfile.currency || "INR";


document.getElementById("minimumBalance").value =
savedProfile.minimumBalance || "";


// Profile First Letter

let letter = document.getElementById("profileLetter");

if(letter && savedProfile.name){

    letter.innerText =
    savedProfile.name.charAt(0).toUpperCase();

}


}

// Expense Calculation


let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

let income = Number(localStorage.getItem("income")) || 0;



let totalExpense = expenses.reduce((sum,item)=>{

    return sum + Number(item.amount);

},0);



let balance = income - totalExpense;



document.getElementById("totalIncome").innerText =
formatCurrency(income);


document.getElementById("totalExpense").innerText =
formatCurrency(totalExpense);


document.getElementById("totalBalance").innerText =
formatCurrency(balance);



// Save Profile


document.getElementById("saveProfile")
.addEventListener("click",()=>{


let profile = {


name:
document.getElementById("profileName").value,


country:
document.getElementById("profileCountry").value,


currency:
document.getElementById("profileCurrency").value,


minimumBalance:
document.getElementById("minimumBalance").value


};



localStorage.setItem(
"profileData",
JSON.stringify(profile)
);



Swal.fire({
    title:"Success!",
    text:"Profile Saved Successfully ✅",
    icon:"success",
    confirmButtonColor:"#4f46e5"
});
window.location.href="dashboard.html";



});




// Back Dashboard

function goDashboard(){

window.location.href="dashboard.html";

}
// LOAD SAVED THEME

if(localStorage.getItem("theme") === "light"){

    document.body.classList.add("light-mode");

}
// ================= PROFILE IMAGE OPTIONS =================


function openImagePopup(){

    document.getElementById("imageOptions").style.display="flex";

}



function closeImagePopup(){

    document.getElementById("imageOptions").style.display="none";

}
function changeProfileImage(){

    let upload = document.getElementById("profileUpload");

    if(upload){

        upload.click();

    }

    closeImagePopup();

}


function viewProfileImage(){

    let img = document.getElementById("profileImg");

    if(img){

        let popup = window.open("");

        popup.document.write(`
        
        <html>
        <body style="
        margin:0;
        background:#111827;
        height:100vh;
        display:flex;
        flex-direction:column;
        justify-content:center;
        align-items:center;
        ">

        <img src="${img.src}"
        style="
        width:400px;
        height:400px;
        object-fit:cover;
        border-radius:20px;
        ">


        <button onclick="window.close()"
        style="
        margin-top:25px;
        padding:12px 30px;
        border:none;
        border-radius:10px;
        background:#4f46e5;
        color:white;
        cursor:pointer;
        font-size:16px;
        ">
        ← Back
        </button>


        </body>
        </html>

        `);

    }

}
// REMOVE PROFILE IMAGE

function removeProfileImage(){

    localStorage.removeItem("profileImage");


    let img = document.getElementById("profileImg");
    let letter = document.getElementById("profileLetter");


    if(img){

        img.style.display="none";

    }


    if(letter){

        let name =
        document.getElementById("profileName").value || "User";

        letter.innerText =
        name.charAt(0).toUpperCase();

        letter.style.display="flex";

    }


    closeImagePopup();

}