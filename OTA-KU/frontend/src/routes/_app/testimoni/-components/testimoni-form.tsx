import { api, queryClient } from "@/api/client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { TestimonialFormSchema } from "@/lib/zod/testimonial";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type TestimonialFormValues = z.infer<typeof TestimonialFormSchema>;

const statusLabelMap: Record<string, string> = {
  pending: "Menunggu Moderasi",
  confirmed: "Terkonfirmasi Admin",
};

function TestimoniForm() {
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<"pending" | "confirmed" | "">("");
  const [removedExistingImages, setRemovedExistingImages] = useState<string[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ["myTestimonial", selectedPeriodId, statusFilter],
    queryFn: () =>
      api.testimonial.getMyTestimonial({
        periodId: selectedPeriodId,
        status: statusFilter || undefined,
      }),
  });

  const activeTestimonial = data?.body.testimonial;

  const form = useForm<TestimonialFormValues>({
    resolver: zodResolver(TestimonialFormSchema),
    defaultValues: {
      content: "",
      images: undefined,
    },
  });

  useEffect(() => {
    if (!data?.body.periods?.length) return;
    if (selectedPeriodId) return;

    setSelectedPeriodId(data.body.currentPeriodId ?? data.body.periods[0]?.id);
  }, [data?.body.currentPeriodId, data?.body.periods, selectedPeriodId]);

  useEffect(() => {
    form.reset({
      content: activeTestimonial?.content ?? "",
      images: undefined,
    });
    setRemovedExistingImages([]);
  }, [activeTestimonial?.content, activeTestimonial?.id, form]);

  const uploadedImagePreviews = useMemo(() => {
    return (activeTestimonial?.images ?? []).filter((src) => !removedExistingImages.includes(src));
  }, [activeTestimonial?.images, removedExistingImages]);

  const selectedNewFiles = form.watch("images") ?? [];

  const submitMutation = useMutation({
    mutationFn: async (values: TestimonialFormValues) => {
      await api.testimonial.upsertMyTestimonial({
        formData: {
          content: values.content,
          images: values.images,
          removedImages: removedExistingImages,
        },
      });
    },
    onSuccess: () => {
      toast.success("Testimoni berhasil disimpan", {
        description: "Status testimoni kembali ke pending dan menunggu konfirmasi admin.",
      });
      queryClient.invalidateQueries({ queryKey: ["myTestimonial"] });
    },
    onError: (error) => {
      toast.error("Gagal menyimpan testimoni", {
        description: error.message,
      });
    },
  });

  const onSubmit = (values: TestimonialFormValues) => {
    submitMutation.mutate(values);
  };

  if (isLoading) {
    return <Skeleton className="h-[320px] w-full rounded-xl" />;
  }

  const currentStatus = activeTestimonial?.status;
  const statusLabel = currentStatus ? statusLabelMap[currentStatus] : "Belum Ada";

  return (
    <section className="grid gap-6 lg:grid-cols-3">
      <div className="rounded-xl bg-white p-4 shadow-sm lg:col-span-2">
        <Form {...form}>
          <form className="flex flex-col gap-5" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-dark">Isi Testimoni</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={8}
                      placeholder="Ceritakan dampak bantuan OTA-KU bagi perjalanan studi Anda..."
                    />
                  </FormControl>
                  <p className="text-muted-foreground text-xs">Minimal 20 karakter, maksimal 1000 karakter.</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-dark">Foto Pendukung (Opsional, maks 3)</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      multiple
                      onChange={(event) => {
                        const files = Array.from(event.target.files ?? []);
                        field.onChange(files.length ? files : undefined);
                      }}
                    />
                  </FormControl>
                  <p className="text-muted-foreground text-xs">Format: JPG, PNG, WEBP. Maksimal 5MB per foto.</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={submitMutation.isPending}>
                {submitMutation.isPending ? "Menyimpan..." : "Simpan Testimoni"}
              </Button>
            </div>

            {selectedNewFiles.length > 0 && (
              <div className="rounded-md bg-slate-50 p-3 text-sm">
                <p className="mb-2 font-medium">Foto baru yang akan ditambahkan:</p>
                <ul className="space-y-1">
                  {selectedNewFiles.map((file, idx) => (
                    <li key={`${file.name}-${idx}`} className="flex items-center justify-between gap-2">
                      <span className="truncate">{file.name}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const updatedFiles = selectedNewFiles.filter((_, fileIndex) => fileIndex !== idx);
                          form.setValue("images", updatedFiles.length ? updatedFiles : undefined, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                        }}
                      >
                        Hapus
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </form>
        </Form>
      </div>

      <div className="flex flex-col gap-4">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="text-dark text-lg font-semibold">Filter Periode & Status</h2>
          <div className="mt-3 grid gap-2">
            <select
              className="border-input bg-background h-10 rounded-md border px-3 text-sm"
              value={selectedPeriodId ?? ""}
              onChange={(event) => {
                const value = Number(event.target.value);
                setSelectedPeriodId(Number.isNaN(value) ? undefined : value);
              }}
            >
              <option value="">Pilih Periode</option>
              {(data?.body.periods ?? []).map((period) => (
                <option key={period.id} value={period.id}>
                  {period.period}
                  {period.isCurrent ? " (Periode Aktif)" : ""}
                </option>
              ))}
            </select>

            <select
              className="border-input bg-background h-10 rounded-md border px-3 text-sm"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as "pending" | "confirmed" | "")}
            >
              <option value="">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Terkonfirmasi</option>
            </select>
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="text-dark text-lg font-semibold">Status Konfirmasi</h2>
          <p className="mt-2 text-sm">{statusLabel}</p>
          {activeTestimonial && (
            <p className="text-muted-foreground mt-1 text-xs">
              Periode: {activeTestimonial.periodLabel}
            </p>
          )}
          {currentStatus === "confirmed" && (
            <p className="mt-2 rounded-md bg-emerald-50 p-2 text-sm text-emerald-700">
              Testimoni sudah dikonfirmasi. Admin dapat mengatur visibilitas di homepage.
            </p>
          )}
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="text-dark text-lg font-semibold">Foto Saat Ini</h2>
          {uploadedImagePreviews.length === 0 ? (
            <p className="text-muted-foreground mt-2 text-sm">Belum ada foto.</p>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {uploadedImagePreviews.map((src, idx) => (
                <div key={`${src}-${idx}`} className="space-y-2">
                  <img
                    src={src}
                    alt={`foto-testimoni-${idx + 1}`}
                    className="h-24 w-full rounded-md object-cover"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setRemovedExistingImages((prev) => [...prev, src]);
                    }}
                  >
                    Hapus Foto
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="text-dark text-lg font-semibold">Riwayat Testimoni</h2>
          {(data?.body.history ?? []).length === 0 ? (
            <p className="text-muted-foreground mt-2 text-sm">Belum ada riwayat testimoni.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {data?.body.history.map((item) => (
                <li key={item.id} className="rounded-md border p-2">
                  <p className="font-medium">{item.periodLabel}</p>
                  <p className="text-muted-foreground">
                    Status: {statusLabelMap[item.status]} | Homepage: {item.isActive ? "Tampil" : "Tidak tampil"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

export default TestimoniForm;
