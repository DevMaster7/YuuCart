async function getData() {
    const response = await fetch("/admin/admin-data");
    const returnData = await response.json();
    console.log(returnData.data.allCoupans);

    // User Data
    let userData = returnData.data.userChartDetails.agg
    let startingUser = returnData.data.userChartDetails.firstUser.joiningDate
    function toMidnight(date) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d;
    }
    function fillDays(data, startDate) {
        const result = [];
        let startingDate = toMidnight(startDate);
        let currentDate = toMidnight(new Date());

        while (startingDate <= currentDate) {
            const dd = String(startingDate.getDate()).padStart(2, "0");
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const mm = monthNames[startingDate.getMonth()];
            const dayName = startingDate.toLocaleDateString("en-US", { weekday: "short" });

            const label = `${dd} ${mm} (${dayName})`;

            const match = data.find(d =>
                d._id.year === startingDate.getFullYear() &&
                d._id.month === startingDate.getMonth() + 1 &&
                d._id.day === startingDate.getDate()
            );

            result.push({
                date: label,
                count: match ? match.count : 0
            });

            startingDate.setDate(startingDate.getDate() + 1);
        }

        return result;
    }
    const userSeries = fillDays(userData, startingUser);

    // Coupon Data
    let coupons = returnData.data.allCoupans;
    coupons = coupons.map((coupon) => {
        return {
            code: coupon.coupanCode,
            discount: coupon.coupanDiscount,
            limit: coupon.coupanLimit,
            active: coupon.Status
        }
    })

    // Complete Data Structure
    let MOCK = {
        kpis: {
            revenue: 0,
            users: returnData.data.allUsers,
            products: returnData.data.allProducts,
            orders: returnData.data.allOrders,
            coupons: returnData.data.allCoupans
        },
        userSeries,
        orderSeries: returnData.data.orderChartDetails,
        coupons,
        productCategories: [{
            name: 'Apparel',
            value: 48
        },
        {
            name: 'Accessories',
            value: 28
        },
        {
            name: 'Home',
            value: 18
        },
        {
            name: 'Electronics',
            value: 12
        },
        ],
        recentOrders: [{
            id: 'ORD-1001',
            customer: 'Ali Khan',
            amount: 3200,
            date: '2025-09-18',
            status: 'Processing'
        },
        {
            id: 'ORD-1002',
            customer: 'Sara I.',
            amount: 1250,
            date: '2025-09-18',
            status: 'Pending'
        },
        {
            id: 'ORD-1003',
            customer: 'Usman R.',
            amount: 499,
            date: '2025-09-17',
            status: 'Shipped'
        },
        {
            id: 'ORD-1004',
            customer: 'Ayesha',
            amount: 2199,
            date: '2025-09-16',
            status: 'Delivered'
        },
        {
            id: 'ORD-1005',
            customer: 'Bilal',
            amount: 799,
            date: '2025-09-15',
            status: 'Returned'
        }
        ],
        topProducts: [{
            id: 'P-01',
            title: 'Classic Tee',
            sold: 420
        },
        {
            id: 'P-02',
            title: 'Limited Mug',
            sold: 320
        },
        {
            id: 'P-03',
            title: 'Sticker Pack',
            sold: 290
        }
        ],

    };
    applyData(MOCK);
}
getData();

function fmt(n) {
    // simple rupee formatting
    return 'Rs.' + n.toLocaleString('en-PK');
}

function applyData(data) {
    // KPIs
    document.getElementById('kpiUsers').textContent = data.kpis.users.length;
    document.getElementById('kpiProducts').textContent = data.kpis.products.length;
    document.getElementById('kpiOrders').textContent = data.kpis.orders.length;
    document.getElementById('kpiRevenue').textContent = fmt(data.kpis.revenue);

    document.getElementById('totalUserCount').textContent = `(${data.kpis.users.length})`;
    document.getElementById('totalOrderCount').textContent = `(${data.kpis.orders.length})`;
    document.getElementById('totalCouponCount').textContent = `(${data.kpis.coupons.length})`;
    document.getElementById('totalProductCount').textContent = `(${data.kpis.products.length})`;

    // Charts
    renderUserChart(data.userSeries);
    renderOrderChart(data.orderSeries);
    // renderPieChart(data.productCategories);

    // // Table & lists
    renderCoupons(data.coupons);
    // renderOrdersTable(data.recentOrders);
    // renderTopProducts(data.topProducts);
}

