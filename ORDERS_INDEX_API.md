# Orders Index API

## Endpoint

```http
GET /api/v1/orders
Authorization: Bearer <sanctum-token>
Accept: application/json
```

Returns all orders in paginated form, newest first. The endpoint is protected by `auth:sanctum` and the existing API throttle. Super administrators, branch managers, and cashiers may access it.

## Query parameters

All parameters are optional:

| Parameter | Type | Description |
|---|---|---|
| `status` | string | Filter by `cooking`, `cooked`, `void`, or `draft`. |
| `payment_status` | string | Filter by `paid` or `pay_later`. |
| `order_type` | string | Filter by `dine_in` or `take_out`. |
| `order_number` | integer | Return one specific order number. |
| `per_page` | integer | Results per page, from `1` to `100`. Defaults to `25`. |
| `page` | integer | Pagination page number. |

Example:

```http
GET /api/v1/orders?status=void&per_page=20&page=1
```

## Successful response

Status: `200 OK`

The response uses Laravel pagination:

```json
{
  "data": [
    {
      "id": 45,
      "order_number": 103,
      "cart_id": "8b8c4c45-7bd2-4d86-9a8d-123456789abc",
      "item_count": 2,
      "order_type": "dine_in",
      "payment_method": "cash",
      "payment_status": "paid",
      "status": "void",
      "total_amount": 200,
      "void_reason": "CashierEncodingError",
      "payment_intent_id": null,
      "payment_qr_url": null,
      "order_items": [
        {
          "name": "Adobong Baka",
          "quantity": 1,
          "modifiers": [
            {
              "name": "Extra Rice",
              "quantity": 1
            }
          ]
        }
      ],
      "created_at": "2026-10-17T17:41:33.000000Z",
      "updated_at": "2026-10-17T17:45:10.000000Z"
    }
  ],
  "current_page": 1,
  "from": 1,
  "last_page": 1,
  "per_page": 25,
  "to": 1,
  "total": 1,
  "next_page_url": null,
  "prev_page_url": null
}
```

The actual Laravel pagination response also includes `first_page_url`, `last_page_url`, `path`, and `links`.

## Response fields

| Field | Type | Description |
|---|---|---|
| `id` | integer | Internal order ID. |
| `order_number` | integer | Human-readable unique order number. |
| `cart_id` | string | Checkout cart UUID associated with the order. |
| `item_count` | integer or `null` | Item count stored on the order, when available. |
| `order_type` | string or `null` | `dine_in` or `take_out`. |
| `payment_method` | string or `null` | Payment method used during checkout. |
| `payment_status` | string or `null` | `paid` or `pay_later`. |
| `status` | string or `null` | `cooking`, `cooked`, `void`, or `draft`. |
| `total_amount` | number or `null` | Total order amount. |
| `void_reason` | string or `null` | `VoidReasonEnum` case name, only for voided orders. |
| `payment_intent_id` | string or `null` | External payment intent identifier, if available. |
| `payment_qr_url` | string or `null` | Payment QR URL, if available. |
| `order_items` | array | Normalized order item rows returned in frontend-friendly form. |
| `order_items[].name` | string | Menu name snapshot at checkout. |
| `order_items[].quantity` | integer | Ordered quantity. |
| `order_items[].modifiers` | array | Selected modifier snapshots. |
| `order_items[].modifiers[].name` | string or `null` | Modifier name snapshot at checkout. |
| `order_items[].modifiers[].quantity` | integer | Modifier quantity. |
| `created_at` | string | ISO-8601 creation timestamp. |
| `updated_at` | string | ISO-8601 last-update timestamp. |

## Errors

- `401 Unauthenticated`: no valid Sanctum token was supplied.
- `403 Forbidden`: authenticated user is not allowed to view orders.
- `422 Unprocessable Entity`: one or more query parameters are invalid.

No frontend request changes are required beyond calling the new endpoint. The item data is read from normalized tables internally.
