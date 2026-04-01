import { api, queryClient } from "@/api/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SessionContext } from "@/context/session";
import { cn } from "@/lib/utils";
import { NotesVerificationRequestSchema } from "@/lib/zod/admin-verification";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CircleCheck, CircleX } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type NotesVerificationFormValues = z.infer<
  typeof NotesVerificationRequestSchema
>;

function Combobox({
  id,
  name,
  email,
  status,
  type,
}: {
  id: string;
  name: string;
  email: string;
  status: "pending" | "accepted" | "rejected" | "reapply" | "outdated";
  type: "mahasiswa" | "ota";
}) {
  const session = useContext(SessionContext);
  const [openAccept, setOpenAccept] = useState(false);
  const [openReject, setOpenReject] = useState(false);

  const form = useForm<NotesVerificationFormValues>({
    resolver: zodResolver(NotesVerificationRequestSchema),
    defaultValues: {
      bill: 0,
    },
  });

  const applicationStatusCallbackMutation = useMutation({
    mutationFn: (data: NotesVerificationFormValues) => {
      return api.status.applicationStatus({
        formData: data,
        id: id,
      });
    },
    onSuccess: (_data, _variables, context) => {
      toast.dismiss(context);
      toast.success("Berhasil mengubah status", {
        description: "Status berhasil diubah",
      });
      if (type === "ota") {
        queryClient.invalidateQueries({
          queryKey: ["listOrangTuaAdmin"],
          refetchType: "active",
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: ["listMahasiswaAdmin"],
          refetchType: "active",
        });
      }
    },
    onError: (_error, _variables, context) => {
      toast.dismiss(context);
      toast.warning("Gagal mengubah status", {
        description: "Silakan coba lagi",
      });
    },
    onMutate: () => {
      const loading = toast.loading("Sedang mengubah status...", {
        description: "Mohon tunggu sebentar",
        duration: Infinity,
      });
      return loading;
    },
  });

  const { data } = useQuery({
    queryKey: ["detailMahasiswa", id],
    queryFn: () => {
      if (type === "ota") return null;
      return api.detail.getMahasiswaDetail({ id });
    },
    enabled: false,
  });

  async function onSubmit(data: NotesVerificationFormValues) {
    applicationStatusCallbackMutation.mutate(data);
  }

  useEffect(() => {
    if (type === "mahasiswa" && data) {
      form.reset({
        bill: data.body.bill ?? 0,
        notes: data.body.notes ?? "",
        adminOnlyNotes: data.body.adminOnlyNotes ?? "",
      });
    }
  }, [data, form, type]);

  const isDisabled = session?.type !== "admin" && session?.type !== "bankes";

  return (
    <div className="flex gap-6">
      {status === "pending" || status === "reapply" ? (
        <>
          <Dialog open={openAccept} onOpenChange={setOpenAccept}>
            <DialogTrigger disabled={isDisabled}>
              <CircleCheck
                className={cn(
                  "text-succeed h-5 w-5",
                  !isDisabled && "hover:cursor-pointer",
                )}
              />
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Apakah Anda yakin?</DialogTitle>
                <DialogDescription>
                  Anda akan mengubah status pendaftaran <b>{name}</b> -{" "}
                  <b>{email}</b> menjadi <b>Terverifikasi</b>. Aksi ini tidak
                  dapat diubah setelah dilakukan. Apakah Anda yakin ingin
                  melanjutkan?
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="flex flex-col gap-4"
                >
                  <FormField
                    control={form.control}
                    name="bill"
                    render={({ field }) => {
                      // eslint-disable-next-line @typescript-eslint/no-unused-vars
                      const { onChange, ...rest } = field;

                      return (
                        <FormItem className={cn(type === "ota" && "hidden")}>
                          <FormLabel>Kebutuhan Dana</FormLabel>
                          <FormControl>
                            <Input
                              disabled={
                                status !== "pending" && status !== "reapply"
                              }
                              placeholder="Masukkan dana kebutuhan"
                              onChange={(e) => {
                                const value = e.target.value;
                                if (
                                  value === "" ||
                                  /^([1-9]\d*|0)?$/.test(value)
                                ) {
                                  field.onChange(value);
                                }
                              }}
                              {...rest}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem className={cn(type === "ota" && "hidden")}>
                        <FormLabel>Catatan Mahasiswa</FormLabel>
                        <FormControl>
                          <Textarea
                            disabled={
                              status !== "pending" && status !== "reapply"
                            }
                            placeholder="Masukkan catatan"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="adminOnlyNotes"
                    render={({ field }) => (
                      <FormItem className={cn(type === "ota" && "hidden")}>
                        <FormLabel>Catatan Admin</FormLabel>
                        <FormControl>
                          <Textarea
                            disabled={
                              status !== "pending" && status !== "reapply"
                            }
                            placeholder="Masukkan catatan"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-row space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setOpenAccept(false);
                        form.reset();
                      }}
                      className="flex-1"
                      disabled={form.formState.isSubmitting}
                    >
                      Batal
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        form.setValue("status", "accepted");
                        if (type === "ota") {
                          form.setValue("notes", "-");
                          form.setValue("adminOnlyNotes", "-");
                        }
                        form.handleSubmit(onSubmit)();
                      }}
                      className="flex-1"
                      disabled={form.formState.isSubmitting}
                    >
                      Lanjutkan
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={openReject} onOpenChange={setOpenReject}>
            <DialogTrigger disabled={isDisabled}>
              <CircleX
                className={cn(
                  "text-destructive h-5 w-5",
                  !isDisabled && "hover:cursor-pointer",
                )}
              />
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Apakah Anda yakin?</DialogTitle>
                <DialogDescription>
                  Anda akan mengubah status pendaftaran <b>{name}</b> -{" "}
                  <b>{email}</b> menjadi <b>Tertolak</b>. Aksi ini tidak dapat
                  diubah setelah dilakukan. Apakah Anda yakin ingin melanjutkan?
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="flex flex-col gap-4"
                >
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem className={cn(type === "ota" && "hidden")}>
                        <FormLabel>Catatan Mahasiswa</FormLabel>
                        <FormControl>
                          <Textarea
                            disabled={
                              status !== "pending" && status !== "reapply"
                            }
                            placeholder="Masukkan catatan"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="adminOnlyNotes"
                    render={({ field }) => (
                      <FormItem className={cn(type === "ota" && "hidden")}>
                        <FormLabel>Catatan Admin</FormLabel>
                        <FormControl>
                          <Textarea
                            disabled={
                              status !== "pending" && status !== "reapply"
                            }
                            placeholder="Masukkan catatan"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-row space-x-2">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => {
                        setOpenReject(false);
                        form.reset();
                      }}
                      className="flex-1"
                      disabled={form.formState.isSubmitting}
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      onClick={(e) => {
                        e.preventDefault();
                        form.setValue("status", "rejected");
                        if (type === "ota") {
                          form.setValue("notes", "-");
                          form.setValue("adminOnlyNotes", "-");
                        }
                        form.handleSubmit(onSubmit)();
                      }}
                      className="flex-1"
                      disabled={form.formState.isSubmitting}
                    >
                      Lanjutkan
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </>
      ) : status === "accepted" ? (
        <CircleCheck className="text-succeed h-5 w-5" />
      ) : (
        <CircleX className="text-destructive h-5 w-5" />
      )}
    </div>
  );
}

export default Combobox;
