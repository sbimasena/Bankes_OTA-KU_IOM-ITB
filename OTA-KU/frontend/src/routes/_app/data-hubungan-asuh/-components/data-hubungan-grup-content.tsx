import { groupService } from "@/api/groupService";
import { ClientPagination } from "@/components/client-pagination";
import { SearchInput } from "@/components/search-input";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

import { Route } from "..";
import { groupConnectionColumns } from "./group-connection-columns";
import { DataTable } from "./data-table";
import FilterConnectionStatus from "./filter-connection-status";

function DataHubunganGrupContent() {
  const navigate = useNavigate({ from: Route.fullPath });
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const page = Number.parseInt(searchParams.get("page") ?? "1") || 1;
  const [search, setSearch] = useState<string>("");
  const [value] = useDebounce(search, 500);
  const [connectionStatus, setConnectionStatus] = useState<
    "pending" | "accepted" | "rejected" | null
  >(null);

  const { data, isLoading } = useQuery({
    queryKey: ["listAllGroupConnection", page, value, connectionStatus],
    queryFn: () =>
      groupService.getAllGroupConnections({
        page,
        q: value,
      }),
  });

  useEffect(() => {
    if (value || connectionStatus) {
      navigate({
        search: () => ({
          page: 1,
        }),
      });
    }
  }, [navigate, connectionStatus, value]);

  return (
    <section className="flex flex-col gap-4">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex w-full flex-col items-center gap-4 sm:flex-row">
          <div className="w-full">
            <SearchInput
              placeholder="Cari nama mahasiswa, NIM, atau nama grup"
              setSearch={setSearch}
            />
          </div>
          <FilterConnectionStatus
            status={connectionStatus}
            setStatus={setConnectionStatus}
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="rounded-md bg-white">
          <Skeleton className="h-80 w-full" />
        </div>
      ) : (
        <DataTable columns={groupConnectionColumns} data={data?.data || []} />
      )}

      {/* Pagination */}
      {isLoading ? (
        <div className="rounded-md bg-white">
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <ClientPagination
          totalPerPage={8}
          total={data?.totalData || 0}
        />
      )}
    </section>
  );
}

export default DataHubunganGrupContent;
