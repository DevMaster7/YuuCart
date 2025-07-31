// Loading...
let loaderDiv = document.createElement("div")
loaderDiv.classList.add("loader-wrapper")
loaderDiv.innerHTML = `<div class="shapes"></div>`
document.getElementsByTagName("body")[0].prepend(loaderDiv)
window.addEventListener('load', () => {
    setTimeout(() => document.querySelector(".loader-wrapper").remove(), 300)
})
// Multiple Text Changer (Logo Changer Across The Website)
const elements = document.querySelectorAll("body *");
const searchText = "QuickCart";
elements.forEach(el => {
    if (el.children.length === 0 && el.textContent.includes(searchText)) {
        el.textContent = el.textContent.replaceAll(searchText, "QuickCart");
    }
});
