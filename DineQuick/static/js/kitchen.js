let orders = [];

function timeAgo(dateStr) {
    const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
}

function statusColor(status) {
    return status === 'Placed' ? '#F97316' : status === 'Cooking' ? '#3b82f6' : '#10b981';
}

function statusBg(status) {
    return status === 'Placed' ? 'rgba(249,115,22,0.15)' : status === 'Cooking' ? 'rgba(59,130,246,0.15)' : 'rgba(16,185,129,0.15)';
}

function renderKitchen() {
    const grid = document.getElementById('kitchenGrid');
    const noOrders = document.getElementById('noOrders');

    const placed = orders.filter(o => o.status === 'Placed').length;
    const cooking = orders.filter(o => o.status === 'Cooking').length;
    document.getElementById('countPlaced').textContent = placed;
    document.getElementById('countCooking').textContent = cooking;
    document.getElementById('activeCount').textContent = orders.length;
    document.getElementById('countTotal').textContent = orders.length;
    document.getElementById('lastUpdated').textContent = 'Updated ' + new Date().toLocaleTimeString();

    if (orders.length === 0) {
        grid.innerHTML = '';
        noOrders.classList.remove('d-none');
        return;
    }
    noOrders.classList.add('d-none');

    grid.innerHTML = orders.map(order => {
        const canCook = order.status === 'Placed';
        const canServe = order.status === 'Cooking';
        const color = statusColor(order.status);
        const bg = statusBg(order.status);
        const urgency = (new Date() - new Date(order.created_at)) > 600000 ? 'border-danger' : '';

        return `
        <div class="col-xl-3 col-lg-4 col-md-6">
            <div class="kitchen-card rounded-4 h-100 ${urgency}" style="background:#161b22;border:2px solid ${color}33;">
                <div class="p-3 d-flex align-items-center justify-content-between"
                     style="background:${bg};border-radius:14px 14px 0 0;">
                    <div>
                        <h5 class="text-white fw-bold mb-0">Table #${order.table_number}</h5>
                        <small style="color:${color};">${timeAgo(order.created_at)}</small>
                    </div>
                    <span class="badge rounded-pill px-3 py-2" style="background:${bg};color:${color};border:1px solid ${color};">
                        ${order.status}
                    </span>
                </div>
                <div class="p-3">
                    <p class="text-muted small mb-2 fw-semibold">ORDER #${order.id}</p>
                    <ul class="list-unstyled mb-3">
                        ${order.items.map(item => `
                        <li class="d-flex align-items-center gap-2 py-1" style="border-bottom:1px solid #21262d;">
                            <span class="badge rounded-circle text-white fw-bold" style="background:${color};min-width:22px;min-height:22px;line-height:1.4;">${item.quantity}</span>
                            <span class="text-white">${item.menu_item_name}</span>
                        </li>`).join('')}
                    </ul>
                    <div class="d-flex justify-content-between mb-3 text-muted small">
                        <span>Total</span>
                        <span class="text-white fw-semibold">₹${order.grand_total.toFixed(2)}</span>
                    </div>
                    <div class="d-grid gap-2">
                        ${canCook ? `<button class="btn btn-orange rounded-3 fw-semibold" onclick="startCooking(${order.id})">
                            <i class="bi bi-fire me-2"></i>Start Cooking
                        </button>` : ''}
                        ${canServe ? `<button class="btn fw-semibold rounded-3" style="background:#10b981;color:#fff;" onclick="markServed(${order.id})">
                            <i class="bi bi-check2-circle me-2"></i>Mark Served
                        </button>` : ''}
                        ${order.status === 'Served' ? `<button class="btn btn-outline-secondary rounded-3" disabled>
                            <i class="bi bi-check2-all me-1"></i>Served
                        </button>` : ''}
                    </div>
                </div>
            </div>
        </div>`;
    }).join('');
}

async function loadOrders() {
    try {
        const res = await fetch('/api/kitchen/orders');
        orders = await res.json();
        renderKitchen();
    } catch {
        document.getElementById('kitchenGrid').innerHTML =
            '<div class="col-12 text-center text-muted py-4">Failed to load orders</div>';
    }
}

async function startCooking(id) {
    try {
        const res = await fetch('/api/order/start-cooking', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_id: id })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        showToast(`Order #${id} – Cooking started!`, 'success');
        loadOrders();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function markServed(id) {
    try {
        const res = await fetch('/api/order/served', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_id: id })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        showToast(`Order #${id} – Served!`, 'success');
        loadOrders();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadOrders();
    setInterval(loadOrders, 5000);
});
