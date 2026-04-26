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
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, Mail, Plus, AlertCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/groups/")({
  component: GroupsDashboard,
});

const MAX_PLEDGE = 800_000;
const formatRp = (n: number) => `Rp${n.toLocaleString("id-ID")}`;

function GroupsDashboard() {
  const queryClient = useQueryClient();

  // ── Create Group dialog state ────────────────────────────────────────────
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    criteria: "",
    transferDate: "",
    pledgeAmount: "",
  });

  // ── Accept Invitation modal state ────────────────────────────────────────
  const [acceptInviteId, setAcceptInviteId] = useState<string | null>(null);
  const [acceptPledge, setAcceptPledge] = useState("");

  // ── Queries ──────────────────────────────────────────────────────────────
  const { data: myGroups, isLoading: isLoadingGroups } = useQuery({
    queryKey: ["myGroups"],
    queryFn: groupService.getMyGroups,
  });

  const { data: myInvitations, isLoading: isLoadingInvitations } = useQuery({
    queryKey: ["myInvitations"],
    queryFn: groupService.getMyInvitations,
  });

  // User is "in a group" when they have at least one membership
  const isInGroup = (myGroups?.length ?? 0) > 0;

  // ── Mutations ────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: groupService.createGroup,
    onSuccess: () => {
      toast.success("Grup berhasil dibuat!");
      queryClient.invalidateQueries({ queryKey: ["myGroups"] });
      setIsCreateOpen(false);
      setCreateForm({ name: "", description: "", criteria: "", transferDate: "", pledgeAmount: "" });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? "Gagal membuat grup");
    },
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, response, pledgeAmount }: { id: string; response: "accepted" | "rejected"; pledgeAmount?: number }) =>
      groupService.respondInvitation(id, response, pledgeAmount),
    onSuccess: (_, variables) => {
      if (variables.response === "accepted") {
        toast.success("Undangan diterima! Anda sekarang anggota grup.");
      } else {
        toast.success("Undangan ditolak.");
      }
      queryClient.invalidateQueries({ queryKey: ["myInvitations"] });
      queryClient.invalidateQueries({ queryKey: ["myGroups"] });
      setAcceptInviteId(null);
      setAcceptPledge("");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? "Gagal merespons undangan");
    },
  });

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pledge = Number(createForm.pledgeAmount);
    if (!createForm.name.trim()) return toast.error("Nama grup wajib diisi");
    if (pledge <= 0 || pledge > MAX_PLEDGE)
      return toast.error(`Pledge harus antara Rp1 – ${formatRp(MAX_PLEDGE)}`);

    createMutation.mutate({
      name: createForm.name,
      description: createForm.description || undefined,
      criteria: createForm.criteria || undefined,
      transferDate: createForm.transferDate ? Number(createForm.transferDate) : undefined,
      pledgeAmount: pledge,
    });
  };

  const handleAcceptInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptInviteId) return;
    const pledge = Number(acceptPledge);
    if (pledge <= 0 || pledge > MAX_PLEDGE)
      return toast.error(`Pledge harus antara Rp1 – ${formatRp(MAX_PLEDGE)}`);
    respondMutation.mutate({ id: acceptInviteId, response: "accepted", pledgeAmount: pledge });
  };

  if (isLoadingGroups || isLoadingInvitations) {
    return <div className="p-8 text-center text-muted-foreground">Memuat data...</div>;
  }

  return (
    <div className="flex flex-col gap-8 p-8">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Grup Asuh</h1>
          <p className="text-muted-foreground">Kelola keterlibatan grup Anda di sini.</p>
        </div>

        {/* ── Create Group Dialog ── */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button disabled={isInGroup} title={isInGroup ? "Anda sudah tergabung dalam grup lain" : undefined}>
              <Plus className="mr-2 h-4 w-4" /> Buat Grup
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Buat Grup Asuh Baru</DialogTitle>
              <DialogDescription>
                Sebagai pendiri, Anda wajib berkomitmen dana awal. Total grup minimal{" "}
                <span className="font-semibold text-foreground">{formatRp(MAX_PLEDGE)}</span> sebelum bisa aktif.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="create-name">Nama Grup <span className="text-destructive">*</span></Label>
                <Input
                  id="create-name"
                  placeholder="cth. Alumni Teknik 2020"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-desc">Deskripsi</Label>
                <Textarea
                  id="create-desc"
                  placeholder="Deskripsi singkat tentang grup..."
                  rows={2}
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-criteria">Kriteria Mahasiswa</Label>
                <Input
                  id="create-criteria"
                  placeholder="cth. Semester 1-4, IPK minimal 3.0"
                  value={createForm.criteria}
                  onChange={(e) => setCreateForm({ ...createForm, criteria: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-transfer-date">Tanggal Transfer (1–31)</Label>
                  <Input
                    id="create-transfer-date"
                    type="number"
                    min={1}
                    max={31}
                    placeholder="cth. 15"
                    value={createForm.transferDate}
                    onChange={(e) => setCreateForm({ ...createForm, transferDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-pledge">
                    Komitmen Dana Anda <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Rp</span>
                    <Input
                      id="create-pledge"
                      type="number"
                      min={1}
                      max={MAX_PLEDGE}
                      placeholder="400000"
                      className="pl-8"
                      value={createForm.pledgeAmount}
                      onChange={(e) => setCreateForm({ ...createForm, pledgeAmount: e.target.value })}
                      required
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">Maks. {formatRp(MAX_PLEDGE)}</p>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Membuat Grup..." : "Buat Grup"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* ── Already-in-group warning ── */}
      {isInGroup && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p>Anda sudah tergabung dalam sebuah grup. Anda tidak dapat membuat atau menerima undangan grup lain.</p>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* ── KOLOM 1: GRUP SAYA ── */}
        <div className="lg:col-span-2 space-y-6">
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b pb-2">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Grup Saya</h2>
            </div>

            {myGroups && myGroups.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {myGroups.map((group) => (
                  <Link
                    key={group.groupId}
                    to="/groups/$groupId"
                    params={{ groupId: group.groupId }}
                    className="block transition-transform hover:scale-[1.02]"
                  >
                    <Card className="h-full cursor-pointer hover:border-primary/50">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{group.groupName}</CardTitle>
                          <Badge variant={group.groupStatus === "active" ? "default" : "secondary"}>
                            {group.groupStatus === "active" ? "Aktif" : "Forming"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {group.memberCount} Anggota • {group.activeConnectionCount} Mahasiswa
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="border-dashed bg-muted/20">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="mb-3 h-10 w-10 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">
                    Anda belum tergabung di grup mana pun.
                    <br />
                    Buat grup baru atau tunggu undangan.
                  </p>
                </CardContent>
              </Card>
            )}
          </section>
        </div>

        {/* ── KOLOM 2: UNDANGAN ── */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b pb-2">
            <Mail className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">
              Undangan
              {myInvitations && myInvitations.length > 0 && (
                <Badge variant="destructive" className="ml-2 rounded-full px-1.5 py-0 text-xs">
                  {myInvitations.length}
                </Badge>
              )}
            </h2>
          </div>

          {/* Accept Pledge Modal */}
          <Dialog
            open={acceptInviteId !== null}
            onOpenChange={(open) => {
              if (!open) { setAcceptInviteId(null); setAcceptPledge(""); }
            }}
          >
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>Tentukan Komitmen Dana</DialogTitle>
                <DialogDescription>
                  Masukkan nominal dana yang Anda komitmen per bulan untuk bergabung ke grup ini.
                  Grup memerlukan total minimal <span className="font-semibold text-foreground">{formatRp(MAX_PLEDGE)}</span>.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAcceptInvite} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="accept-pledge">Nominal Komitmen (IDR)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Rp</span>
                    <Input
                      id="accept-pledge"
                      type="number"
                      min={1}
                      max={MAX_PLEDGE}
                      placeholder="400000"
                      className="pl-8"
                      value={acceptPledge}
                      onChange={(e) => setAcceptPledge(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">Maks. {formatRp(MAX_PLEDGE)}</p>
                </div>
                <Button type="submit" className="w-full" disabled={respondMutation.isPending}>
                  {respondMutation.isPending ? "Memproses..." : "Terima & Bergabung"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <div className="grid gap-4">
            {myInvitations && myInvitations.length > 0 ? (
              myInvitations.map((invitation) => (
                <Card key={invitation.invitationId}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base">{invitation.groupName}</CardTitle>
                      <Badge variant={invitation.groupStatus === "active" ? "default" : "secondary"} className="shrink-0">
                        {invitation.groupStatus === "active" ? "Aktif" : "Forming"}
                      </Badge>
                    </div>
                    <CardDescription>
                      Oleh {invitation.invitedByName || "Admin"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-sm">
                      <span className="text-muted-foreground">Anggota saat ini</span>
                      <span className="font-medium">{invitation.memberCount} orang</span>
                    </div>
                    <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-sm">
                      <span className="text-muted-foreground">Total kontribusi grup</span>
                      <span className="font-semibold text-primary">{formatRp(invitation.totalPledge)}/bln</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        disabled={isInGroup || respondMutation.isPending}
                        title={isInGroup ? "Anda sudah tergabung dalam grup lain" : undefined}
                        onClick={() => setAcceptInviteId(invitation.invitationId)}
                      >
                        Terima
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        disabled={respondMutation.isPending}
                        onClick={() =>
                          respondMutation.mutate({ id: invitation.invitationId, response: "rejected" })
                        }
                      >
                        Tolak
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">
                Tidak ada undangan yang menunggu.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}