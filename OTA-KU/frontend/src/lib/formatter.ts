export function formatRole(role: string): string {
  switch (role) {
    case "mahasiswa":
      return "Mahasiswa";
    case "ota":
      return "Orang Tua Asuh";
    case "admin":
      return "Admin";
    case "bankes":
      return "Bantuan Kesejahteraan";
    case "pengurus":
      return "Pengurus";
    default:
      return role;
  }
}

export function formatPhoneNumber(phoneNumber: string): string {
  return `+${phoneNumber}`;
}

export function formatApplicationStatus(status: string): string {
  switch (status) {
    case "accepted":
      return "Terverifikasi";
    case "pending":
      return "Tertunda";
    case "rejected":
      return "Tertolak";
    case "unregistered":
      return "Belum Terdaftar";
    case "reapply":
      return "Daftar Ulang";
    case "outdated":
      return "Kadaluarsa";
    default:
      return status;
  }
}

export function formatProvieder(provider: string): string {
  switch (provider) {
    case "credentials":
      return "Akun Pribadi";
    case "azure":
      return "Akun ITB";
    default:
      return provider;
  }
}

export function formatMahasiswaStatus(status: string): string {
  switch (status) {
    case "active":
      return "Aktif";
    case "inactive":
      return "Tidak Aktif";
    default:
      return status;
  }
}

export function formatLinkage(linkage: string): string {
  switch (linkage) {
    case "alumni":
      return "Alumni";
    case "dosen":
      return "Dosen";
    case "otm":
      return "Orang Tua Mahasiswa";
    case "lainnya":
      return "Lainnya";
    case "none":
      return "Tidak Ada";
    default:
      return linkage;
  }
}

export function formatFunding(funding: number): string {
  const formatted = funding.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `Rp ${formatted}`;
}

export function formatStartDate(date: string): string {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString("id-ID", options);
}

export function formatGender(gender: "M" | "F"): string {
  switch (gender) {
    case "M":
      return "Laki-Laki";
    case "F":
      return "Perempuan";
    default:
      return "Tidak Diketahui";
  }
}

export function formatAllowedAdminSelection(
  allowedAdminSelection: boolean,
): string {
  return allowedAdminSelection ? "Bersedia" : "Tidak Bersedia";
}

export function formatSemester(semester: number): string {
  return `${semester} semester`;
}

export function formatValue(
  key: string,
  val: string | number | boolean,
): string {
  switch (key) {
    case "type":
      return formatRole(String(val));
    case "phoneNumber":
      return formatPhoneNumber(String(val));
    case "provider":
      return formatProvieder(String(val));
    case "mahasiswaStatus":
      return formatMahasiswaStatus(String(val));
    case "linkage":
      return formatLinkage(String(val));
    case "funds":
      return formatFunding(Number(val));
    case "startDate":
      return formatStartDate(String(val));
    case "gender":
      return formatGender(String(val) as "M" | "F");
    case "allowedAdminSelection":
      return formatAllowedAdminSelection(Boolean(val));
    case "maxSemester":
      return formatSemester(Number(val));
    default:
      return String(val);
  }
}

export function censorEmail(email: string): string {
  const [localPart, domain] = email.split("@");
  const censoredLocalPart =
    localPart.length > 2
      ? localPart.slice(0, 2) + "*".repeat(localPart.length - 2)
      : localPart;
  return `${censoredLocalPart}@${domain}`;
}
