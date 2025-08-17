document.querySelectorAll(".tf").forEach((e) => {
    if (e.innerHTML.trim().toLowerCase() == "true") {
        e.classList.add("ts");
    }
    else {
        e.classList.add("fs");
    }
})
document.querySelectorAll(".down-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
        let iTag = btn.getElementsByTagName("i")[0];
        if (iTag.classList.contains("fa-chevron-up")) {
            removeAll();
            iTag.classList.remove("fa-chevron-up");
            iTag.classList.add("fa-chevron-down");
            iTag.querySelector(".dropdown-options").style.display = "flex";
        }
        else if (!e.target.classList.contains("down-btn")) {

        }
        else if (iTag.classList.contains("fa-chevron-down")) {
            removeAll();
            iTag.classList.remove("fa-chevron-down");
            iTag.classList.add("fa-chevron-up");
            iTag.querySelector(".dropdown-options").style.display = "none";
        }
    });
});
function removeAll() {
    document.querySelectorAll(".down-btn").forEach(b => {
        let icon = b.getElementsByTagName("i")[0];
        icon.classList.add("fa-chevron-up");
        icon.classList.remove("fa-chevron-down");
        icon.querySelector(".dropdown-options").style.display = "none";
    });
}
document.addEventListener("click", function (e) {
    if (!e.target.closest('.down-btn')) {
        let arr = []
        document.querySelectorAll(".dropdown-options").forEach((e) => {
            let display = e.style.display
            arr.push(display)
        })
        if (arr.some(val => val == 'flex')) {
            removeAll();
        }
        // removeAll();
    }
});

document.querySelectorAll(".click").forEach(b => {
    b.addEventListener("click", async () => {
        let userID = b.closest(".right").parentElement.querySelector(".user-id").innerHTML;
        if (b.getElementsByTagName("span")[0] == undefined) {
            let roleStatus = b.innerHTML;
            if (roleStatus == "Admin") {
                b.closest(".down-btn").querySelector(".txt").innerText = "Admin"
                roleStatus = true;
            }
            else {
                b.closest(".down-btn").querySelector(".txt").innerText = "User"
                roleStatus = false;
            }
            let res = await fetch("/admin/change-user-role", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userID, roleStatus }),
            })
            let res1 = await res.json();
            if (res1.success) {
                removeAll();
            }
        }
        else {
            let [key, value] = b.innerText.split(":");
            let valueDiv = b.querySelector(".tf");
            let userRole = b.closest(".right").querySelector(".down-btn").innerText;
            let allocation = b.closest(".right").querySelector(".allocation");
            if (userRole.trim() == "Admin") {
                if (value.trim() == "True") {
                    valueDiv.innerHTML = "False";
                    valueDiv.classList.add("fs");
                    valueDiv.classList.remove("ts");
                    value = false;
                    let fs = b.parentElement.querySelectorAll(".fs").length;
                    let ts = b.parentElement.querySelectorAll(".ts").length;
                    allocation.innerHTML = `(${ts}/${fs})`
                }
                else {
                    valueDiv.innerHTML = "True";
                    valueDiv.classList.add("ts");
                    valueDiv.classList.remove("fs");
                    value = true;
                    let ts = b.parentElement.querySelectorAll(".ts").length;
                    let fs = b.parentElement.querySelectorAll(".fs").length;
                    allocation.innerHTML = `(${ts}/${fs})`
                }
                await fetch("/admin/change-user-allocation", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userID, key, value }),
                })
            }
        }
    })
})