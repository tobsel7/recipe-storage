<template>
  <div class="box">
    <h1>New Ingredient</h1>
    <table class="center">
      <tr>
        <td>
          <label>Name:</label>
        </td>
        <td>
          <input id="name"
                 type="text"
                 v-model="name"
                 name="name"
                 placeholder="Apple" />
        </td>
      </tr>
      <tr>
        <td>
          <label>Producer:</label>
        </td>
        <td>
          <input id="producer"
                 type="text"
                 v-model="producer"
                 name="producer"
                 placeholder="Obstgarten Nikles" />
        </td>
      </tr>
      <tr>
        <td colspan="2">
          <label>Nutritions per 100g:</label>
        </td>
      </tr>
      <tr>
        <td>
          <label>KCal:</label>
        </td>
        <td>
          <input id="kcal"
                 type="number"
                 min="0"
                 max="900"
                 v-model="kcal"
                 name="kcal"
                 placeholder="52" />
        </td>
      </tr>
      <tr>
        <td>
          <label>Carbs:</label>
        </td>
        <td>
          <input id="carbs"
                 type="number"
                 min="0"
                 max="100"
                 v-model="carbs"
                 name="carbs"
                 placeholder="14"/>
        </td>
      </tr>
      <tr>
        <td>
          <label>Fat:</label>
        </td>
        <td>
          <input id="fat"
                 type="number"
                 min="0"
                 max="100"
                 v-model="fat"
                 name="fat"
                 placeholder="0.2" />
        </td>
      </tr>
      <tr>
        <td>
          <label>Protein:</label>
        </td>
        <td>
          <input id="protein"
                 type="number"
                 min="0"
                 max="100"
                 v-model="protein"
                 name="protein"
                 placeholder="0.3" />
        </td>
      </tr>
      <tr>
        <td colspan="2">
          <button @click="addIngredient" type="button">Add Ingredient</button>
        </td>
      </tr>
    </table>
    <label id="resultMsg"></label>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "NewIngredient",
  methods: {
    addIngredient() {
      if(!this.name || this.name.empty) {
        alert("Please enter the name of the Ingredient!");
        return;
      }
      if(!this.kcal || this.kcal < 0 || this.kcal > 900) {
        alert("Kcal must be in the range of 0 to 900!");
        return;
      }
      if(!this.carbs || this.carbs < 0 || this.carbs > 100 || !this.fat || this.fat < 0 || this.fat > 100 || !this.protein || this.protein < 0 || this.protein > 100) {
        alert("Nutritions must be in the range of 0 to 100 grams!")
        return;
      }

      const newIngredient = {
        name : this.name,
        producer : this.producer,
        kcal : this.kcal,
        carbs : this.carbs,
        fat : this.fat,
        protein : this.protein
      }

      axios.post("http://localhost:8000/api/" + this.$store.state.database + "/addIngredient", newIngredient)
        .then(response => {
          document.getElementById("resultMsg").innerHTML=response.data.Message + "<br>" + this.name + "(" + this.producer + "): " + this.kcal + "kcal, " + this.carbs + "g carbs, " + this.fat + "g fat, " + this.protein + "g protein";
        })
        .catch(error => {
          document.getElementById("resultMsg").innerHTML=error.data.Message;
        });

      document.getElementById("name").value='';
      document.getElementById("producer").value='';
      document.getElementById("kcal").value='';
      document.getElementById("carbs").value='';
      document.getElementById("fat").value='';
      document.getElementById("protein").value='';
    }
  }
}
</script>
<style scoped>
</style>