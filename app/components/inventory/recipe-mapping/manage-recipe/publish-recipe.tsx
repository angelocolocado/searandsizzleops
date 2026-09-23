import { AlertTriangle, ArrowUpFromLine, CheckLine, OctagonMinus } from "lucide-react";
import { Form } from "react-router";
import { Button } from "~/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "~/components/ui/dialog";
import { useState } from "react";
import { useEffect } from "react";

type ComponentProps = {
    recipe_status: string
}

export function PublishRecipeUI({ recipe_status } : ComponentProps){
    const [isUnavailableOpen, setIsUnavailableOpen] = useState(false)
    const normalizedStatus = recipe_status.trim().toLowerCase()
    const canMarkAsAvailable = ["inactive", "unavailable", "incomplete"].includes(normalizedStatus)

    useEffect(() => {
        if (canMarkAsAvailable) {
            setIsUnavailableOpen(false)
        }
    }, [canMarkAsAvailable])

    
    return (<>

        {canMarkAsAvailable ? <>
        
        <Form method="POST" className="flex items-center">
            <Button type="submit" size="xs" className="rounded-xl"><CheckLine /> Mark as Available</Button>
            <input type="hidden" hidden id="status" name="status" value="1" defaultValue="1" />
            <input type="hidden" hidden id="intent" name="intent" value="publish_recipe" defaultValue="publish_recipe" />
        </Form>
        
        </> : <>
        
        <div className="flex items-center">
            <Button
                type="button"
                size="xs"
                className="rounded-xl"
                variant="destructive"
                onClick={() => setIsUnavailableOpen(true)}
            >
                <OctagonMinus />
                Mark as Unavailable
            </Button>

            <Dialog open={isUnavailableOpen} onOpenChange={setIsUnavailableOpen}>
                <DialogContent showCloseButton={false}>
                    <DialogHeader>
                        <DialogTitle className="text-base">Mark recipe as unavailable?</DialogTitle>
                        <DialogDescription>
                            This recipe will no longer be available for selection in POS. Existing recipe details and ingredient mappings will be kept.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="rounded-lg border border-destructive/20 bg-destructive/[0.04] px-3 py-2.5 text-sm leading-relaxed text-muted-foreground">
                        You can make this recipe available again later from this page.
                    </div>

                    <DialogFooter>
                        <DialogClose render={<Button type="button" size="sm">Cancel</Button>} />
                        <Form
                            method="POST"
                            className="flex"
                            onSubmit={() => setIsUnavailableOpen(false)}
                        >
                            <Button type="submit" size="sm" variant="destructive">
                                <OctagonMinus />
                                Mark as Unavailable
                            </Button>
                            <input type="hidden" name="status" value="2" />
                            <input type="hidden" name="intent" value="unpublish_recipe" />
                        </Form>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
        </>}
    
        
    
    </>)
}