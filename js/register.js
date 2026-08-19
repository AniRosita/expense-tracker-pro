// ======================================================
// ================= REGISTER PAGE =======================
// ======================================================


// ======================================================
// ================= REGISTER FORM =======================
// ======================================================

const registerForm =
    document.getElementById("registerForm");


// ======================================================
// ================= FORM CHECK ==========================
// ======================================================

if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();


            // ==================================================
            // ================= GET VALUES ====================
            // ==================================================

            const name =
                document
                    .getElementById("name")
                    .value
                    .trim();


            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();


            const password =
                document
                    .getElementById("password")
                    .value
                    .trim();


            // ==================================================
            // ================= EMPTY CHECK ===================
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
            // ================= GMAIL VALIDATION ==============
            // ==================================================

            const gmailPattern =
                /^[a-zA-Z0-9._%+-]+@gmail\.com$/;


            if (
                !gmailPattern.test(email)
            ) {

                showToast(
                    "Only Gmail Allowed",
                    "error"
                );

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

                showToast(
                    "Password must be exactly 6 digits",
                    "error"
                );

                return;

            }


            // ==================================================
            // ================= RAILWAY API ===================
            // ==================================================

            const API_BASE =
    "https://expense-tracker-pro-production-99eb.up.railway.app";


            // ==================================================
            // ================= REGISTER API ==================
            // ==================================================

            try {

                const response =
                    await fetch(
                        `${API_BASE}/register`,
                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body: JSON.stringify({

                                name: name,

                                email: email,

                                password: password

                            })

                        }
                    );


                // ==================================================
                // ================= RESPONSE CHECK ===============
                // ==================================================

                if (!response.ok) {

                    throw new Error(
                        "Server Error: " +
                        response.status
                    );

                }


                // ==================================================
                // ================= GET RESPONSE =================
                // ==================================================

                const data =
                    await response.json();


                // ==================================================
                // ================= SUCCESS =======================
                // ==================================================

                if (data.success) {

                    showToast(
                        "Account Created Successfully ✅",
                        "success"
                    );


                    setTimeout(
                        () => {

                            window.location.href =
                                "index.html";

                        },
                        1500
                    );

                }


                // ==================================================
                // ================= REGISTER ERROR ===============
                // ==================================================

                else {

                    showToast(
                        data.message ||
                        "Registration failed",
                        "error"
                    );

                }

            }


            // ==================================================
            // ================= SERVER ERROR ===================
            // ==================================================

            catch (error) {

                console.error(
                    "Register Error:",
                    error
                );


                showToast(
                    "Unable to connect to server.",
                    "error"
                );

            }

        }
    );

}