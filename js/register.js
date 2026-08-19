const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        if (name === "" || email === "" || password === "") {

            showToast("Please fill all fields", "error");
            return;

        }

        const gmailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

        if (!gmailPattern.test(email)) {

            showToast("Only Gmail Allowed", "error");
            return;

        }

        const passwordPattern = /^\d{6}$/;

        if (!passwordPattern.test(password)) {

            showToast("Password must be exactly 6 digits", "error");
            return;

        }

        try {

            const response = await fetch("http://localhost:5000/register", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name,
                    email,
                    password
                })

            });

            const data = await response.json();

            if (data.success) {

                showToast("Account Created Successfully ✅", "success");

                setTimeout(() => {

                    window.location.href = "index.html";

                }, 1500);

            } else {

                showToast(data.message, "error");

            }

        } catch (error) {

            console.error(error);

            showToast("Server Error! Backend is not running.", "error");

        }

    });

}