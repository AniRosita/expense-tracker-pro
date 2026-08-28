// ======================================================
// ================= EXPENSE TRACKER PRO =================
// ===================== PROFILE JS =======================
// ============== NO EXPENSE/INCOME LOCALSTORAGE =========
// ======================================================

"use strict";

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
// ================= LOAD PROFILE EMAIL ==================
// ======================================================

if (profileEmail) {
    profileEmail.value =
        userEmail;
}

// ======================================================
// ================= LOAD PROFILE DATA ===================
// ======================================================

let savedProfile = null;

try {
    savedProfile =
        JSON.parse(
            localStorage.getItem(
                "profileData"
            )
        );
} catch (error) {

    console.warn(
        "Invalid profileData found. Resetting profile data."
    );

    localStorage.removeItem(
        "profileData"
    );

    savedProfile = null;
}

// ======================================================
// ================= DEFAULT PROFILE =====================
// ======================================================

if (profileCurrency &&
    !profileCurrency.value) {

    profileCurrency.value =
        "INR";
}

// ======================================================
// ================= APPLY PROFILE DATA ==================
// ======================================================

if (savedProfile) {

    if (profileName) {

        profileName.value =
            savedProfile.name || "";
    }

    if (profileCountry) {

        profileCountry.value =
            savedProfile.country || "";
    }

    if (profileCurrency) {

        profileCurrency.value =
            savedProfile.currency ||
            "INR";
    }

    if (minimumBalance) {

        minimumBalance.value =
            savedProfile.minimumBalance ||
            "";
    }
}

// ======================================================
// ================= PROFILE IMAGE LOAD ==================
// ======================================================

function loadProfileImage() {

    const savedImage =
        localStorage.getItem(
            "profileImage"
        );

    if (
        savedImage &&
        profileImg
    ) {

        profileImg.src =
            savedImage;

        profileImg.style.display =
            "block";

        if (profileLetter) {

            profileLetter.style.display =
                "none";
        }

        return;
    }

    if (profileImg) {

        profileImg.style.display =
            "none";
    }

    showProfileLetter();
}

// ======================================================
// ================= PROFILE LETTER =====================
// ======================================================

function showProfileLetter() {

    if (!profileLetter) {
        return;
    }

    const name =
        profileName?.value?.trim() ||
        savedProfile?.name?.trim() ||
        "User";

    profileLetter.innerText =
        name.charAt(0)
            .toUpperCase();

    profileLetter.style.display =
        "flex";
}

// ======================================================
// ================= UPDATE PROFILE LETTER ==============
// ======================================================

function updateProfileLetter() {

    const savedImage =
        localStorage.getItem(
            "profileImage"
        );

    if (savedImage) {
        return;
    }

    showProfileLetter();
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
            // IMAGE VALIDATION
            // ------------------------------------------

            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                alert(
                    "Please select a valid image file."
                );

                this.value =
                    "";

                return;
            }

            // ------------------------------------------
            // SIZE VALIDATION
            // ------------------------------------------

            const maxSize =
                5 * 1024 * 1024;

            if (
                file.size >
                maxSize
            ) {

                alert(
                    "Image size must be less than 5 MB."
                );

                this.value =
                    "";

                return;
            }

            // ------------------------------------------
            // READ IMAGE
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

                    localStorage.setItem(
                        "profileImage",
                        imageData
                    );
                };

            reader.onerror =
                function () {

                    alert(
                        "Unable to load profile image."
                    );
                };

            reader.readAsDataURL(
                file
            );
        }
    );
}

// ======================================================
// ================= SAVE PROFILE ========================
// ======================================================

if (saveProfileBtn) {

    saveProfileBtn.addEventListener(
        "click",
        function () {

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
                    : "";

            // ------------------------------------------
            // VALIDATION
            // ------------------------------------------

            if (!name) {

                if (typeof Swal !== "undefined") {

                    Swal.fire({
                        title: "Name Required",
                        text: "Please enter your name.",
                        icon: "warning",
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
            // PROFILE OBJECT
            // ------------------------------------------

            const profile = {

                name:
                    name,

                country:
                    country,

                currency:
                    currency || "INR",

                minimumBalance:
                    minimum
            };

            // ------------------------------------------
            // SAVE PROFILE ONLY
            // ------------------------------------------

            localStorage.setItem(
                "profileData",
                JSON.stringify(
                    profile
                )
            );

            // Update letter immediately
            updateProfileLetter();

            // ------------------------------------------
            // SUCCESS MESSAGE
            // ------------------------------------------

            if (
                typeof Swal !==
                "undefined"
            ) {

                Swal.fire({

                    title:
                        "Success!",

                    text:
                        "Profile Saved Successfully ✅",

                    icon:
                        "success",

                    confirmButtonColor:
                        "#4f46e5"
                }).then(
                    function () {

                        window.location.href =
                            "dashboard.html";
                    }
                );

            } else {

                alert(
                    "Profile Saved Successfully ✅"
                );

                window.location.href =
                    "dashboard.html";
            }
        }
    );
}

// ======================================================
// ================= BACK DASHBOARD =====================
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
        localStorage.getItem(
            "theme"
        );

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
// ================= CHANGE PROFILE IMAGE ===============
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

    localStorage.removeItem(
        "profileImage"
    );

    if (profileImg) {

        profileImg.src =
            "";

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

            const target =
                event.target;

            const insidePopup =
                popup.contains(
                    target
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

loadProfileImage();

showProfileLetter();

// If image exists, hide letter again
const existingImage =
    localStorage.getItem(
        "profileImage"
    );

if (
    existingImage &&
    profileImg
) {

    profileImg.style.display =
        "block";

    if (profileLetter) {

        profileLetter.style.display =
            "none";
    }
}

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
    "Expense/Income LocalStorage:",
    "DISABLED ✅"
);

console.log(
    "======================================"
);