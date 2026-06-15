
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from models.user import User
from models.menu_item import MenuItem
from models.order import Order
from models.order_item import OrderItem

