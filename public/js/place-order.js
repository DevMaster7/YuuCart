const couponMsg = document.getElementById("couponMsg");
const orderMsg = document.getElementById("orderMsg");
document.querySelector(".edit").addEventListener("click", () => {
    history.back();
})
document.querySelector(".acc-btn").addEventListener("click", () => {
    window.location.href = '/user';
})

async function getUser() {
    let res = await fetch("/api/frontUser", {
        method: 'get',
        headers: { 'Content-Type': 'application/json' },
    });
    let data = await res.json();
    return data
}

(async function () {
    const data = await getUser();

    document.getElementById("name").innerHTML = data.user.fullname;
    document.getElementById("phone").innerHTML = data.user.phone;
    document.getElementById("city").innerHTML = data.user.city;
    document.getElementById("address").innerHTML = data.user.address;

    document.querySelector(".coupon-btn").addEventListener("click", async () => {
        let firstPriceEle = document.getElementById("subTotalPrice");
        let priceEle = document.getElementById("totalPrice");
        let mainPrice = Number(priceEle.innerHTML.split("Rs.")[1].trim());
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
            firstPriceEle.style.opacity = "0.4";
            firstPriceEle.style.cursor = "default";
            firstPriceEle.style.userSelect = "none";
            priceEle.style.opacity = "0.4";
            priceEle.style.cursor = "default";
            priceEle.style.userSelect = "none";
            couponMsg.innerHTML = result.message;
            couponMsg.classList.remove("err");
            couponMsg.classList.add("success");
            setTimeout(() => {
                couponMsg.classList.remove("success");
            }, 5000)
            const couponDetails = result.coupon;
            const couponName = couponDetails.couponCode;
            const couponBeneT = couponDetails.benefitType;
            let headEle = document.getElementsByTagName("head")[0];
            headEle.dataset.cname = couponName;
            headEle.dataset.cbenet = couponBeneT;

            let finalPrice;
            let couponNameEle = document.querySelector(".coupon-name").getElementsByTagName("span")[0];
            let couponBeneEle = document.querySelector(".coupon-bene").getElementsByTagName("span")[0];
            let totalAfterCoupon = document.querySelector(".total-price-with-coupon");

            couponNameEle.innerHTML = couponDetails.couponCode;
            if (couponDetails.benefitType == "discount") {
                couponBeneEle.innerHTML = `${couponDetails.benefitValue}%`;
                let discountedPrice = Math.ceil((mainPrice * couponDetails.benefitValue) / 100)
                finalPrice = mainPrice - discountedPrice;
            } else if (couponDetails.benefitType == "rupeeOff") {
                couponBeneEle.innerHTML = `Rs. ${couponDetails.benefitValue}`;
                finalPrice = mainPrice - couponDetails.benefitValue;
            } else if (couponDetails.benefitType == "freeProduct") {
                console.log(`Free Product`);
            }
            totalAfterCoupon.innerHTML = `Total After Coupon: Rs.${finalPrice}`;
        } else {
            couponMsg.innerHTML = result.message;
            couponMsg.classList.remove("success");
            couponMsg.classList.add("err");
            setTimeout(() => {
                couponMsg.classList.remove("err");
            }, 5000)
        }
    });

    document.querySelector(".payment-con").getElementsByTagName("button")[0].addEventListener("click", async () => {
        let headEle = document.getElementsByTagName("head")[0];
        const couponName = headEle.dataset.cname;
        const couponBenefitType = headEle.dataset.cbenet;
        const res = await fetch("/shop/place-order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ couponName, couponBenefitType }),
        })
        const res1 = await res.json();
        if (res1.success) {
            window.location.replace("/user/orders");
        }
        else if (res1.redirect) {
            window.location.replace(res1.url);
        }
        else {
            orderMsg.innerHTML = res1.message;
            orderMsg.classList.remove("success");
            orderMsg.classList.add("err");
            setTimeout(() => {
                orderMsg.classList.remove("err");
            }, 5000)
        }
    })
})()
