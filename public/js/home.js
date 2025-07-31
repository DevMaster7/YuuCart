let icon = document.querySelector(".icon-con")
let themeBtn = document.querySelector(".switch")
let customizeRight = document.querySelector(".cust-right")
let customizeBox = customizeRight.querySelector(".right")
let customizePic = document.querySelector(".preview-pic").getElementsByTagName("img")[1]
let imgLogo = document.querySelector(".product-logo");
let positionSize = document.querySelector(".position-size")
let imgSelection = document.querySelector(".img-selection")
let colorSelection = document.querySelector(".color-selection")
let picBoxes = document.querySelectorAll(".img-box")
let colorBoxes = document.querySelectorAll(".color-box")
let carousel = document.getElementById("carousel");
let dotsContainer = document.getElementById("dots");
let faq_btn = document.querySelectorAll(".faq-topic")
let down = document.querySelectorAll(".extender")

// Logo Animation
icon.addEventListener("animationend", function () {
    icon.style.animation = "bounce .5s ease-in-out 2";
})

// Theme Changer
function toggleTheme() {
    const btn = document.querySelector(".theme__icon");
    btn.classList.toggle("clicked");
}  

// Change Products
picBoxes.forEach((e) => {
    e.addEventListener("click", () => {
        imgLogo.style.display = "none"
        customizeRight.style.padding = " 0px 50px"
        customizeBox.style.height = "400px"
        positionSize.style.display = "none"
        imgSelection.style.width = "unset"
        imgSelection.style.justifyContent = "center"
        colorSelection.style.gap = "10px"

        picBoxes.forEach((x) => {
            x.style.boxShadow = "0px 0px 2px #000000cf";
        });
        e.style.boxShadow = "#000000d9 3px 3px 5px";

        let imgSRC1 = e.innerHTML;
        let SRC1 = imgSRC1.split('src="')[1].split('"')[0];
        customizePic.src = SRC1;

        let SRC2 = SRC1.split("customizabale/")[1];
        if (SRC2.includes("MenTshirt") || SRC2.includes("Perfume")) {
            customizePic.style.height = "100%";
        }
        else if (SRC2.includes("FemTshirt")) {
            customizePic.style.height = "75%";
        }
        else if (SRC2.includes("Mug")) {
            customizePic.style.height = "85%";
        }

        let whiteBox = document.querySelector(".color-box.white");
        colorBoxes.forEach((y) => {
            y.style.boxShadow = "unset";
        });
        if (whiteBox) {
            whiteBox.style.boxShadow = "2px 2px 2px #000000d9";
        }
    });
});

// Change Colors of Products
colorBoxes.forEach((element) => {
    element.addEventListener("click", () => {
        let classText = element.className.slice(10)
        let imgSRC2 = customizePic.src;

        let startIndex = imgSRC2.indexOf("assets");
        let result = imgSRC2.substring(startIndex).substring(0, 30);
        let mainSRC = `${result}${classText}.png`
        customizePic.src = mainSRC;

        colorBoxes.forEach((y) => {
            y.style.boxShadow = "unset";
        });
        element.style.boxShadow = "2px 2px 2px #000000d9";
    });
});

// Logo on TShirts
document.getElementById("fileInput").addEventListener("change", function () {
    customizeRight.style.padding = "0px 25px"
    customizeBox.style.height = "420px"
    positionSize.style.display = "flex"
    imgSelection.style.width = "100%"
    imgSelection.style.justifyContent = "space-evenly"
    colorSelection.style.gap = "20px"
    imgLogo.style.display = "flex"

    let file = this.files[0];
    if (file) {
        let reader = new FileReader();
        reader.onload = function (e) {
            imgLogo.src = e.target.result;
        };
        reader.readAsDataURL(file);

        let widthLogo = document.getElementById("logo-W")
        let heightLogo = document.getElementById("logo-H")
        let xaxisLogo = document.getElementById("logo-X")
        let yaxisLogo = document.getElementById("logo-Y")
        widthLogo.addEventListener("input", function () {
            if (widthLogo.value > 100) {
                imgLogo.style.width = `${100}px`
            }
            else {
                imgLogo.style.width = `${widthLogo.value}px`
            }
        })
        heightLogo.addEventListener("input", function () {
            if (heightLogo.value > 100) {
                imgLogo.style.height = `${100}px`
            }
            else {
                imgLogo.style.height = `${heightLogo.value}px`
            }
        })
        xaxisLogo.addEventListener("input", function () {
            if (xaxisLogo.value > 100) {
                imgLogo.style.left = `${100}px`
            }
            else {
                imgLogo.style.left = `${xaxisLogo.value}px`
            }
        })
        yaxisLogo.addEventListener("input", function () {
            if (yaxisLogo.value > 100) {
                imgLogo.style.top = `${100}px`
            }
            else {
                imgLogo.style.top = `${yaxisLogo.value}px`
            }
        })
    }
});

