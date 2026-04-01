import { api } from "@/api/client";
import { ClientPagination } from "@/components/client-pagination";
import { SearchInput } from "@/components/search-input";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

import { Route } from "..";
import { accountColumns } from "./columns";
import CreateAccountDialog from "./create-account-dialog";
import { DataTable } from "./data-table";
import FilterApplicationStatus from "./filter-application-status";
import FilterStatus from "./filter-status";
import FilterType from "./filter-type";

function ManajemenAkunContent() {
  const navigate = useNavigate({ from: Route.fullPath });
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const page = Number.parseInt(searchParams.get("page") ?? "1") || 1;
  const [search, setSearch] = useState<string>("");
  const [value] = useDebounce(search, 500);
  const [type, setType] = useState<
    "mahasiswa" | "ota" | "admin" | "bankes" | "pengurus" | null
  >(null);
  const [status, setStatus] = useState<"verified" | "unverified" | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<
    | "pending"
    | "accepted"
    | "rejected"
    | "unregistered"
    | "reapply"
    | "outdated"
    | null
  >(null);

  const { data, isLoading } = useQuery({
    queryKey: ["listAllAccount", page, value, type, status, applicationStatus],
    queryFn: () =>
      api.list.listAllAccount({
        page,
        q: value,
        type: type!,
        status: status!,
        applicationStatus: applicationStatus!,
      }),
  });

  useEffect(() => {
    if (status || value || type || applicationStatus) {
      navigate({
        search: () => ({
          page: 1,
        }),
      });
    }
  }, [navigate, status, value, type, applicationStatus]);

  return (
    <section className="flex flex-col gap-4">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex w-full items-center gap-4">
          <div className="w-full">
            <SearchInput
              placeholder="Cari nama atau email"
              setSearch={setSearch}
            />
          </div>
          <CreateAccountDialog />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          <FilterType type={type} setType={setType} />
          <FilterStatus status={status} setStatus={setStatus} />
          <FilterApplicationStatus
            status={applicationStatus}
            setStatus={setApplicationStatus}
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="rounded-md bg-white">
          <Skeleton className="h-80 w-full" />
        </div>
      ) : (
        <DataTable columns={accountColumns} data={data?.body.data || []} />
      )}

      {/* Pagination */}
      {isLoading ? (
        <div className="rounded-md bg-white">
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <ClientPagination
          totalPerPage={8}
          total={data?.body.totalPagination || 0}
        />
      )}
    </section>
  );
}

export default ManajemenAkunContent;
