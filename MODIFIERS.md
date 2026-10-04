# Modifiers API

Base URL: `/api/v1`

Modifiers require a modifier category, a custom display `name`, and exactly one cost source:

- `ingredient_id`: inventory ingredient.
- `source_recipe_id`: recipe whose ingredients are used to calculate the modifier cost.

Modifiers are assigned to menus, not target recipes.

## `GET /modifiers`

Returns modifiers with their category, selected source, and calculated cost.

## `POST /modifiers`

Ingredient-backed example:

```json
{
  "category_id": 3,
  "name": "Plain Rice",
  "ingredient_id": 12
}
```

Recipe-backed example:

```json
{
  "category_id": 3,
  "name": "Cheese Sauce",
  "source_recipe_id": "01jsourcerecipe00000000001"
}
```

Validation:

| Field | Rules |
|---|---|
| `category_id` | Required modifier category ID. |
| `name` | Required, 2–255 characters, unique. |
| `ingredient_id` | Required when `source_recipe_id` is absent; must exist in `ingredients`. |
| `source_recipe_id` | Required when `ingredient_id` is absent; must exist in `recipes`. |
| `recipe_id`, `price`, `cost`, `description` | Not accepted. |

Only one source may be provided. The modifier cost is calculated automatically and cannot be supplied by the client.

## `GET /modifiers/{modifier}`, `PUT/PATCH /modifiers/{modifier}`, `DELETE /modifiers/{modifier}`

These endpoints show, update, or delete a modifier. Updates keep the same exactly-one-source validation.

## `GET /ingredient-stocks`

Ingredient responses include `cost_per_base`. The frontend must use `cost_per_base` when displaying an ingredient-backed modifier price.

For a 10 kg ingredient with a unit cost of 50 per kilogram:

```text
cost_per_base = 50 / 1000 = 0.05 per gram
100 grams in a source recipe = 0.05 * 100 = 5.00
```

For pieces:

```text
unit_cost = 200
quantity = 20
cost_per_base = 200 / 20 = 10 per piece
```

Recipe-backed modifier costs are included in menu ingredient costs, cost breakdowns, and profit calculations.
