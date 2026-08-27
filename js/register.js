// ======================================================
// ============== EXPENSE TRACKER PRO ===================
// ================ REGISTER PAGE ========================
// ======================================================


// ======================================================
// ================= REGISTER FORM =======================
// ======================================================

const registerForm = document.getElementById("registerForm");


// ======================================================
// ================= API BASE ============================
// ======================================================

// Railway BACKEND URL
const API_BASE =
    "https://expense-tracker-pro-production-99eb.up.railway.app";


// ======================================================
// ================= REGISTER FORM =======================
// ======================================================

if (registerForm) {

    registerForm.addEventListener("submit", async (e) => {

        e.preventDefault();


        // ==================================================
        // ================= GET INPUTS =====================
        // ==================================================

        const nameInput =
            document.getElementById("name");

        const emailInput =
            document.getElementById("email");

        const passwordInput =
            document.getElementById("password");


        if (
            !nameInput ||
            !emailInput ||
            !passwordInput
        ) {

            console.error(
                "❌ Register form fields not found"
            );

            return;
        }


        // ==================================================
        // ================= GET VALUES =====================
        // ==================================================

        const name =
            nameInput.value.trim();

        const email =
            emailInput.value
                .trim()
                .toLowerCase();

        const password =
            passwordInput.value.trim();


        // ==================================================
        // ================= EMPTY CHECK ====================
        // ==================================================

        if (
            name === "" ||
            email === "" ||
            password === ""
        ) {

            showToast(
                "Please fill all fields",
                "error"
            );

            return;
        }


        // ==================================================
        // ================= GMAIL VALIDATION ===============
        // ==================================================

        const gmailPattern =
            /^[a-zA-Z0-9._%+-]+@gmail\.com$/;


        if (!gmailPattern.test(email)) {

            showToast(
                "Only Gmail addresses are allowed",
                "error"
            );

            return;
        }


        // ==================================================
        // ================= PASSWORD VALIDATION ============
        // ==================================================

        // Exactly 6 digits
        const passwordPattern =
            /^\d{6}$/;


        if (!passwordPattern.test(password)) {

            showToast(
                "Password must be exactly 6 digits",
                "error"
            );

            return;
        }


        // ==================================================
        // ================= DISABLE BUTTON =================
        // ==================================================

        const submitButton =
            registerForm.querySelector(
                'button[type="submit"]'
            );


        if (submitButton) {

            submitButton.disabled = true;

            submitButton.dataset.originalText =
                submitButton.innerText;

            submitButton.innerText =
                "Creating Account...";
        }


        // ==================================================
        // ================= REGISTER API ===================
        // ==================================================

        try {

            const apiUrl =
                `${API_BASE}/api/register`;


            console.log(
                "======================================"
            );

            console.log(
                "Register API URL:",
                apiUrl
            );

            console.log(
                "Register Email:",
                email
            );

            console.log(
                "======================================"
            );


            // ==================================================
            // ================= FETCH REQUEST ==================
            // ==================================================

            const response =
                await fetch(
                    apiUrl,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                name: name,
                                email: email,
                                password: password
                            })
                    }
                );


            // ==================================================
            // ================= RESPONSE TEXT =================
            // ==================================================

            const responseText =
                await response.text();


            console.log(
                "Register HTTP Status:",
                response.status
            );

            console.log(
                "Register Raw Response:",
                responseText
            );


            // ==================================================
            // ================= PARSE JSON ====================
            // ==================================================

            let data = {};

            try {

                data =
                    JSON.parse(responseText);

            } catch (jsonError) {

                console.error(
                    "❌ Invalid JSON response:",
                    jsonError
                );

                showToast(
                    `Server error (${response.status})`,
                    "error"
                );

                return;
            }


            console.log(
                "Register Response:",
                data
            );


            // ==================================================
            // ================= SUCCESS =======================
            // ==================================================

            if (
                response.ok &&
                data.success === true
            ) {

                showToast(
                    "Account Created Successfully ✅",
                    "success"
                );


                // Clear form
                registerForm.reset();


                // Redirect to login
                setTimeout(() => {

                    window.location.href =
                        "index.html";

                }, 1500);


                return;
            }


            // ==================================================
            // ================= DUPLICATE EMAIL ===============
            // ==================================================

            if (
                response.status === 409
            ) {

                showToast(
                    "Email already exists. Please login.",
                    "error"
                );

                return;
            }


            // ==================================================
            // ================= VALIDATION ERROR ==============
            // ==================================================

            if (
                response.status === 400
            ) {

                showToast(
                    data.message ||
                    "Please check your details.",
                    "error"
                );

                return;
            }


            // ==================================================
            // ================= NOT FOUND ======================
            // ==================================================

            if (
                response.status === 404
            ) {

                showToast(
                    "Register API route not found.",
                    "error"
                );

                console.error(
                    "❌ API route not found:",
                    apiUrl
                );

                return;
            }


            // ==================================================
            // ================= SERVER ERROR ==================
            // ==================================================

            showToast(
                data.message ||
                "Registration failed. Please try again.",
                "error"
            );

        }


        // ==================================================
        // ================= NETWORK ERROR ==================
        // ==================================================

        catch (error) {

            console.error(
                "❌ Register Network Error:",
                error
            );


            showToast(
                "Unable to connect to server.",
                "error"
            );
        }


        // ==================================================
        // ================= ENABLE BUTTON ===================
        // ==================================================

        finally {

            if (submitButton) {

                submitButton.disabled = false;

                submitButton.innerText =
                    submitButton.dataset.originalText ||
                    "Register";
            }
        }

    });

} else {

    console.error(
        "❌ registerForm not found"
    );
}