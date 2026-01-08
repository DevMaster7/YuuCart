async function getRewardsData() {
    let res = await fetch("/api/frontRewardCenter", {
        method: 'get',
        headers: { 'Content-Type': 'application/json' },
    });
    let data = await res.json();
    return data
}

(async function () {
    const rewardData = await getRewardsData();

    const YuuCoins = Number(document.getElementById("pointsVal").innerHTML.split(" ")[0].trim());
    document.getElementById("pointsValue").textContent = `Rs.${Math.round(YuuCoins * 0.5)}`;

    // Tier Progress
    const TIERS = [
        { name: "Wood", img: "/assets/tier/wood.png", min: 0, max: 999 },
        { name: "Iron", img: "/assets/tier/iron.png", min: 1000, max: 1999 },
        { name: "Bronze", img: "/assets/tier/bronze.png", min: 2000, max: 3499 },
        { name: "Silver", img: "/assets/tier/silver.png", min: 3500, max: 4999 },
        { name: "Gold", img: "/assets/tier/gold.png", min: 5000, max: 6499 },
        { name: "Diamond", img: "/assets/tier/diamond.png", min: 7000, max: 9999 },
        { name: "Platinum", img: "/assets/tier/platinum.png", min: 10000, max: 14999 },
        { name: "Master", img: "/assets/tier/master.png", min: 15000, max: 9999999999 },
    ];
    const getTier = points => TIERS.find(t => points >= t.min && points <= t.max)?.name || "Bronze";
    const tier = TIERS.find(t => t.name === getTier(YuuCoins));
    const next = TIERS.find(t => t.min > tier.min) || { min: tier.max + 1 };
    const progress = Math.min(1, (YuuCoins - tier.min) / (next.min - tier.min));
    document.getElementById("userTier").textContent = getTier(YuuCoins);
    document.getElementById("progressBar").style.width = `${Math.round(progress * 100)}%`;
    document.getElementById("tierRange").textContent = `${tier.min} Yuu`;
    document.getElementById("tierTag").src = `${tier.img}`;
    document.getElementById("tierTarget").textContent = `${next.min} Yuu`;

    // Check In
    document.getElementById("checkInBtn").addEventListener("click", async () => {
        async function sendCheckIn() {
            let res = await fetch("/addons/checkIn", {
                method: "GET",
            });
            let res1 = await res.json();
            if (res1.success) {
                let streak = res1.streak
                console.log(streak);
                let root = document.getElementById("modalRoot")
                document.body.style.overflow = "hidden";
                root.style.display = "flex";
                root.innerHTML = `
                                    <div class="reward-card">
                                        <div id="checkInProgress" class="check-progress"></div>
                                    </div>
                                    `
                renderProgress(streak);
                renderAgain(res1.reward, "Daily Check-in", new Date());
            }
            else {
                showModal("Already Checked In",
                    "You’ve already claimed today’s reward!",
                    "<button class=\"btn\" onclick=\"closeModal()\">OK</button>"
                );
            }
        }

        const nowUTC = new Date();
        const lastCheckUTC = rewardData.user.checkIn.lastCheck ? new Date(rewardData.user.checkIn.lastCheck) : null;

        if (!lastCheckUTC) {
            sendCheckIn();
            return;
        }

        const nowPKT = new Date(nowUTC.getTime() + 5 * 60 * 60 * 1000);
        const lastCheckPKT = new Date(lastCheckUTC.getTime() + 5 * 60 * 60 * 1000);

        const todayMidnight = new Date(nowPKT);
        todayMidnight.setHours(0, 0, 0, 0);

        const lastMidnight = new Date(lastCheckPKT);
        lastMidnight.setHours(0, 0, 0, 0);

        const dayDiff = Math.floor((todayMidnight - lastMidnight) / (1000 * 60 * 60 * 24));

        if (!(dayDiff === 0)) {
            sendCheckIn();
        } else {
            showModal("Already Checked In",
                "You’ve already claimed today’s reward!",
                "<button class=\"btn\" onclick=\"closeModal()\">OK</button>"
            );
        }
    });
    const REWARDS = [10, 20, 40, 60, 100, 150, 300];
    function renderProgress(streak) {
        const container = document.getElementById("checkInProgress");

        const boxes = REWARDS.map((val, i) => `
                <div class="day day${i + 1} ${i < streak ? "active" : ""}">
                    Day ${i + 1}
                <span>${val} Yuu</span>
                </div>`);
        const order = [6, 3, 4, 5, 0, 1, 2];
        container.innerHTML = order.map(i => boxes[i]).join("");
    }

    // Spining Wheel
    const CONFIG = {
        size: 420,
        segments: [{
            label: '150 Yuu',
            color: '#F97316',
            weight: 8
        },
        {
            label: '10 Yuu',
            color: '#60A5FA',
            weight: 30
        },
        {
            label: '500 Yuu',
            color: '#34D399',
            weight: 0.5
        },
        {
            label: '5% OFF',
            code: "SAVE5WITHSPIN",
            color: '#06B6D4',
            weight: 0.5
        },
        {
            label: 'No Prize',
            color: '#E5E7EB',
            weight: 40
        },
        {
            label: 'Free Mug',
            color: '#F43F5E',
            weight: 0.2
        },
        ],
        fullSpins: 5,
    };
    const wheel = document.getElementById("wheel");
    const centerBtn = document.getElementById("centerBtn");
    const confettiEl = document.getElementById("confetti");
    let spinning = false;
    let lastIndex = -1;
    function weightedRandomIndex(segments, lastIdx) {
        const weighted = [];
        segments.forEach((seg, i) => {
            let w = seg.weight;
            if (i === lastIdx) w = 0.2;
            for (let j = 0; j < w * 10; j++) weighted.push(i);
        });
        return weighted[Math.floor(Math.random() * weighted.length)];
    }
    async function spin() {
        if (spinning) return;
        const res = await fetch('/addons/useSpin', {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
        })
        const res1 = await res.json();

        if (res1.success) {
            spinning = true;

            const index = weightedRandomIndex(CONFIG.segments, lastIndex);
            lastIndex = index;

            const anglePer = 360 / CONFIG.segments.length;
            const target = index * anglePer + anglePer / 2;
            const finalRotation = 360 * CONFIG.fullSpins + (360 - target);

            wheel.style.transition = "transform 5s cubic-bezier(.22,1,.36,1)";
            wheel.style.transform = `rotate(${finalRotation}deg)`;
            wheel.style.setProperty('--wheel-rotation', `${finalRotation}deg`);


            wheel.addEventListener("transitionend", async function handler() {
                wheel.removeEventListener("transitionend", handler);
                spinning = false;

                const seg = CONFIG.segments[index];
                if (seg.label.includes("Yuu")) {
                    let reward = Number(seg.label.replace("Yuu", ""))
                    renderAgain(reward, "Daily Spin", new Date())
                }
                if (seg.label !== "No Prize") {
                    showModal("Congrats!",
                        `You won <strong>${seg.label}</strong>!`,
                        "<button class=\"btn\" onclick=\"closeModal()\">OK</button>"
                    );
                    fireConfetti();
                    await fetch('/addons/spinReward', {
                        method: 'post',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ rewardId: seg.code, reward: seg.label })
                    });
                }
                else {
                    showModal("Oops!",
                        "You didn't win anything!",
                        "<button class=\"btn\" onclick=\"closeModal()\">OK</button>"
                    );
                }

                wheel.style.transition = "none";
                wheel.style.transform = `rotate(${360 - target}deg)`;
            });
        }
        else {
            showModal("Already Spinned!",
                "You've already use your today's spin!",
                "<button class=\"btn\" onclick=\"closeModal()\">OK</button>"
            );
        }
    }
    function fireConfetti() {
        confettiEl.innerHTML = '';
        const colors = CONFIG.segments.map(s => s.color);
        const count = 180;

        for (let i = 0; i < count; i++) {
            const el = document.createElement('div');
            el.className = 'piece';
            el.style.left = Math.random() * 100 + '%';
            el.style.top = (10 + Math.random() * 40) + '%';
            el.style.background = colors[Math.floor(Math.random() * colors.length)];
            el.style.opacity = '1';
            el.style.width = (8 + Math.random() * 8) + 'px';
            el.style.height = (10 + Math.random() * 12) + 'px';
            el.style.borderRadius = Math.random() > 0.5 ? '2px' : '50%';

            const startRotate = Math.random() * 360;
            el.style.transform = `translateY(0) rotate(${startRotate}deg)`;
            confettiEl.appendChild(el);

            const fall = 700 + Math.random() * 900;
            const endRotate = startRotate + 360 + Math.random() * 360;

            el.animate(
                [{
                    transform: `translateY(0) rotate(${startRotate}deg)`,
                    opacity: 1
                },
                {
                    transform: `translateY(${200 + Math.random() * 400}px) rotate(${endRotate}deg)`,
                    opacity: 0
                }
                ], {
                duration: fall,
                easing: 'cubic-bezier(.2,.9,.3,1)',
                delay: Math.random() * 400
            }
            );

            setTimeout(() => {
                try {
                    el.remove();
                } catch { }
            }, fall + 800);
        }
    }
    centerBtn.addEventListener("click", () => {
        const nowUTC = new Date();
        const lastSpinUTC = new Date(rewardData.user.spinDate);

        if (!spinning && !lastSpinUTC) {
            spin();
            return;
        }

        const nowPKT = new Date(nowUTC.getTime() + 5 * 60 * 60 * 1000);
        const lastSpinPKT = new Date(lastSpinUTC.getTime() + 5 * 60 * 60 * 1000);

        const todayMidnight = new Date(nowPKT);
        todayMidnight.setHours(0, 0, 0, 0);

        const lastMidnight = new Date(lastSpinPKT);
        lastMidnight.setHours(0, 0, 0, 0);

        const dayDiff = Math.floor((todayMidnight - lastMidnight) / (1000 * 60 * 60 * 24));

        if (!spinning && !(dayDiff === 0)) {
            spin()
        }
        else {
            showModal("Already Spinned!",
                "You've already use your today's spin!",
                "<button class=\"btn\" onclick=\"closeModal()\">OK</button>"
            );
        }
    });

    // Catalog
    const CATALOG = rewardData.coupons;
    document.getElementById("catalog").innerHTML = CATALOG.map(item => `
                    <div class="reward" data-ident="${item.couponCode}">
                        <div class="title">${item.couponTitle}</div>
                        <div class="meta">${item.couponSubTitle}</div>
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px">
                            <span style="color: var(--muted);font-size:0.9rem;font-weight:600;">
                                Cost: <strong style="color: var(--accent);">${item.couponCost} Yuu</strong>
                            </span>
                            <div>
                            <button class="btn small ghost simple-detail">Details</button>
                            ${item.has ? `` : `<button class="btn small liquid redeem-detail">Redeem</button>`}
                            </div>
                        </div>
                    </div>`
    ).join("");
    document.querySelectorAll(".redeem-detail").forEach(btn => {
        btn.addEventListener("click", e => {
            let identifier = e.target.closest(".reward").dataset.ident
            const item = CATALOG.find(i => i.couponCode === identifier);
            if (!item) return;
            if (YuuCoins >= item.couponCost) {
                showModal("Are You Sure?",
                    `Are you sure to redeem <strong>${item.couponTitle}</strong> <br> For <strong style="color: var(--accent);">${item.couponCost} Yuu</strong>`,
                    `<button class="btn" id="redeemConfirm">Redeem</button>
                            <button class="btn" style="background-color:var(--danger)" onclick="closeModal()">Cancel</button>`);
                document.getElementById("redeemConfirm").addEventListener("click", async () => {
                    let res = await fetch('/addons/redeemReward', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ item })
                    })
                    let res1 = await res.json();
                    if (res1.success) {
                        showModal("Redeem Confirmed!",
                            `You redeemed <strong>${item.couponTitle}</strong>. Check the usage details`,
                            "<button class=\"btn\" onclick=\"closeModal()\">OK</button>"
                        );
                        setTimeout(() => {
                            window.location.reload();
                        }, 2000);
                    }
                    else {
                        showModal("Redeem Failed!",
                            `You already redeemed <strong>${item.couponTitle}</strong>. Check the usage details`,
                            "<button class=\"btn\" onclick=\"closeModal()\">OK</button>"
                        );
                    }
                })
            }
            else {
                showModal("Not enough Yuu!",
                    `You need <strong>${item.couponCost - YuuCoins} Yuu</strong> to redeem ${item.couponTitle}`,
                    "<button class=\"btn\" onclick=\"closeModal()\">OK</button>"
                );
            }
        });
    });
    document.querySelectorAll(".simple-detail").forEach(btn => {
        btn.addEventListener("click", e => {
            let identifier = e.target.closest(".reward").dataset.ident
            const item = CATALOG.find(i => i.couponCode === identifier);
            if (!item) return;
            if (item) showModal(
                item.couponTitle,
                `${item.couponSubTitle}<br><span>${item.couponDescription}</span>
                    <span style="display:flex;justify-content:flex-start;">
                        <span style="font-size:0.9rem;font-weight:600;text-align: start;">
                            ${item.orderLimit ? `Order Limit: <strong style="color: var(--accent);">${item.orderLimit}</strong>` : ""}<br>
                            ${item.has ? `Enter: <strong style="color: var(--accent);">${item.couponCode}</strong>` : `Cost: <strong style="color: var(--accent);">${item.couponCost} Yuu</strong>`}
                        </span>
                    </span>`,
                "<button class=\"btn\" onclick=\"closeModal()\">OK</button>",
                `<div style="display:flex;align-items:right;padding-top:12px;">
                        ${item.couponEndingDate ? `<div style="font-size:10px;color:var(--muted);padding-right:4px">Ended on: ${new Date(item.couponEndingDate).toLocaleString("en-GB", { weekday: "long", day: "numeric", month: "numeric", year: "numeric" })}</div>` : ""}
                        ${item.couponLimit ? `<div style="font-size:10px;color:var(--muted);padding-left:4px;border-left:1px solid var(--muted);">Left: (${item.couponLimit})</div>` : ""}
                    </div>`
            );
        })
    });

    // Transactions
    const TX = rewardData.user.Yuutx;
    document.getElementById("txList").innerHTML = TX.reverse().map(t => `
            <div class="txn">
            <div style="width:8px;height:8px;border-radius:50%;background:${t.Yuu > 0 ? "var(--accent)" : "var(--danger)"}"></div>
            <div style="flex:1">
            <div style="font-weight:600">${t.desc}</div>
                <div style="font-size:13px;color:var(--muted)">${new Date(t.date).toLocaleString("en-GB", { hour12: true })}</div>
                </div>
                <div style="font-weight:700">${t.Yuu > 0 ? "+" : ""}${t.Yuu} Yuu</div>
                </div>
          `).join("");

    // Copy Referral
    document.getElementById("copyRef").addEventListener("click", () => {
        const ip = document.getElementById("refInput");
        ip.select();
        document.execCommand("copy");
        showModal("Loyalty Test!",
            `If you want to check your friend's loyalty, send the <strong>copied link</strong>
            to your friend.<br> <strong>Don't tell him about this test :)</strong>`,
            "<button class=\"btn\" onclick=\"closeModal()\">OK</button>"
        );
    });

    // ===== Modal =====
    function renderAgain(newCoins, desc, date) {
        const YuuCoins = Number(document.getElementById("pointsVal").innerHTML.split(" ")[0].trim());
        document.getElementById("pointsVal").textContent = `${YuuCoins + newCoins} Yuu`;
        document.getElementById("pointsSmall").textContent = YuuCoins + newCoins;
        document.getElementById("pointsTotal").textContent = YuuCoins + newCoins;
        document.getElementById("pointsValue").textContent = `Rs.${Math.round((YuuCoins + newCoins) * 0.5)}`;

        const TIERS = [
            { name: "Wood", img: "/assets/tier/wood.png", min: 0, max: 999 },
            { name: "Iron", img: "/assets/tier/iron.png", min: 1000, max: 1999 },
            { name: "Bronze", img: "/assets/tier/bronze.png", min: 2000, max: 3499 },
            { name: "Silver", img: "/assets/tier/silver.png", min: 3500, max: 4999 },
            { name: "Gold", img: "/assets/tier/gold.png", min: 5000, max: 6499 },
            { name: "Diamond", img: "/assets/tier/diamond.png", min: 7000, max: 9999 },
            { name: "Platinum", img: "/assets/tier/platinum.png", min: 10000, max: 14999 },
            { name: "Master", img: "/assets/tier/master.png", min: 15000, max: 9999999999 },
        ];
        const getTier = points => TIERS.find(t => points >= t.min && points <= t.max)?.name || "Bronze";
        const tier = TIERS.find(t => t.name === getTier(YuuCoins + newCoins));
        const next = TIERS.find(t => t.min > tier.min) || { min: tier.max + 1 };
        const progress = Math.min(1, (YuuCoins + newCoins - tier.min) / (next.min - tier.min));
        document.getElementById("userTier").textContent = getTier(YuuCoins + newCoins);
        document.getElementById("progressBar").style.width = `${Math.round(progress * 100)}%`;
        document.getElementById("tierRange").textContent = `${tier.min} Yuu`;
        document.getElementById("tierTag").src = `${tier.img}`;
        document.getElementById("tierTarget").textContent = `${next.min} Yuu`;

        let txHTML = `
            <div class="txn">
            <div style="width:8px;height:8px;border-radius:50%;background:${newCoins > 0 ? "var(--accent)" : "var(--danger)"}"></div>
            <div style="flex:1">
            <div style="font-weight:600">${desc}</div>
                <div style="font-size:13px;color:var(--muted)">${new Date(date).toLocaleString("en-GB", { hour12: true })}</div>
                </div>
                <div style="font-weight:700">${newCoins > 0 ? "+" : ""}${newCoins} Yuu</div>
                </div>
          `
        document.getElementById("txList").innerHTML = txHTML + document.getElementById("txList").innerHTML;
    }
    function showModal(title, content, btns, etc) {
        const root = document.getElementById("modalRoot");
        root.innerHTML = `<div class="modal-content">
                            <h2 id="modalTitle">${title}</h2>
                            <p id="modalMsg">${content}</p>
                            <div style="display:flex;justify-content:space-evenly">
                                ${btns}
                            </div>
                            <div>${etc ? etc : ""}</div>
                          </div>`;
        document.body.style.overflow = "hidden";
        root.style.display = "flex";
    }
    function closeModal() {
        const root = document.getElementById("modalRoot");
        document.body.style.overflow = "auto";
        root.style.display = "none";
        root.innerHTML = "";
    }
    window.closeModal = closeModal;
    window.addEventListener("click", e => {
        if (e.target.id === "modalRoot") closeModal();
    })
})();
