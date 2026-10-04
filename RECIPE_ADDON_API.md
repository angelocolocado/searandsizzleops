# Recipe Add-on API

Base URL: `/api/v1`

## Recipe endpoints

### `POST /recipes`

Creates a recipe. `category` identifies the recipe category. When the category is `Addon` (case-insensitive), `selling_price` is required.

```json
{
  "recipe_name": "Plain Rice",
  "category": "Addon",
  "yield_quantity": 1,
  "yield_unit": "serving",
  "selling_price": 15,
  "notes": "Optional notes"
}
```

Validation:

| Field | Rules |
|---|---|
| `recipe_name` | Required, unique, 2–50 characters. |
| `category` | Required and must exist as a recipe category. |
| `yield_quantity` | Required integer. |
| `yield_unit` | Required string, 2–20 characters. |
| `selling_price` | Nullable numeric amount with up to 2 decimals; required when `category` is `Addon`. |
| `notes` | Optional. |
| `status` | Optional valid `RecipeStatusEnum` value. |

### `GET /recipes`

Lists recipes. Each recipe includes `selling_price`, which is `null` for non-addon recipes without a selling price.

### `PUT/PATCH /recipes/{recipe}`

Updates a recipe using the same validation rules. If the updated category is `Addon`, `selling_price` must be supplied.

### `GET /recipe/{recipe}`

Returns a recipe schema, including `selling_price` and its recipe ingredients.

## Recipe ingredient costing

Ingredient `cost_per_base` uses the following rules:

- For `pcs`: `unit_cost / quantity`. Example: 20 pieces costing 200 gives 10 per piece.
- For mass or volume units: `unit_cost / UOM factor`. Example: 50 per kg gives 0.05 per gram.

Recipe ingredient cost is:

```text
ingredient.cost_per_base * recipe_ingredient.converted_qty_base_unit
```

Therefore, 100 grams from a 50-per-kg ingredient costs `0.05 * 100 = 5.00`.

The same calculation is used by menu costing and recipe-backed modifier costing.

## Changes in this update

- Added nullable `selling_price` to recipes.
- Added `selling_price` to recipe create/update validation and recipe responses.
- Made `selling_price` required when the recipe category is `Addon`.
- Corrected non-piece ingredient costing to use cost per selected unit and retained per-piece costing as total cost divided by piece quantity.
- Added regression documentation for the 100-gram costing example.
