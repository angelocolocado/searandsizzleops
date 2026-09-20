import { ArrowDownToLine, Plus, Printer, RefreshCw, Search } from "lucide-react";
import { Button } from "~/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "~/components/ui/input-group";

type ComponentProps = {
    handleOpen: () => void
}

export function DataNav({ handleOpen } : ComponentProps){
    return (<>
        <div className="flex flex-col gap-3 border-b bg-muted/30 p-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 items-center gap-2">
                <InputGroup className="max-w-md">
                <InputGroupAddon align="inline-start" className="text-muted-foreground">
                    <Search className="size-4" />
                </InputGroupAddon>
                <InputGroupInput placeholder="Search ingredient or category" className="text-sm" />
                </InputGroup>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                <RefreshCw className="size-4" />
                Refresh
                </Button>
                <Button variant="secondary" size="sm" className="gap-2">
                <ArrowDownToLine className="size-4" />
                Export
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                <Printer className="size-4" />
                Print
                </Button>
                <Button size="sm" className="gap-2" onClick={handleOpen}>
                    <Plus className="size-4" />
                    Add Ingredient
                </Button>
            </div>
        </div>
    </>)
}