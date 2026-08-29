// ======================================================
// ================= EXPENSE TRACKER PRO =================
// ===================== THEME JS =========================
// ======================================================

"use strict";

// ======================================================
// ================= LOAD GLOBAL THEME ==================
// ======================================================

function loadGlobalTheme() {

    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "light") {
        document.body.classList.add("light-mode");
    } else {
        document.body.classList.remove("light-mode");
    }

    updateGlobalThemeButton();
}

// ======================================================
// ================ UPDATE THEME BUTTON =================
// ======================================================

function updateGlobalThemeButton() {

    const themeButtons = document.querySelectorAll(
        "#themeBtn, .theme-btn"
    );

    const isLight =
        document.body.classList.contains("light-mode");

    themeButtons.forEach(function (button) {

        button.innerHTML = isLight
            ? "🌙 Dark Mode"
            : "☀️ Light Mode";

    });
}

// ======================================================
// ================= CHANGE THEME ========================
// ======================================================

function toggleGlobalTheme() {

    document.body.classList.toggle("light-mode");

    const isLight =
        document.body.classList.contains("light-mode");

    // Save theme globally
    localStorage.setItem(
        "theme",
        isLight ? "light" : "dark"
    );

    // Update all theme buttons
    updateGlobalThemeButton();
}

// ======================================================
// ================= THEME BUTTON CLICK =================
// ======================================================

document.addEventListener("click", function (event) {

    const button = event.target.closest(
        "#themeBtn, .theme-btn"
    );

    if (!button) {
        return;
    }

    event.preventDefault();

    toggleGlobalTheme();
});

// ======================================================
// ================= PAGE LOAD ===========================
// ======================================================

document.addEventListener("DOMContentLoaded", function () {

    loadGlobalTheme();

});

// ======================================================
// ================= GLOBAL FUNCTIONS ====================
// ======================================================

window.loadGlobalTheme =
    loadGlobalTheme;

window.toggleGlobalTheme =
    toggleGlobalTheme;

window.updateGlobalThemeButton =
    updateGlobalThemeButton;