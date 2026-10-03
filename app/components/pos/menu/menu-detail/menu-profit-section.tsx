import { useEffect, useState } from "react"
import { useFetcher } from "react-router"
import { Button } from "~/components/ui/button"
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from "~/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupInput } from "~/components/ui/input-group"

type ComponentProps = {
  menuId: string
  selling_price?: number | string | null
}

export function MenuSellingPriceSection({ menuId, selling_price }: ComponentProps) {
  const [value, setValue] = useState(selling_price === null || selling_price === undefined ? "" : String(selling_price))
  const [error, setError] = useState("")
  const fetcher = useFetcher()
  const isSubmitting = fetcher.state !== "idle"

  useEffect(() => {
    setValue(selling_price === null || selling_price === undefined ? "" : String(selling_price))
  }, [selling_price])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const amount = Number(value)
    if (value !== "" && (!Number.isFinite(amount) || amount < 0 || Number(amount.toFixed(2)) !== amount)) {
      setError("Enter a nonnegative amount with up to two decimal places.")
      return
    }

    setError("")
    fetcher.submit(
      { intent: "update_selling_price", selling_price: value },
      { method: "POST", action: `/pos/menu/${menuId}` },
    )
  }

  return (
    <section className="h-fit overflow-hidden rounded-xl border bg-card">
      <header className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Selling Price</h2>
        <p className="mt-1 text-xs text-muted-foreground">Set or update the selling price for this menu item.</p>
      </header>
      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        <Field>
          <FieldContent>
            <FieldLabel htmlFor="menu-selling-price">Selling price</FieldLabel>
            <InputGroup>
              <InputGroupAddon align="inline-start">₱</InputGroupAddon>
              <InputGroupInput
                id="menu-selling-price"
                type="number"
                min="0"
                step="0.01"
                placeholder="Leave blank to unset"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                aria-invalid={Boolean(error)}
              />
            </InputGroup>
            <FieldDescription>You can change this value whenever your costs or pricing strategy change.</FieldDescription>
            {error && <FieldError>{error}</FieldError>}
          </FieldContent>
        </Field>
        <Button type="submit" size="sm" disabled={isSubmitting || value === (selling_price === null || selling_price === undefined ? "" : String(selling_price))}>
          {isSubmitting ? "Saving..." : "Save selling price"}
        </Button>
      </form>
    </section>
  )
}