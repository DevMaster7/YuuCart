let bubbleCon = document.querySelector(".right");
setInterval(() => {
    const style = window.getComputedStyle(bubbleCon);
    if (style.display === "none") {
        bubbleCon = document.querySelector(".left")
    }
}, 1000);

let head = document.getElementsByTagName("head")[0];
if (head.dataset.info == "enter-pass") {
    let forgotPassHTML = `<div class="pass-con">
        <form id="enterPassForm" class="pass-form" action="/set-new-forgot" method="post">
        <div class="heading">Enter Your New Password</div>
        <div class="field">
                        <input type="password" id="new-pass" name="password" placeholder=" " required />
                        <label for="password">Password</label>
                        <i class="fa-solid fa-eye eye"></i>
                    </div>
                    <div class="field">
                        <input type="password" id="new-confirm-pass" name="confirm-password" placeholder=" " required />
                        <label for="confirm-password">Confirm Password</label>
                        <i class="fa-solid fa-eye eye"></i>
                    </div>
            <div class="err-msg"></div>
            <button type="submit">Continue</button>
          </form>
        </div>`;
    document.querySelector("body").style.overflow = "hidden";
    document.querySelector(".main-container").querySelector(".con").innerHTML = forgotPassHTML;

    document.querySelector(".pass-con").addEventListener("click", (e) => {
        if (!e.target.closest(".pass-form")) {
            document.querySelector(".pass-con").remove();
            document.querySelector("body").style.overflow = "auto";
        }
    });

    document.getElementById("enterPassForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        let password = document.getElementById("new-pass").value;
        let confirmPassword = document.getElementById("new-confirm-pass").value;
        let res = await fetch("/set-new-forgot", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                password,
                confirmPassword
            })
        });
        let data = await res.json();
        if (data.success) {
            window.location.href = "/user/login";
        } else {
            let ele = document.querySelector(".pass-con").querySelector(".err-msg")
            ele.innerHTML = data.message;
            setTimeout(() => {
                ele.innerHTML = "";
            }, 2000);
        }
    });
}

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

let passEye = document.querySelectorAll(".eye")
passEye.forEach((e) => {
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

let captchaToken = null;

document.querySelector(".forgot-btn").addEventListener("click", () => {
    const overlay = document.createElement("div");
    overlay.classList.add("overlay");

    overlay.innerHTML = `
        <div class="cap-con">
            <div class="heading-text">Verify If You Want To Send Email</div>
            <form id="capForm" action="/verify-captcha" method="post">
                <div class="field">
                    <input type="email" name="email" placeholder=" " required />
                    <label for="email">Email</label>
                </div>
                <div id="captcha-container" style="transform: scale(0.8); transform-origin: center;"></div>
                <div class="err-msg"></div>

                <!-- button changed to type="button" -->
                <button id="finalSubmitBtn" type="button">Send Email</button>
            </form>
        </div>`;

    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";

    // render captcha
    let gcp = document.getElementsByTagName("head")[0].dataset.gcp;
    grecaptcha.render("captcha-container", {
        sitekey: gcp,
        callback: (token) => {
            captchaToken = token; // save but don't submit
        }
    });

    // close popup on outside click
    overlay.addEventListener("click", (e) => {
        if (!e.target.closest(".cap-con")) {
            overlay.remove();
            document.body.style.overflow = "auto";
        }
    });

    // now final button will call submit handler
    document.getElementById("finalSubmitBtn").addEventListener("click", () => {
        handleFinalSubmit("forgot");
    });
});

async function handleFinalSubmit(purpose) {
    const form = document.getElementById("capForm");
    const email = form.getElementsByTagName("input")[0].value;

    // validations
    if (!email.trim()) {
        return showError("Please enter your email.");
    }

    if (!captchaToken) {
        return showError("Please complete the captcha.");
    }

    // send verification request
    const response = await fetch(form.action, {
        method: form.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, cap_token: captchaToken, purpose })
    });

    const result = await response.json();

    if (result.success) {
        window.location.href = `/send/verification-email?email=${email}&location=login&purpose=${purpose}`;
    } else {
        showError(result.message);
    }
}

function showError(msg) {
    const err = document.querySelector(".cap-con .err-msg");
    err.innerHTML = msg;

    setTimeout(() => {
        err.innerHTML = "";
    }, 2000);
}

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
