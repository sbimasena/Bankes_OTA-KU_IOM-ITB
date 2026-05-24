import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/authOptions";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/dashboard/iom-welfare/export
 * 
 * Export data bantuan kesejahteraan ke CSV format
 * Query params:
 *   - format: 'csv' | 'json' (default: 'csv')
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.error("Export: Unauthorized - no session");
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Hanya Pengurus_IOM atau Admin yang bisa akses
    if (session.user.role !== "Pengurus_IOM" && session.user.role !== "Admin") {
      console.error("Export: Forbidden - invalid role", session.user.role);
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const format = url.searchParams.get("format") || "csv";

    // Dapatkan periode saat ini
    const currentPeriod = await prisma.period.findFirst({
      where: {
        isCurrent: true,
      },
    });

    if (!currentPeriod) {
      console.error("Export: No active period found");
      return NextResponse.json(
        { success: false, error: "No active period found" },
        { status: 400 }
      );
    }

    // Get all data untuk export
    let allStatus = [];
    let transactions = [];

    try {
      allStatus = await prisma.bankesStatus.findMany({
        where: {
          periodId: currentPeriod.id,
        },
        include: {
          MahasiswaProfile: {
            include: {
              User: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: {
          MahasiswaProfile: {
            nim: "asc",
          },
        },
      });

      // Get transaction data
      transactions = await prisma.transaction.findMany({
        select: {
          mahasiswaId: true,
          bill: true,
          amountPaid: true,
          transactionStatus: true,
          paidAt: true,
        },
      });
    } catch (dbError) {
      console.error("Export: Database error", dbError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch data from database" },
        { status: 500 }
      );
    }

    if (allStatus.length === 0) {
      console.warn("Export: No data found for period", currentPeriod.id);
    }

    // Map data untuk export
    const exportData = allStatus.map((status) => {
      const studentTransactions = transactions.filter(
        (t) => t.mahasiswaId === status.userId
      );
      const totalPaid = studentTransactions.reduce(
        (sum, t) => sum + t.amountPaid,
        0
      );
      const totalBill = studentTransactions.reduce((sum, t) => sum + t.bill, 0);

      return {
        NIM: status.MahasiswaProfile?.nim || "-",
        Nama: status.MahasiswaProfile?.User?.name || "-",
        Email: status.MahasiswaProfile?.User?.email || "-",
        "Lulus Ditmawa": status.passDitmawa ? "Ya" : "Tidak",
        "Lulus IOM": status.passIOM ? "Ya" : "Tidak",
        "Lulus Interview": status.passInterview ? "Ya" : "Tidak",
        "Dana Alokasi": status.amount || 0,
        "Total Tagihan": totalBill,
        "Total Terbayar": totalPaid,
        "Status Pembayaran": status.amount
          ? totalPaid >= totalBill
            ? "Lunas"
            : "Menunggu Pembayaran"
          : "-",
      };
    });

    if (format === "json") {
      return NextResponse.json(
        {
          success: true,
          data: {
            period: currentPeriod.period,
            exportedAt: new Date().toISOString(),
            totalRecords: exportData.length,
            records: exportData,
          },
        },
        { status: 200 }
      );
    }

    // Generate CSV
    if (exportData.length === 0) {
      console.warn("Export: No data to export, returning empty JSON");
      // Return JSON with empty data
      return NextResponse.json(
        {
          success: true,
          data: {
            period: currentPeriod.period,
            exportedAt: new Date().toISOString(),
            totalRecords: 0,
            records: [],
          },
        },
        { status: 200 }
      );
    }

    try {
      console.log("Export: Starting CSV generation with", exportData.length, "records");
      
      const csvHeader = Object.keys(exportData[0]).join(",");
      console.log("Export: CSV header created:", csvHeader);
      
      const csvRows = exportData
        .map((row) =>
          Object.values(row)
            .map((val) => {
              const strVal = String(val || "");
              // Escape quotes dan wrap dengan tanda kutip jika ada koma
              if (strVal.includes(",") || strVal.includes('"')) {
                return `"${strVal.replace(/"/g, '""')}"`;
              }
              return strVal;
            })
            .join(",")
        )
        .join("\n");

      const csv = `${csvHeader}\n${csvRows}`;
      console.log("Export: CSV generated successfully, size:", csv.length);

      // Sanitize filename - remove invalid characters
      const sanitizedPeriod = currentPeriod.period
        .replace(/[<>:"|?*\/\\]/g, "-") // Remove illegal characters
        .replace(/\s+/g, "_") // Replace spaces with underscore
        .substring(0, 50); // Limit length
      
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `Rekapan_Bantuan_${sanitizedPeriod}_${timestamp}.csv`;
      console.log("Export: Filename created:", filename);

      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv;charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    } catch (csvError) {
      console.error("Export: CSV generation detailed error:", {
        error: csvError instanceof Error ? csvError.message : String(csvError),
        stack: csvError instanceof Error ? csvError.stack : undefined,
        dataLength: exportData.length,
        firstRecord: exportData[0],
      });
      
      // Fallback: return data as JSON if CSV fails
      console.warn("Export: CSV generation failed, falling back to JSON format");
      return NextResponse.json(
        {
          success: true,
          data: {
            period: currentPeriod.period,
            exportedAt: new Date().toISOString(),
            totalRecords: exportData.length,
            records: exportData,
          },
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Dashboard Export Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to export data" },
      { status: 500 }
    );
  }
}
