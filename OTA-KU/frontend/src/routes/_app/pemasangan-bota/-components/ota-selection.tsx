import { api } from "@/api/client";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, CircleCheck } from "lucide-react";
import { useEffect, useState } from "react";

import DetailDialogOta from "./detail-dialog-ota";
import { OTA, OTAPopover } from "./ota-popover";

export function OTASelection({
  onSelectOTA,
}: {
  onSelectOTA: (ota: OTA | null) => void;
}) {
  const [selectedOTA, setSelectedOTA] = useState<OTA | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);

  const { data: availableOTAs, isLoading } = useQuery({
    queryKey: ["listAvailableOta"],
    queryFn: () => api.list.listAvailableOta({ page: 1 }),
  });

  const hasAvailableOTAs =
    Array.isArray(availableOTAs?.body.data) &&
    availableOTAs?.body.data.length > 0;

  const { data: otaDetails, refetch: fetchOTADetails } = useQuery({
    queryKey: ["otaDetails", selectedOTA?.accountId],
    queryFn: () =>
      api.detail.getOtaDetail({ id: selectedOTA?.accountId || "" }),
    enabled: false, // Disable automatic fetching
  });

  useEffect(() => {
    if (selectedOTA) {
      fetchOTADetails();
    }
  }, [selectedOTA, fetchOTADetails]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleSelectOTA = (ota: OTA) => {
    setSelectedOTA(ota);
    onSelectOTA(ota);
    setIsComboboxOpen(false);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {/* State 1: No OTA selected */}
      {!selectedOTA && hasAvailableOTAs && (
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex w-full items-center justify-between gap-1">
            <h3 className="text-dark w-full max-w-[900px] min-w-[200px] text-lg font-bold">
              Pilih OTA yang akan dipasangkan dengan mahasiswa asuh
            </h3>
            <div className="w-full max-w-[200px]">
              <OTAPopover
                isComboboxOpen={isComboboxOpen}
                setIsComboboxOpen={setIsComboboxOpen}
                onSelectOTA={handleSelectOTA}
                buttonVariant="default"
                buttonText="Pilih"
              />
            </div>
          </div>
        </div>
      )}

      {/* State 2: OTA selected and not expanded */}
      {selectedOTA && !isExpanded && (
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">
                Informasi Orang Tua Asuh
              </p>
              <h3 className="text-dark w-full max-w-[600px] min-w-[200px] text-[18px] font-bold">
                {selectedOTA.name}
              </h3>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="border-dark rounded-full"
              onClick={toggleExpanded}
            >
              <ChevronDown className="text-dark" />
            </Button>
          </div>
        </div>
      )}

      {/* State 3: OTA selected and expanded */}
      {selectedOTA && isExpanded && (
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">
                Informasi Orang Tua Asuh
              </p>
              <h3 className="text-dark w-full max-w-[600px] min-w-[200px] text-[18px] font-bold">
                {selectedOTA.name}
              </h3>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="border-dark rounded-full"
              onClick={toggleExpanded}
            >
              <ChevronUp className="text-dark" />
            </Button>
          </div>

          <div className="mb-4 space-y-2">
            <div>
              <p className="text-muted-foreground text-sm">
                Kesanggupan sumbangan:
              </p>
              <p className="text-dark font-bold">
                {otaDetails?.body.funds || "-"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">
                Max. mahasiswa asuh:
              </p>
              <p className="text-dark font-bold">
                {otaDetails?.body.maxCapacity || "-"}
              </p>
            </div>
            {/* TODO: currentConnection data display how much connection this OTA have */}
            {/* <div>
              <p className="text-sm text-muted-foreground">Mahasiswa asuh yang sedang dibantu:</p>
              <p className="font-bold text-dark">
                {otaDetails?.body.currentConnection || "-"}
              </p>
            </div> */}
            <div>
              <p className="text-muted-foreground text-sm">
                Kriteria calon mahasiswa asuh:
              </p>
              <p className="text-dark line-clamp-2">
                {otaDetails?.body.criteria || "-"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <OTAPopover
              isComboboxOpen={isComboboxOpen}
              setIsComboboxOpen={setIsComboboxOpen}
              onSelectOTA={handleSelectOTA}
              buttonVariant="outline"
              buttonText="Ganti OTA"
            />
            <DetailDialogOta id={selectedOTA.accountId} />
          </div>
        </div>
      )}

      {/* State 4: No available OTAs */}
      {!hasAvailableOTAs && (
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-dark w-full max-w-[900px] min-w-[200px] text-[18px] font-bold">
              Tidak ada OTA yang perlu dipasangkan dengan mahasiswa asuh
            </h3>
            <CircleCheck className="text-succeed h-6 w-6" />
          </div>
        </div>
      )}
    </div>
  );
}
