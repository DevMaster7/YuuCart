function sideBar() {
    let conDiv = document.querySelector(".wrapper");
    let sideDiv = document.createElement("div");
    sideDiv.classList.add("sidebar");
    sideDiv.innerHTML = `
            <a href="/shop" class="left">
                <div class="logo-text">QuickCart</div>
                <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 3H6L9 15H19L22 6H7" stroke="#64B6AC" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" />
                    <circle cx="10" cy="18" r="2" stroke="#CCD6F6" stroke-width="2" fill="none" />
                    <circle cx="18" cy="18" r="2" stroke="#CCD6F6" stroke-width="2" fill="none" />
                    <g class="tag">
                        <path d="M15 5L18 8L16 10L13 7L15 5Z" stroke-linecap="round" stroke-linejoin="round"
                            fill="#FF6F00" stroke="#FF6F00" stroke-width="1.5" />
                        <circle cx="15" cy="7" r="0.8" fill="#0A192F" />
                    </g>
                </svg>
            </a>
            <div class="links">
                <a href="/admin">Dashboard</a>
                <a href="/admin/manage-orders">Orders</a>
                <a href="/admin/manage-users">Users</a>
                <a href="/admin/manage-products">Products</a>
                <a href="/admin/manage-coupans">Coupans</a>
            </div>`
    conDiv.prepend(sideDiv)
}

sideBar()