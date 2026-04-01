import { api } from "@/api/client";
import { SessionContext } from "@/context/session";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["verify"],
    queryFn: async () => {
      const data = await api.auth.verif();
      if (!data) return null;
      return data.body;
    },
  });

  useEffect(() => {
    if (data) {
      queryClient.setQueryData(["verify"], data);
    }
  }, [data, queryClient]);

  return (
    <SessionContext.Provider value={data}>{children}</SessionContext.Provider>
  );
}
