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
}

export type Modifier = {
  id: string
  category_id: number
  category?: string
  recipe_id?: string | null
  recipe?: ModifierRecipe | null
  name: string
  price: number | string
  description?: string | null
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