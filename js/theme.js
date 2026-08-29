```javascript
/* ======================================================
   EXPENSE TRACKER PRO - GLOBAL THEME SYSTEM
   ====================================================== */

"use strict";

(function () {

    /* ==================================================
       GET SAVED THEME
       ================================================== */

    const savedTheme = localStorage.getItem("theme") || "dark";


    /* ==================================================
       APPLY THEME
       ================================================== */

    function applyTheme(theme) {

        const html = document.documentElement;
        const body = document.body;

        if (theme === "light") {

            html.classList.add("light-mode");

            if (body) {
                body.classList.add("light-mode");
            }

        } else {

            html.classList.remove("light-mode");

            if (body) {
                body.classList.remove("light-mode");
            }
        }
    }


    /* ==================================================
       APPLY INITIAL THEME
       ================================================== */

    applyTheme(savedTheme);


    /* ==================================================
       THEME BUTTON
       ================================================== */

    function setupThemeButton() {

        const themeBtn = document.getElementById("themeBtn");

        if (!themeBtn) {
            return;
        }


        /* Avoid duplicate event listeners */

        if (themeBtn.dataset.themeReady === "true") {
            return;
        }

        themeBtn.dataset.themeReady = "true";


        /* ==================================================
           BUTTON CLICK
           ================================================== */

        themeBtn.addEventListener("click", function () {

            const html = document.documentElement;

            const isLight =
                html.classList.contains("light-mode");


            const newTheme =
                isLight ? "dark" : "light";


            /* Smooth transition */

            document.body.classList.add("theme-transition");


            /* Save theme */

            localStorage.setItem("theme", newTheme);


            /* Apply theme */

            applyTheme(newTheme);


            /* Update button */

            updateThemeButton();


            /* Remove transition class */

            setTimeout(function () {

                document.body.classList.remove(
                    "theme-transition"
                );

            }, 400);

        });

    }


    /* ==================================================
       UPDATE THEME BUTTON TEXT
       ================================================== */

    function updateThemeButton() {

        const themeBtn =
            document.getElementById("themeBtn");

        if (!themeBtn) {
            return;
        }


        const isLight =
            document.documentElement.classList.contains(
                "light-mode"
            );


        if (isLight) {

            themeBtn.innerHTML =
                "🌙 Dark Mode";

        } else {

            themeBtn.innerHTML =
                "☀️ Light Mode";
        }

    }


    /* ==================================================
       DOM READY
       ================================================== */

    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            function () {

                applyTheme(
                    localStorage.getItem("theme") || "dark"
                );

                setupThemeButton();
                updateThemeButton();

            }
        );

    } else {

        applyTheme(
            localStorage.getItem("theme") || "dark"
        );

        setupThemeButton();
        updateThemeButton();

    }


    /* ==================================================
       GLOBAL THEME FUNCTIONS
       ================================================== */

    window.applyTheme = applyTheme;

})();
```
