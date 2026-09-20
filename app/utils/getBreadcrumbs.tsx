import { navItems } from "~/components/sidebar/data";

export function getBreadcrumbs(currentUrl: string){
    for(const category in navItems){
        const items = navItems[category as keyof typeof navItems];

        const matchedItem = items.find((item) => item.url === currentUrl)

        if(matchedItem && matchedItem.breadcrumbs){
            return matchedItem.breadcrumbs
        }

        return []
    }
}