export const unitOptions = ["pcs", "g", "kg", "lb", "oz", "mL", "L", "fl oz"] as const

export type UnitOfMeasure = (typeof unitOptions)[number]

export const isUnitOfMeasure = (value: string): value is UnitOfMeasure =>
  unitOptions.includes(value as UnitOfMeasure)

export const getBaseUnitFactor = (unit: string): number | null => {
  switch (unit) {
    case "pcs":
    case "g":
    case "mL":
      return 1
    case "kg":
    case "L":
      return 1000
    case "lb":
      return 453.592
    case "oz":
      return 28.3495
    case "fl oz":
      return 29.5735
    default:
      return null
  }
}
