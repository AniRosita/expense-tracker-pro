const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        if (email === "" || password === "") {

            Swal.fire({
                title: "Missing Fields!",
                text: "Please fill all fields",
                icon: "warning",
                confirmButtonColor: "#4f46e5"
            });

            return;
        }

        const gmailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

        if (!gmailPattern.test(email)) {

            Swal.fire({
                title: "Invalid Email!",
                text: "Only Gmail address allowed",
                icon: "error",
                confirmButtonColor: "#4f46e5"
            });

            return;
        }

        const passwordPattern = /^\d{6}$/;

        if (!passwordPattern.test(password)) {

            Swal.fire({
                title: "Invalid Password!",
                text: "Password must be exactly 6 digits",
                icon: "error",
                confirmButtonColor: "#4f46e5"
            });

            return;
        }

        try {

            const response = await fetch("http://localhost:5000/login", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email,
                    password
                })

            });

            const data = await response.json();

            if (data.success) {

                localStorage.setItem("userEmail", data.user.email);

                localStorage.setItem(
                    "gmailProfile",
                    "assets/profile.png"
                );

                const message = document.getElementById("message");

                if (message) {
                    message.innerHTML = "Login Successful ✅";
                }

                Swal.fire({
                    title: "Login Successful!",
                    text: "Welcome Back",
                    icon: "success",
                    confirmButtonColor: "#4f46e5"
                });

                setTimeout(() => {
                    window.location.href = "dashboard.html";
                }, 1000);

            } else {

                Swal.fire({
                    title: "Login Failed!",
                    text: data.message,
                    icon: "error",
                    confirmButtonColor: "#4f46e5"
                });

            }

        } catch (error) {

            console.error(error);

            Swal.fire({
                title: "Server Error!",
                text: "Backend server is not running.",
                icon: "error",
                confirmButtonColor: "#4f46e5"
            });

        }

    });

}