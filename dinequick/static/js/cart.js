let cart = JSON.parse(localStorage.getItem(`cart_${TABLE}`) || '[]');
let menuItemsCache = {};

function saveCart() {
    localStorage.setItem(`cart_${TABLE}`, JSON.stringify(cart));
}

async function loadMenuItems() {
    const ids = cart.map(c => c.menu_item_id);
    if (ids.length === 0) return;
    const res = await fetch('/api/menu');
    const items = await res.json();
    items.forEach(i => { menuItemsCache[i.id] = i; });
}

function calcBill() {
    let subtotal = 0, tax = 0;
    cart.forEach(c => {
        const item = menuItemsCache[c.menu_item_id];
        if (!item) return;
        const line = item.price * c.quantity;
        subtotal += line;
        tax += line * (item.tax_percentage / 100);
    });
    return { subtotal, tax, grand: subtotal + tax };
}

function renderCart() {
    const container = document.getElementById('cartItems');
    const emptyDiv = document.getElementById('emptyCart');
    const cartContent = document.getElementById('cartContent');

    if (cart.length === 0) {
        emptyDiv.classList.remove('d-none');
        cartContent.classList.add('d-none');
        return;
    }
    emptyDiv.classList.add('d-none');
    cartContent.classList.remove('d-none');

    container.innerHTML = cart.map(c => {
        const item = menuItemsCache[c.menu_item_id];
        if (!item) return '';
        return `
        <div class="cart-item rounded-4 p-3 mb-3" style="background:#1f2937;border:1px solid #374151;">
            <div class="d-flex gap-3 align-items-center">
                <img src="${item.image_url}" alt="${item.name}" class="rounded-3"
                     style="width:64px;height:64px;object-fit:cover;"
                     onerror="this.src='/static/images/default_food.svg'">
                <div class="flex-grow-1">
                    <h6 class="text-white fw-semibold mb-1">${item.name}</h6>
                    <p class="text-orange fw-bold mb-0">₹${item.price.toFixed(2)}</p>
                </div>
                <div class="d-flex align-items-center gap-2">
                    <button class="btn rounded-circle qty-btn" onclick="changeQty(${item.id},-1)"
                            style="background:#374151;color:#fff;width:30px;height:30px;padding:0;line-height:1;">–</button>
                    <span class="text-white fw-semibold px-1">${c.quantity}</span>
                    <button class="btn rounded-circle qty-btn btn-orange" onclick="changeQty(${item.id},1)"
                            style="width:30px;height:30px;padding:0;line-height:1;">+</button>
                    <button class="btn btn-sm btn-link text-danger ms-1 p-0" onclick="removeItem(${item.id})" title="Remove">
                        <i class="bi bi-trash3"></i>
                    </button>
                </div>
            </div>
            <div class="text-end mt-2">
                <small class="text-muted">Line total: <span class="text-white fw-semibold">₹${(item.price * c.quantity).toFixed(2)}</span></small>
            </div>
        </div>`;
    }).join('');

    updateBill();
}

function updateBill() {
    const { subtotal, tax, grand } = calcBill();
    document.getElementById('subtotal').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('taxAmount').textContent = `₹${tax.toFixed(2)}`;
    document.getElementById('grandTotal').textContent = `₹${grand.toFixed(2)}`;
}

function changeQty(id, delta) {
    const idx = cart.findIndex(c => c.menu_item_id === id);
    if (idx !== -1) {
        cart[idx].quantity += delta;
        if (cart[idx].quantity <= 0) cart.splice(idx, 1);
    }
    saveCart();
    renderCart();
}

function removeItem(id) {
    cart = cart.filter(c => c.menu_item_id !== id);
    saveCart();
    renderCart();
    showToast('Item removed', 'warning');
}

async function placeOrder() {
    if (cart.length === 0) {
        showToast('Cart is empty', 'error');
        return;
    }
    const btn = document.getElementById('placeOrderBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Placing Order...';

    try {
        const res = await fetch('/api/place-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ table_number: TABLE, cart_items: cart })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to place order');

        localStorage.removeItem(`cart_${TABLE}`);
        showToast('Order placed successfully!', 'success');
        setTimeout(() => {
            window.location.href = `/order/${data.order.id}`;
        }, 800);
    } catch (err) {
        showToast(err.message, 'error');
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-check2-circle me-2"></i>Place Order';
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadMenuItems();
    renderCart();
});
