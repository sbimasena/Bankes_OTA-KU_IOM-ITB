"use client";

import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";

interface ExportData {
  summary: {
    totalDana: number;
    totalMahasiswa: number;
    totalOta: number;
    totalConnections: number;
    totalPayment: number;
    activeConnections: number;
    inactiveConnections: number;
  };
  status: {
    connection: {
      active: number;
      inactive: number;
    };
    mahasiswa: {
      active: number;
      inactive: number;
    };
    transaction: {
      paid: number;
      unpaid: number;
      pending: number;
    };
  };
  trends: {
    registration: Array<{ month: string; count: number }>;
    payment: Array<{ month: string; count: number; totalAmount: number }>;
  };
  topStudents: Array<{
    userId: string;
    nim: string;
    name: string;
  }>;
}

interface ExportButtonProps {
  data: ExportData;
}

export default function ExportButton({ data }: ExportButtonProps) {
  const handleExport = async () => {
    try {
      const XLSX = await import("xlsx");
      // Create a new workbook
      const wb = XLSX.utils.book_new();

      // 1. Summary Sheet
      const summaryData = [
        ["RINGKASAN STATISTIK BANTUAN KESEJAHTERAAN"],
        [""],
        ["Metrik", "Nilai"],
        ["Total Dana Bantuan", `Rp ${data.summary.totalDana.toLocaleString("id-ID")}`],
        ["Total Mahasiswa", data.summary.totalMahasiswa],
        ["Total OTA (Orang Tua Asuh)", data.summary.totalOta],
        ["Total Koneksi", data.summary.totalConnections],
        ["Koneksi Aktif", data.summary.activeConnections],
        ["Koneksi Tidak Aktif", data.summary.inactiveConnections],
        ["Total Pembayaran Terverifikasi", `Rp ${data.summary.totalPayment.toLocaleString("id-ID")}`],
      ];
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      summarySheet["!cols"] = [{ wch: 35 }, { wch: 25 }];
      XLSX.utils.book_append_sheet(wb, summarySheet, "Ringkasan");

      // 2. Status Sheet
      const statusData = [
        ["STATUS BREAKDOWN"],
        [""],
        ["Kategori", "Aktif/Sudah Bayar", "Tidak Aktif/Belum Bayar", "Pending"],
        ["Koneksi", data.status.connection.active, data.status.connection.inactive, "-"],
        ["Mahasiswa", data.status.mahasiswa.active, data.status.mahasiswa.inactive, "-"],
        ["Pembayaran", data.status.transaction.paid, data.status.transaction.unpaid, data.status.transaction.pending],
      ];
      const statusSheet = XLSX.utils.aoa_to_sheet(statusData);
      statusSheet["!cols"] = [{ wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, statusSheet, "Status");

      // 3. Trend Pendaftaran Sheet
      const registrationData = [
        ["TREND PENDAFTARAN MAHASISWA"],
        [""],
        ["Bulan", "Jumlah Pendaftar"],
        ...data.trends.registration.map((item) => [item.month, item.count]),
      ];
      const registrationSheet = XLSX.utils.aoa_to_sheet(registrationData);
      registrationSheet["!cols"] = [{ wch: 20 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, registrationSheet, "Trend Pendaftaran");

      // 4. Trend Pembayaran Sheet
      const paymentData = [
        ["TREND PEMBAYARAN"],
        [""],
        ["Bulan", "Jumlah Transaksi", "Total Pembayaran"],
        ...data.trends.payment.map((item) => [
          item.month,
          item.count,
          `Rp ${item.totalAmount.toLocaleString("id-ID")}`,
        ]),
      ];
      const paymentSheet = XLSX.utils.aoa_to_sheet(paymentData);
      paymentSheet["!cols"] = [{ wch: 20 }, { wch: 20 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, paymentSheet, "Trend Pembayaran");

      // 5. Top Students Sheet
      const topStudentsData = [
        ["TOP 5 MAHASISWA DENGAN KONEKSI AKTIF"],
        [""],
        ["No", "NIM", "Nama"],
        ...data.topStudents.map((student, index) => [index + 1, student.nim, student.name]),
      ];
      const topStudentsSheet = XLSX.utils.aoa_to_sheet(topStudentsData);
      topStudentsSheet["!cols"] = [{ wch: 10 }, { wch: 15 }, { wch: 30 }];
      XLSX.utils.book_append_sheet(wb, topStudentsSheet, "Top Mahasiswa");

      // Generate filename with current date
      const now = new Date();
      const filename = `Laporan_Bantuan_Kesejahteraan_${now.toISOString().split("T")[0]}.xlsx`;

      // Save the file
      XLSX.writeFile(wb, filename);
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Gagal mengekspor laporan. Silakan coba lagi.");
    }
  };

  return (
    <Button
      onClick={handleExport}
      className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
    >
      <FileDown className="h-4 w-4" />
      Export Laporan
    </Button>
  );
}
