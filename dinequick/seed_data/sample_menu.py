import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app import create_app
from models import db
from models.menu_item import MenuItem

MENU_ITEMS = [
    # Starters
    {
        'name': 'Crispy Spring Rolls',
        'category': 'Starters',
        'description': 'Golden fried rolls stuffed with spiced vegetables and glass noodles, served with sweet chili dip.',
        'price': 149.00,
        'tax_percentage': 5.0,
        'available': True,
        'image_url': 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400&q=80'
    },
    {
        'name': 'Paneer Tikka',
        'category': 'Starters',
        'description': 'Smoky grilled cottage cheese cubes marinated in spiced yogurt, served with mint chutney.',
        'price': 199.00,
        'tax_percentage': 5.0,
        'available': True,
        'image_url': 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&q=80'
    },
    {
        'name': 'Chicken Wings',
        'category': 'Starters',
        'description': 'Crispy buffalo chicken wings tossed in tangy hot sauce, served with blue cheese dip.',
        'price': 249.00,
        'tax_percentage': 5.0,
        'available': True,
        'image_url': 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400&q=80'
    },
    {
        'name': 'Veg Seekh Kebab',
        'category': 'Starters',
        'description': 'Skewered minced vegetable kebabs seasoned with aromatic herbs, chargrilled to perfection.',
        'price': 169.00,
        'tax_percentage': 5.0,
        'available': True,
        'image_url': 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&q=80'
    },
    # Main Course
    {
        'name': 'Butter Chicken',
        'category': 'Main Course',
        'description': 'Tender chicken cooked in a rich, creamy tomato-based sauce with aromatic spices.',
        'price': 320.00,
        'tax_percentage': 5.0,
        'available': True,
        'image_url': 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80'
    },
    {
        'name': 'Dal Makhani',
        'category': 'Main Course',
        'description': 'Slow-cooked black lentils simmered overnight with butter, cream, and spices.',
        'price': 220.00,
        'tax_percentage': 5.0,
        'available': True,
        'image_url': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80'
    },
    {
        'name': 'Veg Biryani',
        'category': 'Main Course',
        'description': 'Fragrant basmati rice layered with spiced seasonal vegetables and caramelized onions.',
        'price': 260.00,
        'tax_percentage': 5.0,
        'available': True,
        'image_url': 'https://images.unsplash.com/photo-1563379091339-03246963d651?w=400&q=80'
    },
    {
        'name': 'Grilled Salmon',
        'category': 'Main Course',
        'description': 'Atlantic salmon fillet grilled with lemon butter sauce, served with mashed potatoes.',
        'price': 480.00,
        'tax_percentage': 5.0,
        'available': True,
        'image_url': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&q=80'
    },
    {
        'name': 'Paneer Butter Masala',
        'category': 'Main Course',
        'description': 'Cottage cheese cubes in a velvety tomato-cashew gravy, mildly spiced and aromatic.',
        'price': 280.00,
        'tax_percentage': 5.0,
        'available': False,
        'image_url': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80'
    },
    # Desserts
    {
        'name': 'Gulab Jamun',
        'category': 'Desserts',
        'description': 'Soft milk-solid dumplings soaked in rose-flavored sugar syrup, served warm.',
        'price': 99.00,
        'tax_percentage': 5.0,
        'available': True,
        'image_url': 'https://images.unsplash.com/photo-1601303516534-bf4c1f2f7e15?w=400&q=80'
    },
    {
        'name': 'Chocolate Lava Cake',
        'category': 'Desserts',
        'description': 'Warm chocolate cake with a molten center, served with a scoop of vanilla ice cream.',
        'price': 180.00,
        'tax_percentage': 5.0,
        'available': True,
        'image_url': 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&q=80'
    },
    {
        'name': 'Mango Kulfi',
        'category': 'Desserts',
        'description': 'Traditional Indian frozen dessert with real Alphonso mango pulp and saffron.',
        'price': 120.00,
        'tax_percentage': 5.0,
        'available': True,
        'image_url': 'https://images.unsplash.com/photo-1633578823-d476c50b37e7?w=400&q=80'
    },
    # Drinks
    {
        'name': 'Fresh Lime Soda',
        'category': 'Drinks',
        'description': 'Chilled sparkling water with freshly squeezed lime juice, mint, and a pinch of salt.',
        'price': 60.00,
        'tax_percentage': 5.0,
        'available': True,
        'image_url': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&q=80'
    },
    {
        'name': 'Mango Lassi',
        'category': 'Drinks',
        'description': 'Thick and creamy yogurt blended with sweet Alphonso mangoes and a hint of cardamom.',
        'price': 90.00,
        'tax_percentage': 5.0,
        'available': True,
        'image_url': 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400&q=80'
    },
    {
        'name': 'Cold Coffee',
        'category': 'Drinks',
        'description': 'Rich espresso blended with cold milk and sugar, topped with whipped cream.',
        'price': 110.00,
        'tax_percentage': 5.0,
        'available': True,
        'image_url': 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80'
    },
]


def seed():
    app = create_app()
    with app.app_context():
        existing = MenuItem.query.count()
        if existing > 0:
            print(f"Database already has {existing} items. Skipping seed.")
            return

        for data in MENU_ITEMS:
            item = MenuItem(**data)
            db.session.add(item)

        db.session.commit()
        print(f"✅ Seeded {len(MENU_ITEMS)} menu items successfully!")


if __name__ == '__main__':
    seed()
