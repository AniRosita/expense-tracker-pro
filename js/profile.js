// ======================================================
// ============== EXPENSE TRACKER PRO ===================
// ===================== PROFILE JS ======================
// ============== SERVER API VERSION ====================
// ======================================================

"use strict";

// ======================================================
// ================= API CONFIG ==========================
// ======================================================

const API_BASE =
    "https://expense-tracker-pro-production-b745.up.railway.app";

console.log("======================================");
console.log("PROFILE JS LOADED");
console.log("API:", API_BASE);
console.log("======================================");

// ======================================================
// ================= USER EMAIL ==========================
// ======================================================

const userEmail =
    localStorage.getItem("userEmail");

if (!userEmail) {
    window.location.href = "index.html";
}

// ======================================================
// ================= DOM HELPER ==========================
// ======================================================

function $(id) {
    return document.getElementById(id);
}

// ======================================================
// ================= PROFILE ELEMENTS ====================
// ======================================================

const profileImg =
    $("profileImg");

const profileUpload =
    $("profileUpload");

const profileLetter =
    $("profileLetter");

const profileEmail =
    $("profileEmail");

const profileName =
    $("profileName");

const profileCountry =
    $("profileCountry");

const profileCurrency =
    $("profileCurrency");

const minimumBalance =
    $("minimumBalance");

const saveProfileBtn =
    $("saveProfile");

// ======================================================
// ================= API HELPER ==========================
// ======================================================

async function profileAPI(
    endpoint,
    options = {}
) {

    const response =
        await fetch(
            API_BASE + endpoint,
            {
                ...options,
                headers: {
                    "Content-Type":
                        "application/json",
                    ...(options.headers || {})
                }
            }
        );

    let data;

    try {
        data = await response.json();
    } catch {
        throw new Error(
            "Invalid server response"
        );
    }

    if (!response.ok) {

        throw new Error(
            data.message ||
            "Profile API request failed"
        );
    }

    return data;
}

// ======================================================
// ================= PROFILE LETTER ======================
// ======================================================

function showProfileLetter() {

    if (!profileLetter) {
        return;
    }

    let name = "";

    if (
        profileName &&
        profileName.value
    ) {

        name =
            profileName.value.trim();
    }

    if (!name && userEmail) {

        name =
            userEmail
                .split("@")[0]
                .trim();
    }

    if (!name) {
        name = "User";
    }

    profileLetter.innerText =
        name
            .charAt(0)
            .toUpperCase();

    profileLetter.style.display =
        "flex";
}

// ======================================================
// ================= UPDATE PROFILE LETTER ==============
// ======================================================

function updateProfileLetter() {

    if (
        profileImg &&
        profileImg.style.display === "block" &&
        profileImg.src
    ) {

        if (profileLetter) {
            profileLetter.style.display =
                "none";
        }

        return;
    }

    showProfileLetter();
}

// ======================================================
// ================= LOAD PROFILE FROM API ==============
// ======================================================

async function loadProfile() {

    if (!userEmail) {
        return;
    }

    try {

        console.log(
            "Loading profile:",
            userEmail
        );

        const data =
            await profileAPI(
                "/api/profile/" +
                encodeURIComponent(userEmail)
            );

        if (
            !data.success ||
            !data.profile
        ) {

            throw new Error(
                "Profile data not received"
            );
        }

        const profile =
            data.profile;

        // ----------------------------------------------
        // NAME
        // ----------------------------------------------

        if (profileName) {

            profileName.value =
                profile.name || "";
        }

        // ----------------------------------------------
        // EMAIL
        // ----------------------------------------------

        if (profileEmail) {

            profileEmail.value =
                profile.email ||
                userEmail;
        }

        // ----------------------------------------------
        // COUNTRY
        // ----------------------------------------------

        if (profileCountry) {

            profileCountry.value =
                profile.country || "";
        }

        // ----------------------------------------------
        // CURRENCY
        // ----------------------------------------------

        if (profileCurrency) {

            profileCurrency.value =
                profile.currency ||
                "INR";
        }

        // ----------------------------------------------
        // MINIMUM BALANCE
        // ----------------------------------------------

        if (minimumBalance) {

            minimumBalance.value =
                profile.minimumBalance ?? 0;
        }

        // ----------------------------------------------
        // PROFILE LETTER
        // ----------------------------------------------

        updateProfileLetter();

        console.log(
            "Profile loaded successfully ✅",
            profile
        );

    } catch (error) {

        console.error(
            "LOAD PROFILE ERROR:",
            error
        );

        // If profile doesn't exist,
        // use default values

        if (profileEmail) {
            profileEmail.value =
                userEmail;
        }

        if (
            profileCurrency &&
            !profileCurrency.value
        ) {

            profileCurrency.value =
                "INR";
        }

        if (
            minimumBalance &&
            !minimumBalance.value
        ) {

            minimumBalance.value =
                "0";
        }

        showProfileLetter();
    }
}

// ======================================================
// ================= PROFILE IMAGE UPLOAD ===============
// ======================================================

