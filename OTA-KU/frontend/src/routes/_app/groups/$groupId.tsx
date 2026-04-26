import { groupService } from "@/api/groupService";
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Users, Calendar, Info, UserPlus, Lock, Coins } from "lucide-react";
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
  const [mahasiswaIdInput, setMahasiswaIdInput] = useState("");

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

  // ── Mutations ─────────────────────────────────────────────────────────────
  const proposeMutation = useMutation({
    mutationFn: (mahasiswaId: string) => groupService.proposeStudent(groupId, mahasiswaId),
    onSuccess: () => {
      toast.success("Mahasiswa berhasil diusulkan, menunggu persetujuan admin.");
      queryClient.invalidateQueries({ queryKey: ["groupProposals", groupId] });
      setIsProposeModalOpen(false);
      setMahasiswaIdInput("");
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
    if (!mahasiswaIdInput) return;
    proposeMutation.mutate(mahasiswaIdInput);
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmailOrId) return;
    inviteMutation.mutate(inviteEmailOrId);
  };

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
  const canPropose = isGroupActive && isBudgetMet;

  const proposeLockMessage = !isGroupActive
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
          {group.members.length < 8 && (
            <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Undang Anggota
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Undang Anggota Baru</DialogTitle>
                  <DialogDescription>
                    Masukkan UUID OTA yang ingin diundang ke grup ini. Maksimal anggota grup adalah 8.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleInvite} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="inviteId">ID OTA (UUID)</Label>
                    <Input
                      id="inviteId"
                      placeholder="Masukkan UUID OTA"
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

          <Dialog open={isProposeModalOpen} onOpenChange={setIsProposeModalOpen}>
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
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Usulkan Mahasiswa</DialogTitle>
                <DialogDescription>
                  Karena grup sudah pre-funded, proposal langsung diteruskan ke admin untuk disetujui.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handlePropose} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="mhsId">ID Mahasiswa (UUID)</Label>
                  <Input
                    id="mhsId"
                    placeholder="Masukkan UUID mahasiswa"
                    value={mahasiswaIdInput}
                    onChange={(e) => setMahasiswaIdInput(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={proposeMutation.isPending}>
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