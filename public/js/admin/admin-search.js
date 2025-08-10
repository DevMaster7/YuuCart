let pageName = document.getElementsByTagName("head")[0].dataset.page
if (pageName == 'users') {
    mainFun('users')
}
else if (pageName == 'orders') {
    mainFun('orders')
}
else if (pageName == 'products') {
    mainFun('products')
}
else if (pageName == 'coupans') {
    mainFun('coupans')
}

function mainFun(page) {
    document.getElementById("search").addEventListener("keydown", (event) => {
        if (event.key == "Enter") {
            let search = document.getElementById("search").value;
            if (!search.trim()) { return }
            window.location.href = `/admin/manage-${page}/search?query=${encodeURIComponent(search)}`;
        }
    })
    document.getElementById("search-btn").addEventListener("click", () => {
        let search = document.getElementById("search").value;
        if (!search.trim()) {
            return
        }
        window.location.href = `/admin/manage-${page}/search?query=${encodeURIComponent(search)}`;
    })

    let search = document.getElementById("search");
    const params = new URLSearchParams(window.location.search);
    const term = params.get('query');
    search.value = term;
}