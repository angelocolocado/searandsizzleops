# Menu Profit Breakdown — Frontend Handoff

This document describes how the frontend should display the menu price, ingredient costs, modifier profit, and total profit from `GET /api/v1/menus/{menu}`.

The existing JSON response structure must not be changed.

## Existing response fields

The relevant fields are:

```json
{
  "selling_price": 100,
  "profit": {
    "menu": 50,
    "modifiers": [
      {
        "name": "Plain Rice",
        "selling_price": 20,
        "ingredient_cost": 5,
        "profit": 15
      }
    ],
    "total": 65
  },
  "ingredient_costs": 55,
  "costs_breakdown": [
    {
      "item_name": "Beef",
      "quantity_served": "100.00",
      "unit_served": "g",
      "cost": 50
    },
    {
      "item_name": "Plain Rice",
      "quantity_served": 1,
      "unit_served": "modifier",
      "cost": 5
    }
  ]
}
```

## Meaning of each calculation

### Selling price

`selling_price` is the price of the menu itself. Modifier selling prices are not included in this field.

```text
Menu selling price = ₱100.00
```

### Total ingredient cost

`ingredient_costs` is the total cost of all ingredients used by the primary recipe plus all assigned modifier ingredient costs.

```text
Primary recipe ingredient cost = ₱50.00
Modifier ingredient cost = ₱5.00
Total ingredient cost = ₱50.00 + ₱5.00 = ₱55.00
```

### Menu profit

`profit.menu` is the profit of the menu's primary recipe only. It excludes modifier revenue and modifier costs because those are displayed separately.

```text
Menu profit = menu selling price - primary recipe ingredient cost
Menu profit = ₱100.00 - ₱50.00 = ₱50.00
```

The primary recipe ingredient cost can be derived from `costs_breakdown` by summing entries whose `unit_served` is not `modifier`.

### Modifier profit

Each recipe-backed modifier has its own selling price and ingredient cost.

```text
Modifier profit = modifier selling price - modifier ingredient cost
Modifier profit = ₱20.00 - ₱5.00 = ₱15.00
```

Display every item in `profit.modifiers` as a separate modifier profit section.

### Total profit

`profit.total` is the complete profit for the menu and all assigned recipe-backed modifiers.

```text
Total profit = menu profit + all modifier profits
Total profit = ₱50.00 + ₱15.00 = ₱65.00
```

Equivalent revenue-and-cost calculation:

```text
Total revenue = menu selling price + modifier selling prices
Total revenue = ₱100.00 + ₱20.00 = ₱120.00

Total cost = primary recipe ingredient cost + modifier ingredient costs
Total cost = ₱50.00 + ₱5.00 = ₱55.00

Total profit = total revenue - total cost
Total profit = ₱120.00 - ₱55.00 = ₱65.00
```

## Recommended UI design

Use a price and cost breakdown card with the following order:

```text
Selling price                                      ₱100.00
Ingredient cost                                    ₱55.00
Menu profit                                        ₱50.00

Plain Rice profit                                  ₱15.00
Selling price ₱20.00 - ingredient cost ₱5.00

Total profit                                        ₱65.00
```

Below the profit summary, display the ingredient breakdown:

```text
INGREDIENT BREAKDOWN

Beef
100 g served                                        ₱50.00

Plain Rice
1 modifier served                                    ₱5.00
```

## Display rules

- Format all monetary values as currency with two decimal places.
- Use `selling_price` for the menu selling price.
- Use `ingredient_costs` for the combined ingredient cost shown in the summary.
- Use `profit.menu` for the primary menu profit.
- Use `profit.modifiers[].profit` for each modifier profit.
- Use `profit.total` for the emphasized final total.
- Use `profit.modifiers[].selling_price` and `profit.modifiers[].ingredient_cost` for the modifier calculation subtitle.
- Use `costs_breakdown` for the ingredient list.
- Treat a `costs_breakdown` item with `unit_served: "modifier"` as a modifier cost item.
- Do not add modifier selling prices to the top-level `selling_price`; they belong only in the profit calculation.
- Do not calculate the final total by summing `selling_price - ingredient_costs`; that would omit modifier revenue.
- Prefer the backend-provided `profit` values instead of recalculating displayed profit values on the frontend.

## Handling menus without modifiers

When `profit.modifiers` is empty:

```text
Menu profit = Total profit
```

The modifier section should be hidden, and the total profit should still use `profit.total`.

## Important distinction

`ingredient_costs` is the combined cost of the primary recipe and modifiers, while `profit.menu` is intentionally based only on the primary recipe. This is why the example contains:

```text
ingredient_costs = ₱55.00
profit.menu = ₱50.00
profit.total = ₱65.00
```

This is expected because the modifier has a separate selling price and a separate profit line.