if (profileUpload) {

    profileUpload.addEventListener(
        "change",
        function () {

            const file =
                this.files &&
                this.files[0];

            if (!file) {
                return;
            }

            // ------------------------------------------
            // IMAGE TYPE
            // ------------------------------------------

            if (
                !file.type.startsWith("image/")
            ) {

                alert(
                    "Please select a valid image file."
                );

                this.value = "";

                return;
            }

            // ------------------------------------------
            // IMAGE SIZE
            // ------------------------------------------

            const maxSize =
                5 * 1024 * 1024;

            if (file.size > maxSize) {

                alert(
                    "Image size must be less than 5 MB."
                );

                this.value = "";

                return;
            }

            // ------------------------------------------
            // PREVIEW ONLY
            // ------------------------------------------

            const reader =
                new FileReader();

            reader.onload =
                function (event) {

                    const imageData =
                        event.target.result;

                    if (profileImg) {

                        profileImg.src =
                            imageData;

                        profileImg.style.display =
                            "block";
                    }

                    if (profileLetter) {

                        profileLetter.style.display =
                            "none";
                    }

                    /*
                     * IMPORTANT
                     *
                     * Image is previewed here.
                     * It is NOT stored in localStorage.
                     */
                };

            reader.onerror =
                function () {

                    alert(
                        "Unable to load profile image."
                    );
                };

            reader.readAsDataURL(file);
        }
    );
}

// ======================================================
// ================= SAVE PROFILE ========================
// ======================================================

if (saveProfileBtn) {

    saveProfileBtn.addEventListener(
        "click",
        async function () {

            const name =
                profileName
                    ? profileName.value.trim()
                    : "";

            const country =
                profileCountry
                    ? profileCountry.value.trim()
                    : "";

            const currency =
                profileCurrency
                    ? profileCurrency.value
                    : "INR";

            const minimum =
                minimumBalance
                    ? minimumBalance.value.trim()
                    : "0";

            // ------------------------------------------
            // VALIDATION
            // ------------------------------------------

            if (!name) {

                if (
                    typeof Swal !==
                    "undefined"
                ) {

                    Swal.fire({
                        title:
                            "Name Required",

                        text:
                            "Please enter your name.",

                        icon:
                            "warning",

                        confirmButtonColor:
                            "#4f46e5"
                    });

                } else {

                    alert(
                        "Please enter your name."
                    );
                }

                if (profileName) {
                    profileName.focus();
                }

                return;
            }

            // ------------------------------------------
            // MINIMUM BALANCE VALIDATION
            // ------------------------------------------

            const minimumValue =
                Number(minimum);

            if (
                !Number.isFinite(minimumValue) ||
                minimumValue < 0
            ) {

                if (
                    typeof Swal !==
                    "undefined"
                ) {

                    Swal.fire({
                        title:
                            "Invalid Minimum Balance",

                        text:
                            "Please enter a valid amount.",

                        icon:
                            "warning",

                        confirmButtonColor:
                            "#4f46e5"
                    });

                } else {

                    alert(
                        "Please enter a valid minimum balance."
                    );
                }

                return;
            }

            // ------------------------------------------
            // SHOW LOADING
            // ------------------------------------------

            if (
                typeof Swal !==
                "undefined"
            ) {

                Swal.fire({
                    title:
                        "Saving Profile...",

                    text:
                        "Please wait",

                    allowOutsideClick:
                        false,

                    didOpen:
                        () => {

                            Swal.showLoading();
                        }
                });
            }

            try {

                console.log(
                    "Saving profile to server..."
                );

                const data =
                    await profileAPI(
                        "/api/profile/" +
                        encodeURIComponent(userEmail),
                        {
                            method: "PUT",

                            body:
                                JSON.stringify({

                                    name:
                                        name,

                                    country:
                                        country,

                                    currency:
                                        currency,

                                    minimumBalance:
                                        minimumValue
                                })
                        }
                    );

                console.log(
                    "PROFILE SAVED ✅",
                    data
                );

                // --------------------------------------
                // UPDATE LETTER
                // --------------------------------------

                updateProfileLetter();

                // --------------------------------------
                // SUCCESS
                // --------------------------------------

                if (
                    typeof Swal !==
                    "undefined"
                ) {

                    await Swal.fire({

                        title:
                            "Success!",

                        text:
                            "Profile details saved successfully ✅",

                        icon:
                            "success",

                        confirmButtonColor:
                            "#4f46e5"
                    });

                } else {

                    alert(
                        "Profile details saved successfully ✅"
                    );
                }

                // --------------------------------------
                // DASHBOARD
                // --------------------------------------

                window.location.href =
                    "dashboard.html";

            } catch (error) {

                console.error(
                    "SAVE PROFILE ERROR:",
                    error
                );

                if (
                    typeof Swal !==
                    "undefined"
                ) {

                    Swal.fire({

                        title:
                            "Save Failed",

                        text:
                            error.message ||
                            "Unable to save profile.",

                        icon:
                            "error",

                        confirmButtonColor:
                            "#4f46e5"
                    });

                } else {

                    alert(
                        error.message ||
                        "Unable to save profile."
                    );
                }
            }
        }
    );
}

