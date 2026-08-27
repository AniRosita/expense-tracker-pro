// ======================================================
// ================= LOGIN PAGE ==========================
// ======================================================


// ======================================================
// ================= API BASE ============================
// ======================================================

// Frontend + Backend are hosted on the SAME Railway service.
// Relative URL prevents CORS / Railway domain mismatch.

const API_BASE = "";


// ======================================================
// ================= LOGIN FORM ==========================
// ======================================================

const loginForm = document.getElementById("loginForm");


// ======================================================
// ================= LOGIN SUBMIT ========================
// ======================================================

if (loginForm) {

    loginForm.addEventListener("submit", async function (e) {

        e.preventDefault();


        // ==================================================
        // ================= GET VALUES =====================
        // ==================================================

        const emailInput =
            document.getElementById("email");

        const passwordInput =
            document.getElementById("password");


        const email =
            emailInput
                ? emailInput.value.trim().toLowerCase()
                : "";


        const password =
            passwordInput
                ? passwordInput.value.trim()
                : "";


        // ==================================================
        // ================= EMPTY CHECK ====================
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
        // ================= GMAIL VALIDATION ===============
        // ==================================================

        const gmailPattern =
            /^[a-zA-Z0-9._%+-]+@gmail\.com$/;


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
        // ================= PASSWORD VALIDATION ============
        // ==================================================

        const passwordPattern =
            /^\d{6}$/;


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
        // ================= LOGIN API ======================
        // ==================================================

        try {

            const loginURL =
                `${API_BASE}/api/login`;


            console.log(
                "Login API URL:",
                loginURL
            );


            const response =
                await fetch(
                    loginURL,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json",
                            "Accept": "application/json"
                        },

                        body: JSON.stringify({
                            email: email,
                            password: password
                        })
                    }
                );


            console.log(
                "Login API Status:",
                response.status
            );


            // ==================================================
            // ================= RESPONSE ========================
            // ==================================================

            let data = null;


            try {

                data =
                    await response.json();

            } catch (jsonError) {

                console.error(
                    "Login JSON Error:",
                    jsonError
                );
            }


            console.log(
                "Login Response:",
                data
            );


            // ==================================================
            // ================= SERVER ERROR ===================
            // ==================================================

            if (!response.ok) {

                throw new Error(

                    data && data.message
                        ? data.message
                        : `Server Error (${response.status})`

                );
            }


            // ==================================================
            // ================= LOGIN SUCCESS ==================
            // ==================================================

            if (
                data &&
                data.success &&
                data.user
            ) {


                // ================= USER EMAIL =================

                localStorage.setItem(
                    "userEmail",
                    data.user.email
                );


                // ================= USER NAME ==================

                if (data.user.name) {

                    localStorage.setItem(
                        "userName",
                        data.user.name
                    );

                }


                // ================= USER ID ====================

                if (data.user.id) {

                    localStorage.setItem(
                        "userId",
                        data.user.id
                    );

                }


                // ================= PROFILE ====================

                localStorage.setItem(
                    "gmailProfile",
                    "assets/profile.png"
                );


                // ==================================================
                // ================= MESSAGE ========================
                // ==================================================

                const message =
                    document.getElementById("message");


                if (message) {

                    message.innerHTML =
                        "Login Successful ✅";

                }


                // ==================================================
                // ================= SUCCESS POPUP ==================
                // ==================================================

                await Swal.fire({

                    title: "Login Successful!",

                    text: "Welcome Back 👋",

                    icon: "success",

                    confirmButtonColor: "#4f46e5",

                    timer: 1200,

                    showConfirmButton: false

                });


                // ==================================================
                // ================= DASHBOARD ======================
                // ==================================================

                window.location.href =
                    "dashboard.html";

            }


            // ==================================================
            // ================= LOGIN FAILED =====================
            // ==================================================

            else {

                Swal.fire({

                    title: "Login Failed!",

                    text:
                        data && data.message
                            ? data.message
                            : "Invalid email or password",

                    icon: "error",

                    confirmButtonColor: "#4f46e5"

                });

            }

        }


        // ==================================================
        // ================= LOGIN CATCH ====================
        // ==================================================

        catch (error) {

            console.error(
                "Login Error:",
                error
            );


            Swal.fire({

                title: "Server Error!",

                text:
                    error.message ||
                    "Unable to connect to server. Please try again.",

                icon: "error",

                confirmButtonColor: "#4f46e5"

            });

        }

    });

}