// FAQs Opener and Closer
faq_btn.forEach(e => {
    e.addEventListener("click", () => {
        let currentFaq = e.nextElementSibling;
        let i = e.lastElementChild
        document.querySelectorAll(".extender-con").forEach(faq => {
            if (faq !== currentFaq) {
                faq.style.display = "none";
                i.classList.remove("fa-chevron-down")
            }
        });
        down.forEach(icon => {
            if (icon.classList.contains("fa-chevron-up")) {
                icon.classList.remove("fa-chevron-up");
                icon.classList.add("fa-chevron-down");
            }
        });
        if (currentFaq.style.display === "flex") {
            currentFaq.style.display = "none";
            i.classList.remove("fa-chevron-up")
            i.classList.add("fa-chevron-down")
        } else {
            currentFaq.style.display = "flex";
            i.classList.remove("fa-chevron-down")
            i.classList.add("fa-chevron-up")
            currentFaq.style.borderTop = "2px solid #F8F9FA"
        }
    });
});

// Review Cards
let cardsPerView = getCardsPerView();
let currentIndex = 0;
let autoScrollInterval;
function getCardsPerView() {
    const width = window.innerWidth;
    if (width <= 690) return 1;
    if (width <= 1024) return 2;
    return 3;
}
function slide(direction) {
    const totalCards = carousel.children.length;
    const maxIndex = totalCards - cardsPerView;
    currentIndex += direction;
    if (currentIndex < 0) currentIndex = 0;
    if (currentIndex > maxIndex) currentIndex = 0;
    updateSlider();
}
function slideTo(index) {
    currentIndex = index;
    updateSlider();
}
function updateSlider() {
    const translateX = carousel.children[0].offsetWidth * currentIndex;
    carousel.style.transform = `translateX(-${translateX}px)`;
    updateCenterCard();
    updateDots();
}
function updateCenterCard() {
    const cards = carousel.querySelectorAll(".card");
    cards.forEach(card => card.classList.remove("center"));
    const centerIdx = currentIndex + Math.floor(cardsPerView / 2);
    if (cards[centerIdx]) {
        cards[centerIdx].classList.add("center");
    }
}
function updateDots() {
    dotsContainer.innerHTML = "";
    const totalCards = carousel.children.length;
    const dotCount = totalCards - cardsPerView;
    for (let i = 0; i <= dotCount; i++) {
        const dot = document.createElement("div");
        dot.classList.add("dot");
        if (i === currentIndex) {
            dot.classList.add("active");
        } else {
            dot.classList.add("small");
        }
        dot.addEventListener("click", () => {
            slideTo(i);
            resetAutoScroll();
        });
        dotsContainer.appendChild(dot);
    }
}
function addClickListeners() {
    const cards = carousel.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.addEventListener('click', () => {
            slideTo(index - 1);
            resetAutoScroll();
        });
    });
}
function startAutoScroll() {
    autoScrollInterval = setInterval(() => {
        slide(1);
    }, 6000);
}
function resetAutoScroll() {
    clearInterval(autoScrollInterval);
    startAutoScroll();
}
window.addEventListener("resize", () => {
    cardsPerView = getCardsPerView();
    currentIndex = 0;
    updateSlider();
});
cardsPerView = getCardsPerView();
updateSlider();
addClickListeners();
startAutoScroll();
