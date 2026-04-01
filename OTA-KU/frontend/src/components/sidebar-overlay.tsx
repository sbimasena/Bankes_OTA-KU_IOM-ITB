import { cn } from "@/lib/utils";

const SidebarOverlay = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => (
  <div
    className={cn(
      "fixed inset-0 z-30 bg-black/20 backdrop-blur-xs transition-all duration-300 lg:hidden",
      isOpen ? "opacity-100" : "pointer-events-none opacity-0"
    )}
    style={{ top: "70px" }}
    onClick={onClose}
  />
);

export default SidebarOverlay;