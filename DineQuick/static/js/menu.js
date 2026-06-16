let allItems = [];
let currentCategory = 'All';
let cart = JSON.parse(localStorage.getItem(`cart_${TABLE}`) || '[]');

function saveCart() {
    localStorage.setItem(`cart_${TABLE}`, JSON.stringify(cart));
    updateCartBadge();
}

function updateCartBadge() {
    const total = cart.reduce((s, i) => s + i.quantity, 0);
    const badge = document.getElementById('cartCount');
    if (total > 0) {
        badge.textContent = total;
        badge.classList.remove('d-none');
    } else {
        badge.classList.add('d-none');
    }
}

function goToCart() {
    window.location.href = `/cart/${TABLE}`;
}

function setCategory(btn, cat) {
    currentCategory = cat;
    document.querySelectorAll('.category-btn').forEach(b => {
        b.classList.remove('btn-orange', 'active');
        b.classList.add('btn-outline-secondary');
    });
    btn.classList.add('btn-orange', 'active');
    btn.classList.remove('btn-outline-secondary');
    renderMenu();
}

function filterMenu() {
    renderMenu();
}

function loadMenu() {
    fetch('/api/menu')
        .then(r => r.json())
        .then(data => {
            allItems = data;
            renderMenu();
        })
        .catch(() => {
            document.getElementById('menuGrid').innerHTML =
                '<div class="col-12 text-center py-5"><p class="text-muted">Failed to load menu. Please refresh.</p></div>';
        });
}

function renderMenu() {
    const search = document.getElementById('searchInput').value.toLowerCase().trim();
    let filtered = allItems;

    if (currentCategory !== 'All') {
        filtered = filtered.filter(i => i.category === currentCategory);
    }
    if (search) {
        filtered = filtered.filter(i =>
            i.name.toLowerCase().includes(search) ||
            (i.description || '').toLowerCase().includes(search)
        );
    }

    const grid = document.getElementById('menuGrid');
    const noRes = document.getElementById('noResults');

    if (filtered.length === 0) {
        grid.innerHTML = '';
        noRes.classList.remove('d-none');
        return;
    }
    noRes.classList.add('d-none');

    grid.innerHTML = filtered.map(item => {
        const cartItem = cart.find(c => c.menu_item_id === item.id);
        const qty = cartItem ? cartItem.quantity : 0;
        const unavailable = !item.available;

        return `
        <div class="col-md-6 col-lg-4">
            <div class="menu-card rounded-4 overflow-hidden h-100 ${unavailable ? 'opacity-75' : ''}"
                 style="background:#1f2937;border:1px solid #374151;cursor:${unavailable ? 'default' : 'pointer'};"
                 ${!unavailable ? `onclick="openItemModal(${item.id})"` : ''}>
                <div class="position-relative" style="height:180px;overflow:hidden;">
                    <img src="${item.image_url}" alt="${item.name}"
                         style="width:100%;height:100%;object-fit:cover;"
                         onerror="this.src='/static/images/default_food.svg'">
                    <div class="position-absolute top-0 start-0 m-2">
                        <span class="badge rounded-pill px-2 py-1" style="background:rgba(0,0,0,0.7);font-size:11px;">${item.category}</span>
                    </div>
                    ${unavailable ? '<div class="position-absolute top-0 end-0 m-2"><span class="badge bg-danger rounded-pill">Unavailable</span></div>' : ''}
                </div>
                <div class="p-3">
                    <h6 class="text-white fw-semibold mb-1">${item.name}</h6>
                    <p class="text-muted small mb-3" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">
                        ${item.description || ''}
                    </p>
                    <div class="d-flex align-items-center justify-content-between">
                        <span class="text-orange fw-bold fs-5">₹${item.price.toFixed(2)}</span>
                        ${unavailable ? '' : (qty === 0
                            ? `<button class="btn btn-sm btn-orange rounded-pill px-3" onclick="event.stopPropagation();addToCart(${item.id})">
                                <i class="bi bi-plus me-1"></i>Add
                               </button>`
                            : `<div class="qty-ctrl d-flex align-items-center gap-2" onclick="event.stopPropagation();">
                                <button class="btn btn-sm rounded-circle qty-btn" onclick="changeQty(${item.id},-1)" style="background:#374151;color:#fff;width:28px;height:28px;padding:0;">–</button>
                                <span class="text-white fw-semibold">${qty}</span>
                                <button class="btn btn-sm rounded-circle qty-btn" onclick="changeQty(${item.id},1)" style="background:#F97316;color:#fff;width:28px;height:28px;padding:0;">+</button>
                               </div>`
                        )}
                    </div>
                </div>
            </div>
        </div>`;
    }).join('');
}

function openItemModal(id) {
    const item = allItems.find(i => i.id === id);
    if (!item) return;
    const cartItem = cart.find(c => c.menu_item_id === id);
    const qty = cartItem ? cartItem.quantity : 0;

    document.getElementById('modalBody').innerHTML = `
        <img src="${item.image_url}" alt="${item.name}" class="w-100 rounded-3 mb-3"
             style="height:220px;object-fit:cover;"
             onerror="this.src='/static/images/default_food.svg'">
        <div class="d-flex align-items-start justify-content-between mb-2">
            <h5 class="text-white fw-bold mb-0">${item.name}</h5>
            <span class="badge rounded-pill px-3 py-2" style="background:rgba(249,115,22,0.2);color:#F97316;border:1px solid #F97316;white-space:nowrap;">
                ₹${item.price.toFixed(2)}
            </span>
        </div>
        <span class="badge rounded-pill mb-3" style="background:#374151;color:#9ca3af;">${item.category}</span>
        <p class="text-muted mb-4">${item.description || 'A delicious dish prepared with fresh ingredients.'}</p>
        <div class="d-flex align-items-center justify-content-between">
            <small class="text-muted">Tax: ${item.tax_percentage}%</small>
            ${qty === 0
                ? `<button class="btn btn-orange px-5 rounded-pill" onclick="addToCart(${id});bootstrap.Modal.getInstance(document.getElementById('itemModal')).hide();">
                    <i class="bi bi-cart-plus me-2"></i>Add to Cart
                   </button>`
                : `<div class="d-flex align-items-center gap-3">
                    <button class="btn rounded-circle" onclick="changeQty(${id},-1)" style="background:#374151;color:#fff;width:38px;height:38px;padding:0;">–</button>
                    <span class="text-white fw-bold fs-5">${qty}</span>
                    <button class="btn rounded-circle btn-orange" onclick="changeQty(${id},1)" style="width:38px;height:38px;padding:0;">+</button>
                   </div>`
            }
        </div>`;

    new bootstrap.Modal(document.getElementById('itemModal')).show();
}

function addToCart(id) {
    const existing = cart.find(c => c.menu_item_id === id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ menu_item_id: id, quantity: 1 });
    }
    saveCart();
    renderMenu();
    showToast('Added to cart!', 'success');
}

function changeQty(id, delta) {
    const idx = cart.findIndex(c => c.menu_item_id === id);
    if (idx === -1 && delta > 0) {
        cart.push({ menu_item_id: id, quantity: 1 });
    } else if (idx !== -1) {
        cart[idx].quantity += delta;
        if (cart[idx].quantity <= 0) {
            cart.splice(idx, 1);
        }
    }
    saveCart();
    renderMenu();
}

document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    loadMenu();
});
