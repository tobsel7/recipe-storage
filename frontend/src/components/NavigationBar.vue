<template>
        <ul>
          <li><router-link to="/">Home</router-link></li>
          <li><router-link to="/recipes">Recipes</router-link></li>
          <li><router-link to="/ingredients">Ingredients</router-link></li>
          <li><router-link to="/reports/mealplans">Meal Plans/Recipes</router-link></li>
          <li><router-link to="/reports/properties">Most noticed properties</router-link></li>
        </ul>

</template>

<script>
export default {
    name: "NavigationBar"
};
</script>

<style scoped>
ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background-color: #154018;
}

li {
  float: left;
}

li a {
  display: block;
  color: white;
  text-align: center;
  padding: 14px 16px;
  text-decoration: none;
}

li a:hover {
  background-color: #0b3517;
}
</style>
