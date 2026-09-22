import { Skeleton } from "~/components/ui/skeleton"
import type { RecipesPreviewDataType } from "./recipe-mapping"
import { RecipePreviewCard } from "./recipe-card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty"
import { CookingPot } from "lucide-react"
import { Button } from "~/components/ui/button"
import { useNavigation } from "react-router"
import { DialogTrigger } from "~/components/ui/dialog"

type ComponentProps = {
    recipes_data: RecipesPreviewDataType[]
}

export function RecipeSection({ recipes_data } : ComponentProps){

    const navigation = useNavigation()
    const isLoading = navigation.state !== "idle"

    return (<>
        {isLoading ? <>
            <div className="p-3 animate-in fade-in duration-500 ease-out">
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton key={index} className="h-[120px] w-full rounded-2xl" />
                    ))}
                </div>
            </div>
            
            </> : <>
            {recipes_data.length > 0 ? <>
                <div className="relative max-h-[70vh] overflow-y-auto grid gap-3 p-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3     [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb:hover]:bg-muted-foreground/40">
                {recipes_data.map((recipe) => (
                    <RecipePreviewCard
                    key={recipe.recipe_name}
                    recipe_name={recipe.recipe_name}
                    latest_update={recipe.updated_at}
                    date_added={recipe.created_at}
                    status={recipe.status}
                    onView={() => {}}
                    />
                ))}
                </div>
            </> : <>
                <Empty className="py-20 animate-in fade-in duration-500 ease-out">
                    <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <CookingPot />
                    </EmptyMedia>

                    <EmptyTitle>No recipe mappings yet</EmptyTitle>

                    <EmptyDescription>
                        Start by creating a recipe and assigning its ingredients.
                    </EmptyDescription>
                    </EmptyHeader>

                    <EmptyContent>
                    <DialogTrigger render={<Button>Create your first recipe mapping</Button>}></DialogTrigger>
                    </EmptyContent>
                </Empty>
            </>}
        </>}
    </>)
}