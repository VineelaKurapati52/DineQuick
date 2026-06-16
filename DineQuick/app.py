
from flask import Flask
from config import Config

from models import db

from routes.customer_routes import customer_bp
from routes.kitchen_routes import kitchen_bp
from routes.admin_routes import admin_bp
from routes.api_routes import api_bp
from routes.auth_routes import auth_bp

import os


def create_app():

    app = Flask(__name__)

    app.config.from_object(Config)

    app.secret_key = "dinequick-secret-key"

    os.makedirs(
        os.path.join(
            os.path.dirname(__file__),
            "instance"
        ),
        exist_ok=True
    )

    db.init_app(app)

    app.register_blueprint(
        customer_bp
    )

    app.register_blueprint(
        kitchen_bp
    )

    app.register_blueprint(
        admin_bp
    )

    app.register_blueprint(
        api_bp
    )

    app.register_blueprint(
        auth_bp
    )

    with app.app_context():

        db.create_all()

    return app


app = create_app()

if __name__ == "__main__":

    app.run(
        debug=True,
        port=5000
    )