from models import db

class MenuItem(db.Model):
    __tablename__ = 'menu_items'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Float, nullable=False)
    tax_percentage = db.Column(db.Float, default=5.0)
    available = db.Column(db.Boolean, default=True)
    image_url = db.Column(db.String(300), nullable=True)

    order_items = db.relationship('OrderItem', backref='menu_item', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'description': self.description,
            'price': self.price,
            'tax_percentage': self.tax_percentage,
            'available': self.available,
            'image_url': self.image_url or '/static/images/default_food.svg'
        }
