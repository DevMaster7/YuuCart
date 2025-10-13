const MOCK_USER = {
    id: 'user_01',
    name: 'Muneeb',
    points: 320,
    tier: 'Bronze',
    ref: 'SIGMA123'
};
const CATALOG = [{
    id: 'coupon50',
    title: 'Rs.50 Off',
    pts: 100,
    subtitle: 'Min order Rs.500'
},
{
    id: 'freeship',
    title: 'Free Shipping',
    pts: 200,
    subtitle: 'Next order'
},
{
    id: 'mystery',
    title: 'Mystery Box',
    pts: 500,
    subtitle: 'Surprise items'
},
{
    id: 'exclusive-mug',
    title: 'Exclusive Mug',
    pts: 800,
    subtitle: 'Limited edition'
}
];
const TX = [{
    id: 1,
    date: '2025-09-17',
    desc: 'Welcome Bonus',
    pts: +100
},
{
    id: 2,
    date: '2025-09-15',
    desc: 'Order #1234',
    pts: +50
},
{
    id: 3,
    date: '2025-09-14',
    desc: 'Redeemed: Rs.50 Off',
    pts: -100
}
];

const LS_USER = 'demo_rewards_user_v1';
const LS_TX = 'demo_rewards_tx_v1';
let user = JSON.parse(localStorage.getItem(LS_USER)) || MOCK_USER;
let tx = JSON.parse(localStorage.getItem(LS_TX)) || TX;

const TIERS = [{
    name: 'Bronze',
    min: 0,
    max: 999
}, {
    name: 'Silver',
    min: 1000,
    max: 2499
}, {
    name: 'Gold',
    min: 2500,
    max: 999999
}];

function save() {
    localStorage.setItem(LS_USER, JSON.stringify(user));
    localStorage.setItem(LS_TX, JSON.stringify(tx));
}

function getTier(points) {
    const t = TIERS.find(x => points >= x.min && points <= x.max);
    return t ? t.name : 'Bronze';
}

function renderUser() {
    document.getElementById('userName').textContent = user.name;
    document.getElementById('pointsVal').textContent = user.points + ' pts';
    document.getElementById('pointsSmall').textContent = user.points;
    document.getElementById('pointsTotal').textContent = user.points;
    document.getElementById('pointsValue').textContent = 'Rs.' + Math.round(user.points * 0.5);
    document.getElementById('userTier').textContent = getTier(user.points);
    document.getElementById('refInput').value = window.location.origin + '/r/' + (user.ref || ('REF' + user
        .id));
    updateProgress();
}

function updateProgress() {
    const tier = TIERS.find(x => getTier(user.points) === x.name);
    const next = TIERS.find(x => x.min > tier.min) || {
        min: tier.max + 1
    };
    const progress = Math.min(1, (user.points - tier.min) / Math.max(1, (next.min - tier.min)));
    document.getElementById('progressBar').style.width = Math.round(progress * 100) + '%';
    document.getElementById('tierRange').textContent = tier.min + ' pts';
    document.getElementById('tierTarget').textContent = next.min + ' pts';
}

function renderCatalog() {
    const out = document.getElementById('catalog');
    out.innerHTML = '';
    CATALOG.forEach(item => {
        const el = document.createElement('div');
        el.className = 'reward';
        el.innerHTML =
            `<div class='title'>${item.title}</div><div class='meta'>${item.subtitle}</div><div style='display:flex;justify-content:space-between;align-items:center;margin-top:12px'><div style='font-size:12px;color:var(--muted)'>Cost: ${item.pts} pts</div><div><button class='btn small ghost' onclick="viewDetail('${item.id}')">Details</button> <button class='btn small primary' onclick="redeem('${item.id}')">Redeem</button></div></div>`;
        out.appendChild(el);
    });
}

function renderTx() {
    const list = document.getElementById('txList');
    list.innerHTML = '';
    tx.slice(0, 10).forEach(ti => {
        const row = document.createElement('div');
        row.className = 'txn';
        const dot = document.createElement('div');
        dot.style.width = '8px';
        dot.style.height = '8px';
        dot.style.borderRadius = '50%';
        dot.style.background = ti.pts > 0 ? 'var(--secondary)' : 'var(--danger)';
        const info = document.createElement('div');
        info.style.flex = '1';
        info.innerHTML =
            `<div style='font-weight:600'>${ti.desc}</div><div style='font-size:13px;color:var(--muted)'>${ti.date}</div>`;
        const amt = document.createElement('div');
        amt.style.fontWeight = '700';
        amt.textContent = (ti.pts > 0 ? '+' : '') + ti.pts + ' pts';
        row.appendChild(dot);
        row.appendChild(info);
        row.appendChild(amt);
        list.appendChild(row);
    });
}

