import { api } from "@/api/client";
import type { ListTerminateForAdmin } from "@/api/generated";
import { ClientPagination } from "@/components/client-pagination";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

import CatatanMahasiswaModal from "./catatan-modal-mahasiswa";
import CatatanOrangTuaModal from "./catatan-modal-orangtua";
import TerminasiModal from "./terminasi-modal";
import TerminasiTable from "./terminasi-table";

export default function TerminasiPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOption, setModalOption] = useState<"accept" | "reject">("accept");

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] =
    useState<ListTerminateForAdmin | null>(null);

  // Modal Statess
  const [isOtaNotesModalOpen, setIsOtaNotesModalOpen] = useState(false);
  const [isMaNotesModalOpen, setIsMaNotesModalOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState("");

  const queryClient = useQueryClient();
  const perPage = 6;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  // Fetch data with pagination and search
  const { data, isLoading, isSuccess, refetch } = useQuery({
    queryKey: ["ListTerminasi", currentPage, debouncedSearch],
    queryFn: () =>
      api.terminate.listTerminateForAdmin({
        page: currentPage,
        q: debouncedSearch,
      }),
  });

  const terminasiData = data?.body?.data || [];

  // Terminasi Handler
  const handleTerminasi = (item: ListTerminateForAdmin) => {
    setModalOption("accept");
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleBatalTerminasi = (item: ListTerminateForAdmin) => {
    setModalOption("reject");
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  // Modal Handler
  const handleViewOtaNotes = (item: ListTerminateForAdmin) => {
    setSelectedItem(item);
    setCurrentNote(item.requestTerminationNoteOTA);
    setIsOtaNotesModalOpen(true);
  };

  const handleViewMaNotes = (item: ListTerminateForAdmin) => {
    setSelectedItem(item);
    setCurrentNote(item.requestTerminationNoteMA);
    setIsMaNotesModalOpen(true);
  };

  const confirmTerminasi = async () => {
    if (!selectedItem) return;

    await queryClient.invalidateQueries({ queryKey: ["ListTerminasi"] });
    await refetch();

    setIsModalOpen(false);
    setSelectedItem(null);
  };

  // Close Handler
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const closeOtaNotesModal = () => {
    setIsOtaNotesModalOpen(false);
  };

  const closeMaNotesModal = () => {
    setIsMaNotesModalOpen(false);
  };

  if (isLoading && !data) {
    return (
      <div className="space-y-4">
        <div className="mb-6 flex items-center space-x-4">
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative mb-6 w-full">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <Input
          type="text"
          placeholder="Cari OTA atau mahasiswa..."
          className="w-full pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="rounded-lg border bg-white shadow-sm">
        <TerminasiTable
          data={terminasiData}
          onTerminasi={handleTerminasi}
          onBatalTerminasi={handleBatalTerminasi}
          onViewOtaNotes={handleViewOtaNotes}
          onViewMaNotes={handleViewMaNotes}
        />
      </div>

      {/* Pagination */}
      {!isSuccess ? (
        <div className="rounded-md bg-white">
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <ClientPagination
          totalPerPage={perPage}
          total={data.body.data.length}
        />
      )}

      {/* Terminasi Modal */}
      {isModalOpen && selectedItem && (
        <TerminasiModal
          mode={modalOption}
          isOpen={isModalOpen}
          onClose={closeModal}
          onConfirm={confirmTerminasi}
          item={selectedItem}
        />
      )}

      {/* OTA Notes Modal */}
      {isOtaNotesModalOpen && selectedItem && (
        <CatatanOrangTuaModal
          isOpen={isOtaNotesModalOpen}
          onClose={closeOtaNotesModal}
          item={selectedItem}
          note={currentNote}
        />
      )}

      {/* Mahasiswa Notes Modal */}
      {isMaNotesModalOpen && selectedItem && (
        <CatatanMahasiswaModal
          isOpen={isMaNotesModalOpen}
          onClose={closeMaNotesModal}
          item={selectedItem}
          note={currentNote}
        />
      )}
    </div>
  );
}
