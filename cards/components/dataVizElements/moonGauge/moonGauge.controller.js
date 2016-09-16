class MoonGaugeController {
  constructor($timeout, $interval, $element, $scope) {
    "ngInject";

    this.min = this.min || 0
    this.max = this.max || 100
    this.value = this.value || 50
    this.decimals = 1
    this.data = [{
      key: 'value',
      y: this.value,
      color: '#0AC410'
    }, {
      key: 'fill',
      y: this.max - this.value,
      color: '#FFFFFF'
    }];

    this.options = {
      chart: {
        type: 'pieChart',
        donut: true,
        arcsRadius: _.map(_.range(this.data.length), () => {
          return {
            inner: 1.2,
            outer: 1.5
          }
        }),
        growOnHover: false,
        x: function(d) {
          return d.key;
        },
        y: function(d) {
          return d.y;
        },
        showLabels: false,
        pie: {
          startAngle: function(d) {
            return d.startAngle / 2 - Math.PI / 2
          },
          endAngle: function(d) {
            return d.endAngle / 2 - Math.PI / 2
          }
        },
        transitionDuration: 500,
        duration: 500,
        showLegend: false,
        tooltip: {
          enabled: false
        },
        dispatch: {
          renderEnd: (e) => {}
        },
      }
    };

    $timeout(() => {
      this.api.refresh()
    }, 0)
  }

  updatePlot() {
    this.data[0].y = this.value
    this.data[1].y = (this.max - this.value)
    this.displayValue = Math.round(this.value * (10 ** this.decimals)) / (10 ** this.decimals)
  }

  $onChanges(changes) {
    this.updatePlot()
  }
}

export default MoonGaugeController;
