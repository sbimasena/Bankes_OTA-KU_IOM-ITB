import { MahasiswaSayaDetailResponse } from "@/api/generated";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { censorNim } from "@/lib/nim";
import { Calendar, Mail, Phone } from "lucide-react";
import React from "react";

const DetailCardsMahasiswaAsuh: React.FC<MahasiswaSayaDetailResponse> = ({
  email,
  phoneNumber,
  name,
  nim,
  major,
  faculty,
  cityOfOrigin,
  highschoolAlumni,
  gpa,
  gender,
  religion,
  createdAt,
}) => {
  return (
    <div className="grid gap-6 md:grid-cols-[300px_1fr]">
      <Card className="mx-auto w-full md:max-w-sm">
        <CardHeader className="flex flex-col items-center justify-center pt-6 pb-4">
          <div className="mb-4 h-24 w-24 overflow-hidden rounded-full bg-gray-100">
            <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-gray-400">
              {name.charAt(0)}
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-lg font-bold xl:text-xl">{name}</h2>
            <p className="text-muted-foreground">Mahasiswa Asuh</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-primary space-y-3 text-sm xl:text-base">
            <div className="flex items-center space-x-3">
              {/* Di sensor karena ota ga bole tau nim mahasiswa, tapi cuman di handle di FE */}
              <Mail className="text-muted-foreground h-5 w-5" />
                <a target="_blank" className="text-sm">
                {email.replace(
                  /^(\d+)(\d{3})(@mahasiswa\.itb\.ac\.id)$/,
                  (_match, p1, _p2, p3) => `${p1}XXX${p3}`
                )}
                </a>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="text-muted-foreground h-5 w-5" />
              <a
                href={`https://wa.me/${phoneNumber}`}
                target="_blank"
                className="text-sm"
              >
                +{phoneNumber}
              </a>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="text-muted-foreground h-5 w-5" />
              <span className="text-sm">
                Terdaftar sejak{" "}
                {new Date(createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="text-primary w-full">
        <div className="space-y-3 p-4">
          <h3 className="mb-8 text-lg font-bold xl:text-xl">Data Diri</h3>
          <div className="xl:text-md space-y-2">
            <div className="flex items-center space-x-3">
              <span className="font-semibold">NIM:</span>
              <span>{censorNim(nim)}</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="font-semibold">Jurusan:</span>
              <span>{major}</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="font-semibold">Fakultas:</span>
              <span>{faculty}</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="font-semibold">Asal Daerah:</span>
              <span>{cityOfOrigin}</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="font-semibold">Alumni SMA:</span>
              <span>{highschoolAlumni}</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="font-semibold">Agama:</span>
              <span>{religion}</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="font-semibold">Jenis Kelamin:</span>
              <span>{gender}</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="font-semibold">IPK:</span>
              <span>{gpa}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DetailCardsMahasiswaAsuh;
