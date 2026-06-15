def validate_cart(cart_items, menu_items_map):
    """
    Validates cart items against available menu items.
    Returns (is_valid, errors)
    """
    errors = []

    if not cart_items:
        return False, ['Cart is empty']

    for item in cart_items:
        mid = item.get('menu_item_id')
        qty = item.get('quantity', 0)

        if not mid:
            errors.append('Invalid item in cart')
            continue

        menu_item = menu_items_map.get(mid)
        if not menu_item:
            errors.append(f'Menu item {mid} not found')
            continue

        if not menu_item.available:
            errors.append(f'{menu_item.name} is currently unavailable')
            continue

        if qty <= 0:
            errors.append(f'Quantity for {menu_item.name} must be at least 1')

    return len(errors) == 0, errors


def merge_cart_items(cart_items):
    """Merge duplicate menu_item_ids by summing quantities."""
    merged = {}
    for item in cart_items:
        mid = item['menu_item_id']
        if mid in merged:
            merged[mid]['quantity'] += item['quantity']
        else:
            merged[mid] = dict(item)
    return list(merged.values())
