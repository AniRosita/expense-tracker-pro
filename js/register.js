const registerForm =
document.getElementById("registerForm");

if(registerForm){

registerForm.addEventListener("submit",async(e)=>{

e.preventDefault();

const name =
document.getElementById("name").value.trim();

const email =
document.getElementById("email").value.trim();

const password =
document.getElementById("password").value.trim();

if(name === "" || email === "" || password === ""){

showToast("Please fill all fields","error");
return;

}

const gmailPattern =
/^[a-zA-Z0-9._%+-]+@gmail\.com$/;

if(!gmailPattern.test(email)){

showToast("Only Gmail Allowed","error");
return;

}

const passwordPattern =
/^\d{6}$/;

if(!passwordPattern.test(password)){

showToast("Password must be exactly 6 digits","error");
return;

}

let users =
JSON.parse(localStorage.getItem("users")) || [];

const existingUser =
users.find(u => u.email === email);

if(existingUser){

alert("Email already exists");
return;

}

users.push({
name,
email,
password
});

localStorage.setItem(
"users",
JSON.stringify(users)
);

alert("Account Created Successfully ✅");

setTimeout(()=>{

window.location.href = "index.html";

},1500);

});

}