import { api } from "@/api/client";
import { ClientPagination } from "@/components/client-pagination";
import { SearchInput } from "@/components/search-input";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

import { Route } from "..";
import { CollapsibleDataTable } from "./collapsible-data-table";
import FilterMonth from "./filter-month";
import FilterYear from "./filter-year";

function DaftarTagihanContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [value] = useDebounce(searchQuery, 500);
  const [year, setYear] = useState<number | null>(new Date().getFullYear());
  const [month, setMonth] = useState<number | null>(new Date().getMonth() + 1);

  const navigate = useNavigate({ from: Route.fullPath });
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const currentPage = parseInt(searchParams.get("page") ?? "1") || 1;

  const { data: transactionData, isLoading } = useQuery({
    queryKey: [
      "listTransactionVerificationAdmin",
      currentPage,
      year,
      month,
      value,
    ],
    queryFn: () =>
      api.transaction.listTransactionVerificationAdmin({
        page: currentPage,
        year,
        month,
        q: value,
      }),
  });

  useEffect(() => {
    if (value || year || month || value) {
      navigate({
        search: () => ({
          page: 1,
        }),
      });
    }
  }, [navigate, value, year, month]);

  return (
    <section className="flex flex-col gap-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-dark text-3xl font-bold md:text-[50px]">
            Daftar Tagihan
          </h1>
          <p className="text-dark text-xl font-bold md:text-2xl">
            Verifikasi Transaksi OTA
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex w-full flex-col items-center gap-4 sm:flex-row">
          <div className="w-full">
            <SearchInput placeholder="Cari nama" setSearch={setSearchQuery} />
          </div>
          <FilterYear
            years={transactionData?.body.years || []}
            year={year}
            setYear={setYear}
          />
          <FilterMonth month={month} setMonth={setMonth} />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="rounded-md bg-white">
          <Skeleton className="h-80 w-full" />
        </div>
      ) : (
        <CollapsibleDataTable data={transactionData?.body?.data || []} />
      )}

      {/* Pagination */}
      {isLoading ? (
        <div className="rounded-md bg-white">
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <ClientPagination
          total={transactionData?.body?.totalData || 0}
          totalPerPage={6}
          animate={true}
        />
      )}
    </section>
  );
}

export default DaftarTagihanContent;
