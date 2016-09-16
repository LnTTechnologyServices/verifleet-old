import loginComponent from './login.component';

let loginModule = angular.module('loginCard', [])
  .component('loginCard', loginComponent);
  
export default loginModule;
