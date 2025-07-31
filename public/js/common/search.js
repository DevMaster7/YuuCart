document.getElementById("search").addEventListener("keydown", (event) => {
    if (event.key == "Enter") {
        let search = document.getElementById("search").value;
        if (!search.trim()) { return }
        window.location.href = `/shop/search?query=${encodeURIComponent(search)}`;
    }
})
document.getElementById("search-button").addEventListener("click", async () => {
    let search = document.getElementById("search").value;
    if (!search.trim()) { return }
    window.location.href = `/shop/search?query=${encodeURIComponent(search)}`;
})