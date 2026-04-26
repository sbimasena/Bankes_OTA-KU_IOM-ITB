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

function TestimoniForm() {
  const [removedExistingImages, setRemovedExistingImages] = useState<string[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ["myTestimonial"],
    queryFn: () => api.testimonial.getMyTestimonial(),
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
      toast.success("Testimoni berhasil disimpan");
      form.setValue("images", undefined); 
      setRemovedExistingImages([]); 
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
          <h2 className="text-dark text-lg font-semibold">Informasi Testimoni</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Satu mahasiswa memiliki satu data testimoni yang terhubung ke OTA aktif.
          </p>
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

      </div>
    </section>
  );
}

export default TestimoniForm;
