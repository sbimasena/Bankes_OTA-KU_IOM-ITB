"use client";

import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface TrendData {
  month: string;
  count: number;
  totalAmount?: number;
}

interface ChartsTrendsProps {
  registrationTrend: TrendData[];
  paymentTrend: TrendData[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
        <p className="font-semibold">{payload[0].payload.month}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {entry.value.toLocaleString("id-ID")}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ChartsTrends({
  registrationTrend,
  paymentTrend,
}: ChartsTrendsProps) {
  // Filter out empty data
  const validRegistrationTrend = registrationTrend.filter((d) => d.count > 0);
  const validPaymentTrend = paymentTrend.filter((d) => d.count > 0);

  return (
    <div className="space-y-6">
      {/* Registration Trend */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Trend Pendaftaran Mahasiswa
        </h3>
        {validRegistrationTrend.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={validRegistrationTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                name="Jumlah Pendaftar"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-300 text-gray-500">
            Tidak ada data pendaftaran
          </div>
        )}
      </Card>

      {/* Payment Trend */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Trend Pembayaran
        </h3>
        {validPaymentTrend.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={validPaymentTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 12 }}
              />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                yAxisId="left"
                dataKey="count" 
                fill="#10b981" 
                name="Jumlah Pembayaran"
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-300 text-gray-500">
            Tidak ada data pembayaran
          </div>
        )}
      </Card>
    </div>
  );
}
