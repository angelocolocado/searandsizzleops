import type { RecipeDetailsType } from "~/components/inventory/recipe-mapping/manage-recipe/header";
import { CategoriesManager, type CategoryDataType } from "~/components/ui/categories-manager";
import { MenuAddMenuPane } from "./menu-add-menu-pane";


type ComponentProps = {
    categories_data: CategoryDataType[]
    available_recipes: RecipeDetailsType[]
    menu_list: any[]
}

export default function AppMenu({ categories_data, available_recipes, menu_list } : ComponentProps){


    return (<>
    
        <main className="animate-in fade-in duration-500 ease-out px-5 py-4 scroll-smooth">

            <MenuAddMenuPane
                categories_data={categories_data}
                available_recipes={available_recipes}
            />

            <CategoriesManager
                categories_data={categories_data}
                from="pos-menu"
                actionPath="/categories"
                title="Menu Category"
            />

            
        </main>
    
    </>)
}