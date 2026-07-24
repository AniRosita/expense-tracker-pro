const loginForm = document.getElementById("loginForm");

if(loginForm){

loginForm.addEventListener("submit", async function(e){

e.preventDefault();

const email =
document.getElementById("email").value.trim();

const password =
document.getElementById("password").value.trim();

if(email === "" || password === ""){

Swal.fire({
title:"Missing Fields!",
text:"Please fill all fields",
icon:"warning",
confirmButtonColor:"#4f46e5"
});

return;

}

const gmailPattern =
/^[a-zA-Z0-9._%+-]+@gmail\.com$/;

if(!gmailPattern.test(email)){

Swal.fire({
title:"Invalid Email!",
text:"Only Gmail address allowed",
icon:"error",
confirmButtonColor:"#4f46e5"
});

return;

}

const passwordPattern =
/^\d{6}$/;

if(!passwordPattern.test(password)){

Swal.fire({
title:"Invalid Password!",
text:"Password must be exactly 6 digits",
icon:"error",
confirmButtonColor:"#4f46e5"
});

return;

}

const users =
JSON.parse(localStorage.getItem("users")) || [];

const user = users.find(
u => u.email === email &&
u.password === password
);

if(user){

localStorage.setItem(
"userEmail",
email
);

localStorage.setItem(
"gmailProfile",
"assets/profile.png"
);

const message =
document.getElementById("message");

if(message){

message.innerHTML =
"Login Successful ✅";

}

Swal.fire({
title:"Login Successful!",
text:"Welcome Back",
icon:"success",
confirmButtonColor:"#4f46e5"
});

setTimeout(()=>{

window.location.href =
"dashboard.html";

},1000);

}
else{

Swal.fire({
title:"Login Failed!",
text:"Invalid Email or Password",
icon:"error",
confirmButtonColor:"#4f46e5"
});

}

});

}