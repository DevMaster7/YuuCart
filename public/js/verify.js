let head = document.getElementsByTagName("head")[0];
const expiresAt = new Date(head.dataset.expiretime);
const timerEl = document.querySelector(".resend").getElementsByTagName("span")[0];
// console.log(expiresAt, timerEl);
function updateTimer() {
    const now = new Date();
    const diff = expiresAt - now;
    if (diff <= 0) {
        document.querySelector(".resend").innerHTML = `Didn’t get the code? <button>Resend</button> OTP`
        let btn = document.querySelector(".resend").getElementsByTagName("button")[0]
        btn.addEventListener("click", async () => {
            const overlay = document.createElement("div");
            overlay.classList.add("overlay");
            overlay.innerHTML = `
            <form class="cap-con" id="capForm" action="/verify-captcha" method="post">
            <div id="captcha-container" style="transform: scale(0.8); transform-origin: center;"></div>
            <div class="err-msg"></div>
            </form>`;
            document.body.appendChild(overlay);
            document.body.style.overflow = "hidden";

            grecaptcha.render("captcha-container", {
                sitekey: "6LdTOrcrAAAAAJ5lTh8huR1i2Na0bEgO3Zqi-8tF",
                callback: onCaptchaSuccess
            });

            overlay.addEventListener("click", (e) => {
                if (!e.target.closest(".cap-con")) {
                    overlay.remove();
                    document.body.style.overflow = "auto";
                }
            });

        });

        async function onCaptchaSuccess(token) {
            const form = document.getElementById("capForm");
            const email = document.querySelector(".email").innerHTML;
            const cap_token = token;
            try {
                const response = await fetch(form.action, {
                    method: form.method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, cap_token })
                });

                const result = await response.json();
                if (result.success) {
                    window.location.href = `/sendmail/forgot-password?email=${email}&location=user`;
                }
                else {
                    document.querySelector(".cap-con").querySelector(".err-msg").innerHTML = result.message
                    setTimeout(() => {
                        document.querySelector(".cap-con").querySelector(".err-msg").innerHTML = "";
                        setTimeout(() => {
                            document.querySelector(".overlay").remove();
                        }, 500)
                    }, 2000);
                }
            } catch (error) {
                console.error("Error:", error);
            }
        }
        clearInterval(interval);
        return;
    }
    const minutes = Math.floor(diff / 1000 / 60);
    const seconds = Math.floor((diff / 1000) % 60);
    timerEl.innerText = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

updateTimer();
const interval = setInterval(updateTimer, 1000);

const inputs = document.querySelectorAll(".otp-inputs input");
inputs.forEach((input, index) => {
    input.addEventListener("input", () => {
        if (input.value && index < inputs.length - 1) {
            inputs[index + 1].focus();
        }
        if (input.value) {
            input.classList.add("active");
        } else {
            input.classList.remove("active");
        }
    });
    input.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && !input.value && index > 0) {
            inputs[index - 1].focus();
        }
    });
    input.addEventListener("paste", (e) => {
        e.preventDefault();
        const pasteData = (e.clipboardData || window.clipboardData).getData("text").trim();
        if (/^[A-Za-z0-9]+$/.test(pasteData)) {
            pasteData.split("").forEach((char, i) => {
                if (i < inputs.length) {
                    inputs[i].value = char;
                    inputs[i].classList.add("active");
                }
            });
        }
    });
});

let otpForm = document.querySelector(".otp-form")
otpForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    let otp = "";
    let email = document.querySelector(".email").innerHTML;
    otpForm.querySelectorAll(".otp-inputs input").forEach((input) => {
        otp += input.value;
    })
    let response = await fetch("/verify-otp", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            otp,
            email
        }),
    })
    let result = await response.json();
    if (result.success) {
        window.location.href = result.redirectTo;
    }
    else {
        let ele = document.querySelector(".otp-form").querySelector(".err-msg")
        ele.innerHTML = result.message;
        setTimeout(() => {
            ele.innerHTML = "";
        }, 2000);
    }
});

