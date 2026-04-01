import { RouterProvider, createRouter } from "@tanstack/react-router";
import { StrictMode, useEffect, useState } from "react";
import ReactDOM from "react-dom/client";

import { api, queryClient } from "./api/client";
import { UserSchema } from "./api/generated";
import Spinner from "./components/loading-spinner";
// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Create a new router instance
export const router = createRouter({
  routeTree,
  context: { session: undefined!, setSession: () => {} },
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// eslint-disable-next-line react-refresh/only-export-components
function App() {
  const [session, setSession] = useState<UserSchema | null | undefined>(
    undefined,
  );
  const [isSessionLoaded, setIsSessionLoaded] = useState(false);

  useEffect(() => {
    async function verifySession() {
      try {
        const response = await api.auth.verif();
        setSession(response.body);
        queryClient.setQueryData(["verify"], response.body);
      } catch {
        setSession(null);
        queryClient.setQueryData(["verify"], null);
      } finally {
        setIsSessionLoaded(true);
      }
    }

    verifySession();
  }, []);

  function updateSession(newSession: UserSchema | null) {
    setSession(newSession);
    queryClient.setQueryData(["verify"], newSession);
  }

  useEffect(() => {
    if (isSessionLoaded) {
      router.update({
        context: { session, setSession: updateSession },
      });
    }
  }, [session, isSessionLoaded]);

  if (!isSessionLoaded) {
    return (
      <main className="flex min-h-[calc(100vh-70px)] flex-col items-center justify-center px-4 py-8 text-4xl md:px-12 lg:min-h-[calc(100vh-96px)]">
        <Spinner />
      </main>
    );
  }

  return (
    <RouterProvider
      router={router}
      context={{ session, setSession: updateSession }}
    />
  );
}

// Render the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
