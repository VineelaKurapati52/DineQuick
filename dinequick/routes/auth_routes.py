
from flask import Blueprint
from flask import request
from flask import jsonify
from flask import session
from flask import render_template
from flask import redirect

from models import db
from models.user import User
from flask import render_template
from models.order import Order

auth_bp = Blueprint(
    "auth",
    __name__
)


@auth_bp.route("/login")
def login_page():
    return render_template(
        "login.html"
    )

@auth_bp.route("/kitchen-login")
def kitchen_login():
    return render_template(
        "kitchen_login.html"
    )


@auth_bp.route("/register")
def register_page():
    return render_template(
        "register.html"
    )


@auth_bp.route(
    "/api/register",
    methods=["POST"]
)
def register():

    data = request.get_json()

    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    existing = User.query.filter(
        (User.username == username)
        |
        (User.email == email)
    ).first()

    if existing:

        return jsonify({
            "error": "User already exists"
        }), 400

    user = User(
        username=username,
        email=email
    )

    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    return jsonify({
        "message":
        "Registration successful"
    })


@auth_bp.route(
    "/api/login",
    methods=["POST"]
)
def login():

    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    user = User.query.filter_by(
        username=username
    ).first()

    if not user:

        return jsonify({
            "error":
            "Invalid username"
        }), 401

    if not user.check_password(password):

        return jsonify({
            "error":
            "Invalid password"
        }), 401

    session["user_id"] = user.id
    session["username"] = user.username
    session["role"] = user.role

    return jsonify({
        "message":
        "Login successful",
        "user":
        user.to_dict()
    })


@auth_bp.route("/logout")
def logout():

    session.clear()

    return redirect("/login")

@auth_bp.route("/dashboard")
def dashboard():

    if "user_id" not in session:

        return redirect("/login")

    user = User.query.get(
        session["user_id"]
    )

    orders = Order.query.order_by(
        Order.id.desc()
    ).all()

    return render_template(
        "user_dashboard.html",
        user=user,
        orders=orders
    )