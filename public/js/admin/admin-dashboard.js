async function getData() {
    const response = await fetch("/api/frontAdminData");
    const returnData = await response.json();
    return returnData
}

async function applyData() {
    let Data = await getData();
    console.log(Data);

    // Charts
    renderUserChart(Data.usersChart);
    renderOrderChart(Data.ordersChart);

    // Table & lists
    renderCoupons(Data.couponsData);
}

applyData();

let userChart = null;
function renderUserChart(Data) {
    const days = Data.map(item => item._id);
    const values = Data.map(item => item.count);

    const ctx = document.getElementById("userChart").getContext("2d");
    if (userChart) userChart.destroy();

    userChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: days,
            datasets: [{
                label: "Users",
                data: values,
                backgroundColor: "rgba(132, 206, 255,0.6)",
                borderRadius: 4,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                zoom: {
                    zoom: {
                        wheel: { enabled: true },
                        pinch: { enabled: true },
                        mode: "x",
                        onZoom: ({ chart }) => updateUserTrend(chart)
                    },
                    pan: {
                        enabled: true,
                        mode: "x",
                        onPan: ({ chart }) => updateUserTrend(chart)
                    }
                }
            },
            scales: {
                x: {
                    min: days.length - 7,
                    max: days.length - 1,
                    grid: { display: false }
                },
                y: { beginAtZero: true }
            }
        }
    });
    updateUserTrend(userChart);
}
function updateUserTrend(chart) {
    const xScale = chart.scales.x;
    const visibleBars = xScale.max - xScale.min + 1;
    document.getElementById("userTrend").textContent = `last ${visibleBars} days`;
}

let orderChart = null;
function renderOrderChart(Data) {
    let series = [
        { status: "Pending", count: Data.pending },
        { status: "Delivered", count: Data.delivered },
        { status: "Cancelled", count: Data.return }
    ];
    const colorMap = {
        Pending: '#F6AD55',
        Delivered: '#38A169',
        Cancelled: '#E53E3E'
    };

    const fixedOrder = ["Pending", "Delivered", "Cancelled"];
    const arranged = fixedOrder.map(status => {
        const found = series.find(s => s.status === status);
        return {
            status,
            count: found ? found.count : 0,
            color: colorMap[status]
        };
    });

    const labels = arranged.map(c => c.status);
    const values = arranged.map(c => c.count);
    const colors = arranged.map(c => c.color);

    const ctx = document.getElementById('orderChart').getContext('2d');
    if (orderChart) orderChart.destroy();

    orderChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels,
            datasets: [{
                data: values,
                backgroundColor: colors,
                hoverBackgroundColor: colors
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function renderCoupons(Data) {
    const cont = document.getElementById('couponList');
    cont.innerHTML = '';

    Data.forEach(c => {
        const now = new Date();
        const endDate = c.couponEndingDate ? new Date(c.couponEndingDate) : null;
        const isExpired = endDate && endDate < now;
        const isActive = c.Status && (!endDate || !isExpired);
        const div = document.createElement('div');
        div.classList.add('coupon-card');
        div.innerHTML = `
            <div class="coupon-header">
                <div>
                    <h4 class="coupon-title">${c.couponTitle}</h4>
                    <p class="coupon-sub">${c.couponSubTitle || ''}</p>
                </div>
                <span class="coupon-type ${c.couponType}">
                    ${c.couponType === "forall" ? "For All Users" : "Custom"}
                </span>
            </div>

            <div class="coupon-body">
                <div class="coupon-code">
                    <span>Code:</span>
                    <strong>${c.couponCode}</strong>
                </div>
                <div class="coupon-benefit">
                    <span>Type:</span> <strong>${c.benefitType.charAt(0).toUpperCase() + c.benefitType.slice(1)}</strong>
                </div>
                <div class="coupon-benefit">
                    <span>Benefit:</span> <strong>${c.benefitValue}</strong>
                </div>
                ${c.couponCost
                ? `<div class="coupon-cost"><span>Cost:</span> <strong>Rs ${c.couponCost}</strong></div>`
                : ''}
                ${c.couponLimit ?
                `<div class="coupon-limit">
                    <span>Limit:</span>
                    <strong>${c.couponLimit}</strong>
                </div>`
                : ''}
                ${Array.isArray(c.userList)
                ? `<div class="coupon-users"><span>Used by:</span> <strong>${c.couponUsage}</strong></div>`
                : ''}
            </div>

            <div class="coupon-footer" data-code="${c.couponCode}">
                <span class="status ${isActive ? 'active' : 'inactive'}">
                    ${isActive ? 'Active' : 'Inactive'}
                </span>

                <button class="btn small" onclick="toggleCoupon('${c.couponCode}')">
                    ${isActive ? 'Pause' : 'Resume'}
                </button>
            </div>`;

        cont.appendChild(div);
    });
}

async function toggleCoupon(code) {
    try {
        const footer = document.querySelector(`.coupon-footer[data-code="${code}"]`);
        if (!footer) return;

        const statusSpan = footer.querySelector('.status');
        const button = footer.querySelector('button');

        // Determine current action
        const action = button.textContent.trim().toLowerCase(); // "pause" or "resume"

        let res = await fetch("/admin/toggleCoupon", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, action }) // send action to backend
        });

        let data = await res.json();

        if (data.success) {
            if (action === 'pause') {
                statusSpan.classList.remove('active');
                statusSpan.classList.add('inactive');
                statusSpan.textContent = 'Inactive';
                button.textContent = 'Resume';
            } else if (action === 'resume') {
                statusSpan.classList.remove('inactive');
                statusSpan.classList.add('active');
                statusSpan.textContent = 'Active';
                button.textContent = 'Pause';
            }
        }
    } catch (err) {
        console.error("Error toggling coupon:", err);
    }
}


