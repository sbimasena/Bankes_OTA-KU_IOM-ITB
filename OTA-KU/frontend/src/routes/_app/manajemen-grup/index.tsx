import { groupService } from "@/api/groupService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AutoPairSuggestion, GroupDetail } from "@/types/group";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  BookUser,
  Check,
  Eye,
  GraduationCap,
  Loader2,
  ShieldAlert,
  Shuffle,
  Trash2,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/manajemen-grup/" as any)({
  component: AdminGroupManagement,
});

const MIN_BUDGET = 800_000;
const formatRp = (n: number) => `Rp${n.toLocaleString("id-ID")}`;

const MAJOR_LABELS: Record<string, string> = {
  Teknik_Informatika: "Teknik Informatika",
  Teknik_Elektro: "Teknik Elektro",
  Teknik_Mesin: "Teknik Mesin",
  Teknik_Sipil: "Teknik Sipil",
  Teknik_Kimia: "Teknik Kimia",
  Matematika: "Matematika",
  Fisika: "Fisika",
  Astronomi: "Astronomi",
  Kimia: "Kimia",
  Biologi: "Biologi",
  Arsitektur: "Arsitektur",
  Manajemen: "Manajemen",
};

const formatMajor = (major: string | null) => {
  if (!major) return "-";
  return MAJOR_LABELS[major] ?? major.replace(/_/g, " ");
};

// ── Auto-Pair Confirmation Modal ──────────────────────────────────────────────

interface AutoPairModalProps {
  suggestion: AutoPairSuggestion | null;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}

