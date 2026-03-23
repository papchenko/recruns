import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function WeightChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid stroke="#222" />
        <XAxis dataKey="date" stroke="#888" />
        <YAxis stroke="#888" />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="weight"
          stroke="#ff3c00"
          strokeWidth={3}
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}