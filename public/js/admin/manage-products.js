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
    function getFilteredCards() {
        return Array.from(products).filter(card =>
            card.classList.contains("filter-pro")
        );
    }
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
                    product.classList.add("active-card")
                } else {
                    product.classList.remove("filter-pro")
                    product.classList.remove("active-card")
                    product.classList.add("unfilter")
                }
            });

            let filterProducts = Array.from(products).filter((p) => p.classList.contains("filter-pro"));
            document.getElementById("filteredNum").innerHTML = `(${filterProducts.length})`
            updateBTN();
        }
        document.getElementById("ratingFilter").addEventListener("change", applyFilters);
        document.getElementById("discountFilter").addEventListener("change", applyFilters);
        document.getElementById("priceFilter").addEventListener("change", applyFilters);
        document.getElementById("categoryFilter").addEventListener("change", applyFilters);
    }
    Filter();

    // Card Selection 
    function updateBTN() {

        const filteredCards = getFilteredCards();

        let res =
            filteredCards.length > 0 &&
            filteredCards.every(card => card.classList.contains("active-card"));

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

        document.getElementById("selectedNum").innerHTML =
            `(${filteredCards.filter(p => p.classList.contains("active-card")).length})`;
    }
    updateBTN();
    document.getElementById("selectionBTN").addEventListener("click", () => {

        const filteredCards = getFilteredCards();

        if (selectionBTN.classList.contains("select")) {
            filteredCards.forEach(p => p.classList.add("active-card"));
        } else {
            filteredCards.forEach(p => p.classList.remove("active-card"));
        }

        updateBTN();
    });
    products.forEach(card => {
        card.addEventListener("click", (e) => {

            if (
                e.target.closest(".categoryBtn") ||
                e.target.closest(".dropdown-con") ||
                e.target.closest(".info") ||
                e.target.closest(".btn")
            ) return;

            if (!card.classList.contains("filter-pro")) return;

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
    });

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
            customizeDropdown();
        });


        if (!saveBtn.dataset.bound) {
            saveBtn.dataset.bound = "true";

            saveBtn.addEventListener("click", async () => {
                if (saveBtn.dataset.saving === "true") return;

                saveBtn.dataset.saving = "true";
                saveBtn.disabled = true;

                try {
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

                    const categories = cData.categories;
                    const cardCategories = pData.products.find(p => p._id == main.id).proCategory;
                    newData.selectedPaths = getSelectedPaths(cardCategories, categories);

                    formData.append("newData", JSON.stringify(newData));

                    const response = await fetch("/admin/manage-products/edit-product", {
                        method: "POST",
                        body: formData,
                    });

                    const data = await response.json();

                    if (data.success) {
                        applyUpdatedUI(main, newData, data);
                    }
                } catch (err) {
                    console.error("SAVE ERROR:", err);
                } finally {
                    // 🔓 Unlock save button
                    saveBtn.dataset.saving = "false";
                    saveBtn.disabled = false;
                }
            });
        }
    }

    // Categories Dropdown
    const categories = cData.categories;
    function getSelectedPaths(cardCategories, categories) {
        const paths = [];

        cardCategories.forEach(obj => {
            const categoryName = Object.keys(obj)[0];
            const subs = obj[categoryName];

            subs.forEach(sub => {
                paths.push(`${categoryName}-${sub}`);
            });
        });

        return paths;
    }
    document.querySelectorAll(".cateInfo").forEach((cateInfo) => {

        const dropdownCon = cateInfo.querySelector(".dropdown-con");
        const categoryBtn = cateInfo.querySelector(".categoryBtn");
        const categoryIcon = cateInfo.querySelector(".arrow");

        let mainDropdown = null;
        let subDropdown = null;

        function removeSubDropdown() {
            if (subDropdown) {
                subDropdown.remove();
                subDropdown = null;
            }
        }

        function calculateCounts(cardCategories) {
            let mainCount = cardCategories.length;
            let subCount = 0;

            cardCategories.forEach(obj => {
                subCount += Object.values(obj)[0].length;
            });

            return { mainCount, subCount };
        }
        function updateCateUI(cardCategories) {
            let card = categoryBtn.closest(".product-card");
            btnFunctions(card)

            const { mainCount, subCount } = calculateCounts(cardCategories);

            // text update
            categoryBtn.childNodes[0].textContent = `(${mainCount}/${subCount}) `;
        }
        function getCategoryCount(categoryName, totalSubs, cardCategories) {
            const found = cardCategories.find(obj => obj[categoryName]);
            const selected = found ? found[categoryName].length : 0;
            return `(${totalSubs}/${selected})`;
        }
        function isSubSelected(categoryName, subName, cardCategories) {
            const found = cardCategories.find(obj => obj[categoryName]);
            return found ? found[categoryName].includes(subName) : false;
        }
        function isCategoryFullySelected(categoryName, subs, cardCategories) {
            const found = cardCategories.find(obj => obj[categoryName]);
            if (!found) return false;

            return subs.length > 0 && subs.every(
                s => found[categoryName].includes(s.subName)
            );
        }
        function toggleCategory(categoryName, subs, cardCategories) {

            const index = cardCategories.findIndex(obj => obj[categoryName]);

            // agar category exist hi nahi karti → add all subs
            if (index === -1) {
                cardCategories.push({
                    [categoryName]: subs.map(s => s.subName)
                });
                return;
            }

            const allSubs = subs.map(s => s.subName);
            const selectedSubs = cardCategories[index][categoryName];

            const isFullySelected =
                allSubs.length > 0 &&
                allSubs.every(s => selectedSubs.includes(s));

            if (isFullySelected) {
                // 🔥 IMPORTANT FIX
                // agar unselect kar rahe ho → poori category hata do
                cardCategories.splice(index, 1);
            } else {
                // select all
                cardCategories[index][categoryName] = allSubs;
            }
        }
        function toggleSub(categoryName, subName, cardCategories) {
            let found = cardCategories.find(obj => obj[categoryName]);

            if (!found) {
                cardCategories.push({ [categoryName]: [subName] });
            } else {
                const idx = found[categoryName].indexOf(subName);
                if (idx > -1) {
                    found[categoryName].splice(idx, 1);
                } else {
                    found[categoryName].push(subName);
                }
            }
        }

        function createMainDropdown(items, cardCategories) {
            if (mainDropdown) return;

            mainDropdown = document.createElement("div");
            mainDropdown.classList.add("dropdown");
            mainDropdown.style.left = "0px";

            mainDropdown.innerHTML = items.map(i => {
                const total = i.subs?.length || 0;
                const countText = getCategoryCount(i.name, total, cardCategories);

                const isSelected = isCategoryFullySelected(
                    i.name,
                    i.subs || [],
                    cardCategories
                );

                return `
        <div class="cate-con">
            <div class="count">${countText}</div>
            <div class="category main-cat ${isSelected ? "selected" : ""}">
                ${i.name}
            </div>
        </div>
        `;
            }).join("");

            dropdownCon.append(mainDropdown);

            mainDropdown.querySelectorAll(".main-cat").forEach((cat, index) => {
                cat.addEventListener("mouseover", () => {

                    mainDropdown.querySelectorAll(".main-cat")
                        .forEach(c => c.classList.remove("active"));
                    cat.classList.add("active");

                    const subs = items[index].subs || [];
                    if (!subs.length) {
                        removeSubDropdown();
                        return;
                    }

                    const subItems = subs.map(s => ({
                        name: s.subName,
                        path: `${items[index].path}-${s.subName}`,
                        parent: items[index].name
                    }));

                    createSubDropdown(subItems, cardCategories);
                });
            });

            mainDropdown.querySelectorAll(".main-cat").forEach((cat, index) => {

                // CLICK → select all subs
                cat.addEventListener("click", (e) => {
                    e.stopPropagation();

                    const category = items[index];
                    toggleCategory(
                        category.name,
                        category.subs || [],
                        cardCategories
                    );

                    // update UI
                    updateCateUI(cardCategories);

                    // re-render dropdown
                    mainDropdown.remove();
                    removeSubDropdown();
                    mainDropdown = null;
                    createMainDropdown(items, cardCategories);
                });

                // HOVER → show sub dropdown (tumhara existing code)
                cat.addEventListener("mouseover", () => {
                    mainDropdown.querySelectorAll(".main-cat")
                        .forEach(c => c.classList.remove("active"));
                    cat.classList.add("active");

                    const subs = items[index].subs || [];
                    if (!subs.length) {
                        removeSubDropdown();
                        return;
                    }

                    createSubDropdown(
                        subs.map(s => ({
                            name: s.subName,
                            path: `${items[index].path}-${s.subName}`,
                            parent: items[index].name
                        })),
                        cardCategories
                    );
                });
            });

        }
        function createSubDropdown(items, cardCategories) {
            removeSubDropdown();

            subDropdown = document.createElement("div");
            subDropdown.classList.add("dropdown");
            subDropdown.style.left = "220px";

            subDropdown.innerHTML = items.map(i => {
                const selected = isSubSelected(
                    i.parent,
                    i.name,
                    cardCategories
                );

                return `<div data-path="${i.path}" class="category ${selected ? "selected" : ""}">
                            ${i.name}
                        </div>`;
            }).join("");

            dropdownCon.append(subDropdown);

            subDropdown.querySelectorAll(".category").forEach(sub => {
                sub.addEventListener("click", (e) => {
                    e.stopPropagation();

                    const subName = sub.textContent.trim();
                    const parent = items[0].parent;

                    toggleSub(parent, subName, cardCategories);

                    // update UI
                    updateCateUI(cardCategories);

                    mainDropdown.remove();
                    removeSubDropdown();
                    mainDropdown = null;

                    const mainItems = categories.map(c => ({
                        name: c.categoryName,
                        path: c.categoryName,
                        subs: c.subCategories
                    }));

                    createMainDropdown(mainItems, cardCategories);
                    createSubDropdown(items, cardCategories);
                });
            });

        }

        categoryBtn.addEventListener("click", (e) => {
            e.stopPropagation();

            let card = categoryBtn.closest(".product-card");

            if (mainDropdown) {
                dropdownCon.style.display = "flex";
                categoryIcon.style.transform = "rotate(0deg)";
                mainDropdown.remove();
                removeSubDropdown();
                mainDropdown = null;
                return;
            }

            let cardCategories = pData.products.find(p => p._id == card.id).proCategory;

            categoryIcon.style.transform = "rotate(180deg)";

            const mainItems = categories.map(c => ({
                name: c.categoryName,
                path: c.categoryName,
                subs: c.subCategories
            }));

            createMainDropdown(mainItems, cardCategories);
        });
        dropdownCon.addEventListener("click", (e) => {
            e.stopPropagation();
        });
        document.addEventListener("click", (e) => {
            if (!cateInfo.contains(e.target)) {
                if (mainDropdown) {
                    mainDropdown.remove();
                    removeSubDropdown();
                    mainDropdown = null;
                    categoryIcon.style.transform = "rotate(0deg)";
                }
            }
        });

    });

    // Images Function
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
    removeImage();

    // Customize Buttons
    function truefalseBTN() {
        document.querySelectorAll(".value-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                let main = btn.closest(".product-card");

                btnFunctions(main)

                const isCustomizationBtn = btn.previousElementSibling.innerText.trim().toLowerCase() === "customization:";
                if (!isCustomizationBtn) return;

                const isCurrentlyTrue = btn.innerText.trim().toLowerCase() === "true";

                if (isCurrentlyTrue) {
                    btn.innerText = "False";
                    btn.style.color = "#ff0000";

                    main.querySelectorAll(".info-size, .info-color").forEach(el => el.remove());

                } else {
                    btn.innerText = "True";
                    btn.style.color = "#00bb00";

                    if (!main.querySelector(".info-size") && !main.querySelector(".info-color")) {
                        const html = `
                    <div class="info info-size">
                        <div>Sizes:</div>&nbsp;
                        <span class="down-btn" style="cursor: pointer;">(0)
                            <i class="fa-solid fa-chevron-up">
                                <div class="dropdown-options">
                                    <div class="add-rem-btns size">
                                        <button class="btns add">+</button>
                                        <button class="btns rem">-</button>
                                    </div>
                                </div>
                            </i>
                        </span>
                    </div>

                    <div class="info info-color">
                        <div>Colors:</div>&nbsp;
                        <span class="down-btn" style="cursor: pointer;">(0)
                            <i class="fa-solid fa-chevron-up">
                                <div class="dropdown-options">
                                    <div class="add-rem-btns color">
                                        <button class="btns add">+</button>
                                        <button class="btns rem">-</button>
                                    </div>
                                </div>
                            </i>
                        </span>
                    </div>
                    `;
                        main.querySelector(".edits").insertAdjacentHTML("beforeend", html);
                        customizeDropdown();
                    }
                }
            });
        });
    }
    function customizeDropdown() {

        document.addEventListener("click", (e) => {

            // ✅ 1. Agar dropdown ke andar click hua → kuch bhi mat karo
            if (e.target.closest(".dropdown-options")) {
                return;
            }

            const btn = e.target.closest(".down-btn");

            // ❌ 2. Agar down-btn bhi nahi mila → bahar click → close all
            if (!btn) {
                closeAllDropdowns();
                return;
            }

            // ✅ 3. Ab pakka down-btn pe click hua
            e.stopPropagation();

            const dropdown = btn.querySelector(".dropdown-options");
            const icon = btn.querySelector("i");
            const isOpen = dropdown.style.display === "flex";

            // pehle sab band
            closeAllDropdowns();

            // agar pehle band tha → ab open karo
            if (!isOpen) {
                dropdown.style.display = "flex";
                icon.classList.remove("fa-chevron-up");
                icon.classList.add("fa-chevron-down");
            }
        });

        function closeAllDropdowns() {
            document.querySelectorAll(".dropdown-options").forEach(d => {
                d.style.display = "none";
            });
            document.querySelectorAll(".down-btn i").forEach(i => {
                i.classList.remove("fa-chevron-down");
                i.classList.add("fa-chevron-up");
            });
        }
    }
    document.addEventListener("click", (e) => {
        const add_rem = e.target.closest(".btns");
        if (!add_rem) return;

        e.preventDefault();

        const main = add_rem.closest(".product-card");
        btnFunctions(main);

        const btn_con = add_rem.parentElement;
        const isSize = btn_con.classList.contains("size");

        const sizeHTML = `
        <div class="info cust-con">
            <input class="edited-data input-info size-info">
            <nav>= Rs.</nav>
            <input class="edited-data input-info" type="number" value="0">
        </div>`;

        const colorHTML = `
        <div class="info cust-con">
            <input class="edited-data" type="color">
            <nav>= Rs.</nav>
            <input class="edited-data color-price input-info" type="number" value="0">
        </div>`;

        if (add_rem.classList.contains("add")) {
            btn_con.insertAdjacentHTML("beforebegin", isSize ? sizeHTML : colorHTML);
        } else {
            const active = btn_con.parentElement.querySelector(".cust-con.active");
            if (active) active.remove();
            else btn_con.previousElementSibling?.remove();
        }

        const len = btn_con.parentElement.querySelectorAll(".info").length;
        btn_con.closest(".down-btn").querySelector("span").textContent = `(${len})`;
    });
    document.addEventListener("dblclick", (e) => {
        const cust = e.target.closest(".cust-con");
        if (!cust) return;
        cust.classList.toggle("active");
    });
    truefalseBTN();
    customizeDropdown();

    // UI
    function applyUpdatedUI(main, newData, serverRes) {
        main.querySelectorAll(".edited-data").forEach(el => {

            if (el.classList.contains("value-btn")) return;

            const span = document.createElement("span");
            span.classList.add(`edit-info`, `${el.dataset.info}`);
            span.dataset.info = el.dataset.info;

            let value = el.value;

            if (el.dataset.info === "stock" || el.dataset.info === "customization") {
                value = String(value).charAt(0).toUpperCase() + String(value).slice(1);
            }

            span.innerText = value;
            el.replaceWith(span);
        });

        main.querySelector(".price span").innerHTML =
            Math.ceil(newData.proOrignalPrice - (newData.proOrignalPrice * newData.proDiscount / 100));

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

        main.dataset.originalState = JSON.stringify({
            html: main.innerHTML
        });
    }
    function restoreOriginal(main) {
        if (!main.dataset.originalState) return;

        const original = JSON.parse(main.dataset.originalState);

        // PURE restore
        main.innerHTML = original.html;

        // cleanup
        delete main.dataset.originalState;
        delete main.frontImageFile;
        newFilesMap.clear();

        // ONLY rebind basics
        rebindProductCard(main);
    }
    function rebindProductCard(main) {

        // Edit button
        main.querySelector(".edit-btn")?.addEventListener("click", () => {
            btnFunctions(main);
        });

        // Front image click
        main.querySelector(".main-pic")?.addEventListener("click", () => {
            let input = main.querySelector(".front-pic");
            btnFunctions(main);
            input.click();
        });

        // 🔥 VERY IMPORTANT
        truefalseBTN();        // <-- customization true/false
        customizeDropdown();  // <-- sizes / colors dropdown
        removeImage();        // <-- gallery remove

        bindFrontImage(main);
        bindGalleryImages(main);
        // customizeDropdown();
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
        input.onchange = null;

        input.onchange = () => {
            Array.from(input.files).forEach(file => {

                const blobUrl = URL.createObjectURL(file);

                if (newFilesMap.has(blobUrl)) return;

                newFilesMap.set(blobUrl, file);

                const html = `
            <div class="box">
                <img src="${blobUrl}">
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
                        <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
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
