let inputs = document.querySelectorAll("#productForm input");
let proImg = document.querySelector(".pro-img");
let proName = document.querySelector(".pro-name");
let proPrice = document.querySelector(".pro-price");
let proOriginalPrice = document.querySelector(".before-dis");
let proDiscount = document.querySelector(".discount");
let proBuyer = document.querySelector(".pro-buyer");
let starCon = document.querySelector(".pro-rate");
let proReviews = document.querySelector(".pro-revs");
let imgInput = document.getElementById("image-upload");

async function getCategories() {
    let res = await fetch("/api/frontCategories", {
        method: 'get',
        headers: { 'Content-Type': 'application/json' },
    });
    return await res.json();
}

// Image preview
imgInput.onchange = function () {
    const file = this.files[0];
    if (file) {
        proImg.src = URL.createObjectURL(file);
    }
};

// Input field updates
inputs.forEach(input => {
    input.onchange = () => {
        let val = input.value;
        if (input.name === "proName") proName.innerHTML = val;
        if (input.name === "proPrice") proPrice.innerHTML = `Rs.${val}`;
        if (input.name === "proOrignalPrice") proOriginalPrice.innerHTML = `Rs.${val}`;
        if (input.name === "proDiscount") proDiscount.innerHTML = `-${val}%`;
        if (input.name === "proBuyer") proBuyer.innerHTML = `${val} Sold`;
        if (input.name === "proNoOfReviews") proReviews.innerHTML = `(${val})`;
        if (input.name === "proRating" && val <= 5) {
            starCon.innerHTML = "";
            for (let i = 0; i < 5; i++) {
                let star = document.createElement("i");
                star.className = i < val ? "fa-solid fa-star" : "fa-regular fa-star";
                starCon.appendChild(star);
            }
        }
    };
});

// Dropdowns
document.querySelectorAll(".dropdown").forEach(drop => {
    drop.onclick = () => {
        if (document.getElementById("choose").value === "true") {
            document.getElementById("optionsSizeBox").style.display = "none";
            document.getElementById("optionsColorBox").style.display = "none";
            drop.nextElementSibling.style.display = "flex";
        }
    };
});
// Hide dropdowns on outside click
document.onclick = (e) => {
    if (!e.target.closest(".dropdown") && !e.target.closest(".options")) {
        document.getElementById("optionsSizeBox").style.display = "none";
        document.getElementById("optionsColorBox").style.display = "none";
    }
};

// Add Size Input
document.getElementById("addSize").onclick = () => {
    let box = document.createElement("div");
    box.className = "add-inputs";
    box.innerHTML = `<input name="sizes[]" placeholder="Size" required>
                     <input type="number" name="sizePrices[]" placeholder="Price" required>`;
    document.querySelector(".optionSizes").appendChild(box);
};
// Remove Size Input
document.getElementById("removeSize").onclick = () => {
    let last = document.querySelector(".optionSizes .add-inputs:last-child");
    if (last) last.remove();
};

// Add Color Input
document.getElementById("addColor").onclick = () => {
    let box = document.createElement("div");
    box.className = "add-inputs";
    box.innerHTML = `
                     <input type="color" class="colorInp" name="colors[]" placeholder="Color" required>
                     <input type="number" name="colorPrices[]" placeholder="Price" required>`;
    document.querySelector(".optionColors").appendChild(box);
};
// Remove Color Input
document.getElementById("removeColor").onclick = () => {
    let last = document.querySelector(".optionColors .add-inputs:last-child");
    if (last) last.remove();
};
// Color preview
function updateColorPreview() {
    document.querySelectorAll(".colorInp").forEach(input => {
        input.onchange = () => {
            input.previousElementSibling.style.backgroundColor = input.value;
        };
    });
}

