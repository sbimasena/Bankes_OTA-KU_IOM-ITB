"use client";

import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface TrendData {
  registrationTrend: Array<{ week: string; count: number }>;
  paymentTrend: Array<{ week: string; count: number; totalAmount: number }>;
  passageTrend: Array<{ stage: string; passed: number }>;
}

interface TrendChartsProps {
  data: TrendData;
}

export default function TrendCharts({ data }: TrendChartsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      notation: "compact",
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Registration Trend */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4 text-gray-900">
          Tren Pendaftaran Per Minggu
        </h3>
        {data.registrationTrend && data.registrationTrend.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.registrationTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip
                contentStyle={{ backgroundColor: "#f3f4f6", border: "1px solid #d1d5db" }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-600 text-center py-8">Tidak ada data</p>
        )}
      </Card>

      {/* Payment Trend */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4 text-gray-900">
          Tren Pembayaran Per Minggu
        </h3>
        {data.paymentTrend && data.paymentTrend.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.paymentTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis yAxisId="left" label={{ value: "Jumlah Transaksi", angle: -90, position: "insideLeft" }} />
              <YAxis
                yAxisId="right"
                orientation="right"
                label={{ value: "Total Dana", angle: 90, position: "insideRight" }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: "#f3f4f6", border: "1px solid #d1d5db" }}
                formatter={(value: any, name: string) => {
                  if (name === "totalAmount") {
                    return [formatCurrency(value), "Total Dana"];
                  }
                  return [value, "Jumlah Transaksi"];
                }}
              />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="count"
                fill="#10b981"
                name="Jumlah Transaksi"
              />
              <Bar
                yAxisId="right"
                dataKey="totalAmount"
                fill="#8b5cf6"
                name="Total Dana"
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-600 text-center py-8">Tidak ada data</p>
        )}
      </Card>

      {/* Passage Funnel */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4 text-gray-900">
          Funnel Kelulusan Per Tahap
        </h3>
        {data.passageTrend && data.passageTrend.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={data.passageTrend}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="stage" type="category" width={140} />
              <Tooltip
                contentStyle={{ backgroundColor: "#f3f4f6", border: "1px solid #d1d5db" }}
              />
              <Bar dataKey="passed" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-600 text-center py-8">Tidak ada data</p>
        )}
      </Card>
    </div>
  );
}
