<template>
  <div class="login">

    <h3>Logged in user: {{this.$store.state.username}}</h3>
    <form @submit="login" class="login-form">
      <table class="center">
        <tr class="form-control">
          <td>
            <label>Username:</label>
          </td>
          <td>
            <input
                type="text"
                v-model="username"
                name="username"
                placeholder="Enter user name..." />
          </td>
        </tr>
        <tr class="form-control">
          <td>
            <label>Password:</label>
          </td>
          <td>
            <input
                type="text"
                v-model="password"
                name="password"
                placeholder="Enter password..."/>
          </td>
        </tr>
        <tr>
          <td colspan="2">
            <input type="submit" value="Log in" class="btn btn-block" />
          </td>
        </tr>
      </table>
    </form>
  </div>
</template>

<script>
export default {
name: "LogIn",
  data() {
    return {
      username: "",
      password: ""
    }
  },
  methods: {
    login(e) {
      e.preventDefault()
      if (!this.username) {
        alert("Please enter a name before trying to log in!")
        return
      }
      this.$store.state.username = this.username
      this.username = ""
      this.password = ""

    }
  }
}
</script>

<style scoped>
</style>