function updateTotalProduct() {
    let a = document.querySelectorAll(".activeCard");
    let b = document.querySelectorAll(".cards");
    if (a.length > 0) {
        document.querySelector(".trash-btn").style.opacity = "1";
        document.querySelector(".trash-btn").style.cursor = "pointer";
        document.querySelector(".bar").querySelector(".text").innerHTML = `You Select "${a.length}" Product${a.length > 1 ? "s" : ""}!`;
        document.querySelector(".total-item").innerHTML = `Selected Product${a.length > 1 ? "s" : ""}: (${a.length})`;
    } else {
        document.querySelector(".total-item").innerHTML = `Selected Product${a.length > 1 ? "s" : ""}: (${a.length})`;
        document.querySelector(".bar").querySelector(".text").innerHTML = `There are "${b.length}" Product${b.length > 1 ? "s" : ""} in Your Cart`;
        document.querySelector(".trash-btn").style.opacity = ".3";
        document.querySelector(".trash-btn").style.cursor = "not-allowed";
    }
}
updateTotalProduct();

document.querySelector(".trash-btn").addEventListener("click", () => {
    document.querySelectorAll(".activeCard").forEach(async product => {
        const productIDs = Array.from(document.querySelectorAll(".activeCard"))
            .map(product => product.querySelector(".product-img").dataset.productid);
        await fetch(`/shop/delete-from-cart`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productIDs })
        });
        window.location.reload();
    })
})

function borderUpdate(product) {
    if (product.classList.contains("activeCard")) {
        product.classList.remove("activeCard");
        const styles = window.getComputedStyle(product.querySelector(".product-img"))
        if (styles.borderRight.includes("solid")) {
            product.querySelector(".product-img").style.borderRight = "1px solid #CCD6F6";
        }
    } else {
        product.classList.add("activeCard");
        const styles = window.getComputedStyle(product.querySelector(".product-img"))
        if (styles.borderRight.includes("solid")) {
            product.querySelector(".product-img").style.borderRight = "1px solid #FB8500";
        }
    }
}

let a = 0
document.querySelector(".select").addEventListener("click", () => {
    if (a == 0) {
        document.querySelectorAll(".cards").forEach((e) => {
            e.classList.add("activeCard");
            document.querySelector(".select").innerHTML = "Deselect All"
            document.querySelector(".select").style.color = "#FB8500"
        })
        a = 1
    }
    else {
        document.querySelectorAll(".cards").forEach((e) => {
            e.classList.remove("activeCard");
            document.querySelector(".select").innerHTML = "Select All"
            document.querySelector(".select").style.color = "#219EBC"
        })
        a = 0
    }
    updateTotalProduct()
    totalAmount()
})

function updatePrice(cardCon, basePrices, quantity, additionalPrice) {
    cardCon.querySelector(".product-quantity-value").innerHTML = quantity;
    cardCon.querySelectorAll(".pro-cust-price").forEach((e, i) => {
        e.style.display = "block";
        e.innerHTML = `Rs. ${(basePrices[i] + additionalPrice) * quantity}`;
        if (basePrices[0] == Number((basePrices[i] + additionalPrice) * quantity)) {
            console.log(`None`);
            e.style.display = "none";
            cardCon.querySelectorAll(".pro-price").forEach((e) => {
                e.style.opacity = "1";
                e.style.fontSize = "24px";
            });
        }
        else {
            cardCon.querySelectorAll(".pro-price").forEach((e) => {
                e.style.opacity = "0.5";
                e.style.fontSize = "16px";
            });
        }
    });
}

function totalAmount() {
    let arr = Array.from(document.querySelectorAll(".activeCard"))
        .map((e) => {
            let text = e.querySelector(".pro-cust-price").innerHTML;
            let match = text.match(/\d+/);
            return match ? parseInt(match[0]) : null;
        });
    let totalPrice;
    if (arr.length > 0) {
        totalPrice = arr.reduce((a, b) => {
            return a + b
        })
        document.querySelector(".total").innerHTML = `Total Price: Rs. ${totalPrice}`
    }
    else {
        document.querySelector(".total").innerHTML = `Total Price: Rs. 0`
    }
}

