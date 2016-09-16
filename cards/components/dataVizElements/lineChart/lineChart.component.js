import controller from './lineChart.controller';

import './lineChart.scss';

var template;
if(!!window.ionic) {
  require('./lineChart.mobile.scss');
  template = require('./lineChart.mobile.html');
} else {
  require('./lineChart.web.scss');
  template = require('./lineChart.web.html');
}

let lineChartComponent = {
  restrict: 'E',
  bindings: {
    data: '<',
    title: '<',
    options: '<'
  },
  template,
  controller,
  controllerAs: 'vm'
};

export default lineChartComponent;
