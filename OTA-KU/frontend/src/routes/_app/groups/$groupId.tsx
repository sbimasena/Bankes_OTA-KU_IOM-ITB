import { api } from "@/api/client";
import { groupService } from "@/api/groupService";
import type { MahasiswaListElement } from "@/api/generated/models/MahasiswaListElement";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Users, Calendar, Info, UserPlus, Lock, Coins, Search, Check, Shuffle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/groups/$groupId")({
  component: GroupDetailPage,
});

const MIN_BUDGET = 800_000;
const formatRp = (n: number) => `Rp${n.toLocaleString("id-ID")}`;

function GroupDetailPage() {
  const { groupId } = Route.useParams();
  const queryClient = useQueryClient();

  const [isProposeModalOpen, setIsProposeModalOpen] = useState(false);
  const [mahasiswaSearch, setMahasiswaSearch] = useState("");
  const [selectedMahasiswa, setSelectedMahasiswa] = useState<MahasiswaListElement | null>(null);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmailOrId, setInviteEmailOrId] = useState("");

  // ── Queries ──────────────────────────────────────────────────────────────
  const { data: group, isLoading: isLoadingGroup } = useQuery({
    queryKey: ["groupDetail", groupId],
    queryFn: () => groupService.getGroupDetail(groupId),
  });

  const { data: proposals, isLoading: isLoadingProposals } = useQuery({
    queryKey: ["groupProposals", groupId],
    queryFn: () => groupService.getProposals(groupId),
  });

  const { data: mahasiswaList, isLoading: isLoadingMahasiswa } = useQuery({
    queryKey: ["availableMahasiswa", mahasiswaSearch],
    queryFn: () => api.list.listMahasiswaOta({ q: mahasiswaSearch || undefined }),
    enabled: isProposeModalOpen,
    select: (res) => res.body.data,
  });

  // ── Mutations ─────────────────────────────────────────────────────────────
  const proposeMutation = useMutation({
    mutationFn: (mahasiswaId: string) => groupService.proposeStudent(groupId, mahasiswaId),
    onSuccess: () => {
      toast.success("Mahasiswa berhasil diusulkan, menunggu persetujuan admin.");
      queryClient.invalidateQueries({ queryKey: ["groupProposals", groupId] });
      setIsProposeModalOpen(false);
      setSelectedMahasiswa(null);
      setMahasiswaSearch("");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? "Gagal mengusulkan mahasiswa");
    },
  });

  const inviteMutation = useMutation({
    mutationFn: (invitedOtaId: string) => groupService.inviteMember(groupId, invitedOtaId),
    onSuccess: () => {
      toast.success("Undangan berhasil dikirim.");
      queryClient.invalidateQueries({ queryKey: ["groupDetail", groupId] });
      setIsInviteModalOpen(false);
      setInviteEmailOrId("");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? "Gagal mengirim undangan");
    },
  });

  const handlePropose = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMahasiswa) return;
    proposeMutation.mutate(selectedMahasiswa.accountId);
  };

  const handleProposeModalOpenChange = (open: boolean) => {
    setIsProposeModalOpen(open);
    if (!open) {
      setSelectedMahasiswa(null);
      setMahasiswaSearch("");
    }
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmailOrId) return;
    inviteMutation.mutate(inviteEmailOrId);
  };

  const autoMatchConsentMutation = useMutation({
    mutationFn: (consent: boolean) => groupService.setAutoMatchConsent(groupId, consent),
    onSuccess: (_, consent) => {
      toast.success(consent ? "Grup disetujui untuk auto-pair oleh admin." : "Persetujuan auto-pair dibatalkan.");
      queryClient.invalidateQueries({ queryKey: ["groupDetail", groupId] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? "Gagal memperbarui status auto-pair");
    },
  });

  if (isLoadingGroup || isLoadingProposals) {
    return <div className="p-8 text-center text-muted-foreground">Memuat data grup...</div>;
  }

  if (!group) {
    return <div className="p-8 text-center text-destructive font-bold">Grup tidak ditemukan.</div>;
  }

  // ── Derived state ─────────────────────────────────────────────────────────
  const totalPledge = group.totalPledge;
  const budgetProgress = Math.min((totalPledge / MIN_BUDGET) * 100, 100);
  const isBudgetMet = totalPledge >= MIN_BUDGET;
  const isGroupActive = group.status === "active";
  const hasActiveProposal = (proposals ?? []).some(
    (p) => p.status !== "rejected" && p.status !== "failed",
  );
  const canPropose = isGroupActive && isBudgetMet && !hasActiveProposal;

  const proposeLockMessage = hasActiveProposal
    ? "Sudah ada proposal mahasiswa yang sedang berjalan."
    : !isGroupActive
      ? "Grup harus aktif dan mengumpulkan dana min. Rp800.000 untuk memilih mahasiswa."
      : !isBudgetMet
        ? `Dana grup belum mencukupi (${formatRp(totalPledge)} / ${formatRp(MIN_BUDGET)}). Ajak lebih banyak anggota untuk berkomitmen.`
        : undefined;

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* ── Header ── */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link to="/groups">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{group.name}</h1>
            <Badge variant={group.status === "active" ? "default" : "secondary"}>
              {group.status === "active" ? "Aktif" : "Forming"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Dibuat pada {new Date(group.createdAt).toLocaleDateString("id-ID")}
          </p>
        </div>

        {/* ── Actions ── */}
        <div className="flex items-start gap-3">
          {/* Auto-pair consent toggle */}
          {isGroupActive && !hasActiveProposal && (
            <div className="flex flex-col items-end gap-1">
              <Button
                variant={group.autoMatchConsent ? "default" : "outline"}
                className={group.autoMatchConsent
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400"}
                onClick={() => autoMatchConsentMutation.mutate(!group.autoMatchConsent)}
                disabled={autoMatchConsentMutation.isPending}
              >
                <Shuffle className="mr-2 h-4 w-4" />
                {group.autoMatchConsent ? "Auto-Pair: ON" : "Auto-Pair: OFF"}
              </Button>
              <p className="text-[11px] text-muted-foreground max-w-[200px] text-right leading-tight">
                {group.autoMatchConsent
                  ? "Admin bisa pasangkan mahasiswa otomatis."
                  : "Izinkan admin pasangkan mahasiswa otomatis."}
              </p>
            </div>
          )}

          {group.members.length < 8 && (
            <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  disabled={hasActiveProposal}
                  title={hasActiveProposal ? "Tidak bisa mengundang anggota saat ada proposal mahasiswa yang sedang berjalan." : undefined}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Undang Anggota
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Undang Anggota Baru</DialogTitle>
                  <DialogDescription>
                    Masukkan email OTA yang ingin diundang ke grup ini. Maksimal anggota grup adalah 8.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleInvite} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="inviteEmail">Email OTA</Label>
                    <Input
                      id="inviteEmail"
                      type="email"
                      placeholder="contoh@email.com"
                      value={inviteEmailOrId}
                      onChange={(e) => setInviteEmailOrId(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={inviteMutation.isPending}>
                    {inviteMutation.isPending ? "Mengirim..." : "Kirim Undangan"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}

          <Dialog open={isProposeModalOpen} onOpenChange={handleProposeModalOpenChange}>
            <div className="flex flex-col items-end gap-1">
              <DialogTrigger asChild>
                <Button disabled={!canPropose} title={proposeLockMessage}>
                  {canPropose ? (
                    <UserPlus className="mr-2 h-4 w-4" />
                  ) : (
                    <Lock className="mr-2 h-4 w-4" />
                  )}
                  Usulkan Mahasiswa
                </Button>
              </DialogTrigger>
              {proposeLockMessage && (
                <p className="text-[11px] text-muted-foreground max-w-[260px] text-right leading-tight">
                  {proposeLockMessage}
                </p>
              )}
            </div>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Usulkan Mahasiswa</DialogTitle>
                <DialogDescription>
                  Pilih mahasiswa dari daftar berikut. Proposal akan diteruskan ke admin untuk disetujui.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handlePropose} className="space-y-4 py-2">
                {selectedMahasiswa ? (
                  <div className="flex items-center justify-between rounded-lg border border-primary bg-primary/5 px-4 py-3">
                    <div>
                      <p className="font-semibold text-sm">{selectedMahasiswa.name}</p>
                      <p className="text-xs text-muted-foreground">{selectedMahasiswa.nim} · {selectedMahasiswa.major}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedMahasiswa(null)}
                    >
                      Ganti
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Cari Mahasiswa</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Cari nama atau NIM..."
                        className="pl-9"
                        value={mahasiswaSearch}
                        onChange={(e) => setMahasiswaSearch(e.target.value)}
                      />
                    </div>
                    <ScrollArea className="h-64 rounded-md border">
                      {isLoadingMahasiswa ? (
                        <div className="flex items-center justify-center h-full py-8 text-sm text-muted-foreground">
                          Memuat daftar mahasiswa...
                        </div>
                      ) : !mahasiswaList || mahasiswaList.length === 0 ? (
                        <div className="flex items-center justify-center h-full py-8 text-sm text-muted-foreground">
                          Tidak ada mahasiswa tersedia.
                        </div>
                      ) : (
                        <ul className="divide-y">
                          {mahasiswaList.map((mhs) => (
                            <li key={mhs.accountId}>
                              <button
                                type="button"
                                className="w-full text-left px-4 py-3 hover:bg-muted/60 transition-colors flex items-center justify-between"
                                onClick={() => setSelectedMahasiswa(mhs)}
                              >
                                <div>
                                  <p className="text-sm font-medium">{mhs.name}</p>
                                  <p className="text-xs text-muted-foreground">{mhs.nim} · {mhs.major} · IPK {mhs.gpa}</p>
                                </div>
                                <Check className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </ScrollArea>
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={proposeMutation.isPending || !selectedMahasiswa}
                >
                  {proposeMutation.isPending ? "Mengirim..." : "Kirim Proposal ke Admin"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ── Budget Progress Bar ── */}
      <Card className={`border-2 ${isBudgetMet ? "border-green-500/40 bg-green-500/5" : "border-border"}`}>
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Coins className="h-4 w-4 text-primary" />
              <span>Total Dana Grup</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${isBudgetMet ? "text-green-600" : "text-foreground"}`}>
                {formatRp(totalPledge)}
              </span>
              <span className="text-xs text-muted-foreground">/ {formatRp(MIN_BUDGET)}</span>
              {isBudgetMet && (
                <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px]">
                  Target Tercapai ✓
                </Badge>
              )}
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${isBudgetMet ? "bg-green-500" : "bg-primary"
                }`}
              style={{ width: `${budgetProgress}%` }}
            />
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            {isBudgetMet
              ? "Dana terkumpul sudah mencukupi. Admin dapat mengaktifkan grup ini."
              : `Masih perlu ${formatRp(MIN_BUDGET - totalPledge)} lagi untuk memenuhi target.`}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Detail Info & Anggota ── */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Info className="h-5 w-5 text-primary" /> Detail Grup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <Label className="text-muted-foreground">Deskripsi</Label>
                <p>{group.description || "Tidak ada deskripsi."}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Kriteria Mahasiswa</Label>
                <p className="font-medium">{group.criteria || "Semua Mahasiswa"}</p>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Tagihan: Setiap tanggal {group.transferDate || "-"}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-primary" /> Anggota ({group.members.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {group.members.map((member) => (
                  <li key={member.otaId} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div>
                      <span className="font-medium text-sm">{member.name}</span>
                      <p className="text-xs text-muted-foreground">
                        Bergabung: {new Date(member.joinedAt).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-semibold text-primary">
                        {formatRp(member.pledgeAmount ?? 0)}
                      </span>
                      <p className="text-[10px] text-muted-foreground">kontribusi</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* ── Proposal List ── */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight border-b pb-2">Proposal Mahasiswa</h2>

          {proposals && proposals.length > 0 ? (
            <div className="grid gap-4">
              {proposals.map((proposal) => {
                const statusVariant =
                  proposal.status === "passed" || proposal.status === "approved"
                    ? "default"
                    : proposal.status === "rejected" || proposal.status === "failed"
                      ? "destructive"
                      : "secondary";

                const statusLabel: Record<string, string> = {
                  open: "Open",
                  passed: "Menunggu Admin",
                  approved: "Disetujui",
                  rejected: "Ditolak",
                  failed: "Gagal",
                };

                return (
                  <Card key={proposal.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">{proposal.mahasiswaName}</CardTitle>
                          <CardDescription>NIM: {proposal.mahasiswaNim}</CardDescription>
                        </div>
                        <Badge variant={statusVariant}>
                          {statusLabel[proposal.status] ?? proposal.status.toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex gap-4 text-sm">
                        <div className="bg-muted px-4 py-2 rounded-lg">
                          <p className="text-xs text-muted-foreground">Diusulkan oleh</p>
                          <p className="font-semibold">{proposal.proposedByName ?? "Admin"}</p>
                        </div>
                        <div className="bg-muted px-4 py-2 rounded-lg">
                          <p className="text-xs text-muted-foreground">Tanggal</p>
                          <p className="font-semibold">
                            {new Date(proposal.createdAt).toLocaleDateString("id-ID")}
                          </p>
                        </div>
                      </div>
                      {(proposal.status === "passed" || proposal.status === "approved") && (
                        <p className="text-xs text-muted-foreground italic">
                          Proposal telah dikirim ke admin untuk persetujuan akhir.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="border-dashed bg-muted/20">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Users className="mb-4 h-12 w-12 text-muted-foreground/30" />
                <h3 className="text-xl font-medium">Belum Ada Mahasiswa</h3>
                <p className="text-sm text-muted-foreground max-w-sm mt-1">
                  {canPropose
                    ? "Klik \"Usulkan Mahasiswa\" untuk mulai memilih mahasiswa asuh."
                    : "Grup perlu aktif dan dana terkumpul sebelum bisa mengusulkan mahasiswa."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}