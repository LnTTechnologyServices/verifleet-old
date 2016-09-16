let authentication = angular.module("authentication", [])
.provider("auth", [function() {
  var config;
  this.init = function(options) {
    config = options;
  }
  this.$get = ['$rootScope', '$q', '$http', 'store', '$state', '$timeout',
    function($rootScope, $q, $http, store, $state, $timeout) {
      var auth = {
        isAuthenticated: false,
        getProfile: function() {
          let token = store.get("token")
          let data = {"token": token}
          return $http({
            url: config.profileUrl,
            method: "POST",
            data: data,
            headers : {
              'Content-Type': 'application/json'
            }
          })
          .then((response) => {
            auth.isAuthenticated = true;
            store.set("profile", response.data)
            return response.data
          }, (response) => {
            // error getting profile
            // there might be cases where this request fails, but not under a 401 error.
            // not sure the best course of action there
            if(response.status == 401) {
              // we had a token variable, but it wasn't valid, so return false for the profile
              // and handle the state change in the profile promise
              return false
            }
          })
        },
        register: function(data) {
          return $http({
            url: config.registerUrl,
            method: "PUT",
            data: data,
            headers : {
              'Content-Type': 'application/json'
            }
          })
          .then((response) => {
            return response
          }, (response) => {
            return response
          })
        },
        reset: function(data) {
          // TODO: test this after it's implemented in Murano
          return $http({
            url: config.resetUrl,
            method: "POST",
            data: data,
            headers : {
              'Content-Type': 'application/json'
            }
          })
          .then((response) => {
            return response
          }, (response) => {
            return response
          })
        },
        // data is expected to be an object w/ keys email and password
        login: function(data) {
          return $http({
            url: config.loginUrl,
            method: "POST",
            data: data,
            headers : {
              'Content-Type': 'application/json'
            }
          })
          .then((response) => {
            console.log("response: ", response)
            if(response.data && response.data.token) {
              store.set("token", response.data.token)
              auth.isAuthenticated = true;
              return response;
            }
          }, (response) => {
            auth.isAuthenticated = false;
            return response
          })
        },
        logout: function() {
          let deferred = $q.defer();
          $timeout(() => {
            store.remove("profile")
            store.remove("token")
            auth.isAuthenticated = false;
            deferred.resolve();
          })
          return deferred.promise;
        }
      };
      return auth
    }]
}])
.factory('authenticationInterceptor', (store) => {
  "ngInject";
  // TODO AUTH: modify this to use the Murano login system
  return {
    request: (config) => {
      // not sure what happens if user token changes - might need to refresh
      // to re-instantiate this (get the new token)
      let token = store.get("token")
      config.headers['Authorization'] = `Bearer ${token}`
      return config
    }
  }
})

export default authentication;
