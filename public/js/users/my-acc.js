const fileInput = document.querySelector("#fileInput");
const pencilBtn = document.querySelector(".pencil");
const form = document.querySelector("#profilePicForm");

pencilBtn.addEventListener("click", () => {
    fileInput.click();
});

fileInput.addEventListener("change", () => {
    if (fileInput.files.length > 0) {
        form.submit();
    }
});

let head = document.getElementsByTagName("head")[0];
if (head.dataset.info == "enter-pass") {
    let forgotPassHTML = `<div class="pass-con">
        <form id="enterPassForm" action="/set-new-forgot" method="post">
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
        </div`;
    document.querySelector("body").style.overflow = "hidden";
    document.querySelector(".main-container").querySelector(".con").innerHTML = forgotPassHTML;

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
            window.location.href = "/user/account";
        } else {
            let ele = document.querySelector(".pass-con").querySelector(".err-msg")
            ele.innerHTML = data.message;
            setTimeout(() => {
                ele.innerHTML = "";
            }, 2000);
        }
    });
}

function makeCaptcha(purpose) {
    const overlay = document.createElement("div");
    overlay.classList.add("overlay");
    overlay.innerHTML = `
            <form class="cap-con" id="capForm" action="/verify-captcha" method="post">
            <div id="captcha-container" style="transform: scale(0.8); transform-origin: center;"></div>
            <div class="err-msg"></div>
            </form>`;
    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";

    let gcp = document.getElementsByTagName("head")[0].dataset.gcp;
    grecaptcha.render("captcha-container", {
        sitekey: gcp,
        callback: (token) => onCaptchaSuccess(token, purpose)
    });

    overlay.addEventListener("click", (e) => {
        if (!e.target.closest(".cap-con")) {
            overlay.remove();
            document.body.style.overflow = "auto";
        }
    });
}
document.querySelector(".forgot-btn").addEventListener("click", () => {
    makeCaptcha("forgot");
});
if (document.getElementById("unVerifiedBtn")) {
    document.getElementById("unVerifiedBtn").addEventListener("click", () => {
        makeCaptcha("email-verification");
    })
}

async function onCaptchaSuccess(token, purpose) {
    const form = document.getElementById("capForm");
    const email = document.getElementById("email").innerHTML.trim();
    const cap_token = token;
    try {
        const response = await fetch(form.action, {
            method: form.method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, cap_token })
        });

        const result = await response.json();
        if (result.success) {
            window.location.href = `/send/verification-email?email=${email}&location=user&purpose=${purpose}`;
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

function mainFun() {
    let passWrapDiv = document.createElement("div");
    passWrapDiv.classList.add("verify-pass-wrap");
    passWrapDiv.innerHTML = `<div class="verify-pass-con">
            <div class="text">Confirm That You Are Our User!</div>
            <div class="verify-pass-input">
                <div class="field">
                        <input type="password" name="password" id="pass" placeholder=" " required />
                        <label for="password">Password</label>
                        <i class="fa-solid fa-eye eye"></i>
                    </div>
                <button id="verify-pass-btn">Confirm Password</button>
            </div>
        </div>`
    let body = document.getElementsByTagName("body")[0]
    body.prepend(passWrapDiv);
    body.style.overflow = "hidden";

    document.querySelector(".verify-pass-wrap").addEventListener("click", (e) => {
        if (e.target == document.querySelector(".verify-pass-con") || e.target == document.querySelector(".verify-pass-err") || e.target == document.querySelector(".verify-pass-input") || e.target == document.querySelector(".text") || e.target == document.querySelector("#verify-pass-btn") || e.target == document.querySelector("#pass") || e.target == document.querySelector(".eye")) {
            return
        }
        document.querySelector(".verify-pass-wrap").remove();
    })
    showPass()

    document.querySelector("#verify-pass-btn").addEventListener("click", async () => {
        let pass = document.querySelector("#pass").value;
        if (pass !== "") {
            let res = await fetch("/user/verifyUser", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pass }),
            })
            let res1 = await res.json()
            if (res1.success) {
                window.location.href = `/user/edit-my-account`;
            }
            else {
                let div = document.createElement("div");
                div.classList.add("verify-pass-err")
                div.innerHTML = res1.message;
                document.querySelector(".verify-pass-input").insertBefore(div, document.querySelector("#verify-pass-btn"));
                setTimeout(() => {
                    document.querySelector(".verify-pass-err").remove();
                }, 2000);
            }
        }
    })
}
document.querySelector(".edit-btn").addEventListener("click", () => {
    mainFun()
})

const valueEle = Array.from(document.querySelectorAll(".value")).filter(e => !e.id)
valueEle.forEach((e) => {
    e.addEventListener("dblclick", () => {
        if (e.classList.contains("pass")) return
        mainFun()
    })
})

document.querySelector(".change-pass").addEventListener("click", async (e) => {
    let oldPass = document.getElementById("oldPass").value;
    let newPass = document.getElementById("newPass").value;
    let confirmPass = document.getElementById("confirmPass").value;
    let data = {
        oldPass,
        newPass,
        confirmPass
    }
    if (!oldPass || !newPass || !confirmPass) {
        document.getElementById("message").classList.remove("success");
        document.getElementById("message").classList.add("error");
        document.getElementById("message").innerHTML = "All fields are required!";
        setTimeout(() => {
            document.getElementById("message").innerHTML = '';
        }, 2500);
        return
    }
    const res = await fetch("/user/change-password", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    const res1 = await res.json();
    if (res1.success) {
        document.getElementById("message").classList.remove("error");
        document.getElementById("message").classList.add("success");
        document.getElementById("message").innerHTML = res1.message;
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    } else {
        document.getElementById("message").classList.remove("success");
        document.getElementById("message").classList.add("error");
        document.getElementById("message").innerHTML = res1.message;
        setTimeout(() => {
            document.getElementById("message").innerHTML = '';
        }, 2500);
    }
})

function showPass() {
    let passEye = document.querySelectorAll(".eye")
    passEye.forEach((e) => {
        e.addEventListener("click", () => {
            let passCon = e.parentElement.getElementsByTagName("input")[0];
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
}
showPass()
