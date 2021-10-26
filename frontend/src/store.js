import Vue from "vue"
import Vuex from "vuex"

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        username: "Testuser",
        password : "Bestuser1234",
        database: "mysql"
    }
})
