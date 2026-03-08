import React from "react";
import Paper from "@material-ui/core/Paper";

import {
  Chart,
  ArgumentAxis,
  ValueAxis,
  AreaSeries,
  Title,
  Legend,
} from "@devexpress/dx-react-chart-material-ui";
import { withStyles } from "@material-ui/core/styles";
import { ArgumentScale, Animation } from "@devexpress/dx-react-chart";
import { curveCatmullRom, area } from "d3-shape";
import { scalePoint } from "d3-scale";
const data = [
  { month: "Jan", appStore: 101 },
  { month: "Feb", appStore: 89 },
  { month: "Mar", appStore: 107 },
  { month: "Apr", appStore: 113 },
  { month: "May", appStore: 13 },
  { month: "Jun", appStore: 91 },
  { month: "Jul", appStore: 110 },
  { month: "Aug", appStore: 111 },
  { month: "Sep", appStore: 112 },
  { month: "Oct", appStore: 111 },
  { month: "Nov", appStore: 120 },
  { month: "Dec", appStore: 160 },
];
const legendStyles = () => ({
  root: {
    display: "flex",
    margin: "auto",
    flexDirection: "row",
    backgroungColor: "red",
  },
});
const legendRootBase = ({ classes, ...restProps }) => (
  <Legend.Root {...restProps} className={classes.root} />
);
const Root = withStyles(legendStyles, { name: "LegendRoot" })(legendRootBase);
const legendLabelStyles = () => ({
  label: {
    whiteSpace: "nowrap",
  },
});
const legendLabelBase = ({ classes, ...restProps }) => (
  <Legend.Label className={classes.label} {...restProps} />
);
const Label = withStyles(legendLabelStyles, { name: "LegendLabel" })(
  legendLabelBase
);
const demoStyles = () => ({
  chart: {
    paddingRight: "20px",
  },
});

const Area = (props) => (
  <AreaSeries.Path
    {...props}
    path={area()
      .x(({ arg }) => arg)
      .y1(({ val }) => val)
      .y0(({ startVal }) => startVal)
      .curve(curveCatmullRom)}
  />
);
class ChartOne extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      data,
    };
  }

  render() {
    const { data: chartData } = this.state;
    const { classes } = this.props;
    return (
      <Paper>
        <Chart data={chartData} className={classes.chart}>
          <ArgumentScale factory={scalePoint} />
          <ArgumentAxis />
          <ValueAxis />

          <AreaSeries
            // name="App Store"
            valueField="appStore"
            argumentField="month"
            seriesComponent={Area}
          />
          <AreaSeries
            // name="Google Play"
            valueField="googlePlay"
            argumentField="month"
            seriesComponent={Area}
          />
          <Animation />
          {/* <Legend
            position="bottom"
            rootComponent={Root}
            labelComponent={Label}
          /> */}
        </Chart>
      </Paper>
    );
  }
}

export default withStyles(demoStyles, { name: "ChartOne" })(ChartOne);
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
// } from "chart.js";
// import { Line } from "react-chartjs-2";
// import faker from "faker";

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend
// );
// export const options = {
//   responsive: true,
//   plugins: {
//     legend: {

//     },
//     title: {
//       display: true,
//       text: "Chart.js Line Chart",
//     },
//   },
// };

// const labels = ["January", "February", "March", "April", "May", "June", "July"];

// export const data = {
//   labels,
//   datasets: [
//     {
//       label: "Dataset 1",
//       data: labels.map(() => faker.datatype.number({ min: -1000, max: 1000 })),
//       borderColor: "rgb(252, 252, 252)",
//       backgroundColor: "rgba(255, 99, 132, 0.5)",
//     },

//   ],
// };
// function Chart() {
//   return (
//     <div className="container" style={{backgroundColor: "#45a8f7"}}>
//       <Line options={options} data={data} />
//     </div>
//   );
// }

// export default Chart;
