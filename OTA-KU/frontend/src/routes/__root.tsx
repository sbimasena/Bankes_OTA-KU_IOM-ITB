import { queryClient } from "@/api/client";
import { UserSchema } from "@/api/generated";
import { NotFound } from "@/components/not-found";
import Footer from "@/components/ui/footer";
import { Toaster } from "@/components/ui/sonner";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";

// import { TanStackRouterDevtools } from "@tanstack/router-devtools";

const RootComponent = () => {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Outlet />
        <Footer />
        <Toaster position="top-center" />
        <ReactQueryDevtools />
      </QueryClientProvider>
      {/* <TanStackRouterDevtools /> */}
    </>
  );
};

interface SessionContext {
  session: UserSchema | undefined | null;
  setSession: (session: UserSchema | null) => void;
}

export const Route = createRootRouteWithContext<SessionContext>()({
  component: () => <RootComponent />,
  notFoundComponent: () => <NotFound />,
});
