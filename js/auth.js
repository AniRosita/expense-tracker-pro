// ======================================================
// ============== EXPENSE TRACKER PRO ===================
// ================= AUTHENTICATION ======================
// ======================================================

"use strict";

// ======================================================
// ================= API BASE ============================
// ======================================================

const API_BASE =
    "https://expense-tracker-pro-production-b745.up.railway.app";

console.log("================================");
console.log("Auth.js Loaded");
console.log("API BASE:", API_BASE);
console.log("================================");

// ======================================================
// ================= GMAIL VALIDATION ====================
// ======================================================

const gmailPattern =
    /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

// ======================================================
// ================= PASSWORD VALIDATION =================
// ======================================================

const passwordPattern =
    /^\d{6}$/;

// ======================================================
// ================= LOGIN FORM ==========================
// ======================================================

const loginForm =
    document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (e) {

            e.preventDefault();

            // ==================================================
            // GET INPUTS
            // ==================================================

            const emailInput =
                document.getElementById("email");

            const passwordInput =
                document.getElementById("password");

            if (!emailInput || !passwordInput) {

                console.error(
                    "❌ Login fields not found"
                );

                return;
            }

            // ==================================================
            // GET VALUES
            // ==================================================

            const email =
                emailInput.value
                    .trim()
                    .toLowerCase();

            const password =
                passwordInput.value.trim();

            // ==================================================
            // EMPTY CHECK
            // ==================================================

            if (!email || !password) {

                Swal.fire({
                    title: "Missing Fields!",
                    text: "Please fill all fields",
                    icon: "warning",
                    confirmButtonColor: "#4f46e5"
                });

                return;
            }

            // ==================================================
            // GMAIL CHECK
            // ==================================================

            if (!gmailPattern.test(email)) {

                Swal.fire({
                    title: "Invalid Email!",
                    text: "Only Gmail address allowed",
                    icon: "error",
                    confirmButtonColor: "#4f46e5"
                });

                return;
            }

            // ==================================================
            // PASSWORD CHECK
            // ==================================================

            if (!passwordPattern.test(password)) {

                Swal.fire({
                    title: "Invalid Password!",
                    text: "Password must be exactly 6 digits",
                    icon: "error",
                    confirmButtonColor: "#4f46e5"
                });

                return;
            }

            // ==================================================
            // LOGIN BUTTON
            // ==================================================

            const loginButton =
                document.getElementById("loginBtn");

            if (loginButton) {

                loginButton.disabled = true;

                loginButton.dataset.originalText =
                    loginButton.innerHTML;

                loginButton.innerHTML =
                    '<i class="fas fa-spinner fa-spin"></i> Logging in...';
            }

            // ==================================================
            // LOGIN API
            // ==================================================

            try {

                const loginURL =
                    `${API_BASE}/api/login`;

                console.log("================================");
                console.log(
                    "Login API URL:",
                    loginURL
                );
                console.log(
                    "Login Email:",
                    email
                );
                console.log("================================");

                const response =
                    await fetch(
                        loginURL,
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
                                    email: email,
                                    password: password
                                })
                        }
                    );

                console.log(
                    "Login Status:",
                    response.status
                );

                // ==================================================
                // READ RESPONSE
                // ==================================================

                const responseText =
                    await response.text();

                console.log(
                    "Login Raw Response:",
                    responseText
                );

                let data = {};

                try {

                    data =
                        JSON.parse(
                            responseText
                        );

                } catch (jsonError) {

                    console.error(
                        "❌ Invalid JSON:",
                        jsonError
                    );

                    throw new Error(
                        `Server returned invalid response (${response.status})`
                    );
                }

                console.log(
                    "Login Response:",
                    data
                );

                // ==================================================
                // SERVER ERROR
                // ==================================================

                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        `Server Error (${response.status})`
                    );
                }

                // ==================================================
                // LOGIN SUCCESS
                // ==================================================

                if (
                    data.success === true &&
                    data.user
                ) {

                    // ==================================================
                    // SAVE USER EMAIL
                    // ==================================================

                    localStorage.setItem(
                        "userEmail",
                        data.user.email
                    );

                    // ==================================================
                    // SAVE USER NAME
                    // ==================================================

                    if (data.user.name) {

                        localStorage.setItem(
                            "userName",
                            data.user.name
                        );
                    }

                    // ==================================================
                    // SAVE USER ID
                    // ==================================================

                    if (data.user.id) {

                        localStorage.setItem(
                            "userId",
                            String(data.user.id)
                        );
                    }

                    // ==================================================
                    // DEFAULT PROFILE
                    // ==================================================

                    localStorage.setItem(
                        "gmailProfile",
                        "assets/profile.png"
                    );

                    // ==================================================
                    // MESSAGE
                    // ==================================================

                    const message =
                        document.getElementById(
                            "message"
                        );

                    if (message) {

                        message.innerHTML =
                            "Login Successful ✅";
                    }

                    // ==================================================
                    // SUCCESS POPUP
                    // ==================================================

                    await Swal.fire({

                        title:
                            "Login Successful!",

                        text:
                            "Welcome Back 👋",

                        icon:
                            "success",

                        confirmButtonColor:
                            "#4f46e5",

                        timer:
                            1200,

                        showConfirmButton:
                            false
                    });

                    // ==================================================
                    // GO TO DASHBOARD
                    // ==================================================

                    window.location.href =
                        "dashboard.html";

                    return;
                }

                // ==================================================
                // LOGIN FAILED
                // ==================================================

                Swal.fire({

                    title:
                        "Login Failed!",

                    text:
                        data.message ||
                        "Invalid email or password",

                    icon:
                        "error",

                    confirmButtonColor:
                        "#4f46e5"
                });

            }

            // ==================================================
            // LOGIN ERROR
            // ==================================================

            catch (error) {

                console.error(
                    "❌ Login Error:",
                    error
                );

                Swal.fire({

                    title:
                        "Server Error!",

                    text:
                        error.message ||
                        "Unable to connect to server.",

                    icon:
                        "error",

                    confirmButtonColor:
                        "#4f46e5"
                });

            }

            // ==================================================
            // ENABLE LOGIN BUTTON
            // ==================================================

            finally {

                if (loginButton) {

                    loginButton.disabled =
                        false;

                    loginButton.innerHTML =
                        loginButton.dataset.originalText ||
                        '<i class="fas fa-right-to-bracket"></i> Login';
                }
            }
        }
    );
}

