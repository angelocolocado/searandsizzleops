import { useState } from "react"
import type { RecipeDetailsType } from "~/components/inventory/recipe-mapping/manage-recipe/header"
import { CategoriesManager, type CategoryDataType } from "~/components/ui/categories-manager"
import { InputGroup, InputGroupAddon, InputGroupInput } from "~/components/ui/input-group"
import { Button } from "~/components/ui/button"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Plus, Search } from "lucide-react"
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