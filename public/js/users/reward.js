async function getUser() {
    let res = await fetch("/user/getUser", {
        method: 'get',
        headers: { 'Content-Type': 'application/json' },
    });
    let data = await res.json();
    return data
}
// Spining Wheel
(async function () {
    const data = await getUser();
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
            weight: 200
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
        const userId = data.user._id;
        const res = await fetch('/addons/useSpin', {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        })
        const res1 = await res.json();
        if (spinning || !res1.success) {
            console.log(res1.message);
            return
        };

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
    centerBtn.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            spin();
        }
    });
})();


// const MOCK_USER = {
//     id: 'user_01',
//     name: 'Muneeb',
//     points: 320,
//     tier: 'Bronze',
//     ref: 'SIGMA123'
// };
// const CATALOG = [{
//     id: 'coupon50',
//     title: 'Rs.50 Off',
//     pts: 100,
//     subtitle: 'Min order Rs.500'
// },
// {
//     id: 'freeship',
//     title: 'Free Shipping',
//     pts: 200,
//     subtitle: 'Next order'
// },
// {
//     id: 'mystery',
//     title: 'Mystery Box',
//     pts: 500,
//     subtitle: 'Surprise items'
// },
// {
//     id: 'exclusive-mug',
//     title: 'Exclusive Mug',
//     pts: 800,
//     subtitle: 'Limited edition'
// }
// ];
// const TX = [{
//     id: 1,
//     date: '2025-09-17',
//     desc: 'Welcome Bonus',
//     pts: +100
// },
// {
//     id: 2,
//     date: '2025-09-15',
//     desc: 'Order #1234',
//     pts: +50
// },
// {
//     id: 3,
//     date: '2025-09-14',
//     desc: 'Redeemed: Rs.50 Off',
//     pts: -100
// }
// ];

// const LS_USER = 'demo_rewards_user_v1';
// const LS_TX = 'demo_rewards_tx_v1';
// let user = JSON.parse(localStorage.getItem(LS_USER)) || MOCK_USER;
// let tx = JSON.parse(localStorage.getItem(LS_TX)) || TX;

// const TIERS = [{
//     name: 'Bronze',
//     min: 0,
//     max: 999
// }, {
//     name: 'Silver',
//     min: 1000,
//     max: 2499
// }, {
//     name: 'Gold',
//     min: 2500,
//     max: 999999
// }];

// function save() {
//     localStorage.setItem(LS_USER, JSON.stringify(user));
//     localStorage.setItem(LS_TX, JSON.stringify(tx));
// }

// function getTier(points) {
//     const t = TIERS.find(x => points >= x.min && points <= x.max);
//     return t ? t.name : 'Bronze';
// }

// function renderUser() {
//     document.getElementById('userName').textContent = user.name;
//     document.getElementById('pointsVal').textContent = user.points + ' pts';
//     document.getElementById('pointsSmall').textContent = user.points;
//     document.getElementById('pointsTotal').textContent = user.points;
//     document.getElementById('pointsValue').textContent = 'Rs.' + Math.round(user.points * 0.5);
//     document.getElementById('userTier').textContent = getTier(user.points);
//     document.getElementById('refInput').value = window.location.origin + '/r/' + (user.ref || ('REF' + user
//         .id));
//     updateProgress();
// }

// function updateProgress() {
//     const tier = TIERS.find(x => getTier(user.points) === x.name);
//     const next = TIERS.find(x => x.min > tier.min) || {
//         min: tier.max + 1
//     };
//     const progress = Math.min(1, (user.points - tier.min) / Math.max(1, (next.min - tier.min)));
//     document.getElementById('progressBar').style.width = Math.round(progress * 100) + '%';
//     document.getElementById('tierRange').textContent = tier.min + ' pts';
//     document.getElementById('tierTarget').textContent = next.min + ' pts';
// }

// function renderCatalog() {
//     const out = document.getElementById('catalog');
//     out.innerHTML = '';
//     CATALOG.forEach(item => {
//         const el = document.createElement('div');
//         el.className = 'reward';
//         el.innerHTML =
//             `<div class='title'>${item.title}</div><div class='meta'>${item.subtitle}</div><div style='display:flex;justify-content:space-between;align-items:center;margin-top:12px'><div style='font-size:12px;color:var(--muted)'>Cost: ${item.pts} pts</div><div><button class='btn small ghost' onclick="viewDetail('${item.id}')">Details</button> <button class='btn small primary' onclick="redeem('${item.id}')">Redeem</button></div></div>`;
//         out.appendChild(el);
//     });
// }

// function renderTx() {
//     const list = document.getElementById('txList');
//     list.innerHTML = '';
//     tx.slice(0, 10).forEach(ti => {
//         const row = document.createElement('div');
//         row.className = 'txn';
//         const dot = document.createElement('div');
//         dot.style.width = '8px';
//         dot.style.height = '8px';
//         dot.style.borderRadius = '50%';
//         dot.style.background = ti.pts > 0 ? 'var(--secondary)' : 'var(--danger)';
//         const info = document.createElement('div');
//         info.style.flex = '1';
//         info.innerHTML =
//             `<div style='font-weight:600'>${ti.desc}</div><div style='font-size:13px;color:var(--muted)'>${ti.date}</div>`;
//         const amt = document.createElement('div');
//         amt.style.fontWeight = '700';
//         amt.textContent = (ti.pts > 0 ? '+' : '') + ti.pts + ' pts';
//         row.appendChild(dot);
//         row.appendChild(info);
//         row.appendChild(amt);
//         list.appendChild(row);
//     });
// }