// ======================================================
// ================= FORGOT PASSWORD ====================
// ======================================================

async function forgotPassword() {

    // ==================================================
    // ASK EMAIL
    // ==================================================

    const result =
        await Swal.fire({

            title:
                "Forgot Password?",

            input:
                "email",

            inputLabel:
                "Enter your registered Gmail",

            inputPlaceholder:
                "example@gmail.com",

            showCancelButton:
                true,

            confirmButtonText:
                "Send OTP",

            cancelButtonText:
                "Cancel",

            confirmButtonColor:
                "#4f46e5",

            inputAttributes: {
                autocomplete:
                    "email"
            },

            inputValidator:
                (value) => {

                    if (!value) {

                        return "Please enter your email";
                    }

                    const enteredEmail =
                        value
                            .trim()
                            .toLowerCase();

                    if (
                        !gmailPattern.test(
                            enteredEmail
                        )
                    ) {

                        return "Please enter a valid Gmail address";
                    }

                    return undefined;
                }
        });

    // ==================================================
    // CANCEL CHECK
    // ==================================================

    if (!result.isConfirmed) {
        return;
    }

    // ==================================================
    // GET EMAIL
    // ==================================================

    const email =
        result.value
            .trim()
            .toLowerCase();

    if (!email) {
        return;
    }

    // ==================================================
    // SEND OTP
    // ==================================================

    try {

        Swal.fire({

            title:
                "Sending OTP...",

            text:
                "Please wait",

            allowOutsideClick:
                false,

            allowEscapeKey:
                false,

            didOpen:
                () => {
                    Swal.showLoading();
                }
        });

        // ==================================================
        // FORGOT PASSWORD API URL
        // ==================================================

        const forgotURL =
            `${API_BASE}/api/forgot-password`;

        console.log("================================");

        console.log(
            "Forgot Password API URL:",
            forgotURL
        );

        console.log(
            "Forgot Password Email:",
            email
        );

        console.log("================================");

        // ==================================================
        // API REQUEST
        // ==================================================

        const response =
            await fetch(
                forgotURL,
                {
                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            email:
                                email
                        })
                }
            );

        // ==================================================
        // RESPONSE
        // ==================================================

        const responseText =
            await response.text();

        console.log(
            "Forgot Password Status:",
            response.status
        );

        console.log(
            "Forgot Password Raw Response:",
            responseText
        );

        let data = {};

        try {

            data =
                JSON.parse(
                    responseText
                );

        } catch (jsonError) {

            console.error(
                "❌ Forgot Password JSON Error:",
                jsonError
            );

            throw new Error(
                `Invalid server response (${response.status})`
            );
        }

        console.log(
            "Forgot Password Response:",
            data
        );

        // ==================================================
        // CLOSE LOADING
        // ==================================================

        Swal.close();

        // ==================================================
        // SERVER ERROR
        // ==================================================

        if (
            !response.ok ||
            data.success !== true
        ) {

            throw new Error(
                data.message ||
                `Server Error (${response.status})`
            );
        }

        // ==================================================
        // OTP SENT
        // ==================================================

        await Swal.fire({

            title:
                "OTP Sent! 📧",

            text:
                `OTP has been sent to ${email}`,

            icon:
                "success",

            confirmButtonText:
                "Enter OTP",

            confirmButtonColor:
                "#4f46e5"
        });

        // ==================================================
        // SAVE RESET EMAIL
        // ==================================================

        sessionStorage.setItem(
            "resetEmail",
            email
        );

        // ==================================================
        // RESET PAGE
        // ==================================================

        window.location.href =
            "reset-password.html";

    }

    // ==================================================
    // FORGOT PASSWORD ERROR
    // ==================================================

    catch (error) {

        console.error(
            "❌ Forgot Password Error:",
            error
        );

        Swal.close();

        Swal.fire({

            title:
                "Forgot Password Failed!",

            text:
                error.message ||
                "Unable to send OTP",

            icon:
                "error",

            confirmButtonColor:
                "#4f46e5"
        });
    }
}

// ======================================================
// ============== FORGOT PASSWORD LINK ==================
// ======================================================

const forgotPasswordLink =
    document.getElementById(
        "forgotPasswordLink"
    );

if (forgotPasswordLink) {

    forgotPasswordLink.addEventListener(
        "click",
        function (e) {

            e.preventDefault();

            forgotPassword();
        }
    );
}

// ======================================================
// ============== GLOBAL FUNCTION ========================
// ======================================================

window.forgotPassword =
    forgotPassword;

// ======================================================
// ================= DEBUG ===============================
// ======================================================

console.log(
    "✅ auth.js loaded successfully"
);

console.log(
    "🔗 API BASE:",
    API_BASE
);