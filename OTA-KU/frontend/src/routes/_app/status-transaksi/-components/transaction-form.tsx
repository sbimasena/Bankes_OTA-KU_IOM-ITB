import { api, queryClient } from "@/api/client";
import { TransactionOTA } from "@/api/generated";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { UploadReceiptSchema } from "@/lib/zod/transaction";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Check, ChevronsUpDown, FileUp } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface TransactionFormProps {
  data: Array<TransactionOTA>;
  setPaidFor: (paidFor: number) => void;
  year: number;
  month: number;
}

type TransactionFormValues = z.infer<typeof UploadReceiptSchema>;

const months = [
  { value: 1, label: "1 Bulan" },
  { value: 2, label: "2 Bulan" },
  { value: 3, label: "3 Bulan" },
  { value: 4, label: "4 Bulan" },
  { value: 5, label: "5 Bulan" },
  { value: 6, label: "6 Bulan" },
];

function TransactionForm({
  data,
  setPaidFor,
  year,
  month,
}: TransactionFormProps) {
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dragState, setDragState] = useState<boolean>(false);
  const [fileURL, setFileURL] = useState<string>("");

  const uploadReceiptCallbackMutation = useMutation({
    mutationFn: (formData: TransactionFormValues) =>
      api.transaction.uploadReceipt({
        formData: {
          ids: JSON.stringify(data.map((item) => item.mahasiswa_id)),
          receipt: formData.receipt,
          paidFor: formData.paidFor,
        },
      }),
    onSuccess: (_data, _variables, context) => {
      toast.dismiss(context);
      toast.success("Berhasil mengirim pembayaran", {
        description: "Silakan tunggu hingga admin memverifikasi data",
      });
      queryClient.invalidateQueries({
        queryKey: ["listAllTransaction", year, month],
      });
    },
    onError: (error, _variables, context) => {
      toast.dismiss(context);
      toast.warning("Gagal mengirim pembayaran", {
        description: error.message,
      });
    },
    onMutate: () => {
      const loading = toast.loading("Sedang mengirim pembayaran...", {
        description: "Mohon tunggu sebentar",
        duration: Infinity,
      });
      return loading;
    },
  });

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(UploadReceiptSchema),
    defaultValues: {
      ids: data.map((item) => item.mahasiswa_id),
      paidFor: data[0].paid_for || 1,
    },
  });

  const handleFileChange = (file: File | null) => {
    if (file) {
      setFileName(file.name);
      form.setValue("receipt", file);
      const fileURL = URL.createObjectURL(file);
      setFileURL(fileURL);
    }
  };

  function onSubmit(values: TransactionFormValues) {
    uploadReceiptCallbackMutation.mutate(values);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-8"
      >
        {/* Jumlah Bulan Pembayaran */}
        <FormField
          control={form.control}
          name="paidFor"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-dark">
                Pembayaran untuk berapa bulan
              </FormLabel>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "justify-between",
                        !field.value && "text-muted-foreground",
                      )}
                      disabled={data[0].status !== "unpaid"}
                    >
                      {field.value
                        ? months.find((month) => month.value === field.value)
                            ?.label
                        : "Pilih Bulan"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                  <Command>
                    <CommandList>
                      <CommandGroup>
                        {months.map((month) => (
                          <CommandItem
                            value={month.label}
                            key={month.value}
                            onSelect={() => {
                              form.setValue("paidFor", month.value);
                              setPaidFor(month.value);
                              setOpen(false);
                            }}
                          >
                            {month.label}
                            <Check
                              className={cn(
                                "ml-auto",
                                month.value === field.value
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="receipt"
          render={() => {
            const isDragging = dragState;
            const hasExistingReceipt = !!data[0].receipt;
            const isPaid = data[0].status === "paid";

            const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
              e.preventDefault();
              e.stopPropagation();
              setDragState(true);
            };

            const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
              e.preventDefault();
              e.stopPropagation();
              setDragState(false);
            };

            const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
              e.preventDefault();
              e.stopPropagation();
              setDragState(false);
              const file = e.dataTransfer.files?.[0] || null;
              handleFileChange(file);
            };

            // If status is paid, show verification message
            if (isPaid) {
              return (
                <FormItem className="col-span-1 md:col-span-2">
                  <FormLabel className="text-primary text-sm">
                    Bukti Pembayaran
                  </FormLabel>
                  <FormControl>
                    <div className="flex flex-col items-center justify-center rounded-md border-2 border-green-500/50 bg-green-50/20 p-6">
                      <div className="flex flex-col items-center gap-2 text-center">
                        <FileUp className="h-8 w-8 text-green-500" />
                        <p className="text-sm font-medium text-green-700">
                          Pembayaran telah diverifikasi
                        </p>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }

            // Determine display status message for unpaid status
            let fileStatus = "";
            if (isDragging) {
              fileStatus = "Geser berkas kesini untuk upload";
            } else if (fileName) {
              fileStatus = fileName;
            } else if (hasExistingReceipt) {
              fileStatus = "File sudah terupload";
            } else {
              fileStatus = "Klik untuk upload atau drag & drop";
            }

            return (
              <FormItem className="col-span-1 md:col-span-2">
                <FormLabel className="text-primary text-sm">
                  Bukti Pembayaran
                </FormLabel>
                <FormControl>
                  <div
                    className={`flex flex-col items-center justify-center rounded-md border-2 ${
                      data[0].status !== "unpaid"
                        ? "cursor-not-allowed border-gray-200 bg-gray-50"
                        : isDragging
                          ? "border-primary bg-primary/5 border-dashed"
                          : hasExistingReceipt
                            ? "border-dashed border-green-500/50 bg-green-50/20"
                            : "border-muted-foreground/25 hover:border-muted-foreground/50 border-dashed"
                    } p-6 transition-all`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <Input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        handleFileChange(file);
                        // Reset the input value to allow re-selecting the same file
                        if (!file) {
                          e.target.value = "";
                        }
                      }}
                      ref={fileInputRef}
                      disabled={data[0].status !== "unpaid"}
                    />
                    <div className="flex flex-col items-center gap-2 text-center">
                      <FileUp
                        className={`h-8 w-8 ${
                          data[0].status !== "unpaid"
                            ? "text-gray-400"
                            : hasExistingReceipt
                              ? "text-green-500"
                              : "text-muted-foreground"
                        }`}
                      />

                      {/* Display status message */}
                      <p className="text-sm font-medium">
                        {hasExistingReceipt && !fileName
                          ? "File sudah terupload"
                          : fileStatus}
                      </p>

                      <div className="flex gap-2">
                        {hasExistingReceipt && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (data[0].receipt)
                                window.open(data[0].receipt, "_blank");
                            }}
                            disabled={!data[0].receipt}
                          >
                            Lihat
                          </Button>
                        )}
                        {data[0].status === "unpaid" && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            {hasExistingReceipt ? "Ganti" : "Pilih"}
                          </Button>
                        )}
                        {fileURL && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(fileURL, "_blank")}
                          >
                            Lihat File
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <Button
          type="submit"
          className="self-end"
          disabled={data[0].status !== "unpaid" || form.formState.isSubmitting}
        >
          Kirim Pembayaran
        </Button>
      </form>
    </Form>
  );
}

export default TransactionForm;
