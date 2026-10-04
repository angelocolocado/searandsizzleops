# Units of Measure and Automatic Costing

## Supported units

The `App\Enum\Business\UOM` enum is the source of truth for supported units:

| Unit | Base-unit factor |
|---|---:|
| `pcs` | 1 |
| `g` | 1 |
| `kg` | 1000 |
| `lb` | 453.592 |
| `oz` | 28.3495 |
| `mL` | 1 |
| `L` | 1000 |
| `fl oz` | 29.5735 |

`pcs` is a count unit. One piece is one base unit and is never converted to mass or volume.

## Ingredient costing

Ingredient inventory stores:

- `quantity`: the amount purchased or stocked in the selected unit.
- `unit_cost`: the total cost for that stored quantity.
- `converted_base_unit`: `quantity * UOM factor`.
- `cost_per_base`: for `pcs`, `unit_cost / quantity`; for mass and volume units, `unit_cost / UOM factor`.

For example:

```text
unit_cost = 200
quantity = 20
unit = pcs
factor = 1
converted_base_unit = 20
cost_per_base = 200 / 20 = 10 per piece
```

For a 10 kg ingredient with a unit cost of 50 per kilogram:

```text
converted_base_unit = 10 * 1000 = 10000 grams
cost_per_base = 50 / 1000 = 0.05 per gram
```

`GET /api/v1/ingredient-stocks` includes `cost_per_base`. Frontends must use this field when displaying ingredient-backed modifier prices.

## Recipe and menu costing

Recipe ingredient quantities are converted using the recipe ingredient's selected unit. Cost is calculated as:

```text
ingredient.cost_per_base * recipe_ingredient.converted_qty_base_unit
```

This means a recipe using 3 pieces costs `3 * cost_per_base`, while a recipe using 100 grams costs `100 * cost_per_base`.

The same formula is used by:

- `MenuPriceCalculatorService`
- `MenuIngredientCostBreakdown`
- recipe-backed modifier costing

Modifier costs are included in menu ingredient cost and profit calculations.

## Validation

Ingredient and recipe-ingredient requests accept the enum-backed units, including `pcs`. Invalid units are rejected before persistence, and model casts now correctly hydrate `pcs` as `UOM::PIECE`.
