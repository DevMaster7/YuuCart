document.querySelector(".center").addEventListener("click", () => {
    window.location.href = '/shop';
})

window.addEventListener("scroll", () => {
    let scrollPosition = window.scrollY;
    if (scrollPosition > 10) {
        document.querySelector(".nav-con").classList.add("sticky");
    } else {
        document.querySelector(".nav-con").classList.remove("sticky");
    }
});

document.querySelector(".left").addEventListener("click", () => {
    let icon = document.querySelector(".nav-con").querySelector(".left").getElementsByTagName("i")[0]
    if (icon.classList.contains("fa-bars")) {
        icon.classList.remove("fa-bars")
        icon.classList.add("fa-xmark")
        document.querySelector(".side-nav-con").style.display = "flex";
        setTimeout(() => {
            document.querySelector(".side-nav").style.transform = "translateX(0%)";
        }, 120);
    }
    else {
        icon.classList.remove("fa-xmark")
        icon.classList.add("fa-bars")
        document.querySelector(".side-nav").style.transform = "translateX(-100%)";
        setTimeout(() => {
            document.querySelector(".side-nav-con").style.display = "none";
        }, 300);
    }
})

document.addEventListener("click", (e) => {
    if (e.target == document.querySelector(".side-nav-con")) {
        let icon = document.querySelector(".nav-con").querySelector(".left").getElementsByTagName("i")[0]
        icon.classList.remove("fa-xmark")
        icon.classList.add("fa-bars")
        document.querySelector(".side-nav").style.transform = "translateX(-100%)";
        setTimeout(() => {
            document.querySelector(".side-nav-con").style.display = "none";
        }, 300);
    }
})
