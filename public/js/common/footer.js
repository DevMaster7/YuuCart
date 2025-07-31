function footer() {
    let footerEle = document.createElement("footer")
    footerEle.classList.add("footer")
    footerEle.innerHTML = `<div class="footer-container">
            <div class="logo-section">
                <a href="/shop" class="logo-con">
            <div id="logo-txt">QuickCart</div>
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
        </a>
                <p>Your one-stop shop for everything you need.</p>
            </div>

            <div class="footer-section">
                <h3>Quick Links</h3>
                <ul>
                    <li><a href="/">Home</a></li>
                    <li><a href="/shop/#allProducts">Shop All</a></li>
                    <li><a href="/shop/#saleProducts">On Sale</a></li>
                    <li><a href="/shop/#customizeProducts">Customizeable</a></li>
                </ul>
            </div>

            <div class="footer-section">
                <h3>Shop</h3>
                <ul>
                    <li><a href="/">Blog</a></li>
                    <li><a href="/#Faqs">FAQ's</a></li>
                    <li><a href="/">About Us</a></li>
                    <li><a href="/">Contact</a></li>
                    <li><a href="/#reviews">Reviews</a></li>
                </ul>
            </div>

            <div class="footer-section">
                <h3>Policies & Legal</h3>
                <ul>
                    <li><a href="/">Privacy Policy</a></li>
                    <li><a href="/">Shipping Policy</a></li>
                    <li><a href="/terms-and-conditions">Terms & Conditions</a></li>
                    <li><a href="/">Return & Refund Policy</a></li>
                </ul>
            </div>

            <div class="footer-section">
                <h3>Contact</h3>
                <p>Email: support@quickcart.com</p>
                <p>Phone: +92 300 1234567</p>
                <div class="social-icons">
                    <a href="#" class="social-link"><i class="fa-brands twi fa-x-twitter"></i></a>
                    <a href="#" class="social-link"><i class="fa-brands insta fa-instagram"></i></a>
                    <a href="#" class="social-link"><i class="fa-brands face fa-facebook-f"></i></a>
                    <a href="#" class="social-link"><i class="fa-brands you fa-youtube"></i></a>
                </div>
            </div>
        </div>

        <div class="footer-bottom">
            <p>&copy; ${new Date().getFullYear()} QuickCart All rights reserved.</p>
        </div>`
    document.getElementsByTagName("body")[0].append(footerEle)
}

footer()
