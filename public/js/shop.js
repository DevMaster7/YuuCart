if (document.cookie.includes("token")) {
    document.querySelector("#login").style.display = "none";
    document.querySelector("#register").style.display = "none";
    document.querySelector(".user-con").style.display = "flex";
    document.querySelector(".cart-con").style.display = "flex";
}

let x = 0
document.querySelector(".user-content-con").addEventListener("mouseleave", () => {
    document.querySelector(".user-content-con").style.display = "none";
    x = 0
})
document.querySelector(".user-con").addEventListener("click", () => {
    if (x == 0) {
        document.querySelector(".user-content-con").style.display = "flex";
        x = 1
    }
    else {
        document.querySelector(".user-content-con").style.display = "none";
        x = 0
    }
})
document.querySelector(".logout").addEventListener("click", () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
    window.location.href = '/shop';
})
document.querySelector(".left").addEventListener("click", () => {
    window.location.href = '/shop';
})
document.getElementById("register").addEventListener("click", () => {
    window.location.href = '/register';
})
document.getElementById("login").addEventListener("click", () => {
    window.location.href = '/login';
})