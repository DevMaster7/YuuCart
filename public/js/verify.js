let head = document.getElementsByTagName("head")[0];
const expiresAt = new Date(head.dataset.expiretime);
const timerEl = document.querySelector(".resend").getElementsByTagName("span")[0];

console.log(expiresAt, timerEl);
function updateTimer() {
    const now = new Date();
    const diff = expiresAt - now;
    if (diff <= 0) {
        timerEl.innerText = "OTP expired";
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

