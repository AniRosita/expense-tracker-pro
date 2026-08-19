// ======================================================
// ================= LOGIN PAGE ==========================
// ======================================================

// ======================================================
// ================= RAILWAY API =========================
// ======================================================

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

                const response =
                    await fetch(
                        `${API_BASE}/login`,
                        {

                            method:
                                "POST",

                            headers: {

                                "Content-Type":
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


                // ==================================================
                // ================= RESPONSE STATUS ==============
                // ==================================================

                if (!response.ok) {

                    let errorMessage =
                        "Server Error";

                    try {

                        const errorData =
                            await response.json();

                        errorMessage =
                            errorData.message ||
                            errorMessage;

                    } catch (
                        jsonError
                    ) {

                        console.error(
                            "Response JSON Error:",
                            jsonError
                        );

                    }


                    throw new Error(
                        errorMessage +
                        " (" +
                        response.status +
                        ")"
                    );

                }


                // ==================================================
                // ================= RESPONSE DATA =================
                // ==================================================

                const data =
                    await response.json();


                console.log(
                    "Login Response:",
                    data
                );


                // ==================================================
                // ================= LOGIN SUCCESS =================
                // ==================================================

                if (
                    data.success &&
                    data.user
                ) {

                    // ================= SAVE USER EMAIL =================

                    localStorage.setItem(
                        "userEmail",
                        data.user.email
                    );


                    // ================= SAVE PROFILE ====================

                    localStorage.setItem(
                        "gmailProfile",
                        "assets/profile.png"
                    );


                    // ================= MESSAGE =========================

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
                            1000,

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
                            data.message ||
                            "Invalid email or password",

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