"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TopStudent {
  userId: string;
  nim: string;
  name: string;
}

interface TopStudentsProps {
  students: TopStudent[];
}

export default function TopStudents({ students }: TopStudentsProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        Top 5 Mahasiswa dengan Koneksi Aktif
      </h3>
      {students.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  No
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  NIM
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Nama
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={student.userId} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-700">{index + 1}</td>
                  <td className="py-3 px-4 text-gray-700 font-mono">
                    {student.nim}
                  </td>
                  <td className="py-3 px-4 text-gray-900">{student.name}</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-green-100 text-green-800">
                      Aktif
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex items-center justify-center h-48 text-gray-500">
          Tidak ada data mahasiswa
        </div>
      )}
    </Card>
  );
}
