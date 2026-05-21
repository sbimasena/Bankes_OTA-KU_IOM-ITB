"use client";

import { Card } from "@/components/ui/card";
import { DollarSign, Users, Building2, Handshake, TrendingUp, CreditCard } from "lucide-react";

interface Summary {
  totalDana: number;
  totalMahasiswa: number;
  totalOta: number;
  totalConnections: number;
  totalPayment: number;
  activeConnections: number;
  inactiveConnections: number;
}

interface StatisticsCardsProps {
  summary: Summary;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    notation: "compact",
    maximumFractionDigits: 0,
  }).format(value);
}

const StatisticCard = ({
  title,
  value,
  icon: Icon,
  color,
  isCurrency = false,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  isCurrency?: boolean;
}) => (
  <Card className="p-6 hover:shadow-lg transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-2">
          {isCurrency ? formatCurrency(value) : value.toLocaleString("id-ID")}
        </p>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </Card>
);

export default function StatisticsCards({ summary }: StatisticsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatisticCard
        title="Total Dana Bantuan"
        value={summary.totalDana}
        icon={DollarSign}
        color="bg-green-500"
        isCurrency={true}
      />
      
      <StatisticCard
        title="Total Mahasiswa"
        value={summary.totalMahasiswa}
        icon={Users}
        color="bg-blue-500"
      />
      
      <StatisticCard
        title="Total OTA (Orang Tua Asuh)"
        value={summary.totalOta}
        icon={Building2}
        color="bg-purple-500"
      />
      
      <StatisticCard
        title="Total Koneksi Aktif"
        value={summary.activeConnections}
        icon={Handshake}
        color="bg-indigo-500"
      />
      
      <StatisticCard
        title="Total Pembayaran Terverifikasi"
        value={summary.totalPayment}
        icon={CreditCard}
        color="bg-orange-500"
        isCurrency={true}
      />
      
      <StatisticCard
        title="Total Koneksi"
        value={summary.totalConnections}
        icon={TrendingUp}
        color="bg-pink-500"
      />
    </div>
  );
}
