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

    // Remove dropdowns from a specific level and above
    function removeFromLevel(level) {
        openDropdowns = openDropdowns.filter(d => {
            if (d.level >= level) {
                d.el.remove();
                return false;
            }
            return true;
        });
    }

    // Create dropdown for any level
    function createLevel(items, level) {
        removeFromLevel(level);

        const dropdown = document.createElement("div");
        dropdown.classList.add("dropdown");
        dropdown.style.left = `${220 * (level - 1)}px`;

        dropdown.innerHTML = items
            .map(i => `
                <a 
                    href="/shop/catelogue?query=${i.path}" 
                    class="category" 
                    data-name="${i.name}"
                    data-path="${i.path}"
                >
                    ${i.name} 
                    ${i.subs?.length ? `<i class="fa-solid fa-chevron-right"></i>` : ""}
                </a>
            `)
            .join("");

        dropdownCon.append(dropdown);
        openDropdowns.push({ el: dropdown, level });

        dropdown.querySelectorAll(".category").forEach(cat => {
            cat.addEventListener("mouseover", () => {
                let name = cat.dataset.name;
                let parentPath = cat.dataset.path;

                let next = getChildren(level, name, parentPath);

                if (next.length > 0) {
                    createLevel(next, level + 1);
                } else {
                    removeFromLevel(level + 1);
                }
            });
        });
    }

    // Find children (subCategories) based on level
    function getChildren(level, name, parentPath) {
        // LEVEL 1 → find main category
        if (level === 1) {
            let m = categories.find(c => c.categoryName === name);
            if (!m) return [];

            return m.subCategories.map(s => ({
                name: s.subName,
                path: `${parentPath}-${s.subName}`,
                subs: s.subCategories || []
            }));
        }

        // LEVEL 2 and deeper
        for (let c of categories) {
            for (let s of c.subCategories) {

                // Level 2 match
                if (s.subName === name && s.subCategories) {
                    return s.subCategories.map(x => ({
                        name: x.subName,
                        path: `${parentPath}-${x.subName}`,
                        subs: x.subCategories || []
                    }));
                }

                // Recursive deep search
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

    // Hover to open main dropdown
    categoryBtn.addEventListener("mouseover", () => {
        if (openDropdowns.length === 0) {
            categoryIcon.style.transform = "rotate(180deg)";

            let mainItems = categories.map(c => ({
                name: c.categoryName,
                path: c.categoryName,
                subs: c.subCategories
            }));

            createLevel(mainItems, 1);
        }
    });

    dropdownCon.addEventListener("mouseleave", () => {
        categoryIcon.style.transform = "rotate(0deg)";
        openDropdowns.forEach(d => d.el.remove());
        openDropdowns = [];
    });
})();

