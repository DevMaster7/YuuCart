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
// function updateColorPreview() {
//     document.querySelectorAll(".colorInp").forEach(input => {
//         input.onchange = () => {
//             input.previousElementSibling.style.backgroundColor = input.value;
//         };
//     });
// }
