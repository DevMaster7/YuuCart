function navMaker() {
    let div = document.createElement("div");
    div.classList.add("nav-con");
    div.innerHTML = `<div class="left">
            <i class="fa-solid fa-bars"></i>
        </div>
        <div class="center">
            <div class="logo-text">YuuCart</div>
            <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3H6L9 15H19L22 6H7" stroke="#64B6AC" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" />
                <circle cx="10" cy="18" r="2" stroke="#CCD6F6" stroke-width="2" fill="none" />
                <circle cx="18" cy="18" r="2" stroke="#CCD6F6" stroke-width="2" fill="none" />
                <g class="tag">
                    <path d="M15 5L18 8L16 10L13 7L15 5Z" stroke-linecap="round" stroke-linejoin="round" fill="#FF6F00"
                        stroke="#FF6F00" stroke-width="1.5" />
                    <circle cx="15" cy="7" r="0.8" fill="#0A192F" />
                </g>
            </svg>
        </div>`
    document.getElementsByTagName("body")[0].prepend(div)
}
navMaker()

document.querySelector(".center").addEventListener("click", () => {
    window.location.href = '/shop';
})
window.addEventListener("scroll", () => {
    let scrollPosition = window.scrollY;
    if (scrollPosition > 10) {
        document.querySelector(".nav-con").classList.add("sticky");
    } else {
        document.querySelector(".nav-con").classList.remove("sticky");
    }
});

