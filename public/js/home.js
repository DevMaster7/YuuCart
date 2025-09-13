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

picBoxes.forEach((e) => {
    e.addEventListener("click", () => {
        picBoxes.forEach((x) => {
            x.classList.remove("active");
        })
        colorBoxes.forEach((x) => {
            x.classList.remove("active");
        })
        document.querySelector(".color-box.white").classList.add("active");
        let mainSRC = e.children[0].src
        if (mainSRC.includes("MugWhite") || mainSRC.includes("Perfume")) {
            colorSelection.style.display = "none";
        }
        else {
            colorSelection.style.display = "flex";
        }
        customizePic.src = mainSRC
        e.classList.add("active");
    })
})

colorBoxes.forEach((e) => {
    e.addEventListener("click", () => {
        colorBoxes.forEach((x) => {
            x.classList.remove("active");
        })
        let imgSRC2 = customizePic.src;
        let classText = e.className.slice(10)
        let startIndex = imgSRC2.indexOf("assets");
        let result = imgSRC2.substring(startIndex).substring(0, 30);
        let mainSRC = `${result}${classText}.png`
        customizePic.src = mainSRC;
        e.classList.add("active");
    })
})

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

const AUTOPLAY_MS = 3000;
const TRANSITION_MS = 450;
const VISIBLE = 3;
const viewport = document.getElementById('viewport');
const track = document.getElementById('track');
const dotsWrap = document.getElementById('dots');
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');

let slides = Array.from(track.children);
const realCount = slides.length;
const cloneCount = VISIBLE;

for (let i = slides.length - cloneCount; i < slides.length; i++) track.insertBefore(slides[i].cloneNode(true), track
    .firstChild);
for (let i = 0; i < cloneCount; i++) track.appendChild(slides[i].cloneNode(true));
slides = Array.from(track.children);

let index = cloneCount;
let isAnimating = false;

function gapPx() {
    return parseFloat(getComputedStyle(track).gap) || 0;
}

function updateLayout(withTransition = true) {
    const slideW = slides[0].offsetWidth;
    const step = slideW + gapPx();
    // In which -27 is changeable
    let translateX = ((viewport.clientWidth / 2) - (slideW / 2) - index * step) - 27;
    // window.addEventListener('resize', () => {
    //     if (window.innerWidth <= 640) {
    //         console.log(`Bye!`);
    //         translateX = (((viewport.clientWidth / 2) - (slideW / 2) - index * step) - 27) - 1000;
    //     }
    // })
    if (!withTransition) track.style.transition = 'none';
    track.style.transform = `translateX(${translateX}px)`;
    if (!withTransition) {
        track.getBoundingClientRect();
        track.style.transition = '';
    }
    slides.forEach((s, i) => {
        s.classList.remove('slide--center', 'slide--side', 'slide--other');
        const diff = i - index;
        const half = Math.floor(slides.length / 2);
        let d = diff;
        if (d > half) d -= slides.length;
        if (d < -half) d += slides.length;
        if (d === 0) s.classList.add('slide--center');
        else if (d === -1 || d === 1) s.classList.add('slide--side');
        else s.classList.add('slide--other');
    });
}

function next() {
    moveTo(index + 1)
};

function prev() {
    moveTo(index - 1)
};

function moveTo(t) {
    if (isAnimating) return;
    isAnimating = true;
    index = t;
    updateLayout(true);
    setTimeout(() => {
        if (index < cloneCount) {
            index += realCount;
            updateLayout(false);
        } else if (index >= realCount + cloneCount) {
            index -= realCount;
            updateLayout(false);
        }
        isAnimating = false;
    }, TRANSITION_MS);
}
function goTo(r) {
    if (isAnimating) return;
    index = r + cloneCount;
    moveTo(index);
}
let timer = null;

function startAutoplay() {
    stopAutoplay();
    timer = setInterval(() => next(), AUTOPLAY_MS);
}

function stopAutoplay() {
    if (timer) clearInterval(timer);
    timer = null;
}
prevBtn.addEventListener('click', prev);
nextBtn.addEventListener('click', next);
updateLayout(false);
startAutoplay();
window.addEventListener('resize', () => setTimeout(() => updateLayout(false), 120));
