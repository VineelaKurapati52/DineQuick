from flask import Blueprint, render_template, session, redirect

kitchen_bp = Blueprint('kitchen', __name__)

@kitchen_bp.route('/kitchen')
def dashboard():

    if "user_id" not in session:
        return redirect("/login")

    return render_template('kitchen_dashboard.html')
