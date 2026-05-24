"use client";

import { Card } from "@/components/ui/card";
import { DollarSign, Users, TrendingUp, CheckCircle } from "lucide-react";

interface DashboardData {
  period: any;
  totalRegistered: number;
  totalPassed: number;
  totalPassedDitmawa: number;
  totalPassedIOM: number;
  totalPassedInterview: number;
  totalRejected: number;
  totalPending: number;
  totalFundAllocated: number;
  totalFundTransferred: number;
  totalFundPending: number;
  transferredPercentage: number;
}

interface StatisticsCardsProps {
  data: DashboardData;
}

export default function StatisticsCards({ data }: StatisticsCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const stats = [
    {
      title: "Total Mahasiswa Terdaftar",
      value: data.totalRegistered,
      icon: Users,
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      borderColor: "border-blue-200",
    },
    {
      title: "Total Diterima",
      value: data.totalPassed,
      icon: CheckCircle,
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      borderColor: "border-green-200",
    },
    {
      title: "Total Dana Alokasi",
      value: formatCurrency(data.totalFundAllocated),
      isText: true,
      icon: DollarSign,
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      borderColor: "border-purple-200",
    },
    {
      title: "Dana Ditransfer",
      value: `${data.transferredPercentage}%`,
      icon: TrendingUp,
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
      borderColor: "border-orange-200",
      subtitle: formatCurrency(data.totalFundTransferred),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <Card
            key={idx}
            className={`p-6 ${stat.bgColor} border-2 ${stat.borderColor} hover:shadow-lg transition-shadow`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-2">{stat.title}</p>
                <p className={`text-3xl font-bold ${stat.textColor}`}>
                  {stat.value}
                </p>
                {stat.subtitle && (
                  <p className="text-xs text-gray-600 mt-2">{stat.subtitle}</p>
                )}
              </div>
              <Icon className={`h-8 w-8 ${stat.textColor} opacity-60`} />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