// ======================================================
// ================= BACK DASHBOARD ======================
// ======================================================

function goDashboard() {

    window.location.href =
        "dashboard.html";
}

window.goDashboard =
    goDashboard;

// ======================================================
// ================= LOAD SAVED THEME ====================
// ======================================================

function loadSavedTheme() {

    const theme =
        localStorage.getItem("theme");

    if (
        theme === "light"
    ) {

        document.body.classList.add(
            "light-mode"
        );

    } else {

        document.body.classList.remove(
            "light-mode"
        );
    }
}

loadSavedTheme();

// ======================================================
// ================= IMAGE POPUP =========================
// ======================================================

function openImagePopup() {

    const popup =
        $("imageOptions");

    if (!popup) {
        return;
    }

    popup.style.display =
        "flex";
}

window.openImagePopup =
    openImagePopup;

// ======================================================
// ================= CLOSE IMAGE POPUP ===================
// ======================================================

function closeImagePopup() {

    const popup =
        $("imageOptions");

    if (!popup) {
        return;
    }

    popup.style.display =
        "none";
}

window.closeImagePopup =
    closeImagePopup;

// ======================================================
// ================= CHANGE PROFILE IMAGE ================
// ======================================================

function changeProfileImage() {

    const upload =
        $("profileUpload");

    if (upload) {
        upload.click();
    }

    closeImagePopup();
}

window.changeProfileImage =
    changeProfileImage;

// ======================================================
// ================= VIEW PROFILE IMAGE ==================
// ======================================================

function viewProfileImage() {

    const img =
        $("profileImg");

    if (!img) {
        return;
    }

    if (
        !img.src ||
        img.style.display === "none"
    ) {

        alert(
            "No profile image available."
        );

        return;
    }

    const popup =
        window.open(
            "",
            "_blank",
            "width=500,height=600"
        );

    if (!popup) {

        alert(
            "Please allow pop-ups to view the profile image."
        );

        return;
    }

    const safeImage =
        String(img.src)
            .replace(
                /"/g,
                "&quot;"
            );

    popup.document.write(`

        <!DOCTYPE html>

        <html>

        <head>

            <title>
                Profile Image
            </title>

            <meta
                name="viewport"
                content="width=device-width, initial-scale=1"
            >

        </head>

        <body
            style="
                margin:0;
                background:#111827;
                min-height:100vh;
                display:flex;
                flex-direction:column;
                justify-content:center;
                align-items:center;
                font-family:Arial,sans-serif;
            "
        >

            <img
                src="${safeImage}"
                alt="Profile Image"
                style="
                    width:400px;
                    height:400px;
                    max-width:90vw;
                    max-height:70vh;
                    object-fit:cover;
                    border-radius:20px;
                    box-shadow:0 20px 50px rgba(0,0,0,.4);
                "
            >

            <button
                onclick="window.close()"
                style="
                    margin-top:25px;
                    padding:12px 30px;
                    border:none;
                    border-radius:10px;
                    background:#4f46e5;
                    color:white;
                    cursor:pointer;
                    font-size:16px;
                "
            >
                ← Back
            </button>

        </body>

        </html>
    `);

    popup.document.close();
}

window.viewProfileImage =
    viewProfileImage;

// ======================================================
// ================= REMOVE PROFILE IMAGE ===============
// ======================================================

function removeProfileImage() {

    if (profileImg) {

        profileImg.src = "";

        profileImg.style.display =
            "none";
    }

    showProfileLetter();

    closeImagePopup();
}

window.removeProfileImage =
    removeProfileImage;

// ======================================================
// ================= NAME CHANGE LISTENER ================
// ======================================================

if (profileName) {

    profileName.addEventListener(
        "input",
        function () {

            updateProfileLetter();
        }
    );
}

// ======================================================
// ================= CLOSE POPUP OUTSIDE =================
// ======================================================

document.addEventListener(
    "click",
    function (event) {

        const popup =
            $("imageOptions");

        if (!popup) {
            return;
        }

        if (
            popup.style.display ===
            "flex"
        ) {

            const insidePopup =
                popup.contains(
                    event.target
                );

            if (!insidePopup) {

                popup.style.display =
                    "none";
            }
        }
    }
);

// ======================================================
// ================= INITIAL LOAD ========================
// ======================================================

if (
    profileImg &&
    !profileImg.src
) {

    profileImg.style.display =
        "none";
}

showProfileLetter();

// Load profile from Railway API
loadProfile();

// ======================================================
// ================= DEBUG ===============================
// ======================================================

console.log(
    "======================================"
);

console.log(
    "Profile JS Loaded ✅"
);

console.log(
    "User:",
    userEmail
);

console.log(
    "Profile LocalStorage:",
    "DISABLED ✅"
);

console.log(
    "Profile API:",
    "CONNECTED ✅"
);

console.log(
    "GET:",
    "/api/profile/:email"
);

console.log(
    "PUT:",
    "/api/profile/:email"
);

console.log(
    "======================================"
);