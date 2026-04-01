import { Button } from "@/components/ui/button";
import { Fakultas, Jurusan, faculties, majors } from "@/lib/nim";
import { FilterX } from "lucide-react";

import { ComboboxFilter } from "./combobox-filter";

interface FilterProps {
  activeFilterCount: number;
  resetFilters: () => void;
  faculty: Fakultas | undefined;
  setFaculty: (faculty: Fakultas | undefined) => void;
  major: Jurusan | undefined;
  setMajor: (major: Jurusan | undefined) => void;
  gender: "M" | "F" | undefined;
  setGender: (gender: "M" | "F" | undefined) => void;
  religion:
    | "Islam"
    | "Kristen Protestan"
    | "Hindu"
    | "Buddha"
    | "Katolik"
    | "Konghucu"
    | undefined;
  setReligion: (
    religion:
      | "Islam"
      | "Kristen Protestan"
      | "Hindu"
      | "Buddha"
      | "Katolik"
      | "Konghucu"
      | undefined,
  ) => void;
}

const genders = [
  { value: "M", label: "Laki-Laki" },
  { value: "F", label: "Perempuan" },
];

const religions = [
  { value: "Islam", label: "Islam" },
  { value: "Kristen Protestan", label: "Kristen Protestan" },
  { value: "Hindu", label: "Hindu" },
  { value: "Buddha", label: "Buddha" },
  { value: "Katolik", label: "Katolik" },
  { value: "Konghucu", label: "Konghucu" },
];

function Filter({
  activeFilterCount,
  resetFilters,
  faculty,
  setFaculty,
  major,
  setMajor,
  gender,
  setGender,
  religion,
  setReligion,
}: FilterProps) {
  return (
    <div className="rounded-md border bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium">Filter Mahasiswa</h3>
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="flex h-8 items-center gap-1 text-sm"
            >
              <FilterX className="h-4 w-4" />
              Reset Filter
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Fakultas</label>
            <ComboboxFilter
              options={faculties}
              value={faculty as string}
              onChange={setFaculty as (faculty: string | undefined) => void}
              placeholder="Pilih Fakultas"
              emptyMessage="Tidak ada fakultas yang ditemukan."
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Jurusan</label>
            <ComboboxFilter
              options={majors}
              value={major as string}
              onChange={setMajor as (major: string | undefined) => void}
              placeholder="Pilih Jurusan"
              emptyMessage="Tidak ada jurusan yang ditemukan."
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Jenis Kelamin</label>
            <ComboboxFilter
              options={genders}
              value={gender as string}
              onChange={setGender as (gender: string | undefined) => void}
              placeholder="Pilih Jenis Kelamin"
              emptyMessage="Tidak ada jenis kelamin yang ditemukan."
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Agama</label>
            <ComboboxFilter
              options={religions}
              value={religion as string}
              onChange={setReligion as (religion: string | undefined) => void}
              placeholder="Pilih Agama"
              emptyMessage="Tidak ada agama yang ditemukan."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Filter;
