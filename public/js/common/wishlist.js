document.querySelectorAll(".heart").forEach(btn => {
    btn.addEventListener("click", async () => {
        let pageName = document.getElementsByTagName("head")[0].dataset.page
        let proID;
        if (pageName == "product") {
            proID = document.querySelector(".product-pic-con").dataset.id
        }
        else {
            proID = btn.closest(".cards").querySelector(".product-img").dataset.productid;
        }

        if (btn.classList.contains("fa-regular")) {
            const res = await fetch('/shop/add-to-wishlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ proID }),
            });
            const res1 = await res.json();
            if (res1.success) {
                if (btn.classList.contains("fa-regular")) {
                    btn.classList.remove("fa-regular")
                    btn.classList.add("fa-solid")
                }
            }
            else {
                window.location.href = `/user/login`;
            }
        }
        else {
            const res = await fetch('/shop/remove-from-wishlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ proID }),
            });
            const res1 = await res.json();
            if (res1.success) {
                if (btn.classList.contains("fa-solid")) {
                    btn.classList.remove("fa-solid")
                    btn.classList.add("fa-regular")
                }
            }
            else {
                window.location.href = `/user/login`;
            }
        }
    })
})