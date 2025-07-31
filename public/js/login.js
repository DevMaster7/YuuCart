let bubbleCon = document.querySelector(".right")
let showPass = document.querySelectorAll(".eye")
setInterval(() => {
    const style = window.getComputedStyle(bubbleCon);
    if (style.display === "none") {
        bubbleCon = document.querySelector(".left")
    }
}, 1000);


function createBubble() {
    let bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.style.left = `${Math.random() * 100}%`;
    let size = 50 + Math.random() * 20;
    bubble.style.width = bubble.style.height = `${size}px`;
    bubble.style.animationDuration = `${10 + Math.random() * 6}s`;
    bubbleCon.appendChild(bubble);

    setTimeout(() => {
        bubble.remove();
    }, 10000);
}
setInterval(createBubble, 1400);


showPass.forEach((e) => {
    e.addEventListener("click", () => {
        let passCon = e.previousElementSibling;
        if (passCon.type === "password") {
            passCon.type = "text"
            e.classList.remove("fa-eye")
            e.classList.add("fa-eye-slash")
        }
        else {
            passCon.type = "password"
            e.classList.remove("fa-eye-slash")
            e.classList.add("fa-eye")
        }
    })
})


document.querySelector(".icon").addEventListener("click", () => {
    window.location.href = '/';
})
document.querySelector(".register-btn").addEventListener("click", () => {
    window.location.href = '/user/register';
})
let err = document.querySelector(".err-msg")
document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const res = await fetch('/user/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (data.message === "Admin") {
        return window.location.href = '/admin'
    }
    else if (data.message === "User") {
        return window.location.href = '/shop'
    }
    else {
        err.innerHTML = data.message
        err.style.display = "block"
    }
});
