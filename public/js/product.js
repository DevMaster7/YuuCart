let landDivs = Array.from(document.querySelector(".extra-pics-videos").getElementsByTagName("div"))
let mobileDivs = Array.from(document.querySelector(".extra-pics-videos-land").getElementsByTagName("div"))
function activeBox(e) {
    e.forEach(box => {
        box.addEventListener("click", () => {
            e.forEach(box => {
                box.classList.remove("activeBox")
            })
            box.classList.add("activeBox")
            let imgURL = box.getElementsByTagName("img")[0].src;
            document.querySelector(".product-pic-con").getElementsByTagName("img")[0].src = imgURL;
        })
    })
}
activeBox(landDivs)
activeBox(mobileDivs)

// Zoom-In Zoom-Out Product
const container = document.querySelector('.product-pic-con');
const image = document.querySelector('.zoom-image');
container.addEventListener('mousemove', function (e) {
    const { left, top, width, height } = container.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    image.style.transformOrigin = `${x}% ${y}%`;
    image.style.transform = 'scale(2.1)';
});
container.addEventListener('mouseleave', function () {
    image.style.transformOrigin = 'center center';
    image.style.transform = 'scale(1)';
});

// Intailization Classes
let e = document.querySelector(".true")
if (e != null) {
    setTimeout(() => {
        let mainCon = document.querySelector(".customize-con");
        mainCon.querySelector(".cust-size").classList.add("activeSize");
        mainCon.querySelector(".cust-color").classList.add("activeColor");
        let mobileCon = document.querySelector(".customize-con-mobile");
        mobileCon.querySelector(".cust-size").classList.add("activeSize");
        mobileCon.querySelector(".cust-color").classList.add("activeColor");
    }, 10);
}

// Customization Variables
let z = 1
const basePrice = parseInt(document.getElementById("basePrice").value);
const finalPriceEl = document.querySelector(".product-price");
const quantityEl = document.querySelector(".product-quantity-value");
let selectedSizePrice = 0;
let selectedColorPrice = 0;

// Quantity Opacity
function opacity() {
    document.querySelector(".minus").style.opacity = "0.5";
    document.querySelector(".minus").style.cursor = "not-allowed";
}

// Size Select
document.querySelectorAll(".option-size").forEach(btn => {
    btn.addEventListener("click", () => {
        z = 1
        opacity();
        document.querySelectorAll(".option-size").forEach(b => b.classList.remove("activeSize"));
        btn.classList.add("activeSize");
        selectedSizePrice = parseInt(btn.dataset.sizeprice) || 0;
        quantityEl.textContent = 1;
        updatePrice();
    });
});

// Color Select
document.querySelectorAll(".option-color").forEach(btn => {
    btn.addEventListener("click", () => {
        z = 1
        opacity();
        document.querySelectorAll(".option-color").forEach(b => b.classList.remove("activeColor"));
        btn.classList.add("activeColor");
        selectedColorPrice = parseInt(btn.dataset.colorprice) || 0;
        quantityEl.textContent = 1;
        updatePrice();
    });
});

// Price Update
let totalPrice = 0
function updatePrice() {
    const qty = parseInt(quantityEl.textContent) || 1;
    totalPrice = (basePrice + selectedSizePrice + selectedColorPrice) * qty;
    finalPriceEl.textContent = `Rs.${totalPrice}`;
}
updatePrice();

// Quantity Control
document.querySelector(".plus").addEventListener("click", () => {
    z += 1;
    document.querySelector(".product-price").innerHTML = `Rs.${totalPrice * z}`;
    document.querySelector(".product-quantity-value").innerHTML = z;
    document.querySelector(".minus").style.opacity = "1";
    document.querySelector(".minus").style.cursor = "pointer";
});
document.querySelector(".minus").addEventListener("click", () => {
    z -= 1;
    if (z <= 1) {
        z = 1;
        opacity();
    }
    document.querySelector(".product-price").innerHTML = `Rs.${totalPrice * z}`;
    document.querySelector(".product-quantity-value").innerHTML = z;
});

// Add To Cart
document.querySelector(".add-cart-btn").addEventListener("click", async () => {
    const proID = document.querySelector(".product-pic-con").dataset.id;
    const res = await fetch('/shop/add-to-cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proID }),
    });
    const res1 = await res.json();
    if (res1.success) {
        window.location.href = `/shop/cart`;
    }
    else {
        window.location.href = `/user/login`;
    }
});

// Product Data Sender
document.querySelector(".buy-btn").addEventListener("click", async () => {
    let productCutomzie;
    let e = document.querySelector(".true")
    if (e == null) {
        productCutomzie = "false"
    }
    else {
        productCutomzie = "true"
    }
    let productId = document.querySelector(".product-pic-con").dataset.id
    let productImg = document.querySelector(".zoom-image").src
    let productName = document.querySelector(".product-name").innerHTML.trim()
    let productMainPrice = Number(document.querySelector(".product-price").dataset.price)
    let productOrignalPrice = Number(document.querySelector(".product-orignal-price").dataset.orignalprice)
    let productDiscount = document.querySelector(".product-discount").innerHTML.trim()
    let productQuantity = Number(document.querySelector(".product-quantity-value").innerHTML.trim())
    let productSize;
    let productSizePrice;
    let productColor;
    let productColorPrice;
    if (productCutomzie == "true") {
        document.querySelectorAll(".cust-size").forEach((e) => {
            if (e.classList.contains("activeSize")) {
                productSize = e.innerHTML.trim()
            }
        })
        document.querySelectorAll(".cust-size").forEach((e) => {
            if (e.classList.contains("activeSize")) {
                productSizePrice = Number(e.dataset.sizeprice)
            }
        })
        document.querySelectorAll(".cust-color").forEach((e) => {
            if (e.classList.contains("activeColor")) {
                productColor = e.dataset.color
            }
        })
        document.querySelectorAll(".cust-color").forEach((e) => {
            if (e.classList.contains("activeColor")) {
                productColorPrice = Number(e.dataset.colorprice)
            }
        })
    }
    else {
        productSize = "none"
        productSizePrice = 0
        productColor = "none"
        productColorPrice = 0
    }
    let totalPrice = (productMainPrice + productSizePrice + productColorPrice) * productQuantity
    let cartTotal = 0
    const obj = {
        productId,
        productCutomzie,
        productImg,
        productName,
        productMainPrice,
        productOrignalPrice,
        productDiscount,
        productQuantity,
        productSize,
        productSizePrice,
        productColor,
        productColorPrice,
        totalPrice,
        cartTotal
    }
    const productData = [obj]
    const res = await fetch(`/shop/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productData }),
    });
    console.log(productData);
    const res1 = await res.json();
    if (res1.success) {
        window.location.href = `/shop/checkout`;
    }
})

