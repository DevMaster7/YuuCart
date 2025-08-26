let loaderDiv = document.createElement("div")
loaderDiv.classList.add("loader-wrapper")
loaderDiv.innerHTML = `<div class="shapes"></div>`
document.getElementsByTagName("body")[0].prepend(loaderDiv)
window.addEventListener('load', () => {
    setTimeout(() => document.querySelector(".loader-wrapper").remove(), 400)
})