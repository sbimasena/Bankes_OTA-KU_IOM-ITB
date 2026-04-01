import { api } from "@/api/client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PasswordInput } from "@/components/ui/password-input";
import { ChangePasswordSchema } from "@/lib/zod/password";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type ChangePasswordValues = z.infer<typeof ChangePasswordSchema>;

interface ChangePasswordFormProps {
  userId: string;
}

export default function ChangePasswordForm({
  userId,
}: ChangePasswordFormProps) {
  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ChangePasswordValues) => {
      return api.password.changePassword({ id: userId, formData: data });
    },
    onSuccess: (_data, _variables, context) => {
      toast.dismiss(context);
      toast.success("Berhasil mengubah kata sandi", {
        description: "Anda dapat login menggunakan kata sandi baru",
      });
    },
    onError: (error, _variables, context) => {
      toast.dismiss(context);
      toast.warning("Gagal mengubah kata sandi", {
        description: error.message,
      });
    },
    onMutate: () => {
      const loading = toast.loading("Sedang mengubah kata sandi...", {
        description: "Mohon tunggu sebentar",
        duration: Infinity,
      });
      return loading;
    },
  });

  const onSubmit = (data: ChangePasswordValues) => {
    mutation.mutate(data);
  };

  return (
    <div className="bg-card rounded-lg border p-6">
      <h2 className="text-primary mb-4 text-xl font-semibold">
        Ubah Kata Sandi
      </h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-primary">Kata Sandi Baru</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="Masukkan kata sandi Anda"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-primary">
                  Konfirmasi Kata Sandi Baru
                </FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="Masukkan kata sandi Anda"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full"
          >
            {form.formState.isSubmitting
              ? "Mengubah Kata Sandi..."
              : "Ubah Kata Sandi"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
