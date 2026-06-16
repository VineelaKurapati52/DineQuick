def calculate_bill(cart_items, menu_items_map):
    """
    cart_items: list of {menu_item_id, quantity}
    menu_items_map: dict of id -> MenuItem
    Returns: subtotal, tax_amount, grand_total
    """
    subtotal = 0.0
    tax_amount = 0.0

    for item in cart_items:
        menu_item = menu_items_map.get(item['menu_item_id'])
        if not menu_item:
            continue
        line_price = menu_item.price * item['quantity']
        line_tax = line_price * (menu_item.tax_percentage / 100)
        subtotal += line_price
        tax_amount += line_tax

    grand_total = subtotal + tax_amount
    return round(subtotal, 2), round(tax_amount, 2), round(grand_total, 2)
