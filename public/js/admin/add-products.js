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

(async function () {
    const Data = await getCategories();
    let mainCateOptions = document.getElementById("chooseCategory");
    let options = Array.from(Data.categories).map(category => `<option value="${category.categoryName}">${category.categoryName}</option>`).join(" ");
    mainCateOptions.innerHTML += options;

    mainCateOptions.onchange = () => {
        let cateValue = mainCateOptions.value;
        if (cateValue) {
            let subCategories = Data.categories
                .find(category => category.categoryName === cateValue).subCategories;
            document.querySelectorAll(".subcates")?.forEach(subCate => subCate.remove());
            if (subCategories.length === 0) return;
            let subOptions = Array.from(subCategories)
                .map(subCategory => `<option value="${subCategory.subName}">${subCategory.subName}</option>`).join(" ");
            let subCategoryHTML = `<div class="field subcates">
                            <select id="chooseSubCategory" name="proSubCategory">
                                <option value="" disabled selected hidden></option>
                            </select>
                            <label for="chooseSubCategory">Sub Category</label>
                        </div>`
            mainCateOptions.closest(".field").insertAdjacentHTML("afterend", subCategoryHTML);
            document.getElementById("chooseSubCategory").innerHTML += subOptions;
        }
    }
})()

// Color preview
function updateColorPreview() {
    document.querySelectorAll(".colorInp").forEach(input => {
        input.onchange = () => {
            input.previousElementSibling.style.backgroundColor = input.value;
        };
    });
}
const multiDisplay = document.getElementById("multiDisplay");
const multiOptions = document.getElementById("multiOptions");
const label = document.querySelector(".field.multi label");

multiDisplay.addEventListener("click", () => {
    multiOptions.style.display =
        multiOptions.style.display === "block" ? "none" : "block";
});

// Update selected text
document.querySelectorAll(".multi-options input").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
        let selected = [];

        document.querySelectorAll(".multi-options input:checked").forEach((c) => {
            selected.push(c.value);
        });

        multiDisplay.textContent = selected.length
            ? selected.join(", ")
            : "Select options";

        // floating label activate if selected
        if (selected.length > 0) {
            multiDisplay.classList.add("active");
        } else {
            multiDisplay.classList.remove("active");
        }
    });
});

// Click outside to close
document.addEventListener("click", (e) => {
    if (!multiDisplay.contains(e.target) && !multiOptions.contains(e.target)) {
        multiOptions.style.display = "none";
    }
});
