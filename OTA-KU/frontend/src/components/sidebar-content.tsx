import { UserSchema } from "@/api/generated";
import SidebarMenuItem from "@/components/sidebar-menu-item";
import SidebarUserInfo from "@/components/sidebar-user-info";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  textColorClass?: string;
  bgColorClass?: string;
}

const SidebarContent = ({
  isOpen,
  onClose,
  menuItems,
  activeItem,
  userData,
}: {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  activeItem: string;
  userData: UserSchema | undefined;
}) => (
  <div
    className={cn(
      "fixed top-0 -left-4 z-40 mt-[82px] mb-3 flex h-[calc(100vh-24px-70px)] w-[243px] flex-col justify-between rounded-r-[12px] bg-white px-5 py-6 shadow-[0_0_4px_rgba(0,0,0,0.4)] transition-transform duration-300 ease-in-out lg:mt-27 lg:ml-3 lg:h-[calc(100vh-24px-96px)] lg:rounded-l-[12px]",
      isOpen ? "translate-x-4" : "-translate-x-full",
    )}
    data-sidebar="true"
  >
    <button
      className="text-dark absolute top-4 right-4 cursor-pointer"
      onClick={onClose}
      aria-label="Close sidebar"
    >
      <X size={24} className="transition-all hover:scale-125" />
    </button>

    <div className="flex flex-col gap-5">
      <h4 className="text-dark text-sm font-medium">UTAMA</h4>
      <div className="flex flex-col gap-3">
        {menuItems.map((item) => (
          <SidebarMenuItem
            key={item.id}
            item={item}
            isActive={activeItem === item.id}
          />
        ))}
      </div>
      <div className="h-[1.5px] w-full rounded-full bg-gray-300"></div>
    </div>

    <SidebarUserInfo userData={userData} />
  </div>
);

export default SidebarContent;
