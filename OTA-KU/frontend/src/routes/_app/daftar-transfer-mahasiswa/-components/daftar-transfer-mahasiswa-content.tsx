import { api } from "@/api/client";
import { ClientPagination } from "@/components/client-pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Route } from "..";
import { tagihanColumns } from "./columns";
import { DataTable } from "./data-table";
import { SearchFilterBar } from "./search-filter-bar";

const ITEMS_PER_PAGE = 8;

export function DaftarTransferMahasiswaContent() {
  const navigate = useNavigate({ from: Route.fullPath });
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  // Get page from URL or default to 1
  const currentPage = parseInt(searchParams.get("page") ?? "1") || 1;

  // Define valid month types to match API expectations
  type MonthType =
    | "January"
    | "February"
    | "March"
    | "April"
    | "May"
    | "June"
    | "July"
    | "August"
    | "September"
    | "October"
    | "November"
    | "December"
    | undefined;

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ] as const;

  // Set to today's date for filtering
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear().toString();
  const currentMonth = monthNames[currentDate.getMonth()];

  const [searchQuery, setSearchQuery] = useState("");
  const [yearFilter, setYearFilter] = useState<string>(currentYear);
  const [monthFilter, setMonthFilter] = useState<string>(currentMonth);
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  // Fetch transactions data
  const { data: transactionData, isLoading } = useQuery({
    queryKey: [
      "listTransactionAdmin",
      currentPage,
      searchQuery,
      yearFilter,
      monthFilter,
      selectedStatus,
    ],
    queryFn: () => {
      return api.transaction.listTransactionAdmin({
        page: currentPage,
        month: monthFilter === "all" ? undefined : (monthFilter as MonthType),
        year: parseInt(yearFilter),
        status:
          selectedStatus === "pending" || selectedStatus === "unpaid"
            ? selectedStatus
            : undefined,
      });
    },
  });

  useEffect(() => {
    if (searchQuery || yearFilter || monthFilter || selectedStatus) {
      navigate({
        search: () => ({
          page: 1,
        }),
      });
    }
  }, [navigate, searchQuery, yearFilter, monthFilter, selectedStatus]);

  return (
    <section className="flex flex-col gap-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-dark text-3xl font-bold md:text-[50px]">
            Daftar Transfer Mahasiswa
          </h1>
          <p className="text-blue-900">Kelola transfer bantuan ke mahasiswa</p>
        </div>
      </div>

      {/* Search and Filters */}
      {isLoading ? (
        <div className="rounded-md bg-white">
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <SearchFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          yearFilter={yearFilter}
          onYearChange={setYearFilter}
          monthFilter={monthFilter}
          onMonthChange={setMonthFilter}
          statusFilter={selectedStatus}
          onStatusChange={setSelectedStatus}
        />
      )}

      {/* Table */}
      {isLoading ? (
        <div className="rounded-md bg-white">
          <Skeleton className="h-80 w-full" />
        </div>
      ) : (
        <DataTable
          columns={tagihanColumns}
          data={transactionData?.body?.data || []}
        />
      )}

      {/* Pagination */}
      {isLoading ? (
        <div className="rounded-md bg-white">
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <ClientPagination
          total={transactionData?.body?.totalData || 0}
          totalPerPage={ITEMS_PER_PAGE}
          animate={true}
        />
      )}
    </section>
  );
}
