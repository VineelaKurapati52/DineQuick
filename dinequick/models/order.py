from models import db
from datetime import datetime

class Order(db.Model):
    __tablename__ = 'orders'

    id = db.Column(db.Integer, primary_key=True)
    table_number = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(20), default='Placed')  # Placed, Cooking, Served
    subtotal = db.Column(db.Float, default=0.0)
    tax_amount = db.Column(db.Float, default=0.0)
    grand_total = db.Column(db.Float, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    items = db.relationship('OrderItem', backref='order', lazy=True, cascade='all, delete-orphan')

    VALID_TRANSITIONS = {
        'Placed': 'Cooking',
        'Cooking': 'Served',
        'Served': None
    }

    def can_transition_to(self, new_status):
        return self.VALID_TRANSITIONS.get(self.status) == new_status

    def to_dict(self):
        return {
            'id': self.id,
            'table_number': self.table_number,
            'status': self.status,
            'subtotal': round(self.subtotal, 2),
            'tax_amount': round(self.tax_amount, 2),
            'grand_total': round(self.grand_total, 2),
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'items': [item.to_dict() for item in self.items]
        }
