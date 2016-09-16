class FleetHealthController {
  constructor($element, $timeout) {
    "ngInject";
    this.$element = $element
    this.name = 'fleetHealth';

    // TODO: implement ionic switch in provider
    this.isIonic = !!window.ionic;
    this.infoOverlayHidden = true;

    this.normalStatus = {
      name: 'normal',
      label: this.normalLabel || 'Normal'
    };

    this.alarmStatus = {
      name: 'alarm',
      label: this.alarmLabel || 'Alarm'
    };

    this.warningStatus = {
      name: 'warning',
      label: this.warningLabel || 'Warning'
    };

    this.activeStatus = this.normalStatus;
    var self = this;

    // this.data is expected to be an object with the following structure (for example):
    // {
    //   "total": 40,
    //   "normal": 15,
    //   "warning": 5,
    //   "alarm": 20
    // }
    this.seriesData = this.createChartData(this.data);

    this.options = {
      chart: {
        type: 'pieChart',
        height: 500,
        donut: true,
        x: function(d){
          return d.key;
        },
        y: function(d){
          return d.y;
        },
        showLabels: false,
        pie: {
          startAngle: function(d) { return d.startAngle},
          endAngle: function(d) { return d.endAngle},
          dispatch: {
            chartClick: function(e) { console.log(e) },
            elementClick: function(e) {
              console.log("Clicked a chunk! ", e)
              var selectedStatusName = e.name;
              var availableStatusOptions = [self.normalStatus, self.alarmStatus, self.warningStatus];
              var selectedStatus = availableStatusOptions.find(function(statusOption) {
                return selectedStatusName === statusOption.label;
              });
              //self.setActiveStatus(selectedStatus);
            },
          }
        },
        duration: 500,
        //color: function(d,i){return c10(i)},
        showLegend: false,
        tooltip: {
          enabled: false
        },
        //tooltips events
        dispatch: {
          stateChange: function(e) { console.log(e) } ,
          changeState: function(e) { console.log(e) } ,
          renderEnd: (e) => {
            var grads = d3.select($element[0]).select("svg").append("defs").selectAll("radialGradient").data(this.seriesData)
              .enter().append("radialGradient")
              .attr("gradientUnits", "userSpaceOnUse")
              .attr("cx", 0)
              .attr("cy", 0)
              .attr("r", "100%")
              .attr("id", function(d, i) {
                return "grad_fleethealth" + i;
              });
            grads.append("stop").attr("offset", "0.2%").style("stop-color", "white");
            grads.append("stop").attr("offset", "27%").style("stop-color", function(d, i) {
              return d.color
            });
            d3.select($element[0]).selectAll(".nv-slice path").attr("fill", function(d, i) {
              return "url(#grad_fleethealth" + i + ")";
            })
          }
        },
      },
    };
    var c10 = d3.scale.category10();
    $timeout(() => {
      // need to call this to trigger a refresh after initialization otherwise
      // the charts look weird (small and uncolored)
      this.api.refresh()
    }, 10)
    /*
    this.chartConfig = {
        loading: false,
        options: {
          chart: {
            backgroundColor: 'transparent',
            type: 'pie',
          },
          colors: [{
            linearGradient: {
              x1: 0,
              y1: 0,
              x2: 0,
              y2: 1,
            },
            stops: [
              [0, '#E54538'],
              [1, '#B21205'],
            ]
          }, {
            linearGradient: {
              x1: 0,
              y1: 0,
              x2: 0,
              y2: 1,
            },
            stops: [
              [0, '#BFCCDD'],
              [1, '#8E9DAE']
            ]
          }, {
            linearGradient: {
              x1: 0,
              y1: 0,
              x2: 0,
              y2: 1,
            },
            stops: [
              [0, '#8FE557'],
              [1, '#3A9002'],
            ]
          },],
          credits: {
            enabled: false,
          },
          plotOptions: {
            pie: {
              shadow: true,
              dataLabels: {
                enabled: false,
              },
              innerSize: '70%',
              point: {
                events: {
                  click: function(e) {
                    var selectedStatusName = this.name;
                    var availableStatusOptions = [self.normalStatus, self.alarmStatus, self.warningStatus];
                    var selectedStatus = availableStatusOptions.find(function(statusOption) {
                      return selectedStatusName === statusOption.label;
                    });
                    self.setActiveStatus(selectedStatus);
                  }
                }
              },
              size: '100%',
            },
          },
          title: {
            text: null,
            floating: true,
          },
          tooltip: {
            enabled: false,
          },
        },
        series: [
          {
            "name": "Some data",
            "data":this.fleetHealthData,
            "id": "series-0",
            "type": "pie"
          }
        ]
      }
      */
  };

  createChartData(rawData) {
    let alarmCount = rawData.alarm || 0;
    let warningCount = rawData.warning || 0;
    let normalCount = rawData.normal || 0;

    return [
      {
        key: this.alarmStatus.label,
        y: alarmCount,
        color: '#BC0E00',
        //selected: this.activeStatus === this.alarmStatus,
        //shadow: this.activeStatus === this.alarmStatus,
        //sliced: false
      },
      {
        key: this.warningStatus.label,
        y: warningCount,
        color: "#F4CB00",
        //selected: this.activeStatus === this.warningStatus,
        //shadow: this.activeStatus === this.warningStatus,
        //sliced: false
      },
      {
        key: this.normalStatus.label,
        y: normalCount,
        color: '#37C91A',
        //selected: this.activeStatus === this.normalStatus,
        //shadow: this.activeStatus === this.normalStatus,
        //sliced: false
      }]
  }

  redraw() {
    this.seriesData = this.createChartData(this.fleetHealthData);
  }

  $onChanges(rawData) {
    this.fleetHealthData = rawData.data.currentValue;
    this.redraw();
  }

  getActiveStatPercentage() {
    return Math.round((this.data[this.activeStatus.name] / this.data.total) * 100);
  }

  getActiveStatusLabel() {
    return `IN ${this.activeStatus.label.toUpperCase()} STATE`;
  }

  setActiveStatus(status) {
    this.activeStatus = status;
    this.redraw();
    this.scope.$applyAsync(); //trigger "watcher" set up in the component. Using applyAsync because $apply() seemed to get hung-up and eventually throw errors
  }

  showInfoOverlay() {
    this.infoOverlayHidden = false;
  }

  hideInfoOverlay() {
    this.infoOverlayHidden = true;
  }
}


export default FleetHealthController;
