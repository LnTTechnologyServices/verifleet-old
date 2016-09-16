import controller from './moonGauge.controller';

import './moonGauge.scss';

var template;
if(!!window.ionic) {
  require('./moonGauge.mobile.scss');
  template = require('./moonGauge.mobile.html');
} else {
  require('./moonGauge.web.scss');
  template = require('./moonGauge.web.html');
}

let moonGaugeComponent = {
  restrict: 'E',
  bindings: {
    value: '<',
    decimals: '<',
    text: '<',
    unit: '<',
    min: '<',
    max: '<',
    endAngle: '<',
    startAngle: '<'
  },
  template,
  controller,
  controllerAs: 'vm'
};

export default moonGaugeComponent;
