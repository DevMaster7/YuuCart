async function getUserData() {
    let res = await fetch("/user/getUser", {
        method: 'get',
        headers: { 'Content-Type': 'application/json' },
    });
    let data = await res.json();
    return data
}
async function getRedeemsData() {
    let res = await fetch("/user/getRedeems", {
        method: 'get',
        headers: { 'Content-Type': 'application/json' },
    });
    let data = await res.json();
    return data
}

(async function () {
    const userData = await getUserData();
    const user = userData.user
    const redeems = await getRedeemsData();
    const CATALOG = redeems.redeems

    // const CATALOG = [
    //     { id: "coupon50", title: "Rs.50 Off", Yuu: 100, subtitle: "Min order Rs.500" },
    //     { id: "freeship", title: "Free Shipping", Yuu: 200, subtitle: "Next order" },
    //     { id: "mystery", title: "Mystery Box", Yuu: 500, subtitle: "Surprise items" },
    //     { id: "exclusive-mug", title: "Exclusive Mug", Yuu: 800, subtitle: "Limited edition" }
    // ];

    // ===== Render =====
    function renderAll() {
        // Render User
        (function () {
            document.getElementById("userName").textContent = user.fullname;
            document.getElementById("pointsVal").textContent = `${user.YuuCoin} Yuu`;
            document.getElementById("pointsSmall").textContent = user.YuuCoin;
            document.getElementById("pointsTotal").textContent = user.YuuCoin;
            document.getElementById("pointsValue").textContent = `Rs.${Math.round(user.YuuCoin * 0.5)}`;
            document.getElementById("refInput").value = user.Reffer.url;
        })();

        // Tier Progress
        (function () {
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
            const tier = TIERS.find(t => t.name === getTier(user.YuuCoin));
            const next = TIERS.find(t => t.min > tier.min) || { min: tier.max + 1 };
            const progress = Math.min(1, (user.YuuCoin - tier.min) / (next.min - tier.min));
            document.getElementById("userTier").textContent = getTier(user.YuuCoin);
            document.getElementById("progressBar").style.width = `${Math.round(progress * 100)}%`;
            document.getElementById("tierRange").textContent = `${tier.min} Yuu`;
            document.getElementById("tierTag").src = `${tier.img}`;
            document.getElementById("tierTarget").textContent = `${next.min} Yuu`;
        })();

        // Check In
        (function () {
            document.getElementById("checkInBtn").addEventListener("click", async () => {
                let res = await fetch("/addons/checkIn", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ userId: user._id })
                });
                let res1 = await res.json();
                if (res1.success) {
                    let streak = res1.streak
                    let root = document.getElementById("modalRoot")
                    document.body.style.overflow = "hidden";
                    root.style.display = "flex";
                    root.innerHTML = `
                                    <div class="reward-card">
                                        <div id="checkInProgress" class="check-progress"></div>
                                    </div>
                                    `
                    renderProgress(streak);
                    document.getElementById("pointsVal").textContent = `${user.YuuCoin + res1.reward} Yuu`;
                    document.getElementById("pointsSmall").textContent = user.YuuCoin + res1.reward;
                    document.getElementById("pointsTotal").textContent = user.YuuCoin + res1.reward;
                    document.getElementById("pointsValue").textContent = `Rs.${Math.round((user.YuuCoin + res1.reward) * 0.5)}`;
                }
                else {
                    showModal("Already Checked In", "You’ve already claimed today’s reward!");
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
        })();

        // Spining Wheel
        (function () {
            const CONFIG = {
                size: 420,
                segments: [{
                    label: '10% OFF',
                    color: '#F97316',
                    weight: 1
                },
                {
                    label: '20% OFF',
                    color: '#60A5FA',
                    weight: 1
                },
                {
                    label: 'Free Mug',
                    color: '#34D399',
                    weight: 1
                },
                {
                    label: 'Free Shipping',
                    color: '#06B6D4',
                    weight: 1
                },
                {
                    label: 'No Prize',
                    color: '#E5E7EB',
                    weight: 1
                },
                {
                    label: '50% OFF',
                    color: '#F43F5E',
                    weight: 0
                },
                ],
                fullSpins: 5,
            };
            const wheel = document.getElementById("wheel");
            const resultBox = document.getElementById("resultBox");
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
                const userId = user._id;
                const res = await fetch('/addons/useSpin', {
                    method: 'post',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId })
                })
                const res1 = await res.json();

                if (res1.success) {
                    spinning = true;
                    resultBox.style.display = "none";

                    const index = weightedRandomIndex(CONFIG.segments, lastIndex);
                    lastIndex = index;

                    const anglePer = 360 / CONFIG.segments.length;
                    const target = index * anglePer + anglePer / 2;
                    const finalRotation = 360 * CONFIG.fullSpins + (360 - target);

                    wheel.style.transition = "transform 5s cubic-bezier(.22,1,.36,1)";
                    wheel.style.transform = `rotate(${finalRotation}deg)`;
                    wheel.style.setProperty('--wheel-rotation', `${finalRotation}deg`);


                    wheel.addEventListener("transitionend", function handler() {
                        wheel.removeEventListener("transitionend", handler);
                        spinning = false;

                        const seg = CONFIG.segments[index];
                        resultBox.textContent =
                            seg.label === "No Prize" ?
                                "No prize this time — try again!" :
                                `🎉 You won: ${seg.label}!`;

                        resultBox.style.display = "block";

                        wheel.style.transition = "none";
                        wheel.style.transform = `rotate(${360 - target}deg)`;

                        if (seg.label !== "No Prize") fireConfetti();
                    });
                }
                else {
                    showModal("Already Spinned!", "You've already use your spin for today!");
                }
            }

            function fireConfetti() {
                confettiEl.innerHTML = '';
                const colors = CONFIG.segments.map(s => s.color);
                const count = 28;

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
                        delay: Math.random() * 200
                    }
                    );

                    setTimeout(() => {
                        try {
                            el.remove();
                        } catch { }
                    }, fall + 600);
                }
            }

            centerBtn.addEventListener("click", spin);
        })();

        // Catalog
        (function () {
            document.getElementById("catalog").innerHTML = CATALOG.map(item => `
                <div class="reward">
                  <div class="title">${item.title}</div>
                  <div class="meta">${item.subtitle}</div>
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px">
                    <div style="font-size:12px;color:var(--muted)">Cost: ${item.cost} Yuu</div>
                    <div>
                      <button class="btn small ghost" onclick="viewDetail('${item.title}')">Details</button>
                      <button class="btn small primary" onclick="redeem('${item.title}')">Redeem</button>
                    </div>
                  </div>
                </div>
              `).join("");
            window.redeem = title => {
                const item = CATALOG.find(i => i.title === title);
                if (!item) return;
                let totalYuu = Number(document.getElementById("pointsVal").innerHTML.replace("Yuu", ""));
                if (!(totalYuu < item.cost)) {
                    console.log(`Buy`);
                    // data.user.points -= item.cost;
                    // data.tx.unshift({ id: Date.now(), date: formatDate(), desc: `Redeemed: ${item.title}`, Yuu: -item.cost });
                    // renderAll();
                    // showModal("Redeemed", `You redeemed ${item.title}. Check account for voucher.`);
                }
                else {
                    showModal("Not enough Yuu!", `You need <strong>${item.cost - totalYuu} Yuu</strong> to redeem ${item.title}`);
                }
            };

            window.viewDetail = title => {
                const item = CATALOG.find(i => i.title === title);
                if (item) showModal(item.title, `${item.subtitle} — Cost: <strong>${item.cost} Yuu</strong> <br> <span>${item.description}</span>`);
            };
        })();

        // Transactions
        (function () {
            const TX = [
                { date: '2025-09-17', desc: 'Welcome Bonus', Yuu: +100 },
                { date: '2025-09-15', desc: 'Order #1234', Yuu: +50 },
                { date: '2025-09-14', desc: 'Redeemed: Rs.50 Off', Yuu: -100 }
            ];
            // Dummy
            document.getElementById("txList").innerHTML = TX.slice(0, 10).map(t => `
            <div class="txn">
            <div style="width:8px;height:8px;border-radius:50%;background:${t.Yuu > 0 ? "var(--secondary)" : "var(--danger)"}"></div>
            <div style="flex:1">
            <div style="font-weight:600">${t.desc}</div>
                <div style="font-size:13px;color:var(--muted)">${t.date}</div>
                </div>
                <div style="font-weight:700">${t.Yuu > 0 ? "+" : ""}${t.Yuu} Yuu</div>
                </div>
          `).join("");
        })();
    }


    // Copy Referral
    document.getElementById("copyRef").addEventListener("click", () => {
        const ip = document.getElementById("refInput");
        ip.select();
        document.execCommand("copy");
        showModal("Loyalty Test!",
            `If you want to check your friend's loyalty, send the <strong>copied link</strong>
            to your friend.<br> <strong>Don't tell him about this test :)</strong>`);
    });

    // ===== Modal =====
    function showModal(title, content) {
        const root = document.getElementById("modalRoot");
        root.innerHTML = `<div class="modal-content">
          <h2 id="modalTitle"></h2>
          <p id="modalMsg"></p>
          <button onclick="closeModal()">OK</button>
            </div>`;
        document.getElementById("modalTitle").innerHTML = title;
        document.getElementById("modalMsg").innerHTML = content;
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
    // ===== Init =====
    renderAll();
})();