let userChart = null,
    orderChart = null
function renderUserChart(series) {
    const days = series.map(item => item.date);
    const values = series.map(item => item.count);

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

function renderOrderChart(series) {
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

// function renderOrdersChart(statusSeries) {
//     const ctx = document.getElementById('ordersChart').getContext('2d');
//     const labels = statusSeries.map(s => s.status);
//     const values = statusSeries.map(s => s.count);
//     if (ordersChart) ordersChart.destroy();
//     ordersChart = new Chart(ctx, {
//         type: 'bar',
//         data: {
//             labels,
//             datasets: [{
//                 label: 'Orders',
//                 data: values,
//                 backgroundColor: labels.map(lbl => statusColor(lbl)),
//                 borderRadius: 6
//             }]
//         },
//         options: {
//             responsive: true,
//             maintainAspectRatio: false,
//             scales: {
//                 x: {
//                     grid: {
//                         display: false
//                     },
//                     ticks: {
//                         color: '#64748b'
//                     }
//                 },
//                 y: {
//                     grid: {
//                         color: '#f1f5f9'
//                     },
//                     ticks: {
//                         color: '#64748b'
//                     }
//                 }
//             },
//             plugins: {
//                 legend: {
//                     display: false
//                 }
//             }
//         }
//     });
// }



// -------------------------
// Render lists & tables
// -------------------------
// function renderOrdersTable(orders) {
//     // If no orders provided, use data from MOCK
//     orders = orders || MOCK.recentOrders;
//     const filter = document.getElementById('filterStatus').value;
//     const tbody = document.getElementById('ordersTableBody');
//     tbody.innerHTML = '';
//     const filtered = (filter === 'all') ? orders : orders.filter(o => o.status.toLowerCase() === filter
//         .toLowerCase());
//     filtered.forEach(o => {
//         const tr = document.createElement('tr');
//         tr.innerHTML = `
//           <td><strong>${o.id}</strong></td>
//           <td>${o.customer}</td>
//           <td>${fmt(o.amount)}</td>
//           <td class="muted">${o.date}</td>
//           <td><span class="badge ${badgeClass(o.status)}">${o.status}</span></td>
//         `;
//         tbody.appendChild(tr);
//     });
//     // update total orders count display
//     document.getElementById('totalOrdersCount').textContent = orders.length;
// }

// function badgeClass(status) {
//     const s = status.toLowerCase();
//     if (s === 'pending') return 'b-pending';
//     if (s === 'processing') return 'b-processing';
//     if (s === 'shipped') return 'b-shipped';
//     if (s === 'delivered') return 'b-delivered';
//     if (s === 'returned') return 'b-return';
//     return '';
// }

// function renderTopProducts(list) {
//     const cont = document.getElementById('topProducts');
//     cont.innerHTML = '';
//     list.forEach(p => {
//         const el = document.createElement('div');
//         el.className = 'top-item';
//         el.innerHTML = `<div class="thumb">${p.title.charAt(0)}</div>
//                         <div style="flex:1"><div style="font-weight:700">${p.title}</div><div class="muted" style="font-size:13px">${p.sold} sold</div></div>
//                         <div style="font-weight:700">${p.sold}</div>`;
//         cont.appendChild(el);
//     });
// }

function renderCoupons(list) {
    const cont = document.getElementById('couponList');
    cont.innerHTML = '';
    list.forEach(c => {
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';
        div.style.padding = '8px';
        div.style.borderRadius = '8px';
        div.style.background = '#fbfdff';
        div.innerHTML =
            `<div>
            <div style="font-weight:700">${c.code}</div>
            <div class="muted" style="font-size:13px">Discount: <strong>${c.discount}%</strong></div>
            </div>
            <div><button class="btn small ghost" onclick='toggleCoupon("${c.code}")'>${c.active ? 'Pause' : 'Activate'}</button></div>`;
        cont.appendChild(div);
    });
}

function refreshAll() {
    getData();
}

