"use client";

import { useState, useEffect } from "react";
import SidebarAdmin from "@/app/components/layout/sidebaradmin";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import StatisticsCards from "./components/StatisticsCards";
import ChartsTrends from "./components/ChartsTrends";
import StatusBreakdown from "./components/StatusBreakdown";
import TopStudents from "./components/TopStudents";
import ExportButton from "./components/ExportButton";

interface DashboardData {
  summary: {
    totalDana: number;
    totalMahasiswa: number;
    totalOta: number;
    totalConnections: number;
    totalPayment: number;
    activeConnections: number;
    inactiveConnections: number;
  };
  status: {
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
  };
  trends: {
    registration: Array<{ month: string; count: number }>;
    payment: Array<{ month: string; count: number; totalAmount: number }>;
  };
  topStudents: Array<{
    userId: string;
    nim: string;
    name: string;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/dashboard/statistics");
        
        if (!response.ok) {
          throw new Error("Failed to fetch statistics");
        }

        const result = await response.json();
        if (result.success) {
          setData(result.data);
        } else {
          setError("Failed to load statistics");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching statistics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  if (loading) {
    return (
      <div className="flex">
        <SidebarAdmin />
        <div className="flex-1 p-8">
          <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2">Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex">
        <SidebarAdmin />
        <div className="flex-1 p-8">
          <Card className="p-6 bg-red-50 border-red-200">
            <h2 className="text-red-800 font-bold">Error</h2>
            <p className="text-red-700">{error || "Failed to load dashboard"}</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <SidebarAdmin />
      <div className="flex-1 p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard Bantuan Kesejahteraan
              </h1>
              <p className="text-gray-600 mt-2">
                Rekapan data bantuan kesejahteraan IOM-ITB
              </p>
            </div>
            <ExportButton data={data} />
          </div>

          {/* Statistics Cards */}
          <StatisticsCards summary={data.summary} />

          {/* Charts and Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <ChartsTrends 
              registrationTrend={data.trends.registration}
              paymentTrend={data.trends.payment}
            />
            <StatusBreakdown status={data.status} />
          </div>

          {/* Top Students */}
          <div className="mt-8">
            <TopStudents students={data.topStudents} />
          </div>
        </div>
      </div>
    </div>
  );
}
