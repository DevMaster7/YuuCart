document.querySelectorAll(".heart").forEach(btn => {
    btn.addEventListener("click", async () => {
        let check = document.querySelectorAll(".cards")
        let proID;
        if (check.length >= 2) {
            proID = btn.closest(".cards").querySelector(".product-img").dataset.productid;
        }
        else if (check.length == 1) {
            proID = btn.closest(".cards").querySelector(".product-img").dataset.productid;
        }
        else {
            proID = document.querySelector(".product-pic-con").dataset.id
        }

        if (btn.classList.contains("fa-regular")) {
            const res = await fetch('/shop/add-to-wishlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ proID }),
            });
            const res1 = await res.json();
            if (res1.success) {
                window.location.reload();
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
                window.location.reload();
            }
            else {
                window.location.href = `/user/login`;
            }
        }
    })
})