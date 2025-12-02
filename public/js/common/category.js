async function getCategories() {
    let res = await fetch("/api/frontCategories", {
        method: 'get',
        headers: { 'Content-Type': 'application/json' },
    });
    return await res.json();
}

(async function () {
    const data = await getCategories();
    const categories = Array.from(data.categories);

    const dropdownCon = document.querySelector(".dropdown-con");
    const categoryBtn = document.getElementById("Category");
    const categoryIcon = document.getElementById("arrow");

    let openDropdowns = [];
    let isMobile = window.innerWidth <= 768;

    function removeFromLevel(level) {
        openDropdowns = openDropdowns.filter(d => {
            if (d.level >= level) {
                d.el.remove();
                return false;
            }
            return true;
        });
    }

    function createLevel(items, level) {
        removeFromLevel(level);

        const dropdown = document.createElement("div");
        dropdown.classList.add("dropdown");
        dropdown.style.left = `${220 * (level - 1)}px`;

        dropdown.innerHTML = items
            .map(i => {
                const safePath = encodeURIComponent(i.path);
                return `
                <a 
                    href="/shop/catelogue?query=${safePath}" 
                    class="category" 
                    data-name="${i.name}"
                    data-path="${i.path}"
                >
                    ${i.name} 
                    ${i.subs?.length ? `<i class="fa-solid fa-chevron-right"></i>` : ""}
                </a>
            `;
            })
            .join("");

        dropdownCon.append(dropdown);
        openDropdowns.push({ el: dropdown, level });

        dropdown.querySelectorAll(".category").forEach(cat => {
            if (isMobile) {
                let clickedOnce = false;

                cat.addEventListener("click", (e) => {
                    e.preventDefault();

                    const name = cat.dataset.name;
                    const parentPath = cat.dataset.path;
                    const next = getChildren(level, name, parentPath);

                    if (next.length === 0) {
                        window.location.href = cat.href;
                        return;
                    }

                    if (!clickedOnce) {
                        clickedOnce = true;

                        setTimeout(() => clickedOnce = false, 300);

                        dropdown.querySelectorAll(".category").forEach(c => c.classList.remove("active"));
                        cat.classList.add("active");

                        createLevel(next, level + 1);

                    } else {
                        window.location.href = cat.href;
                    }
                });

            } else {
                cat.addEventListener("mouseover", () => {
                    dropdown.querySelectorAll(".category").forEach(c => c.classList.remove("active"));
                    cat.classList.add("active");

                    const name = cat.dataset.name;
                    const parentPath = cat.dataset.path;

                    const next = getChildren(level, name, parentPath);
                    if (next.length > 0) {
                        createLevel(next, level + 1);
                    } else {
                        removeFromLevel(level + 1);
                    }
                });
            }
        });
    }

    function getChildren(level, name, parentPath) {
        if (level === 1) {
            let m = categories.find(c => c.categoryName === name);
            if (!m) return [];

            return m.subCategories.map(s => ({
                name: s.subName,
                path: `${parentPath}-${s.subName}`,
                subs: s.subCategories || []
            }));
        }

        for (let c of categories) {
            for (let s of c.subCategories) {
                if (s.subName === name && s.subCategories) {
                    return s.subCategories.map(x => ({
                        name: x.subName,
                        path: `${parentPath}-${x.subName}`,
                        subs: x.subCategories || []
                    }));
                }

                if (s.subCategories) {
                    for (let x of s.subCategories) {
                        if (x.subName === name && x.subCategories) {
                            return x.subCategories.map(y => ({
                                name: y.subName,
                                path: `${parentPath}-${y.subName}`,
                                subs: y.subCategories || []
                            }));
                        }
                    }
                }
            }
        }

        return [];
    }

    if (isMobile) {
        categoryBtn.addEventListener("click", () => {
            if (openDropdowns.length === 0) {
                const mainItems = categories.map(c => ({
                    name: c.categoryName,
                    path: c.categoryName,
                    subs: c.subCategories
                }));
                createLevel(mainItems, 1);
            } else {
                openDropdowns.forEach(d => d.el.remove());
                openDropdowns = [];
            }
        });
    } else {
        categoryBtn.addEventListener("mouseover", () => {
            if (openDropdowns.length === 0) {
                categoryIcon.style.transform = "rotate(180deg)";

                const mainItems = categories.map(c => ({
                    name: c.categoryName,
                    path: c.categoryName,
                    subs: c.subCategories
                }));

                createLevel(mainItems, 1);
            }
        });
    }

    dropdownCon.addEventListener("mouseleave", () => {
        categoryIcon.style.transform = "rotate(0deg)";
        openDropdowns.forEach(d => d.el.remove());
        openDropdowns = [];
    });
})();
