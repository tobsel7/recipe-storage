import Vue from "vue";
import VueRouter from "vue-router"
import NewRecipe from "../views/NewRecipe";
import NewIngredient from "../views/NewIngredient";
import MealPlansReport from "../views/MealPlansReport";
import PropertiesReport from "../views/PropertiesReport";
import Home from "../views/Home";

Vue.use(VueRouter)

export default new VueRouter({
    mode: "history",
    base: process.env.BASE_URL,
    routes: [
        {
            path : "/",
            name : "Home",
            component: Home
        },
        {
            path: "/recipes",
            name: "Recipes",
            component: NewRecipe
        },
        {
            path: "/ingredients",
            name: "Ingredients",
            component: NewIngredient
        },
        {
            path: "/reports/mealplans",
            name: "Meal Plans Report",
            component: MealPlansReport
        },
        {
            path: "/reports/properties",
            name: "Most noticed properties",
            component: PropertiesReport
        }
    ]
})