"use client";

import { useState, useEffect } from "react";
import SidebarIOM from "@/app/components/layout/sidebariom";
import { Card } from "@/components/ui/card";
import { Loader2, Download, AlertCircle } from "lucide-react";
import StatisticsCards from "./components/StatisticsCards";
import TrendCharts from "./components/TrendCharts";
import StatusBreakdown from "./components/StatusBreakdown";
import ExportButton from "./components/ExportButton";

interface PeriodData {
  id: number;
  period: string;
  startDate: string;
  endDate: string;
}

interface DashboardData {
  period: PeriodData | null;
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

interface TrendData {
  registrationTrend: Array<{ week: string; count: number }>;
  paymentTrend: Array<{ week: string; count: number; totalAmount: number }>;
  passageTrend: Array<{ stage: string; passed: number }>;
}

interface StatusData {
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

export default function DashboardPage() {
  const [summaryData, setSummaryData] = useState<DashboardData | null>(null);
  const [trendData, setTrendData] = useState<TrendData | null>(null);
  const [statusData, setStatusData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [summaryRes, trendsRes, statusRes] = await Promise.all([
          fetch("/api/dashboard/iom-welfare/summary"),
          fetch("/api/dashboard/iom-welfare/trends"),
          fetch("/api/dashboard/iom-welfare/status-breakdown"),
        ]);

        // Check each response individually for better error handling
        if (!summaryRes.ok) {
          const errorData = await summaryRes.json().catch(() => ({}));
          console.error("Summary API Error:", summaryRes.status, errorData);
          throw new Error(`Summary API failed: ${summaryRes.status} - ${errorData.error || "Unknown error"}`);
        }

        if (!trendsRes.ok) {
          const errorData = await trendsRes.json().catch(() => ({}));
          console.error("Trends API Error:", trendsRes.status, errorData);
          throw new Error(`Trends API failed: ${trendsRes.status} - ${errorData.error || "Unknown error"}`);
        }

        if (!statusRes.ok) {
          const errorData = await statusRes.json().catch(() => ({}));
          console.error("Status API Error:", statusRes.status, errorData);
          throw new Error(`Status API failed: ${statusRes.status} - ${errorData.error || "Unknown error"}`);
        }

        const summaryJson = await summaryRes.json();
        const trendsJson = await trendsRes.json();
        const statusJson = await statusRes.json();

        if (summaryJson.success) {
          setSummaryData(summaryJson.data);
        } else {
          throw new Error(summaryJson.error || "Summary data failed");
        }

        if (trendsJson.success) {
          setTrendData(trendsJson.data);
        } else {
          throw new Error(trendsJson.error || "Trends data failed");
        }

        if (statusJson.success) {
          setStatusData(statusJson.data);
        } else {
          throw new Error(statusJson.error || "Status data failed");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load dashboard";
        console.error("Dashboard Error:", errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex">
        <SidebarIOM activeTab="home" />
        <div className="flex-1 p-8">
          <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex">
        <SidebarIOM activeTab="home" />
        <div className="flex-1 p-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <Card className="p-6 bg-red-50 border-red-200">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-red-800 font-bold text-lg">Error Loading Dashboard</h2>
                  <p className="text-red-700 mt-2 font-mono text-sm break-words">{error}</p>
                  <p className="text-red-600 text-sm mt-3">
                    Silahkan cek konsol browser untuk detail lengkap
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Reload
                  </button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <SidebarIOM activeTab="home" />
      <div className="flex-1 p-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard Bantuan Kesejahteraan
              </h1>
              <p className="text-gray-600 mt-2">
                Rekapan data bantuan kesejahteraan mahasiswa IOM-ITB
              </p>
              {summaryData?.period && (
                <p className="text-sm text-gray-500 mt-1">
                  Periode: <span className="font-semibold">{summaryData.period.period}</span>
                </p>
              )}
            </div>
            <ExportButton />
          </div>

          {/* Statistics Cards */}
          {summaryData && <StatisticsCards data={summaryData} />}

          {/* Charts and Status Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            {/* Trends Chart - 2 columns */}
            <div className="lg:col-span-2">
              {trendData && <TrendCharts data={trendData} />}
            </div>

            {/* Status Breakdown - 1 column */}
            <div>
              {statusData && <StatusBreakdown data={statusData} />}
            </div>
          </div>

          {/* Stage Breakdown */}
          {statusData && (
            <Card className="mt-8 p-6">
              <h2 className="text-xl font-bold mb-6 text-gray-900">
                Breakdown Per Tahap
              </h2>
              <div className="space-y-4">
                {statusData.stageBreakdown.map((stage, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">{stage.stage}</p>
                      <p className="text-sm text-gray-600">
                        {stage.count} mahasiswa ({stage.percentage}%)
                      </p>
                    </div>
                    <div className="w-40 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${stage.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Recent Updates */}
          {summaryData && (
            <Card className="mt-8 p-6">
              <h2 className="text-xl font-bold mb-6 text-gray-900">
                Info Singkat
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Terdaftar</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {summaryData.totalRegistered}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Diterima</p>
                  <p className="text-2xl font-bold text-green-600">
                    {summaryData.totalPassed}
                  </p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm text-gray-600">Pending Interview</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {summaryData.totalPending}
                  </p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-gray-600">Ditolak</p>
                  <p className="text-2xl font-bold text-red-600">
                    {summaryData.totalRejected}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