// ======================================================
// ================= FORGOT PASSWORD ====================
// ======================================================

async function forgotPassword() {


    // ==================================================
    // ================= GET EMAIL =======================
    // ==================================================

    const { value: email } =
        await Swal.fire({

            title: "Forgot Password?",

            input: "email",

            inputLabel:
                "Enter your registered Gmail",

            inputPlaceholder:
                "example@gmail.com",

            showCancelButton: true,

            confirmButtonText:
                "Send OTP",

            cancelButtonText:
                "Cancel",

            confirmButtonColor:
                "#4f46e5",

            inputValidator:
                (value) => {

                    if (!value) {

                        return "Please enter your email";

                    }


                    const gmailPattern =
                        /^[a-zA-Z0-9._%+-]+@gmail\.com$/;


                    if (
                        !gmailPattern.test(
                            value.trim().toLowerCase()
                        )
                    ) {

                        return "Please enter a valid Gmail address";

                    }

                }

        });


    // ==================================================
    // ================= NO EMAIL =======================
    // ==================================================

    if (!email) {
        return;
    }


    // ==================================================
    // ================= SEND OTP ========================
    // ==================================================

    try {


        Swal.fire({

            title: "Sending OTP...",

            text: "Please wait",

            allowOutsideClick: false,

            didOpen: () => {

                Swal.showLoading();

            }

        });


        // ==================================================
        // ================= FORGOT PASSWORD API =============
        // ==================================================

        const forgotURL =
            `${API_BASE}/api/forgot-password`;


        console.log(
            "Forgot Password API URL:",
            forgotURL
        );


        // ==================================================
        // ================= API REQUEST =====================
        // ==================================================

        const response =
            await fetch(

                forgotURL,

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

                            email:
                                email
                                    .trim()
                                    .toLowerCase()

                        })

                }

            );


        // ==================================================
        // ================= RESPONSE ========================
        // ==================================================

        let data = null;


        try {

            data =
                await response.json();

        } catch (jsonError) {

            console.error(
                "Forgot Password JSON Error:",
                jsonError
            );

        }


        Swal.close();


        console.log(
            "Forgot Password Status:",
            response.status
        );


        console.log(
            "Forgot Password Response:",
            data
        );


        // ==================================================
        // ================= ERROR CHECK =====================
        // ==================================================

        if (
            !response.ok ||
            !data ||
            !data.success
        ) {

            throw new Error(

                data && data.message
                    ? data.message
                    : `Server Error (${response.status})`

            );

        }


        // ==================================================
        // ================= OTP SUCCESS =====================
        // ==================================================

        await Swal.fire({

            title: "OTP Sent! 📧",

            text:
                "OTP has been sent to your Gmail.",

            icon: "success",

            confirmButtonText:
                "Enter OTP",

            confirmButtonColor:
                "#4f46e5"

        });


        // ==================================================
        // ================= SAVE RESET EMAIL ================
        // ==================================================

        sessionStorage.setItem(

            "resetEmail",

            email
                .trim()
                .toLowerCase()

        );


        // ==================================================
        // ================= RESET PASSWORD PAGE =============
        // ==================================================

        window.location.href =
            "reset-password.html";

    }


    // ==================================================
    // ================= FORGOT PASSWORD ERROR ==========
    // ==================================================

    catch (error) {

        console.error(
            "Forgot Password Error:",
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
    document.getElementById("forgotPasswordLink");

if (forgotPasswordLink) {

    forgotPasswordLink.addEventListener(
        "click",
        function (e) {

            e.preventDefault();

            forgotPassword();

        }
    );

}