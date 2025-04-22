if (document.cookie.includes("token")) {
    document.querySelector("#login").style.display = "none";
    document.querySelector("#register").style.display = "none";
    document.querySelector(".user-con").style.display = "flex";
    document.querySelector(".cart-con").style.display = "flex";
}

document.querySelector(".left").addEventListener("click", () => {
    window.location.href = '/shop';
})
document.getElementById("register").addEventListener("click", () => {
    window.location.href = '/register';
})
document.getElementById("login").addEventListener("click", () => {
    window.location.href = '/login';
})