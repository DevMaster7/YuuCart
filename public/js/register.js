let bubbleCon = document.querySelector(".left")
let showPass = document.querySelectorAll(".eye")

setInterval(() => {
    const style = window.getComputedStyle(bubbleCon);
    if (style.display === "none") {
        bubbleCon = document.querySelector(".right")
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
        let passCon = e.parentElement.querySelector("input");
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
document.querySelector(".login-btn").addEventListener("click", () => {
    window.location.href = '/user/login';
})
let err = document.querySelector(".err-msg")
document.getElementById("registerForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    const fullname = document.getElementById('fullname').value;
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const city = document.getElementById('city').value;
    const res = await fetch('/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullname, username, email, password, confirmPassword, city, phone, address })
    });
    const data = await res.json();
    if (data.success) {
        window.location.href = '/user/login'
    }
    else {
        err.innerHTML = data.message
        err.style.display = "block"
    }
});
