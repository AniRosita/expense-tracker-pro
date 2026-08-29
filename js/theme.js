```javascript
/* ======================================================
   EXPENSE TRACKER PRO - GLOBAL THEME SYSTEM
   ====================================================== */

"use strict";

document.addEventListener("DOMContentLoaded", function () {

    const themeBtn = document.getElementById("themeBtn");

    /* ==================================================
       APPLY SAVED THEME
       ================================================== */

    function applyTheme(theme) {

        const isLight = theme === "light";

        // HTML
        document.documentElement.classList.toggle(
            "light-mode",
            isLight
        );

        // BODY
        document.body.classList.toggle(
            "light-mode",
            isLight
        );

        // Theme button text
        if (themeBtn) {

            if (isLight) {
                themeBtn.innerHTML = "🌙 Dark Mode";
            } else {
                themeBtn.innerHTML = "☀️ Light Mode";
            }
        }
    }

    /* ==================================================
       LOAD SAVED THEME
       ================================================== */

    const savedTheme =
        localStorage.getItem("theme") || "dark";

    applyTheme(savedTheme);

    /* ==================================================
       THEME BUTTON
       ================================================== */

    if (themeBtn) {

        themeBtn.addEventListener("click", function () {

            const currentTheme =
                localStorage.getItem("theme") || "dark";

            const newTheme =
                currentTheme === "light"
                    ? "dark"
                    : "light";

            /* Smooth transition */
            document.documentElement.classList.add(
                "theme-transition"
            );

            document.body.classList.add(
                "theme-transition"
            );

            /* Save theme */
            localStorage.setItem(
                "theme",
                newTheme
            );

            /* Apply theme */
            applyTheme(newTheme);

            /* Remove transition class */
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
        });
    }

    console.log(
        "Global Theme System Loaded Successfully ✅"
    );
});
```
