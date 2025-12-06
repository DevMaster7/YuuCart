(async function () {
    const imgContainer = document.querySelector('.product-pic-con');
    const productID = document.getElementsByTagName("head")[0].dataset.id;
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
                imgContainer.getElementsByTagName("img")[0].src = imgURL;
            })
        })
    }
    activeBox(landDivs)
    activeBox(mobileDivs)

    // Zoom-In Zoom-Out Product
    const image = document.querySelector('.zoom-image');
    imgContainer.addEventListener('mousemove', function (e) {
        const { left, top, width, height } = imgContainer.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;

        image.style.transformOrigin = `${x}% ${y}%`;
        image.style.transform = 'scale(2.1)';
    });
    imgContainer.addEventListener('mouseleave', function () {
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
        const res = await fetch('/shop/add-to-cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ proID: productID }),
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
        let productQuantity = Number(document.querySelector(".product-quantity-value").innerHTML.trim())
        let productSize = null;
        let productColor = null;
        document.querySelectorAll(".cust-size").forEach((e) => {
            if (e.classList.contains("activeSize")) {
                productSize = e.innerHTML.trim()
            }
        })
        document.querySelectorAll(".cust-color").forEach((e) => {
            if (e.classList.contains("activeColor")) {
                productColor = e.dataset.color
            }
        })
        const obj = {
            productId: productID,
            productQuantity,
            productSize,
            productColor,
        }
        const productData = [obj];
        const res = await fetch(`/shop/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productData }),
        });
        const res1 = await res.json();
        if (res1.success) {
            window.location.href = `/shop/checkout/${productID}`;
        }
    })

    // Add Review and Picture
    document.getElementById("addReview")?.addEventListener("click", () => {
        showModal("Add Review", `
        <div class="review-form">
            <div class="rev-stars" id="stars">
                ${[...Array(5)].map((_, i) => `<div class="star" data-value="${i + 1}"><i class="fa fa-star"></i></div>`).join('')}
            </div>

            <input type="number" id="ratingNumber" step="0.1" min="0" max="5" placeholder="Rate 0–5" />

            <textarea id="comment" placeholder="Write your review..."></textarea>
            <input type="file" id="images" multiple accept="image/*" />
            <button class="submit-btn" id="submitReview">Submit Review</button>
        </div>
                `);

        const starElems = document.querySelectorAll("#stars .star");
        const ratingInput = document.getElementById("ratingNumber");
        let selectedRating = 0;
        starElems.forEach(star => {
            star.addEventListener("click", () => {
                selectedRating = parseInt(star.dataset.value);
                ratingInput.value = selectedRating;
                updateStars(selectedRating);
            });
        });
        ratingInput.addEventListener("input", () => {
            let val = parseFloat(ratingInput.value);
            if (isNaN(val)) val = 0;
            if (val < 0) val = 0;
            if (val > 5) val = 5;
            selectedRating = val;
            updateStars(val);
        });
        function updateStars(rating) {
            starElems.forEach((star, i) => {
                const fillPercent = Math.min(Math.max(rating - i, 0), 1) * 100;
                star.querySelector("i").style.background = `linear-gradient(90deg, #ffb703 ${fillPercent}%, #ccc ${fillPercent}%)`;
                star.querySelector("i").style.webkitBackgroundClip = "text";
                star.querySelector("i").style.webkitTextFillColor = "transparent";
            });
        }

        document.getElementById("submitReview").addEventListener("click", async () => {
            const comment = document.getElementById("comment").value.trim();
            const formData = new FormData();
            formData.append("review[id]", productID);
            formData.append("review[rating]", selectedRating);
            formData.append("review[comment]", comment);
            for (let file of document.querySelector("#images").files) {
                formData.append("images", file);
            }
            let res = await fetch("/shop/addReview", {
                method: 'POST',
                body: formData
            });
            let data = await res.json();
            if (data.success) {
                document.getElementById("addReview").remove();

                let imgs = document.querySelector("#images").files;
                imgs = Array.from(imgs).map(i => `<div class="img-box">
                                    <img src="${URL.createObjectURL(i)}" alt="">
                                    <div class="overlay">
                                        <i class="fa fa-search-plus"></i>
                                    </div>
                                </div>`).join('')
                let newRev = `<div class="review">
                        <div class="meta">
                            <div style="width: fit-content;display: flex;flex-direction: column;align-items: center;">
                                <strong>${data.fullname}</strong>
                                <span style="font-size: 10px;text-align: center;color: #6f6f6f;">${data.username}
                                </span>
                            </div>
                            <p>${comment}</p>
                            <div style="display: flex;gap: 7px;">
                                ${imgs}
                            </div>
                        </div>
                        <div class="meta">
                            <div style="display: flex; gap: 5px;align-items: center;">
                                <div class="stars-con">
                                    <div class="stars"
                                        style="font-size:1.1em;--rating:${((selectedRating / 5) * 100)}%;"></div>
                                </div>
                                <div class="small-txt">(${selectedRating})</div>
                            </div>
                            <div class="small-txt">just now</div>
                        </div>
                    </div>`;
                document.querySelector(".reviews").insertAdjacentHTML("afterbegin", newRev);

                document.querySelector(".product-reviews").textContent = `Ratings ${data.product.proNoOfReviews}`;
                document.querySelectorAll(".stars").forEach(star => star.style.setProperty("--rating", `${(data.product.proRating / 5) * 100}%`));
                const ratingRow = document.querySelector(".rating-row");
                ratingRow.querySelector(".avg").innerHTML = `${data.product.proRating.toFixed(1)}<span>/5</span>`;
                ratingRow.querySelector(".rating-count").textContent = `${data.product.proNoOfReviews} ratings`;

                document.getElementById("bar-5").style.width = data.product.distribution[5] + "%";
                document.getElementById("bar-4").style.width = data.product.distribution[4] + "%";
                document.getElementById("bar-3").style.width = data.product.distribution[3] + "%";
                document.getElementById("bar-2").style.width = data.product.distribution[2] + "%";
                document.getElementById("bar-1").style.width = data.product.distribution[1] + "%";
                document.getElementById("percent-5").textContent = `${data.product.distribution[5]} %`;
                document.getElementById("percent-4").textContent = `${data.product.distribution[4]} %`;
                document.getElementById("percent-3").textContent = `${data.product.distribution[3]} %`;
                document.getElementById("percent-2").textContent = `${data.product.distribution[2]} %`;
                document.getElementById("percent-1").textContent = `${data.product.distribution[1]} %`;

                closeModal();
            }
            else {
                showModal("Error", `<p>${data.message}</p>`);
            }
        });
    });
    const galleryImages = document.querySelectorAll(".img-box img");
    let currentIndex = 0;
    function openPopup(index) {
        currentIndex = index;

        const popup = document.createElement("div");
        popup.className = "image-popup";

        popup.innerHTML = `
        <span class="nav-btn prev-btn">&#10094;</span>
        <img src="${galleryImages[index].src}" class="popup-img">
        <span class="nav-btn next-btn">&#10095;</span>
    `;

        document.body.appendChild(popup);

        popup.addEventListener("click", (e) => {
            if (!e.target.classList.contains("popup-img")) {
                popup.remove();
            }
        });

        if (galleryImages.length <= 1) {
            popup.querySelector(".prev-btn").style.display = "none";
            popup.querySelector(".next-btn").style.display = "none";
        }
        else {
            // Outside click closes popup

            // Prev / Next buttons
            popup.querySelector(".next-btn").addEventListener("click", (e) => {
                e.stopPropagation();
                nextImage();
            });

            popup.querySelector(".prev-btn").addEventListener("click", (e) => {
                e.stopPropagation();
                prevImage();
            });
        }
    }
    function nextImage() {
        currentIndex = (currentIndex + 1) % galleryImages.length;
        document.querySelector(".popup-img").src = galleryImages[currentIndex].src;
    }
    function prevImage() {
        currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
        document.querySelector(".popup-img").src = galleryImages[currentIndex].src;
    }
    galleryImages.forEach((img, index) => {
        img.addEventListener("click", () => openPopup(index));
    });

    // Q/A
    document.getElementById("askQuestionBtn")?.addEventListener("click", () => {
        let cap_token = "";

        showModal("Ask a Question", `
        <div class="ask-question-form">
            <textarea id="question" placeholder="Ask your question..."></textarea>
            <div id="captcha-container" style="transform: scale(0.8); transform-origin: center;"></div>
            <div id="message"></div>
            <button class="submit-btn" id="submitQuestion">Submit Question</button>
        </div>
        `);

        grecaptcha.render("captcha-container", {
            sitekey: document.getElementById("askQuestionBtn").parentElement.dataset.gcp,
            callback: (token) => {
                cap_token = token;
            }
        });

        document.getElementById("submitQuestion").addEventListener("click", async () => {
            const question = document.getElementById("question").value;
            if (!question || !cap_token) {
                document.getElementById("message").classList.add("error");
                document.getElementById("message").innerHTML = "All fields are required!";
                setTimeout(() => {
                    document.getElementById("message").innerHTML = '';
                }, 2500);
                return
            }
            if (question.trim().length < 10) {
                document.getElementById("message").classList.add("error");
                document.getElementById("message").innerHTML = "Ask Question must be at least 10 characters long!";
                setTimeout(() => {
                    document.getElementById("message").innerHTML = '';
                }, 2500);
                return
            }

            let res = await fetch("/shop/askQuestion", {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: productID,
                    question,
                    cap_token
                })
            })
            let data = await res.json();

            if (data.success) {
                closeModal();
                let newHTML = `<div class="qa-con">
                        <div class="meta" style="width: 100%;">
                            <div class="qa">
                                <div class="q">Q: ${question}</div>
                                <div class="info">
                                    <strong class="user-name">${data.username}</strong>
                                    <div class="small-txt">just now</div>
                                </div>
                            </div>
                            <div class="qa">
                                <div class="a">A: --------</div>
                            </div>
                        </div>
                    </div>`
                document.querySelector(".qa-list").insertAdjacentHTML("afterbegin", newHTML);
            }
            else {
                document.getElementById("message").classList.add("error");
                document.getElementById("message").innerHTML = data.message;
                setTimeout(() => {
                    document.getElementById("message").innerHTML = '';
                }, 2500);
            }
        });
    });

    // Additionals
    function showModal(title, content) {
        const root = document.getElementById("modalRoot");
        root.innerHTML = `
        <div class="modal-content">
            <h2>${title}</h2>
            ${content}
        </div>`;
        document.body.style.overflow = "hidden";
        root.style.display = "flex";
    }
    function closeModal() {
        const root = document.getElementById("modalRoot");
        root.style.display = "none";
        root.innerHTML = "";
        document.body.style.overflow = "auto";
    }
    window.addEventListener("click", e => {
        if (e.target.id === "modalRoot") closeModal();
    });
})()

const wrapper = document.querySelector(".content-wrapper");
const fadeMask = document.querySelector(".fade-mask");
const loadMoreBtn = document.querySelector(".load-more");

let currentHeight = 420;
let loadMoreHeight = 30000;

function checkIfLoadMoreNeeded() {
    if (wrapper.scrollHeight <= wrapper.clientHeight + 5) {
        loadMoreBtn.style.display = "none";
        fadeMask.style.display = "none";
    }
}

checkIfLoadMoreNeeded();

loadMoreBtn.addEventListener("click", () => {
    let currentMax = parseInt(getComputedStyle(wrapper).maxHeight);
    wrapper.style.maxHeight = currentMax + loadMoreHeight + "px";

    setTimeout(() => {
        if (wrapper.scrollHeight <= wrapper.clientHeight + 5) {
            loadMoreBtn.style.display = "none";
            fadeMask.style.display = "none";
        }
    }, 200);
});