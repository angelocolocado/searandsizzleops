export type ModifierCategory = {
  id: number
  category: string
  type?: number
  created_at?: string
  updated_at?: string
}

export type ModifierRecipe = {
  id?: string
  recipe_id?: string
  name?: string
  recipe_name?: string
  category?: string
  selling_price?: number | string | null
  status?: string
}

export type IngredientOption = {
  id: number
  item_name?: string
  name?: string
  unit_cost?: number | string
  price?: number | string
  cost_per_base?: number | string
  unit?: string
  ingredient_name?: string
}

export type Modifier = {
  id: string
  category_id: number
  category?: string
  ingredient_id?: number | null
  ingredient?: IngredientOption | null
  source_recipe_id?: string | null
  source_recipe?: ModifierRecipe | null
  name: string
  cost: number | string
  created_at?: string
  updated_at?: string
}

export type ModifierMenu = {
  id: string
  name: string
  status?: string | number | null
  category?: string
}

export type MenuModifierAssignment = {
  id: string
  menu_id: string
  modifier_id: string
  modifier?: Modifier
  menu?: ModifierMenu
}