let sideBarDiv = document.querySelector(".side-nav-con");
async function getUser() {
    let res = await fetch("/api/frontUser", {
        method: 'get',
        headers: { 'Content-Type': 'application/json' },
    });
    let data = await res.json();
    return data
}
async function userSideBarMaker() {
    const userData = await getUser();
    sideBarDiv.innerHTML = `<div class="side-nav">
                <div class="user-con">
                    <div class="img-con">
                        <img src="${userData.user.userImg}" alt="user">
                    </div>
                    <div class="user-detail">
                        <div class="user-greet">Hello</div>
                        <div class="user-name">
                            ${userData.user.fullname}
                        </div>
                    </div>
                </div>

                <a href="/user/account" class="side-btns">
                    <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"
                        fill="#e3e3e3">
                        <path
                            d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Zm80-80h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm0-80Zm0 400Z" />
                    </svg>
                    <div>My Account</div>
                </a>
                
                <a href="/user/account#change-password" class="side-btns">
                    <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#e3e3e3">
                        <path
                            d="M80-200v-80h800v80H80Zm46-242-52-30 34-60H40v-60h68l-34-58 52-30 34 58 34-58 52 30-34 58h68v60h-68l34 60-52 30-34-60-34 60Zm320 0-52-30 34-60h-68v-60h68l-34-58 52-30 34 58 34-58 52 30-34 58h68v60h-68l34 60-52 30-34-60-34 60Zm320 0-52-30 34-60h-68v-60h68l-34-58 52-30 34 58 34-58 52 30-34 58h68v60h-68l34 60-52 30-34-60-34 60Z" />
                    </svg>
                    <div>Change Password</div>
                </a>

                <a href="/user/account#change-payment" class="side-btns">
                    <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#e3e3e3">
                        <path
                            d="M560-440q-50 0-85-35t-35-85q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35ZM280-320q-33 0-56.5-23.5T200-400v-320q0-33 23.5-56.5T280-800h560q33 0 56.5 23.5T920-720v320q0 33-23.5 56.5T840-320H280Zm80-80h400q0-33 23.5-56.5T840-480v-160q-33 0-56.5-23.5T760-720H360q0 33-23.5 56.5T280-640v160q33 0 56.5 23.5T360-400Zm440 240H120q-33 0-56.5-23.5T40-240v-440h80v440h680v80ZM280-400v-320 320Z" />
                    </svg>
                    <div>Payment</div>
                </a>

                <a href="/user/reward-center" class="side-btns">
                    <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#e3e3e3">
                        <path
                            d="M160-80v-440H80v-240h208q-5-9-6.5-19t-1.5-21q0-50 35-85t85-35q23 0 43 8.5t37 23.5q17-16 37-24t43-8q50 0 85 35t35 85q0 11-2 20.5t-6 19.5h208v240h-80v440H160Zm400-760q-17 0-28.5 11.5T520-800q0 17 11.5 28.5T560-760q17 0 28.5-11.5T600-800q0-17-11.5-28.5T560-840Zm-200 40q0 17 11.5 28.5T400-760q17 0 28.5-11.5T440-800q0-17-11.5-28.5T400-840q-17 0-28.5 11.5T360-800ZM160-680v80h280v-80H160Zm280 520v-360H240v360h200Zm80 0h200v-360H520v360Zm280-440v-80H520v80h280Z" />
                    </svg>
                    <div>Reward Center</div>
                </a>

                <a href="/user/messages" class="side-btns">
                    <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#e3e3e3"><path d="M880-80 720-240H160q-33 0-56.5-23.5T80-320v-480q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v720ZM160-320h594l46 45v-525H160v480Zm0 0v-480 480Z"/></svg>
                    <div>Messages</div>
                </a>

                <a href="/user/orders" class="side-btns">
                    <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#e3e3e3">
                        <path
                            d="M240-80q-33 0-56.5-23.5T160-160v-480q0-33 23.5-56.5T240-720h80q0-66 47-113t113-47q66 0 113 47t47 113h80q33 0 56.5 23.5T800-640v480q0 33-23.5 56.5T720-80H240Zm0-80h480v-480h-80v80q0 17-11.5 28.5T600-520q-17 0-28.5-11.5T560-560v-80H400v80q0 17-11.5 28.5T360-520q-17 0-28.5-11.5T320-560v-80h-80v480Zm160-560h160q0-33-23.5-56.5T480-800q-33 0-56.5 23.5T400-720ZM240-160v-480 480Z" />
                    </svg>
                    <div>My Orders</div>
                </a>

                <a href="/user/wishlist" class="side-btns">
                    <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#e3e3e3">
                        <path
                            d="m480-120-58-52q-101-91-167-157T150-447.5Q111-500 95.5-544T80-634q0-94 63-157t157-63q52 0 99 22t81 62q34-40 81-62t99-22q94 0 157 63t63 157q0 46-15.5 90T810-447.5Q771-395 705-329T538-172l-58 52Zm0-108q96-86 158-147.5t98-107q36-45.5 50-81t14-70.5q0-60-40-100t-100-40q-47 0-87 26.5T518-680h-76q-15-41-55-67.5T300-774q-60 0-100 40t-40 100q0 35 14 70.5t50 81q36 45.5 98 107T480-228Zm0-273Z" />
                    </svg>
                    <div>My Wishlist</div>
                </a>

                <button class="side-btns logout">
                    <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#e3e3e3">
                        <path
                            d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z" />
                    </svg>
                    <div>Logout</div>
                </button>

                            </div>`
    // <a href="/user/settings" class="side-btns">
    //     <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#e3e3e3">
    //         <path
    //             d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z" />
    //     </svg>
    //     <div>Settings</div>
    // </a>

    document.querySelectorAll(".side-btns").forEach((btn) => {
        btn.addEventListener("click", () => {
            let icon = document.querySelector(".nav-con").querySelector(".left").getElementsByTagName("i")[0];
            if (window.innerWidth <= 770) {
                icon.classList.remove("fa-xmark")
                icon.classList.add("fa-bars")
                document.querySelector(".side-nav").style.transform = "translateX(-100%)";
                setTimeout(() => {
                    document.querySelector(".side-nav-con").style.display = "none";
                }, 300);
            }
            document.querySelectorAll(".side-btns").forEach((btn) => {
                btn.classList.remove("activeBtn")
                btn.querySelector(".icon").classList.remove("activeIcon")
            })
            btn.classList.add("activeBtn")
            btn.querySelector(".icon").classList.add("activeIcon")
        })
        let pageName = document.getElementsByTagName("head")[0].dataset.page
        if (btn.getElementsByTagName("div")[0].innerHTML.includes(pageName)) {
            btn.classList.add("activeBtn")
            btn.querySelector(".icon").classList.add("activeIcon")
        }
    })

    function func() {
        if (window.location.href.includes("#change-password")) {
            document.querySelectorAll(".side-btns").forEach((btn) => {
                btn.classList.remove("activeBtn")
                btn.querySelector(".icon").classList.remove("activeIcon")
            })
            document.querySelectorAll(".side-btns")[1].classList.add("activeBtn")
            document.querySelectorAll(".side-btns")[1].querySelector(".icon").classList.add("activeIcon")
        }
        else if (window.location.href.includes("#change-payment")) {
            document.querySelectorAll(".side-btns").forEach((btn) => {
                btn.classList.remove("activeBtn")
                btn.querySelector(".icon").classList.remove("activeIcon")
            })
            document.querySelectorAll(".side-btns")[2].classList.add("activeBtn")
            document.querySelectorAll(".side-btns")[2].querySelector(".icon").classList.add("activeIcon")
        }
    }
    func()

    document.querySelector(".logout").addEventListener("click", () => {
        let mainDiv = document.createElement("div")
        mainDiv.classList.add("log-main")
        mainDiv.innerHTML = `<div class="logout-con">
            <div class="text">Are You Sure To Logout!</div>
            <div class="btn-con">
                <button class="btn yes">Logout</button>
                <button class="btn no">Cancel</button>
            </div>
            </div>`
        document.getElementsByTagName("body")[0].prepend(mainDiv)

        document.querySelector(".no").addEventListener("click", () => {
            document.querySelector(".log-main").remove()
        })

        document.querySelector(".log-main").addEventListener("click", (e) => {
            if (e.target == document.querySelector(".logout-con")) {
                return
            }
            document.querySelector(".log-main").remove();
        })

        document.querySelector(".yes").addEventListener("click", () => {
            document.cookie = "ULGG=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
            window.location.href = '/shop';
        })
    })

}
function adminSideBarMaker() {
    sideBarDiv.innerHTML = `<div class="side-nav">
                <div class="links">
                    <a href="/admin">Dashboard</a>
                    <a href="/admin/manage-orders">Orders</a>
                    <a href="/admin/manage-users">Users</a>
                    <a href="/admin/manage-products">Products</a>
                    <a href="/admin/manage-categories">Categories</a>
                    <a href="/admin/manage-coupons">Coupons</a>
                </div>
            </div>`
}
if (window.location.href.includes("admin")) {
    adminSideBarMaker()
}
else {
    userSideBarMaker()
}

let icon = document.querySelector(".nav-con").querySelector(".left").getElementsByTagName("i")[0]
document.querySelector(".left").addEventListener("click", () => {
    if (icon.classList.contains("fa-bars")) {
        icon.classList.remove("fa-bars")
        icon.classList.add("fa-xmark")
        document.querySelector(".side-nav-con").style.display = "flex";
        setTimeout(() => {
            document.querySelector(".side-nav").style.transform = "translateX(0%)";
        }, 120);
    }
    else {
        icon.classList.remove("fa-xmark")
        icon.classList.add("fa-bars")
        document.querySelector(".side-nav").style.transform = "translateX(-100%)";
        setTimeout(() => {
            document.querySelector(".side-nav-con").style.display = "none";
        }, 300);
    }
})
document.addEventListener("click", (e) => {
    if (e.target == document.querySelector(".side-nav-con")) {
        icon.classList.remove("fa-xmark")
        icon.classList.add("fa-bars")
        document.querySelector(".side-nav").style.transform = "translateX(-100%)";
        setTimeout(() => {
            document.querySelector(".side-nav-con").style.display = "none";
        }, 300);
    }
})