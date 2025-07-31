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

document.querySelector(".edit-btn").addEventListener("click", () => {
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
})