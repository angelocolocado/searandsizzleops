import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [

    route("/login", "routes/authentication/login.tsx"),
    route("/logout", "routes/authentication/logout.tsx"),
    route("/two-factor-challenge", "routes/authentication/2fa-challenge.tsx"),

    layout("./layout/sidebar-layout.tsx", [
        index("routes/home.tsx"),
        route("/inventory/stock", "routes/inventory/inventory-stock.tsx"),
        route("/inventory/ingredients", "routes/inventory/inventory-ingredients.tsx"),
        route("/inventory/logs", "routes/inventory/stock-movements.tsx"),
        route("/inventory/recipes", "routes/inventory/recipe-mapping.tsx"),
        route("/inventory/recipes/:id", "routes/inventory/build-recipe.tsx"),

        route("/pos/menu", "routes/pos/menu/menu.tsx"),
        route("/pos/menu/:id", "routes/pos/menu/menu-detail.tsx"),
        route("/pos/modifiers", "routes/pos/modifiers.tsx"),
        route("/pos/sales-history", "routes/pos/sales-history.tsx"),

        route("/system/user-management", "routes/system-settings/user-management.tsx"),

        route("/paymongo", "routes/paymongo_sample_integration.tsx")
    ]),
    route("/categories", "routes/category-manager.tsx"),
    

] satisfies RouteConfig;
