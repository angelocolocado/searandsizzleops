import { LayoutGrid, List, Plus, SquarePen, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useFetcher } from "react-router";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { useEffect, useState } from "react";

const addCatSchema = z.object({
    category: z.string().min(2, "Must have atleast 2 characters")
})

export type CategoryDataType = {
    category: string,
    updated_at: string,
    id: number
}

export type CategoryManagerSource = "recipe-mapping" | "ingredient-stock" | "pos-menu"

type ComponentProps = {
    categories_data: CategoryDataType[]
    from: CategoryManagerSource
    actionPath: string
    title?: string
}

type AddCatSchemaType = z.infer<typeof addCatSchema>

export function CategoriesManager({ categories_data, from, actionPath, title } : ComponentProps) {
    const [categories, setCategories] = useState<CategoryDataType[]>([])
    const [viewMode, setViewMode] = useState<"list" | "tile">("list")
    const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null)
    const [editingValue, setEditingValue] = useState("")
    const fetcher = useFetcher()
    const isSubmitting = fetcher.state !== "idle"
    const [isCatInUseErr, setIsCatInUseErr] = useState(false)
    const [itemCount, setItemCount] = useState(0)

    const {register, handleSubmit, formState: { errors }, reset} = useForm<AddCatSchemaType>({
        resolver: zodResolver(addCatSchema),
        defaultValues: { category: "" }
    })

    useEffect(() => {
        setCategories(categories_data)
    }, [categories_data])

    const handleAdd = (data: AddCatSchemaType) => {
        fetcher.submit({ intent: "add", where: from, category: data.category }, {
            method: "POST", action: actionPath
        })
        reset()
    }

    const handleRemove = (categoryId: number) => {
        fetcher.submit({ intent: "delete", where: from, id: String(categoryId) }, {
            method: "POST", action: actionPath
        })
    }

    const handleUpdate = (category: CategoryDataType) => {
        setEditingCategoryId(category.id)
        setEditingValue(category.category)
    }

    const handleOnUpdate = (categoryId: number) => {
        const nextValue = editingValue.trim()
        if (!nextValue || nextValue.length < 2) return

        fetcher.submit({ intent: "update", where: from, id: String(categoryId), category: nextValue }, {
            method: "POST", action: actionPath
        })
        setEditingCategoryId(null)
        setEditingValue("")
    }

    const handleCancelUpdate = () => {
        setEditingCategoryId(null)
        setEditingValue("")
    }

    useEffect(() => {
        if(fetcher.state === "idle" && fetcher.data?.intent === "delete" && !fetcher.data?.success){
            setItemCount(fetcher.data.itemCount ?? 0)
            setIsCatInUseErr(true)
        }
    }, [fetcher.state, fetcher.data])

    return (
        <main className="animate-in fade-in duration-500 ease-out py-5 scroll-smooth" id="categories-manager">
            <div className="mx-auto space-y-6">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <p className="text-sm font-medium hidden text-muted-foreground">Inventory</p>
                        <h1 className="text-2xl font-semibold tracking-tight">{title || "Categories"}</h1>
                    </div>
                </div>

                <form onSubmit={handleSubmit(handleAdd)} className="flex flex-col">
                    <div className="flex w-full gap-2">
                        <Input disabled={isSubmitting} placeholder="Add custom category" className={`h-10 ${errors.category ? 'border-red-500' : ''}`} {...register("category")} />
                        <Button disabled={isSubmitting} type="submit" className="h-10 gap-2">
                            <Plus className="size-4" /> Add category
                        </Button>
                    </div>
                    {errors.category && <p className="text-destructive text-sm pl-1">{errors.category.message}</p>}
                </form>

                <div className="rounded-xl border bg-card">
                    <div className="flex items-center justify-between border-b px-4 py-3">
                        <div>
                            <h2 className="text-sm font-medium">Saved categories</h2>
                            <p className="mt-0.5 text-xs text-muted-foreground">{categories.length} {categories.length === 1 ? "category" : "categories"}</p>
                        </div>
                        <div className="flex items-center rounded-lg border bg-muted/40 p-0.5">
                            <Button type="button" variant={viewMode === "list" ? "secondary" : "ghost"} size="sm" className="h-8 gap-1.5 px-2.5" onClick={() => setViewMode("list")}>
                                <List className="size-4" /><span className="hidden sm:inline">List</span>
                            </Button>
                            <Button disabled={isSubmitting} type="button" variant={viewMode === "tile" ? "secondary" : "ghost"} size="sm" className="h-8 gap-1.5 px-2.5" onClick={() => setViewMode("tile")}>
                                <LayoutGrid className="size-4" /><span className="hidden sm:inline">Tile</span>
                            </Button>
                        </div>
                    </div>

                    <div className="max-h-99 overflow-y-auto p-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-thumb:hover]:bg-muted-foreground/50">
                        {categories.length > 0 ? viewMode === "list" ? (
                            <div className="space-y-1">
                                {categories.map((category) => {
                                    const isEditing = editingCategoryId === category.id
                                    return <div key={category.updated_at} className="flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50">
                                        {isEditing ? <div className="flex w-full items-center gap-2">
                                            <Input value={editingValue} onChange={(event) => setEditingValue(event.target.value)} className="h-9" autoFocus />
                                            <Button type="button" size="sm" className="h-9" onClick={() => handleOnUpdate(category.id)} disabled={isSubmitting || editingValue.trim().length < 2}>Save</Button>
                                            <Button type="button" variant="outline" size="sm" className="h-9" onClick={handleCancelUpdate}>Cancel</Button>
                                        </div> : <span className="truncate pr-3 text-sm font-medium">{category.category}</span>}
                                        {!isEditing && <div>
                                            <Button type="button" variant="ghost" size="icon" className="size-8 text-muted-foreground" onClick={() => handleUpdate(category)}><SquarePen className="size-4" /></Button>
                                            <Button type="button" variant="ghost" size="icon" className="size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" onClick={() => handleRemove(category.id)}><Trash2 className="size-4" /></Button>
                                        </div>}
                                    </div>
                                })}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                {categories.map((category) => {
                                    const isEditing = editingCategoryId === category.id
                                    return <div key={category.updated_at} className="group flex min-h-20 flex-col justify-between rounded-lg border bg-muted/20 p-3 transition-colors hover:bg-muted/40">
                                        {isEditing ? <div className="space-y-2">
                                            <Input value={editingValue} onChange={(event) => setEditingValue(event.target.value)} className="h-9" autoFocus />
                                            <div className="flex justify-end gap-2"><Button type="button" variant="outline" size="sm" onClick={handleCancelUpdate}>Cancel</Button><Button type="button" size="sm" onClick={() => handleOnUpdate(category.id)} disabled={isSubmitting || editingValue.trim().length < 2}>Save</Button></div>
                                        </div> : <span className="line-clamp-2 text-sm font-medium">{category.category}</span>}
                                        {!isEditing && <div className="mt-2 flex justify-end">
                                            <Button type="button" variant="ghost" size="icon" className="size-8 text-muted-foreground" onClick={() => handleUpdate(category)}><SquarePen className="size-4" /></Button>
                                            <Button type="button" variant="ghost" size="icon" className="size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" onClick={() => handleRemove(category.id)}><Trash2 className="size-4" /></Button>
                                        </div>}
                                    </div>
                                })}
                            </div>
                        ) : <div className="flex min-h-40 items-center justify-center px-3 text-center"><p className="text-sm text-muted-foreground">No saved categories yet.</p></div>}
                    </div>
                </div>
            </div>

            <Dialog open={isCatInUseErr} onOpenChange={setIsCatInUseErr}>
                <DialogContent showCloseButton={false}>
                    <DialogHeader>
                        <DialogTitle>Cannot delete category</DialogTitle>
                        <DialogDescription>This category cannot be deleted because it is currently being used by <span className="font-semibold">{itemCount}</span> {itemCount === 1 ? "ingredient" : "ingredients"}.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter><DialogClose render={<Button>Continue</Button>} /></DialogFooter>
                </DialogContent>
            </Dialog>
        </main>
    )
}