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
    showModal("Are You Sure?",
        "Are you sure to update this account?<br>If you update your username your referral link will change!",
        `<button class="btn" id="updateConfirm">Yes</button>
        <button class="btn" id="updateCancel" style="background-color:red">Cancel</button>`)


    document.querySelector("#updateCancel").addEventListener("click", () => {
        closeModal();
    })

    document.querySelector("#updateConfirm").addEventListener("click", async () => {
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
})

function showModal(title, content, btns, etc) {
    const root = document.getElementById("modalRoot");
    root.innerHTML = `<div class="modal-content">
                            <h2 id="modalTitle">${title}</h2>
                            <p id="modalMsg">${content}</p>
                            <div style="display:flex;justify-content:space-evenly">
                                ${btns}
                            </div>
                            <div>${etc ? etc : ""}</div>
                          </div>`;
    document.body.style.overflow = "hidden";
    root.style.display = "flex";
}
function closeModal() {
    const root = document.getElementById("modalRoot");
    document.body.style.overflow = "auto";
    root.style.display = "none";
    root.innerHTML = "";
}
window.closeModal = closeModal;
window.addEventListener("click", e => {
    if (e.target.id === "modalRoot") closeModal();
})