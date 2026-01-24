import React from "react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

const COLORS = [
  "#3b82f6", // Blue
  "#ef4444", // Red
  "#ffffff", // white
];

const PieChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) =>
            `${name} ${(percent * 100).toFixed(0)}%`
          }
          outerRadius={80}
          innerRadius={60}
          stroke="none"
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "#1f2229",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            fontSize: "12px",
            color: "#e5e7eb",
          }}
          itemStyle={{ color: "#e5e7eb" }}
        />
        <Legend
          wrapperStyle={{
            paddingTop: "20px",
            fontSize: "12px",
            color: "#9ca3af",
          }}
          iconType="circle"
        />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
};

export default PieChart;
