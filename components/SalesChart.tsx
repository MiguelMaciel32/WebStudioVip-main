// components/SalesChart.tsx

import { ResponsiveLine } from '@nivo/line';

interface SalesChartProps {
  className?: string;
}

export default function SalesChart({ className }: SalesChartProps) {
  return (
    <div className={className}>
      <ResponsiveLine
        data={[
          {
            id: "Desktop",
            data: [
              { x: "Setembro", y: 21 },
              { x: "Outubro", y: 11 },
              { x: "Novembro", y: 31 },
              { x: "Dezembro", y: 44 },
            ],
          },
          {
            id: "Mobile",
            data: [
              { x: "Setembro", y: 11 },
              { x: "Outubro", y: 22 },
              { x: "Novembro", y: 31 },
              { x: "Dezembro", y: 42 },
            ],
          },
        ]}
        margin={{ top: 10, right: 10, bottom: 40, left: 40 }}
        xScale={{ type: "point" }}
        yScale={{ type: "linear", min: 0, max: "auto" }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 0,
          tickPadding: 16,
        }}
        axisLeft={{
          tickSize: 0,
          tickValues: 5,
          tickPadding: 16,
        }}
        colors={["#2563eb", "#e11d48"]}
        pointSize={6}
        useMesh={true}
        curve="monotoneX"
        enableArea={true}
        gridYValues={6}
        defs={[
          {
            id: "line-chart-gradient",
            type: "linearGradient",
            colors: [
              { offset: 0, color: "inherit" },
              { offset: 200, color: "inherit", opacity: 0 },
            ],
          },
        ]}
        fill={[{ match: "*", id: "line-chart-gradient" }]}
        theme={{
          tooltip: {
            chip: { borderRadius: "9999px" },
            container: {
              fontSize: "12px",
              textTransform: "capitalize",
              borderRadius: "6px",
            },
          },
          grid: {
            line: { stroke: "#f3f4f6" },
          },
        }}
        role="application"
      />
    </div>
  );
}
