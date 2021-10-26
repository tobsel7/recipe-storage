<template>
  <div class="box">
    <h1>Meal Properties Report</h1>
    <table class="center" v-bind:properties="properties">
      <tr>
        <th>Property</th>
        <th>Amount</th>
      </tr>
      <tr v-for="prop in properties" :key="prop.Name">
        <td>{{prop.Name}}</td>
        <td>{{prop.Amount}}</td>
      </tr>
    </table>
  </div>
</template>

<script>
import axios from "axios";
export default {
  name: "PropertiesReport",
  data() {
    return {
      properties : []
    }
  },
  methods: {
    getProperties() {
      axios.get("http://localhost:8000/api/" + this.$store.state.database + "/propertiesReport")
        .then(response => {
          this.properties = response.data;
        })
    }
  },
  created() {
    this.getProperties();
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