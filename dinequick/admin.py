from app import app
from models import db
from models.user import User

with app.app_context():

    admin = User.query.filter_by(username="admin").first()

    if not admin:
        admin = User(
            username="admin",
            email="admin@dinequick.com",
            role="admin"
        )

        admin.set_password("admin123")

        db.session.add(admin)
        db.session.commit()

        print("Admin Created")

    else:
        print("Admin Already Exists")