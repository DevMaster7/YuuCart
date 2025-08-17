let orders = document.querySelectorAll(".order-box");
document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
        document.querySelectorAll(".tab").forEach((tab) => {
            tab.classList.remove("activeTab")
        })
        tab.classList.add("activeTab")
        let status = document.querySelector(".activeTab").dataset.status
        orders.forEach(order => {
            if (status === "All" || order.dataset.status === status) {
                order.style.display = "block";
            } else {
                order.style.display = "none";
            }
        })
    })
})
let x = 0
document.querySelectorAll(".badge").forEach((badge) => {
    badge.addEventListener("click", () => {
        document.querySelectorAll(".dropdown-options").forEach((e) => {
            e.remove()
        })
        if (x == 0) {
            x = 1
            let dropDiv = document.createElement("div");
            dropDiv.classList.add("dropdown-options");
            dropDiv.innerHTML = `<div class="status-btn">Pending</div>
            <div class="status-btn">Delivered</div>
            <div class="status-btn">Cancelled</div>`
            badge.parentElement.append(dropDiv)
            document.querySelectorAll(".status-btn").forEach((btn) => {
                btn.addEventListener("click", async () => {
                    let newStatus = btn.innerHTML;
                    let orderID = btn.closest(".order-card-footer").querySelector(".admin-oid").innerHTML;
                    let userID = btn.closest(".order-card-footer").parentElement.querySelector(".user-id").innerHTML;
                    if (newStatus == "Pending") {
                        badge.innerHTML = newStatus;
                        badge.classList.add("pending");
                        badge.classList.remove("delivered", "cancelled");
                    }
                    else if (newStatus == "Delivered") {
                        badge.innerHTML = newStatus;
                        badge.classList.add("delivered");
                        badge.classList.remove("pending", "cancelled");
                    }
                    else {
                        badge.innerHTML = newStatus;
                        badge.classList.add("cancelled");
                        badge.classList.remove("pending", "delivered");
                    }
                    let res = await fetch("/admin/change-orders-status", {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ newStatus, orderID, userID }),
                    })
                    const res1 = await res.json();
                    badge.parentElement.querySelector(".dropdown-options").remove()
                    x = 0
                })
            })
        }
        else {
            x = 0
            badge.parentElement.querySelector(".dropdown-options").remove()
        }
    })
})

