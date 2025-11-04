document.querySelector(".edit").addEventListener("click", () => {
    history.back();
})
document.querySelector(".acc-btn").addEventListener("click", () => {
    window.location.href = '/user';
})

let msg = document.querySelector(".msg")
document.querySelector(".coupon-btn").addEventListener("click", async () => {
    let pricele = document.querySelector('.total-price');
    let mainPrice = Number(pricele.innerHTML.split("Rs.")[1].trim());
    const couponCode = document.querySelector(".input-coupon").value.trim();

    if (!couponCode) return

    const response = await fetch("/shop/apply-coupon", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ coupon: couponCode, mainPrice }),
    });

    const result = await response.json();

    if (result.success) {
        pricele.style.opacity = "0.4";
        pricele.style.cursor = "default";
        pricele.style.userSelect = "none";
        msg.innerHTML = result.message;
        msg.classList.remove("err");
        msg.classList.add("success");
        setTimeout(() => {
            msg.classList.remove("success");
        }, 5000)
        const couponDetails = result.coupon;
        // console.log(mainPrice, couponDetails);

        let finalPrice;
        let couponName = document.querySelector(".coupon-name").getElementsByTagName("span")[0];
        let couponBene = document.querySelector(".coupon-bene").getElementsByTagName("span")[0];
        let totalAfterCoupon = document.querySelector(".total-price-with-coupon");

        couponName.innerHTML = couponDetails.couponCode;
        if (couponDetails.benefitType == "discount") {
            couponBene.innerHTML = `-${couponDetails.benefitValue}%`;
            let discountedPrice = Math.ceil((mainPrice * couponDetails.benefitValue) / 100)
            finalPrice = mainPrice - discountedPrice;
        } else if (couponDetails.benefitType == "rupeeOff") {
            couponBene.innerHTML = `Rs. -${couponDetails.benefitValue}`;
            finalPrice = mainPrice - couponDetails.benefitValue;
        } else if (couponDetails.benefitType == "freeProduct") {
            console.log(`Free Product`);
        }
        totalAfterCoupon.innerHTML = `Total After Coupon: Rs.${finalPrice}`;

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
        let totalBeforeCoupon = Number(document.querySelector(".total-price").innerHTML.split("Rs.")[1].trim());
        let couponName;
        let couponBene;
        let totalAfterCoupon;
        let paymentMethod;
        document.querySelectorAll(".payment-options").forEach((e) => {
            if (e.classList.contains("active")) {
                paymentMethod = e.dataset.upm;
            }
        })
        if (document.querySelector(".coupon-name").getElementsByTagName("span")[0].innerHTML == "--") {
            couponName = "none"
            couponBene = "none"
            totalAfterCoupon = totalBeforeCoupon
        }
        else {
            couponName = document.querySelector(".coupon-name").getElementsByTagName("span")[0].innerHTML;
            couponBene = document.querySelector(".coupon-bene").getElementsByTagName("span")[0].innerHTML;
            totalAfterCoupon = Number(document.querySelector(".total-price-with-coupon").innerHTML.split("Rs.")[1].trim());
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
            totalBeforeCoupon,
            couponName,
            couponBene,
            totalAfterCoupon,
            paymentMethod
        }
        productDeliveryData.push(x)
    })
    let couponName;
    if (document.querySelector(".coupon-name").getElementsByTagName("span")[0].innerHTML == "--") {
        couponName = null
    }
    else {
        couponName = document.querySelector(".coupon-name").getElementsByTagName("span")[0].innerHTML
    }
    const res = await fetch("/shop/place-order", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ productDeliveryData, couponName }),
    })
    const res1 = await res.json();
    if (res1.success) {
        window.location.replace("/user/orders");
    }
    else {
        window.location.replace("/user/account");
    }
})
