<template>
  <div class="box">
    <h1>Home</h1>
    <button @click="initDB" type="button">Initialize the database</button>
    <button @click="switchDB">{{ this.$store.state.database === "mysql" ? "Switch to mongoDB" : "Switch to MySQL" }}</button>
    <h3>Used database: {{this.$store.state.database}}</h3>
    <LogIn/>
  </div>

</template>

<script>
import axios from "axios";
import LogIn from "@/components/LogIn";

export default {
  name: "Home",
  components: {
    LogIn
  },
  methods: {
    initDB() {
      axios.get("http://localhost:8000/api/" + this.$store.state.database + "/fill")
          .then(response => {
            console.log(response)
            this.mealplans = response.data.message
            alert("Database got Initialized!");
          })
          .catch(err => {
            alert("Could not Initialize DB. Error: " + err.message);
          })
    },
    switchDB() {
      if(this.$store.state.database === "mysql") {
        console.log("Migrating to mongoDB")
        axios.get("http://localhost:8000/api/migration")
            .then(response => {
              console.log("Successfully migrated to mongoDB: " + response)
              this.$store.state.database = "mongo"
            })
            .catch(err => {
              alert("Could not migrate to mongoDB: " + err.message)
            })
      } else {
        this.$store.state.database = "mysql"
      }
    }
  }
}
</script>

<style scoped>

</style>