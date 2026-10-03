import { useState } from "react"
import type { RecipeDetailsType } from "~/components/inventory/recipe-mapping/manage-recipe/header"
import { CategoriesManager, type CategoryDataType } from "~/components/ui/categories-manager"
import { InputGroup, InputGroupAddon, InputGroupInput } from "~/components/ui/input-group"
import { Button } from "~/components/ui/button"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Plus, Search, Utensils } from "lucide-react"
import { MenuAddMenuPane } from "./menu-add-menu-pane"
import { MenuListSection, type MenuListItem } from "./menu-list-section"


type ComponentProps = {
    categories_data: CategoryDataType[]
    available_recipes: RecipeDetailsType[]
    menu_list: MenuListItem[]
}

export default function AppMenu({ categories_data, available_recipes, menu_list } : ComponentProps){
    const [search, setSearch] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("all")
    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false)


    return (
        <main className="animate-in fade-in duration-500 ease-out px-5 py-4 scroll-smooth">
            <header className="mb-5 flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase text-muted-foreground">
                        <Utensils className="size-3.5" /> Point of sale setup
                    </p>
                    <h1 className="text-2xl font-semibold tracking-tight">Menu management</h1>
                    <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Configure restaurant menu items, categories, and the recipes behind each dish.</p>
                </div>
                <div className="flex gap-5 text-xs sm:border-l sm:pl-5">
                    <div><p className="text-lg font-semibold tabular-nums text-foreground">{menu_list.length}</p><p className="text-muted-foreground">Menu items</p></div>
                    <div><p className="text-lg font-semibold tabular-nums text-foreground">{categories_data.length}</p><p className="text-muted-foreground">Categories</p></div>
                </div>
            </header>
            <section className="min-h-[60vh] overflow-hidden rounded-2xl border bg-card shadow-sm">
                <div className="flex flex-col gap-3 border-b bg-muted/30 p-3 lg:flex-row lg:items-center lg:justify-between">
                    <InputGroup className="max-w-md">
                        <InputGroupAddon align="inline-start" className="text-muted-foreground">
                            <Search className="size-4" />
                        </InputGroupAddon>
                        <InputGroupInput
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search menu items or recipes"
                            aria-label="Search menu items or recipes"
                            className="text-sm"
                        />
                    </InputGroup>

                    <div className="flex flex-wrap items-center gap-2">
                        <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value ?? "all")}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="All categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="all">All categories</SelectItem>
                                    {categories_data.map((category) => (
                                        <SelectItem key={category.id} value={String(category.id)}>{category.category}</SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <Button type="button" size="sm" className="gap-2" onClick={() => setIsAddMenuOpen(true)}>
                            <Plus className="size-4" /> Add menu
                        </Button>
                    </div>
                </div>

                <MenuListSection
                    menu_list={menu_list}
                    categories={categories_data}
                    available_recipes={available_recipes}
                    search={search}
                    selectedCategory={selectedCategory}
                    onAddMenu={() => setIsAddMenuOpen(true)}
                    onClearFilters={() => {
                        setSearch("")
                        setSelectedCategory("all")
                    }}
                />
            </section>

            <MenuAddMenuPane
                open={isAddMenuOpen}
                onOpenChange={setIsAddMenuOpen}
                categories_data={categories_data}
            />

            <CategoriesManager
                categories_data={categories_data}
                from="pos-menu"
                actionPath="/categories"
                title="Menu Category"
            />
        </main>
    )
}