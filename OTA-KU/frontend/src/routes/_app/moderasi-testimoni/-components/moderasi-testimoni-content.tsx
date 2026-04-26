import { api, queryClient } from "@/api/client";
import { SearchInput } from "@/components/search-input";
// import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

function ModerasiTestimoniContent() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"shown" | "not_shown" | "">("");
  const [periodId, setPeriodId] = useState<number | undefined>(undefined);

  const { data, isLoading } = useQuery({
    queryKey: ["moderationTestimonials", search, status, periodId],
    queryFn: () =>
      api.testimonial.listModerationTestimonials({
        q: search || undefined,
        status: status || undefined,
        periodId,
        page: 1,
      }),
  });

  // const reviewMutation = useMutation({
  //   mutationFn: async ({ id }: { id: string }) => {
  //     await api.testimonial.reviewTestimonial({
  //       id,
  //       formData: {
  //         status: "shown",
  //       },
  //     });
  //   },
  //   onSuccess: () => {
  //     toast.success("Testimoni berhasil ditampilkan");
  //     queryClient.invalidateQueries({ queryKey: ["moderationTestimonials"] });
  //   },
  //   onError: (error) => {
  //     toast.error("Gagal memoderasi testimoni", { description: error.message });
  //   },
  // });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      await api.testimonial.toggleTestimonialActive({
        id,
        formData: {
          isActive,
        },
      });
    },
    onSuccess: () => {
      toast.success("Visibilitas testimoni berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: ["moderationTestimonials"] });
    },
    onError: (error) => {
      toast.error("Gagal mengubah visibilitas", { description: error.message });
    },
  });

  if (isLoading) {
    return <Skeleton className="h-[280px] w-full rounded-xl" />;
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="grid gap-3 md:grid-cols-3">
        <SearchInput placeholder="Cari nama atau NIM" setSearch={setSearch} />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as "shown" | "not_shown" | "")}
          className="border-input bg-background h-10 rounded-md border px-3 text-sm"
        >
          <option value="">Semua Status</option>
          <option value="shown">Shown (Tampil)</option>
          <option value="not_shown">Not Shown (Tidak tampil)</option>
        </select>
        <select
          value={periodId ?? ""}
          onChange={(event) => {
            const value = Number(event.target.value);
            setPeriodId(Number.isNaN(value) ? undefined : value);
          }}
          className="border-input bg-background h-10 rounded-md border px-3 text-sm"
        >
          <option value="">Semua Periode</option>
          {(data?.body.periods ?? []).map((period) => (
            <option key={period.id} value={period.id}>
              {period.period}
              {period.isCurrent ? " (Aktif)" : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4">
        {data?.body.data.length ? (
          data.body.data.map((item) => (
            <div key={item.id} className="rounded-xl bg-white p-4 shadow-sm">
              <div className="flex flex-col justify-between gap-4 lg:flex-row">
                <div className="space-y-2">
                  <p className="text-dark text-lg font-semibold">{item.name}</p>
                  <p className="text-muted-foreground text-sm">NIM: {item.nim}</p>
                  <p className="text-muted-foreground text-sm">Periode: {item.periodLabel}</p>
                  <p className="text-muted-foreground text-sm">
                    Status: {item.status === "shown" ? "Shown (Tampil)" : "Not Shown (Tidak tampil)"}
                  </p>
                  <p className="text-sm leading-relaxed">{item.content}</p>
                </div>

                <div className="flex min-w-[250px] flex-col gap-2">
                  {/* <Button
                    onClick={() => {
                      reviewMutation.mutate({ id: item.id });
                    }}
                    disabled={reviewMutation.isPending || item.status === "shown"}
                  >
                    {item.status === "shown" ? "Sudah Tampil" : "Tandai Shown"}
                  </Button> */}

                  <label className="mt-1 flex items-center gap-2 text-sm">
                    <Input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={item.status === "shown"}
                      onChange={(event) => {
                        toggleMutation.mutate({ id: item.id, isActive: event.target.checked });
                      }}
                      disabled={toggleMutation.isPending}
                    />
                    Tampilkan di homepage
                  </label>
                </div>
              </div>

              {item.images.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                  {item.images.map((src, idx) => (
                    <img
                      key={`${src}-${idx}`}
                      src={src}
                      alt={`testimoni-${idx + 1}`}
                      className="h-24 w-full rounded-md object-cover"
                    />
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="rounded-xl bg-white p-8 text-center text-sm text-gray-500">
            Belum ada data testimoni untuk filter ini.
          </div>
        )}
      </div>
    </section>
  );
}

export default ModerasiTestimoniContent;
