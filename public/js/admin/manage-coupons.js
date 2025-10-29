function main(e) {
    let card = e.closest(".coupon-box");
    card.querySelector(".save").style.display = "flex";
    card.querySelector(".edit").style.display = "none";
    card.querySelector(".cancel").style.display = "flex";
    card.querySelectorAll(".edited-info").forEach((e) => {
        let input = document.createElement("input");
        input.classList.add("edited-input");
        if (e.classList.contains("txt")) {
            input.value = e.innerHTML;
            input.setAttribute("type", "text")
            e.replaceWith(input);
        }
        else if (e.classList.contains("num")) {
            input.value = e.innerHTML;
            input.setAttribute("type", "number")
            e.replaceWith(input);
        }
        else if (e.classList.contains("date")) {
            let d = new Date(e.innerHTML)
            input.value = d.toISOString().split("T")[0];
            input.setAttribute("type", "date")
            e.replaceWith(input);
        }
    });
}

document.querySelectorAll(".edit").forEach((e) => {
    e.addEventListener("click", () => {
        main(e);
    });
});

document.querySelectorAll(".save").forEach((e) => {
    e.addEventListener("click", async () => {
        let card = e.closest(".coupon-box")
        let id = card.querySelector(".coupon-id").innerHTML
        let status;
        card.querySelector(".status").innerHTML.toLocaleLowerCase() == "true" ? status = true : status = false
        let data = {
            id: id,
            Status: status,
        }
        card.querySelectorAll(".edited-input").forEach((e) => {
            let key = e.parentElement.classList[0]
            let value = e.value
            data[key] = value
        })
        let res = await fetch("/admin/manage-coupons/edit-coupons", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
        let res1 = await res.json();
        if (res1.success) {
            card.querySelector(".status").innerHTML = card.querySelector(".status").innerHTML.toLocaleLowerCase() == "true" ? "True" : "False"
            card.querySelector(".status").style.color = card.querySelector(".status").innerHTML.toLocaleLowerCase() == "true" ? "#00bb00" : "#ff0000"
            card.querySelector(".save").style.display = "none";
            card.querySelector(".edit").style.display = "flex";
            card.querySelector(".cancel").style.display = "none";
            card.querySelectorAll(".edited-input").forEach((e) => {
                let span = document.createElement("span");
                span.classList.add("edited-info", "text");
                if (e.type == "text") {
                    span.innerHTML = e.value;
                    span.classList.add("txt");
                    e.replaceWith(span);
                }
                else if (e.type == "number") {
                    span.innerHTML = e.value;
                    span.classList.add("num");
                    e.replaceWith(span);
                }
                else if (e.type == "date") {
                    span.innerHTML = new Date(e.value);
                    span.classList.add("date");
                    e.replaceWith(span);
                }
            })
        }
    })
})

document.querySelectorAll(".cancel").forEach((e) => {
    e.addEventListener("click", () => {
        let card = e.closest(".coupon-box");
        card.querySelector(".status").innerHTML = card.querySelector(".status").parentElement.dataset.info === "true" ? "True" : "False"
        card.querySelector(".status").style.color = card.querySelector(".status").parentElement.dataset.info === "true" ? "#00bb00" : "#ff0000"
        card.querySelector(".save").style.display = "none";
        card.querySelector(".edit").style.display = "flex";
        card.querySelector(".cancel").style.display = "none";
        card.querySelectorAll(".edited-input").forEach((e) => {
            let span = document.createElement("span");
            span.classList.add("edited-info", "text");
            if (e.type == "text") {
                span.innerHTML = e.parentElement.dataset.info;
                span.classList.add("txt");
                e.replaceWith(span);
            }
            else if (e.type == "number") {
                span.innerHTML = e.parentElement.dataset.info;;
                span.classList.add("num");
                e.replaceWith(span);
            }
            else if (e.type == "date") {
                span.innerHTML = e.parentElement.dataset.info;;
                span.classList.add("date");
                e.replaceWith(span);
            }
        });
    })
})

document.querySelectorAll(".status").forEach((e) => {
    e.addEventListener("click", () => {
        main(e);
        if (e.innerHTML.toLocaleLowerCase() == "true") {
            e.style.color = "#ff0000"
            e.innerHTML = "False"
        }
        else {
            e.style.color = "#00bb00"
            e.innerHTML = "True"
        }
    })
})