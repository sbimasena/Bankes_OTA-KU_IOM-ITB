"use client";

import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface StatusBreakdownData {
  statusBreakdown: Array<{
    status: string;
    count: number;
    color: string;
  }>;
  stageBreakdown: Array<{
    stage: string;
    count: number;
    percentage: number;
  }>;
  details: {
    accepted: Array<{
      nim: string;
      name: string;
      email: string;
      fund: number;
      status: string;
    }>;
    pending: Array<{
      nim: string;
      name: string;
      email: string;
      fund: number;
      status: string;
    }>;
    rejected: Array<{
      nim: string;
      name: string;
      email: string;
      fund: number;
      status: string;
    }>;
  };
}

interface StatusBreakdownProps {
  data: StatusBreakdownData;
}

export default function StatusBreakdown({ data }: StatusBreakdownProps) {
  const chartData = data.statusBreakdown.map((item) => ({
    name: item.status,
    value: item.count,
    fill: item.color,
  }));

  const totalCount = data.statusBreakdown.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold mb-4 text-gray-900">
        Status Mahasiswa
      </h3>

      {chartData.length > 0 ? (
        <div>
          {/* Pie Chart */}
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => value}
                contentStyle={{ backgroundColor: "#f3f4f6", border: "1px solid #d1d5db" }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend with details */}
          <div className="mt-6 space-y-3">
            {data.statusBreakdown.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-l-4"
                style={{ borderLeftColor: item.color }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm font-medium text-gray-700">
                    {item.status}
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{item.count}</p>
                  <p className="text-xs text-gray-600">
                    {totalCount > 0
                      ? `${((item.count / totalCount) * 100).toFixed(1)}%`
                      : "0%"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-gray-600 text-center py-8">Tidak ada data</p>
      )}
    </Card>
  );
}
