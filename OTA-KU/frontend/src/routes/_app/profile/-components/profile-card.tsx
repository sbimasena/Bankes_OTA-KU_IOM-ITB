import { Button } from "@/components/ui/button";
import { Calendar, Mail, Phone } from "lucide-react";

interface ProfileCardProps {
  name: string;
  role: string;
  email: string;
  phone: string;
  joinDate: string;
  dueNextUpdateAt?: string;
  applicationStatus?:
    | "accepted"
    | "rejected"
    | "pending"
    | "unregistered"
    | "reapply"
    | "outdated";
  status: boolean;
  daysRemaining: number;
  onEnableEdit?: () => void;
  isEditingEnabled?: boolean;
}

function ProfileCard({
  name,
  role,
  email,
  phone,
  joinDate,
  dueNextUpdateAt,
  applicationStatus,
  status,
  daysRemaining,
  onEnableEdit,
  isEditingEnabled = false,
}: ProfileCardProps) {
  const contactNumber = "+62 856-2465-4990";

  // Format join date to show only Month Year
  const formatJoinDate = (dateString: string): string => {
    if (!dateString || dateString === "-") return "-";

    try {
      const date = new Date(dateString);

      // Format to Month Year (e.g., "Mei 2025")
      return date.toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
      });
    } catch (e) {
      console.error("Invalid date format:", e);
      return dateString;
    }
  };

  // Get status message based on application status
  const getStatusMessage = () => {
    if (!applicationStatus) return null;

    switch (applicationStatus) {
      case "rejected":
        return (
          <p className="text-sm font-medium text-red-600">
            Pengajuan perpanjangan masa asuh Anda tidak dapat disetujui. Info
            lebih lanjut: {contactNumber}.
          </p>
        );

      case "reapply":
        return (
          <p className="text-sm font-medium text-amber-600">
            Perpanjangan masa asuh Anda berhasil diajukan. Jika dalam 7 hari
            belum ada informasi lanjutan, hubungi: {contactNumber}.
          </p>
        );

      case "accepted":
        if (daysRemaining > 30) {
          return (
            <p className="text-sm font-medium text-green-600">
              Masa asuh anda aktif hingga{" "}
              {new Date(dueNextUpdateAt || "").toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
              .
            </p>
          );
        }
        return null; // For accepted with < 30 days, we show the renewal warning instead

      default:
        return null;
    }
  };

  const formattedJoinDate = formatJoinDate(joinDate);

  const handleEnableEdit = () => {
    if (onEnableEdit) {
      onEnableEdit();
    }
  };

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="flex flex-col items-center">
        <div className="h-20 w-20 overflow-hidden rounded-full bg-gray-100">
          {/* Profile image or initials can go here */}
          <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-gray-400">
            {name.charAt(0)}
          </div>
        </div>

        <div className="mt-4 text-center">
          <h2 className="text-xl font-bold">{name}</h2>
          <p className="text-sm text-gray-500">{role}</p>
        </div>
      </div>

      <div className="text-primary mt-6 space-y-4">
        <div className="flex items-center gap-3">
          <Mail className="h-5 w-5" />
          <span className="text-sm">{email}</span>
        </div>

        <div className="flex items-center gap-3">
          <Phone className="h-5 w-5" />
          <span className="text-sm">{phone}</span>
        </div>

        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5" />
          <span className="text-sm">Bergabung di {formattedJoinDate}</span>
        </div>
      </div>

      {/* Status Messages */}
      <div className="mt-6">
        {/* Status-based message */}
        {getStatusMessage()}

        {/* Renewal Warning - only shown for accepted status with less than 30 days */}
        {status && daysRemaining < 30 && (
          <>
            <p className="text-sm font-medium text-red-600">
              Masa asuh Anda akan berakhir dalam {daysRemaining} hari
            </p>

            <div className="mt-3">
              {!isEditingEnabled && (
                <Button
                  className="bg-primary w-full"
                  onClick={handleEnableEdit}
                >
                  Perpanjang Masa Asuh
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ProfileCard;
