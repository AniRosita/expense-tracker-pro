// ======================================================
// ============== EXPENSE TRACKER PRO ===================
// ================ REGISTER PAGE ========================
// ======================================================

"use strict";

(() => {

    // ==================================================
    // ================= REGISTER FORM ==================
    // ==================================================

    const registerForm =
        document.getElementById("registerForm");

    if (!registerForm) {

        console.error(
            "❌ registerForm not found"
        );

        return;
    }

    // ==================================================
    // ================= API BASE ========================
    // ==================================================

    const REGISTER_API_BASE =
        "https://expense-tracker-pro-production-b745.up.railway.app";

    console.log(
        "Register API Base:",
        REGISTER_API_BASE
    );

    // ==================================================
    // ================= TOAST HELPER ===================
    // ==================================================

    function registerMessage(
        message,
        type = "error"
    ) {

        if (
            typeof window.showToast ===
            "function"
        ) {

            window.showToast(
                message,
                type
            );

        } else {

            alert(message);

        }
    }

    // ==================================================
    // ================= REGISTER SUBMIT ================
    // ==================================================

    registerForm.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();

            // ==========================================
            // GET INPUTS
            // ==========================================

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
                    "❌ Register input fields not found"
                );

                registerMessage(
                    "Register form fields are missing.",
                    "error"
                );

                return;
            }

            // ==========================================
            // GET VALUES
            // ==========================================

            const name =
                nameInput.value.trim();

            const email =
                emailInput.value
                    .trim()
                    .toLowerCase();

            const password =
                passwordInput.value.trim();

            // ==========================================
            // EMPTY VALIDATION
            // ==========================================

            if (
                !name ||
                !email ||
                !password
            ) {

                registerMessage(
                    "Please fill all fields.",
                    "error"
                );

                return;
            }

            // ==========================================
            // GMAIL VALIDATION
            // ==========================================

            const gmailPattern =
                /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

            if (
                !gmailPattern.test(email)
            ) {

                registerMessage(
                    "Only Gmail addresses are allowed.",
                    "error"
                );

                return;
            }

            // ==========================================
            // PASSWORD VALIDATION
            // ==========================================

            const passwordPattern =
                /^\d{6}$/;

            if (
                !passwordPattern.test(password)
            ) {

                registerMessage(
                    "Password must be exactly 6 digits.",
                    "error"
                );

                return;
            }

            // ==========================================
            // SUBMIT BUTTON
            // ==========================================

            const submitButton =
                registerForm.querySelector(
                    'button[type="submit"]'
                );

            let originalButtonText =
                "Register";

            if (submitButton) {

                originalButtonText =
                    submitButton.innerText ||
                    "Register";

                submitButton.disabled =
                    true;

                submitButton.innerText =
                    "Creating Account...";
            }

            // ==========================================
            // API URL
            // ==========================================

            const apiUrl =
                `${REGISTER_API_BASE}/api/register`;

            console.log(
                "======================================"
            );

            console.log(
                "Register API URL:",
                apiUrl
            );

            console.log(
                "Register Name:",
                name
            );

            console.log(
                "Register Email:",
                email
            );

            console.log(
                "======================================"
            );

            try {

                // ======================================
                // SEND REQUEST
                // ======================================

                const response =
                    await fetch(
                        apiUrl,
                        {
                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "Accept":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({

                                    name:
                                        name,

                                    email:
                                        email,

                                    password:
                                        password
                                })
                        }
                    );

                // ======================================
                // READ RESPONSE
                // ======================================

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

                // ======================================
                // PARSE RESPONSE
                // ======================================

                let data = {};

                try {

                    data =
                        responseText
                            ? JSON.parse(
                                responseText
                            )
                            : {};

                } catch (jsonError) {

                    console.error(
                        "❌ Invalid JSON response:",
                        jsonError
                    );

                    registerMessage(
                        `Server error (${response.status})`,
                        "error"
                    );

                    return;
                }

                console.log(
                    "Register Response:",
                    data
                );

                // ======================================
                // SUCCESS
                // ======================================

                if (
                    response.ok &&
                    data.success === true
                ) {

                    console.log(
                        "✅ Account Created Successfully"
                    );

                    // ----------------------------------
                    // SUCCESS POPUP
                    // ----------------------------------

                    if (
                        typeof window.Swal !==
                        "undefined"
                    ) {

                        await window.Swal.fire({

                            title:
                                "Account Created Successfully! 🎉",

                            text:
                                "Your account has been created successfully.",

                            icon:
                                "success",

                            confirmButtonColor:
                                "#4f46e5",

                            timer:
                                2000,

                            timerProgressBar:
                                true,

                            showConfirmButton:
                                false
                        });

                    } else {

                        alert(
                            "Account Created Successfully! 🎉"
                        );
                    }

                    // ----------------------------------
                    // CLEAR FORM
                    // ----------------------------------

                    registerForm.reset();

                    // ----------------------------------
                    // LOGIN PAGE
                    // ----------------------------------

                    window.location.href =
                        "index.html";

                    return;
                }

                // ======================================
                // DUPLICATE EMAIL
                // ======================================

                if (
                    response.status === 409
                ) {

                    registerMessage(
                        data.message ||
                        "Email already exists. Please login.",
                        "error"
                    );

                    return;
                }

                // ======================================
                // BAD REQUEST
                // ======================================

                if (
                    response.status === 400
                ) {

                    registerMessage(
                        data.message ||
                        "Please check your details.",
                        "error"
                    );

                    return;
                }

                // ======================================
                // NOT FOUND
                // ======================================

                if (
                    response.status === 404
                ) {

                    console.error(
                        "❌ Register route not found:",
                        apiUrl
                    );

                    registerMessage(
                        "Register API route not found.",
                        "error"
                    );

                    return;
                }

                // ======================================
                // SERVER ERROR
                // ======================================

                if (
                    response.status >= 500
                ) {

                    console.error(
                        "❌ Railway Server Error:",
                        data
                    );

                    registerMessage(
                        data.message ||
                        "Server error. Please try again later.",
                        "error"
                    );

                    return;
                }

                // ======================================
                // OTHER ERROR
                // ======================================

                registerMessage(
                    data.message ||
                    "Registration failed. Please try again.",
                    "error"
                );

            } catch (error) {

                // ======================================
                // NETWORK ERROR
                // ======================================

                console.error(
                    "❌ Register Network Error:",
                    error
                );

                registerMessage(
                    "Unable to connect to server.",
                    "error"
                );

            } finally {

                // ======================================
                // ENABLE BUTTON
                // ======================================

                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.innerText =
                        originalButtonText;
                }
            }
        }
    );

    console.log(
        "Register JS Loaded Successfully ✅"
    );

})();