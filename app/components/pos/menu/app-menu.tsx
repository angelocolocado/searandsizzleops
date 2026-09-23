import { CategoriesManager, type CategoryDataType } from "~/components/ui/categories-manager";

type ComponentProps = {
    categories_data: CategoryDataType[]
}

export default function AppMenu({ categories_data } : ComponentProps){
    return (<>
    
        <main className="animate-in fade-in duration-500 ease-out px-5 py-4 scroll-smooth">

            <CategoriesManager
                categories_data={categories_data}
                from="pos-menu"
                actionPath="/categories"
                title="Menu Category"
            />
        </main>
    
    </>)
}