document.querySelectorAll(".cards").forEach(product => {
    let quantity = 1;

    product.addEventListener("click", (e) => {
        if (
            e.target.closest("button") ||
            e.target.closest("a") ||
            e.target.closest("input") ||
            e.target.closest("select") ||
            e.target.closest("textarea") ||
            e.target.closest(".cust-size") ||
            e.target.closest(".heart") ||
            e.target.closest(".cust-color")
        ) {
            return;
        }
        borderUpdate(product);
        updateTotalProduct();
        totalAmount();
    });

    const sizeOptions = product.querySelectorAll(".cust-size");
    if (sizeOptions[0]) sizeOptions[0].classList.add("activeSize");

    sizeOptions.forEach(btn => {
        btn.addEventListener("click", () => {
            sizeOptions.forEach(b => b.classList.remove("activeSize"));
            btn.classList.add("activeSize");

            const cardCon = btn.closest(".cards");
            const basePrices = Array.from(cardCon.querySelectorAll(".pro-price")).map(e => Number(e.dataset.baseprice));
            const sizePrice = Number(btn.dataset.sizeprice);
            const colorPrice = Number(cardCon.querySelector(".activeColor")?.dataset.colorprice || 0);
            const additionalPrice = sizePrice + colorPrice;

            quantity = 1;
            cardCon.querySelector(".product-quantity-value").innerHTML = quantity;

            const minusBtn = cardCon.querySelector(".minus");
            minusBtn.style.opacity = "0.5";
            minusBtn.style.cursor = "not-allowed";

            updatePrice(cardCon, basePrices, quantity, additionalPrice);
            totalAmount();
        });
    });

    const colorOptions = product.querySelectorAll(".cust-color");
    if (colorOptions[0]) colorOptions[0].classList.add("activeColor");

    colorOptions.forEach(btn => {
        btn.addEventListener("click", () => {
            colorOptions.forEach(b => {
                b.classList.remove("activeColor");
                b.style.border = "1px solid #CCD6F6";
            });
            btn.classList.add("activeColor");
            btn.style.border = "none";

            const cardCon = btn.closest(".cards");
            const basePrices = Array.from(cardCon.querySelectorAll(".pro-price")).map(e => Number(e.dataset.baseprice));
            const colorPrice = Number(btn.dataset.colorprice);
            const sizePrice = Number(cardCon.querySelector(".activeSize")?.dataset.sizeprice || 0);
            const additionalPrice = sizePrice + colorPrice;

            quantity = 1;
            cardCon.querySelector(".product-quantity-value").innerHTML = quantity;

            const minusBtn = cardCon.querySelector(".minus");
            minusBtn.style.opacity = "0.5";
            minusBtn.style.cursor = "not-allowed";
            updatePrice(cardCon, basePrices, quantity, additionalPrice);
            totalAmount();
        });
    });

    const quantityContainer = product.querySelector(".quantity-btn-con");
    const plusBtn = quantityContainer.querySelector(".plus");
    const minusBtn = quantityContainer.querySelector(".minus");
    const valueBox = quantityContainer.querySelector(".product-quantity-value");

    plusBtn.addEventListener("click", () => {
        quantity += 1;
        valueBox.innerHTML = quantity;
        minusBtn.style.opacity = "1";
        minusBtn.style.cursor = "pointer";

        const cardCon = plusBtn.closest(".cards");
        const basePrices = Array.from(cardCon.querySelectorAll(".pro-price")).map(e => Number(e.dataset.baseprice));
        const sizePrice = Number(cardCon.querySelector(".activeSize")?.dataset.sizeprice || 0);
        const colorPrice = Number(cardCon.querySelector(".activeColor")?.dataset.colorprice || 0);
        const additionalPrice = sizePrice + colorPrice;

        updatePrice(cardCon, basePrices, quantity, additionalPrice);
        totalAmount();
    });

    minusBtn.addEventListener("click", () => {
        if (quantity > 1) {
            quantity -= 1;
            valueBox.innerHTML = quantity;
            if (quantity < 2) {
                minusBtn.style.opacity = "0.5";
                minusBtn.style.cursor = "not-allowed";
            }

            const cardCon = minusBtn.closest(".cards");
            const basePrices = Array.from(cardCon.querySelectorAll(".pro-price")).map(e => Number(e.dataset.baseprice));
            const sizePrice = Number(cardCon.querySelector(".activeSize")?.dataset.sizeprice || 0);
            const colorPrice = Number(cardCon.querySelector(".activeColor")?.dataset.colorprice || 0);
            const additionalPrice = sizePrice + colorPrice;

            updatePrice(cardCon, basePrices, quantity, additionalPrice);
            totalAmount();
        }
    });
});

document.querySelector(".checkout-btn").addEventListener("click", async () => {
    let productData = [      ]
    let selectedProduct = document.querySelectorAll(".activeCard")
    if (selectedProduct.length > 0) {
        selectedProduct.forEach(product => {
            const productId = product.querySelector(".product-img").dataset.productid;
            const productCutomzie = product.querySelector(".customizeable").dataset.choose;
            const productImg = product.querySelector(".product-img").getElementsByTagName("img")[0].src;
            const productName = product.querySelector(".pro-name").innerHTML.trim();
            const productMainPrice = Number(product.querySelector(".pro-price").dataset.baseprice);
            const productOrignalPrice = Number(product.querySelector(".before-dis").innerHTML.split("Rs.")[1].trim());
            const productDiscount = product.querySelector(".discount").innerHTML.slice(10, -2).trim();
            const productQuantity = Number(product.querySelector(".product-quantity-value").innerHTML.trim());
            const productSize = product.querySelector(".activeSize")?.innerHTML.trim();
            const productSizePrice = product.querySelector(".activeSize")?.dataset.sizeprice;
            const productColor = product.querySelector(".activeColor")?.style.backgroundColor;
            const productColorPrice = product.querySelector(".activeColor")?.dataset.colorprice;
            const totalPrice = Number(product.querySelector(".pro-cust-price").innerHTML.split("Rs.")[1].trim());
            const cartTotal = document.querySelector(".total").innerHTML.split("Rs.")[1].trim();
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
            productData.push(obj)
        })
        const res = await fetch(`/shop/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productData }),
        })
        const res1 = await res.json();
        if (res1.success) {
            window.location.href = `/shop/checkout`;
        }
        console.log(productData);
    }
    else {
        document.querySelector(".err").style.display = "block";
        setTimeout(() => {
            document.querySelector(".err").style.display = "none";
        }, 1500);
    }
})
