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

function mainFun() {
    let passWrapDiv = document.createElement("div");
    passWrapDiv.classList.add("pass-wrap");
    passWrapDiv.innerHTML = `<div class="pass-con">
            <div class="text">Confirm That You Are Our User!</div>
            <div class="pass-input">
                <input type="password" name="pass" id="pass" placeholder="Enter Your Password">
                <button id="pass-btn">Confirm Password</button>
            </div>
        </div>`
    document.getElementsByTagName("body")[0].prepend(passWrapDiv);

    document.querySelector(".pass-wrap").addEventListener("click", (e) => {
        if (e.target == document.querySelector(".pass-con") || e.target == document.querySelector(".pass-input") || e.target == document.querySelector(".text") || e.target == document.querySelector("#pass-btn") || e.target == document.querySelector("#pass")) {
            return
        }
        document.querySelector(".pass-wrap").remove();
    })

    document.querySelector("#pass-btn").addEventListener("click", async () => {
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
                document.querySelector(".pass-wrap").remove();
                let div = document.createElement("div");
                div.classList.add("pass-err")
                div.innerHTML = res1.message;
                document.querySelector(".edit-btn").append(div);
                setTimeout(() => {
                    document.querySelector(".pass-err").remove();
                }, 2000);
            }
        }
    })
}
document.querySelector(".edit-btn").addEventListener("click", () => {
    mainFun()
})

document.querySelectorAll(".personal-detail").forEach((e) => {
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
