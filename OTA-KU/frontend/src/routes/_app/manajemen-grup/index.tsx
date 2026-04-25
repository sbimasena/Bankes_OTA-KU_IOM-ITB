import { groupService } from "@/api/groupService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Check, ShieldAlert, Users, X, Zap } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/manajemen-grup/" as any)({
  component: AdminGroupManagement,
});

const MIN_BUDGET = 800_000;
const formatRp = (n: number) => `Rp${n.toLocaleString("id-ID")}`;

function AdminGroupManagement() {
  const queryClient = useQueryClient();

  // ── Queries ──────────────────────────────────────────────────────────────
  const { data: groupsData, isLoading: isLoadingGroups } = useQuery({
    queryKey: ["adminAllGroups"],
    queryFn: () => groupService.getAllGroups(),
  });

  const { data: pendingData, isLoading: isLoadingPending } = useQuery({
    queryKey: ["adminPendingConnections"],
    queryFn: () => groupService.getPendingConnections(),
  });

  // ── Mutations ─────────────────────────────────────────────────────────────
  const activateMutation = useMutation({
    mutationFn: groupService.activateGroup,
    onSuccess: () => {
      toast.success("Grup berhasil diaktifkan");
      queryClient.invalidateQueries({ queryKey: ["adminAllGroups"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? "Gagal mengaktifkan grup");
    },
  });

  const acceptConnectionMutation = useMutation({
    mutationFn: groupService.verifyAcceptConnection,
    onSuccess: () => {
      toast.success("Koneksi berhasil disetujui");
      queryClient.invalidateQueries({ queryKey: ["adminPendingConnections"] });
      queryClient.invalidateQueries({ queryKey: ["adminAllGroups"] });
    },
    onError: () => toast.error("Gagal menyetujui koneksi"),
  });

  const rejectConnectionMutation = useMutation({
    mutationFn: groupService.verifyRejectConnection,
    onSuccess: () => {
      toast.success("Koneksi ditolak");
      queryClient.invalidateQueries({ queryKey: ["adminPendingConnections"] });
    },
    onError: () => toast.error("Gagal menolak koneksi"),
  });

  // Count how many forming groups have reached the budget target
  const readyToActivate = groupsData?.data.filter(
    (g) => g.status === "forming" && (g.totalPledge ?? 0) >= MIN_BUDGET,
  ).length ?? 0;

  return (
    <div className="flex flex-col gap-6 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manajemen Grup Asuh</h1>
        <p className="text-muted-foreground">Panel kontrol admin untuk mengelola grup dan persetujuan koneksi.</p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            Persetujuan Koneksi
            {pendingData?.data && pendingData.data.length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                {pendingData.data.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center gap-2">
            Daftar Semua Grup
            {readyToActivate > 0 && (
              <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full bg-amber-500">
                {readyToActivate}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── TAB 1: PERSETUJUAN KONEKSI ── */}
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Menunggu Persetujuan</CardTitle>
              <CardDescription>
                Daftar proposal mahasiswa yang diusulkan oleh grup pre-funded dan memerlukan persetujuan admin.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingPending ? (
                <p className="text-center text-muted-foreground py-8">Memuat data...</p>
              ) : pendingData?.data && pendingData.data.length > 0 ? (
                <div className="rounded-md border">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 border-b">
                      <tr>
                        <th className="p-4 font-medium">Mahasiswa</th>
                        <th className="p-4 font-medium">Grup Sponsor</th>
                        <th className="p-4 font-medium">Tanggal Pengajuan</th>
                        <th className="p-4 font-medium text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingData.data.map((conn) => (
                        <tr key={conn.id} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="p-4">
                            <p className="font-medium">{conn.mahasiswaName}</p>
                            <p className="text-xs text-muted-foreground">{conn.mahasiswaNim}</p>
                          </td>
                          <td className="p-4 font-medium">{conn.groupName}</td>
                          <td className="p-4 text-muted-foreground">
                            {new Date(conn.createdAt).toLocaleDateString("id-ID")}
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-200 text-red-600 hover:bg-red-50"
                              disabled={rejectConnectionMutation.isPending || acceptConnectionMutation.isPending}
                              onClick={() => rejectConnectionMutation.mutate(conn.id)}
                            >
                              <X className="h-4 w-4 mr-1" /> Tolak
                            </Button>
                            <Button
                              size="sm"
                              disabled={rejectConnectionMutation.isPending || acceptConnectionMutation.isPending}
                              onClick={() => acceptConnectionMutation.mutate(conn.id)}
                            >
                              <Check className="h-4 w-4 mr-1" /> Setujui
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center py-12 text-center text-muted-foreground">
                  <ShieldAlert className="h-12 w-12 mb-4 opacity-20" />
                  <p>Tidak ada pengajuan koneksi yang pending.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 2: DAFTAR SEMUA GRUP ── */}
        <TabsContent value="groups" className="space-y-4">
          {readyToActivate > 0 && (
            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
              <Zap className="h-4 w-4 shrink-0 mt-0.5" />
              <p>
                <span className="font-semibold">{readyToActivate} grup</span> sudah memenuhi target dana{" "}
                {formatRp(MIN_BUDGET)} dan siap untuk diaktifkan (ditandai dengan highlight di bawah).
              </p>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Direktori Grup Asuh</CardTitle>
              <CardDescription>Semua grup yang terdaftar di sistem OTA-KU.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingGroups ? (
                <p className="text-center text-muted-foreground py-8">Memuat data...</p>
              ) : groupsData?.data && groupsData.data.length > 0 ? (
                <div className="rounded-md border overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 border-b">
                      <tr>
                        <th className="p-4 font-medium">Nama Grup</th>
                        <th className="p-4 font-medium">Status</th>
                        <th className="p-4 font-medium">Statistik</th>
                        <th className="p-4 font-medium">Total Dana Terkumpul</th>
                        <th className="p-4 font-medium text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupsData.data.map((group) => {
                        const pledge = group.totalPledge ?? 0;
                        const isReady = group.status === "forming" && pledge >= MIN_BUDGET;
                        const progress = Math.min((pledge / MIN_BUDGET) * 100, 100);

                        return (
                          <tr
                            key={group.id}
                            className={`border-b last:border-0 transition-colors ${
                              isReady
                                ? "bg-amber-50 hover:bg-amber-100/70 dark:bg-amber-950/20 dark:hover:bg-amber-950/40"
                                : "hover:bg-muted/30"
                            }`}
                          >
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                {isReady && (
                                  <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                )}
                                <span className="font-medium">{group.name}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge variant={group.status === "active" ? "default" : "secondary"}>
                                {group.status === "active" ? "Aktif" : "Forming"}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <div className="flex flex-col text-xs text-muted-foreground">
                                <span>
                                  <Users className="inline h-3 w-3 mr-1" />
                                  {group.memberCount} Anggota
                                </span>
                                <span>{group.activeConnectionCount} Mhs Asuh</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="space-y-1 min-w-[160px]">
                                <div className="flex items-center justify-between text-xs">
                                  <span className={`font-semibold ${pledge >= MIN_BUDGET ? "text-green-600" : "text-foreground"}`}>
                                    {formatRp(pledge)}
                                  </span>
                                  <span className="text-muted-foreground">{formatRp(MIN_BUDGET)}</span>
                                </div>
                                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${
                                      pledge >= MIN_BUDGET ? "bg-green-500" : "bg-primary"
                                    }`}
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-right">
                              {group.status === "forming" && group.memberCount > 0 && (
                                <Button
                                  size="sm"
                                  variant={isReady ? "default" : "secondary"}
                                  onClick={() => activateMutation.mutate(group.id)}
                                  disabled={activateMutation.isPending || !isReady}
                                  title={!isReady ? `Dana belum mencukupi (${formatRp(pledge)} / ${formatRp(MIN_BUDGET)})` : undefined}
                                >
                                  {isReady ? <Zap className="mr-1 h-3.5 w-3.5" /> : null}
                                  Aktifkan Grup
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">Belum ada grup yang dibuat.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}