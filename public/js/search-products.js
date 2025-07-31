let search = document.getElementById("search");
const params = new URLSearchParams(window.location.search);
const term = params.get('query');
let count = 0;
let intervalId = setInterval(() => {
    search.value = term;
    count++;
    if (count >= 2) {
        clearInterval(intervalId);
    }
}, 10);

let searchShow = document.querySelector(".additional-con");
if (searchShow == null) {
    document.querySelector(".no-search").innerHTML = term;
    document.getElementsByTagName("title")[0].innerHTML = `Your Search is Out From Imagination`;
}
else {
    document.getElementsByTagName("title")[0].innerHTML = `Search Results For: "${term}"`;
    document.querySelector(".additional-con").getElementsByTagName("span")[0].innerHTML = term;
    document.querySelector(".view-icons").querySelectorAll("i").forEach((icon) => {
        icon.addEventListener("click", () => {
            document.querySelector(".view-icons").querySelectorAll("i").forEach((e) => {
                e.classList.remove("iactive");
            })
            icon.classList.add("iactive");
            if (icon.classList.contains("list-btn")) {
                document.querySelector(".products-grid-con").style.display = "none";
                document.querySelector(".products-list-con").style.display = "flex";
            }
            else {
                document.querySelector(".products-list-con").style.display = "none";
                document.querySelector(".products-grid-con").style.display = "flex";
            }
        })
    })
}

function handleButtonClick(event) {
    event.stopPropagation();
    event.preventDefault();
}

// Add To Cart
document.querySelectorAll(".add-cart-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
        const proID = btn.closest(".cards").querySelector(".product-img").dataset.productid;
        const res = await fetch('/shop/add-to-cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ proID }),
        });
        const res1 = await res.json();
        if (res1.success) {
            window.location.href = `/shop/cart`;
        }
    })
})
