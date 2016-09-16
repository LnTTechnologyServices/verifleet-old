import DataViz from './dataViz';
import LoginCard from './login';

export default angular
  .module('cards', [
    DataViz.name,
    LoginCard.name
  ])
