let orders = document.querySelectorAll(".order-box");
let orderCon = document.querySelector("#orderCon");

document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
        document.querySelectorAll(".tab").forEach((tab) => {
            tab.classList.remove("activeTab")
        });
        tab.classList.add("activeTab");

        let status = tab.dataset.status;
        let lowerStatus = status.toLowerCase();
        let visibleCount = 0;

        orders.forEach(order => {
            if (status === "All" || order.dataset.status === status) {
                order.style.display = "block";
                visibleCount++;
            } else {
                order.style.display = "none";
            }
        });

        if (visibleCount === 0) {
            orderCon.innerHTML = `
                <div class="empty-con">
                    <img src="/assets/no-order.png" alt="No Orders" />
                    <h3>No${status === "All" ? "" : ` ${status}`} Orders Yet!</h3>
                    <p>${status === "All" ? "You haven’t placed any orders." : `You didn’t have any ${lowerStatus} orders.`} Start Exploring Now!</p>
                    <a href="/shop" class="explore-btn">Explore Shop</a>
                </div>`;
        } else {
            orderCon.innerHTML = "";
            orders.forEach(order => {
                if (order.style.display === "block") {
                    orderCon.appendChild(order);
                }
            });
        }
    });
});