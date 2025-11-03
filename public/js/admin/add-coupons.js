document.getElementById("chooseType").addEventListener("change", function () {
    if (this.value == "redeem") {
        document.getElementById("couponCost").style.display = "flex";
    } else {
        document.getElementById("couponCost").style.display = "none";
    }
});