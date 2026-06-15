from models import db
from models.order import Order
from models.order_item import OrderItem
from models.menu_item import MenuItem
from services.billing_service import calculate_bill
from services.cart_service import validate_cart, merge_cart_items


def place_order(table_number, cart_items):
    """Creates a new order from cart data. Returns (order, error)."""
    try:
        cart_items = merge_cart_items(cart_items)
        ids = [item['menu_item_id'] for item in cart_items]
        menu_items = MenuItem.query.filter(MenuItem.id.in_(ids)).all()
        menu_map = {m.id: m for m in menu_items}

        is_valid, errors = validate_cart(cart_items, menu_map)
        if not is_valid:
            return None, '; '.join(errors)

        subtotal, tax_amount, grand_total = calculate_bill(cart_items, menu_map)

        order = Order(
            table_number=table_number,
            status='Placed',
            subtotal=subtotal,
            tax_amount=tax_amount,
            grand_total=grand_total
        )
        db.session.add(order)
        db.session.flush()

        for item in cart_items:
            menu_item = menu_map[item['menu_item_id']]
            order_item = OrderItem(
                order_id=order.id,
                menu_item_id=item['menu_item_id'],
                quantity=item['quantity'],
                price=menu_item.price
            )
            db.session.add(order_item)

        db.session.commit()
        return order, None

    except Exception as e:
        db.session.rollback()
        return None, str(e)


def update_order_status(order_id, new_status):
    """Transitions order to next valid status. Returns (order, error)."""
    try:
        order = Order.query.get(order_id)
        if not order:
            return None, 'Order not found'

        if not order.can_transition_to(new_status):
            return None, f'Cannot transition from {order.status} to {new_status}'

        order.status = new_status
        db.session.commit()
        return order, None

    except Exception as e:
        db.session.rollback()
        return None, str(e)


def get_kitchen_orders():
    """Returns all active (non-served) orders."""
    return Order.query.filter(Order.status != 'Served').order_by(Order.created_at.asc()).all()
