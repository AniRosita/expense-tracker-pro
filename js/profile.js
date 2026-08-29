// ======================================================
// ============== EXPENSE TRACKER PRO ===================
// ===================== PROFILE JS ======================
// ============== SERVER API VERSION ====================
// ============== PROFILE IMAGE SUPPORT =================
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
    localStorage.getItem("userEmail") ||
    sessionStorage.getItem("userEmail");

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
// ================= PROFILE IMAGE DATA =================
// ======================================================

let selectedProfileImage = "";
let savedProfileImage = "";

// ======================================================
// ================= API HELPER ==========================
// ======================================================

async function profileAPI(endpoint, options = {}) {

    const response = await fetch(
        API_BASE + endpoint,
        {
            ...options,
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                ...(options.headers || {})
            }
        }
    );

    let data = {};

    try {
        data = await response.json();
    } catch (error) {
        throw new Error("Invalid server response");
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
        name.charAt(0).toUpperCase();

    profileLetter.style.display =
        "flex";
}

// ======================================================
// ================= SHOW PROFILE IMAGE =================
// ================= BROKEN IMAGE FIX ===================
// ======================================================

function showProfileImage(image) {

    if (!profileImg || !image) {
        hideProfileImage();
        return;
    }

    // Clear previous error handler
    profileImg.onerror = null;

    // If image fails to load
    profileImg.onerror = function () {

        console.error(
            "PROFILE IMAGE LOAD FAILED"
        );

        savedProfileImage = "";
        selectedProfileImage = "";

        hideProfileImage();
    };

    profileImg.onload = function () {

        profileImg.style.display = "block";

        if (profileLetter) {
            profileLetter.style.display = "none";
        }

    };

    profileImg.src = image;
}

// ======================================================
// ================= HIDE PROFILE IMAGE =================
// ======================================================

function hideProfileImage() {

    if (profileImg) {
        profileImg.src = "";
        profileImg.style.display = "none";
    }

    showProfileLetter();
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
            profileLetter.style.display = "none";
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

        // ==================================================
        // NAME
        // ==================================================

        if (profileName) {
            profileName.value =
                profile.name || "";
        }

        // ==================================================
        // EMAIL
        // ==================================================

        if (profileEmail) {
            profileEmail.value =
                profile.email ||
                userEmail;
        }

        // ==================================================
        // COUNTRY
        // ==================================================

        if (profileCountry) {
            profileCountry.value =
                profile.country || "";
        }

        // ==================================================
        // CURRENCY
        // ==================================================

        if (profileCurrency) {
            profileCurrency.value =
                profile.currency ||
                "INR";
        }

        // ==================================================
        // MINIMUM BALANCE
        // ==================================================

        if (minimumBalance) {
            minimumBalance.value =
                profile.minimumBalance ?? 0;
        }

        // ==================================================
        // PROFILE IMAGE
        // ==================================================

        const serverImage =
            profile.profileImage ||
            profile.profile_image ||
            profile.image ||
            profile.imageUrl ||
            profile.image_url ||
            "";

        if (serverImage) {

            savedProfileImage =
                serverImage;

            selectedProfileImage =
                serverImage;

            showProfileImage(
                serverImage
            );

        } else {

            savedProfileImage = "";
            selectedProfileImage = "";

            hideProfileImage();
        }

        console.log(
            "Profile loaded successfully ✅",
            profile
        );

    } catch (error) {

        console.error(
            "LOAD PROFILE ERROR:",
            error
        );

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

            // ==================================================
            // IMAGE TYPE
            // ==================================================

            if (
                !file.type.startsWith("image/")
            ) {

                alert(
                    "Please select a valid image file."
                );

                this.value = "";
                return;
            }

            // ==================================================
            // IMAGE SIZE
            // ==================================================

            const maxSize =
                5 * 1024 * 1024;

            if (file.size > maxSize) {

                alert(
                    "Image size must be less than 5 MB."
                );

                this.value = "";
                return;
            }

            // ==================================================
            // READ IMAGE
            // ==================================================

            const reader =
                new FileReader();

            reader.onload =
                function (event) {

                    const imageData =
                        event.target.result;

                    selectedProfileImage =
                        imageData;

                    showProfileImage(
                        imageData
                    );

                    console.log(
                        "Profile image selected ✅"
                    );
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

            // ==================================================
            // VALIDATION
            // ==================================================

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

            // ==================================================
            // MINIMUM BALANCE
            // ==================================================

            const minimumValue =
                Number(minimum);

            if (
                !Number.isFinite(
                    minimumValue
                ) ||
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

            // ==================================================
            // SHOW LOADING
            // ==================================================

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

                    didOpen: () => {
                        Swal.showLoading();
                    }
                });
            }

            try {

                console.log(
                    "Saving profile to server..."
                );

                // ==================================================
                // PROFILE DATA
                // ==================================================

                const profileData = {

                    name:
                        name,

                    country:
                        country,

                    currency:
                        currency,

                    minimumBalance:
                        minimumValue,

                    // PROFILE IMAGE
                    profileImage:
                        selectedProfileImage || ""
                };

                console.log(
                    "Profile data being sent:",
                    {
                        name:
                            name,
                        country:
                            country,
                        currency:
                            currency,
                        minimumBalance:
                            minimumValue,
                        hasProfileImage:
                            !!selectedProfileImage
                    }
                );

                // ==================================================
                // SAVE TO SERVER
                // ==================================================

                const data =
                    await profileAPI(
                        "/api/profile/" +
                        encodeURIComponent(
                            userEmail
                        ),
                        {
                            method:
                                "PUT",

                            body:
                                JSON.stringify(
                                    profileData
                                )
                        }
                    );

                console.log(
                    "PROFILE SAVED ✅",
                    data
                );

                // ==================================================
                // UPDATE LOCAL IMAGE STATE
                // ==================================================

                if (
                    selectedProfileImage
                ) {

                    savedProfileImage =
                        selectedProfileImage;
                }

                // ==================================================
                // SUCCESS
                // ==================================================

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

                // ==================================================
                // GO DASHBOARD
                // ==================================================

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

    if (
        !img ||
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

    selectedProfileImage = "";
    savedProfileImage = "";

    hideProfileImage();

    if (profileUpload) {
        profileUpload.value = "";
    }

    closeImagePopup();

    console.log(
        "Profile image removed from current profile ✅"
    );
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

if (profileImg) {
    profileImg.style.display =
        "none";
}

showProfileLetter();

// ======================================================
// LOAD PROFILE FROM RAILWAY API
// ======================================================

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
    "Profile Image:",
    "SERVER SYNC ENABLED ✅"
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