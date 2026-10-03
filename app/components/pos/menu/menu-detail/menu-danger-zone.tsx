import { useEffect, useState } from "react"
import { AlertTriangle, Trash2 } from "lucide-react"
import { useFetcher, useNavigate } from "react-router"
import { Button } from "~/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"

type ComponentProps = {
  menuId: string
  menuName: string
}

export function MenuDangerZone({ menuId, menuName }: ComponentProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [confirmation, setConfirmation] = useState("")
  const fetcher = useFetcher()
  const navigate = useNavigate()
  const isDeleting = fetcher.state !== "idle"
  const titleMatches = confirmation === menuName

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success && fetcher.data?.intent === "delete_menu") {
      setIsOpen(false)
      setConfirmation("")
      navigate("/pos/menu")
    }
  }, [fetcher.data, fetcher.state, navigate])

  return (
    <>
      <section className="rounded-xl border border-destructive/20 bg-destructive/[0.03] p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold"><AlertTriangle className="size-4 text-destructive" /> Danger zone</p>
            <p className="mt-1 text-xs text-muted-foreground">Deleting this menu item permanently removes its configuration.</p>
          </div>
          <Button type="button" variant="destructive" size="sm" onClick={() => setIsOpen(true)}>
            <Trash2 /> Delete menu
          </Button>
        </div>
      </section>

      <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open)
        if (!open) setConfirmation("")
      }}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete {menuName}?</DialogTitle>
            <DialogDescription>This action cannot be undone. Type the menu name exactly as shown to confirm.</DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border bg-muted/40 px-3 py-2 text-sm font-medium">{menuName}</div>
          <div className="space-y-2">
            <label htmlFor="delete-menu-confirmation" className="text-xs font-medium">Menu name</label>
            <Input
              id="delete-menu-confirmation"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              autoComplete="off"
              aria-invalid={confirmation.length > 0 && !titleMatches}
              disabled={isDeleting}
            />
            {confirmation.length > 0 && !titleMatches && <p className="text-xs text-destructive">The menu name does not match.</p>}
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="ghost" disabled={isDeleting}>Cancel</Button>} />
            <fetcher.Form method="post" action={`/pos/menu/${menuId}`}>
              <input type="hidden" name="intent" value="delete_menu" />
              <Button type="submit" variant="destructive" disabled={!titleMatches || isDeleting}>
                {isDeleting ? "Deleting..." : "Delete menu"}
              </Button>
            </fetcher.Form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}