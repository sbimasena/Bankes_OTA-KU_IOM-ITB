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
import { PasswordInput } from "@/components/ui/password-input";
import { UserRegisRequestSchema } from "@/lib/zod/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type UserRegisterFormValues = z.infer<typeof UserRegisRequestSchema>;

interface RegisterFormProps {
  role: string;
  setRole: (role: string) => void;
  setIsClicked: (isClicked: boolean) => void;
}

export default function RegisterForm({
  role,
  setRole,
  setIsClicked,
}: RegisterFormProps) {
  const [state, setState] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const navigate = useNavigate();
  const registerCallbackMutation = useMutation({
    mutationFn: (data: UserRegisterFormValues) =>
      api.auth.regis({ formData: data }),
    onSuccess: (_data, _variables, context) => {
      toast.dismiss(context);
      toast.success("Berhasil melakukan registrasi", {
        description: "Silakan cek email Anda untuk verifikasi",
      });

      queryClient.invalidateQueries({ queryKey: ["verify"] });

      setTimeout(() => {
        navigate({ to: "/auth/otp-verification", reloadDocument: true });
      }, 1500); // 1.5 seconds delay
    },
    onError: (_error, _variables, context) => {
      toast.dismiss(context);
      toast.warning("Gagal melakukan registrasi", {
        description: "Silakan coba kembali atau periksa koneksi Anda",
      });
    },
    onMutate: () => {
      const loading = toast.loading("Sedang melakukan registrasi...", {
        description: "Mohon tunggu sebentar",
        duration: Infinity,
      });
      return loading;
    },
  });

  const form = useForm<UserRegisterFormValues>({
    resolver: zodResolver(UserRegisRequestSchema),
    defaultValues: {
      type: role as "mahasiswa" | "ota",
    },
  });

  async function onSubmit(values: UserRegisterFormValues) {
    registerCallbackMutation.mutate(values);
  }

  useEffect(() => {
    const state = crypto.getRandomValues(new Uint32Array(1))[0].toString(16);
    localStorage.setItem("state", state);
    setState(state);
  }, []);

  const azureClientId = import.meta.env.VITE_AZURE_CLIENT_ID;
  useEffect(() => {
    setClientId(azureClientId);
  }, [azureClientId]);

  return (
    <section className="flex w-full flex-col items-center justify-center gap-9 py-8 md:px-12">
      <img
        src="/icon/logo-basic.png"
        alt="logo"
        className="mx-auto h-[81px] w-[123px]"
      />
      <h1 className="text-primary text-center text-3xl font-bold md:text-[50px]">
        Daftar Sebagai {role === "mahasiswa" ? "Mahasiswa" : "Orang Tua Asuh"}
      </h1>
      <h2 className="text-primary text-center text-2xl md:text-[26px]">
        Silahkan isi kolom yang tersedia
      </h2>
      <section className="w-full max-w-[400px]">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex w-full flex-col gap-5"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-primary text-sm">Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Masukkan email Anda"
                      autoCapitalize="none"
                      autoCorrect="off"
                      inputMode="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-primary text-sm">
                    Nomor HP (Whatsapp)
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan nomor WA Anda" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-primary text-sm">
                    Kata sandi
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

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-primary text-sm">
                    Konfirmasi kata sandi
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

            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant={"outline"}
                onClick={() => {
                  setIsClicked(false);
                  setRole("");
                }}
                disabled={form.formState.isSubmitting}
              >
                Kembali
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Buat Akun
              </Button>
            </div>

            {role === "mahasiswa" && (
              <>
                <p className="text-primary text-center">atau</p>
                <Button
                  type="button"
                  disabled={form.formState.isSubmitting}
                  asChild
                  variant={"outline"}
                >
                  <a
                    href={`https://login.microsoftonline.com/db6e1183-4c65-405c-82ce-7cd53fa6e9dc/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${window.location.origin}/integrations/azure-key-vault/oauth2/callback&response_mode=query&scope=https://vault.azure.net/.default openid offline_access&state=${state}&prompt=select_account`}
                  >
                    <img
                      src="/microsoft.svg"
                      alt="Microsoft Logo"
                      className="w-6"
                    />
                    Masuk dengan akun ITB
                  </a>
                </Button>
              </>
            )}
          </form>
        </Form>
      </section>
    </section>
  );
}
