let bubbleCon = document.querySelector(".left");
let head = document.getElementsByTagName("head")[0];
let url = window.location.href
if (url.includes("reffer")) {
    const params = new URLSearchParams(new URL(url).search);
    const refferName = params.get("reffer");
    let refferHTML = `<div class="modal-wrap">
                <div class="wrap">
                    <div class="heading">Hello Friend 👋</div>
                    <div class="text-content">
                        I think you came from <strong>${refferName}</strong>.<br>
                        If you sign up using your friend’s referral link, he will get
                        <strong>100 Yuu</strong>
                        <span>(which can be used to buy items from our store)</span> and you
                        will get nothing.<br><br>
                        But if you refuse, you will get <strong>100 Yuu</strong> and more prizes.
                    </div>
                    <div class="btns">
                        <div class="btn aprove">Yes, refer him</div>
                        <div class="btn reject">No thanks</div>
                    </div>
                </div>
            </div>`
    document.body.style.overflow = "hidden";
    document.getElementById("modalRoot").innerHTML = refferHTML;

    document.querySelector(".aprove").addEventListener("click", async () => {
        document.querySelector(".modal-wrap").remove();
        document.body.style.overflow = "auto";
        console.log(refferName);
        await fetch("/user/refferAprove", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                reffer: refferName
            })
        })
        let div = document.createElement("div");
        div.classList.add("cong-msg");
        div.innerHTML = `Now you are reffer of <strong>${refferName}</strong>`;
        document.getElementById("registerForm").insertAdjacentElement("beforebegin", div);
        document.querySelector(".continue-btn").style.margin = "0";
    })
    document.querySelector(".reject").addEventListener("click", async () => {
        document.querySelector(".modal-wrap").remove();
        document.body.style.overflow = "auto";
        await fetch("/user/refReject", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                reffer: refferName
            })
        })
        window.location.href = "/user/register"
    })
} else if (head.dataset.info == "enter-pass") {
    let newPassHTML = `<div class="pass-con">
        <form id="enterPassForm">
        <div class="heading">Enter Your Password</div>
        <div class="field">
                        <input type="password" name="password" placeholder=" " required />
                        <label for="password">Password</label>
                        <i class="fa-solid fa-eye eye"></i>
                    </div>
                    <div class="field">
                        <input type="password" name="confirmPassword" placeholder=" " required />
                        <label for="confirm-password">Confirm Password</label>
                        <i class="fa-solid fa-eye eye"></i>
                    </div>
            <div class="err-msg"></div>
            <button type="submit">Continue</button>
          </form>
        </div>`;
    document.body.style.overflow = "hidden";
    document.getElementById("modalRoot").innerHTML = newPassHTML;

    document.getElementById("enterPassForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        let res = await fetch("/user/register/enterpass", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                password: e.target.password.value,
                confirmPassword: e.target.confirmPassword.value
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

if (document.querySelector(".icon")) {
    document.querySelector(".icon").addEventListener("click", () => {
        window.location.href = '/';
    })
}
if (document.querySelector(".login-btn")) {
    document.querySelector(".login-btn").addEventListener("click", () => {
        window.location.href = '/user/login';
    })
}
let err = document.querySelector(".err-msg")
if (document.getElementById("registerForm")) {

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
        const token = grecaptcha.getResponse();
        const res = await fetch('/user/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullname, username, email, password, confirmPassword, city, phone, address, "g-recaptcha-response": token })
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
}
