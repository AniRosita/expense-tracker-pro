function showToast(message, type = "success") {
    const toast = document.createElement("div");

    toast.className = "toast";

    if (type === "error") {
        toast.classList.add("error");
    }

    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        if (toast && toast.parentNode) {
            toast.remove();
        }
    }, 3000);
}