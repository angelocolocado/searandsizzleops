import { ArrowDownToLine, Plus, Printer, RefreshCw, Search } from "lucide-react";
import { useRevalidator } from "react-router";
import { Button } from "~/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "~/components/ui/input-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

type ComponentProps = {
    handleOpen: () => void
    handleFilter?: (value: string | null) => void
    filter?: any
    mode: "ingredients" | "recipe"
}

export function DataNav({ handleOpen, handleFilter, mode, filter } : ComponentProps){

    const revalidator = useRevalidator()

    return (<>
        <div className="flex flex-col gap-3 border-b bg-muted/30 p-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 items-center gap-2">
                <InputGroup className="max-w-md">
                <InputGroupAddon align="inline-start" className="text-muted-foreground">
                    <Search className="size-4" />
                </InputGroupAddon>
                <InputGroupInput 
                    placeholder={mode == "ingredients" ? 'Search ingredient or category' : 'Search recipe'}
                    className="text-sm"
                />
                </InputGroup>
            </div>



            {mode == "ingredients" ? <>
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => revalidator.revalidate()}
                    disabled={revalidator.state === "loading"}
                    >
                        <RefreshCw
                            className={`size-4 ${
                            revalidator.state === "loading" ? "animate-spin" : ""
                            }`}
                        />
                        {revalidator.state === "loading" ? "Refreshing..." : "Refresh"}
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
            
            </> : <>
            
                <div className="flex flex-wrap items-center gap-2">
                    <Select onValueChange={handleFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select Categories" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                            {filter.map((d: any) => (
                                <SelectItem key={d.id} value={d.category}>{d.category}</SelectItem>
                            ))}
                            <SelectItem value="All">All</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <Button size="sm" className="gap-2" onClick={handleOpen}>
                        <Plus className="size-4" />
                        Add Recipe
                    </Button>
                </div>
            
            </>}

            
        </div>
    </>)
}