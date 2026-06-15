from flask import Blueprint, request, jsonify
from models import db
from models.menu_item import MenuItem
from models.order import Order
from services.order_service import place_order, update_order_status, get_kitchen_orders

api_bp = Blueprint('api', __name__, url_prefix='/api')


# ── Menu ──────────────────────────────────────────────────────────────────────

@api_bp.route('/menu', methods=['GET'])
def get_menu():
    category = request.args.get('category')
    search = request.args.get('search', '').strip()
    query = MenuItem.query
    if category and category != 'All':
        query = query.filter_by(category=category)
    if search:
        query = query.filter(MenuItem.name.ilike(f'%{search}%'))
    items = query.order_by(MenuItem.category, MenuItem.name).all()
    return jsonify([i.to_dict() for i in items])


# ── Cart / Order Placement ─────────────────────────────────────────────────────

@api_bp.route('/place-order', methods=['POST'])
def api_place_order():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    table_number = data.get('table_number')
    cart_items = data.get('cart_items', [])

    if not table_number:
        return jsonify({'error': 'Table number is required'}), 400
    if not cart_items:
        return jsonify({'error': 'Cart is empty'}), 400

    order, error = place_order(int(table_number), cart_items)
    if error:
        return jsonify({'error': error}), 400

    return jsonify({'success': True, 'order': order.to_dict()}), 201


@api_bp.route('/cart/add', methods=['POST'])
def cart_add():
    # Cart is managed client-side; this endpoint validates an item
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    item_id = data.get('menu_item_id')
    item = MenuItem.query.get(item_id)
    if not item:
        return jsonify({'error': 'Item not found'}), 404
    if not item.available:
        return jsonify({'error': f'{item.name} is currently unavailable'}), 400
    return jsonify({'success': True, 'item': item.to_dict()})


@api_bp.route('/cart/update', methods=['POST'])
def cart_update():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    qty = data.get('quantity', 0)
    if qty < 0:
        return jsonify({'error': 'Quantity cannot be negative'}), 400
    return jsonify({'success': True, 'quantity': qty})


# ── Order Status ──────────────────────────────────────────────────────────────

@api_bp.route('/order/<int:order_id>', methods=['GET'])
def get_order(order_id):
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    return jsonify(order.to_dict())


@api_bp.route('/order/start-cooking', methods=['PUT'])
def start_cooking():
    data = request.get_json(silent=True)
    order_id = data.get('order_id') if data else None
    if not order_id:
        return jsonify({'error': 'order_id required'}), 400
    order, error = update_order_status(order_id, 'Cooking')
    if error:
        return jsonify({'error': error}), 400
    return jsonify({'success': True, 'order': order.to_dict()})


@api_bp.route('/order/served', methods=['PUT'])
def mark_served():
    data = request.get_json(silent=True)
    order_id = data.get('order_id') if data else None
    if not order_id:
        return jsonify({'error': 'order_id required'}), 400
    order, error = update_order_status(order_id, 'Served')
    if error:
        return jsonify({'error': error}), 400
    return jsonify({'success': True, 'order': order.to_dict()})


# ── Kitchen ───────────────────────────────────────────────────────────────────

@api_bp.route('/kitchen/orders', methods=['GET'])
def kitchen_orders():
    orders = get_kitchen_orders()
    return jsonify([o.to_dict() for o in orders])


# ── Admin Menu CRUD ───────────────────────────────────────────────────────────

@api_bp.route('/admin/menu', methods=['GET'])
def admin_get_menu():
    search = request.args.get('search', '').strip()
    category = request.args.get('category')
    query = MenuItem.query
    if search:
        query = query.filter(MenuItem.name.ilike(f'%{search}%'))
    if category and category != 'All':
        query = query.filter_by(category=category)
    items = query.order_by(MenuItem.category, MenuItem.name).all()
    return jsonify([i.to_dict() for i in items])


@api_bp.route('/admin/menu', methods=['POST'])
def admin_add_menu():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    required = ['name', 'category', 'price']
    for field in required:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400

    try:
        price = float(data['price'])
        tax = float(data.get('tax_percentage', 5.0))
        if price < 0 or tax < 0 or tax > 100:
            raise ValueError
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid price or tax value'}), 400

    item = MenuItem(
        name=data['name'].strip(),
        category=data['category'],
        description=data.get('description', ''),
        price=price,
        tax_percentage=tax,
        available=data.get('available', True),
        image_url=data.get('image_url', '')
    )
    db.session.add(item)
    db.session.commit()
    return jsonify({'success': True, 'item': item.to_dict()}), 201


@api_bp.route('/admin/menu/<int:item_id>', methods=['PUT'])
def admin_update_menu(item_id):
    item = MenuItem.query.get(item_id)
    if not item:
        return jsonify({'error': 'Item not found'}), 404

    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    try:
        if 'name' in data:
            item.name = data['name'].strip()
        if 'category' in data:
            item.category = data['category']
        if 'description' in data:
            item.description = data['description']
        if 'price' in data:
            p = float(data['price'])
            if p < 0:
                raise ValueError
            item.price = p
        if 'tax_percentage' in data:
            t = float(data['tax_percentage'])
            if t < 0 or t > 100:
                raise ValueError
            item.tax_percentage = t
        if 'available' in data:
            item.available = bool(data['available'])
        if 'image_url' in data:
            item.image_url = data['image_url']
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid numeric value'}), 400

    db.session.commit()
    return jsonify({'success': True, 'item': item.to_dict()})


@api_bp.route('/admin/menu/<int:item_id>', methods=['DELETE'])
def admin_delete_menu(item_id):
    item = MenuItem.query.get(item_id)
    if not item:
        return jsonify({'error': 'Item not found'}), 404
    db.session.delete(item)
    db.session.commit()
    return jsonify({'success': True, 'message': f'{item.name} deleted'})
