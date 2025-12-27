async function productsData() {
    const res = await fetch("/api/backProduct");
    const data = await res.json();
    return data
}
async function categoriesData() {
    const res = await fetch("/api/frontCategories");
    const data = await res.json();
    return data
}

(async function () {
    const pData = await productsData();
    const cData = await categoriesData();
    const products = document.querySelectorAll(".product-card");

    // Filters
    function Filter() {
        cData.categories.forEach((category) => {
            let option = document.createElement("option");
            option.value = category.categoryName;
            option.innerHTML = category.categoryName;
            categoryFilter.append(option);
        })
        function applyFilters() {
            let rating = document.getElementById("ratingFilter").value;
            let discount = document.getElementById("discountFilter").value;
            let price = document.getElementById("priceFilter").value;
            let category = document.getElementById("categoryFilter").value;

            products.forEach((product) => {
                let id = product.id;
                let data = Array.from(pData.products).find(p => p._id === id);

                let ratingValue = data.proRating;
                let discountValue = data.proDiscount;
                let priceValue = data.proPrice;
                let categoryValue = data.proCategory;

                let ratingMin = 0, ratingMax = 5;
                if (rating !== "all") {
                    let [min, max] = rating.split("-").map(Number);
                    ratingMin = min;
                    ratingMax = max || min;
                }

                let discountMin = 0, discountMax = 100;
                if (discount !== "all") {
                    let [min, max] = discount.split("-").map(Number);
                    discountMin = min;
                    discountMax = max || min;
                }

                let priceMin = 0, priceMax = Infinity;
                if (price !== "all") {
                    [priceMin, priceMax] = price.split("-").map(Number);
                }

                let matchRating = (ratingValue >= ratingMin && ratingValue <= ratingMax);
                let matchDiscount = (discountValue >= discountMin && discountValue <= discountMax);
                let matchPrice = (priceValue >= priceMin && priceValue <= priceMax);
                let matchCategory = (category === "all" || categoryValue === category);

                if (matchRating && matchDiscount && matchPrice && matchCategory) {
                    product.classList.remove("unfilter")
                    product.classList.add("filter-pro")
                } else {
                    product.classList.remove("filter-pro")
                    product.classList.add("unfilter")
                }
            });

            let filterProducts = Array.from(products).filter((p) => p.classList.contains("filter-pro"));
            document.getElementById("filteredNum").innerHTML = `(${filterProducts.length})`
        }
        document.getElementById("ratingFilter").addEventListener("change", applyFilters);
        document.getElementById("discountFilter").addEventListener("change", applyFilters);
        document.getElementById("priceFilter").addEventListener("change", applyFilters);
        document.getElementById("categoryFilter").addEventListener("change", applyFilters);
    }
    Filter();

    // Card Selection 
    function updateBTN() {
        let res = Array.from(products).every(card =>
            card.classList.contains("active-card")
        );

        let btn = document.getElementById("selectionBTN");

        if (res) {
            btn.classList.add("deselect");
            btn.classList.remove("select");
            btn.innerHTML = "Deselect All";
        } else {
            btn.classList.add("select");
            btn.classList.remove("deselect");
            btn.innerHTML = "Select All";
        }
        document.getElementById("selectedNum").innerHTML = `(${Array.from(products).filter((p) => p.classList.contains("active-card")).length})`
    }
    updateBTN();
    document.getElementById("selectionBTN").addEventListener("click", () => {
        if (selectionBTN.classList.contains("select")) {
            products.forEach(p => p.classList.add("active-card"));
        } else {
            products.forEach(p => p.classList.remove("active-card"));
        }
        updateBTN();
    });
    products.forEach(card => {
        card.addEventListener("click", () => {
            card.classList.toggle("active-card");
            updateBTN();
        });
    });

    // Applied Discount
    document.querySelector(".discount-btn").addEventListener("click", () => {
        let dicountHTML = document.createElement("div")
        dicountHTML.classList.add("wrapper-confirmation")
        dicountHTML.innerHTML = `
        <div class="conformation-con">
        <div class="text">Add Discount!</div>
        <input class="discount-inp" type="number" placeholder="Enter Discount Here...">
        <div class="btn-con">
        <div>Apply</div>
        </div>
        </div>`

        let filterProducts = Array.from(products).filter((p) => {
            if (p.classList.contains("filter-pro") && p.classList.contains("active-card")) {
                return true
            }
        });
        if (filterProducts.length > 0) {
            confirmationWrapper(dicountHTML);
            filterProducts = Array.from(filterProducts).map((product) => {
                return product.id
            })
        }
        document.querySelector(".btn-con").getElementsByTagName("div")[0].addEventListener("click", async () => {
            let discount = document.querySelector(".discount-inp").value;
            let s = await fetch(`/admin/manage-products/apply-discount`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ discount, filterProducts }),
            })
            const res = await s.json();
            if (res.success) {
                window.location.reload();
            }
        })
    })

    // Edit Buttons
    document.querySelectorAll(".edit-btn").forEach(edit_btn => {
        edit_btn.addEventListener("click", () => {
            let main = edit_btn.closest(".product-card");
            btnFunctions(main)
        })
    });
    let newFilesMap = new Map();
    function btnFunctions(main) {
        if (!main.dataset.originalState) {
            main.dataset.originalState = JSON.stringify({
                html: main.innerHTML
            });
        }

        bindFrontImage(main);
        bindGalleryImages(main);

        main.querySelectorAll(".edit-info").forEach((e) => {
            let input = document.createElement("input");
            input.classList.add("edited-data")
            let isColorInput = false;

            if (e.classList.contains("color-info")) {
                input.setAttribute("type", "color");
                isColorInput = true;
                let c = e.dataset.color;

                function convertToHexColor(input) {
                    input = input.trim().toLowerCase();
                    if (/^#[0-9a-f]{6}$/.test(input)) return input;
                    if (/^#[0-9a-f]{3}$/.test(input)) {
                        return '#' + input.slice(1).split('').map(ch => ch + ch).join('');
                    }
                    if (input.startsWith('rgb')) {
                        let [r, g, b] = input.match(/\d+/g).map(Number);
                        return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
                    }
                    if (input.startsWith('hsl')) {
                        let [h, s, l] = input.match(/[\d.]+/g).map(Number);
                        s /= 100;
                        l /= 100;
                        const a = s * Math.min(l, 1 - l);
                        const f = n => {
                            const k = (n + h / 30) % 12;
                            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
                            return Math.round(255 * color).toString(16).padStart(2, '0');
                        };
                        return `#${f(0)}${f(8)}${f(4)}`;
                    }
                    return '#000000';
                }
                input.value = convertToHexColor(c);

                const colorPriceSpan = e.parentElement.querySelector('.color-price');
                if (colorPriceSpan) {
                    const priceInput = document.createElement("input");
                    priceInput.classList.add("edited-data", "color-price", "input-info");
                    priceInput.setAttribute("type", "number");
                    priceInput.setAttribute("min", "0");
                    priceInput.value = colorPriceSpan.innerText.trim();
                    colorPriceSpan.replaceWith(priceInput);
                }
            }
            else if (e.classList.contains("size-info")) {
                input.classList.add("input-info", "size-info")
                input.value = e.innerText.trim()
            }
            else {
                input.classList.add("input-info");
                if (e.classList.contains("proName")) {
                    input.classList.add("proName");
                }
                let text = e.innerHTML.trim();
                input.value = text;
            }

            e.replaceWith(input);
        });

        let editBtn = main.querySelector(".edit-btn")
        let deleteBtn = main.querySelector(".delete-btn")
        let saveBtn = main.querySelector(".save-btn")
        let cancelBtn = main.querySelector(".cancel-btn")
        editBtn.style.display = "none"
        deleteBtn.style.display = "none"
        saveBtn.style.display = "flex"
        cancelBtn.style.display = "flex"

        cancelBtn.addEventListener("click", () => {
            restoreOriginal(main);
        });

        if (!saveBtn.dataset.listenerAttached) {
            saveBtn.addEventListener("click", async () => {
                const formData = new FormData();

                if (main.frontImageFile) {
                    formData.append("frontImage", main.frontImageFile);
                }

                let newData = {
                    _id: main.querySelector("#product_id").getElementsByTagName("a")[0].innerText,
                    galleryImages: []
                };

                // Product Details
                main.querySelectorAll(".edited-data").forEach((e) => {
                    if (e.classList.contains("proName")) {
                        e.setAttribute("data-info", "proName");
                    } else if (!e.classList.contains("value-btn")) {
                        let dataName = e.parentElement.dataset.info;
                        e.setAttribute("data-info", dataName);
                    }

                    let key, value;

                    if (e.classList.contains("value-btn")) {
                        key = e.dataset.info;
                        value = e.innerText.toLowerCase();
                    } else {
                        function autoConvert(value) {
                            return /^\d+(\.\d+)?$/.test(value) ? Number(value) : value;
                        }
                        key = e.dataset.info;
                        value = autoConvert(e.value);
                    }

                    newData[key] = value;
                });

                // Color and Size
                if (newData.customization == "true") {
                    newData.colorAndPrice = [];
                    const colorInputs = main.querySelectorAll('input[type="color"]');
                    colorInputs.forEach(input => {
                        let priceEl = input.parentElement.querySelector('.color-price');
                        let color = input.value;
                        let price = priceEl ? Number(priceEl.value.trim()) : 0;
                        newData.colorAndPrice.push({ color, price });
                    });

                    newData.sizeAndPrice = [];
                    let sizeInputs = main.querySelectorAll(".size-info");
                    sizeInputs.forEach((e) => {
                        let size = e.value.toUpperCase();
                        let price = Number(e.parentElement.lastElementChild.value);
                        newData.sizeAndPrice.push({ size, price });
                    });
                }

                // Product Images
                main.querySelectorAll(".box").forEach((e) => {
                    if (!e.classList.contains("add-image-label")) {
                        const img = e.querySelector("img");
                        const src = img.src;

                        if (src.includes("cloudinary.com")) {
                            newData.galleryImages.push(src);
                        } else if (src.startsWith("blob:")) {
                            const file = newFilesMap.get(src);
                            if (file) {
                                formData.append("notIncludedImgs", file);
                            }
                        }
                    }
                });
                formData.append("newData", JSON.stringify(newData));

                const response = await fetch("/admin/manage-products/edit-product", {
                    method: "POST",
                    body: formData,
                });

                const data = await response.json();

                if (data.success) {
                    applyUpdatedUI(main, newData, data);
                }
            });

            saveBtn.dataset.listenerAttached = "true";
        }
    }

    document.querySelectorAll(".main-pic").forEach((e) => {
        let main = e.closest(".product-card");
        let input = main.querySelector(".front-pic");

        input.addEventListener("input", () => {
            if (input.files && input.files[0]) {
                const file = input.files[0];

                const blobUrl = URL.createObjectURL(file);

                main.frontImageFile = file;
                newFilesMap.set(blobUrl, file);

                main.querySelector(".main-pic img").src = blobUrl;
            }
        });

        e.addEventListener("click", () => {
            btnFunctions(main);
            input.click();
        });
    });

    // Remove Images Function
    function removeImage() {
        let picDiv = document.createElement("div")
        picDiv.classList.add("wrapper-confirmation")
        picDiv.innerHTML = `
        <div class="conformation-con">
        <div class="text">Are You Sure To Remove This Image?</div>
        <div class="btn-con">
        <div class="yes">Yes</div>
        <div class="no">No</div>
        </div>
        </div>`
        document.querySelectorAll(".box").forEach((e) => {
            e.addEventListener("click", () => {
                let main = e.closest(".product-card");
                btnFunctions(main)
                if (e.classList.length < 2) {
                    confirmationWrapper(picDiv);
                    document.querySelectorAll(".yes").forEach((btn) => {
                        btn.addEventListener("click", () => {
                            e.remove()
                        })
                    })
                }
            })
        })
    }
    removeImage()

    // Add Images
    document.querySelectorAll(".input-images").forEach((input) => {
        input.addEventListener("change", () => {
            Array.from(input.files).forEach((file) => {
                let blobUrl = URL.createObjectURL(file);
                newFilesMap.set(blobUrl, file);
                let main = input.closest(".product-card")
                let html = `
            <div class="box">
                <img src="${blobUrl}" alt="Product">
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960"
                        width="24px" fill="#e3e3e3">
                        <path
                            d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
                    </svg>
                </div>
            </div>`
                main.querySelector(".extra-pics").querySelector(".add-image-label").insertAdjacentHTML("beforebegin", html)
            })
            removeImage()
        })
    })

    // Customize Buttons
    function customizeDropdown() {
        document.querySelectorAll(".down-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                let main = btn.closest(".product-card");
                e.stopPropagation();

                const dropdown = btn.querySelector(".dropdown-options");
                const icon = btn.querySelector("i");
                const isAlreadyOpen = dropdown.style.display === "flex";

                document.querySelectorAll(".dropdown-options").forEach((d) => {
                    d.style.display = "none";
                });
                document.querySelectorAll(".down-btn i").forEach((i) => {
                    i.classList.remove("fa-chevron-down");
                    i.classList.add("fa-chevron-up");
                });

                if (!isAlreadyOpen) {
                    dropdown.style.display = "flex";
                    icon.classList.remove("fa-chevron-up");
                    icon.classList.add("fa-chevron-down");
                }
            });
        });
        document.querySelectorAll(".dropdown-options").forEach((dropdown) => {
            dropdown.addEventListener("click", (e) => {
                e.stopPropagation();
            });
        });
        window.addEventListener("click", () => {
            document.querySelectorAll(".dropdown-options").forEach((d) => {
                d.style.display = "none";
            });
            document.querySelectorAll(".down-btn i").forEach((i) => {
                i.classList.remove("fa-chevron-down");
                i.classList.add("fa-chevron-up");
            });
        });


        document.querySelectorAll(".btns").forEach((add_rem) => {
            add_rem.addEventListener("click", (e) => {
                let main = add_rem.closest(".product-card");
                e.preventDefault();
                btnFunctions(main)
                dbClick(document)

                let sizeHTML = `<div class="info cust-con">
                                            <input class="edited-data input-info size-info">
                                            <nav style="display: flex; flex-shrink: 0;">= Rs.</nav>
                                            <input class="edited-data input-info" type="number" value="0" min="0">
                                        </div>`
                let colorHTML = `<div class="info cust-con">
                                            <input class="edited-data" type="color">
                                            <nav style="display: flex; flex-shrink: 0;">= Rs.</nav>
                                            <input class="edited-data color-price input-info" type="number" value="0" min="0">
                                         </div>`
                let btn_con = add_rem.parentElement
                if (btn_con.classList.contains("size")) {
                    if (add_rem.classList.contains("add")) {
                        btn_con.insertAdjacentHTML("beforebegin", sizeHTML)
                        dbClick(document)
                    }
                    else {
                        dbClick(document)
                        if (btn_con.parentElement.querySelectorAll(".active").length > 0) {
                            btn_con.parentElement.querySelectorAll(".active").forEach((active) => {
                                active.remove()
                            })
                        }
                        else {
                            btn_con.previousElementSibling.remove()
                        }
                    }
                }
                else {
                    if (add_rem.classList.contains("add")) {
                        btn_con.insertAdjacentHTML("beforebegin", colorHTML)
                        dbClick(document)
                    }
                    else {
                        dbClick(document)
                        if (btn_con.parentElement.querySelectorAll(".active").length > 0) {
                            btn_con.parentElement.querySelectorAll(".active").forEach((active) => {
                                active.remove()
                            })
                        }
                        else {
                            btn_con.previousElementSibling.remove()
                        }
                    }
                }
            })
        })
        dbClick(document)
    }
    function dbClick(section) {
        section.querySelectorAll(".cust-con").forEach((cust) => {
            cust.addEventListener("dblclick", () => {
                if (!cust.classList.contains("active")) {
                    cust.classList.add("active");
                }
                else {
                    cust.classList.remove("active");
                }
            })
        })
    }
    customizeDropdown()

    // True/False Buttons
    document.querySelectorAll(".value-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            let main = btn.closest(".product-card");
            if (btn.innerHTML.trim().toLowerCase() == "true") {
                btn.innerHTML = "False"
                btn.style.color = "#ff0000"
                if (btn.previousElementSibling.innerHTML.trim().toLowerCase() == "customization:") {
                    let sizehtml = main.querySelector(".btn-con").previousElementSibling
                    let colorhtml = sizehtml.previousElementSibling
                    sizehtml.remove()
                    colorhtml.remove()
                }
            }
            else {
                btn.innerHTML = "True"
                btn.style.color = "#00bb00"
                if (btn.previousElementSibling.innerHTML.trim().toLowerCase() == "customization:") {
                    let productDataStr = main.dataset.product
                    let product = JSON.parse(productDataStr)

                    // Sizes HTML
                    let sizesHTML = "";
                    product.sizeAndPrice.forEach((s_p) => {
                        sizesHTML += `
                    <div class="info">
                        <div class="edit-info size-info">${s_p.size}</div>
                        <nav style="display: flex; flex-shrink: 0;">= Rs.</nav>
                        <span class="edit-info">${s_p.price}</span>
                    </div>
                  `;
                    });

                    // Colors HTML
                    let colorsHTML = "";
                    product.colorAndPrice.forEach((c_p) => {
                        colorsHTML += `
                    <div class="info">
                        <div class="color-info edit-info" data-color="${c_p.color}" style="background: ${c_p.color};"></div>
                        <nav style="display: flex; flex-shrink: 0;">= Rs.</nav>
                        <span class="edit-info">${c_p.price}</span>
                    </div>
                  `;
                    });

                    // Final HTML
                    let html = `
                  <div class="info">
                    <div>Sizes:</div>&nbsp;
                    <span class="down-btn" style="cursor: pointer;">(${product.sizeAndPrice.length})
                      <i class="fa-solid fa-chevron-up">
                        <div class="dropdown-options">
                          ${sizesHTML}
                        </div>
                      </i>
                    </span>
                  </div>

                  <div class="info">
                    <div>Colors:</div>&nbsp;
                    <span class="down-btn" style="cursor: pointer;">(${product.colorAndPrice.length})
                      <i class="fa-solid fa-chevron-up">
                        <div class="dropdown-options">
                          ${colorsHTML}
                        </div>
                      </i>
                    </span>
                  </div>
                `;
                    main.querySelector(".btn-con").insertAdjacentHTML("beforebegin", html)
                    customizeDropdown()
                }
            }
            btnFunctions(main)
        })
    })

    // Delete Product
    let deleteDiv = document.createElement("div")
    deleteDiv.classList.add("wrapper-confirmation")
    deleteDiv.innerHTML = `
    <div class="conformation-con">
    <div class="text">Are You Sure To Delete This Product?</div>
    <div class="btn-con">
    <div class="yes">Yes</div>
    <div class="no">No</div>
    </div>
    </div>`
    document.querySelectorAll(".delete-btn").forEach((delete_btn) => {
        delete_btn.addEventListener("click", () => {
            confirmationWrapper(deleteDiv);
            document.querySelector(".yes").addEventListener("click", async () => {
                let card = delete_btn.closest(".product-card")
                let productID = card.attributes.id.value
                const res = await fetch(`/admin/manage-products/delete-product`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productID }),
                })
                const res1 = await res.json();
                if (res1.success) {
                    card.remove()
                }
            })
        })
    })

    function applyUpdatedUI(main, newData, serverRes) {
        main.querySelectorAll(".edited-data").forEach(input => {
            const span = document.createElement("span");
            span.classList.add("edit-info");
            span.dataset.info = input.dataset.info;
            span.innerText = input.value;
            input.replaceWith(span);
        });

        const name = main.querySelector("[data-info='proName']");
        if (name) name.classList.add("proName");

        if (main.frontImageFile && serverRes.frontImageUrl) {
            main.querySelector(".main-pic img").src = serverRes.frontImageUrl;
        }

        if (serverRes.galleryImages) {
            const extraPics = main.querySelector(".extra-pics");
            extraPics.querySelectorAll(".box:not(.add-image-label)").forEach(b => b.remove());

            serverRes.galleryImages.forEach(url => {
                extraPics.insertAdjacentHTML("afterbegin", `
                <div class="box">
                    <img src="${url}">
                </div>
            `);
            });
        }

        main.querySelector(".edit-btn").style.display = "flex";
        main.querySelector(".delete-btn").style.display = "flex";
        main.querySelector(".save-btn").style.display = "none";
        main.querySelector(".cancel-btn").style.display = "none";

        delete main.frontImageFile;
        newFilesMap.clear();

        removeImage();
    }

    function restoreOriginal(main) {
        if (!main.dataset.originalState) return;

        const original = JSON.parse(main.dataset.originalState);
        main.innerHTML = original.html;

        delete main.dataset.originalState;
        delete main.frontImageFile;
        newFilesMap.clear();

        rebindProductCard(main);
        bindGalleryImages(main);
    }

    function rebindProductCard(main) {
        main.querySelector(".edit-btn")?.addEventListener("click", () => {
            btnFunctions(main);
        });

        main.querySelector(".main-pic")?.addEventListener("click", () => {
            let input = main.querySelector(".front-pic");
            btnFunctions(main);
            input.click();
        });

        bindFrontImage(main);
        bindGalleryImages(main);

        customizeDropdown();
        removeImage();
    }

    function bindFrontImage(main) {
        const input = main.querySelector(".front-pic");
        if (!input) return;

        input.value = "";

        input.onchange = () => {
            if (!input.files || !input.files[0]) return;

            const file = input.files[0];
            const blobUrl = URL.createObjectURL(file);

            main.frontImageFile = file;
            newFilesMap.set(blobUrl, file);

            main.querySelector(".main-pic img").src = blobUrl;
        };
    }
    function bindGalleryImages(main) {
        const input = main.querySelector(".input-images");
        if (!input) return;

        input.value = "";

        input.onchange = () => {
            Array.from(input.files).forEach(file => {

                const blobUrl = URL.createObjectURL(file);
                newFilesMap.set(blobUrl, file);

                const html = `
                <div class="box">
                    <img src="${blobUrl}">
                    <div>
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px"
                            viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
                            <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Z"/>
                        </svg>
                    </div>
                </div>`;

                main.querySelector(".extra-pics")
                    .querySelector(".add-image-label")
                    .insertAdjacentHTML("beforebegin", html);
            });

            removeImage();
        };
    }

    // Confirmation Function
    function confirmationWrapper(html) {
        document.getElementsByTagName("body")[0].prepend(html);

        if (document.querySelector(".no")) {
            document.querySelector(".no").addEventListener("click", () => {
                document.querySelector(".wrapper-confirmation").remove()
            })
        }
        document.querySelector(".wrapper-confirmation").addEventListener('click', (e) => {
            let mainCon = document.querySelector(".conformation-con")
            let text = document.querySelector(".text")
            let input = document.querySelector(".discount-inp")
            let btnCon = document.querySelector(".btn-con")
            if (e.target == mainCon || e.target == text || e.target == input || e.target == btnCon) {
                return
            }
            else {
                document.querySelector(".wrapper-confirmation").remove();
            }
        })
    }
})();
