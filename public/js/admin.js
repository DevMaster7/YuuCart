let card = document.querySelector(".card-preview")
function showForm(index) {
    const slider = document.querySelector(".forms-slider");
    slider.style.transform = `translateX(-${index * 20}%)`;
}
function showCard(e) {
    if (e == 0) {
        card.style.display = "flex"
    }
    else {
        card.style.display = "none"
    }
}
let inputs = document.getElementById("productForm").querySelectorAll("input")
let proImg = document.querySelector(".pro-img")
let proName = document.querySelector(".pro-name")
let proPrice = document.querySelector(".pro-price")
let proOrignalPrice = document.querySelector(".before-dis")
let proDiscount = document.querySelector(".discount")
let proBuyer = document.querySelector(".pro-buyer")
let starCon = document.querySelector(".pro-rate")
let proReviews = document.querySelector(".pro-revs")



const imgInput = document.getElementById("image-upload");
imgInput.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
        const imageUrl = URL.createObjectURL(file);
        proImg.src = imageUrl;
    }
});

inputs.forEach((element) => {
    element.addEventListener("change", function () {
        if (element.name == "proName") {
            proName.innerHTML = element.value
        }
        else if (element.name == "proPrice") {
            proPrice.innerHTML = `Rs.${element.value}`
        }
        else if (element.name == "proOrignalPrice") {
            proOrignalPrice.innerHTML = `Rs.${element.value}`
        }
        else if (element.name == "proDiscount") {
            proDiscount.innerHTML = `-${element.value}%`
        }
        else if (element.name == "proBuyer") {
            proBuyer.innerHTML = `${element.value} Sold`
        }
        else if (element.name == "proRating") {
            if (element.value <= 5) {
                stars = element.value
                starCon.innerHTML = ""
                for (let i = 0; i < stars; i++) {
                    let star = document.createElement("i")
                    star.className = "fa-solid fa-star"
                    starCon.appendChild(star)
                }
                for (let i = 0; i < 5 - stars; i++) {
                    let star = document.createElement("i")
                    star.className = "fa-regular fa-star"
                    starCon.appendChild(star)
                }
            }
        }
        else if (element.name == "proNoOfReviews") {
            proReviews.innerHTML = ` (${element.value})`
        }
    })
})

document.querySelector(".logo").addEventListener("click", () => {
    window.location.href = '/shop';
})