<template>
  <div class="box">
    <h1>New Recipe</h1>
    <table class="center">
        <tr>
          <td>
            <label>Recipe name: </label>
          </td>
          <td>
            <input
                type="text"
                v-model="name"
                name="name"
                placeholder="Lasagne" />
          </td>
          <td>
            <button @click="toggleButton" type="button">{{ showRecipeForm ? "Add ingredients" : "Create new recipe" }}</button>
          </td>
        </tr>
    </table>
    <RecipeForm @new-recipe="addRecipe" v-show="showRecipeForm"></RecipeForm>
    <IngredientsForm @new-ingredients="addIngredients" v-show="!showRecipeForm && this.name"></IngredientsForm>

  </div>
</template>

<script>
import IngredientsForm from "@/components/IngredientsForm";
import RecipeForm from "@/components/RecipeForm";
import axios from "axios";

export default {
  name: "NewRecipe",
  components: {
    IngredientsForm,
    RecipeForm
  },
  data() {
    return {
      name: "",
      showRecipeForm: false,
    }
  },
  methods: {
    toggleButton() {
      if(this.showRecipeForm && !this.name) {
        alert("Please enter the name of the existing recipe or create one before adding ingredients.")
      }
      this.showRecipeForm = !this.showRecipeForm
    },
    addIngredients(ingredients) {
      const newIngredients = {
        username: this.$store.state.username,
        recipeName: this.name,
        ingredients: ingredients
      }
      this.showRecipeForm = false;
      axios.post("http://localhost:8000/api/" + this.$store.state.database + "/recipeIngredients", newIngredients)
          .then(response => console.log(response));
      this.showRecipeForm = true
    },
    addRecipe(recipe) {
      const newRecipe = {
        username: this.$store.state.username,
        recipeName: this.name,
        description: recipe.description,
        imageURL: recipe.imageURL,
      }
      this.showRecipeForm = false;
      axios.post("http://localhost:8000/api/" + this.$store.state.database + "/recipe", newRecipe)
          .then(response => console.log(response))
          .catch(error => {
            alert("Your recipe could not be added. Please check, whether you are signed in and you entered your values correctly.\n" + error)
            console.log(error)
        })
    }
  }
}
</script>

<style scoped>
</style>