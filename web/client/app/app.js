import angular from 'angular';

// pcc imports
import exosite from 'exosite-pcc/exosite'; // wayyyy faster for rebuilding w/ same module

// moment imports
import moment from 'moment';

import nvd3 from 'angular-nvd3';

// redux imports
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';

// redux state reducer imports
import { userReducer, userNotificationReducer, currentUserReducer } from './api/reducers/userReducer';
import { deviceReducer } from './api/reducers/deviceReducer';
import { alarmReducer } from './api/reducers/alarmReducer';
import { activityReducer } from './api/reducers/activityReducer';
import { subscriptionReducer, websocketReducer } from './api/reducers/websocketReducer';
import { loadingReducer, updatedReducer } from './api/reducers';

// api imports
import deviceService from './api/deviceService';
import userService from './api/userService';
import websocket from './api/websocketFactory';
import auth from './api/authentication';

// app specific imports
import Common from './common/common';
import Components from './components/components';
import AppComponent from './app.component';

// javascript extension imports - currently just provides Array.prototype.last()
import './javascriptExtensions';

// project configuration
import { projectConfig } from './config';

if (!projectConfig.api_base_url) {
  console.error("No 'api_base_url' specified in file './config'!")
}
if (!projectConfig.ws_url) {
  console.error("No 'ws_url' specified in file './config'!")
}
if (!projectConfig.name) {
  console.error("No project name specified in './config'!")
}
if (!projectConfig.login_url) {
  console.error("No 'login_url' specified in './config'!")
}

// load external modules into our application,
// as well as our internal modules / services / factories
angular.module('app', [
  'ui.router',
  'ngAnimate',
  'ngMaterial',
  'ngMdIcons',
  'ngRedux',
  'angular-storage',
  'angular-jwt',
  'angularMoment',
  'nvd3',
  Common.name,
  Components.name,
  auth.name,
  exosite.name,
  websocket.name,
])
  .service("deviceService", deviceService)
  .service("userService", userService)
  .constant("projectConfig", projectConfig)
  .config(($mdThemingProvider) => {
    "ngInject";

    $mdThemingProvider.extendPalette('blue-grey', {
      '500': '001342',
    });
    $mdThemingProvider.extendPalette('yellow', {
      '500': 'ffb91d',
    });

    $mdThemingProvider.theme('default')
      .primaryPalette('blue-grey', {
        'default': '500'
      })
      .accentPalette('yellow', {
        'default': '500'
      })
  })
  .config($ngReduxProvider => {
    "ngInject";
    // redux store configuration
    // this sets the basic data that's available in the redux store
    // the deviceService / userService / websocketFactory will
    // modify this redux store, and the application's controllers
    // can request data through these services.
    // The controllers should have a hook for the redux store to be triggered
    // when the data has been modified
    $ngReduxProvider.createStoreWith({
      devices: deviceReducer,
      isLoading: loadingReducer,
      lastUpdated: updatedReducer,
      current_user: currentUserReducer,
      users: userReducer,
      notifications: userNotificationReducer,
      activities: activityReducer,
      alarms: alarmReducer,
      subscriptions: subscriptionReducer,
      websocket: websocketReducer
    }, [thunk, createLogger({
      duration: true,
      collapsed: true
    })
    ]);
  })
  .config((authProvider, projectConfig) => {
    "ngInject";
    // initialize our authentication service
    authProvider.init({
      loginUrl: projectConfig.login_url,
      profileUrl: projectConfig.profile_url,
      registerUrl: projectConfig.register_url,
      resetUrl: projectConfig.reset_url
    })
  })
  .config(($httpProvider) => {
    "ngInject";
    // authentication interceptor is from our authentication service
    $httpProvider.interceptors.push('authenticationInterceptor');
  })
  .run(($rootScope, auth, store, jwtHelper, $state, $timeout, $ngRedux, websocket, userService) => {
  'ngInject';

  let started = false;
  // handle checking that the user is logged in w/ a valid token
  $rootScope.$on('$stateChangeStart', function(event, toState) {
    // console.log("going to state: ", toState)
    // this assumes that all states other than the login page require login
    // console.log("toState: ", toState)
    if(toState.name == "login") {
      started = false;
    }
    if(toState.name !== "login") {
      // console.log("Not going to login")
      var token = store.get('token');
      // console.log("Token: ", token)
      if (token) {
        if (!jwtHelper.isTokenExpired(token)) {
          if(!started) {
            // good to go - get user profile
            // console.log("Getting profile")
            auth.getProfile().then((profile) => {
              if(profile) {
                $ngRedux.dispatch(userService.userLoggedIn(store.get('profile')));
                $ngRedux.dispatch(websocket.shouldConnect(true));
                websocket.start(projectConfig.ws_url);
              } else {
                auth.logout().then(() => {
                  $state.go("login", {previous: toState.name});
                });
              }
            })
            // set started flag so we don't keep grabbing profile on flag
            started = true;
          } else {
            // we're already set up, so don't do anything
          }
        } else {
          // jwt is expired, remove token and profile and redirect to login
          console.log("jwt is expired, redirecting to login")
          auth.logout().then(() => {
            $state.go("login", {previous: toState.name})
          })
        }
      } else {
        // no token, go to login state
        $timeout(() => {
          $state.go("login", {previous: toState.name})
        })
      }
    }
  });
})

  .component('app', AppComponent);
