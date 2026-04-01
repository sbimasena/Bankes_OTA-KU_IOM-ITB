import { api, queryClient } from "@/api/client";
import { SearchInput } from "@/components/search-input";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

import { Route } from "..";
import { persetujuanAsuhColumns } from "./columns";
import { DataTable } from "./data-table";

function PersetujuanAsuhContent() {
  const navigate = useNavigate({ from: Route.fullPath });
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const page = parseInt(searchParams.get("page") ?? "1") || 1;

  const [search, setSearch] = useState<string>("");
  const [value] = useDebounce(search, 500);

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ["listConnection"],
    queryFn: () => api.connect.listPendingConnection({ page }),
  });
  
  const isLoadingState = isLoading || !isSuccess;

  const listConnectionTableData = data?.body.data.map((item) => ({
    mahasiswaId: item.mahasiswa_id,
    mahasiswaName: item.name_ma,
    nim: item.nim_ma,
    otaId: item.ota_id,
    otaName: item.name_ota,
    phoneNumber: item.number_ota,
  }));

  useEffect(() => {
    queryClient.fetchQuery({
      queryKey: ["listConnection"],
      queryFn: () =>
        api.connect.listPendingConnection({
          page: 1,
          q: value,
        }),
    });

    navigate({
      search: () => ({
        page: 1,
      }),
    });
  }, [navigate, value]);

  return (
    <section className="flex flex-col gap-4">
      {/* Search */}
      {isLoadingState ? (
        <div className="rounded-md bg-white">
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <SearchInput
          placeholder="Cari Nama Mahasiswa, NIM, Nama OTA, atau No. Telepon"
          setSearch={setSearch}
        />
      )}

      {/* Table */}
      {isLoadingState ? (
        <div className="rounded-md bg-white">
          <Skeleton className="h-80 w-full" />
        </div>
      ) : (
        <DataTable
          columns={persetujuanAsuhColumns}
          data={listConnectionTableData || []}
        />
      )}
    </section>
  );
}

export default PersetujuanAsuhContent;
