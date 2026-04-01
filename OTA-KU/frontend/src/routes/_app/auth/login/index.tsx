import { api, queryClient } from "@/api/client";
import Metadata from "@/components/metadata";
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
import { UserLoginRequestSchema } from "@/lib/zod/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link, createFileRoute, redirect } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/_app/auth/login/")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const user = context.session;

    if (user) {
      throw redirect({ to: "/" });
    }
  },
});

type UserLoginFormValues = z.infer<typeof UserLoginRequestSchema>;

function RouteComponent() {
  const [state, setState] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const navigate = useNavigate();
  const loginCallbackMutation = useMutation({
    mutationFn: (data: UserLoginFormValues) =>
      api.auth.login({ formData: data }),
    onSuccess: (_data, _variables, context) => {
      toast.dismiss(context);
      toast.success("Berhasil melakukan login", {
        description: "Selamat datang kembali!",
      });

      queryClient.invalidateQueries({ queryKey: ["verify"] });

      setTimeout(() => {
        navigate({ to: "/", reloadDocument: true });
      }, 1500); // 1.5 seconds delay
    },
    onError: (_error, _variables, context) => {
      toast.dismiss(context);
      toast.warning("Email/No. WA atau Kata Sandi salah", {
        description: "Silakan coba lagi",
      });
    },
    onMutate: () => {
      const loading = toast.loading("Sedang melakukan login...", {
        description: "Mohon tunggu sebentar",
        duration: Infinity,
      });
      return loading;
    },
  });

  const form = useForm<UserLoginFormValues>({
    resolver: zodResolver(UserLoginRequestSchema),
  });

  async function onSubmit(values: UserLoginFormValues) {
    loginCallbackMutation.mutate(values);
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
    <main className="flex min-h-[calc(100vh-70px)] flex-col p-2 px-6 py-16 md:px-12 lg:min-h-[calc(100vh-96px)]">
      <Metadata title="Login | BOTA" />
      <div className="flex flex-col items-center gap-9">
        <img
          src="/icon/logo-basic.png"
          alt="logo"
          className="mx-auto h-[81px] w-[123px]"
        />
        <h1 className="text-primary text-center text-3xl font-bold md:text-[50px]">
          Selamat Datang Kembali!
        </h1>
        <h2 className="text-primary text-center text-2xl md:text-[26px]">
          Masuk ke akun Anda
        </h2>
        <section className="md:w-[400px]">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex w-full flex-col gap-5"
            >
              <FormField
                control={form.control}
                name="identifier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary text-sm">
                      Email atau No. Whatsapp
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Masukkan email atau nomor WA Anda"
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

              <Link
                to="/auth/lupa-password"
                className="text-primary text-sm underline"
              >
                Lupa kata sandi?
              </Link>

              <Button type="submit" disabled={form.formState.isSubmitting}>
                Masuk
              </Button>

              <p className="text-primary text-center">atau</p>

              <Button
                type="button"
                disabled={loginCallbackMutation.isPending}
                variant={"outline"}
                asChild
              >
                <a
                  href={`https://login.microsoftonline.com/db6e1183-4c65-405c-82ce-7cd53fa6e9dc/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${window.location.origin}/integrations/azure-key-vault/oauth2/callback&response_mode=query&scope=https://vault.azure.net/.default openid offline_access&state=${state}&prompt=select_account`}
                >
                  <img
                    src="/microsoft.svg"
                    alt="Microsoft Logo"
                    className="w-6"
                  />
                  Masuk dengan akun Mahasiswa ITB
                </a>
              </Button>

              <p className="text-primary text-center text-base">
                Belum punya akun?{" "}
                <Link to="/auth/register" className="underline">
                  Buat Akun disini sekarang
                </Link>
              </p>
            </form>
          </Form>
        </section>
      </div>
    </main>
  );
}
