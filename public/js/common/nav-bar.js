let pageName = document.getElementsByTagName("head")[0].dataset.page
if (document.cookie.includes("ULGG")) {
    if (pageName == "home") {
        loginBtns(1)
        let landBtnCon = document.querySelector(".landing-center").querySelector(".btn-con")
        landBtnCon.innerHTML = `<a href="/shop" class="shop-btn">Shop Now</a>`
        let navBtnCon = document.querySelector(".nav-con").querySelector(".right")
        navBtnCon.innerHTML = `<a href="" class="btns">Contact Us</a>
            <a href="#reviews" class="btns">Reviews</a>`
        document.querySelector(".user-con").style.display = "flex";
    }
    else if (pageName == "cart") {
        loginBtns(1);
        userContent();
    }
    else {
        loginBtns(1);
        userContent();
        document.querySelector(".cart-con").style.display = "flex";
    }
    let x = 0
    document.querySelector(".user-con").addEventListener("click", () => {
        if (x == 0) {
            userLinks(pageName);
            x = 1
            document.querySelector(".user-content-con").addEventListener("mouseleave", () => {
                document.querySelector(".user-content-con").remove();
                x = 0
            })
        }
        else {
            document.querySelector(".user-content-con").remove();
            x = 0
        }
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
                if (pageName !== "home") {
                    window.location.href = '/shop';
                }
                else {
                    window.location.href = '/';
                }
            })
        })
    })
}
else {
    if (pageName == "home") {
        loginBtns(0)
        let landBtnCon = document.querySelector(".landing-center").querySelector(".btn-con")
        landBtnCon.innerHTML = `<a href="/user/register" class="register-btn">Get Started</a>
                                <a href="/user/login" class="login-btn">Sign In</a>`
    }
    else {
        loginBtns(0)
    }
}

function loginBtns(e) {
    if (e == 0) {
        let navBtnCon = document.querySelector(".nav-con").querySelector(".right")
        navBtnCon.innerHTML = `<a href="/user/register" class="btns" id="register">Get Started</a>
        <a href="/user/login" class="btns" id="login">Sign In</a>`
    }
    else {
        let navBtnCon = document.querySelector(".nav-con").querySelector(".right")
        navBtnCon.innerHTML = ``
    }
}

function userContent() {
    let userImg = document.querySelector(".nav-con").querySelector(".right").dataset.userimg;
    let conDiv = document.createElement("div")
    conDiv.classList.add("user-con")
    conDiv.innerHTML = `<img src="${userImg}" alt="" class="user">`
    document.querySelector(".nav-con").querySelector(".right").prepend(conDiv)
}

function userLinks(e) {
    let userLinksDiv = document.createElement("div")
    userLinksDiv.classList.add("user-content-con")
    userLinksDiv.innerHTML = `<a href="/user/account" class="side-btns">
                <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#e3e3e3">
                    <path
                        d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Zm80-80h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm0-80Zm0 400Z" />
                </svg>
                <div>My Account</div>
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

            <a href="/user/reward-and-redeem" class="side-btns">
                <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#e3e3e3">
                    <path
                        d="M160-80v-440H80v-240h208q-5-9-6.5-19t-1.5-21q0-50 35-85t85-35q23 0 43 8.5t37 23.5q17-16 37-24t43-8q50 0 85 35t35 85q0 11-2 20.5t-6 19.5h208v240h-80v440H160Zm400-760q-17 0-28.5 11.5T520-800q0 17 11.5 28.5T560-760q17 0 28.5-11.5T600-800q0-17-11.5-28.5T560-840Zm-200 40q0 17 11.5 28.5T400-760q17 0 28.5-11.5T440-800q0-17-11.5-28.5T400-840q-17 0-28.5 11.5T360-800ZM160-680v80h280v-80H160Zm280 520v-360H240v360h200Zm80 0h200v-360H520v360Zm280-440v-80H520v80h280Z" />
                </svg>
                <div>Rewards</div>
            </a>

            <a href="/user/settings" class="side-btns">
                <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#e3e3e3">
                    <path
                        d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z" />
                </svg>
                <div>Settings</div>
            </a>

            <button class="side-btns logout">
                <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#e3e3e3">
                    <path
                        d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z" />
                </svg>
                <div>Logout</div>
    </button>`
    if (e !== "home") {
        document.querySelector(".nav-con").querySelector(".right").prepend(userLinksDiv)
    }
    else {
        document.querySelector(".nav-con").append(userLinksDiv)
    }
}

let nav_bar = document.querySelector(".nav-con")
window.addEventListener("scroll", () => {
    let scrollPosition = window.scrollY;
    if (scrollPosition > 10) {
        nav_bar.classList.add("sticky");
    } else {
        nav_bar.classList.remove("sticky");
    }
});
