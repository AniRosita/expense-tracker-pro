function showToast(message, type = "success") {

    const toast = document.createElement("div");

    toast.className = "toast";

    if(type === "error"){
        toast.classList.add("error");
    }

    toast.innerText = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);

}