renderUser();
renderCatalog();
renderTx();

/* === Actions === */
document.getElementById('checkInBtn').addEventListener('click', () => {
    const key = 'checkin_' + user.id + '_' + new Date().toISOString().slice(0, 10);
    if (localStorage.getItem(key)) return showModal('Already claimed', 'You already checked in today.');
    const pts = 10;
    user.points += pts;
    tx.unshift({
        id: Date.now(),
        date: new Date().toISOString().slice(0, 10),
        desc: 'Daily check-in',
        pts
    });
    localStorage.setItem(key, '1');
    save();
    renderUser();
    renderTx();
    showModal('Check-in success', `You earned ${pts} pts`);
});

window.redeem = function (id) {
    const item = CATALOG.find(i => i.id === id);
    if (!item) return;
    if (user.points < item.pts) return showModal('Not enough points',
        `Need ${item.pts - user.points} more pts`
    ); // In production: call server endpoint to create redemption record
    user.points -= item.pts;
    tx.unshift({
        id: Date.now(),
        date: new Date().toISOString().slice(0, 10),
        desc: 'Redeemed: ' + item.title,
        pts: -item.pts
    });
    save();
    renderUser();
    renderTx();
    showModal('Redeemed', `You redeemed ${item.title}. Check account for voucher.`);
};

window.viewDetail = function (id) {
    const item = CATALOG.find(i => i.id === id);
    if (!item) return;
    showModal(item.title, `${item.subtitle} — Cost: ${item.pts} pts`);
};

document.getElementById('spinBtn').addEventListener('click', () => {
    const key = 'spin_' + user.id;
    const last = localStorage.getItem(key);
    if (last && Date.now() - Number(last) < 1000 * 60 * 60 * 24) return showModal('Cooldown',
        'You can spin again in 24 hours.');
    const spinBox = document.getElementById('spinBox');
    spinBox.textContent = 'Spinning...';
    const outcomes = [{
        t: 'p',
        v: 10
    }, {
        t: 'p',
        v: 25
    }, {
        t: 'p',
        v: 50
    }, {
        t: 'p',
        v: 100
    }, {
        t: 'p',
        v: 250
    }, {
        t: 'p',
        v: 500
    }, {
        t: 'v',
        v: 'FreeShip'
    }, {
        t: 'c',
        v: 'Rs.50 Off'
    }];
    const res = outcomes[Math.floor(Math.random() * outcomes.length)];
    setTimeout(() => {
        if (res.t === 'p') {
            user.points += res.v;
            tx.unshift({
                id: Date.now(),
                date: new Date().toISOString().slice(0, 10),
                desc: 'Spin reward',
                pts: +res.v
            });
            showModal('You won points!', `You earned ${res.v} pts`);
        } else {
            tx.unshift({
                id: Date.now(),
                date: new Date().toISOString().slice(0, 10),
                desc: 'Spin reward: ' + res.v,
                pts: 0
            });
            showModal('You won!', `You won ${res.v}`);
        }
        localStorage.setItem(key, Date.now());
        save();
        renderUser();
        renderTx();
        spinBox.textContent = '🎯';
    }, 1200);
});

document.getElementById('copyRef').addEventListener('click', () => {
    const ip = document.getElementById('refInput');
    ip.select();
    document.execCommand('copy');
    showModal('Copied', 'Referral link copied to clipboard');
});

function showModal(title, content) {
    const root = document.getElementById('modalRoot');
    root.style.display = 'block';
    root.innerHTML =
        `<div class='modal-backdrop' onclick='closeModal()'><div class='modal' onclick='event.stopPropagation()'><h3 style='margin-top:0'>${title}</h3><div style='color:var(--muted);margin-top:8px'>${content}</div><div style='text-align:right;margin-top:16px'><button class='btn ghost' onclick='closeModal()'>Close</button></div></div></div>`;
}

function closeModal() {
    const root = document.getElementById('modalRoot');
    root.style.display = 'none';
    root.innerHTML = '';
}

window.closeModal = closeModal;
window.addEventListener('beforeunload', save);
