let deleteTargetId = null;
let deleteModal = null;
let menuModal = null;

function getCategoryBadgeClass(cat) {
    const map = { 'Starters': 'warning', 'Main Course': 'primary', 'Desserts': 'danger', 'Drinks': 'info' };
    return map[cat] || 'secondary';
}

function loadAdminMenu() {
    const search = document.getElementById('adminSearch').value.trim();
    const category = document.getElementById('adminCategoryFilter').value;
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category !== 'All') params.set('category', category);

    fetch('/api/admin/menu?' + params)
        .then(r => r.json())
        .then(items => {
            document.getElementById('itemCount').textContent = items.length;
            const tbody = document.getElementById('adminMenuBody');
            if (items.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">No items found</td></tr>';
                return;
            }
            tbody.innerHTML = items.map(item => `
            <tr>
                <td class="ps-4">
                    <div class="d-flex align-items-center gap-3">
                        <img src="${item.image_url}" alt="${item.name}" class="rounded-3"
                             style="width:48px;height:48px;object-fit:cover;"
                             onerror="this.src='/static/images/default_food.svg'">
                        <div>
                            <p class="fw-semibold mb-0">${item.name}</p>
                            <small class="text-muted">${(item.description || '').substring(0, 50)}${item.description && item.description.length > 50 ? '...' : ''}</small>
                        </div>
                    </div>
                </td>
                <td><span class="badge bg-${getCategoryBadgeClass(item.category)} rounded-pill">${item.category}</span></td>
                <td class="fw-semibold text-orange">₹${item.price.toFixed(2)}</td>
                <td>${item.tax_percentage}%</td>
                <td>
                    <span class="badge rounded-pill ${item.available ? 'bg-success' : 'bg-secondary'} px-3">
                        ${item.available ? '✓ Available' : '✕ Disabled'}
                    </span>
                </td>
                <td class="text-center pe-4">
                    <div class="d-flex gap-2 justify-content-center">
                        <button class="btn btn-sm btn-outline-primary rounded-3" onclick="openEditModal(${item.id})" title="Edit">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm ${item.available ? 'btn-outline-secondary' : 'btn-outline-success'} rounded-3"
                                onclick="toggleAvailability(${item.id}, ${!item.available})" title="${item.available ? 'Disable' : 'Enable'}">
                            <i class="bi bi-${item.available ? 'eye-slash' : 'eye'}"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger rounded-3" onclick="openDeleteModal(${item.id}, '${item.name.replace(/'/g,"\\'")}')">
                            <i class="bi bi-trash3"></i>
                        </button>
                    </div>
                </td>
            </tr>`).join('');
        })
        .catch(() => showToast('Failed to load menu', 'error'));
}

function openAddModal() {
    document.getElementById('modalTitle').textContent = 'Add Menu Item';
    document.getElementById('editItemId').value = '';
    document.getElementById('itemName').value = '';
    document.getElementById('itemCategory').value = '';
    document.getElementById('itemDescription').value = '';
    document.getElementById('itemPrice').value = '';
    document.getElementById('itemTax').value = '5';
    document.getElementById('itemAvailable').value = 'true';
    document.getElementById('itemImageUrl').value = '';
    menuModal.show();
}

function openEditModal(id) {
    fetch(`/api/admin/menu?search=`)
        .then(r => r.json())
        .then(items => {
            const item = items.find(i => i.id === id);
            if (!item) return showToast('Item not found', 'error');
            document.getElementById('modalTitle').textContent = 'Edit Menu Item';
            document.getElementById('editItemId').value = item.id;
            document.getElementById('itemName').value = item.name;
            document.getElementById('itemCategory').value = item.category;
            document.getElementById('itemDescription').value = item.description || '';
            document.getElementById('itemPrice').value = item.price;
            document.getElementById('itemTax').value = item.tax_percentage;
            document.getElementById('itemAvailable').value = item.available.toString();
            document.getElementById('itemImageUrl').value = item.image_url || '';
            menuModal.show();
        });
}

function saveItem() {
    const id = document.getElementById('editItemId').value;
    const name = document.getElementById('itemName').value.trim();
    const category = document.getElementById('itemCategory').value;
    const price = document.getElementById('itemPrice').value;

    if (!name || !category || !price) {
        showToast('Name, category and price are required', 'error');
        return;
    }

    const payload = {
        name,
        category,
        description: document.getElementById('itemDescription').value,
        price: parseFloat(price),
        tax_percentage: parseFloat(document.getElementById('itemTax').value) || 5,
        available: document.getElementById('itemAvailable').value === 'true',
        image_url: document.getElementById('itemImageUrl').value
    };

    const url = id ? `/api/admin/menu/${id}` : '/api/admin/menu';
    const method = id ? 'PUT' : 'POST';

    fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        .then(r => r.json())
        .then(data => {
            if (data.error) throw new Error(data.error);
            showToast(id ? 'Item updated!' : 'Item added!', 'success');
            menuModal.hide();
            loadAdminMenu();
        })
        .catch(err => showToast(err.message, 'error'));
}

function toggleAvailability(id, newVal) {
    fetch(`/api/admin/menu/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: newVal })
    })
        .then(r => r.json())
        .then(data => {
            if (data.error) throw new Error(data.error);
            showToast(`Item ${newVal ? 'enabled' : 'disabled'}`, 'success');
            loadAdminMenu();
        })
        .catch(err => showToast(err.message, 'error'));
}

function openDeleteModal(id, name) {
    deleteTargetId = id;
    document.getElementById('deleteItemName').textContent = `"${name}" will be permanently removed.`;
    deleteModal.show();
}

function confirmDelete() {
    if (!deleteTargetId) return;
    fetch(`/api/admin/menu/${deleteTargetId}`, { method: 'DELETE' })
        .then(r => r.json())
        .then(data => {
            if (data.error) throw new Error(data.error);
            showToast('Item deleted', 'success');
            deleteModal.hide();
            loadAdminMenu();
        })
        .catch(err => showToast(err.message, 'error'));
}

document.addEventListener('DOMContentLoaded', () => {
    menuModal = new bootstrap.Modal(document.getElementById('menuModal'));
    deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    loadAdminMenu();
});
