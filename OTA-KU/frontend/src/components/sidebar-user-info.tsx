import { UserSchema } from "@/api/generated";

const SidebarUserInfo = ({
  userData,
}: {
  userData: UserSchema | undefined;
}) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center gap-5">
      <img
        src="/icon/Type=profile-icon.svg"
        alt="user avatar"
        className="h-8 w-8 rounded-full"
      />
      <div className="flex max-w-[160px] flex-col gap-1">
        <span className="text-dark line-clamp-2 text-sm font-bold">
          {userData?.name || userData?.email.split("@")[0]}
        </span>
        <span className="text-dark line-clamp-2 text-xs font-normal break-words opacity-80">
          {userData?.email}
        </span>
        {userData?.type && (
          <span className="text-xs text-gray-500 italic">
            {getUserRoleLabel(userData.type)}
          </span>
        )}
      </div>
    </div>
  </div>
);

const getUserRoleLabel = (role: string): string => {
  switch (role) {
    case "mahasiswa":
      return "Mahasiswa";
    case "ota":
      return "Orang Tua Asuh";
    case "admin":
      return "Admin";
    default:
      return "";
  }
};

export default SidebarUserInfo;
