let logo = require("./logo.png")
let tagline = require('./tagline.jpg')

class LoginController {
  constructor(auth, projectConfig) {
    'ngInject';
    this.projectConfig = projectConfig
    this.auth = auth
    this.logo = logo
    this.tagline = tagline
  }

}

export default LoginController;
