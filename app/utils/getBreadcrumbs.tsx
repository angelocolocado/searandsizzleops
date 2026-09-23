import { navItems } from "~/components/sidebar/data";

function matchesRoute(pattern: string, currentUrl: string) {
    const regexPattern = pattern.replace(
        /:[^/]+/g,
        "[^/]+"
    );

    return new RegExp(`^${regexPattern}$`).test(currentUrl);
}

export function getBreadcrumbs(currentUrl: string) {
    for (const category in navItems) {
        const items = navItems[category as keyof typeof navItems];

        const matchedItem = items.find((item) =>
            matchesRoute(item.url, currentUrl)
        );

        if (matchedItem?.breadcrumbs) {
            return matchedItem.breadcrumbs;
        }
    }

    return [];
}