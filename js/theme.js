```javascript
// ======================================================
// ================= EXPENSE TRACKER PRO =================
// ===================== THEME JS =========================
// ======================================================

"use strict";

// ======================================================
// ================= GET SAVED THEME ====================
// ======================================================

function getSavedTheme() {

    const savedTheme = localStorage.getItem("theme");

    return savedTheme === "light"
        ? "light"
        : "dark";
}

// ======================================================
// ================= APPLY GLOBAL THEME =================
// ======================================================

function applyGlobalTheme(theme) {

    const body = document.body;

    if (!body) {
        return;
    }

    // Smooth theme transition
    body.classList.add("theme-transition");

    if (theme === "light") {
        body.classList.add("light-mode");
    } else {
        body.classList.remove("light-mode");
    }

    // Remove transition class after animation
    window.requestAnimationFrame(function () {

        setTimeout(function () {
            body.classList.remove("theme-transition");
        }, 350);

    });

    updateGlobalThemeButton();
}

// ======================================================
// ================= LOAD GLOBAL THEME ==================
// ======================================================

function loadGlobalTheme() {

    const savedTheme = getSavedTheme();

    applyGlobalTheme(savedTheme);
}

// ======================================================
// ================ UPDATE THEME BUTTON =================
// ======================================================

function updateGlobalThemeButton() {

    const themeButtons = document.querySelectorAll(
        "#themeBtn, .theme-btn"
    );

    const isLight =
        document.body &&
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

    const isLight =
        document.body.classList.contains("light-mode");

    const newTheme =
        isLight ? "dark" : "light";

    // Save globally BEFORE changing page
    localStorage.setItem(
        "theme",
        newTheme
    );

    // Apply immediately
    applyGlobalTheme(newTheme);
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

    // Apply saved theme to current page
    loadGlobalTheme();

});

// ======================================================
// ================= GLOBAL FUNCTIONS ====================
// ======================================================

window.getSavedTheme =
    getSavedTheme;

window.applyGlobalTheme =
    applyGlobalTheme;

window.loadGlobalTheme =
    loadGlobalTheme;

window.toggleGlobalTheme =
    toggleGlobalTheme;

window.updateGlobalThemeButton =
    updateGlobalThemeButton;
```
