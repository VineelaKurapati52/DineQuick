from flask import Blueprint, render_template, abort
from models.menu_item import MenuItem
from models.order import Order

customer_bp = Blueprint('customer', __name__)


@customer_bp.route('/')
def index():
    return render_template('index.html')


@customer_bp.route('/table/<int:table_number>')
def menu(table_number):
    if table_number < 1 or table_number > 50:
        abort(404)
    categories = ['Starters', 'Main Course', 'Desserts', 'Drinks']
    return render_template('menu.html', table_number=table_number, categories=categories)


@customer_bp.route('/cart/<int:table_number>')
def cart(table_number):
    return render_template('cart.html', table_number=table_number)


@customer_bp.route('/order/<int:order_id>')
def order_status(order_id):
    order = Order.query.get_or_404(order_id)
    return render_template('order_status.html', order=order)
@customer_bp.route("/booking")
def booking_page():
    return render_template(
        "booking.html"
    )
@customer_bp.route("/delivery")
def delivery_page():
    order = Order.query.order_by(Order.id.desc()).first()

    return render_template(
        "delivery_tracking.html",
         order=order
    )
