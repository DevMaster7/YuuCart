const changePassBtn = document.getElementById("change-pass-form").getElementsByTagName("button")[0];
changePassBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    let oldPass = document.getElementById("oldPass").value;
    let newPass = document.getElementById("newPass").value;
    let confirmPass = document.getElementById("confirmPass").value;
    let data = {
        oldPass,
        newPass,
        confirmPass
    }
    const res = await fetch("/user/change-pass", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    const res1 = await res.json();
    if (res1.success) {
        resetForm()
        document.getElementById("message").classList.remove("error");
        document.getElementById("message").classList.add("success");
        document.getElementById("message").innerHTML = res1.message;
        setTimeout(() => {
            window.location.href = '/user/my-account';
        }, 2500);
    } else {
        document.getElementById("message").classList.remove("success");
        document.getElementById("message").classList.add("error");
        document.getElementById("message").innerHTML = res1.message;
        setTimeout(() => {
            document.getElementById("message").innerHTML = '';
        }, 2500);
    }
})