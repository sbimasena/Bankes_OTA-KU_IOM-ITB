"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ExportButton() {
  const [loading, setLoading] = useState(false);
  const [format, setFormat] = useState<"csv" | "json">("csv");

  const handleExport = async () => {
    try {
      setLoading(true);
      const url = `/api/dashboard/iom-welfare/export?format=${format}`;
      console.log("Exporting to:", url, "Format:", format);

      const response = await fetch(url);
      console.log("Export response status:", response.status);

      if (!response.ok) {
        // Try to parse error as JSON first
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          console.error("Export API Error Response:", errorData);
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If not JSON, try to read as text
          const errorText = await response.text();
          console.error("Export API Error Text:", errorText);
          if (errorText) errorMessage = errorText;
        }
        throw new Error(`Export failed: ${errorMessage}`);
      }

      // Check content type to determine how to parse response
      const contentType = response.headers.get("content-type") || "";
      console.log("Response content-type:", contentType);

      if (format === "csv") {
        // For CSV, always read as blob
        const blob = await response.blob();
        if (blob.size === 0) {
          throw new Error("No data to export");
        }

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download =
          response.headers
            .get("content-disposition")
            ?.split("filename=")[1]
            ?.replace(/"/g, "") || "rekapan_bantuan.csv";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Data berhasil diexport!");
      } else {
        // For JSON
        const data = await response.json();
        if (!data.success) {
          throw new Error(data.error || "JSON export failed");
        }

        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `rekapan_bantuan_${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Data berhasil diexport!");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Gagal mengexport data";
      console.error("Export error:", errorMessage);
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={format}
        onChange={(e) => setFormat(e.target.value as "csv" | "json")}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={loading}
      >
        <option value="csv">CSV</option>
        <option value="json">JSON</option>
      </select>
      <Button
        onClick={handleExport}
        disabled={loading}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            Export Report
          </>
        )}
      </Button>
    </div>
  );
}
