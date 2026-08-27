// ======================================================
// ================= LOGIN PAGE ==========================
// ======================================================


// ======================================================
// ================= API BASE ============================
// ======================================================

// Railway backend URL
const API_BASE =
    "https://expense-tracker-pro-production-99eb.up.railway.app";


// ======================================================
// ================= LOGIN FORM ==========================
// ======================================================

const loginForm =
    document.getElementById("loginForm");


// ======================================================
// ================= LOGIN SUBMIT ========================
// ======================================================

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (e) {

            e.preventDefault();


            // ==================================================
            // ================= GET VALUES ====================
            // ==================================================

            const emailInput =
                document.getElementById("email");

            const passwordInput =
                document.getElementById("password");


            const email =
                emailInput
                    ? emailInput.value.trim()
                    : "";

            const password =
                passwordInput
                    ? passwordInput.value.trim()
                    : "";


            // ==================================================
            // ================= EMPTY CHECK ===================
            // ==================================================

            if (
                email === "" ||
                password === ""
            ) {

                Swal.fire({

                    title:
                        "Missing Fields!",

                    text:
                        "Please fill all fields",

                    icon:
                        "warning",

                    confirmButtonColor:
                        "#4f46e5"

                });

                return;

            }


            // ==================================================
            // ================= GMAIL VALIDATION ==============
            // ==================================================

            const gmailPattern =
                /^[a-zA-Z0-9._%+-]+@gmail\.com$/;


            if (
                !gmailPattern.test(email)
            ) {

                Swal.fire({

                    title:
                        "Invalid Email!",

                    text:
                        "Only Gmail address allowed",

                    icon:
                        "error",

                    confirmButtonColor:
                        "#4f46e5"

                });

                return;

            }


            // ==================================================
            // ================= PASSWORD VALIDATION ===========
            // ==================================================

            const passwordPattern =
                /^\d{6}$/;


            if (
                !passwordPattern.test(password)
            ) {

                Swal.fire({

                    title:
                        "Invalid Password!",

                    text:
                        "Password must be exactly 6 digits",

                    icon:
                        "error",

                    confirmButtonColor:
                        "#4f46e5"

                });

                return;

            }


            // ==================================================
            // ================= LOGIN REQUEST =================
            // ==================================================

            try {

                console.log(
                    "Login API URL:",
                    `${API_BASE}/api/login`
                );


                const response =
                    await fetch(
                        `${API_BASE}/api/login`,
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
                                        email,

                                    password:
                                        password

                                })

                        }
                    );


                console.log(
                    "Login API Status:",
                    response.status
                );


                // ==================================================
                // ================= RESPONSE DATA =================
                // ==================================================

                let data = null;


                try {

                    data =
                        await response.json();

                }

                catch (jsonError) {

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
                // ================= ERROR RESPONSE ================
                // ==================================================

                if (!response.ok) {

                    throw new Error(

                        data &&
                        data.message

                            ? data.message

                            : `Server Error (${response.status})`

                    );

                }


                // ==================================================
                // ================= LOGIN SUCCESS =================
                // ==================================================

                if (
                    data &&
                    data.success &&
                    data.user
                ) {


                    // ================= SAVE USER EMAIL =================

                    localStorage.setItem(
                        "userEmail",
                        data.user.email
                    );


                    // ================= SAVE USER NAME ==================

                    if (data.user.name) {

                        localStorage.setItem(
                            "userName",
                            data.user.name
                        );

                    }


                    // ================= SAVE USER ID ====================

                    if (data.user.id) {

                        localStorage.setItem(
                            "userId",
                            data.user.id
                        );

                    }


                    // ================= SAVE PROFILE ====================

                    localStorage.setItem(
                        "gmailProfile",
                        "assets/profile.png"
                    );


                    // ==================================================
                    // ================= MESSAGE =========================
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
                    // ================= SUCCESS POPUP ==================
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

                        title:
                            "Login Failed!",

                        text:
                            (
                                data &&
                                data.message
                            )
                                ? data.message
                                : "Invalid email or password",

                        icon:
                            "error",

                        confirmButtonColor:
                            "#4f46e5"

                    });

                }

            }


            // ==================================================
            // ================= SERVER ERROR ===================
            // ==================================================

            catch (error) {

                console.error(
                    "Login Error:",
                    error
                );


                Swal.fire({

                    title:
                        "Server Error!",

                    text:
                        error.message ||
                        "Unable to connect to server. Please try again.",

                    icon:
                        "error",

                    confirmButtonColor:
                        "#4f46e5"

                });

            }

        }
    );

}
// ======================================================
// ================= FORGOT PASSWORD ====================
// ======================================================

async function forgotPassword() {

    const { value: email } = await Swal.fire({

        title: "Forgot Password?",

        input: "email",

        inputLabel: "Enter your registered Gmail",

        inputPlaceholder: "example@gmail.com",

        showCancelButton: true,

        confirmButtonText: "Send OTP",

        confirmButtonColor: "#4f46e5",

        inputValidator: (value) => {

            if (!value) {

                return "Please enter your email";

            }

            const gmailPattern =
                /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

            if (!gmailPattern.test(value)) {

                return "Please enter a valid Gmail address";

            }

        }

    });


    if (!email) {

        return;

    }


    try {

        Swal.fire({

            title: "Sending OTP...",

            text: "Please wait",

            allowOutsideClick: false,

            didOpen: () => {

                Swal.showLoading();

            }

        });


        const response =
            await fetch(
                `${API_BASE}/forgot-password`,
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
                            email: email.trim().toLowerCase()
                        })

                }
            );


        const data =
            await response.json();


        Swal.close();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to send OTP"
            );

        }


        await Swal.fire({

            title: "OTP Sent! 📧",

            text:
                "OTP has been sent to your Gmail.",

            icon: "success",

            confirmButtonText: "Enter OTP",

            confirmButtonColor: "#4f46e5"

        });


        // Store email temporarily
        sessionStorage.setItem(
            "resetEmail",
            email.trim().toLowerCase()
        );


        // Go to reset password page
        window.location.href =
            "reset-password.html";


    } catch (error) {

        console.error(
            "Forgot Password Error:",
            error
        );


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