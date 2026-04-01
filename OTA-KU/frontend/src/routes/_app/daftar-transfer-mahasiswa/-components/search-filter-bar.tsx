import { SearchInput } from "@/components/search-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  yearFilter: string;
  onYearChange: (value: string) => void;
  monthFilter: string;
  onMonthChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
}

export function SearchFilterBar({
  searchQuery,
  onSearchChange,
  yearFilter,
  onYearChange,
  monthFilter,
  onMonthChange,
  statusFilter,
  onStatusChange,
}: SearchFilterBarProps) {
  // TODO: Belum tentu 5 tahun ke belakang, tahunnya akan di fetch lewat API
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const months = [
    { value: "January", label: "Januari" },
    { value: "February", label: "Februari" },
    { value: "March", label: "Maret" },
    { value: "April", label: "April" },
    { value: "May", label: "Mei" },
    { value: "June", label: "Juni" },
    { value: "July", label: "Juli" },
    { value: "August", label: "Agustus" },
    { value: "September", label: "September" },
    { value: "October", label: "Oktober" },
    { value: "November", label: "November" },
    { value: "December", label: "Desember" },
  ] as const;

  // Status options
  const statusOptions = [
    { value: "all", label: "Semua Status" },
    { value: "paid", label: "Telah Dibayar" },
    { value: "unpaid", label: "Belum Dibayar" },
    { value: "pending", label: "Menunggu Verifikasi" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-5 md:gap-6">
      <div className="md:col-span-2">
        <SearchInput
          placeholder="Cari nama orang tua atau mahasiswa"
          value={searchQuery}
          setSearch={onSearchChange}
        />
      </div>

      <Select value={yearFilter} onValueChange={onYearChange}>
        <SelectTrigger className="w-full bg-white">
          <SelectValue placeholder="Tahun" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Tahun</SelectItem>
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={monthFilter} onValueChange={onMonthChange}>
        <SelectTrigger className="w-full bg-white">
          <SelectValue placeholder="Bulan" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Bulan</SelectItem>
          {months.map((month) => (
            <SelectItem key={month.value} value={month.value}>
              {month.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full bg-white">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((status) => (
            <SelectItem key={status.value} value={status.value}>
              {status.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
