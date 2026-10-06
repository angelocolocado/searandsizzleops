import { BadgeCheck, Cog } from "lucide-react"
import type { CurrentUserType } from "./current-user/current-user"
import CurrentUserUI from "./current-user/current-user"


type ComponentProps = {
    current_user: CurrentUserType
}

export default function AppUserManagement({ current_user }: ComponentProps) {
  return (
    <main className="animate-in fade-in duration-500 ease-out scroll-smooth px-5 py-4">
      <header className="mb-5 flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase text-muted-foreground">
            <Cog className="size-3.5" aria-hidden="true" /> System Settings
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">User &amp; Staff Management</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Manage your profile, sign-in credentials, and account security.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start rounded-lg border bg-card px-3 py-2 text-sm sm:self-auto">
          <BadgeCheck className="size-4 text-muted-foreground" aria-hidden="true" />
          <span className="font-medium">{current_user.name}</span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize text-muted-foreground">
            {current_user.mode}
          </span>
        </div>
      </header>

      <CurrentUserUI user={current_user} />
    </main>
  )
}