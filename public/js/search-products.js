let pageType = document.getElementsByTagName("head")[0].dataset.type;
let cards = document.querySelectorAll(".main-card").length;

if (pageType == 'search') {
    let search = document.getElementById("search");
    const params = new URLSearchParams(window.location.search);
    const term = params.get('query');
    document.getElementsByTagName("title")[0].innerHTML = `Search Results For: "${term}"`;
    let count = 0;
    let intervalId = setInterval(() => {
        search.value = term;
        count++;
        if (count >= 2) {
            clearInterval(intervalId);
        }
    }, 10);

    let searchShow = document.querySelector(".additional-con");
    if (searchShow == null || cards == 0) {
        document.querySelector(".no-search").innerHTML = term;
        document.getElementsByTagName("title")[0].innerHTML = `Your Search is Out From Imagination`;
        document.querySelector(".no-products").querySelector(".heading").innerHTML = "Your Search is Out From Imagination"
    }
    else {
        productsArange(term, "search");
    }
} else if (pageType == 'category') {
    let term = document.getElementsByTagName("head")[0].dataset.query;
    let [main, sub] = term.split(",");
    sub = sub ? ` > ${sub}` : "";
    document.getElementsByTagName("title")[0].innerHTML = `Category Results For: "${main}${sub}"`;

    let categoryShow = document.querySelector(".additional-con");
    if (categoryShow == null || cards == 0) {
        document.querySelector(".no-search").innerHTML = term;
        document.getElementsByTagName("title")[0].innerHTML = `Sorry! This Category is empty this time`;
        document.querySelector(".no-products").querySelector(".heading").innerHTML = "<strong>Sorry!</strong><br> This Category is empty this time"
    }
    else {
        productsArange(term, "category");
    }
}

function productsArange(term, from) {
    if (from === "search") {
        document.querySelector(".additional-con").getElementsByTagName("span")[0].innerHTML = term;
    } else {
        let [main, sub] = term.split(",");
        sub = sub ? ` > ${sub}` : "";
        document.querySelector(".additional-con").getElementsByTagName("span")[0].innerHTML = `${main}${sub}`;
    }

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

document.querySelectorAll(".add-cart-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
        const proID = btn.closest(".cards").dataset.id;
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
