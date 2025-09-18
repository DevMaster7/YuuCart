function handleButtonClick(event) {
    event.stopPropagation();
    event.preventDefault();
}
document.querySelectorAll(".add-cart-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
        const proID = btn.closest(".cards").querySelector(".product-img").dataset.productid;
        const res = await fetch('/shop/add-to-cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                proID
            }),
        });
        const res1 = await res.json();
        if (res1.success) {
            window.location.href = `/shop/cart`;
        }
    })
})
document.querySelectorAll(".trash-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
        const proID = btn.closest(".cards").querySelector(".product-img").dataset.productid;
        const res = await fetch('/shop/remove-from-wishlist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                proID
            }),
        });
        const res1 = await res.json();
        if (res1.success) {
            btn.closest(".main-card").remove();
            let products = document.querySelectorAll(".main-card")
            if (products.length !== 0) {
                document.querySelector(".products-count").innerHTML = `
                I Hope You Will Get ${products.length == 1 ? "That" : "These"} "${products.length}" 
                ${products.length == 1 ? "Product" : "Products"} As Soon As Possible`
            }
            else {
                document.querySelector(".tab-bar-con").remove();
                document.querySelector(".products-list-con").remove();
                let div = document.createElement("div")
                div.classList.add("empty-con")
                div.innerHTML = `
                    <img src="/assets/wish-list.png" alt="Empty Wishlist" />
                    <h3>Your Wishlist is Empty</h3>
                    <p>Start adding your favorite products!</p>
                    <a href="/shop" class="explore-btn">Explore Products</a>`
                document.querySelector(".content-con").append(div)
            }
        }
    })
})