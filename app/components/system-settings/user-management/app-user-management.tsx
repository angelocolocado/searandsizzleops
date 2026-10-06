import { Cog, Utensils } from "lucide-react";
import type { CurrentUserType } from "./current-user";
import CurrentUserUI from "./current-user";


type ComponentProps = {
    current_user: CurrentUserType | any
}

export default function AppUserManagement({ current_user } : ComponentProps){
    return (<>
    
        <main className="animate-in fade-in duration-500 ease-out px-5 py-4 scroll-smooth">
            <header className="mb-5 flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase text-muted-foreground">
                        <Cog className="size-3.5" /> System Settings
                    </p>
                    <h1 className="text-2xl font-semibold tracking-tight">User & Staff Management</h1>
                    <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Manage staff accounts, assign roles, update permissions, and control user access across the system.</p>
                </div>
                <div className="flex gap-5 text-xs sm:border-l sm:pl-5">
                    <div><p className="text-lg font-semibold tabular-nums text-foreground">kk</p><p className="text-muted-foreground">Menu items</p></div>
                    <div><p className="text-lg font-semibold tabular-nums text-foreground">kk</p><p className="text-muted-foreground">Categories</p></div>
                </div>
            </header>

            <CurrentUserUI {...current_user} />

        </main>
    
    </>)
}