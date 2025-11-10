let fileInput = document.querySelector("#fileInput")
document.querySelector(".pencil").addEventListener("click", () => {
    fileInput.click();
})
fileInput.addEventListener("change", async () => {
    const fileValue = fileInput.value
    const res = await fetch("/user/updateProfilePic", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileValue }),
    })
    const res1 = await res.json()
    if (res1.success) {
        window.location.reload();
    }
})

document.querySelector(".cancel-btn").addEventListener("click", () => {
    window.location.href = '/user/account';
})

document.querySelector(".update-btn").addEventListener("click", async () => {
    document.querySelectorAll(".err").forEach((e) => {
        e.remove()
    });
    let NewObj = {}
    document.querySelectorAll(".value").forEach((e) => {
        let key = (e.previousElementSibling.innerHTML.trim().replaceAll(":", "")).replace(" ", "_")
        NewObj[key] = e.value
    })
    const res = await fetch("/user/updateUser", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ NewObj }),
    })
    const res1 = await res.json();
    if (res1.success) {
        window.location.href = '/user/account';
    }
    else {
        let div = document.createElement("div");
        div.classList.add("error");
        div.innerHTML = `${res1.message}`;
        document.querySelector(".btns-err").prepend(div);
        setTimeout(() => {
            document.querySelector(".err").remove();
        }, 2000);
    }
})