import { MAListElementStatus } from "@/api/generated";
import { Button } from "@/components/ui/button";
import { censorNim } from "@/lib/nim";
import { Link } from "@tanstack/react-router";
import { Mars, Venus } from "lucide-react";

interface MahasiswaCardProps {
  mahasiswa: MAListElementStatus;
}

function MahasiswaCard({ mahasiswa }: MahasiswaCardProps) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-md">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">{mahasiswa.name}</h2>
        {mahasiswa.gender === "M" ? (
          <Mars className="text-blue-300" />
        ) : (
          <Venus className="text-pink-300" />
        )}
      </div>

      <p className="text-sm text-gray-600">
        {mahasiswa.faculty} - {mahasiswa.major} ({censorNim(mahasiswa.nim)})
      </p>
      <p className="text-sm text-gray-600">Asal {mahasiswa.cityOfOrigin}</p>
      <p className="text-sm text-gray-600">
        Alumni {mahasiswa.highschoolAlumni}
      </p>
      <p className="text-sm text-gray-600">Agama {mahasiswa.religion}</p>
      <p className="text-sm text-gray-600">IPK {mahasiswa.gpa}</p>

      <div className="mt-4 flex justify-center">
        <Button variant="outline" asChild className="w-full max-w-[200px]">
          <Link
            to="/detail/mahasiswa/$detailId"
            params={{ detailId: mahasiswa.accountId }}
          >
            Lihat Profil
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default MahasiswaCard;
