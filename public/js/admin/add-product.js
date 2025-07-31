// Prevent Editing...
// document.addEventListener('contextmenu', (e) => {
//     e.preventDefault()
// }, false)

// Edit Buttons Function 
function btnFunctions(main) {
    main.querySelectorAll(".edit-info").forEach((e) => {
        let input = document.createElement("input");
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
                    return (
                        '#' +
                        [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
                    );
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
        } else {
            input.classList.add("input-info");
            if (e.classList.contains("proName")) {
                input.classList.add("proName");
            }
            let text = e.innerHTML.trim();
            input.value = text;
        }
        e.replaceWith(input);
    });

    // main.querySelectorAll(".edit-info").forEach((e) => {
    //     let input = document.createElement("input")
    //     input.classList.add("input-info")
    //     if (e.classList.contains("proName")) {
    //         input.classList.add("input-info", "proName")
    //     }
    //     if (e.classList.contains("color-info")) {
    //         input.setAttribute("type", "color")
    //         // input.removeAttribute("class")
    //         let c = e.dataset.color
    //         function convertToHexColor(input) {
    //             input = input.trim().toLowerCase();

    //             // If it's already valid 6-digit hex
    //             if (/^#[0-9a-f]{6}$/.test(input)) {
    //                 return input;
    //             }

    //             // If it's short 3-digit hex like #fff
    //             if (/^#[0-9a-f]{3}$/.test(input)) {
    //                 return '#' + input.slice(1).split('').map(ch => ch + ch).join('');
    //             }

    //             // If it's RGB
    //             if (input.startsWith('rgb')) {
    //                 let [r, g, b] = input.match(/\d+/g).map(Number);
    //                 return (
    //                     '#' +
    //                     [r, g, b]
    //                         .map(x => x.toString(16).padStart(2, '0'))
    //                         .join('')
    //                 );
    //             }

    //             // If it's HSL
    //             if (input.startsWith('hsl')) {
    //                 let [h, s, l] = input.match(/[\d.]+/g).map(Number);
    //                 s /= 100;
    //                 l /= 100;
    //                 const a = s * Math.min(l, 1 - l);
    //                 const f = n => {
    //                     const k = (n + h / 30) % 12;
    //                     const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    //                     return Math.round(255 * color).toString(16).padStart(2, '0');
    //                 };
    //                 return `#${f(0)}${f(8)}${f(4)}`;
    //             }

    //             // Default fallback
    //             return '#000000'; // If nothing matched
    //         }
    //         input.value = convertToHexColor(c)
    //         console.log(input.value);
    //         // let color = convertToHexColor(c)
    //         // newColor = String(color)
    //         // input.setAttribute("value", newColor)
    //         // input.value = convertToHexColor(c)
    //         // let color = 

    //         // input.setAttribute("value", color)
    //         // let att = { value: convertToHexColor(c) }

    //         // console.log(att);
    //         // console.log(input.attributes);
    //         // console.log(Array.from(input.attributes));
    //         // input.value = convertToHexColor(c);
    //         // console.log(e.dataset.color);
    //         // let styles = window.getComputedStyle(e)
    //         // input.value = e.dataset.color

    //         // console.log(e);
    //     }
    //     else {
    //         let text = e.innerHTML
    //         input.value = text.trim()
    //         e.replaceWith(input)
    //     }
    // })
    let editBtn = main.querySelector(".edit-btn")
    let deleteBtn = main.querySelector(".delete-btn")
    let saveBtn = main.querySelector(".save-btn")
    let cancelBtn = main.querySelector(".cancel-btn")
    editBtn.style.display = "none"
    deleteBtn.style.display = "none"
    saveBtn.style.display = "flex"
    cancelBtn.style.display = "flex"

    cancelBtn.addEventListener("click", () => {
        window.location.reload()
    })
    saveBtn.addEventListener("click", async () => {
        console.log(main);
        main.submit()
        // let form = main.querySelector(".form")
        // window.location.reload()
        // saveBtn.style.display = "none"
        // cancelBtn.style.display = "none"
        // editBtn.style.display = "flex"
        // deleteBtn.style.display = "flex"
        // main.querySelectorAll(".input-info").forEach((e) => {
        //     let span = document.createElement("span")
        //     if (e.classList.contains("proName")) {
        //         span.classList.add("edit-info", "proName")
        //     }
        //     span.classList.add("edit-info")
        //     let text = e.value
        //     span.innerHTML = text
        //     e.replaceWith(span)
        // })
    })
}

// Edit Buttons
document.querySelectorAll(".edit-btn").forEach(edit_btn => {
    edit_btn.addEventListener("click", () => {
        let main = edit_btn.closest(".product-card");
        btnFunctions(main)
    })
});

// Confirmation Function
function confirmationWrapper(html) {
    document.getElementsByTagName("body")[0].prepend(html);

    document.querySelector(".no").addEventListener("click", () => {
        document.querySelector(".wrapper-confirmation").remove()
    })
    document.querySelector(".wrapper-confirmation").addEventListener('click', (e) => {
        let mainCon = document.querySelector(".conformation-con")
        let text = document.querySelector(".text")
        let btnCon = document.querySelector(".btn-con")
        if (e.target == mainCon || e.target == text || e.target == btnCon) {
            return
        }
        else {
            document.querySelector(".wrapper-confirmation").remove();
        }
    })
}

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
            let main = input.closest(".product-card")
            let html = `
            <div class="box">
                <img src="${URL.createObjectURL(file)}" alt="Product">
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
            let productID = delete_btn.closest(".product-card").attributes.id.value
            const res = await fetch(`/admin/manage-products/delete-product`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productID }),
            })
            const res1 = await res.json();
            if (res1.success) {
                window.location.reload();
            }
        })
    })
})
