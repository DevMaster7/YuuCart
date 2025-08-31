let bubbleCon = document.querySelector(".right")
// let showPass = document.querySelector(".eye")
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

let eye = document.querySelector(".eye")
eye.addEventListener("click", () => {
    let passCon = document.querySelector("#password");
    if (passCon.type === "password") {
        passCon.type = "text"
        eye.classList.remove("fa-eye")
        eye.classList.add("fa-eye-slash")
    }
    else {
        passCon.type = "password"
        eye.classList.remove("fa-eye-slash")
        eye.classList.add("fa-eye")
    }
})

document.querySelector(".forgot-btn").addEventListener("click", () => {
    const overlay = document.createElement("div");
    overlay.classList.add("overlay");
    overlay.innerHTML = `
        <div class="cap-con">
            <div class="heading-text">Verify If You Want To Send Email</div>
            <form id="capForm" action="/login-change-pass" method="post">
                <div class="field">
                    <input type="email" name="email" placeholder=" " required />
                    <label for="email">Email</label>
                </div>
                <div id="captcha-container" style="transform: scale(0.8); transform-origin: center;"></div>
                <div class="err-msg"></div>
                <button type="submit">Send Email</button>
            </form>
        </div>`;
    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";

    grecaptcha.render("captcha-container", {
        sitekey: "6LdTOrcrAAAAAJ5lTh8huR1i2Na0bEgO3Zqi-8tF",
    });

    overlay.addEventListener("click", (e) => {
        if (!e.target.closest(".cap-con")) {
            overlay.remove();
            document.body.style.overflow = "auto";
        }
    });
    const form = document.getElementById("capForm");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = form.getElementsByTagName("input")[0].value;
        const cap_token = grecaptcha.getResponse();
        try {
            const response = await fetch(form.action, {
                method: form.method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, cap_token })
            });

            const result = await response.json();
            if (result.success) {
                window.location.href = `/sendmail/forgot-password?email=${email}`;
            }
            else {
                document.querySelector(".cap-con").querySelector(".err-msg").innerHTML = result.message
            }
        } catch (error) {
            console.error("Error:", error);
        }
    });
});

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
