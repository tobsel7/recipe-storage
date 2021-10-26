<template>
  <div class="ingredients-control">
    <table class="center">
      <tr>
        <td>Ingredient name</td>
        <td>Amount [g]</td>
      </tr>
        <tr v-for="ingredient in ingredients" :key="ingredient.a">
          <td>
            <input name="name[]" v-model="ingredient.name">
          </td>
          <td>
            <input name="amount[]" v-model="ingredient.amount">
          </td>
        </tr>
    </table>

    <button @click="addIngredient">
      Add ingredient
    </button>
    <button @click="finish">
      Finish
    </button>
  </div>
</template>

<script>

export default {
name: "IngredientsForm",
  data() {
    return {
      ingredients: []
    }
  },
  methods: {
    addIngredient: function () {
      this.ingredients.push({ ingredient: '', amount: '' });
    },
    finish: function() {
      this.$emit("new-ingredients", this.ingredients)
      this.ingredients = []
    }
  },
  emits: ["new-ingredients"]
}
</script>

<style scoped>

</style>