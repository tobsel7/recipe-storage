<template>
  <div id="app">
    <NavigationBar></NavigationBar>
      <router-view></router-view>
  </div>
</template>

<script>
import NavigationBar from "@/components/NavigationBar";
export default {
  name: 'App',
  components: {
    NavigationBar
  }
}
</script>
<style>
button {
  background-color: #1f5f25;
  margin-right: 20px;
  border: black;
  color: white;
  padding: 4px 14px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
}

button:hover {
  background-color: #0b3517;
}
.box {
  border: 2px solid green;
  padding: 10px;
  margin: 20px;
  text-align: center;
}

.center {
  margin-left: auto;
  margin-right: auto;
}

h1 {
  color: #0f6c14;
  font-weight: bold;
  margin: 4px;
}



* {
  font-family: Calibri,serif;
}
</style>
