import { useEffect, useState } from "react"
import { Pencil } from "lucide-react"
import { useFetcher } from "react-router"
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
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Textarea } from "~/components/ui/textarea"
import { getMenuStatusLabel, getMenuStatusValue, MENU_STATUS_OPTIONS } from "~/utils/menu-status"

type MenuDetailsForEdit = {
  name?: string
  description?: string | null
  status?: string | number | null
}

type ComponentProps = {
  menuId: string
  menu: MenuDetailsForEdit
}

export function MenuEditDialog({ menuId, menu }: ComponentProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(menu.name ?? "")
  const [description, setDescription] = useState(menu.description ?? "")
  const [status, setStatus] = useState(getMenuStatusValue(menu.status))
  const [error, setError] = useState("")
  const fetcher = useFetcher()
  const isSaving = fetcher.state !== "idle"

  useEffect(() => {
    setName(menu.name ?? "")
    setDescription(menu.description ?? "")
    setStatus(getMenuStatusValue(menu.status))
  }, [menu.name, menu.description, menu.status])

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success && fetcher.data?.intent === "update_details") {
      setOpen(false)
    }
  }, [fetcher.data, fetcher.state])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedName = name.trim()
    const trimmedDescription = description.trim()

    if (trimmedName.length < 2 || trimmedName.length > 255) {
      setError("Name must be between 2 and 255 characters.")
      return
    }
    if (trimmedDescription.length === 1 || trimmedDescription.length > 255) {
      setError("Description must be empty or between 2 and 255 characters.")
      return
    }
    if (!status) {
      setError("Choose whether this menu item is available.")
      return
    }

    setError("")
    fetcher.submit(
      {
        intent: "update_details",
        name: trimmedName,
        description: trimmedDescription,
        status,
      },
      { method: "POST", action: `/pos/menu/${menuId}` },
    )
  }

  return (
    <>
      <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
        <Pencil /> Edit details
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit menu details</DialogTitle>
            <DialogDescription>Update the name, description, and availability of this menu item.</DialogDescription>
          </DialogHeader>
          <form id="edit-menu-details" onSubmit={handleSubmit} className="space-y-4">
            <Field>
              <FieldContent>
                <FieldLabel htmlFor="edit-menu-name">Menu name</FieldLabel>
                <Input id="edit-menu-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={255} disabled={isSaving} />
              </FieldContent>
            </Field>
            <Field>
              <FieldContent>
                <FieldLabel htmlFor="edit-menu-description">Description <span className="font-normal text-muted-foreground">(optional)</span></FieldLabel>
                <Textarea id="edit-menu-description" value={description} onChange={(event) => setDescription(event.target.value)} rows={3} maxLength={255} disabled={isSaving} />
                <FieldDescription>Leave blank to remove the description.</FieldDescription>
              </FieldContent>
            </Field>
            <Field>
              <FieldContent>
                <FieldLabel htmlFor="edit-menu-status">Status</FieldLabel>
                <Select value={status} onValueChange={(value) => setStatus(value ?? "")}>
                  <SelectTrigger id="edit-menu-status" className="w-full">
                    <SelectValue>{getMenuStatusLabel(status) || "Choose status"}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {MENU_STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>
            {error && <FieldError>{error}</FieldError>}
          </form>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="ghost" disabled={isSaving}>Cancel</Button>} />
            <Button type="submit" form="edit-menu-details" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save details"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}