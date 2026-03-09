import React from "react";
import { Card } from "react-bootstrap";

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

const WIDTH = 600;
const HEIGHT = 300;
const PADDING = { top: 20, right: 30, bottom: 40, left: 50 };

const chartW = WIDTH - PADDING.left - PADDING.right;
const chartH = HEIGHT - PADDING.top - PADDING.bottom;

const maxVal = Math.max(...data.map((d) => d.appStore));
const minVal = 0;

const points = data.map((d, i) => ({
  x: PADDING.left + (i / (data.length - 1)) * chartW,
  y: PADDING.top + chartH - ((d.appStore - minVal) / (maxVal - minVal)) * chartH,
}));

const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
const areaPath = `${linePath} L${points[points.length - 1].x},${PADDING.top + chartH} L${points[0].x},${PADDING.top + chartH} Z`;

// Y-axis tick values
const yTicks = [0, 40, 80, 120, 160];

function ChartOne() {
  return (
    <Card>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{ width: "100%", height: "auto" }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ab9769" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ab9769" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Y-axis grid lines and labels */}
        {yTicks.map((tick) => {
          const y = PADDING.top + chartH - ((tick - minVal) / (maxVal - minVal)) * chartH;
          return (
            <g key={tick}>
              <line x1={PADDING.left} y1={y} x2={PADDING.left + chartW} y2={y} stroke="#3a3a3a" strokeWidth="0.5" />
              <text x={PADDING.left - 8} y={y + 4} textAnchor="end" fill="#888" fontSize="11">
                {tick}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaPath} fill="url(#areaGrad)" />

        {/* Line */}
        <path d={linePath} fill="none" stroke="#ab9769" strokeWidth="2" />

        {/* X-axis labels */}
        {data.map((d, i) => (
          <text
            key={d.month}
            x={PADDING.left + (i / (data.length - 1)) * chartW}
            y={HEIGHT - 8}
            textAnchor="middle"
            fill="#888"
            fontSize="11"
          >
            {d.month}
          </text>
        ))}
      </svg>
    </Card>
  );
}

export default ChartOne;
