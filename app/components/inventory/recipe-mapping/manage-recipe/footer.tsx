import { useEffect, useState } from "react"
import { useFetcher, useNavigate } from "react-router"
import { AlertTriangle, Trash2 } from "lucide-react"
import { Button } from "~/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"

type ComponentProps = {
    deleting_id?: string
    recipe_name?: string
}

export function BuildRecipeFooter({ deleting_id, recipe_name = "" } : ComponentProps){
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [confirmation, setConfirmation] = useState("")
    const fetcher = useFetcher()
    const navigate = useNavigate()
    const isDeleting = fetcher.state !== "idle"
    const titleMatches = Boolean(recipe_name) && confirmation === recipe_name

    useEffect(() => {
        if (fetcher.data?.success === true && fetcher.data?.intent === "delete_recipe") {
            setIsDeleteOpen(false)
            setConfirmation("")
            navigate("/inventory/recipes")
        }
    }, [fetcher.data, navigate])

    const handleDelete = () => {
        if (!deleting_id || !titleMatches || isDeleting) return

        fetcher.submit(
            {
                intent: "delete_recipe",
                id: deleting_id,
            },
            {
                method: "POST",
                action: "/inventory/recipes",
            }
        )
    }

    return (
        <>
            <section className="mt-5 rounded-2xl border border-destructive/20 bg-destructive/[0.03] p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-foreground">Danger zone</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Deleting this recipe permanently removes its recipe mapping.
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={!deleting_id}
                        onClick={() => setIsDeleteOpen(true)}
                    >
                        <Trash2 />
                        Delete recipe
                    </Button>
                </div>
            </section>

            <Dialog
                open={isDeleteOpen}
                onOpenChange={(open) => {
                    setIsDeleteOpen(open)
                    if (!open) setConfirmation("")
                }}
                
            >
                <DialogContent showCloseButton={false}>
                    <DialogHeader>
                        <DialogTitle>Delete {recipe_name || "this recipe"}?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. To confirm, type the recipe title exactly as shown below.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="rounded-lg border bg-muted/40 px-3 py-2 text-sm font-medium text-foreground">
                        {recipe_name || "Recipe title unavailable"}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="delete-recipe-confirmation" className="text-xs font-medium">
                            To confirm, type text above in the box below
                        </label>
                        <Input
                            id="delete-recipe-confirmation"
                            value={confirmation}
                            onChange={(event) => setConfirmation(event.target.value)}
                            autoComplete="off"
                            aria-invalid={confirmation.length > 0 && !titleMatches}
                            disabled={isDeleting}
                        />
                        {confirmation.length > 0 && !titleMatches && (
                            <p className="text-xs text-destructive">The title does not match.</p>
                        )}
                    </div>

                    <DialogFooter>
                        <DialogClose render={<Button type="button" variant="ghost" disabled={isDeleting}>Cancel</Button>} />
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={!titleMatches || isDeleting}
                            onClick={handleDelete}
                        >
                            {isDeleting ? "Deleting..." : "Delete recipe"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}