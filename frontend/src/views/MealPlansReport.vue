<template>
  <div class="box">
    <h1>Meal Plans and Recipes Report</h1>
    <table class="center" v-bind:mealplans="mealplans">
      <tr>
        <th>Name</th>
        <th>Description</th>
        <th>User name</th>
        <th>Created on</th>
      </tr>
      <tr v-for = "plan in mealplans" :key = "plan.Name">
        <td>{{plan.Name}} </td>
        <td>{{plan.Description}} </td>
        <td>{{plan.UserName}} </td>
        <td>{{plan.Created}} </td>
      </tr>
    </table>
  </div>
</template>

<script>
import axios from "axios";
export default {
  name: "MealPlansReport",
  data() {
    return  {
      mealplans : []
    }
  },
  methods: {
   getMealPlans() {
      axios.get("http://localhost:8000/api/" + this.$store.state.database + "/mealplansRecipes")
        .then(response => {
          this.mealplans = response.data
          //alert("Meal Plans loaded");
        })
        .catch(err => {
          alert("An unexpected error occured: " + err);
        })
    }
  },
  created() {
    this.getMealPlans()
  }
}
</script>

<style scoped>
th, td {
  padding: 15px;
  text-align: left;
  border-bottom: 1px solid black;
}
tr:hover {background-color: #f5f5f5;}
</style>