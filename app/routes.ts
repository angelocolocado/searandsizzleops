import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [

    layout("./layout/sidebar-layout.tsx", [
        index("routes/home.tsx"),
        route("/inventory/stock", "routes/inventory/inventory-stock.tsx"),
        route("/inventory/ingredients", "routes/inventory/inventory-ingredients.tsx"),
        route("/inventory/recipes", "routes/inventory/recipe-mapping.tsx"),
        route("/inventory/recipes/:id", "routes/inventory/build-recipe.tsx"),

        route("/pos/menu", "routes/pos/menu/menu.tsx"),
    ]),
    route("/categories", "routes/category-manager.tsx"),
    

] satisfies RouteConfig;
