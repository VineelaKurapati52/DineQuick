# DineQuick – Contactless QR Table Ordering App

## Commands to Run

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt

python seed_data/sample_menu.py

python app.py
```

Then open: **http://localhost:5000**

---

## Project Overview

DineQuick is a contactless restaurant ordering platform. Customers scan a table QR code, browse the digital menu, add items to cart, place an order, and track it in real-time. Kitchen staff manage orders via a dark-theme dashboard. Admins manage the full menu via a CRUD panel.

---

## Features

- **Customer**: QR-based table ordering, category/search filtering, cart with live bill, order tracking
- **Kitchen**: Real-time active order cards with Start Cooking / Mark Served buttons, auto-refresh
- **Admin**: Full menu CRUD — add, edit, delete, enable/disable items, adjust price & tax

---

## Architecture

```
Browser (Bootstrap 5 + Vanilla JS)
       ↕  fetch() / JSON
Flask Routes → Services → SQLAlchemy → SQLite
```

- Routes handle HTTP, delegate logic to Services
- Services contain business rules (billing, validation, state machine)
- Models are pure SQLAlchemy ORM classes

---

## Folder Structure

```
dinequick/
├── app.py                  # Flask app factory, blueprint registration
├── config.py               # Config (DB URI, secret key)
├── requirements.txt
├── README.md
├── instance/
│   └── restaurant.db       # SQLite database (auto-created)
├── models/
│   ├── __init__.py         # db = SQLAlchemy()
│   ├── menu_item.py
│   ├── order.py
│   └── order_item.py
├── routes/
│   ├── customer_routes.py  # /, /table/<n>, /cart/<n>, /order/<id>
│   ├── kitchen_routes.py   # /kitchen
│   ├── admin_routes.py     # /admin
│   └── api_routes.py       # /api/* endpoints
├── services/
│   ├── billing_service.py  # Subtotal/tax/grand-total calculation
│   ├── cart_service.py     # Validation, deduplication
│   └── order_service.py    # place_order, update_status, get_kitchen_orders
├── templates/
│   ├── base.html
│   ├── index.html
│   ├── menu.html
│   ├── cart.html
│   ├── order_status.html
│   ├── kitchen_dashboard.html
│   └── admin_dashboard.html
├── static/
│   ├── css/style.css
│   ├── js/{menu,cart,kitchen,admin}.js
│   └── images/default_food.svg
└── seed_data/
    └── sample_menu.py      # 15 menu items across 4 categories
```

---

## Database Models

| Model | Fields |
|-------|--------|
| MenuItem | id, name, category, description, price, tax_percentage, available, image_url |
| Order | id, table_number, status, subtotal, tax_amount, grand_total, created_at |
| OrderItem | id, order_id, menu_item_id, quantity, price |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/menu | All menu items (filterable by category/search) |
| GET | /api/order/`<id>` | Order details |
| POST | /api/cart/add | Validate item before adding |
| POST | /api/cart/update | Validate quantity update |
| POST | /api/place-order | Create order from cart |
| PUT | /api/order/start-cooking | Placed → Cooking |
| PUT | /api/order/served | Cooking → Served |
| GET | /api/kitchen/orders | Active orders for kitchen |
| GET | /api/admin/menu | Admin menu list |
| POST | /api/admin/menu | Add menu item |
| PUT | /api/admin/menu/`<id>` | Update menu item |
| DELETE | /api/admin/menu/`<id>` | Delete menu item |

---

## Customer Workflow

1. Go to `/table/1` (or scan QR)
2. Browse menu by category / search
3. Tap a card or Add button → item goes to cart
4. Tap Cart → review items, see live bill
5. Tap Place Order → redirected to order tracking page
6. Page auto-refreshes every 5 seconds showing: Placed → Cooking → Served

---

## Kitchen Workflow

1. Open `/kitchen` on any screen
2. See all active order cards grouped by table
3. Click **Start Cooking** to move Placed → Cooking
4. Click **Mark Served** to move Cooking → Served
5. Served orders disappear; dashboard auto-refreshes every 5 seconds

---

## Admin Workflow

1. Open `/admin`
2. Search / filter menu items
3. Click ✏️ to edit name, price, category, tax, availability, image
4. Click 👁 to toggle availability
5. Click 🗑 to delete
6. Click **+ Add Menu Item** to create a new entry

---

## Order State Machine

```
Placed → Cooking → Served
```
State skipping is blocked at the service layer.

---

## Future Improvements

- JWT authentication for kitchen/admin
- QR code image generation per table
- Push notifications (WebSocket)
- Order history and analytics dashboard
- Payment gateway integration
- Multi-branch support