function AutoPairModal({ suggestion, onClose, onConfirm, isPending }: AutoPairModalProps) {
  return (
    <Dialog open={!!suggestion} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Shuffle className="h-5 w-5 text-primary" />
            Konfirmasi Auto-Pair
          </DialogTitle>
          <DialogDescription>
            Sistem telah memilih mahasiswa secara acak untuk dipasangkan dengan grup ini. Periksa
            detail sebelum mengkonfirmasi.
          </DialogDescription>
        </DialogHeader>

        {suggestion && (
          <div className="space-y-4 py-2">
            {/* Group info */}
            <div className="rounded-lg bg-muted/50 px-4 py-3 space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Grup Sponsor
              </p>
              <p className="font-semibold text-base">{suggestion.groupName}</p>
            </div>

            <hr className="border-border" />

            {/* Mahasiswa info */}
            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Mahasiswa Asuh
              </p>

              <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 items-center text-sm">
                <span className="text-muted-foreground">NIM</span>
                <span className="font-mono font-semibold">{suggestion.nim}</span>

                <span className="text-muted-foreground">Nama</span>
                <span className="font-medium">{suggestion.name}</span>

                <span className="text-muted-foreground flex items-center gap-1">
                  <GraduationCap className="h-3.5 w-3.5" />
                  Jurusan
                </span>
                <span>{formatMajor(suggestion.major)}</span>

                <span className="text-muted-foreground flex items-center gap-1 self-start pt-0.5">
                  <BookUser className="h-3.5 w-3.5" />
                  Deskripsi
                </span>
                <span className="text-muted-foreground text-xs leading-relaxed">
                  {suggestion.description || "-"}
                </span>
              </div>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
              Setelah dikonfirmasi oleh admin, koneksi langsung berstatus <strong>accepted</strong>
              dan tidak memerlukan persetujuan ulang.
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            <X className="h-4 w-4 mr-1" />
            Batal
          </Button>
          <Button onClick={onConfirm} disabled={isPending}>
            {isPending ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Check className="h-4 w-4 mr-1" />
            )}
            Konfirmasi &amp; Pasangkan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface GroupStatsModalProps {
  open: boolean;
  onClose: () => void;
  isLoading: boolean;
  detail?: GroupDetail;
}

function GroupStatsModal({ open, onClose, isLoading, detail }: GroupStatsModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Statistik Grup</DialogTitle>
          <DialogDescription>
            Menampilkan seluruh OTA anggota grup dan seluruh mahasiswa yang terhubung ke grup.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">Memuat detail grup...</div>
        ) : !detail ? (
          <div className="py-8 text-center text-muted-foreground">Detail grup tidak tersedia.</div>
        ) : (
          <div className="space-y-4 py-1">
            <div className="rounded-md bg-muted/50 px-3 py-2">
              <p className="text-sm font-semibold">{detail.name}</p>
              <p className="text-xs text-muted-foreground">
                Total pledge: {formatRp(detail.totalPledge)} • Status: {detail.status}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold mb-2">OTA Anggota ({detail.members.length})</p>
              {detail.members.length > 0 ? (
                <div className="rounded-md border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b">
                      <tr>
                        <th className="p-2 text-left font-medium">Nama OTA</th>
                        <th className="p-2 text-left font-medium">Pledge</th>
                        <th className="p-2 text-left font-medium">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.members.map((member) => (
                        <tr key={member.otaId} className="border-b last:border-0">
                          <td className="p-2">{member.name || "-"}</td>
                          <td className="p-2">{formatRp(member.pledgeAmount ?? 0)}</td>
                          <td className="p-2 text-muted-foreground">
                            {new Date(member.joinedAt).toLocaleDateString("id-ID")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Belum ada anggota OTA.</p>
              )}
            </div>

            <div>
              <p className="text-sm font-semibold mb-2">Mahasiswa di Grup ({detail.students.length})</p>
              {detail.students.length > 0 ? (
                <div className="rounded-md border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b">
                      <tr>
                        <th className="p-2 text-left font-medium">Nama</th>
                        <th className="p-2 text-left font-medium">NIM</th>
                        <th className="p-2 text-left font-medium">Status</th>
                        <th className="p-2 text-left font-medium">Dibuat</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.students.map((student) => (
                        <tr key={student.connectionId} className="border-b last:border-0">
                          <td className="p-2">{student.mahasiswaName || "-"}</td>
                          <td className="p-2 font-mono">{student.mahasiswaNim}</td>
                          <td className="p-2">
                            <Badge variant={student.connectionStatus === "accepted" ? "default" : "secondary"}>
                              {student.connectionStatus}
                            </Badge>
                          </td>
                          <td className="p-2 text-muted-foreground">
                            {new Date(student.createdAt).toLocaleDateString("id-ID")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Belum ada mahasiswa di grup ini.</p>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Tutup</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Delete Group Confirmation Modal ──────────────────────────────────────────

interface DeleteGroupModalProps {
  groupName: string | null;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}

function DeleteGroupModal({ groupName, onClose, onConfirm, isPending }: DeleteGroupModalProps) {
  return (
    <Dialog open={!!groupName} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg text-destructive">
            <Trash2 className="h-5 w-5" />
            Hapus Grup
          </DialogTitle>
          <DialogDescription>
            Tindakan ini tidak dapat dibatalkan. Semua data grup termasuk anggota, undangan, dan
            proposal akan ikut terhapus.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-lg bg-muted/50 px-4 py-3">
          <p className="text-sm font-medium">{groupName}</p>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Batal
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Trash2 className="h-4 w-4 mr-1" />}
            Hapus Grup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

function AdminGroupManagement() {
  const queryClient = useQueryClient();

  // Auto-pair modal state
  const [autoPairSuggestion, setAutoPairSuggestion] = useState<AutoPairSuggestion | null>(null);
  const [loadingAutoPairGroupId, setLoadingAutoPairGroupId] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // ── Queries ──────────────────────────────────────────────────────────────
  const { data: groupsData, isLoading: isLoadingGroups } = useQuery({
    queryKey: ["adminAllGroups"],
    queryFn: () => groupService.getAllGroups(),
  });

  const { data: pendingData, isLoading: isLoadingPending } = useQuery({
    queryKey: ["adminPendingConnections"],
    queryFn: () => groupService.getPendingConnections(),
  });

  const { data: selectedGroupDetail, isLoading: isLoadingSelectedGroupDetail } = useQuery({
    queryKey: ["adminGroupDetail", selectedGroupId],
    queryFn: () => groupService.getGroupDetail(selectedGroupId!),
    enabled: !!selectedGroupId,
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

  const confirmAutoPairMutation = useMutation({
    mutationFn: ({ groupId, mahasiswaId }: { groupId: string; mahasiswaId: string }) =>
      groupService.confirmAutoPair(groupId, mahasiswaId),
    onSuccess: () => {
      toast.success("Mahasiswa berhasil dipasangkan dan langsung disetujui.");
      setAutoPairSuggestion(null);
      queryClient.invalidateQueries({ queryKey: ["adminAllGroups"] });
      queryClient.invalidateQueries({ queryKey: ["adminPendingConnections"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? "Gagal memasangkan mahasiswa");
      setAutoPairSuggestion(null);
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: (groupId: string) => groupService.deleteGroup(groupId),
    onSuccess: () => {
      toast.success("Grup berhasil dihapus");
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["adminAllGroups"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? "Gagal menghapus grup");
      setDeleteTarget(null);
    },
  });

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleAutoPair = async (groupId: string) => {
    setLoadingAutoPairGroupId(groupId);
    try {
      const suggestion = await groupService.autoPairPreview(groupId);
      setAutoPairSuggestion(suggestion);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ?? err?.message ?? "Tidak ada mahasiswa yang tersedia",
      );
    } finally {
      setLoadingAutoPairGroupId(null);
    }
  };

  const handleConfirmAutoPair = () => {
    if (!autoPairSuggestion) return;
    confirmAutoPairMutation.mutate({
      groupId: autoPairSuggestion.groupId,
      mahasiswaId: autoPairSuggestion.mahasiswaId,
    });
  };

  // Count how many forming groups have reached the budget target
  const readyToActivate =
    groupsData?.data.filter(
      (g) => g.status === "forming" && (g.totalPledge ?? 0) >= MIN_BUDGET,
    ).length ?? 0;

  const activeWithoutStudent =
    groupsData?.data.filter(
      (g) => g.status === "active" && g.activeConnectionCount === 0,
    ).length ?? 0;

  return (
    <div className="flex flex-col gap-6 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manajemen Grup Asuh</h1>
        <p className="text-muted-foreground">
          Panel kontrol admin untuk mengelola grup dan persetujuan koneksi.
        </p>
      </div>

      {/* Auto-Pair Confirmation Modal */}
      <AutoPairModal
        suggestion={autoPairSuggestion}
        onClose={() => setAutoPairSuggestion(null)}
        onConfirm={handleConfirmAutoPair}
        isPending={confirmAutoPairMutation.isPending}
      />

      <DeleteGroupModal
        groupName={deleteTarget?.name ?? null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteGroupMutation.mutate(deleteTarget.id)}
        isPending={deleteGroupMutation.isPending}
      />

      <GroupStatsModal
        open={!!selectedGroupId}
        onClose={() => setSelectedGroupId(null)}
        isLoading={isLoadingSelectedGroupDetail}
        detail={selectedGroupDetail}
      />

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            Persetujuan Koneksi
            {pendingData?.data && pendingData.data.length > 0 && (
              <Badge
                variant="destructive"
                className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full"
              >
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
            {activeWithoutStudent > 0 && (
              <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full bg-blue-500">
                {activeWithoutStudent}
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
                Daftar proposal mahasiswa yang diusulkan oleh grup pre-funded dan memerlukan
                persetujuan admin.
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
                        <tr
                          key={conn.id}
                          className="border-b last:border-0 hover:bg-muted/30"
                        >
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
                              disabled={
                                rejectConnectionMutation.isPending ||
                                acceptConnectionMutation.isPending
                              }
                              onClick={() => rejectConnectionMutation.mutate(conn.id)}
                            >
                              <X className="h-4 w-4 mr-1" /> Tolak
                            </Button>
                            <Button
                              size="sm"
                              disabled={
                                rejectConnectionMutation.isPending ||
                                acceptConnectionMutation.isPending
                              }
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
                <span className="font-semibold">{readyToActivate} grup</span> sudah memenuhi
                target dana {formatRp(MIN_BUDGET)} dan siap untuk diaktifkan (ditandai dengan
                highlight di bawah).
              </p>
            </div>
          )}

          {activeWithoutStudent > 0 && (
            <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400">
              <Shuffle className="h-4 w-4 shrink-0 mt-0.5" />
              <p>
                <span className="font-semibold">{activeWithoutStudent} grup aktif</span> belum
                memiliki mahasiswa asuh. Gunakan tombol{" "}
                <span className="font-semibold">Auto-Pair</span> untuk mencarikan secara otomatis.
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
                        const isActiveWithoutStudent =
                          group.status === "active" && group.activeConnectionCount === 0;
                        const progress = Math.min((pledge / MIN_BUDGET) * 100, 100);
                        const isLoadingThisAutoPair = loadingAutoPairGroupId === group.id;

                        return (
                          <tr
                            key={group.id}
                            className={`border-b last:border-0 transition-colors ${
                              isReady
                                ? "bg-amber-50 hover:bg-amber-100/70 dark:bg-amber-950/20 dark:hover:bg-amber-950/40"
                                : isActiveWithoutStudent
                                  ? "bg-blue-50/40 hover:bg-blue-100/40 dark:bg-blue-950/10 dark:hover:bg-blue-950/20"
                                  : "hover:bg-muted/30"
                            }`}
                          >
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                {isReady && (
                                  <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                )}
                                {isActiveWithoutStudent && (
                                  <Shuffle className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                                )}
                                <span className="font-medium">{group.name}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge
                                variant={group.status === "active" ? "default" : "secondary"}
                              >
                                {group.status === "active" ? "Aktif" : "Forming"}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-auto px-2 py-1"
                                onClick={() => setSelectedGroupId(group.id)}
                              >
                                <div className="flex flex-col text-left text-xs text-muted-foreground">
                                  <span>
                                    <Users className="inline h-3 w-3 mr-1" />
                                    {group.memberCount} Anggota
                                  </span>
                                  <span className="inline-flex items-center gap-1">
                                    {group.activeConnectionCount} Mhs Asuh
                                    <Eye className="h-3 w-3" />
                                  </span>
                                </div>
                              </Button>
                            </td>
                            <td className="p-4">
                              <div className="space-y-1 min-w-[160px]">
                                <div className="flex items-center justify-between text-xs">
                                  <span
                                    className={`font-semibold ${pledge >= MIN_BUDGET ? "text-green-600" : "text-foreground"}`}
                                  >
                                    {formatRp(pledge)}
                                  </span>
                                  <span className="text-muted-foreground">
                                    {formatRp(MIN_BUDGET)}
                                  </span>
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
                              <div className="flex items-center justify-end gap-2">
                                {/* Delete button — admin only */}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                  onClick={() => setDeleteTarget({ id: group.id, name: group.name })}
                                  disabled={deleteGroupMutation.isPending || group.activeConnectionCount > 0}
                                  title={group.activeConnectionCount > 0 ? "Grup memiliki mahasiswa aktif" : "Hapus grup"}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>

                                {/* Activate button — forming groups ready for activation */}
                                {group.status === "forming" && group.memberCount > 0 && (
                                  <Button
                                    size="sm"
                                    variant={isReady ? "default" : "secondary"}
                                    onClick={() => activateMutation.mutate(group.id)}
                                    disabled={activateMutation.isPending || !isReady}
                                    title={
                                      !isReady
                                        ? `Dana belum mencukupi (${formatRp(pledge)} / ${formatRp(MIN_BUDGET)})`
                                        : undefined
                                    }
                                  >
                                    {isReady ? (
                                      <Zap className="mr-1 h-3.5 w-3.5" />
                                    ) : null}
                                    Aktifkan Grup
                                  </Button>
                                )}

                                {/* Auto-Pair button — active groups with no student and consent given */}
                                {isActiveWithoutStudent && (
                                  <Button
                                    id={`auto-pair-btn-${group.id}`}
                                    size="sm"
                                    variant="outline"
                                    className={
                                      group.autoMatchConsent
                                        ? "border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/30"
                                        : "border-muted-foreground/30 text-muted-foreground cursor-not-allowed"
                                    }
                                    onClick={() => group.autoMatchConsent && handleAutoPair(group.id)}
                                    disabled={isLoadingThisAutoPair || !!loadingAutoPairGroupId || !group.autoMatchConsent}
                                    title={!group.autoMatchConsent ? "Grup belum memberi persetujuan auto-pair" : undefined}
                                  >
                                    {isLoadingThisAutoPair ? (
                                      <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                                    ) : (
                                      <Shuffle className="h-3.5 w-3.5 mr-1" />
                                    )}
                                    Auto-Pair
                                    {group.autoMatchConsent && (
                                      <Check className="h-3 w-3 ml-1 text-green-500" />
                                    )}
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Belum ada grup yang dibuat.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}