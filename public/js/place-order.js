document.querySelector(".edit").addEventListener("click", () => {
    history.back();
})
document.querySelector(".acc-btn").addEventListener("click", () => {
    window.location.href = '/user';
})

let msg = document.querySelector(".msg")
document.querySelector(".coupan-btn").addEventListener("click", async () => {
    const coupanCode = document.querySelector(".input-coupan").value.trim();

    if (!coupanCode) {
        msg.classList.remove("success");
        msg.classList.add("err");
        setTimeout(() => {
            msg.classList.remove("err");
        }, 5000)
        return msg.innerHTML = "Please Enter a Valid Coupon Code!";
    }

    const response = await fetch("/shop/apply-coupon", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ coupon: coupanCode }),
    });

    const result = await response.json();

    if (result.success) {
        let pricele = document.querySelector('.total-price');
        pricele.style.opacity = "0.4";
        pricele.style.cursor = "default";
        pricele.style.userSelect = "none";
        let price = Number(pricele.innerHTML.split("Rs.")[1].trim());
        msg.innerHTML = result.message;
        msg.classList.remove("err");
        msg.classList.add("success");
        setTimeout(() => {
            msg.classList.remove("success");
        }, 5000)
        const c = result.coupon;
        document.querySelector(".c-name").getElementsByTagName("span")[0].innerHTML = c.code;
        document.querySelector(".c-discount").getElementsByTagName("span")[0].innerHTML = `-${c.discount}%`;
        let discountedPrice = Math.ceil((price * c.discount) / 100)
        let finalPrice = price - discountedPrice;
        document.querySelector(".total-price-with-coupan").innerHTML = `Total After Coupan: Rs.${finalPrice}`;
    } else {
        msg.innerHTML = result.message;
        msg.classList.remove("success");
        msg.classList.add("err");
        setTimeout(() => {
            msg.classList.remove("err");
        }, 5000)
    }
});

document.querySelector(".payment-con").getElementsByTagName("button")[0].addEventListener("click", async () => {
    let productDeliveryData = [];
    let x = {};
    document.querySelectorAll(".product-detail-con").forEach((e) => {
        let productId = e.querySelector(".product-img").dataset.xmghtml;
        let productName = e.querySelector(".product-name").innerHTML.trim();
        let productImg = e.querySelector(".product-img").getElementsByTagName("img")[0].src
        let basePrice = Number(e.querySelector(".pro-price").innerHTML.split("Rs.")[1].trim());
        let productQuantity = Number(e.querySelector(".pro-quantity").innerHTML.slice(24, -3).trim());
        let productCustomizeStatus;
        let productSize;
        let productSizePrice;
        let productColor;
        let productColorPrice;
        if (e.querySelector(".product-size-color") == null) {
            productCustomizeStatus = false
            productSize = "none"
            productSizePrice = "none"
            productColor = "none"
            productColorPrice = "none"
        }
        else {
            productCustomizeStatus = true
            productSize = e.querySelector(".pro-size-select").innerHTML.trim();
            productSizePrice = Number(e.querySelector(".size-price").innerHTML.split("Rs.")[1].trim());
            productColor = e.querySelector(".pro-color-select").style.background;
            productColorPrice = Number(e.querySelector(".color-price").innerHTML.split("Rs.")[1].trim());
        }
        let subTotalPrice = Number(e.querySelector(".total").innerHTML.split("Rs.")[1].trim());
        let totalBeforeCoupan = Number(document.querySelector(".total-price").innerHTML.split("Rs.")[1].trim());
        let coupanName;
        let coupanDiscount;
        let totalAfterCoupan;
        let paymentMethod;
        document.querySelectorAll(".payment-options").forEach((e) => {
            if (e.classList.contains("active")) {
                paymentMethod = e.dataset.upm;
            }
        })
        if (document.querySelector(".c-name").getElementsByTagName("span")[0].innerHTML == "--") {
            coupanName = "none"
            coupanDiscount = "none"
            totalAfterCoupan = totalBeforeCoupan
        }
        else {
            coupanName = document.querySelector(".c-name").getElementsByTagName("span")[0].innerHTML;
            coupanDiscount = document.querySelector(".c-discount").getElementsByTagName("span")[0].innerHTML;
            totalAfterCoupan = Number(document.querySelector(".total-price-with-coupan").innerHTML.split("Rs.")[1].trim());
            // async function applyCoupon() {
            //     await fetch("/shop/applied-coupon", {
            //         method: "POST",
            //         headers: {
            //             "Content-Type": "application/json",
            //         },
            //         body: JSON.stringify({ coupanName }),
            //     })
            // }
            // applyCoupon();
        }
        x = {
            productId,
            productName,
            productImg,
            basePrice,
            productQuantity,
            productCustomizeStatus,
            productSize,
            productSizePrice,
            productColor,
            productColorPrice,
            subTotalPrice,
            totalBeforeCoupan,
            coupanName,
            coupanDiscount,
            totalAfterCoupan,
            paymentMethod
        }
        productDeliveryData.push(x)
    })
    let coupanName;
    if (document.querySelector(".c-name").getElementsByTagName("span")[0].innerHTML == "--") {
        coupanName = null
    }
    else {
        coupanName = document.querySelector(".c-name").getElementsByTagName("span")[0].innerHTML
    }
    const res = await fetch("/shop/place-order", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ productDeliveryData, coupanName }),
    })
    const res1 = await res.json();
    if (res1.success) {
        window.location.replace("/user/my-orders");
    }
    else{
        window.location.replace("/user/my-account");
    }
})
