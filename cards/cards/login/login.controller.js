class LoginCardController {
  constructor($http, $state, store, auth, $timeout) {
    "ngInject";
    this.$http = $http
    this.$state = $state
    this.store = store
    this.auth = auth;
    this.$timeout = $timeout

    this.showState = 'login'

    this.user = {}
  }

  login(event) {
    // dont refresh on submit
    event.preventDefault();

    this.loginError = ''

    if(this.user.email && this.user.password) {
      this.loading = true;
      let data = {email: this.user.email, password: this.user.password}
      this.auth.login(data).then((response) => {
        this.loading = false;
        // console.log("Login response: ", response)
        if(this.auth.isAuthenticated) {
          this.$timeout(() => {
            this.$state.go(this.$state.params.previous)
          })
        } else {
          // "Client Error: {"message":"The email has already been taken.","status_code":400}"
          let message = response.data
          let errorMessage = message
          try {
            errorMessage = JSON.parse(message.replace("Client Error: ", "")).message
          } catch(e) {
            console.log("error parsing response: ", e)
            console.warn("The 'Client Error: ' portion of the register response may have been removed! Update me!")
          }
          this.loginError = errorMessage || "Invalid username or password"
        }
      })
    }
  }

  register(event) {
    event.preventDefault();

    this.registerSuccess = false;
    this.registerError = '';

    if(this.user.email && this.user.password && this.user.name) {
      this.loading = true;
      let data = {name: this.user.name, email: this.user.email, password: this.user.password}
      this.auth.register(data).then((response) => {
        this.loading = false;
        // console.log("Register response: ", response)
        if(response.data == "success") {
          this.registerSuccess = true
          this.registerError = ''
        } else {
          // "Client Error: {"message":"The email has already been taken.","status_code":400}"
          let message = response.data
          let errorMessage = message
          try {
            errorMessage = JSON.parse(message.replace("Client Error: ", "")).message
          } catch(e) {
            console.log("error parsing response: ", e)
            console.warn("The 'Client Error: ' portion of the register response may have been removed! Update me!")
          }
          this.registerError = errorMessage
        }
      })
    } else {
      let errors = [];
      if(!this.user.name) {
        errors.push("No name given.")
      }
      if(!this.user.email) {
        errors.push("No email supplied.")
      }
      if(!this.user.password) {
        errors.push("No password supplied")
      }
      this.registerError = errors.join(" ")
    }
  }

  reset(event) {
    // TODO: wait for this to be implemented in Murano
    event.preventDefault();
  }

  changeState(toState) {
    this.loginError = ""
    this.registerError = ""
    this.showState = toState;
  }
}

export default LoginCardController;
