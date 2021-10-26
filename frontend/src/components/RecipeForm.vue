<template>
  <form @submit="addRecipe" class="add-form">
    <div class="form-control">
      <table class="center">
        <tr>
          <td>
            <label>Description: </label>
          </td>
          <td>
            <input
                type="text"
                v-model="description"
                name="description"
                placeholder="First prepare..."
            />
          </td>
        </tr>
      </table>
    </div>

    <div class="form-control">
      <table class="center">
        <tr>
          <td>
            <label>Image URL: </label>
          </td>
          <td>
            <input
                type="text"
                v-model="imageURL"
                name="imageURL"
                placeholder="A link to an image..."
            />
          </td>
        </tr>
      </table>
    </div>
    <input type="submit" value="Create recipe" class ="button"/>
  </form>
</template>

<script>
export default {
name: "RecipeForm",
  data() {
    return {
      description: "",
      imageURL: ""
    }
  },
  methods : {
    addRecipe(e) {
      e.preventDefault()
      const newRecipeDescription =  {
        "description": this.description,
        "imageURL": this.imageURL
      }
      this.description = ""
      this.imageURL = ""
      this.$emit("new-recipe", newRecipeDescription)

    }
  },
  emits: ["new-recipe"]
}
</script>

<style scoped>

</style>