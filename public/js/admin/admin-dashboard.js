const OC = document.getElementById('ordersChart').getContext('2d');
const PC = document.getElementById('productsChart').getContext('2d');
const UC = document.getElementById('usersChart').getContext('2d');
const CC = document.getElementById('coupansChart').getContext('2d');

let pendingOrders = Number(document.getElementById("ordersChart").dataset.pending);
let deliveredOrders = Number(document.getElementById("ordersChart").dataset.delivered);
let cancelledOrders = Number(document.getElementById("ordersChart").dataset.cancelled);
new Chart(OC, {
    type: 'pie',
    data: {
        labels: ['Pending', 'Delivered', 'Cancelled'],
        datasets: [{
            data: [pendingOrders, deliveredOrders, cancelledOrders],
            backgroundColor: ['#FF9800', '#4CAF50', '#F44336'],
        }]
    },
    options: {
        plugins: {
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    boxWidth: 20,
                    color: '#333',
                }
            }
        }
    }
});

new Chart(UC, {
    type: 'pie',
    data: {
        labels: ['Active', 'Inactive'],
        datasets: [{
            data: [500, 40],
            backgroundColor: ['#4CAF50', '#F44336'],
        }]
    },
    options: {
        plugins: {
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    boxWidth: 20,
                    color: '#333',
                }
            }
        }
    }
});

new Chart(PC, {
    type: 'pie',
    data: {
        labels: ['In Stock', 'Out of Stock'],
        datasets: [{
            data: [200, 120],
            backgroundColor: ['#4CAF50', '#F44336'],
        }]
    },
    options: {
        plugins: {
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    boxWidth: 20,
                    color: '#333',
                }
            }
        }
    }
});
new Chart(CC, {
    type: 'pie',
    data: {
        labels: ['Active', 'Inactive'],
        datasets: [{
            data: [35, 15],
            backgroundColor: ['#4CAF50', '#F44336'],
        }]
    },
    options: {
        plugins: {
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    boxWidth: 20,
                    color: '#333',
                }
            }
        }
    }
});
