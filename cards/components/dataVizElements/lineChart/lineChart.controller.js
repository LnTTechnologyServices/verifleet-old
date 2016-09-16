class LineChartController {
  constructor($timeout) {
    "ngInject";

    let c10 = d3.scale.category10();

    this.defaultOptions = {
      chart: {
        type: "lineWithFocusChart",
        height: 450,
        margin: {
          top: 20,
          right: 60,
          bottom: 60,
          left: 60
        },
        color: function(d,i) {
          if(d.color) {
            return d.color
          }
          return c10(i)
        },
        useInteractiveGuideline: true,
        interactiveLayer: {
          tooltip: {
            contentGenerator: function(data) {
              // custom tooltip on hover
              let html = (_.map(data.series, function(series) {
                let formattedTime = d3.time.format("%y-%m-%d %I:%M:%S%p")(new Date(series.data.x))
                let formattedNumber = d3.format('.3f')(series.data.y)
                return `<div><span style='color:${series.color}'>${series.key}</span> <b>${formattedNumber}</b> @ ${formattedTime}</div>`
              })).join("")
              return html
            }
          }
        },
        yAxis: {
          tickFormat: function(datapoint) {
            return d3.format('.2r')(datapoint)
          }
        },
        xAxis: {
          tickFormat: function(timestamp) {
            if(moment().diff(timestamp, 'days') > 1) {
              return d3.time.format('%m-%d %I:%M%p')(new Date(timestamp))
            } else if (moment().diff(timestamp, 'hours') > 1) {
              if(moment().day() != moment(timestamp).day()) {
                return d3.time.format('%m-%d %I:%M%p')(new Date(timestamp))
              } else {
                return d3.time.format('%I:%M%p')(new Date(timestamp))
              }
            } else {
              return d3.time.format('%I:%M:%S%p')(new Date(timestamp))
            }
          },
          ticks:5,
          showMaxMin : false
        },
        x2Axis: {
          tickFormat: function(d) {
            return d3.time.format(' %m-%d %I:%M%p')(new Date(d))
          },
          ticks: 5,
          showMaxMin : false
        }
      }
    }

    // take default line settings and override with whatever may be
    // passed in for options
    this.config = Object.assign(this.defaultOptions, this.options)

    $timeout(() => {
      this.api.refresh()
    }, 0)
  }
}

export default LineChartController;
