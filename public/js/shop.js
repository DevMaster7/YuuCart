let loadMoreHeight = 1560;

document.querySelectorAll(".products-container").forEach((container) => {
    let wrapper = container.querySelector(".products-wrapper");
    let fadeMask = container.querySelector(".fade-mask");
    let loadBtn = container.querySelector(".load-more");

    function checkIfLoadMoreNeeded() {
        if (wrapper.scrollHeight <= wrapper.clientHeight + 5) {
            loadBtn.style.display = "none";
            fadeMask.style.display = "none";
        }
    }

    checkIfLoadMoreNeeded();

    loadBtn.addEventListener("click", () => {
        let currentMax = parseInt(getComputedStyle(wrapper).maxHeight);
        wrapper.style.maxHeight = currentMax + loadMoreHeight + "px";

        setTimeout(() => {
            if (wrapper.scrollHeight <= wrapper.clientHeight + 5) {
                loadBtn.style.display = "none";
                fadeMask.style.display = "none";
            }
        }, 200);
    });
});
