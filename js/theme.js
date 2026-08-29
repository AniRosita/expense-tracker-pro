/* ======================================================
   EXPENSE TRACKER PRO - GLOBAL THEME SYSTEM
   DARK + LIGHT MODE
   ====================================================== */

"use strict";

/* ======================================================
   APPLY THEME IMMEDIATELY
   Prevents theme mismatch / white flash
   ====================================================== */

(function () {

    const savedTheme =
        localStorage.getItem("theme") || "dark";

    const isLight =
        savedTheme === "light";

    document.documentElement.classList.toggle(
        "light-mode",
        isLight
    );

})();


/* ======================================================
   THEME SYSTEM
   ====================================================== */

document.addEventListener("DOMContentLoaded", function () {

    const themeBtn =
        document.getElementById("themeBtn");


    /* ==================================================
       APPLY THEME
       ================================================== */

    function applyTheme(theme) {

        const isLight =
            theme === "light";

        /* HTML */

        document.documentElement.classList.toggle(
            "light-mode",
            isLight
        );


        /* BODY */

        if (document.body) {

            document.body.classList.toggle(
                "light-mode",
                isLight
            );

        }


        /* ==================================================
           THEME BUTTON
           ================================================== */

        if (themeBtn) {

            if (isLight) {

                themeBtn.innerHTML =
                    "🌙 Dark Mode";

            } else {

                themeBtn.innerHTML =
                    "☀️ Light Mode";

            }

        }

    }


    /* ==================================================
       LOAD SAVED THEME
       ================================================== */

    let savedTheme =
        localStorage.getItem("theme");

    if (
        savedTheme !== "light" &&
        savedTheme !== "dark"
    ) {

        savedTheme = "dark";

        localStorage.setItem(
            "theme",
            "dark"
        );

    }


    applyTheme(savedTheme);


    /* ==================================================
       THEME BUTTON CLICK
       ================================================== */

    if (themeBtn) {

        themeBtn.addEventListener(
            "click",
            function () {

                const currentTheme =
                    localStorage.getItem("theme") ||
                    "dark";


                const newTheme =
                    currentTheme === "light"
                        ? "dark"
                        : "light";


                /* ==================================================
                   SMOOTH TRANSITION
                   ================================================== */

                document.documentElement.classList.add(
                    "theme-transition"
                );

                document.body.classList.add(
                    "theme-transition"
                );


                /* ==================================================
                   SAVE THEME
                   ================================================== */

                localStorage.setItem(
                    "theme",
                    newTheme
                );


                /* ==================================================
                   APPLY NEW THEME
                   ================================================== */

                applyTheme(newTheme);


                /* ==================================================
                   REMOVE TRANSITION
                   ================================================== */

                setTimeout(function () {

                    document.documentElement.classList.remove(
                        "theme-transition"
                    );

                    document.body.classList.remove(
                        "theme-transition"
                    );

                }, 400);


                console.log(
                    "Theme changed to:",
                    newTheme
                );

            }
        );

    }


    /* ==================================================
       GLOBAL TOGGLE FUNCTION
       Supports onclick="toggleTheme()"
       ================================================== */

    window.toggleTheme = function () {

        const currentTheme =
            localStorage.getItem("theme") ||
            "dark";


        const newTheme =
            currentTheme === "light"
                ? "dark"
                : "light";


        document.documentElement.classList.add(
            "theme-transition"
        );

        document.body.classList.add(
            "theme-transition"
        );


        localStorage.setItem(
            "theme",
            newTheme
        );


        applyTheme(newTheme);


        setTimeout(function () {

            document.documentElement.classList.remove(
                "theme-transition"
            );

            document.body.classList.remove(
                "theme-transition"
            );

        }, 400);


        console.log(
            "Theme changed to:",
            newTheme
        );

    };


    /* ==================================================
       SUCCESS LOG
       ================================================== */

    console.log(
        "Global Theme System Loaded Successfully ✅"
    );

});