(async function () {
    const Data = await getCategories();
    let mainCateOptions = document.getElementById("optionsList");

    let options = Data.categories.map(category => `
        <div class="option">
            <input type="checkbox" data-value="${category.categoryName}">
            <div class="lbl">${category.categoryName}</div>
        </div>
    `).join("");

    mainCateOptions.innerHTML += options;

    const multiField = document.getElementById("multifield");
    const multiHeader = document.getElementById("multiHeader");
    const dropdown = document.getElementById("dropdown");
    const searchInput = document.getElementById("searchInput");
    const optionsList = document.getElementById("optionsList");
    const displayValue = document.getElementById("displayValue");
    const countInfo = document.getElementById("countInfo");
    const selectAll = document.getElementById("selectAll");

    let selected = new Set();

    function allOptions() {
        return [...optionsList.querySelectorAll('.option input[type="checkbox"]')]
            .filter(cb => cb !== selectAll);
    }

    function open() {
        dropdown.classList.add("show");
        multiHeader.classList.add("active");
    }

    function close() {
        dropdown.classList.remove("show");
        multiHeader.classList.remove("active");
        searchInput.value = "";
        filter("");
    }

    multiHeader.addEventListener("click", () =>
        dropdown.classList.contains("show") ? close() : open()
    );

    document.addEventListener("click", (e) => {
        if (!document.getElementById("multifield").contains(e.target)) close();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") close();
    });

    optionsList.addEventListener("click", (e) => {
        const row = e.target.closest(".option");
        if (!row) return;

        const cb = row.querySelector("input");
        cb.checked = !cb.checked;

        // SELECT ALL CLICK
        if (row.classList.contains("select-all-option")) {
            const checked = cb.checked;

            allOptions().forEach(c => c.checked = checked);

            selected = checked
                ? new Set(allOptions().map(c => c.dataset.value))
                : new Set();

            render();
            handleSubcategories();
            return;
        }

        // Single Click
        cb.checked ? selected.add(cb.dataset.value) : selected.delete(cb.dataset.value);

        // update selectAll
        selectAll.checked = allOptions().every(c => c.checked);

        render();
        handleSubcategories();
    });

    function render() {
        const arr = [...selected];

        if (arr.length === 0) {
            displayValue.innerHTML = "&nbsp;";
            displayValue.classList.add("placeholder");
            multiHeader.classList.remove("filled");
        } else {
            displayValue.textContent =
                arr.slice(0, 3).join(", ") + (arr.length > 3 ? ` +${arr.length - 3}` : "");
            displayValue.classList.remove("placeholder");
            multiHeader.classList.add("filled");
        }

        countInfo.textContent = `${arr.length} selected`;

        // ⭐ UPDATE HIDDEN INPUT (CATEGORIES)
        document.getElementById("selectedCategories").value = JSON.stringify(arr);
    }

    function filter(term) {
        term = term.toLowerCase();
        optionsList.querySelectorAll(".option").forEach((opt, i) => {
            if (i === 0) return;
            const text = opt.innerText.toLowerCase();
            opt.style.display = text.includes(term) ? "flex" : "none";
        });
    }
    searchInput.addEventListener("input", (e) => filter(e.target.value));

    // 🔥 SUB CATEGORY BUILDER
    function handleSubcategories() {
        const selectedArr = [...selected];

        // Remove old subcategory field
        const oldField = document.getElementById("subField");
        if (oldField) oldField.remove();

        if (selectedArr.length === 0) return;

        let subs = [];

        selectedArr.forEach(cat => {
            const found = Data.categories.find(c => c.categoryName === cat);
            if (found && found.subCategories) {
                subs.push(...found.subCategories.map(s => `${cat}-${s.subName}`));
            }
        });

        subs = [...new Set(subs)];

        if (subs.length === 0) return;

        let subHTML = `
        <div class="field subcates" id="subField">

            <div class="multiple-select multi-header" id="subHeader" tabindex="0">
                <div class="multi-value placeholder" id="subDisplay">&nbsp;</div>
            </div>

            <label>Sub Categories</label>

            <div class="dropdown-panel" id="subDropdown">
                <div class="search-box">
                    <input type="text" id="subSearch" placeholder="Search...">
                </div>

                <div class="options-list" id="subOptions">

                    <div class="option select-all-option">
                        <input type="checkbox" id="subSelectAll">
                        <div class="lbl"><strong>Select all</strong></div>
                    </div>

                    ${subs.map(s => `
                        <div class="option">
                            <input type="checkbox" data-value="${s}">
                            <div class="lbl">${s}</div>
                        </div>
                    `).join("")}

                </div>

                <div class="helper-row">
                    <div id="subCount">0 selected</div>
                    <div>Esc to close</div>
                </div>
            </div>
        </div>
    `;

        multiField.insertAdjacentHTML("afterend", subHTML);

        initSubEvents();
    }

    function initSubEvents() {
        const subHeader = document.getElementById("subHeader");
        const subDropdown = document.getElementById("subDropdown");
        const subOptions = document.getElementById("subOptions");
        const subDisplay = document.getElementById("subDisplay");
        const subCount = document.getElementById("subCount");
        const subSelectAll = document.getElementById("subSelectAll");

        let selectedSubs = new Set();

        function openSub() {
            subDropdown.classList.add("show");
            subHeader.classList.add("active");
        }
        function closeSub() {
            subDropdown.classList.remove("show");
            subHeader.classList.remove("active");
            document.getElementById("subSearch").value = "";
            filterSub("");
        }

        subHeader.addEventListener("click", () =>
            subDropdown.classList.contains("show") ? closeSub() : openSub()
        );

        document.addEventListener("click", (e) => {
            if (!document.getElementById("subField").contains(e.target)) closeSub();
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") closeSub();
        });

        subOptions.addEventListener("click", (e) => {
            const row = e.target.closest(".option");
            if (!row) return;

            const cb = row.querySelector("input");
            cb.checked = !cb.checked;

            if (row.classList.contains("select-all-option")) {
                const checked = cb.checked;

                [...subOptions.querySelectorAll(".option input")].forEach(c => {
                    if (c !== subSelectAll) c.checked = checked;
                });

                selectedSubs = checked
                    ? new Set([...subOptions.querySelectorAll("input[data-value]")].map(i => i.dataset.value))
                    : new Set();

                renderSub();
                return;
            }

            cb.checked ? selectedSubs.add(cb.dataset.value) : selectedSubs.delete(cb.dataset.value);

            subSelectAll.checked =
                [...subOptions.querySelectorAll("input[data-value]")].every(c => c.checked);

            renderSub();
        });

        function renderSub() {
            const arr = [...selectedSubs];

            if (arr.length === 0) {
                subDisplay.innerHTML = "&nbsp;";
                subDisplay.classList.add("placeholder");
                subHeader.classList.remove("filled");
            } else {
                subDisplay.textContent =
                    arr.slice(0, 3).join(", ") + (arr.length > 3 ? ` +${arr.length - 3}` : "");
                subDisplay.classList.remove("placeholder");
                subHeader.classList.add("filled");
            }

            subCount.textContent = `${arr.length} selected`;

            // ⭐ UPDATE HIDDEN INPUT (SUBCATEGORIES)
            document.getElementById("selectedSubCategories").value = JSON.stringify(arr);
        }

        function filterSub(term) {
            term = term.toLowerCase();
            subOptions.querySelectorAll(".option").forEach((opt, i) => {
                if (i === 0) return;
                const text = opt.innerText.toLowerCase();
                opt.style.display = text.includes(term) ? "flex" : "none";
            });
        }

        document.getElementById("subSearch")
            .addEventListener("input", (e) => filterSub(e.target.value));
    }
})();