// renderUser();
// renderCatalog();
// renderTx();

// /* === Actions === */
// document.getElementById('checkInBtn').addEventListener('click', () => {
//     const key = 'checkin_' + user.id + '_' + new Date().toISOString().slice(0, 10);
//     if (localStorage.getItem(key)) return showModal('Already claimed', 'You already checked in today.');
//     const pts = 10;
//     user.points += pts;
//     tx.unshift({
//         id: Date.now(),
//         date: new Date().toISOString().slice(0, 10),
//         desc: 'Daily check-in',
//         pts
//     });
//     localStorage.setItem(key, '1');
//     save();
//     renderUser();
//     renderTx();
//     showModal('Check-in success', `You earned ${pts} pts`);
// });

// window.redeem = function (id) {
//     const item = CATALOG.find(i => i.id === id);
//     if (!item) return;
//     if (user.points < item.pts) return showModal('Not enough points',
//         `Need ${item.pts - user.points} more pts`
//     ); // In production: call server endpoint to create redemption record
//     user.points -= item.pts;
//     tx.unshift({
//         id: Date.now(),
//         date: new Date().toISOString().slice(0, 10),
//         desc: 'Redeemed: ' + item.title,
//         pts: -item.pts
//     });
//     save();
//     renderUser();
//     renderTx();
//     showModal('Redeemed', `You redeemed ${item.title}. Check account for voucher.`);
// };

// window.viewDetail = function (id) {
//     const item = CATALOG.find(i => i.id === id);
//     if (!item) return;
//     showModal(item.title, `${item.subtitle} — Cost: ${item.pts} pts`);
// };

// document.getElementById('spinBtn').addEventListener('click', () => {
//     const key = 'spin_' + user.id;
//     const last = localStorage.getItem(key);
//     if (last && Date.now() - Number(last) < 1000 * 60 * 60 * 24) return showModal('Cooldown',
//         'You can spin again in 24 hours.');
//     const spinBox = document.getElementById('spinBox');
//     spinBox.textContent = 'Spinning...';
//     const outcomes = [{
//         t: 'p',
//         v: 10
//     }, {
//         t: 'p',
//         v: 25
//     }, {
//         t: 'p',
//         v: 50
//     }, {
//         t: 'p',
//         v: 100
//     }, {
//         t: 'p',
//         v: 250
//     }, {
//         t: 'p',
//         v: 500
//     }, {
//         t: 'v',
//         v: 'FreeShip'
//     }, {
//         t: 'c',
//         v: 'Rs.50 Off'
//     }];
//     const res = outcomes[Math.floor(Math.random() * outcomes.length)];
//     setTimeout(() => {
//         if (res.t === 'p') {
//             user.points += res.v;
//             tx.unshift({
//                 id: Date.now(),
//                 date: new Date().toISOString().slice(0, 10),
//                 desc: 'Spin reward',
//                 pts: +res.v
//             });
//             showModal('You won points!', `You earned ${res.v} pts`);
//         } else {
//             tx.unshift({
//                 id: Date.now(),
//                 date: new Date().toISOString().slice(0, 10),
//                 desc: 'Spin reward: ' + res.v,
//                 pts: 0
//             });
//             showModal('You won!', `You won ${res.v}`);
//         }
//         localStorage.setItem(key, Date.now());
//         save();
//         renderUser();
//         renderTx();
//         spinBox.textContent = '🎯';
//     }, 1200);
// });

document.getElementById('copyRef').addEventListener('click', () => {
    const ip = document.getElementById('refInput');
    ip.select();
    document.execCommand('copy');
    showModal('Copied', 'Referral link copied to clipboard');
});

function showModal(title, content) {
    const root = document.getElementById('modalRoot');
    document.body.style.overflow = 'hidden';
    root.style.display = 'block';
    if (title == "Copied") {
        root.innerHTML = `<div class='modal-backdrop' onclick='closeModal()'>
            <div class='modal' onclick='event.stopPropagation()'>
                <h2 style='margin-top:0'>Loyalty Test!</h2>
                <div style='color:var(--muted);margin-top:8px'>
                    If you want to see your friend's loyalty than send the <strong>copied link</strong>
                    to your friend.<br>
                    <strong>Don't tell him about this test :)</strong>
                </div>
                <div style='text-align:right;margin-top:16px'><button class='btn ghost'
                        onclick='closeModal()'>Close</button></div>
            </div>
        </div>`
    } else {
        root.innerHTML =
            `<div class='modal-backdrop' onclick='closeModal()'><div class='modal' onclick='event.stopPropagation()'><h2 style='margin-top:0'>${title}</h2><div style='color:var(--muted);margin-top:8px'>${content}</div><div style='text-align:right;margin-top:16px'><button class='btn ghost' onclick='closeModal()'>Close</button></div></div></div>`;
        setTimeout(() => {
            closeModal();
        }, 2500)
    }
}

function closeModal() {
    const root = document.getElementById('modalRoot');
    document.body.style.overflow = 'auto';
    root.style.display = 'none';
    root.innerHTML = '';
}

window.closeModal = closeModal;
