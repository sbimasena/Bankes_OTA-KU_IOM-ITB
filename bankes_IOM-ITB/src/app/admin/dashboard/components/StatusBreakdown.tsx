"use client";

import { Card } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface Status {
  connection: {
    active: number;
    inactive: number;
  };
  mahasiswa: {
    active: number;
    inactive: number;
  };
  transaction: {
    paid: number;
    unpaid: number;
    pending: number;
  };
}

interface StatusBreakdownProps {
  status: Status;
}

const COLORS_CONNECTION = ["#10b981", "#ef4444"];
const COLORS_TRANSACTION = ["#10b981", "#f97316", "#ef4444"];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-300 rounded shadow-lg">
        <p className="font-semibold">{payload[0].name}</p>
        <p>{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export default function StatusBreakdown({ status }: StatusBreakdownProps) {
  const connectionData = [
    { name: "Aktif", value: status.connection.active },
    { name: "Tidak Aktif", value: status.connection.inactive },
  ];

  const transactionData = [
    { name: "Sudah Dibayar", value: status.transaction.paid },
    { name: "Pending", value: status.transaction.pending },
    { name: "Belum Dibayar", value: status.transaction.unpaid },
  ];

  const mahasiswaData = [
    { name: "Aktif", value: status.mahasiswa.active },
    { name: "Tidak Aktif", value: status.mahasiswa.inactive },
  ];

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Status Koneksi (Aktif/Tidak Aktif)
        </h3>
        {status.connection.active + status.connection.inactive > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={connectionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {connectionData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS_CONNECTION[index % COLORS_CONNECTION.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-250 text-gray-500">
            Tidak ada data koneksi
          </div>
        )}
      </Card>

      {/* Transaction Status */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Status Pembayaran
        </h3>
        {status.transaction.paid + status.transaction.unpaid + status.transaction.pending > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={transactionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {transactionData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS_TRANSACTION[index % COLORS_TRANSACTION.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-250 text-gray-500">
            Tidak ada data pembayaran
          </div>
        )}
      </Card>

      {/* Mahasiswa Status */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Status Mahasiswa (Aktif/Tidak Aktif)
        </h3>
        {status.mahasiswa.active + status.mahasiswa.inactive > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={mahasiswaData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {mahasiswaData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS_CONNECTION[index % COLORS_CONNECTION.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-250 text-gray-500">
            Tidak ada data mahasiswa
          </div>
        )}
      </Card>
    </div>
  );
}
